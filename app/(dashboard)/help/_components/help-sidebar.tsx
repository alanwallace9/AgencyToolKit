'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Rocket,
  Palette,
  Sparkles,
  Image,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type SidebarItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  pro?: boolean;
  divider?: never;
} | {
  divider: true;
  title?: never;
  href?: never;
  icon?: never;
  pro?: never;
};

const sidebarItems: SidebarItem[] = [
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
    divider: true,
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
    divider: true,
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

export function HelpSidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = React.useState(true);

  // Load expanded state from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem('help-sidebar-expanded');
    if (stored !== null) {
      setIsExpanded(stored === 'true');
    }
  }, []);

  const toggleExpanded = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    localStorage.setItem('help-sidebar-expanded', String(newExpanded));
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'h-full border-r border-border/50 bg-background/95 backdrop-blur-sm transition-all duration-200 ease-in-out flex flex-col relative',
          isExpanded ? 'w-[220px]' : 'w-[60px]'
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'h-12 flex items-center border-b border-border/50 px-3',
            isExpanded ? 'justify-start' : 'justify-center'
          )}
        >
          {isExpanded ? (
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-sm">Help Center</span>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-5 w-5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="right">Help Center</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-2 px-2 space-y-1 overflow-y-auto">
          {sidebarItems.map((item, index) => {
            if (item.divider) {
              return (
                <div
                  key={`divider-${index}`}
                  className="my-2 border-t border-border/50"
                />
              );
            }

            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md transition-colors relative',
                  isExpanded ? 'px-3 py-2' : 'px-0 py-2 justify-center',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {/* Active indicator dot (when collapsed) */}
                {isActive && !isExpanded && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r bg-primary" />
                )}

                <Icon
                  className={cn(
                    'flex-shrink-0',
                    isExpanded ? 'h-4 w-4' : 'h-5 w-5'
                  )}
                />

                {isExpanded && (
                  <>
                    <span className="text-sm font-medium truncate flex-1">
                      {item.title}
                    </span>
                    {item.pro && (
                      <Badge
                        variant="outline"
                        className="h-5 px-1.5 text-[10px] font-semibold bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-500/30"
                      >
                        <Crown className="h-2.5 w-2.5 mr-0.5" />
                        PRO
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            );

            // Show tooltip when collapsed
            if (!isExpanded) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="flex items-center gap-2">
                    <span className="font-medium">{item.title}</span>
                    {item.pro && (
                      <Badge
                        variant="outline"
                        className="h-4 px-1 text-[9px] font-semibold bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-500/30"
                      >
                        PRO
                      </Badge>
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.href}>{linkContent}</div>;
          })}
        </nav>

        {/* Footer - Back to Dashboard */}
        <div className="p-2 border-t border-border/50">
          {isExpanded ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Back to Dashboard</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Toggle Button */}
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-3 bottom-6 h-6 w-6 rounded-full border bg-background shadow-sm hover:bg-muted z-10"
          onClick={toggleExpanded}
        >
          {isExpanded ? (
            <ChevronLeft className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </Button>
      </aside>
    </TooltipProvider>
  );
}
