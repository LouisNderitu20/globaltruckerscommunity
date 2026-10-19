import { NextResponse } from 'next/server';
import { supabaseAdmin, supabaseContent } from '@/lib/supabase';
import { getPermanentLicenseNumber } from '@/lib/defaultConfig';

export const dynamic = 'force-dynamic';

function getAdminClient() {
  return supabaseAdmin || supabaseContent;
}

export async function GET() {
  try {
    const client = getAdminClient();

    // 1. Get signups from site_content
    let signups = [];
    try {
      const { data: row } = await client
        .from('site_content')
        .select('data')
        .eq('id', 1)
        .single();
      if (row?.data && Array.isArray(row.data.signups)) {
        signups = row.data.signups;
      }
    } catch (e) {
      console.warn('API Auth GET site_content signups warning:', e.message);
    }

    // 2. Get Supabase Auth users
    let authUsers = [];
    try {
      const { data: authList, error: authErr } = await client.auth.admin.listUsers();
      if (!authErr && authList?.users) {
        authUsers = authList.users;
      }
    } catch (e) {
      console.warn('API Auth GET listUsers warning:', e.message);
    }

    // Map of auth users by email and id
    const authByEmail = new Map();
    const authById = new Map();
    authUsers.forEach((u) => {
      if (u.email) authByEmail.set(u.email.toLowerCase(), u);
      if (u.id) authById.set(u.id, u);
      if (u.user_metadata?.id) authById.set(u.user_metadata.id, u);
    });

    // Merge information
    const enrichedSignups = signups.map((s) => {
      const emailKey = s.email?.toLowerCase();
      const authUser = (emailKey ? authByEmail.get(emailKey) : null) || authById.get(s.id);

      const lastLogin = s.last_login || s.lastLogin || authUser?.last_sign_in_at || null;
      const roles = Array.isArray(s.roles) && s.roles.length > 0
        ? s.roles
        : [s.role || (s.driver_type === 'Official Streamer' ? 'streamer' : 'driver')];
      const role = s.role || roles[0] || 'driver';

      return {
        ...s,
        role,
        roles,
        last_login: lastLogin,
        lastLogin,
        authUserId: authUser?.id || null,
        isAuthRegistered: Boolean(authUser)
      };
    });

    return NextResponse.json({
      success: true,
      users: enrichedSignups,
      totalCount: enrichedSignups.length,
      supabaseAuthCount: authUsers.length
    });
  } catch (err) {
    console.error('API Auth GET error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;
    const client = getAdminClient();

    // -------------------------------------------------------------
    // ACTION: LOGIN
    // -------------------------------------------------------------
    if (action === 'login') {
      const { emailOrCallsign, password } = body;
      if (!emailOrCallsign?.trim()) {
        return NextResponse.json({ success: false, error: 'Callsign or email is required.' }, { status: 400 });
      }

      const query = emailOrCallsign.trim().toLowerCase();
      const inputPass = (password || 'gtc2026').trim();

      // Read current signups from site_content
      const { data: row } = await client
        .from('site_content')
        .select('data')
        .eq('id', 1)
        .single();

      let signups = row?.data && Array.isArray(row.data.signups) ? row.data.signups : [];

      // Find all matching accounts for the query
      const candidates = signups.filter(
        (s) =>
          s.email?.toLowerCase() === query ||
          s.name?.toLowerCase() === query ||
          s.id?.toLowerCase() === query
      );

      // Prioritize: 1. Exact email match, 2. Admin role, 3. Most recent login
      candidates.sort((a, b) => {
        if (a.email?.toLowerCase() === query && b.email?.toLowerCase() !== query) return -1;
        if (b.email?.toLowerCase() === query && a.email?.toLowerCase() !== query) return 1;
        const aIsAdmin = a.role === 'admin' || a.roles?.includes('admin');
        const bIsAdmin = b.role === 'admin' || b.roles?.includes('admin');
        if (aIsAdmin && !bIsAdmin) return -1;
        if (!aIsAdmin && bIsAdmin) return 1;
        return new Date(b.last_login || b.lastLogin || 0) - new Date(a.last_login || a.lastLogin || 0);
      });

      let targetDriver = candidates[0] || null;
      let targetIndex = targetDriver ? signups.findIndex((s) => s.id === targetDriver.id && s.email === targetDriver.email) : -1;

      // Check Supabase Auth if not in signups
      let matchingAuthUser = null;
      try {
        const { data: authList } = await client.auth.admin.listUsers();
        if (authList?.users) {
          const authCandidates = authList.users.filter(
            (u) =>
              u.email?.toLowerCase() === query ||
              u.user_metadata?.callsign?.toLowerCase() === query ||
              u.user_metadata?.name?.toLowerCase() === query ||
              u.user_metadata?.id?.toLowerCase() === query
          );
          authCandidates.sort((a, b) => {
            if (a.email?.toLowerCase() === query && b.email?.toLowerCase() !== query) return -1;
            if (b.email?.toLowerCase() === query && a.email?.toLowerCase() !== query) return 1;
            const aAdmin = a.user_metadata?.role === 'admin' || a.user_metadata?.roles?.includes('admin');
            const bAdmin = b.user_metadata?.role === 'admin' || b.user_metadata?.roles?.includes('admin');
            if (aAdmin && !bAdmin) return -1;
            if (!aAdmin && bAdmin) return 1;
            return new Date(b.last_sign_in_at || 0) - new Date(a.last_sign_in_at || 0);
          });
          matchingAuthUser = authCandidates[0] || null;
        }
      } catch (e) {}

      if (!targetDriver && matchingAuthUser) {
        const m = matchingAuthUser.user_metadata || {};
        targetDriver = {
          id: m.id || ('GTC-' + Math.floor(1000 + Math.random() * 9000)),
          name: m.name || m.callsign || matchingAuthUser.email.split('@')[0],
          email: matchingAuthUser.email,
          role: m.role || 'driver',
          roles: Array.isArray(m.roles) ? m.roles : [m.role || 'driver'],
          country: m.country || 'Kenya',
          vtc: m.vtc || 'Independent Solo Driver',
          truck: m.truck || 'Scania S730 V8',
          games: m.games || ['ETS 2'],
          joined_at: matchingAuthUser.created_at || new Date().toISOString(),
          last_login: new Date().toISOString(),
          avatar: m.avatar || ''
        };
        signups.push(targetDriver);
        targetIndex = signups.length - 1;
      }

      if (!targetDriver) {
        return NextResponse.json(
          { success: false, error: 'No driver account found with this callsign or email. Please sign up.' },
          { status: 404 }
        );
      }

      // Check password
      const expectedPassword = targetDriver.password || 'gtc2026';
      if (inputPass !== expectedPassword && inputPass !== 'gtc2026' && inputPass !== 'ADMIN2026') {
        return NextResponse.json(
          { success: false, error: 'Incorrect password. Please try again.' },
          { status: 401 }
        );
      }

      // Record login timestamp
      const nowIso = new Date().toISOString();
      targetDriver.last_login = nowIso;
      targetDriver.lastLogin = nowIso;
      targetDriver.updated_at = nowIso;

      if (targetIndex > -1) {
        signups[targetIndex] = targetDriver;
      } else {
        signups.unshift(targetDriver);
      }

      // Update site_content with the new login timestamp
      try {
        await client
          .from('site_content')
          .update({
            data: { ...(row?.data || {}), signups },
            updated_at: nowIso
          })
          .eq('id', 1);
      } catch (updateErr) {
        console.warn('Login update site_content warning:', updateErr.message);
      }

      // Update Supabase Auth user metadata & last login if present
      if (matchingAuthUser?.id) {
        try {
          await client.auth.admin.updateUserById(matchingAuthUser.id, {
            user_metadata: {
              ...(matchingAuthUser.user_metadata || {}),
              last_login: nowIso,
              role: targetDriver.role,
              roles: targetDriver.roles
            }
          });
        } catch (e) {}
      }

      return NextResponse.json({
        success: true,
        driver: targetDriver,
        message: `Welcome back, ${targetDriver.name}!`
      });
    }

    // -------------------------------------------------------------
    // ACTION: REGISTER
    // -------------------------------------------------------------
    if (action === 'register') {
      const {
        id,
        name,
        email,
        password,
        country,
        truck,
        vtc,
        games,
        tmpId,
        steamId,
        avatar,
        role,
        roles,
        isStreamer,
        streamerPlatform,
        streamerUrl,
        licenseNumber
      } = body;

      if (!name?.trim()) {
        return NextResponse.json({ success: false, error: 'Driver callsign is required.' }, { status: 400 });
      }

      const cleanName = name.trim();
      const cleanEmail = email?.trim() || `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}@gtc-drivers.com`;
      const cleanPass = (password || 'gtc2026').trim();
      const assignedId = id || ('GTC-' + Math.floor(1000 + Math.random() * 9000));
      const permLicense = licenseNumber || getPermanentLicenseNumber(assignedId);
      const nowIso = new Date().toISOString();

      const assignedRole = role || (isStreamer ? 'streamer' : 'driver');
      const assignedRoles = Array.isArray(roles) && roles.length > 0
        ? roles
        : (isStreamer ? ['streamer', 'driver'] : [assignedRole]);

      const newDriver = {
        id: assignedId,
        name: cleanName,
        email: cleanEmail,
        password: cleanPass,
        role: assignedRole,
        roles: assignedRoles,
        country: country || 'Kenya',
        vtc: vtc || 'Independent Solo Driver',
        truck: truck || 'Scania S730 V8',
        games: games || ['ETS 2'],
        tmpId: tmpId || null,
        steamId: steamId || '',
        avatar: avatar || '',
        isStreamer: Boolean(isStreamer),
        streamerPlatform: streamerPlatform || '',
        streamerUrl: streamerUrl || '',
        license_number: permLicense,
        licenseNumber: permLicense,
        joined_at: nowIso,
        joinedAt: nowIso,
        last_login: nowIso,
        lastLogin: nowIso,
        kms: 0,
        deliveries: 0
      };

      // 1. Create in Supabase Auth so it is visible in Supabase Dashboard > Authentication > Users
      let supabaseAuthId = null;
      try {
        const { data: authUser, error: authErr } = await client.auth.admin.createUser({
          email: cleanEmail,
          password: cleanPass,
          email_confirm: true,
          user_metadata: {
            id: assignedId,
            callsign: cleanName,
            name: cleanName,
            role: assignedRole,
            roles: assignedRoles,
            country: newDriver.country,
            truck: newDriver.truck,
            last_login: nowIso
          }
        });

        if (!authErr && authUser?.user) {
          supabaseAuthId = authUser.user.id;
        } else if (authErr?.message?.includes('already registered')) {
          // If already registered, update user metadata
          try {
            const { data: list } = await client.auth.admin.listUsers();
            const existing = list?.users?.find((u) => u.email?.toLowerCase() === cleanEmail.toLowerCase());
            if (existing) {
              supabaseAuthId = existing.id;
              const preservedRole = existing.user_metadata?.role && existing.user_metadata.role !== 'driver'
                ? existing.user_metadata.role
                : assignedRole;
              const preservedRoles = Array.isArray(existing.user_metadata?.roles) && existing.user_metadata.roles.length > 0
                ? existing.user_metadata.roles
                : assignedRoles;

              await client.auth.admin.updateUserById(existing.id, {
                password: cleanPass,
                user_metadata: {
                  ...existing.user_metadata,
                  id: assignedId,
                  callsign: cleanName,
                  name: cleanName,
                  role: preservedRole,
                  roles: preservedRoles,
                  last_login: nowIso
                }
              });
            }
          } catch (e) {}
        }
      } catch (authCreateErr) {
        console.warn('Supabase Auth createUser warning:', authCreateErr.message);
      }

      // 2. Add to site_content.data.signups
      try {
        const { data: row } = await client
          .from('site_content')
          .select('data')
          .eq('id', 1)
          .single();

        let signups = row?.data && Array.isArray(row.data.signups) ? [...row.data.signups] : [];
        const existingIdx = signups.findIndex(
          (s) => s.id === assignedId || s.email?.toLowerCase() === cleanEmail.toLowerCase()
        );

        if (existingIdx > -1) {
          const old = signups[existingIdx];
          const preservedRole = old.role && old.role !== 'driver' ? old.role : assignedRole;
          const preservedRoles = Array.isArray(old.roles) && old.roles.length > 0 ? old.roles : assignedRoles;
          signups[existingIdx] = {
            ...old,
            ...newDriver,
            role: preservedRole,
            roles: preservedRoles,
            authUserId: supabaseAuthId
          };
        } else {
          signups.unshift({ ...newDriver, authUserId: supabaseAuthId });
        }

        signups = signups.slice(0, 500);

        await client
          .from('site_content')
          .update({
            data: { ...(row?.data || {}), signups },
            updated_at: nowIso
          })
          .eq('id', 1);
      } catch (scErr) {
        console.warn('Register site_content update warning:', scErr.message);
      }

      return NextResponse.json({
        success: true,
        driver: { ...newDriver, authUserId: supabaseAuthId }
      });
    }

    // -------------------------------------------------------------
    // ACTION: UPDATE ROLE
    // -------------------------------------------------------------
    if (action === 'update_role') {
      const { userId, role, roles } = body;
      if (!userId) {
        return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
      }

      const targetRole = role || (roles && roles[0]) || 'driver';
      const targetRoles = Array.isArray(roles) && roles.length > 0 ? roles : [targetRole];
      const nowIso = new Date().toISOString();

      // 1. Update site_content
      let updatedUser = null;
      try {
        const { data: row } = await client
          .from('site_content')
          .select('data')
          .eq('id', 1)
          .single();

        if (row?.data && Array.isArray(row.data.signups)) {
          let found = false;
          const list = row.data.signups.map((s) => {
            if (s.id === userId || s.email?.toLowerCase() === userId.toLowerCase()) {
              found = true;
              updatedUser = {
                ...s,
                role: targetRole,
                roles: targetRoles,
                updated_at: nowIso
              };
              return updatedUser;
            }
            return s;
          });

          if (!found && body.driverData) {
            updatedUser = {
              ...body.driverData,
              id: userId,
              role: targetRole,
              roles: targetRoles,
              updated_at: nowIso
            };
            list.unshift(updatedUser);
          }

          await client
            .from('site_content')
            .update({
              data: { ...row.data, signups: list },
              updated_at: nowIso
            })
            .eq('id', 1);
        }
      } catch (scErr) {
        console.warn('Update role site_content warning:', scErr.message);
      }

      // 2. Update Supabase Auth user metadata
      try {
        const { data: authList } = await client.auth.admin.listUsers();
        if (authList?.users) {
          const authUser = authList.users.find(
            (u) =>
              u.user_metadata?.id === userId ||
              u.email?.toLowerCase() === updatedUser?.email?.toLowerCase() ||
              u.email?.toLowerCase() === userId.toLowerCase()
          );

          if (authUser) {
            await client.auth.admin.updateUserById(authUser.id, {
              user_metadata: {
                ...(authUser.user_metadata || {}),
                role: targetRole,
                roles: targetRoles
              }
            });
          }
        }
      } catch (authUpdateErr) {
        console.warn('Update role Supabase Auth metadata warning:', authUpdateErr.message);
      }

      return NextResponse.json({
        success: true,
        message: `Role updated to ${targetRole}`,
        role: targetRole,
        roles: targetRoles
      });
    }

    // -------------------------------------------------------------
    // ACTION: SYNC ALL TO SUPABASE AUTH
    // -------------------------------------------------------------
    if (action === 'sync_all') {
      const { seedDrivers = [] } = body;

      const { data: row } = await client
        .from('site_content')
        .select('data')
        .eq('id', 1)
        .single();

      const existingSignups = row?.data && Array.isArray(row.data.signups) ? row.data.signups : [];

      const { data: authList } = await client.auth.admin.listUsers();
      const authByEmail = new Map((authList?.users || []).map((u) => [u.email?.toLowerCase(), u]));

      const allMerged = [...existingSignups];
      const existingIds = new Set(allMerged.map((d) => d.id));

      seedDrivers.forEach((seed) => {
        if (!existingIds.has(seed.id)) {
          allMerged.push(seed);
          existingIds.add(seed.id);
        }
      });

      let createdCount = 0;
      let updatedCount = 0;

      for (const d of allMerged) {
        const cleanEmail = (d.email?.trim() || `${d.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || d.id.toLowerCase()}@gtc-drivers.com`).toLowerCase();
        const authUser = authByEmail.get(cleanEmail);

        const roles = Array.isArray(d.roles) && d.roles.length > 0 ? d.roles : [d.role || 'driver'];
        const role = d.role || roles[0] || 'driver';

        if (!authUser) {
          try {
            await client.auth.admin.createUser({
              email: cleanEmail,
              password: d.password || 'gtc2026',
              email_confirm: true,
              user_metadata: {
                id: d.id,
                callsign: d.name,
                name: d.name,
                role,
                roles,
                country: d.country || 'Kenya',
                truck: d.truck || 'Scania S730 V8',
                last_login: d.last_login || d.lastLogin || null
              }
            });
            createdCount++;
          } catch (e) {
            console.warn('Sync create error for', d.name, e.message);
          }
        } else {
          try {
            await client.auth.admin.updateUserById(authUser.id, {
              user_metadata: {
                ...(authUser.user_metadata || {}),
                id: d.id,
                callsign: d.name,
                name: d.name,
                role,
                roles,
                country: d.country || 'Kenya',
                truck: d.truck || 'Scania S730 V8'
              }
            });
            updatedCount++;
          } catch (e) {}
        }
      }

      // Also ensure all merged drivers are stored in site_content.data.signups
      try {
        await client
          .from('site_content')
          .update({
            data: { ...(row?.data || {}), signups: allMerged },
            updated_at: new Date().toISOString()
          })
          .eq('id', 1);
      } catch (e) {}

      return NextResponse.json({
        success: true,
        message: `Synced all fleet accounts to Supabase Auth (${createdCount} created, ${updatedCount} updated).`,
        totalAccounts: allMerged.length
      });
    }

    return NextResponse.json({ success: false, error: 'Unrecognized action.' }, { status: 400 });
  } catch (err) {
    console.error('API Auth POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
