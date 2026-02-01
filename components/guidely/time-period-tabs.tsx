'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type TimePeriod = '7d' | '30d' | 'all';

interface TimePeriodTabsProps {
  value: TimePeriod;
  onChange: (value: TimePeriod) => void;
  className?: string;
}

export const TIME_PERIOD_LABELS: Record<TimePeriod, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  'all': 'All time',
};

export function TimePeriodTabs({ value, onChange, className }: TimePeriodTabsProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as TimePeriod)} className={className}>
      <TabsList className="grid w-full grid-cols-3 max-w-xs">
        <TabsTrigger value="7d" className="text-xs">7 Days</TabsTrigger>
        <TabsTrigger value="30d" className="text-xs">30 Days</TabsTrigger>
        <TabsTrigger value="all" className="text-xs">All Time</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
