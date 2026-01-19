'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Play, ChevronDown, Monitor, TestTube2 } from 'lucide-react';
import type { Tour, TourStep, TourSettings, TourTheme } from '@/types/database';

interface PreviewDropdownProps {
  tour: Tour;
  steps: TourStep[];
  settings: TourSettings;
  theme?: TourTheme;
  ghlDomain: string | null;
  onQuickPreview: () => void;
  onTestElements: () => void;
}

export function PreviewDropdown({
  tour,
  steps,
  settings,
  theme,
  ghlDomain,
  onQuickPreview,
  onTestElements,
}: PreviewDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLivePreview = () => {
    if (!ghlDomain) {
      // TODO: Show toast asking user to set GHL domain in settings
      return;
    }

    // Generate unique session ID
    const sessionId = crypto.randomUUID();

    // Store tour data in sessionStorage for the GHL tab to pick up
    const previewData = {
      tour: {
        id: tour.id,
        name: tour.name,
        steps,
        settings,
        theme_id: tour.theme_id,
      },
      theme: theme || null,
      timestamp: Date.now(),
      origin: window.location.origin,
    };

    sessionStorage.setItem(`at_preview_${sessionId}`, JSON.stringify(previewData));

    // Open GHL with preview params in hash (survives redirects)
    const url = new URL(ghlDomain);
    url.hash = `at_preview_mode=true&at_preview_session=${sessionId}`;

    window.open(url.toString(), '_blank');
    setIsOpen(false);
  };

  const hasSteps = steps.length > 0;
  const hasGhlDomain = !!ghlDomain;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={!hasSteps}>
          <Play className="h-4 w-4 mr-2" />
          Preview
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem onClick={onQuickPreview} className="flex flex-col items-start py-3">
          <div className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            <span className="font-medium">Quick Preview</span>
          </div>
          <span className="text-xs text-muted-foreground ml-6">
            See tour in simulator
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleLivePreview}
          disabled={!hasGhlDomain}
          className="flex flex-col items-start py-3"
        >
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <span className="font-medium">Live Preview</span>
            {hasGhlDomain && (
              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                Recommended
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground ml-6">
            {hasGhlDomain
              ? 'Test on real GHL page'
              : 'Set GHL domain in Settings first'}
          </span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onTestElements}
          disabled={!hasGhlDomain}
          className="flex flex-col items-start py-3"
        >
          <div className="flex items-center gap-2">
            <TestTube2 className="h-4 w-4" />
            <span className="font-medium">Test All Elements</span>
          </div>
          <span className="text-xs text-muted-foreground ml-6">
            {hasGhlDomain
              ? 'Verify selectors work'
              : 'Set GHL domain in Settings first'}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
