import { getCurrentAgency } from '@/lib/auth';
import { getTours } from '@/app/(dashboard)/tours/_actions/tour-actions';
import { getChecklistsWithStats } from '@/app/(dashboard)/tours/_actions/checklist-actions';
import { getBannersWithStats } from '@/app/(dashboard)/tours/_actions/banner-actions';
import { getSmartTipsWithStats } from '@/app/(dashboard)/tours/_actions/smart-tip-actions';
import { AnalyticsDashboardClient } from './_components/analytics-dashboard-client';

export default async function GuidelyAnalyticsPage() {
  const agency = await getCurrentAgency();
  if (!agency) return null;

  const [tours, checklists, banners, tips] = await Promise.all([
    getTours(),
    getChecklistsWithStats(),
    getBannersWithStats(),
    getSmartTipsWithStats(),
  ]);

  // Transform tours data
  const tourStats = tours.map(t => ({
    id: t.id,
    name: t.name,
    status: t.status,
    views: t.stats?.views || 0,
    completions: t.stats?.completions || 0,
    completionRate: t.stats?.views && t.stats.views > 0
      ? Math.round((t.stats.completions || 0) / t.stats.views * 100)
      : 0,
  }));

  // Transform checklists data
  const checklistStatsData = checklists.map(c => ({
    id: c.id,
    name: c.name,
    status: c.status,
    total: c.stats?.total_customers || 0,
    completed: c.stats?.completed || 0,
    inProgress: c.stats?.in_progress || 0,
  }));

  // Transform banners data
  const bannerStats = banners.map(b => ({
    id: b.id,
    name: b.name,
    status: b.status,
    views: b.view_count || 0,
    clicks: b.click_count || 0,
    ctr: b.view_count && b.view_count > 0
      ? Math.round((b.click_count || 0) / b.view_count * 100)
      : 0,
  }));

  // Transform tips data
  const tipStats = tips.map(t => ({
    id: t.id,
    name: t.name,
    status: t.status,
    views: 0, // Smart tips don't have view tracking yet
    interactions: 0,
  }));

  // Calculate totals
  const tourViews = tourStats.reduce((sum, t) => sum + t.views, 0);
  const tourCompletions = tourStats.reduce((sum, t) => sum + t.completions, 0);
  const tourCompletionRate = tourViews > 0 ? Math.round((tourCompletions / tourViews) * 100) : 0;

  const checklistTotal = checklistStatsData.reduce((sum, c) => sum + c.total, 0);
  const checklistCompleted = checklistStatsData.reduce((sum, c) => sum + c.completed, 0);
  const checklistInProgress = checklistStatsData.reduce((sum, c) => sum + c.inProgress, 0);
  const checklistCompletionRate = checklistTotal > 0
    ? Math.round((checklistCompleted / checklistTotal) * 100)
    : 0;

  const bannerViews = bannerStats.reduce((sum, b) => sum + b.views, 0);
  const bannerClicks = bannerStats.reduce((sum, b) => sum + b.clicks, 0);
  const bannerCTR = bannerViews > 0 ? Math.round((bannerClicks / bannerViews) * 100) : 0;

  const tipViews = tipStats.reduce((sum, t) => sum + t.views, 0);
  const tipInteractions = tipStats.reduce((sum, t) => sum + t.interactions, 0);

  const totals = {
    totalViews: tourViews + bannerViews,
    tourViews,
    tourCompletions,
    tourCompletionRate,
    checklistTotal,
    checklistCompleted,
    checklistInProgress,
    checklistCompletionRate,
    bannerViews,
    bannerClicks,
    bannerCTR,
    tipViews,
    tipInteractions,
  };

  return (
    <div className="h-full overflow-auto py-8 px-8 lg:px-14">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Overview of your Guidely engagement and performance
          </p>
        </div>

        <AnalyticsDashboardClient
          tourStats={tourStats}
          checklistStats={checklistStatsData}
          bannerStats={bannerStats}
          tipStats={tipStats}
          totals={totals}
        />
      </div>
    </div>
  );
}
