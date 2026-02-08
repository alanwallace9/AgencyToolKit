'use client';

import Link from 'next/link';
import { Image, FileText, ChevronRight, Crown } from 'lucide-react';
import { HelpBreadcrumb } from '../_components/help-breadcrumb';
import { Badge } from '@/components/ui/badge';

const articles = [
  {
    title: 'Creating image templates',
    href: '/help/images/templates',
    description: 'Set up a personalized image template',
  },
  {
    title: 'Using the image editor',
    href: '/help/images/editor',
    description: 'Position text and style your images',
  },
  {
    title: 'Generating personalized URLs',
    href: '/help/images/urls',
    description: 'Use with GHL workflows and emails',
  },
];

export default function ImagesPage() {
  return (
    <div className="space-y-6">
      <HelpBreadcrumb
        items={[{ label: 'Images' }]}
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-orange-500/10">
          <Image className="h-5 w-5 text-orange-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Images</h1>
            <Badge
              variant="outline"
              className="h-5 px-1.5 text-[10px] font-semibold bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-500/30"
            >
              <Crown className="h-2.5 w-2.5 mr-0.5" />
              PRO
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Personalized image generation for workflows
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
            <FileText className="h-5 w-5 mt-0.5 text-muted-foreground/60 group-hover:text-orange-500/60 transition-colors flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                {article.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {article.description}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-orange-500/60 transition-colors flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
