'use client';

import { UserButton } from '@clerk/nextjs';
import { HelpCircle, Settings } from 'lucide-react';

export function UserNav() {
  return (
    <div suppressHydrationWarning>
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: 'h-8 w-8 ring-2 ring-border/30 ring-offset-2 ring-offset-background',
          },
        }}
      >
        <UserButton.MenuItems>
          <UserButton.Link
            label="Help Center"
            labelIcon={<HelpCircle className="h-4 w-4" />}
            href="/help"
          />
          <UserButton.Link
            label="Settings"
            labelIcon={<Settings className="h-4 w-4" />}
            href="/settings"
          />
        </UserButton.MenuItems>
      </UserButton>
    </div>
  );
}
