'use client';

import Link from 'next/link';
import { Palette, FileText, ChevronRight } from 'lucide-react';
import { HelpBreadcrumb } from '../_components/help-breadcrumb';

const articles = [
  {
    title: 'Menu Customizer',
    href: '/help/theme-builder/menu',
    description: 'Hide, rename, and reorder sidebar menu items',
  },
  {
    title: 'Login Designer',
    href: '/help/theme-builder/login',
    description: 'Customize the login page with your branding',
  },
  {
    title: 'Brand Colors',
    href: '/help/theme-builder/colors',
    description: 'Apply your color theme across the dashboard',
  },
  {
    title: 'Loading Animations',
    href: '/help/theme-builder/loading',
    description: 'Choose from 13 loading animations',
  },
];

export default function ThemeBuilderPage() {
  return (
    <div className="space-y-6">
      <HelpBreadcrumb
        items={[{ label: 'Theme Builder' }]}
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-violet-500/10">
          <Palette className="h-5 w-5 text-violet-500" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Theme Builder</h1>
          <p className="text-sm text-muted-foreground">
            Customize the look and feel of your GHL sub-accounts
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
            <FileText className="h-5 w-5 mt-0.5 text-muted-foreground/60 group-hover:text-violet-500/60 transition-colors flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                {article.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {article.description}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-violet-500/60 transition-colors flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
