'use client';

import Link from 'next/link';
import { Sparkles, FileText, ChevronRight, Crown } from 'lucide-react';
import { HelpBreadcrumb } from '../_components/help-breadcrumb';
import { Badge } from '@/components/ui/badge';

const articles = [
  {
    title: 'Creating your first tour',
    href: '/help/guidely/first-tour',
    description: 'Build an onboarding tour for new users',
  },
  {
    title: 'Building checklists',
    href: '/help/guidely/checklists',
    description: 'Guide users with interactive task lists',
  },
  {
    title: 'Smart Tips',
    href: '/help/guidely/smart-tips',
    description: 'Add contextual tooltips throughout GHL',
  },
  {
    title: 'Banners & announcements',
    href: '/help/guidely/banners',
    description: 'Display important messages to users',
  },
  {
    title: 'Themes & styling',
    href: '/help/guidely/themes',
    description: 'Customize the look of your Guidely features',
  },
  {
    title: 'Analytics Dashboard',
    href: '/help/guidely/analytics',
    description: 'Track performance across all Guidely features',
  },
];

export default function GuidelyPage() {
  return (
    <div className="space-y-6">
      <HelpBreadcrumb
        items={[{ label: 'Guidely' }]}
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-500/10">
          <Sparkles className="h-5 w-5 text-amber-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Guidely</h1>
            <Badge
              variant="outline"
              className="h-5 px-1.5 text-[10px] font-semibold bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-500/30"
            >
              <Crown className="h-2.5 w-2.5 mr-0.5" />
              PRO
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Tours, checklists, tips & banners for user onboarding
          </p>
        </div>
      </div>

      {/* Articles */}
      <div className="space-y-2">
        {articles.map((article) => (
          <Link
            key={article.href}
            href={article.href}
            className="group flex items-start gap-3 p-4 rounded-lg border border-border/50 hover:border-border hover:bg-muted/30 transition-colors"
          >
            <FileText className="h-5 w-5 mt-0.5 text-muted-foreground/60 group-hover:text-amber-500/60 transition-colors flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {article.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {article.description}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-amber-500/60 transition-colors flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
