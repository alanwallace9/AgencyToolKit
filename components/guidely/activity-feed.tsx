'use client';

import Link from 'next/link';
import { Map, CheckSquare, Lightbulb, Megaphone, Palette, Eye, Trophy, Send, Archive, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export type ActivityType =
  | 'published'
  | 'unpublished'
  | 'created'
  | 'archived'
  | 'updated'
  | 'milestone'
  | 'theme_created';

export type ItemCategory = 'tour' | 'checklist' | 'tip' | 'banner' | 'theme';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  category: ItemCategory;
  itemId: string;
  itemName: string;
  timestamp: string;
  metadata?: {
    milestone?: string;
    viewCount?: number;
  };
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  className?: string;
  limit?: number;
}

const categoryIcons: Record<ItemCategory, typeof Map> = {
  tour: Map,
  checklist: CheckSquare,
  tip: Lightbulb,
  banner: Megaphone,
  theme: Palette,
};

const categoryColors: Record<ItemCategory, string> = {
  tour: 'text-blue-500',
  checklist: 'text-green-500',
  tip: 'text-yellow-500',
  banner: 'text-purple-500',
  theme: 'text-pink-500',
};

const categoryLinks: Record<ItemCategory, string> = {
  tour: '/g/tours',
  checklist: '/g/checklists',
  tip: '/g/tips',
  banner: '/g/banners',
  theme: '/g/themes',
};

const actionIcons: Record<ActivityType, typeof Send> = {
  published: Send,
  unpublished: Archive,
  created: Pencil,
  archived: Archive,
  updated: Pencil,
  milestone: Trophy,
  theme_created: Palette,
};

function getActivityMessage(activity: ActivityItem): string {
  switch (activity.type) {
    case 'published':
      return 'published';
    case 'unpublished':
      return 'unpublished';
    case 'created':
      return 'created';
    case 'archived':
      return 'archived';
    case 'updated':
      return 'updated';
    case 'milestone':
      return activity.metadata?.milestone || 'reached a milestone';
    case 'theme_created':
      return 'created';
    default:
      return 'updated';
  }
}

export function ActivityFeed({ activities, className, limit = 5 }: ActivityFeedProps) {
  const displayActivities = activities.slice(0, limit);

  if (displayActivities.length === 0) {
    return (
      <div className={cn('text-center py-8 text-muted-foreground', className)}>
        <p className="text-sm">No recent activity</p>
        <p className="text-xs mt-1">Your activity will show up here</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      {displayActivities.map((activity) => {
        const CategoryIcon = categoryIcons[activity.category];
        const categoryColor = categoryColors[activity.category];
        const link = `${categoryLinks[activity.category]}/${activity.itemId}`;

        return (
          <Link
            key={activity.id}
            href={link}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <div className={cn('p-1.5 rounded-md bg-muted/50', categoryColor)}>
              <CategoryIcon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-medium group-hover:text-primary transition-colors truncate">
                  "{activity.itemName}"
                </span>
                <span className="text-muted-foreground ml-1">
                  {getActivityMessage(activity)}
                </span>
              </p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
