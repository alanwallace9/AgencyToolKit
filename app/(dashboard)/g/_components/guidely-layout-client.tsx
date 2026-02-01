'use client';

import * as React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { GuidelySidebar } from './guidely-sidebar';
import { GuidelyMobileNav } from './guidely-mobile-nav';
import { UpgradeBanner } from '@/components/shared/upgrade-banner';

export function GuidelyLayoutClient({
  children,
  isPro,
}: {
  children: React.ReactNode;
  isPro: boolean;
}) {
  const isMobile = useIsMobile();

  // On mobile: normal flow with sticky mobile nav
  // On desktop: fixed sidebar layout
  if (isMobile) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col">
        {!isPro && <UpgradeBanner feature="guidely" />}
        <GuidelyMobileNav />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-16 flex flex-col">
      {!isPro && <UpgradeBanner feature="guidely" />}
      <div className="flex flex-1 overflow-hidden">
        <GuidelySidebar />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
