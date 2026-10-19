import { NextResponse } from 'next/server';
import { supabaseAdmin, supabaseContent } from '@/lib/supabase';

function getAdminClient() {
  return supabaseAdmin || supabaseContent;
}

const VALID_ROLES = ['admin', 'staff', 'dev_modder', 'convoy_lead', 'dispatcher', 'streamer', 'driver'];

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { role, roles, driverData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Driver ID is required' }, { status: 400 });
    }

    if (role && !VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: `Invalid role: ${role}. Must be one of ${VALID_ROLES.join(', ')}` }, { status: 400 });
    }

    const primaryRole = role || 'driver';
    const rolesArray = Array.isArray(roles) && roles.length > 0 ? roles : [primaryRole];
    const client = getAdminClient();
    const nowIso = new Date().toISOString();

    // 1. Update site_content row 1 signups
    let updatedDriver = null;
    try {
      const { data: row } = await client
        .from('site_content')
        .select('data')
        .eq('id', 1)
        .single();

      if (row?.data) {
        let signups = Array.isArray(row.data.signups) ? [...row.data.signups] : [];
        let found = false;

        const hasStreamerRole = rolesArray.includes('streamer') || primaryRole === 'streamer';
        const streamUrlVal = body.streamerUrl || driverData?.streamerUrl || driverData?.stream_url;

        signups = signups.map((s) => {
          if (s.id === id || s.email?.toLowerCase() === id.toLowerCase()) {
            found = true;
            updatedDriver = {
              ...s,
              role: primaryRole,
              roles: rolesArray,
              isStreamer: hasStreamerRole || Boolean(s.isStreamer),
              streamerUrl: streamUrlVal || s.streamerUrl || s.stream_url || '',
              stream_url: streamUrlVal || s.stream_url || s.streamerUrl || '',
              updated_at: nowIso
            };
            return updatedDriver;
          }
          return s;
        });

        if (!found && driverData) {
          updatedDriver = {
            ...driverData,
            id,
            role: primaryRole,
            roles: rolesArray,
            isStreamer: hasStreamerRole || Boolean(driverData.isStreamer),
            streamerUrl: streamUrlVal || driverData.streamerUrl || driverData.stream_url || '',
            stream_url: streamUrlVal || driverData.stream_url || driverData.streamerUrl || '',
            updated_at: nowIso
          };
          signups.unshift(updatedDriver);
        }

        await client
          .from('site_content')
          .update({
            data: { ...row.data, signups },
            updated_at: nowIso
          })
          .eq('id', 1);
      }
    } catch (scErr) {
      console.warn('Error updating site_content signups in role route:', scErr.message);
    }

    // 2. Update Supabase Auth user metadata
    let authUpdated = false;
    try {
      const { data: authList } = await client.auth.admin.listUsers();
      if (authList?.users) {
        const targetAuthUser = authList.users.find(
          (u) =>
            u.user_metadata?.id === id ||
            u.email?.toLowerCase() === id.toLowerCase() ||
            u.email?.toLowerCase() === updatedDriver?.email?.toLowerCase() ||
            u.user_metadata?.name?.toLowerCase() === updatedDriver?.name?.toLowerCase() ||
            u.user_metadata?.callsign?.toLowerCase() === updatedDriver?.name?.toLowerCase()
        );

        if (targetAuthUser) {
          await client.auth.admin.updateUserById(targetAuthUser.id, {
            user_metadata: {
              ...(targetAuthUser.user_metadata || {}),
              role: primaryRole,
              roles: rolesArray,
              isStreamer: hasStreamerRole || Boolean(targetAuthUser.user_metadata?.isStreamer),
              streamerUrl: streamUrlVal || targetAuthUser.user_metadata?.streamerUrl || targetAuthUser.user_metadata?.stream_url || '',
              stream_url: streamUrlVal || targetAuthUser.user_metadata?.stream_url || targetAuthUser.user_metadata?.streamerUrl || ''
            }
          });
          authUpdated = true;
        }
      }
    } catch (authErr) {
      console.warn('Error updating Supabase Auth in role route:', authErr.message);
    }

    return NextResponse.json({
      success: true,
      message: `Role updated to ${primaryRole} successfully`,
      user: {
        id,
        role: primaryRole,
        roles: rolesArray,
        authUpdated
      }
    });
  } catch (err) {
    console.error('Role update PUT error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req, context) {
  return PUT(req, context);
}
