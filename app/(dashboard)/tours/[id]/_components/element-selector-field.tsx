'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Target,
  AlertTriangle,
  Copy,
  Check,
  X,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useElementSelector } from '../_hooks/use-element-selector';
import type { ElementTarget } from '@/types/database';

interface ElementSelectorFieldProps {
  value: ElementTarget | undefined;
  onChange: (element: ElementTarget | undefined) => void;
  ghlDomain: string | null;
  autoClose: boolean;
  disabled?: boolean;
}

export function ElementSelectorField({
  value,
  onChange,
  ghlDomain,
  autoClose,
  disabled = false,
}: ElementSelectorFieldProps) {
  const [manualSelector, setManualSelector] = useState(value?.selector || '');
  const [showManual, setShowManual] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    isSelecting,
    openSelector,
    cancelSelection,
    error,
  } = useElementSelector({
    ghlDomain,
    autoClose,
    onSelect: (element) => {
      onChange(element);
      setManualSelector(element.selector);
    },
  });

  const handleManualSave = () => {
    if (manualSelector.trim()) {
      onChange({
        selector: manualSelector.trim(),
        displayName: undefined,
        isFragile: true, // Manual selectors are assumed fragile
      });
      setShowManual(false);
      toast.success('Selector saved');
    }
  };

  const handleCopy = async () => {
    if (value?.selector) {
      await navigator.clipboard.writeText(value.selector);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Selector copied');
    }
  };

  const handleClear = () => {
    onChange(undefined);
    setManualSelector('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Target Element</Label>
        {!showManual && (
          <button
            type="button"
            onClick={() => setShowManual(true)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            disabled={disabled}
          >
            Enter manually
          </button>
        )}
      </div>

      {/* Selected Element Display */}
      {value && !showManual && (
        <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {value.displayName ? (
                  <span className="font-medium text-sm truncate">
                    {value.displayName}
                  </span>
                ) : (
                  <span className="font-mono text-xs text-muted-foreground truncate">
                    {value.selector}
                  </span>
                )}
                {value.isFragile && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 shrink-0">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Fragile
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          This selector uses element position which may break if the page structure changes.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              {value.displayName && (
                <p className="font-mono text-xs text-muted-foreground truncate mt-1">
                  {value.selector}
                </p>
              )}
              {value.pageUrl && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  Page: {value.pageUrl}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleCopy}
                      disabled={disabled}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy selector</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleClear}
                      disabled={disabled}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Clear selection</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry Mode */}
      {showManual && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={manualSelector}
              onChange={(e) => setManualSelector(e.target.value)}
              placeholder="Enter CSS selector (e.g., #my-button, .nav-link)"
              className="font-mono text-sm"
              disabled={disabled}
            />
            <Button
              type="button"
              size="sm"
              onClick={handleManualSave}
              disabled={!manualSelector.trim() || disabled}
            >
              Save
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowManual(false);
                setManualSelector(value?.selector || '');
              }}
            >
              Cancel
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter a valid CSS selector. Use browser DevTools to find the selector.
          </p>
        </div>
      )}

      {/* Select Button */}
      {!showManual && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant={value ? 'outline' : 'default'}
            onClick={openSelector}
            disabled={disabled || isSelecting}
            className="flex-1"
          >
            {isSelecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Waiting for selection...
              </>
            ) : (
              <>
                <Target className="mr-2 h-4 w-4" />
                {value ? 'Re-select Element' : 'Select Element'}
              </>
            )}
          </Button>
          {isSelecting && (
            <Button
              type="button"
              variant="outline"
              onClick={cancelSelection}
            >
              Cancel
            </Button>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
          {error.includes('Settings') && (
            <a
              href="/settings"
              className="inline-flex items-center gap-1 underline hover:no-underline"
            >
              Go to Settings
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}

      {/* Help Text */}
      {!value && !showManual && !isSelecting && !error && (
        <p className="text-xs text-muted-foreground">
          Click to open your GHL account and visually select an element for this step.
        </p>
      )}
    </div>
  );
}
