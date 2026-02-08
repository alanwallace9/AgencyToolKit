'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { HelpBreadcrumb } from './help-breadcrumb';
import { ArticleFeedback } from './article-feedback';
import { RelatedArticles } from './related-articles';
import { useRecentlyViewed } from './recently-viewed';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface RelatedArticle {
  title: string;
  href: string;
}

interface ArticleLayoutProps {
  title: string;
  description?: string;
  breadcrumbs: BreadcrumbItem[];
  relatedArticles?: RelatedArticle[];
  children: React.ReactNode;
}

export function ArticleLayout({
  title,
  description,
  breadcrumbs,
  relatedArticles = [],
  children,
}: ArticleLayoutProps) {
  const pathname = usePathname();
  const { addArticle } = useRecentlyViewed();

  // Track article view
  React.useEffect(() => {
    addArticle(title, pathname);
  }, [title, pathname, addArticle]);

  // Generate article ID from pathname
  const articleId = pathname.replace(/\//g, '-').slice(1);

  return (
    <article className="max-w-3xl pb-12">
      {/* Breadcrumb */}
      <HelpBreadcrumb items={breadcrumbs} className="mb-6" />

      {/* Header */}
      <header className="mb-8 pb-6 border-b border-border/60">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-2">{description}</p>
        )}
      </header>

      {/* Content */}
      <div className="article-content space-y-6 text-[15px] leading-relaxed text-muted-foreground [&_p]:leading-relaxed [&_strong]:text-foreground [&_strong]:font-medium [&_code]:text-[13px] [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-foreground [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-primary/80 [&_h2]:text-[17px] [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-[15px] [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-2 [&_ol_li]:pl-1.5 [&_ol_li::marker]:font-semibold [&_ol_li::marker]:text-foreground/50 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_ul_li]:pl-1 [&_ul_li::marker]:text-foreground/30 [&_hr]:border-border/60 [&_hr]:my-8">
        {children}
      </div>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <RelatedArticles articles={relatedArticles} />
      )}

      {/* Feedback */}
      <ArticleFeedback articleId={articleId} />
    </article>
  );
}
