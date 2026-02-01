'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  Code,
  Globe,
  Camera,
  MapPin,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const sidebarItems = [
  {
    title: 'Profile',
    href: '/settings/profile',
    icon: User,
  },
  {
    title: 'Embed Code',
    href: '/settings/embed',
    icon: Code,
  },
  {
    title: 'GHL Setup',
    href: '/settings/ghl',
    icon: Globe,
  },
  {
    title: 'Photos',
    href: '/settings/photos',
    icon: Camera,
  },
  {
    title: 'Excluded Locations',
    href: '/settings/excluded',
    icon: MapPin,
  },
  {
    divider: true,
  },
  {
    title: 'Danger Zone',
    href: '/settings/danger',
    icon: AlertTriangle,
    danger: true,
  },
];

export function SettingsSidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = React.useState(true);

  // Load expanded state from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem('settings-sidebar-expanded');
    if (stored !== null) {
      setIsExpanded(stored === 'true');
    }
  }, []);

  const toggleExpanded = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    localStorage.setItem('settings-sidebar-expanded', String(newExpanded));
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
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-sm">Settings</span>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Settings className="h-5 w-5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-2 px-2 space-y-1 overflow-y-auto">
          {sidebarItems.map((item, index) => {
            if ('divider' in item && item.divider) {
              return (
                <div
                  key={`divider-${index}`}
                  className="my-2 border-t border-border/50"
                />
              );
            }

            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon!;
            const isDanger = 'danger' in item && item.danger;

            const linkContent = (
              <Link
                href={item.href!}
                className={cn(
                  'flex items-center gap-3 rounded-md transition-colors relative',
                  isExpanded ? 'px-3 py-2' : 'px-0 py-2 justify-center',
                  isActive
                    ? isDanger
                      ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                      : 'bg-primary/10 text-primary'
                    : isDanger
                      ? 'text-red-600/70 hover:bg-red-500/5 hover:text-red-600 dark:text-red-400/70 dark:hover:text-red-400'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {/* Active indicator dot (when collapsed) */}
                {isActive && !isExpanded && (
                  <span
                    className={cn(
                      'absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r',
                      isDanger ? 'bg-red-500' : 'bg-primary'
                    )}
                  />
                )}

                <Icon
                  className={cn(
                    'flex-shrink-0',
                    isExpanded ? 'h-4 w-4' : 'h-5 w-5'
                  )}
                />

                {isExpanded && (
                  <span className="text-sm font-medium truncate">
                    {item.title}
                  </span>
                )}
              </Link>
            );

            // Show tooltip when collapsed
            if (!isExpanded) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">
                    <span className="font-medium">{item.title}</span>
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
