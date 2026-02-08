'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Rocket,
  Palette,
  Sparkles,
  Image,
  Bell,
  Settings,
  ChevronLeft,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const navItems = [
  {
    title: 'Getting Started',
    href: '/help/getting-started',
    icon: Rocket,
  },
  {
    title: 'Theme Builder',
    href: '/help/theme-builder',
    icon: Palette,
  },
  {
    title: 'Guidely',
    href: '/help/guidely',
    icon: Sparkles,
    pro: true,
  },
  {
    title: 'Images',
    href: '/help/images',
    icon: Image,
    pro: true,
  },
  {
    title: 'TrustSignal',
    href: '/help/trustsignal',
    icon: Bell,
  },
  {
    title: 'Settings',
    href: '/help/settings',
    icon: Settings,
  },
];

export function HelpMobileNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
      {/* Header with back link */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border/30">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <span className="text-muted-foreground/50">|</span>
        <span className="text-sm font-medium">Help Center</span>
      </div>

      {/* Scrollable nav */}
      <ScrollArea className="w-full">
        <div className="flex items-center gap-1 px-4 py-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.title}
                {item.pro && !isActive && (
                  <Crown className="h-3 w-3 text-amber-500" />
                )}
              </Link>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}
