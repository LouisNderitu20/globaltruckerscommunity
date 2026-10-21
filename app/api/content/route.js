import { NextResponse } from 'next/server';
import { supabaseContent, supabaseAdmin } from '@/lib/supabase';
import { DEFAULT_CONFIG } from '@/lib/defaultConfig';

import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const client = supabaseAdmin || supabaseContent;
    const { data: row, error } = await client
      .from('site_content')
      .select('data, updated_at')
      .eq('id', 1)
      .single();

    if (error || !row || !row.data) {
      console.warn('GTC API: Falling back to default config:', error?.message);
      return NextResponse.json(
        { success: true, data: DEFAULT_CONFIG, isDefault: true },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        }
      );
    }

    const mergedData = {
      ...DEFAULT_CONFIG,
      ...row.data,
      nextConvoy: { ...DEFAULT_CONFIG.nextConvoy, ...(row.data?.nextConvoy || {}) },
      stats: { ...DEFAULT_CONFIG.stats, ...(row.data?.stats || {}) },
      planner: { ...DEFAULT_CONFIG.planner, ...(row.data?.planner || {}) },
      timetableConvoys: Array.isArray(row.data?.timetableConvoys) && row.data.timetableConvoys.length > 0 ? row.data.timetableConvoys : DEFAULT_CONFIG.timetableConvoys,
      news: Array.isArray(row.data?.news) ? row.data.news : DEFAULT_CONFIG.news,
      gallery: Array.isArray(row.data?.gallery) ? row.data.gallery : DEFAULT_CONFIG.gallery,
      nextConvoyOverride: Boolean(row.data?.nextConvoyOverride),
    };

    return NextResponse.json(
      {
        success: true,
        data: mergedData,
        updated_at: row.updated_at,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (err) {
    console.error('GTC API Content GET error:', err);
    return NextResponse.json(
      { success: true, data: DEFAULT_CONFIG, isDefault: true, error: err.message },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        },
      }
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
      console.warn('Content PUT: reading existing signups warning:', readErr.message);
    }

    // Live member accounts must NEVER be overwritten by site content updates
    const finalData = {
      ...dataToSave,
      signups: existingSignups
    };

    const { data: written, error } = await client
      .from('site_content')
      .upsert({
        id: 1,
        data: finalData,
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

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/api/content');
    } catch (e) {}

    return NextResponse.json(
      { success: true, message: 'Content published successfully' },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        },
      }
    );
  } catch (err) {
    console.error('GTC API Content PUT error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
