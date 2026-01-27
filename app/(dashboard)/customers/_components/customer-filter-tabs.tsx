'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ProgressStatus } from '../page';

interface StatusCounts {
  all: number;
  completed: number;
  in_progress: number;
  not_started: number;
}

interface CustomerFilterTabsProps {
  tourId: string;
  currentStatus: ProgressStatus;
  statusCounts: StatusCounts;
}

const tabs: { value: ProgressStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'not_started', label: 'Not Started' },
];

export function CustomerFilterTabs({
  tourId,
  currentStatus,
  statusCounts,
}: CustomerFilterTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabChange = (status: ProgressStatus) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tour', tourId);
    if (status === 'all') {
      params.delete('status');
    } else {
      params.set('status', status);
    }
    router.push(`/customers?${params.toString()}`);
  };

  return (
    <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
      {tabs.map((tab) => {
        const count = statusCounts[tab.value];
        const isActive = currentStatus === tab.value;

        return (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            )}
          >
            {tab.label} ({count})
          </button>
        );
      })}
    </div>
  );
}
