import { NextResponse } from 'next/server';
import { supabaseAdmin, supabaseContent } from '@/lib/supabase';
import { DEFAULT_CONFIG, isValidGtcCountry, isValidGtcTruck, isValidStreamerUrl, normalizeStreamerUrl, getPermanentLicenseNumber } from '@/lib/defaultConfig';

export const dynamic = 'force-dynamic';

const db = supabaseAdmin || supabaseContent;

export async function POST(request) {
  try {
    const body = await request.json();
    const { id, name, email, country, games, type, vtc, tmp, steamId, truckBrand, stream, avatar, role, isStreamer, streamerPlatform, licenseNumber, joinedAt } = body;

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
        // Disallow unverified streamer claims
        finalRole = 'driver';
        validatedStreamUrl = null;
      }
    }

    const assignedId = id || ('GTC-' + Math.floor(1000 + Math.random() * 9000));
    const permanentLicense = licenseNumber || getPermanentLicenseNumber(assignedId);
    const joinDate = joinedAt || new Date().toISOString();

    const newSignup = {
      id: assignedId,
      name: name.trim(),
      email: email?.trim() || null,
      country: validatedCountry,
      games: games || ['ETS 2'],
      driver_type: type || 'Independent driver',
      role: finalRole,
      vtc: vtc?.trim() || null,
      truckers_mp_id: tmp?.trim() || null,
      steam_id: steamId?.trim() || null,
      truck_brand: validatedTruck,
      stream_url: validatedStreamUrl,
      avatar: avatar || null,
      license_number: permanentLicense,
      licenseNumber: permanentLicense,
      joined_at: joinDate,
      submitted_at: new Date().toISOString(),
    };

    let dbSuccess = false;
    try {
      const { error: dbError } = await db
        .from('signups')
        .insert([newSignup]);

      if (!dbError) {
        dbSuccess = true;
      } else {
        console.warn('GTC Signups: Supabase table insert warning:', dbError.message);
      }
    } catch (e) {
      console.warn('GTC Signups: Table insert exception:', e.message);
    }

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
        
        contentData.signups.unshift(newSignup);
        
        contentData.signups = contentData.signups.slice(0, 500);

        await db
          .from('site_content')
          .update({
            data: contentData,
            updated_at: new Date().toISOString(),
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
      const { data, error } = await db
        .from('signups')
        .select('*')
        .order('submitted_at', { ascending: false })
        .limit(200);

      if (!error && Array.isArray(data) && data.length > 0) {
        signupsList = data;
      }
    } catch (e) {}

    if (signupsList.length === 0) {
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
    }

    return NextResponse.json({ success: true, signups: signupsList });
  } catch (err) {
    return NextResponse.json({ success: true, signups: [], error: err.message });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, email, country, games, type, role, roles, vtc, tmp, steamId, truckBrand, stream, avatar, bio } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Driver ID is required for update' }, { status: 400 });
    }

    const validatedCountry = country ? (isValidGtcCountry(country) ? country.trim() : 'Kenya') : null;
    const validatedTruck = truckBrand ? (isValidGtcTruck(truckBrand) ? truckBrand.trim() : 'Scania S730 V8') : null;

    let validatedStreamUrl = stream?.trim() || null;
    let finalRoles = Array.isArray(roles) ? [...roles] : (role ? [role] : ['driver']);
    let finalRole = role || finalRoles[0] || 'driver';

    const hasStreamerRole = finalRole === 'streamer' || finalRoles.includes('streamer') || Boolean(body.isStreamer);
    if (hasStreamerRole) {
      if (validatedStreamUrl && isValidStreamerUrl(validatedStreamUrl, body.streamerPlatform || '')) {
        validatedStreamUrl = normalizeStreamerUrl(validatedStreamUrl);
      } else {
        // Disallow unverified streamer role
        finalRoles = finalRoles.filter((r) => r !== 'streamer');
        if (finalRoles.length === 0) finalRoles = ['driver'];
        finalRole = finalRoles[0] || 'driver';
        validatedStreamUrl = null;
      }
    }

    const updatedData = {
      id,
      name: name?.trim(),
      email: email?.trim() || null,
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
      updated_at: new Date().toISOString()
    };

    try {
      await db
        .from('signups')
        .upsert([updatedData], { onConflict: 'id' });
    } catch (e) {}

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
            updated_at: new Date().toISOString()
          })
          .eq('id', 1);
      }
    } catch (e) {}

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

    try {
      await db.from('signups').delete().eq('id', id);
    } catch (e) {}

    try {
      const { data: row } = await db
        .from('site_content')
        .select('data')
        .eq('id', 1)
        .single();

      if (row?.data && Array.isArray(row.data.signups)) {
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

    return NextResponse.json({ success: true, message: 'Driver deleted successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}


