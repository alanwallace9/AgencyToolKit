'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Shield,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  ArrowUpDown,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  type FeedbackSummary,
  type FeedbackEntry,
  getFeedbackDetail,
} from '../_actions/admin-feedback-actions';
import { getArticleTitle, getArticleHref } from '../_lib/article-titles';
import { formatDistanceToNow } from 'date-fns';

interface AdminFeedbackClientProps {
  initialFeedback: FeedbackSummary[];
}

type SortField = 'score' | 'total' | 'last_feedback';
type SortDir = 'asc' | 'desc';

export function AdminFeedbackClient({ initialFeedback }: AdminFeedbackClientProps) {
  const [feedback] = React.useState(initialFeedback);
  const [sortField, setSortField] = React.useState<SortField>('score');
  const [sortDir, setSortDir] = React.useState<SortDir>('asc');
  const [expandedArticle, setExpandedArticle] = React.useState<string | null>(null);
  const [detailEntries, setDetailEntries] = React.useState<FeedbackEntry[]>([]);
  const [loadingDetail, setLoadingDetail] = React.useState(false);

  const sorted = React.useMemo(() => {
    return [...feedback].sort((a, b) => {
      const mult = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'score') return (a.score - b.score) * mult;
      if (sortField === 'total') return (a.total - b.total) * mult;
      return (new Date(a.last_feedback).getTime() - new Date(b.last_feedback).getTime()) * mult;
    });
  }, [feedback, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir(field === 'score' ? 'asc' : 'desc');
    }
  };

  const toggleExpand = async (articleId: string) => {
    if (expandedArticle === articleId) {
      setExpandedArticle(null);
      setDetailEntries([]);
      return;
    }

    setExpandedArticle(articleId);
    setLoadingDetail(true);
    const entries = await getFeedbackDetail(articleId);
    setDetailEntries(entries);
    setLoadingDetail(false);
  };

  const totalFeedback = feedback.reduce((sum, f) => sum + f.total, 0);
  const totalHelpful = feedback.reduce((sum, f) => sum + f.helpful_count, 0);
  const overallScore = totalFeedback > 0 ? Math.round((totalHelpful / totalFeedback) * 100) : 0;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-5 w-5 text-violet-500" />
          <h1 className="text-xl font-semibold tracking-tight">Admin Panel</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Platform admin tools — only visible to super admins.
        </p>
      </div>

      {/* Section: Help Feedback */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-semibold">Help Article Feedback</h2>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground mb-1">Total Responses</p>
            <p className="text-2xl font-semibold tabular-nums">{totalFeedback}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground mb-1">Articles Rated</p>
            <p className="text-2xl font-semibold tabular-nums">{feedback.length}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground mb-1">Overall Score</p>
            <p className={cn(
              'text-2xl font-semibold tabular-nums',
              overallScore >= 70 ? 'text-green-600' : overallScore >= 40 ? 'text-amber-600' : 'text-red-600'
            )}>
              {totalFeedback > 0 ? `${overallScore}%` : '—'}
            </p>
          </div>
        </div>

        {/* Empty state */}
        {feedback.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No feedback yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Feedback will appear here as users rate help articles.
            </p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/help">View Help Center</Link>
            </Button>
          </div>
        ) : (
          /* Feedback table */
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                    Article
                  </th>
                  <th className="text-center px-3 py-2.5 font-medium text-muted-foreground w-16">
                    <ThumbsUp className="h-3.5 w-3.5 mx-auto" />
                  </th>
                  <th className="text-center px-3 py-2.5 font-medium text-muted-foreground w-16">
                    <ThumbsDown className="h-3.5 w-3.5 mx-auto" />
                  </th>
                  <th className="px-3 py-2.5 w-32">
                    <button
                      onClick={() => toggleSort('score')}
                      className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground transition-colors mx-auto"
                    >
                      Score
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-3 py-2.5 w-20">
                    <button
                      onClick={() => toggleSort('total')}
                      className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground transition-colors mx-auto"
                    >
                      Total
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-3 py-2.5 text-right w-28">
                    <button
                      onClick={() => toggleSort('last_feedback')}
                      className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground transition-colors ml-auto"
                    >
                      Last
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => (
                  <React.Fragment key={row.article_id}>
                    <tr
                      className="border-b last:border-0 hover:bg-muted/20 cursor-pointer transition-colors"
                      onClick={() => toggleExpand(row.article_id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {expandedArticle === row.article_id ? (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className="font-medium">{getArticleTitle(row.article_id)}</span>
                          {row.score < 50 && row.total >= 2 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-300 text-amber-600 bg-amber-50">
                              <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                              Needs attention
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center tabular-nums text-green-600">
                        {row.helpful_count}
                      </td>
                      <td className="px-3 py-3 text-center tabular-nums text-red-500">
                        {row.not_helpful_count}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2 justify-center">
                          {/* Score bar */}
                          <div className="w-16 h-2 rounded-full bg-red-100 overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                row.score >= 70 ? 'bg-green-500' : row.score >= 40 ? 'bg-amber-400' : 'bg-red-400'
                              )}
                              style={{ width: `${row.score}%` }}
                            />
                          </div>
                          <span className={cn(
                            'text-xs font-medium tabular-nums w-8 text-right',
                            row.score >= 70 ? 'text-green-600' : row.score >= 40 ? 'text-amber-600' : 'text-red-500'
                          )}>
                            {row.score}%
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center tabular-nums text-muted-foreground">
                        {row.total}
                      </td>
                      <td className="px-3 py-3 text-right text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(row.last_feedback), { addSuffix: true })}
                      </td>
                    </tr>

                    {/* Expanded detail */}
                    {expandedArticle === row.article_id && (
                      <tr>
                        <td colSpan={6} className="bg-muted/10 px-4 py-3 border-b">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground font-medium">
                                Individual responses
                              </span>
                              <Link
                                href={getArticleHref(row.article_id)}
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                View article <ExternalLink className="h-3 w-3" />
                              </Link>
                            </div>
                            {loadingDetail ? (
                              <p className="text-xs text-muted-foreground">Loading...</p>
                            ) : detailEntries.length === 0 ? (
                              <p className="text-xs text-muted-foreground">No entries found.</p>
                            ) : (
                              <div className="space-y-2">
                                {detailEntries.map((entry) => (
                                  <div
                                    key={entry.id}
                                    className="flex items-center gap-3 text-xs py-1.5 px-2 rounded bg-background border"
                                  >
                                    {entry.helpful ? (
                                      <ThumbsUp className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                                    ) : (
                                      <ThumbsDown className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                                    )}
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                      <User className="h-3 w-3" />
                                      <span>{entry.agency_name || 'Unknown'}</span>
                                    </div>
                                    {entry.comment && (
                                      <span className="text-foreground truncate flex-1">
                                        &quot;{entry.comment}&quot;
                                      </span>
                                    )}
                                    <span className="text-muted-foreground/60 ml-auto flex-shrink-0">
                                      {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
