'use client';

import Link from 'next/link';
import { Settings, FileText, ChevronRight } from 'lucide-react';
import { HelpBreadcrumb } from '../_components/help-breadcrumb';

const articles = [
  {
    title: 'Profile settings',
    href: '/help/settings/profile',
    description: 'Update your account information',
  },
  {
    title: 'GHL Setup',
    href: '/help/settings/ghl',
    description: 'Configure your GoHighLevel white-label domain',
  },
  {
    title: 'Photo Uploads',
    href: '/help/settings/photos',
    description: 'Configure customer photo uploads during onboarding',
  },
  {
    title: 'Excluded locations',
    href: '/help/settings/excluded',
    description: 'Skip customizations for specific sub-accounts',
  },
  {
    title: 'Deleting your account',
    href: '/help/settings/delete',
    description: 'How to remove your data',
  },
];

export default function SettingsHelpPage() {
  return (
    <div className="space-y-6">
      <HelpBreadcrumb
        items={[{ label: 'Settings' }]}
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-muted">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings & Account</h1>
          <p className="text-sm text-muted-foreground">
            Manage your Agency Toolkit account
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
