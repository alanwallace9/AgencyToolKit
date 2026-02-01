'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Trophy, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PerformanceItem {
  id: string;
  name: string;
  href: string;
  primaryMetric: {
    label: string;
    value: number;
    formatted: string;
  };
  secondaryMetric?: {
    label: string;
    value: number;
    formatted: string;
  };
  progress?: {
    value: number;
    max: number;
  };
  trend?: 'up' | 'down' | 'neutral';
  status?: 'live' | 'draft' | 'archived';
}

interface PerformanceTableProps {
  title: string;
  description?: string;
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  items: PerformanceItem[];
  viewAllHref?: string;
  emptyMessage?: string;
  type?: 'top' | 'bottom';
  className?: string;
}

export function PerformanceTable({
  title,
  description,
  icon: Icon,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
  items,
  viewAllHref,
  emptyMessage = 'No data available',
  type = 'top',
  className,
}: PerformanceTableProps) {
  const isTopPerformers = type === 'top';

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', iconBg)}>
              <Icon className={cn('h-5 w-5', iconColor)} />
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              {description && (
                <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
              )}
            </div>
          </div>
          {isTopPerformers ? (
            <Trophy className="h-4 w-4 text-amber-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">{emptyMessage}</p>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <span className={cn(
                  'flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium',
                  isTopPerformers
                    ? index === 0
                      ? 'bg-amber-100 text-amber-700'
                      : index === 1
                      ? 'bg-zinc-100 text-zinc-600'
                      : index === 2
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-muted text-muted-foreground'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {item.name}
                    </p>
                    {item.status && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-[10px] px-1.5 py-0',
                          item.status === 'live' && 'bg-green-500/10 text-green-600',
                          item.status === 'draft' && 'bg-muted text-muted-foreground',
                          item.status === 'archived' && 'bg-zinc-500/10 text-zinc-500'
                        )}
                      >
                        {item.status}
                      </Badge>
                    )}
                  </div>
                  {item.progress && (
                    <div className="mt-1">
                      <Progress
                        value={(item.progress.value / item.progress.max) * 100}
                        className="h-1.5"
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-right">
                  <div>
                    <p className="text-sm font-semibold">{item.primaryMetric.formatted}</p>
                    <p className="text-[10px] text-muted-foreground">{item.primaryMetric.label}</p>
                  </div>
                  {item.trend && (
                    <div className={cn(
                      'p-1 rounded',
                      item.trend === 'up' && 'bg-green-50 text-green-600',
                      item.trend === 'down' && 'bg-red-50 text-red-600',
                      item.trend === 'neutral' && 'bg-muted text-muted-foreground'
                    )}>
                      {item.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                      {item.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
        {viewAllHref && items.length > 0 && (
          <Link
            href={viewAllHref}
            className="flex items-center justify-center gap-1 mt-4 pt-3 border-t text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
