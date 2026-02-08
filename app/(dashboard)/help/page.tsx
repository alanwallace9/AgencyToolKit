'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Rocket,
  Palette,
  Sparkles,
  Image,
  Bell,
  Settings,
  FileText,
  ChevronRight,
  Crown,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Help content structure
const helpCategories = [
  {
    title: 'Getting Started',
    icon: Rocket,
    href: '/help/getting-started',
    articles: [
      { title: 'What is Agency Toolkit?', href: '/help/getting-started/overview' },
      { title: 'Adding your first customer', href: '/help/getting-started/first-customer' },
      { title: 'Installing the embed script', href: '/help/getting-started/embed-script' },
      { title: 'Understanding plans', href: '/help/getting-started/plans' },
    ],
  },
  {
    title: 'Theme Builder',
    icon: Palette,
    href: '/help/theme-builder',
    articles: [
      { title: 'Menu Customizer', href: '/help/theme-builder/menu' },
      { title: 'Login Designer', href: '/help/theme-builder/login' },
      { title: 'Brand Colors', href: '/help/theme-builder/colors' },
      { title: 'Loading Animations', href: '/help/theme-builder/loading' },
    ],
  },
  {
    title: 'Guidely',
    icon: Sparkles,
    href: '/help/guidely',
    pro: true,
    articles: [
      { title: 'Creating your first tour', href: '/help/guidely/first-tour' },
      { title: 'Building checklists', href: '/help/guidely/checklists' },
      { title: 'Smart Tips', href: '/help/guidely/smart-tips' },
      { title: 'Banners & announcements', href: '/help/guidely/banners' },
      { title: 'Themes', href: '/help/guidely/themes' },
      { title: 'Analytics Dashboard', href: '/help/guidely/analytics' },
    ],
  },
  {
    title: 'Images',
    icon: Image,
    href: '/help/images',
    pro: true,
    articles: [
      { title: 'Creating image templates', href: '/help/images/templates' },
      { title: 'Using the image editor', href: '/help/images/editor' },
      { title: 'Generating personalized URLs', href: '/help/images/urls' },
    ],
  },
  {
    title: 'TrustSignal',
    icon: Bell,
    href: '/help/trustsignal',
    articles: [
      { title: 'Setting up events', href: '/help/trustsignal/events' },
      { title: 'Installing the widget', href: '/help/trustsignal/widget' },
    ],
  },
  {
    title: 'Settings & Account',
    icon: Settings,
    href: '/help/settings',
    articles: [
      { title: 'Profile settings', href: '/help/settings/profile' },
      { title: 'GHL Setup', href: '/help/settings/ghl' },
      { title: 'Photo Uploads', href: '/help/settings/photos' },
      { title: 'Excluded locations', href: '/help/settings/excluded' },
      { title: 'Deleting your account', href: '/help/settings/delete' },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-8 py-2">
      {/* Header Section */}
      <div className="text-center space-y-4 py-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          How can we help you today?
        </h1>

        {/* Search */}
        <div className="max-w-lg mx-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter your search term here..."
                    className="pl-9 h-11 bg-background border-border/60"
                    disabled
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Search coming soon</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Knowledge Base Card */}
      <Card className="border-border/60">
        <CardContent className="p-6 sm:p-8">
          {/* Section Header */}
          <div className="border-b pb-4 mb-6">
            <h2 className="text-xl font-semibold">Knowledge base</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Browse articles by category
            </p>
          </div>

          {/* 2-Column Categories Grid */}
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-8">
            {helpCategories.map((category) => (
              <CategorySection key={category.href} category={category} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface CategorySectionProps {
  category: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    pro?: boolean;
    articles: { title: string; href: string }[];
  };
}

function CategorySection({ category }: CategorySectionProps) {
  const Icon = category.icon;
  const maxVisible = 5;
  const visibleArticles = category.articles.slice(0, maxVisible);
  const hasMore = category.articles.length > maxVisible;

  return (
    <div className="space-y-3">
      {/* Category Header */}
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{category.title}</h3>
          {category.pro && (
            <Badge
              variant="outline"
              className="h-5 px-1.5 text-[10px] font-semibold bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-500/30"
            >
              <Crown className="h-2.5 w-2.5 mr-0.5" />
              PRO
            </Badge>
          )}
          <span className="text-sm text-muted-foreground">
            ({category.articles.length})
          </span>
        </div>
      </div>

      {/* Article Links */}
      <div className="space-y-1">
        {visibleArticles.map((article) => (
          <Link
            key={article.href}
            href={article.href}
            className="group flex items-center gap-2 py-1.5 text-sm text-primary hover:underline"
          >
            <FileText className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0" />
            <span className="truncate">{article.title}</span>
          </Link>
        ))}

        {/* View All Link */}
        {hasMore && (
          <Link
            href={category.href}
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline pt-1"
          >
            View all {category.articles.length}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
