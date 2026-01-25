import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { getCurrentAgency } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

// DELETE /api/photos/[id] - Delete a photo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createClient();

    // Get the photo to verify ownership and get blob URL
    const { data: photo, error: fetchError } = await supabase
      .from('customer_photos')
      .select('*, customers!inner(agency_id)')
      .eq('id', id)
      .single();

    if (fetchError || !photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Verify agency owns this photo
    if (photo.agency_id !== agency.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete from Vercel Blob
    try {
      await del(photo.blob_url);
    } catch (blobError) {
      console.error('Error deleting from blob storage:', blobError);
      // Continue with DB delete even if blob delete fails
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('customer_photos')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting photo from database:', deleteError);
      return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
    }

    // Update customer photo count
    const { data: customer } = await supabase
      .from('customers')
      .select('photo_count')
      .eq('id', photo.customer_id)
      .single();

    if (customer) {
      await supabase
        .from('customers')
        .update({ photo_count: Math.max(0, (customer.photo_count || 1) - 1) })
        .eq('id', photo.customer_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Photo delete error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
