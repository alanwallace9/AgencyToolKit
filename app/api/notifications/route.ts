import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAgency } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

// GET /api/notifications - List notifications for the authenticated agency
export async function GET(request: NextRequest) {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread_only') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    const supabase = await createClient();

    // Build query
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('agency_id', agency.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agency.id)
      .eq('read', false);

    return NextResponse.json({
      notifications: notifications || [],
      unread_count: unreadCount || 0,
    });
  } catch (error) {
    console.error('Notifications GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
