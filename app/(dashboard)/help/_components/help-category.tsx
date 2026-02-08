'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight, Crown, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface HelpArticle {
  title: string;
  href: string;
  description?: string;
}

interface HelpCategoryProps {
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  articles: HelpArticle[];
  href: string;
  pro?: boolean;
}

export function HelpCategory({
  title,
  description,
  icon: Icon,
  articles,
  href,
  pro,
}: HelpCategoryProps) {
  return (
    <div className="space-y-3">
      {/* Category Header */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">{title}</h3>
            {pro && (
              <Badge
                variant="outline"
                className="h-5 px-1.5 text-[10px] font-semibold bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-500/30"
              >
                <Crown className="h-2.5 w-2.5 mr-0.5" />
                PRO
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <Link
          href={href}
          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5"
        >
          View all
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Articles List */}
      <div className="space-y-1 pl-1">
        {articles.map((article) => (
          <Link
            key={article.href}
            href={article.href}
            className="group flex items-start gap-2 py-1.5 px-2 -mx-2 rounded-md hover:bg-muted/50 transition-colors"
          >
            <FileText className="h-3.5 w-3.5 mt-0.5 text-muted-foreground/60 group-hover:text-primary/60 transition-colors flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                {article.title}
              </span>
              {article.description && (
                <p className="text-xs text-muted-foreground truncate">
                  {article.description}
                </p>
              )}
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
