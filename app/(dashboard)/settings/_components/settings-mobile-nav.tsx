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
  Menu,
  ChevronLeft,
  Settings,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

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

interface SettingsMobileNavProps {
  isSuperAdmin: boolean;
}

export function SettingsMobileNav({ isSuperAdmin }: SettingsMobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const sidebarItems: SidebarItem[] = [
    ...mainItems,
    ...(isSuperAdmin ? adminItems : []),
  ];

  // Get current page title
  const currentItem = sidebarItems.find(
    (item) => 'href' in item && (pathname === item.href || pathname.startsWith(`${item.href}/`))
  );
  const currentTitle = currentItem && 'title' in currentItem ? currentItem.title : 'Settings';

  return (
    <div className="sticky top-0 z-40 bg-background border-b">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open settings menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SheetHeader className="px-4 py-3 border-b">
                <SheetTitle className="flex items-center gap-2 text-left">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  Settings
                </SheetTitle>
              </SheetHeader>
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

                    return (
                      <Link
                        key={navItem.href}
                        href={navItem.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          'flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors',
                          isActive
                            ? isAdmin
                              ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
                              : 'bg-primary/10 text-primary'
                            : isAdmin
                              ? 'text-violet-600/70 hover:bg-violet-500/5 hover:text-violet-600 dark:text-violet-400/70 dark:hover:text-violet-400'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm font-medium">{navItem.title}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Spacer pushes Danger Zone to bottom */}
                <div className="flex-1" />

                {/* Danger Zone — pinned to bottom of nav */}
                <div className="space-y-1">
                  {(() => {
                    const isDangerActive = pathname === '/settings/danger' || pathname.startsWith('/settings/danger/');
                    return (
                      <Link
                        href="/settings/danger"
                        onClick={() => setOpen(false)}
                        className={cn(
                          'flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors',
                          isDangerActive
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                            : 'text-red-600/70 hover:bg-red-500/5 hover:text-red-600 dark:text-red-400/70 dark:hover:text-red-400'
                        )}
                      >
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm font-medium">Danger Zone</span>
                      </Link>
                    );
                  })()}
                </div>
              </nav>
              <div className="absolute bottom-0 left-0 right-0 p-2 border-t">
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="font-semibold text-lg">{currentTitle}</h1>
        </div>
      </div>
    </div>
  );
}
