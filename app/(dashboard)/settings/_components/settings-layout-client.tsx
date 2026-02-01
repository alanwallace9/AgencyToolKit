'use client';

import * as React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { SettingsSidebar } from './settings-sidebar';
import { SettingsMobileNav } from './settings-mobile-nav';

export function SettingsLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();

  // On mobile: normal flow with sticky mobile nav
  // On desktop: fixed sidebar layout
  if (isMobile) {
    return (
      <div className="min-h-[calc(100vh-4rem)]">
        <SettingsMobileNav />
        <main className="p-4">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-16 flex">
      <SettingsSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
