'use client';

import * as React from 'react';
import Link from 'next/link';
import { Clock, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecentArticle {
  title: string;
  href: string;
  viewedAt: number;
}

const STORAGE_KEY = 'help-recently-viewed';
const MAX_RECENT = 5;

export function useRecentlyViewed() {
  const [recent, setRecent] = React.useState<RecentArticle[]>([]);

  // Load from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecent(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const addArticle = React.useCallback((title: string, href: string) => {
    setRecent((prev) => {
      // Remove if already exists
      const filtered = prev.filter((a) => a.href !== href);
      // Add to front
      const updated = [
        { title, href, viewedAt: Date.now() },
        ...filtered,
      ].slice(0, MAX_RECENT);

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }

      return updated;
    });
  }, []);

  const clearRecent = React.useCallback(() => {
    setRecent([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  return { recent, addArticle, clearRecent };
}

interface RecentlyViewedProps {
  articles: RecentArticle[];
  onClear: () => void;
}

export function RecentlyViewed({ articles, onClear }: RecentlyViewedProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Recently Viewed</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {articles.map((article) => (
          <Link
            key={article.href}
            href={article.href}
            className="group flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted text-sm transition-colors"
          >
            <span className="text-muted-foreground group-hover:text-foreground transition-colors">
              {article.title}
            </span>
            <ChevronRight className="h-3 w-3 text-muted-foreground/60 group-hover:text-foreground/60" />
          </Link>
        ))}
      </div>
    </div>
  );
}
