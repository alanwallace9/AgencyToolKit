'use client';

import * as React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeSidebar } from './theme-sidebar';
import { ThemeMobileNav } from './theme-mobile-nav';

export function ThemeLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();

  // On mobile: normal flow with sticky mobile nav
  // On desktop: fixed sidebar layout
  if (isMobile) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col">
        <ThemeMobileNav />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-16 flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <ThemeSidebar />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
