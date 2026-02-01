'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Eye,
  CheckCircle2,
  MousePointerClick,
  Users,
  TrendingUp,
  Map,
  CheckSquare,
  Megaphone,
  Lightbulb,
  BarChart3,
  Target,
  AlertCircle,
  ArrowRight,
  Download,
} from 'lucide-react';
import { AnalyticsStatCard } from '@/components/guidely/analytics-stat-card';
import { PerformanceTable, type PerformanceItem } from '@/components/guidely/performance-table';
import { TimePeriodTabs, type TimePeriod, TIME_PERIOD_LABELS } from '@/components/guidely/time-period-tabs';
import { cn } from '@/lib/utils';

interface TourStats {
  id: string;
  name: string;
  status: string;
  views: number;
  completions: number;
  completionRate: number;
}

interface ChecklistStats {
  id: string;
  name: string;
  status: string;
  total: number;
  completed: number;
  inProgress: number;
}

interface BannerStats {
  id: string;
  name: string;
  status: string;
  views: number;
  clicks: number;
  ctr: number;
}

interface TipStats {
  id: string;
  name: string;
  status: string;
  views: number;
  interactions: number;
}

interface AnalyticsDashboardClientProps {
  tourStats: TourStats[];
  checklistStats: ChecklistStats[];
  bannerStats: BannerStats[];
  tipStats: TipStats[];
  totals: {
    totalViews: number;
    tourViews: number;
    tourCompletions: number;
    tourCompletionRate: number;
    checklistTotal: number;
    checklistCompleted: number;
    checklistInProgress: number;
    checklistCompletionRate: number;
    bannerViews: number;
    bannerClicks: number;
    bannerCTR: number;
    tipViews: number;
    tipInteractions: number;
  };
}

