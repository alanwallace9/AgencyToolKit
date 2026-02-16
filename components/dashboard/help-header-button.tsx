'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const HELP_NEW_BADGE_KEY = 'help-center-badge-dismissed';
const HELP_FEATURE_LAUNCH = new Date('2025-02-01').getTime(); // Feature launch date
const BADGE_EXPIRY_DAYS = 7;

// Map pathnames to relevant help articles
const helpMapping: Record<string, string> = {
  '/dashboard': '/help/getting-started',
  '/customers': '/help/getting-started/first-customer',
  '/theme': '/help/theme-builder',
  '/theme/login': '/help/theme-builder/login',
  '/theme/menu': '/help/theme-builder/menu',
  '/theme/colors': '/help/theme-builder/colors',
  '/menu': '/help/theme-builder/menu',
  '/login': '/help/theme-builder/login',
  '/colors': '/help/theme-builder/colors',
  '/loading': '/help/theme-builder/loading',
  '/g': '/help/guidely',
  '/g/tours': '/help/guidely/first-tour',
  '/g/checklists': '/help/guidely/checklists',
  '/g/tips': '/help/guidely/smart-tips',
  '/g/banners': '/help/guidely/banners',
  '/g/themes': '/help/guidely/themes',
  '/images': '/help/images',
  '/trustsignal': '/help/trustsignal',
  '/settings': '/help/settings',
};

function getHelpUrl(pathname: string): string {
  // Check for exact match first
  if (helpMapping[pathname]) {
    return helpMapping[pathname];
  }

  // Check for prefix match (e.g., /g/tours/123 -> /g/tours)
  const segments = pathname.split('/').filter(Boolean);
  while (segments.length > 0) {
    const path = '/' + segments.join('/');
    if (helpMapping[path]) {
      return helpMapping[path];
    }
    segments.pop();
  }

  // Default to help home
  return '/help';
}

export function HelpHeaderButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [showNewBadge, setShowNewBadge] = React.useState(false);

  // Check if we should show the "New" badge
  React.useEffect(() => {
    const dismissed = localStorage.getItem(HELP_NEW_BADGE_KEY);
    if (dismissed) {
      setShowNewBadge(false);
      return;
    }

    // Show badge if within 7 days of feature launch
    const now = Date.now();
    const expiryTime = HELP_FEATURE_LAUNCH + BADGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    if (now < expiryTime) {
      setShowNewBadge(true);
    }
  }, []);

  const dismissBadge = React.useCallback(() => {
    localStorage.setItem(HELP_NEW_BADGE_KEY, 'true');
    setShowNewBadge(false);
  }, []);

  // Handle keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // `?` key (Shift + /)
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        router.push(getHelpUrl(pathname));
        return;
      }

      // Cmd+/ or Ctrl+/
      if (e.key === '/' && (e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        router.push(getHelpUrl(pathname));
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, pathname]);

  const handleClick = () => {
    dismissBadge();
    router.push(getHelpUrl(pathname));
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            className="relative h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="sr-only">Help</span>
            {showNewBadge && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="flex items-center gap-2">
            {showNewBadge ? 'New: Help Center' : 'Help'}
            <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 inline-flex">
              ?
            </kbd>
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
