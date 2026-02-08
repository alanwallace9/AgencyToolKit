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
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type NavItem = { title: string; href: string; icon: React.ComponentType<{ className?: string }>; danger?: boolean; adminOnly?: boolean };
type SidebarItem = NavItem | { divider: true };

const mainItems: SidebarItem[] = [
  { title: 'Profile', href: '/settings/profile', icon: User },
  { title: 'Embed Code', href: '/settings/embed', icon: Code },
  { title: 'GHL Setup', href: '/settings/ghl', icon: Globe },
  { title: 'Photos', href: '/settings/photos', icon: Camera },
  { title: 'Excluded Locations', href: '/settings/excluded', icon: MapPin },
];

const adminItems: SidebarItem[] = [
  { divider: true },
  { title: 'Admin Panel', href: '/settings/admin', icon: Shield, adminOnly: true },
];

// Danger Zone is rendered separately in the footer, not in the nav

interface SettingsSidebarProps {
  isSuperAdmin: boolean;
}

export function SettingsSidebar({ isSuperAdmin }: SettingsSidebarProps) {
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

  // Build nav items: main + admin (if super_admin)
  const sidebarItems: SidebarItem[] = [
    ...mainItems,
    ...(isSuperAdmin ? adminItems : []),
  ];

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
        <nav className="flex-1 py-2 px-2 flex flex-col overflow-y-auto">
          <div className="space-y-1">
            {sidebarItems.map((item, index) => {
              if ('divider' in item && item.divider) {
                return (
                  <div
                    key={`divider-${index}`}
                    className="my-2 border-t border-border/50"
                  />
                );
              }

              const navItem = item as NavItem;
              const isActive =
                pathname === navItem.href || pathname.startsWith(`${navItem.href}/`);
              const Icon = navItem.icon;
              const isAdmin = navItem.adminOnly;

              const linkContent = (
                <Link
                  href={navItem.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md transition-colors relative',
                    isExpanded ? 'px-3 py-2' : 'px-0 py-2 justify-center',
                    isActive
                      ? isAdmin
                        ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
                        : 'bg-primary/10 text-primary'
                      : isAdmin
                        ? 'text-violet-600/70 hover:bg-violet-500/5 hover:text-violet-600 dark:text-violet-400/70 dark:hover:text-violet-400'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {isActive && !isExpanded && (
                    <span
                      className={cn(
                        'absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r',
                        isAdmin ? 'bg-violet-500' : 'bg-primary'
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
                      {navItem.title}
                    </span>
                  )}
                </Link>
              );

              if (!isExpanded) {
                return (
                  <Tooltip key={navItem.href}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right">
                      <span className="font-medium">{navItem.title}</span>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <div key={navItem.href}>{linkContent}</div>;
            })}
          </div>

          {/* Spacer pushes Danger Zone to bottom of nav */}
          <div className="flex-1" />

          {/* Danger Zone — pinned to bottom of nav, above the footer */}
          <div className="space-y-1">
            {(() => {
              const isDangerActive = pathname === '/settings/danger' || pathname.startsWith('/settings/danger/');
              const dangerLink = (
                <Link
                  href="/settings/danger"
                  className={cn(
                    'flex items-center gap-3 rounded-md transition-colors relative',
                    isExpanded ? 'px-3 py-2' : 'px-0 py-2 justify-center',
                    isDangerActive
                      ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                      : 'text-red-600/70 hover:bg-red-500/5 hover:text-red-600 dark:text-red-400/70 dark:hover:text-red-400'
                  )}
                >
                  {isDangerActive && !isExpanded && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r bg-red-500" />
                  )}
                  <AlertTriangle className={cn('flex-shrink-0', isExpanded ? 'h-4 w-4' : 'h-5 w-5')} />
                  {isExpanded && <span className="text-sm font-medium truncate">Danger Zone</span>}
                </Link>
              );

              if (!isExpanded) {
                return (
                  <Tooltip>
                    <TooltipTrigger asChild>{dangerLink}</TooltipTrigger>
                    <TooltipContent side="right"><span className="font-medium">Danger Zone</span></TooltipContent>
                  </Tooltip>
                );
              }
              return dangerLink;
            })()}
          </div>
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
