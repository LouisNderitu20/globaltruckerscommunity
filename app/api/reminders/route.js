import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabaseContent } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function getEmailTransporter() {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, '');
  const host = process.env.SMTP_HOST?.trim();
  const port = parseInt(process.env.SMTP_PORT || '587', 10);

  if (!user || !pass) return null;

  // If user is Gmail or host is smtp.gmail.com, use nodemailer's built-in Gmail service
  if (user.toLowerCase().endsWith('@gmail.com') || host === 'smtp.gmail.com') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
  }

  // Otherwise standard custom SMTP
  if (host) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  return null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, name, convoyId, convoyTitle, convoyTime, action } = body;

    // 0. Handle Admin Broadcast to All Registered Drivers & Accounts
    if (action === 'broadcast') {
      const bTitle = body.title || 'Official GTC Convoy Announcement';
      const bMessage = body.message || 'Convoy meetup is now underway.';
      const providedEmails = Array.isArray(body.targetEmails) ? body.targetEmails : [];

      const recipientSet = new Set(
        providedEmails
          .filter((e) => e && typeof e === 'string' && e.includes('@'))
          .map((e) => e.trim().toLowerCase())
      );

      // Collect from Supabase signups table
      try {
        const { data: signupsTable } = await supabaseContent
          .from('signups')
          .select('email')
          .not('email', 'is', null);

        if (Array.isArray(signupsTable)) {
          signupsTable.forEach((s) => {
            if (s.email && typeof s.email === 'string' && s.email.includes('@')) {
              recipientSet.add(s.email.trim().toLowerCase());
            }
          });
        }
      } catch (e) {
        console.warn('GTC Broadcast: signups table query notice:', e.message);
      }

      // Collect from site_content
      try {
        const { data: row } = await supabaseContent
          .from('site_content')
          .select('data')
          .eq('id', 1)
          .single();

        if (row?.data) {
          if (Array.isArray(row.data.signups)) {
            row.data.signups.forEach((s) => {
              if (s.email && typeof s.email === 'string' && s.email.includes('@')) {
                recipientSet.add(s.email.trim().toLowerCase());
              }
            });
          }
          if (row.data.convoyReminders && typeof row.data.convoyReminders === 'object') {
            Object.values(row.data.convoyReminders).forEach((list) => {
              if (Array.isArray(list)) {
                list.forEach((r) => {
                  if (r.email && typeof r.email === 'string' && r.email.includes('@')) {
                    recipientSet.add(r.email.trim().toLowerCase());
                  }
                });
              }
            });
          }
        }
      } catch (e) {
        console.warn('GTC Broadcast: site_content query notice:', e.message);
      }

      if (body.adminEmail && typeof body.adminEmail === 'string' && body.adminEmail.includes('@')) {
        recipientSet.add(body.adminEmail.trim().toLowerCase());
      }
      if (process.env.SMTP_USER && process.env.SMTP_USER.includes('@')) {
        recipientSet.add(process.env.SMTP_USER.trim().toLowerCase());
      }

      const emailList = Array.from(recipientSet);
      const transporter = getEmailTransporter();
      let sentCount = 0;

      if (transporter && emailList.length > 0) {
        const senderFrom = process.env.SMTP_FROM || `"Global Truckers Community" <${process.env.SMTP_USER}>`;

        await Promise.allSettled(
          emailList.map(async (toEmail) => {
            try {
              await transporter.sendMail({
                from: senderFrom,
                to: toEmail,
                subject: `[GTC Convoy Broadcast] ${bTitle}`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <div style="margin-bottom: 20px;">
                      <h2 style="color: #0f172a; margin: 0;">Global Truckers Community</h2>
                      <span style="display: inline-block; padding: 4px 10px; background: #fef3c7; color: #92400e; font-size: 11px; font-weight: bold; border-radius: 20px; text-transform: uppercase; margin-top: 8px;">
                        Official Community Broadcast
                      </span>
                    </div>
                    <h3 style="color: #0f172a; margin-top: 0;">${bTitle}</h3>
                    <div style="background: #f8fafc; border-left: 4px solid #0284c7; padding: 16px; margin: 20px 0; border-radius: 4px; white-space: pre-wrap; font-size: 15px; color: #334155; line-height: 1.6;">${bMessage}</div>
                    <p style="color: #475569; font-size: 14px;">Please tune in to the Discord voice channel or CB radio channel 19 for real-time dispatch updates.</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">Global Truckers Community (GTC) &bull; Verified Dispatch Telemetry &bull; Nairobi, Kenya &amp; Worldwide</p>
                  </div>
                `
              });
              sentCount++;
            } catch (sendErr) {
              console.error(`Broadcast email failed to ${toEmail}:`, sendErr.message);
            }
          })
        );
      }

      return NextResponse.json({
        success: true,
        broadcastSent: sentCount > 0,
        recipientCount: emailList.length,
        sentCount,
        message: sentCount > 0
          ? `Broadcast sent successfully to ${sentCount} email address${sentCount === 1 ? '' : 'es'}!`
          : `Broadcast notification saved to member accounts.`
      });
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required to receive convoy reminders.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name?.trim() || 'Driver';
    const cId = convoyId || 'upcoming';
    const cTitle = convoyTitle || 'GTC Official Convoy';
    const cTime = convoyTime || 'Departure Soon';

    // 1. Persist to Supabase site_content
    try {
      const { data: row } = await supabaseContent
        .from('site_content')
        .select('data')
        .eq('id', 1)
        .single();

      if (row?.data) {
        const contentData = row.data;
        if (!contentData.convoyReminders || typeof contentData.convoyReminders !== 'object') {
          contentData.convoyReminders = {};
        }

        if (!Array.isArray(contentData.convoyReminders[cId])) {
          contentData.convoyReminders[cId] = [];
        }

        if (action === 'remove') {
          contentData.convoyReminders[cId] = contentData.convoyReminders[cId].filter(
            (r) => r.email?.toLowerCase() !== cleanEmail
          );
        } else {
          const exists = contentData.convoyReminders[cId].some(
            (r) => r.email?.toLowerCase() === cleanEmail
          );
          if (!exists) {
            contentData.convoyReminders[cId].push({
              email: cleanEmail,
              name: cleanName,
              convoyId: cId,
              convoyTitle: cTitle,
              convoyTime: cTime,
              subscribedAt: new Date().toISOString()
            });
          }
        }

        await supabaseContent
          .from('site_content')
          .update({
            data: contentData,
            updated_at: new Date().toISOString()
          })
          .eq('id', 1);
      }
    } catch (dbErr) {
      console.warn('GTC Reminders: Database update notice:', dbErr.message);
    }

    // 2. Dispatch email if transport is configured
    const transporter = getEmailTransporter();
    let emailDispatched = false;

    if (transporter) {
      try {
        const mailOptions = {
          from: process.env.SMTP_FROM || `"Global Truckers Community" <${process.env.SMTP_USER}>`,
          to: cleanEmail,
          subject: action === 'remove'
            ? `Reminder Cancelled: ${cTitle}`
            : `Convoy Departure Reminder: ${cTitle}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
              <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <h2 style="color: #0f172a; margin: 0;">Global Truckers Community</h2>
              </div>
              <p style="color: #334155; font-size: 16px;">Hello <strong>${cleanName}</strong>,</p>
              ${action === 'remove'
                ? `<p style="color: #64748b;">Your departure alert for <strong>${cTitle}</strong> has been cancelled.</p>`
                : `<p style="color: #334155;">This is your confirmed convoy alert for <strong>${cTitle}</strong>.</p>
                   <div style="background: #f8fafc; border-left: 4px solid #0284c7; padding: 16px; margin: 20px 0; border-radius: 4px;">
                     <div style="font-size: 14px; color: #64748b; margin-bottom: 4px;">EVENT TIME</div>
                     <div style="font-size: 18px; font-weight: bold; color: #0f172a;">${cTime}</div>
                   </div>
                   <p style="color: #475569; font-size: 14px;">Please be in the meetup Discord channel / CB radio 15 minutes prior to roll-out with a fueled and repaired truck.</p>
                  `
              }
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">Global Truckers Community (GTC) &bull; Verified Dispatch Telemetry &bull; Nairobi, Kenya & Worldwide</p>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        emailDispatched = true;
      } catch (mailErr) {
        console.error('GTC Reminders: Mail dispatch failed:', mailErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      emailDispatched,
      email: cleanEmail,
      message: `Departure reminder confirmed for ${cleanEmail}!`
    });
  } catch (err) {
    console.error('GTC Reminders API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
