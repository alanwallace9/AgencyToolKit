'use server';

import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function submitFeedback(articleId: string, helpful: boolean) {
  // Validate articleId format (alphanumeric + hyphens only)
  if (!/^[a-z0-9-]+$/.test(articleId)) {
    return { success: false, error: 'Invalid article ID' };
  }

  const { userId } = await auth();

  // Get agency name for admin context
  let agencyName: string | null = null;
  if (userId) {
    const supabase = createAdminClient();
    const { data: agency } = await supabase
      .from('agencies')
      .select('name')
      .eq('clerk_user_id', userId)
      .single();
    agencyName = agency?.name ?? null;
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('help_feedback').insert({
    article_id: articleId,
    helpful,
    clerk_user_id: userId,
    agency_name: agencyName,
  });

  if (error) {
    console.error('Failed to submit feedback:', error);
    return { success: false, error: 'Failed to save feedback' };
  }

  return { success: true };
}
