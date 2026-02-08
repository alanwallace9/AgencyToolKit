'use server';

import { requireSuperAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export interface FeedbackSummary {
  article_id: string;
  helpful_count: number;
  not_helpful_count: number;
  total: number;
  score: number;
  last_feedback: string;
}

export interface FeedbackEntry {
  id: string;
  article_id: string;
  helpful: boolean;
  comment: string | null;
  clerk_user_id: string | null;
  agency_name: string | null;
  created_at: string;
}

export async function getFeedbackSummary(): Promise<FeedbackSummary[]> {
  await requireSuperAdmin();

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('get_feedback_summary');

  if (error) {
    // If RPC doesn't exist yet, fall back to raw query via manual aggregation
    const { data: rawData, error: rawError } = await supabase
      .from('help_feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (rawError || !rawData) return [];

    // Aggregate in JS
    const grouped: Record<string, { helpful: number; notHelpful: number; lastFeedback: string }> = {};
    for (const row of rawData) {
      if (!grouped[row.article_id]) {
        grouped[row.article_id] = { helpful: 0, notHelpful: 0, lastFeedback: row.created_at };
      }
      if (row.helpful) {
        grouped[row.article_id].helpful++;
      } else {
        grouped[row.article_id].notHelpful++;
      }
      if (row.created_at > grouped[row.article_id].lastFeedback) {
        grouped[row.article_id].lastFeedback = row.created_at;
      }
    }

    return Object.entries(grouped).map(([article_id, stats]) => ({
      article_id,
      helpful_count: stats.helpful,
      not_helpful_count: stats.notHelpful,
      total: stats.helpful + stats.notHelpful,
      score: stats.helpful + stats.notHelpful > 0
        ? Math.round((stats.helpful / (stats.helpful + stats.notHelpful)) * 100)
        : 0,
      last_feedback: stats.lastFeedback,
    }));
  }

  return data || [];
}

export async function getFeedbackDetail(articleId: string): Promise<FeedbackEntry[]> {
  await requireSuperAdmin();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('help_feedback')
    .select('*')
    .eq('article_id', articleId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to get feedback detail:', error);
    return [];
  }

  return data || [];
}
