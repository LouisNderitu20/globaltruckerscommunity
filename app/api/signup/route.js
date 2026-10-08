import { NextResponse } from 'next/server';
import { supabaseContent } from '@/lib/supabase';
import { DEFAULT_CONFIG } from '@/lib/defaultConfig';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { id, name, email, country, games, type, vtc, tmp, steamId, truckBrand, stream, avatar } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'In-game callsign is required.' },
        { status: 400 }
      );
    }

    const newSignup = {
      id: id || ('GTC-' + Math.floor(1000 + Math.random() * 9000)),
      name: name.trim(),
      email: email?.trim() || null,
      country: country?.trim() || null,
      games: games || ['ETS 2'],
      driver_type: type || 'Independent driver',
      vtc: vtc?.trim() || null,
      truckers_mp_id: tmp?.trim() || null,
      steam_id: steamId?.trim() || null,
      truck_brand: truckBrand || 'Scania',
      stream_url: stream?.trim() || null,
      avatar: avatar || null,
      submitted_at: new Date().toISOString(),
    };

    let dbSuccess = false;
    try {
      const { error: dbError } = await supabaseContent
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
      const { data: row } = await supabaseContent
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

        await supabaseContent
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
      const { data, error } = await supabaseContent
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
        const { data: row } = await supabaseContent
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

    const updatedData = {
      id,
      name: name?.trim(),
      email: email?.trim() || null,
      country: country?.trim() || null,
      games: games || ['ETS 2'],
      driver_type: type || 'Independent driver',
      role: role || 'driver',
      roles: Array.isArray(roles) ? roles : (role ? [role] : ['driver']),
      vtc: vtc?.trim() || null,
      truckers_mp_id: tmp?.trim() || null,
      steam_id: steamId?.trim() || null,
      truck_brand: truckBrand || 'Scania',
      stream_url: stream?.trim() || null,
      avatar: avatar || null,
      bio: bio?.trim() || null,
      updated_at: new Date().toISOString()
    };

    try {
      await supabaseContent
        .from('signups')
        .upsert([updatedData], { onConflict: 'id' });
    } catch (e) {}

    try {
      const { data: row } = await supabaseContent
        .from('site_content')
        .select('data')
        .eq('id', 1)
        .single();

      if (row?.data && Array.isArray(row.data.signups)) {
        const list = row.data.signups.map((s) => (s.id === id ? { ...s, ...updatedData } : s));
        if (!list.some((s) => s.id === id)) {
          list.unshift(updatedData);
        }
        await supabaseContent
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
      await supabaseContent.from('signups').delete().eq('id', id);
    } catch (e) {}

    try {
      const { data: row } = await supabaseContent
        .from('site_content')
        .select('data')
        .eq('id', 1)
        .single();

      if (row?.data && Array.isArray(row.data.signups)) {
        const filtered = row.data.signups.filter((s) => s.id !== id);
        await supabaseContent
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


