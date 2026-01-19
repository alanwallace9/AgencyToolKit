'use client';

import { useEffect, useState, useCallback } from 'react';
import { ColorsClient } from '@/app/(dashboard)/colors/_components/colors-client';
import { GlassStyles } from '@/app/(dashboard)/colors/_components/glass-styles';
import { getColorPresets, getDefaultColors } from '@/app/(dashboard)/colors/_actions/color-actions';
import { useThemeStatus } from '../../_context/theme-status-context';
import type { ColorConfig } from '@/types/database';
import type { ColorPreset } from '@/app/(dashboard)/colors/_actions/color-actions';
import { Loader2 } from 'lucide-react';

export function ColorsTabContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [presets, setPresets] = useState<ColorPreset[]>([]);
  const [colors, setColors] = useState<ColorConfig | null>(null);
  const { markSaved, registerSaveHandler, setTabHasUnsavedChanges } = useThemeStatus();

  useEffect(() => {
    async function loadData() {
      try {
        // Use server actions to fetch data (handles RLS properly)
        const [fetchedPresets, fetchedColors] = await Promise.all([
          getColorPresets(),
          getDefaultColors(),
        ]);

        setPresets(fetchedPresets);
        setColors(fetchedColors);
      } catch (error) {
        console.error('Failed to load color data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Callback to update the theme status context when colors are saved
  const handleSaveComplete = useCallback(() => {
    markSaved();
  }, [markSaved]);

  // Register the colors save handler with the theme context
  const handleRegisterSaveHandler = useCallback(
    (handler: (() => Promise<boolean>) | null) => {
      registerSaveHandler('colors', handler);
    },
    [registerSaveHandler]
  );

  // Track unsaved changes in the theme context
  const handleUnsavedChangesChange = useCallback(
    (hasChanges: boolean) => {
      setTabHasUnsavedChanges('colors', hasChanges);
    },
    [setTabHasUnsavedChanges]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading color studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="colors-tab-wrapper">
      <ColorsClient
        initialPresets={presets}
        initialColors={colors}
        onSaveComplete={handleSaveComplete}
        onRegisterSaveHandler={handleRegisterSaveHandler}
        onUnsavedChangesChange={handleUnsavedChangesChange}
      />
      <GlassStyles />
    </div>
  );
}
