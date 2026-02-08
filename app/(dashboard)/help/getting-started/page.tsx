'use client';

import Link from 'next/link';
import { Rocket, FileText, ChevronRight } from 'lucide-react';
import { HelpBreadcrumb } from '../_components/help-breadcrumb';

const articles = [
  {
    title: 'What is Agency Toolkit?',
    href: '/help/getting-started/overview',
    description: 'Introduction to the platform and its features',
  },
  {
    title: 'Adding your first customer',
    href: '/help/getting-started/first-customer',
    description: 'Set up your first sub-account in minutes',
  },
  {
    title: 'Installing the embed script',
    href: '/help/getting-started/embed-script',
    description: 'Add customizations to your GHL sub-accounts',
  },
  {
    title: 'Understanding plans',
    href: '/help/getting-started/plans',
    description: 'Compare Toolkit vs Pro features',
  },
];

export default function GettingStartedPage() {
  return (
    <div className="space-y-6">
      <HelpBreadcrumb
        items={[{ label: 'Getting Started' }]}
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Rocket className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Getting Started</h1>
          <p className="text-sm text-muted-foreground">
            New to Agency Toolkit? Start here.
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
            <FileText className="h-5 w-5 mt-0.5 text-muted-foreground/60 group-hover:text-primary/60 transition-colors flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                {article.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {article.description}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary/60 transition-colors flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
