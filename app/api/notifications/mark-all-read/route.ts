import { NextResponse } from 'next/server';
import { getCurrentAgency } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

// POST /api/notifications/mark-all-read - Mark all notifications as read
export async function POST() {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use admin client to bypass RLS (we use Clerk auth, not Supabase Auth)
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('agency_id', agency.id)
      .eq('read', false);

    if (error) {
      console.error('Error marking all as read:', error);
      return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark all read error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
