'use client';

import * as React from 'react';
import { Monitor, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface DesktopSuggestionBannerProps {
  /** Unique key for localStorage (e.g., "tour-builder", "image-editor") */
  featureKey: string;
  /** Optional custom message */
  message?: string;
}

export function DesktopSuggestionBanner({
  featureKey,
  message = 'This feature works best on desktop. Some editing tools may be limited on mobile.',
}: DesktopSuggestionBannerProps) {
  const isMobile = useIsMobile();
  const [dismissed, setDismissed] = React.useState(true); // Start true to avoid flash

  // Check localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem(`desktop-banner-dismissed-${featureKey}`);
    setDismissed(stored === 'true');
  }, [featureKey]);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(`desktop-banner-dismissed-${featureKey}`, 'true');
  };

  // Only show on mobile and when not dismissed
  if (!isMobile || dismissed) {
    return null;
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-950/50 border-b border-blue-200 dark:border-blue-800 px-4 py-3">
      <div className="flex items-start gap-3">
        <Monitor className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="flex-1 text-sm text-blue-800 dark:text-blue-200">
          {message}
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 -mt-0.5"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      </div>
    </div>
  );
}
