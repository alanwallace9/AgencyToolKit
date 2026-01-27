import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentAgency } from '@/lib/auth';
import { getTours } from '@/app/(dashboard)/tours/_actions/tour-actions';
import { getChecklistsWithStats } from '@/app/(dashboard)/tours/_actions/checklist-actions';
import { getBannersWithStats } from '@/app/(dashboard)/tours/_actions/banner-actions';
import {
  BarChart3,
  Eye,
  CheckCircle2,
  MousePointerClick,
  Users,
  TrendingUp,
  Route,
  CheckSquare,
  Megaphone
} from 'lucide-react';

export default async function GuidelyAnalyticsPage() {
  const agency = await getCurrentAgency();
  if (!agency) return null;

  const [tours, checklists, banners] = await Promise.all([
    getTours(),
    getChecklistsWithStats(),
    getBannersWithStats(),
  ]);

  // Calculate tour stats
  const liveTours = tours.filter(t => t.status === 'live');
  const tourViews = tours.reduce((sum, t) => sum + (t.stats?.views || 0), 0);
  const tourCompletions = tours.reduce((sum, t) => sum + (t.stats?.completions || 0), 0);
  const tourCompletionRate = tourViews > 0 ? Math.round((tourCompletions / tourViews) * 100) : 0;

  // Calculate checklist stats
  const liveChecklists = checklists.filter(c => c.status === 'live');
  const checklistStats = checklists.reduce((acc, c) => {
    if (c.stats) {
      acc.total += c.stats.total_customers || 0;
      acc.completed += c.stats.completed || 0;
      acc.inProgress += c.stats.in_progress || 0;
    }
    return acc;
  }, { total: 0, completed: 0, inProgress: 0 });
  const checklistCompletionRate = checklistStats.total > 0
    ? Math.round((checklistStats.completed / checklistStats.total) * 100)
    : 0;

  // Calculate banner stats
  const liveBanners = banners.filter(b => b.status === 'live');
  const bannerViews = banners.reduce((sum, b) => sum + (b.view_count || 0), 0);
  const bannerClicks = banners.reduce((sum, b) => sum + (b.click_count || 0), 0);
  const bannerCTR = bannerViews > 0 ? Math.round((bannerClicks / bannerViews) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Overview of your Guidely engagement and performance
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tourViews + bannerViews}</div>
            <p className="text-xs text-muted-foreground">
              Across tours and banners
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tour Completions</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tourCompletions}</div>
            <p className="text-xs text-muted-foreground">
              {tourCompletionRate}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checklist Progress</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checklistStats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {checklistCompletionRate}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banner CTR</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bannerCTR}%</div>
            <p className="text-xs text-muted-foreground">
              {bannerClicks} clicks from {bannerViews} views
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Tours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5 text-primary" />
              Tours
            </CardTitle>
            <CardDescription>
              {liveTours.length} live • {tours.length} total
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Views</span>
                <span className="font-medium">{tourViews}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completions</span>
                <span className="font-medium">{tourCompletions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completion Rate</span>
                <span className="font-medium">{tourCompletionRate}%</span>
              </div>
            </div>
            {tours.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">Top performing</p>
                {tours
                  .filter(t => t.status === 'live')
                  .sort((a, b) => (b.stats?.completions || 0) - (a.stats?.completions || 0))
                  .slice(0, 3)
                  .map(tour => (
                    <div key={tour.id} className="flex justify-between text-sm py-1">
                      <span className="truncate flex-1">{tour.name}</span>
                      <span className="text-muted-foreground ml-2">{tour.stats?.completions || 0}</span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Checklists */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              Checklists
            </CardTitle>
            <CardDescription>
              {liveChecklists.length} live • {checklists.length} total
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Customers</span>
                <span className="font-medium">{checklistStats.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium">{checklistStats.completed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">In Progress</span>
                <span className="font-medium">{checklistStats.inProgress}</span>
              </div>
            </div>
            {checklists.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">Top performing</p>
                {checklists
                  .filter(c => c.status === 'live')
                  .sort((a, b) => (b.stats?.completed || 0) - (a.stats?.completed || 0))
                  .slice(0, 3)
                  .map(checklist => (
                    <div key={checklist.id} className="flex justify-between text-sm py-1">
                      <span className="truncate flex-1">{checklist.name}</span>
                      <span className="text-muted-foreground ml-2">
                        {checklist.stats?.completed || 0}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Banners */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              Banners
            </CardTitle>
            <CardDescription>
              {liveBanners.length} live • {banners.length} total
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Views</span>
                <span className="font-medium">{bannerViews}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Clicks</span>
                <span className="font-medium">{bannerClicks}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Click-through Rate</span>
                <span className="font-medium">{bannerCTR}%</span>
              </div>
            </div>
            {banners.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">Top performing</p>
                {banners
                  .filter(b => b.status === 'live')
                  .sort((a, b) => (b.click_count || 0) - (a.click_count || 0))
                  .slice(0, 3)
                  .map(banner => (
                    <div key={banner.id} className="flex justify-between text-sm py-1">
                      <span className="truncate flex-1">{banner.name}</span>
                      <span className="text-muted-foreground ml-2">{banner.click_count || 0}</span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon - Customer Progress */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            Customer Progress Tracking
          </CardTitle>
          <CardDescription>
            Per-customer onboarding progress • Coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Track individual customer progress through tours and checklists.
            Identify customers who are stuck and need follow-up.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
