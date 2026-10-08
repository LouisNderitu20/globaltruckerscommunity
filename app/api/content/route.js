import { NextResponse } from 'next/server';
import { supabaseContent, supabaseAdmin } from '@/lib/supabase';
import { DEFAULT_CONFIG } from '@/lib/defaultConfig';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: row, error } = await supabaseContent
      .from('site_content')
      .select('data, updated_at')
      .eq('id', 1)
      .single();

    if (error || !row || !row.data) {
      console.warn('GTC API: Falling back to default config:', error?.message);
      return NextResponse.json({ success: true, data: DEFAULT_CONFIG, isDefault: true });
    }

    const mergedData = {
      ...DEFAULT_CONFIG,
      ...row.data,
      nextConvoy: { ...DEFAULT_CONFIG.nextConvoy, ...(row.data.nextConvoy || {}) },
      stats: { ...DEFAULT_CONFIG.stats, ...(row.data.stats || {}) },
      planner: { ...DEFAULT_CONFIG.planner, ...(row.data.planner || {}) },
      timetableConvoys: row.data.timetableConvoys || DEFAULT_CONFIG.timetableConvoys,
      news: row.data.news || DEFAULT_CONFIG.news,
      gallery: row.data.gallery || DEFAULT_CONFIG.gallery,
    };

    return NextResponse.json({
      success: true,
      data: mergedData,
      updated_at: row.updated_at,
    });
  } catch (err) {
    console.error('GTC API Content GET error:', err);
    return NextResponse.json(
      { success: true, data: DEFAULT_CONFIG, isDefault: true, error: err.message },
      { status: 200 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const dataToSave = body.data || body;

    if (!dataToSave || typeof dataToSave !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid content data payload' }, { status: 400 });
    }

    const client = supabaseAdmin || supabaseContent;

    const { data: written, error } = await client
      .from('site_content')
      .upsert({
        id: 1,
        data: dataToSave,
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    if (!written || written.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No row was written (database permissions may be blocking updates).' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Content published successfully' });
  } catch (err) {
    console.error('GTC API Content PUT error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
