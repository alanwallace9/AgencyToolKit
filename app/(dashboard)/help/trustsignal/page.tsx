'use client';

import Link from 'next/link';
import { Bell, FileText, ChevronRight } from 'lucide-react';
import { HelpBreadcrumb } from '../_components/help-breadcrumb';

const articles = [
  {
    title: 'Setting up events',
    href: '/help/trustsignal/events',
    description: 'Add social proof events to display',
  },
  {
    title: 'Installing the widget',
    href: '/help/trustsignal/widget',
    description: 'Add TrustSignal to your website',
  },
];

export default function TrustSignalPage() {
  return (
    <div className="space-y-6">
      <HelpBreadcrumb
        items={[{ label: 'TrustSignal' }]}
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-green-500/10">
          <Bell className="h-5 w-5 text-green-500" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">TrustSignal</h1>
          <p className="text-sm text-muted-foreground">
            Social proof notifications for your agency website
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
            <FileText className="h-5 w-5 mt-0.5 text-muted-foreground/60 group-hover:text-green-500/60 transition-colors flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                {article.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {article.description}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-green-500/60 transition-colors flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
