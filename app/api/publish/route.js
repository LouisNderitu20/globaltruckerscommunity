import { NextResponse } from 'next/server';
import { supabaseAdmin, supabaseContent } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function getAdminClient() {
  return supabaseAdmin || supabaseContent;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { updates, data, roles, userId, role, driverData } = body;

    const client = getAdminClient();

    // -------------------------------------------------------------
    // ROLE UPDATES
    // -------------------------------------------------------------
    if (updates || userId || role || roles) {
      const roleUpdates = updates
        ? (Array.isArray(updates) ? updates : [updates])
        : [{ userId, role, roles: roles || (role ? [role] : ['driver']), driverData }];

      let authUsers = [];
      try {
        const { data: authList } = await client.auth.admin.listUsers();
        if (authList?.users) authUsers = authList.users;
      } catch (e) {}

      for (const item of roleUpdates) {
        const targetId = item.userId || item.id;
        const targetRole = item.role || (item.roles && item.roles[0]) || 'driver';
        const targetRoles = Array.isArray(item.roles) && item.roles.length > 0 ? item.roles : [targetRole];

        if (!targetId) continue;

        const nowIso = new Date().toISOString();

        // Update site_content cache
        try {
          const { data: row } = await client
            .from('site_content')
            .select('data')
            .eq('id', 1)
            .single();

          if (row?.data) {
            let signups = Array.isArray(row.data.signups) ? [...row.data.signups] : [];
            let found = false;

            signups = signups.map((s) => {
              if (s.id === targetId || (s.email && s.email.toLowerCase() === targetId.toLowerCase())) {
                found = true;
                return {
                  ...s,
                  role: targetRole,
                  roles: targetRoles,
                  updated_at: nowIso
                };
              }
              return s;
            });

            // If not found and item provided driverData, add them
            if (!found && item.driverData) {
              signups.push({
                ...item.driverData,
                id: targetId,
                role: targetRole,
                roles: targetRoles,
                updated_at: nowIso
              });
            }

            await client
              .from('site_content')
              .update({
                data: { ...row.data, signups },
                updated_at: nowIso
              })
              .eq('id', 1);
          }
        } catch (cacheErr) {
          console.warn('Publish: site_content role update notice:', cacheErr.message);
        }

        // Update Supabase Auth user metadata
        try {
          const matchingAuth = authUsers.find(
            (u) =>
              u.user_metadata?.id === targetId ||
              u.id === targetId ||
              (item.driverData?.email && u.email?.toLowerCase() === item.driverData.email.toLowerCase()) ||
              u.email?.toLowerCase() === targetId.toLowerCase()
          );

          if (matchingAuth) {
            await client.auth.admin.updateUserById(matchingAuth.id, {
              user_metadata: {
                ...(matchingAuth.user_metadata || {}),
                role: targetRole,
                roles: targetRoles
              }
            });
          }
        } catch (authErr) {
          console.warn('Publish: Supabase Auth role update notice:', authErr.message);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Roles published successfully across database & Supabase Auth.'
      });
    }

    // -------------------------------------------------------------
    // CONTENT CONFIG PUBLISHING
    // -------------------------------------------------------------
    const contentToSave = data || body;
    if (contentToSave && typeof contentToSave === 'object') {
      const rawPayload = contentToSave.data || contentToSave;

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

      // Live member accounts must NEVER be overwritten by site content updates
      const finalData = {
        ...rawPayload,
        signups: existingSignups
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
