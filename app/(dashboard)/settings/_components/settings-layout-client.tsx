'use client';

import * as React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { SettingsSidebar } from './settings-sidebar';
import { SettingsMobileNav } from './settings-mobile-nav';

interface SettingsLayoutClientProps {
  children: React.ReactNode;
  isSuperAdmin: boolean;
}

export function SettingsLayoutClient({
  children,
  isSuperAdmin,
}: SettingsLayoutClientProps) {
  const isMobile = useIsMobile();

  // On mobile: normal flow with sticky mobile nav
  // On desktop: fixed sidebar layout
  if (isMobile) {
    return (
      <div className="min-h-[calc(100vh-4rem)]">
        <SettingsMobileNav isSuperAdmin={isSuperAdmin} />
        <main className="p-4">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-16 flex">
      <SettingsSidebar isSuperAdmin={isSuperAdmin} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
