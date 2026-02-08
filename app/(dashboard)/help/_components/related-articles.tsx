'use client';

import * as React from 'react';
import Link from 'next/link';
import { FileText, ChevronRight } from 'lucide-react';

interface Article {
  title: string;
  href: string;
}

interface RelatedArticlesProps {
  articles: Article[];
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-border/50">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        Related Articles
      </h3>
      <ul className="space-y-2">
        {articles.map((article) => (
          <li key={article.href}>
            <Link
              href={article.href}
              className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronRight className="h-3 w-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
              {article.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
