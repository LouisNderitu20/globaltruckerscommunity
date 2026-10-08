import { NextResponse } from 'next/server';
import { supabaseContent } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const convoyId = searchParams.get('convoyId');

    let allAttendees = {};

    try {
      const { data: row } = await supabaseContent
        .from('site_content')
        .select('data')
        .eq('id', 1)
        .single();

      if (row?.data && typeof row.data.convoyAttendees === 'object' && row.data.convoyAttendees !== null) {
        allAttendees = row.data.convoyAttendees;
      }
    } catch (e) {
      console.warn('GTC Attendance: Could not load site_content:', e.message);
    }

    if (convoyId) {
      const list = Array.isArray(allAttendees[convoyId]) ? allAttendees[convoyId] : [];
      return NextResponse.json({ success: true, attendees: list, count: list.length });
    }

    return NextResponse.json({ success: true, data: allAttendees });
  } catch (err) {
    console.error('GTC Attendance GET error:', err);
    return NextResponse.json({ success: false, attendees: [], count: 0, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { convoyId, driver } = body;

    if (!convoyId || !driver || !driver.name) {
      return NextResponse.json(
        { success: false, error: 'Convoy ID and driver details are required.' },
        { status: 400 }
      );
    }

    let allAttendees = {};
    let contentData = {};

    try {
      const { data: row } = await supabaseContent
        .from('site_content')
        .select('data')
        .eq('id', 1)
        .single();

      if (row?.data) {
        contentData = row.data;
        if (typeof contentData.convoyAttendees === 'object' && contentData.convoyAttendees !== null) {
          allAttendees = contentData.convoyAttendees;
        }
      }
    } catch (e) {}

    const currentList = Array.isArray(allAttendees[convoyId]) ? allAttendees[convoyId] : [];

    const alreadyIdx = currentList.findIndex(
      (a) => a.id === driver.id || a.name?.toLowerCase() === driver.name?.toLowerCase()
    );

    const attendeeRecord = {
      id: driver.id || `GTC-${Math.floor(1000 + Math.random() * 9000)}`,
      name: driver.name.trim(),
      role: driver.role || 'driver',
      roles: driver.roles || [driver.role || 'driver'],
      vtc: driver.vtc || 'Independent Solo',
      truck: driver.truck || 'Scania',
      country: driver.country || 'International',
      avatar: driver.avatar || null,
      confirmedAt: new Date().toISOString()
    };

    let updatedList;
    if (alreadyIdx >= 0) {
      updatedList = [...currentList];
      updatedList[alreadyIdx] = { ...updatedList[alreadyIdx], ...attendeeRecord };
    } else {
      updatedList = [attendeeRecord, ...currentList];
    }

    allAttendees[convoyId] = updatedList;
    contentData.convoyAttendees = allAttendees;

    try {
      await supabaseContent
        .from('site_content')
        .update({
          data: contentData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1);
    } catch (e) {
      console.warn('GTC Attendance: Could not save to site_content:', e.message);
    }

    return NextResponse.json({
      success: true,
      attendees: updatedList,
      count: updatedList.length
    });
  } catch (err) {
    console.error('GTC Attendance POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { convoyId, driverId, driverName } = body;

    if (!convoyId || (!driverId && !driverName)) {
      return NextResponse.json(
        { success: false, error: 'Convoy ID and driver identifier are required.' },
        { status: 400 }
      );
    }

    let allAttendees = {};
    let contentData = {};

    try {
      const { data: row } = await supabaseContent
        .from('site_content')
        .select('data')
        .eq('id', 1)
        .single();

      if (row?.data) {
        contentData = row.data;
        if (typeof contentData.convoyAttendees === 'object' && contentData.convoyAttendees !== null) {
          allAttendees = contentData.convoyAttendees;
        }
      }
    } catch (e) {}

    const currentList = Array.isArray(allAttendees[convoyId]) ? allAttendees[convoyId] : [];
    const updatedList = currentList.filter(
      (a) => a.id !== driverId && (!driverName || a.name?.toLowerCase() !== driverName.toLowerCase())
    );

    allAttendees[convoyId] = updatedList;
    contentData.convoyAttendees = allAttendees;

    try {
      await supabaseContent
        .from('site_content')
        .update({
          data: contentData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1);
    } catch (e) {}

    return NextResponse.json({
      success: true,
      attendees: updatedList,
      count: updatedList.length
    });
  } catch (err) {
    console.error('GTC Attendance DELETE error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
