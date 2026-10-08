import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabaseContent } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function getEmailTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }

  return null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, name, convoyId, convoyTitle, convoyTime, action } = body;

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
    } else {
      console.log(`[GTC Reminder Dispatch Queued] To: ${cleanEmail} for Convoy: ${cTitle} (${cTime}). (To send live emails to inboxes, add SMTP_HOST, SMTP_USER, SMTP_PASS to .env.local)`);
    }

    return NextResponse.json({
      success: true,
      emailDispatched,
      email: cleanEmail,
      message: emailDispatched
        ? `Reminder email successfully sent to ${cleanEmail}!`
        : `Reminder registered for ${cleanEmail}! (To deliver live emails to inboxes, configure SMTP credentials in .env.local)`
    });
  } catch (err) {
    console.error('GTC Reminders API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
