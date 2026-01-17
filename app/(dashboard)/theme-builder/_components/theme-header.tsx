'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Save, Loader2 } from 'lucide-react';
import { useThemeStatus, type TabActivationState } from '../_context/theme-status-context';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ThemeHeaderProps {
  onPreview?: () => void;
  onSave?: () => Promise<void>;
  isSaving?: boolean;
}

function getActiveTabsSummary(activeTabs: TabActivationState): { active: string[]; inactive: string[] } {
  const active: string[] = [];
  const inactive: string[] = [];

  if (activeTabs.login) active.push('Login');
  else inactive.push('Login');

  if (activeTabs.loading) active.push('Loading');
  else inactive.push('Loading');

  if (activeTabs.menu) active.push('Menu');
  else inactive.push('Menu');

  if (activeTabs.colors) active.push('Colors');
  else inactive.push('Colors');

  return { active, inactive };
}

export function ThemeHeader({ onPreview, onSave, isSaving = false }: ThemeHeaderProps) {
  const { saveStatus, lastSaved, activeTabs, isThemeLive } = useThemeStatus();
  const [relativeTime, setRelativeTime] = useState<string | null>(null);

  // Update relative time every minute
  useEffect(() => {
    if (!lastSaved) {
      setRelativeTime(null);
      return;
    }

    const updateTime = () => {
      setRelativeTime(formatDistanceToNow(new Date(lastSaved), { addSuffix: true }));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [lastSaved]);

  const { active, inactive } = getActiveTabsSummary(activeTabs);

  const getSaveStatusText = () => {
    if (isSaving || saveStatus === 'saving') return 'Saving...';
    if (saveStatus === 'error') return 'Failed to save';
    if (saveStatus === 'saved' && relativeTime) return `Saved ${relativeTime}`;
    if (lastSaved && relativeTime) return `Saved ${relativeTime}`;
    return 'No changes';
  };

  return (
    <div className="mb-6">
      {/* Top row: Title + Status + Actions */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Theme Builder</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Customize your GHL white-label experience
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* Status and Actions row */}
          <div className="flex items-center gap-4">
            {/* Save status */}
            <span
              className={cn(
                'text-sm flex items-center gap-1.5',
                saveStatus === 'saving' || isSaving
                  ? 'text-muted-foreground'
                  : saveStatus === 'error'
                    ? 'text-destructive'
                    : 'text-muted-foreground'
              )}
            >
              {(saveStatus === 'saving' || isSaving) && (
                <Loader2 className="h-3 w-3 animate-spin" />
              )}
              {saveStatus !== 'saving' && !isSaving && (
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    saveStatus === 'error'
                      ? 'bg-destructive'
                      : saveStatus === 'saved'
                        ? 'bg-green-500'
                        : 'bg-muted-foreground/50'
                  )}
                />
              )}
              {getSaveStatusText()}
            </span>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onPreview} disabled={isSaving}>
                <Eye className="h-4 w-4 mr-1.5" />
                Preview
              </Button>
              <Button size="sm" onClick={onSave} disabled={isSaving || saveStatus === 'saving'}>
                {(isSaving || saveStatus === 'saving') ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1.5" />
                )}
                Save
              </Button>
            </div>
          </div>

          {/* Theme Live indicator */}
          <div className="flex items-center gap-2 text-sm">
            <span
              className={cn(
                'h-2.5 w-2.5 rounded-full',
                isThemeLive ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/30'
              )}
            />
            <span className={isThemeLive ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
              {isThemeLive ? 'Theme Live' : 'Theme Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Active tabs summary */}
      <div className="mt-4 text-sm text-muted-foreground">
        {active.length > 0 ? (
          <span>
            <span className="text-foreground font-medium">Active:</span> {active.join(' + ')}
            {inactive.length > 0 && (
              <span className="ml-3">
                <span className="text-muted-foreground">Inactive:</span> {inactive.join(', ')}
              </span>
            )}
          </span>
        ) : (
          <span>No customizations active. Enable tabs below to apply them to your embed.</span>
        )}
      </div>
    </div>
  );
}
