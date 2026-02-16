'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Layers,
  LogIn,
  PanelLeft,
  Palette,
  Menu,
  ChevronLeft,
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

const sidebarItems = [
  {
    title: 'Login Page',
    href: '/theme/login',
    icon: LogIn,
  },
  {
    title: 'Sidebar Menu',
    href: '/theme/menu',
    icon: PanelLeft,
  },
  {
    title: 'Brand Colors',
    href: '/theme/colors',
    icon: Palette,
  },
];

export function ThemeMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  // Get current page title
  const currentItem = sidebarItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
  const currentTitle = currentItem ? currentItem.title : 'Theme Builder';

  return (
    <div className="sticky top-0 z-40 bg-background border-b">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open Theme Builder menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SheetHeader className="px-4 py-3 border-b">
                <SheetTitle className="flex items-center gap-2 text-left">
                  <Layers className="h-4 w-4 text-primary" />
                  Theme Builder
                </SheetTitle>
              </SheetHeader>
              <nav className="py-2 px-2 space-y-1">
                {sidebarItems.map((item) => {
                  const isActive =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="absolute bottom-0 left-0 right-0 p-2 border-t">
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back to Toolkit</span>
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
