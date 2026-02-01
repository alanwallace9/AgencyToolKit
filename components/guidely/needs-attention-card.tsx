'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, FileText, Eye, Clock, Trash2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AttentionItemType = 'old-drafts' | 'no-views' | 'engagement-drop' | 'old-archived';

interface AttentionItem {
  type: AttentionItemType;
  title: string;
  description: string;
  count?: number;
  itemName?: string;
  link: string;
  linkText: string;
}

interface NeedsAttentionCardProps {
  items: AttentionItem[];
  className?: string;
}

const iconMap: Record<AttentionItemType, typeof FileText> = {
  'old-drafts': FileText,
  'no-views': Eye,
  'engagement-drop': AlertTriangle,
  'old-archived': Trash2,
};

const colorMap: Record<AttentionItemType, { bg: string; icon: string; border: string }> = {
  'old-drafts': { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-200' },
  'no-views': { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-200' },
  'engagement-drop': { bg: 'bg-red-50', icon: 'text-red-600', border: 'border-red-200' },
  'old-archived': { bg: 'bg-zinc-50', icon: 'text-zinc-600', border: 'border-zinc-200' },
};

export function NeedsAttentionCard({ items, className }: NeedsAttentionCardProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <h3 className="font-semibold text-sm">Needs Attention</h3>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, 3).map((item, index) => {
          const Icon = iconMap[item.type];
          const colors = colorMap[item.type];

          return (
            <Link key={index} href={item.link}>
              <Card className={cn(
                'hover:shadow-md transition-all duration-200 cursor-pointer h-full border',
                colors.bg,
                colors.border
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn('p-2 rounded-lg', colors.bg)}>
                      <Icon className={cn('h-4 w-4', colors.icon)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                        <span>{item.linkText}</span>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function NeedsAttentionEmpty() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      <p className="text-sm text-green-700">
        All caught up! No items need attention right now.
      </p>
    </div>
  );
}
