import { NextResponse } from 'next/server';
import { supabaseAdmin, supabaseContent } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function getAdminClient() {
  return supabaseAdmin || supabaseContent;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { updates, data, roles, userId, role } = body;

    const client = getAdminClient();

    // 1. Handle Role Updates (single or batch)
    if (updates || userId || role || roles) {
      const roleUpdates = updates
        ? (Array.isArray(updates) ? updates : [updates])
        : [{ userId, role, roles: roles || (role ? [role] : ['driver']) }];

      for (const item of roleUpdates) {
        const targetId = item.userId || item.id;
        const targetRole = item.role || (item.roles && item.roles[0]) || 'driver';
        const targetRoles = Array.isArray(item.roles) ? item.roles : [targetRole];

        if (!targetId) continue;

        // Update in signups table
        try {
          await client
            .from('signups')
            .update({
              role: targetRole,
              roles: targetRoles,
              updated_at: new Date().toISOString()
            })
            .eq('id', targetId);
        } catch (tableErr) {
          console.warn('Publish: signups table update notice:', tableErr.message);
        }

        // Update in site_content signups cache
        try {
          const { data: row } = await client
            .from('site_content')
            .select('data')
            .eq('id', 1)
            .single();

          if (row?.data && Array.isArray(row.data.signups)) {
            const list = row.data.signups.map((s) => {
              if (s.id === targetId) {
                return {
                  ...s,
                  role: targetRole,
                  roles: targetRoles,
                  updated_at: new Date().toISOString()
                };
              }
              return s;
            });

            await client
              .from('site_content')
              .update({
                data: { ...row.data, signups: list },
                updated_at: new Date().toISOString()
              })
              .eq('id', 1);
          }
        } catch (cacheErr) {
          console.warn('Publish: site_content cache notice:', cacheErr.message);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Roles published successfully across database & cache.'
      });
    }

    // 2. Handle Site Content Publishing
    const contentToSave = data || body;
    if (contentToSave && typeof contentToSave === 'object') {
      const rawPayload = contentToSave.data || contentToSave;

      // Read current site_content row to preserve registered drivers & signups
      let existingSignups = [];
      try {
        const { data: row } = await client
          .from('site_content')
          .select('data')
          .eq('id', 1)
          .single();

        if (row?.data && Array.isArray(row.data.signups)) {
          existingSignups = row.data.signups;
        }
      } catch (readErr) {
        console.warn('Publish: reading existing signups warning:', readErr.message);
      }

      // Merge signups: keep all existing signups plus any passed in payload
      const payloadSignups = Array.isArray(rawPayload.signups) ? rawPayload.signups : [];
      const signupMap = new Map();
      existingSignups.forEach((s) => {
        if (s?.id) signupMap.set(s.id, s);
      });
      payloadSignups.forEach((s) => {
        if (s?.id) {
          const current = signupMap.get(s.id) || {};
          signupMap.set(s.id, { ...current, ...s });
        }
      });
      const finalSignups = Array.from(signupMap.values());

      const finalData = {
        ...rawPayload,
        signups: finalSignups.length > 0 ? finalSignups : existingSignups
      };

      const { data: written, error } = await client
        .from('site_content')
        .upsert({
          id: 1,
          data: finalData,
          updated_at: new Date().toISOString()
        })
        .select();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Content published live successfully.'
      });
    }

    return NextResponse.json({ success: false, error: 'No valid data or updates provided' }, { status: 400 });
  } catch (err) {
    console.error('API Publish error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  return POST(request);
}
