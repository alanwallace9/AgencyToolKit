'use client';

import * as React from 'react';

export function HelpLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  // Simple centered layout - no sidebar
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <main className="max-w-5xl mx-auto">
        {children}
      </main>
    </div>
  );
}
