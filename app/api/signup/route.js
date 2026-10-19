import { NextResponse } from 'next/server';
import { supabaseAdmin, supabaseContent } from '@/lib/supabase';
import { DEFAULT_CONFIG, isValidGtcCountry, isValidGtcTruck, isValidStreamerUrl, normalizeStreamerUrl, getPermanentLicenseNumber } from '@/lib/defaultConfig';

export const dynamic = 'force-dynamic';

const db = supabaseAdmin || supabaseContent;

export async function POST(request) {
  try {
    const body = await request.json();
    const { id, name, email, password, country, games, type, vtc, tmp, steamId, truckBrand, stream, avatar, role, roles, isStreamer, streamerPlatform, licenseNumber, joinedAt } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'In-game callsign is required.' },
        { status: 400 }
      );
    }

    const validatedCountry = isValidGtcCountry(country) ? country.trim() : 'Kenya';
    const validatedTruck = isValidGtcTruck(truckBrand) ? truckBrand.trim() : 'Scania S730 V8';

    let validatedStreamUrl = null;
    let finalRole = role || 'driver';
    const isClaimingStreamer = Boolean(isStreamer) || finalRole === 'streamer';

    if (isClaimingStreamer) {
      if (stream && isValidStreamerUrl(stream, streamerPlatform)) {
        validatedStreamUrl = normalizeStreamerUrl(stream);
        finalRole = 'streamer';
      } else {
        finalRole = 'driver';
        validatedStreamUrl = null;
      }
    }

    const assignedId = id || ('GTC-' + Math.floor(1000 + Math.random() * 9000));
    const permanentLicense = licenseNumber || getPermanentLicenseNumber(assignedId);
    const joinDate = joinedAt || new Date().toISOString();
    const finalRoles = Array.isArray(roles) && roles.length > 0 ? roles : [finalRole];
    const cleanEmail = email?.trim() || `${name.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}@gtc-drivers.com`;
    const cleanPassword = (password || 'gtc2026').trim();
    const nowIso = new Date().toISOString();

    const newSignup = {
      id: assignedId,
      name: name.trim(),
      email: cleanEmail,
      password: cleanPassword,
      country: validatedCountry,
      games: games || ['ETS 2'],
      driver_type: type || 'Independent driver',
      role: finalRole,
      roles: finalRoles,
      vtc: vtc?.trim() || 'Independent Solo Driver',
      truckers_mp_id: tmp?.trim() || null,
      steam_id: steamId?.trim() || null,
      truck_brand: validatedTruck,
      stream_url: validatedStreamUrl,
      avatar: avatar || null,
      license_number: permanentLicense,
      licenseNumber: permanentLicense,
      joined_at: joinDate,
      joinedAt: joinDate,
      last_login: nowIso,
      lastLogin: nowIso,
      submitted_at: nowIso,
      kms: 0,
      deliveries: 0
    };

    // 1. Sync account into Supabase Auth (so user is visible in Supabase Authentication Dashboard)
    try {
      const { data: authCreated, error: authErr } = await db.auth.admin.createUser({
        email: cleanEmail,
        password: cleanPassword,
        email_confirm: true,
        user_metadata: {
          id: assignedId,
          callsign: name.trim(),
          name: name.trim(),
          role: finalRole,
          roles: finalRoles,
          country: validatedCountry,
          truck: validatedTruck,
          last_login: nowIso
        }
      });
      if (authErr && authErr.message?.includes('already registered')) {
        // Update user metadata if user already exists in auth
        const { data: list } = await db.auth.admin.listUsers();
        const existing = list?.users?.find((u) => u.email?.toLowerCase() === cleanEmail.toLowerCase());
        if (existing) {
          await db.auth.admin.updateUserById(existing.id, {
            user_metadata: {
              ...(existing.user_metadata || {}),
              id: assignedId,
              callsign: name.trim(),
              name: name.trim(),
              role: finalRole,
              roles: finalRoles,
              last_login: nowIso
            }
          });
        }
      }
    } catch (authE) {
      console.warn('GTC Signup Auth create notice:', authE.message);
    }

    // 2. Persist to site_content
    try {
      const { data: row } = await db
        .from('site_content')
        .select('data')
        .eq('id', 1)
        .single();

      if (row?.data) {
        const contentData = row.data;
        if (!Array.isArray(contentData.signups)) {
          contentData.signups = [];
        }

        const existingIdx = contentData.signups.findIndex(
          (s) => (s.id && s.id === newSignup.id) || (s.name && s.name.toLowerCase() === newSignup.name.toLowerCase()) || (s.email && s.email.toLowerCase() === cleanEmail.toLowerCase())
        );
        if (existingIdx > -1) {
          contentData.signups[existingIdx] = { ...contentData.signups[existingIdx], ...newSignup };
        } else {
          contentData.signups.unshift(newSignup);
        }

        contentData.signups = contentData.signups.slice(0, 500);

        await db
          .from('site_content')
          .update({
            data: contentData,
            updated_at: nowIso,
          })
          .eq('id', 1);
      }
    } catch (e) {
      console.warn('GTC Signups: Fallback content update warning:', e.message);
    }

    return NextResponse.json({ success: true, signup: newSignup });
  } catch (err) {
    console.error('GTC Signup POST error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    let signupsList = [];

    try {
      const { data: row } = await db
        .from('site_content')
        .select('data')
        .eq('id', 1)
        .single();

      if (row?.data && Array.isArray(row.data.signups)) {
        signupsList = row.data.signups;
      }
    } catch (e) {}

    return NextResponse.json({ success: true, signups: signupsList });
  } catch (err) {
    return NextResponse.json({ success: true, signups: [], error: err.message });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, email, password, country, games, type, role, roles, vtc, tmp, steamId, truckBrand, stream, avatar, bio } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Driver ID is required for update' }, { status: 400 });
    }

    const validatedCountry = country ? (isValidGtcCountry(country) ? country.trim() : 'Kenya') : null;
    const validatedTruck = truckBrand ? (isValidGtcTruck(truckBrand) ? truckBrand.trim() : 'Scania S730 V8') : null;

    let validatedStreamUrl = stream?.trim() || null;
    let finalRoles = Array.isArray(roles) && roles.length > 0 ? [...roles] : (role ? [role] : ['driver']);
    let finalRole = role || finalRoles[0] || 'driver';

    const hasStreamerRole = finalRole === 'streamer' || finalRoles.includes('streamer') || Boolean(body.isStreamer);
    if (hasStreamerRole) {
      if (validatedStreamUrl && isValidStreamerUrl(validatedStreamUrl, body.streamerPlatform || '')) {
        validatedStreamUrl = normalizeStreamerUrl(validatedStreamUrl);
      } else {
        finalRoles = finalRoles.filter((r) => r !== 'streamer');
        if (finalRoles.length === 0) finalRoles = ['driver'];
        finalRole = finalRoles[0] || 'driver';
        validatedStreamUrl = null;
      }
    }

    const nowIso = new Date().toISOString();
    const updatedData = {
      id,
      name: name?.trim(),
      email: email?.trim() || null,
      ...(password ? { password: password.trim() } : {}),
      country: validatedCountry,
      games: games || ['ETS 2'],
      driver_type: type || 'Independent driver',
      role: finalRole,
      roles: finalRoles,
      vtc: vtc?.trim() || null,
      truckers_mp_id: tmp?.trim() || null,
      steam_id: steamId?.trim() || null,
      truck_brand: validatedTruck,
      stream_url: validatedStreamUrl,
      avatar: avatar || null,
      bio: bio?.trim() || null,
      license_number: body.licenseNumber || body.license_number || getPermanentLicenseNumber(id),
      updated_at: nowIso
    };

    // Update site_content
    try {
      const { data: row } = await db
        .from('site_content')
        .select('data')
        .eq('id', 1)
        .single();

      if (row?.data && Array.isArray(row.data.signups)) {
        const list = row.data.signups.map((s) => (s.id === id ? { ...s, ...updatedData } : s));
        if (!list.some((s) => s.id === id)) {
          list.unshift(updatedData);
        }
        await db
          .from('site_content')
          .update({
            data: { ...row.data, signups: list },
            updated_at: nowIso
          })
          .eq('id', 1);
      }
    } catch (e) {}

    // Update Supabase Auth user metadata
    try {
      const { data: authList } = await db.auth.admin.listUsers();
      if (authList?.users) {
        const authUser = authList.users.find(
          (u) =>
            u.user_metadata?.id === id ||
            (email && u.email?.toLowerCase() === email.toLowerCase()) ||
            (name && u.user_metadata?.callsign?.toLowerCase() === name.toLowerCase())
        );

        if (authUser) {
          await db.auth.admin.updateUserById(authUser.id, {
            ...(password ? { password: password.trim() } : {}),
            user_metadata: {
              ...(authUser.user_metadata || {}),
              id,
              callsign: name?.trim() || authUser.user_metadata?.callsign,
              name: name?.trim() || authUser.user_metadata?.name,
              role: finalRole,
              roles: finalRoles,
              country: validatedCountry || authUser.user_metadata?.country,
              truck: validatedTruck || authUser.user_metadata?.truck
            }
          });
        }
      }
    } catch (authUpdateErr) {}

    return NextResponse.json({ success: true, signup: updatedData });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Driver ID is required' }, { status: 400 });
    }

    let deletedEmail = null;

    // Delete from site_content
    try {
      const { data: row } = await db
        .from('site_content')
        .select('data')
        .eq('id', 1)
        .single();

      if (row?.data && Array.isArray(row.data.signups)) {
        const found = row.data.signups.find((s) => s.id === id);
        if (found?.email) deletedEmail = found.email.toLowerCase();

        const filtered = row.data.signups.filter((s) => s.id !== id);
        await db
          .from('site_content')
          .update({
            data: { ...row.data, signups: filtered },
            updated_at: new Date().toISOString()
          })
          .eq('id', 1);
      }
    } catch (e) {}

    // Delete from Supabase Auth
    try {
      const { data: authList } = await db.auth.admin.listUsers();
      if (authList?.users) {
        const targetAuth = authList.users.find(
          (u) =>
            u.user_metadata?.id === id ||
            (deletedEmail && u.email?.toLowerCase() === deletedEmail)
        );
        if (targetAuth) {
          await db.auth.admin.deleteUser(targetAuth.id);
        }
      }
    } catch (authDelErr) {}

    return NextResponse.json({ success: true, message: 'Driver deleted successfully from database & Supabase Auth' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
