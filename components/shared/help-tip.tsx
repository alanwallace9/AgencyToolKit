'use client';

import * as React from 'react';
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HelpTipProps {
  /** The help URL to navigate to */
  helpUrl: string;
  /** Optional Guidely Smart Tip ID (for future dogfooding) */
  tipId?: string;
  /** Optional tooltip text (shown on hover) */
  tooltip?: string;
  /** Optional className for positioning */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md';
}

/**
 * HelpTip - Inline help icon that links to documentation
 *
 * Usage:
 * ```tsx
 * <Label>
 *   CSS Selector <HelpTip helpUrl="/help/guidely/selectors" />
 * </Label>
 * ```
 *
 * Future: When Guidely dogfooding is set up, this will trigger
 * a Smart Tip popover instead of navigating to the help URL.
 */
export function HelpTip({
  helpUrl,
  tipId,
  tooltip = 'Click for help',
  className,
  size = 'sm',
}: HelpTipProps) {
  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
  };

  // TODO: When Guidely dogfooding is implemented, check if a Smart Tip
  // exists for this tipId and trigger it instead of navigating
  // const { triggerSmartTip } = useGuidely();
  // if (tipId && triggerSmartTip) {
  //   return <button onClick={() => triggerSmartTip(tipId)}>...</button>;
  // }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={helpUrl}
            className={cn(
              'inline-flex items-center justify-center rounded-full',
              'text-muted-foreground/60 hover:text-muted-foreground',
              'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              className
            )}
            aria-label="Help"
          >
            <HelpCircle className={sizeClasses[size]} />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Predefined help tips for common fields
 * Use these to maintain consistency across the app
 */
export const helpTips = {
  // Tour Builder
  cssSelector: {
    helpUrl: '/help/guidely/selectors',
    tooltip: 'Learn about CSS selectors',
  },
  urlPattern: {
    helpUrl: '/help/guidely/targeting',
    tooltip: 'Learn about page targeting',
  },
  tourTrigger: {
    helpUrl: '/help/guidely/first-tour',
    tooltip: 'Learn about tour triggers',
  },

  // Checklist Builder
  completionTrigger: {
    helpUrl: '/help/guidely/checklists',
    tooltip: 'Learn about completion triggers',
  },

  // Menu Editor
  ghlMenuIds: {
    helpUrl: '/help/theme-builder/menu',
    tooltip: 'Learn about menu customization',
  },

  // Settings
  excludedLocations: {
    helpUrl: '/help/settings/excluded',
    tooltip: 'Learn about excluded locations',
  },

  // Images
  textPositioning: {
    helpUrl: '/help/images/editor',
    tooltip: 'Learn about text positioning',
  },
  personalizedUrl: {
    helpUrl: '/help/images/urls',
    tooltip: 'Learn about personalized URLs',
  },

  // TrustSignal
  eventTypes: {
    helpUrl: '/help/trustsignal/events',
    tooltip: 'Learn about event types',
  },
  widgetInstall: {
    helpUrl: '/help/trustsignal/widget',
    tooltip: 'Learn how to install',
  },

  // General
  embedScript: {
    helpUrl: '/help/getting-started/embed-script',
    tooltip: 'Learn about the embed script',
  },
};
