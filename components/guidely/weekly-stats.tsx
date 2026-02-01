'use client';

import { Eye, CheckCircle2, TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WeeklyStatsData {
  totalViews: number;
  completions: number;
  avgCompletionRate: number;
  weekOverWeekChange: number;
}

interface WeeklyStatsProps {
  stats: WeeklyStatsData;
  className?: string;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

export function WeeklyStats({ stats, className }: WeeklyStatsProps) {
  const TrendIcon = stats.weekOverWeekChange > 0
    ? TrendingUp
    : stats.weekOverWeekChange < 0
    ? TrendingDown
    : Minus;

  const trendColor = stats.weekOverWeekChange > 0
    ? 'text-green-600'
    : stats.weekOverWeekChange < 0
    ? 'text-red-600'
    : 'text-muted-foreground';

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      <StatCard
        label="Total Views"
        value={formatNumber(stats.totalViews)}
        icon={Eye}
        iconColor="text-blue-500"
        iconBg="bg-blue-500/10"
      />
      <StatCard
        label="Completions"
        value={formatNumber(stats.completions)}
        icon={CheckCircle2}
        iconColor="text-green-500"
        iconBg="bg-green-500/10"
      />
      <StatCard
        label="Avg. Rate"
        value={`${stats.avgCompletionRate}%`}
        icon={BarChart3}
        iconColor="text-purple-500"
        iconBg="bg-purple-500/10"
      />
      <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
        <div className={cn('p-2 rounded-lg', stats.weekOverWeekChange >= 0 ? 'bg-green-500/10' : 'bg-red-500/10')}>
          <TrendIcon className={cn('h-5 w-5', trendColor)} />
        </div>
        <div>
          <p className={cn('text-lg font-semibold', trendColor)}>
            {stats.weekOverWeekChange > 0 ? '+' : ''}{stats.weekOverWeekChange}%
          </p>
          <p className="text-xs text-muted-foreground">vs last week</p>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: typeof Eye;
  iconColor: string;
  iconBg: string;
}

function StatCard({ label, value, icon: Icon, iconColor, iconBg }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
      <div className={cn('p-2 rounded-lg', iconBg)}>
        <Icon className={cn('h-5 w-5', iconColor)} />
      </div>
      <div>
        <p className="text-lg font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function WeeklyStatsEmpty() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: 'Total Views', icon: Eye, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Completions', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
        { label: 'Avg. Rate', icon: BarChart3, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { label: 'vs last week', icon: TrendingUp, color: 'text-muted-foreground', bg: 'bg-muted' },
      ].map((stat, index) => (
        <div key={index} className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
          <div className={cn('p-2 rounded-lg', stat.bg)}>
            <stat.icon className={cn('h-5 w-5', stat.color)} />
          </div>
          <div>
            <p className="text-lg font-semibold text-muted-foreground">—</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