export function AnalyticsDashboardClient({
  tourStats,
  checklistStats,
  bannerStats,
  tipStats,
  totals,
}: AnalyticsDashboardClientProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');

  // Transform tours to performance items
  const topTours: PerformanceItem[] = tourStats
    .filter(t => t.status === 'live')
    .sort((a, b) => b.completions - a.completions)
    .slice(0, 5)
    .map(tour => ({
      id: tour.id,
      name: tour.name,
      href: `/g/tours/${tour.id}`,
      primaryMetric: {
        label: 'completions',
        value: tour.completions,
        formatted: tour.completions.toLocaleString(),
      },
      secondaryMetric: {
        label: 'views',
        value: tour.views,
        formatted: tour.views.toLocaleString(),
      },
      progress: {
        value: tour.completions,
        max: tour.views || 1,
      },
      status: tour.status as 'live' | 'draft' | 'archived',
    }));

  const lowPerformingTours: PerformanceItem[] = tourStats
    .filter(t => t.status === 'live' && t.views > 0 && t.completionRate < 30)
    .sort((a, b) => a.completionRate - b.completionRate)
    .slice(0, 3)
    .map(tour => ({
      id: tour.id,
      name: tour.name,
      href: `/g/tours/${tour.id}`,
      primaryMetric: {
        label: 'completion rate',
        value: tour.completionRate,
        formatted: `${tour.completionRate}%`,
      },
      trend: 'down',
      status: tour.status as 'live' | 'draft' | 'archived',
    }));

  // Transform checklists to performance items
  const topChecklists: PerformanceItem[] = checklistStats
    .filter(c => c.status === 'live')
    .sort((a, b) => b.completed - a.completed)
    .slice(0, 5)
    .map(checklist => ({
      id: checklist.id,
      name: checklist.name,
      href: `/g/checklists/${checklist.id}`,
      primaryMetric: {
        label: 'completed',
        value: checklist.completed,
        formatted: checklist.completed.toLocaleString(),
      },
      progress: {
        value: checklist.completed,
        max: checklist.total || 1,
      },
      status: checklist.status as 'live' | 'draft' | 'archived',
    }));

  // Transform banners to performance items
  const topBanners: PerformanceItem[] = bannerStats
    .filter(b => b.status === 'live')
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5)
    .map(banner => ({
      id: banner.id,
      name: banner.name,
      href: `/g/banners/${banner.id}`,
      primaryMetric: {
        label: 'clicks',
        value: banner.clicks,
        formatted: banner.clicks.toLocaleString(),
      },
      secondaryMetric: {
        label: 'CTR',
        value: banner.ctr,
        formatted: `${banner.ctr}%`,
      },
      status: banner.status as 'live' | 'draft' | 'archived',
    }));

  const lowPerformingBanners: PerformanceItem[] = bannerStats
    .filter(b => b.status === 'live' && b.views > 10 && b.ctr < 2)
    .sort((a, b) => a.ctr - b.ctr)
    .slice(0, 3)
    .map(banner => ({
      id: banner.id,
      name: banner.name,
      href: `/g/banners/${banner.id}`,
      primaryMetric: {
        label: 'CTR',
        value: banner.ctr,
        formatted: `${banner.ctr}%`,
      },
      trend: 'down',
      status: banner.status as 'live' | 'draft' | 'archived',
    }));

  const hasLowPerformers = lowPerformingTours.length > 0 || lowPerformingBanners.length > 0;

  return (
    <div className="space-y-8">
      {/* Time Period Selector */}
      <div className="flex items-center justify-between">
        <TimePeriodTabs value={timePeriod} onChange={setTimePeriod} />
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsStatCard
          title="Total Views"
          value={totals.totalViews.toLocaleString()}
          subtitle="Across all features"
          icon={Eye}
          iconColor="text-blue-500"
          iconBg="bg-blue-500/10"
        />
        <AnalyticsStatCard
          title="Tour Completions"
          value={totals.tourCompletions.toLocaleString()}
          subtitle={`${totals.tourCompletionRate}% completion rate`}
          icon={CheckCircle2}
          iconColor="text-green-500"
          iconBg="bg-green-500/10"
        />
        <AnalyticsStatCard
          title="Checklist Progress"
          value={totals.checklistCompleted.toLocaleString()}
          subtitle={`${totals.checklistInProgress} in progress`}
          icon={Users}
          iconColor="text-purple-500"
          iconBg="bg-purple-500/10"
        />
        <AnalyticsStatCard
          title="Banner CTR"
          value={`${totals.bannerCTR}%`}
          subtitle={`${totals.bannerClicks} clicks from ${totals.bannerViews} views`}
          icon={MousePointerClick}
          iconColor="text-amber-500"
          iconBg="bg-amber-500/10"
        />
      </div>

      {/* Needs Improvement Section */}
      {hasLowPerformers && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <CardTitle className="text-base text-amber-900">Needs Improvement</CardTitle>
            </div>
            <CardDescription className="text-amber-700">
              These items have low engagement and could use some attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {lowPerformingTours.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-amber-800 flex items-center gap-1.5">
                    <Map className="h-3.5 w-3.5" />
                    Tours with low completion ({`<30%`})
                  </p>
                  {lowPerformingTours.map(tour => (
                    <Link
                      key={tour.id}
                      href={tour.href}
                      className="flex items-center justify-between p-2 bg-white/80 rounded-md hover:bg-white transition-colors group"
                    >
                      <span className="text-sm font-medium truncate group-hover:text-primary">
                        {tour.name}
                      </span>
                      <span className="text-sm text-amber-700 font-medium">
                        {tour.primaryMetric.formatted}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
              {lowPerformingBanners.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-amber-800 flex items-center gap-1.5">
                    <Megaphone className="h-3.5 w-3.5" />
                    Banners with low CTR ({`<2%`})
                  </p>
                  {lowPerformingBanners.map(banner => (
                    <Link
                      key={banner.id}
                      href={banner.href}
                      className="flex items-center justify-between p-2 bg-white/80 rounded-md hover:bg-white transition-colors group"
                    >
                      <span className="text-sm font-medium truncate group-hover:text-primary">
                        {banner.name}
                      </span>
                      <span className="text-sm text-amber-700 font-medium">
                        {banner.primaryMetric.formatted}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Breakdown */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Feature Breakdown</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Tours Summary */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Map className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-sm">Tours</CardTitle>
                  <CardDescription className="text-xs">
                    {tourStats.filter(t => t.status === 'live').length} live
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Views</span>
                <span className="font-medium">{totals.tourViews.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completions</span>
                <span className="font-medium">{totals.tourCompletions.toLocaleString()}</span>
              </div>
              <Progress value={totals.tourCompletionRate} className="h-1.5" />
              <p className="text-xs text-muted-foreground text-right">{totals.tourCompletionRate}% rate</p>
            </CardContent>
          </Card>

          {/* Checklists Summary */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckSquare className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <CardTitle className="text-sm">Checklists</CardTitle>
                  <CardDescription className="text-xs">
                    {checklistStats.filter(c => c.status === 'live').length} live
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Users</span>
                <span className="font-medium">{totals.checklistTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium">{totals.checklistCompleted.toLocaleString()}</span>
              </div>
              <Progress value={totals.checklistCompletionRate} className="h-1.5" />
              <p className="text-xs text-muted-foreground text-right">{totals.checklistCompletionRate}% rate</p>
            </CardContent>
          </Card>

          {/* Banners Summary */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Megaphone className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <CardTitle className="text-sm">Banners</CardTitle>
                  <CardDescription className="text-xs">
                    {bannerStats.filter(b => b.status === 'live').length} live
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Views</span>
                <span className="font-medium">{totals.bannerViews.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Clicks</span>
                <span className="font-medium">{totals.bannerClicks.toLocaleString()}</span>
              </div>
              <Progress value={totals.bannerCTR} className="h-1.5" />
              <p className="text-xs text-muted-foreground text-right">{totals.bannerCTR}% CTR</p>
            </CardContent>
          </Card>

          {/* Smart Tips Summary */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                </div>
                <div>
                  <CardTitle className="text-sm">Smart Tips</CardTitle>
                  <CardDescription className="text-xs">
                    {tipStats.filter(t => t.status === 'live').length} live
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Displays</span>
                <span className="font-medium">{totals.tipViews.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Interactions</span>
                <span className="font-medium">{totals.tipInteractions.toLocaleString()}</span>
              </div>
              <div className="h-1.5" />
              <p className="text-xs text-muted-foreground text-right">&nbsp;</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Performers */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Top Performers</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <PerformanceTable
            title="Tours"
            description="By completions"
            icon={Map}
            iconColor="text-blue-500"
            iconBg="bg-blue-500/10"
            items={topTours}
            viewAllHref="/g/tours"
            emptyMessage="No live tours yet"
            type="top"
          />
          <PerformanceTable
            title="Checklists"
            description="By completions"
            icon={CheckSquare}
            iconColor="text-green-500"
            iconBg="bg-green-500/10"
            items={topChecklists}
            viewAllHref="/g/checklists"
            emptyMessage="No live checklists yet"
            type="top"
          />
          <PerformanceTable
            title="Banners"
            description="By clicks"
            icon={Megaphone}
            iconColor="text-purple-500"
            iconBg="bg-purple-500/10"
            items={topBanners}
            viewAllHref="/g/banners"
            emptyMessage="No live banners yet"
            type="top"
          />
        </div>
      </div>

      {/* Coming Soon */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
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
