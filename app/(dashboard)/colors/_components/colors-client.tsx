'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { COLOR_PRESETS } from '@/lib/constants';
import type { ColorConfig } from '@/types/database';
import type { ColorPreset } from '../_actions/color-actions';
import {
  createColorPreset,
  updateColorPreset,
  deleteColorPreset,
  setDefaultColorPreset,
  saveAgencyColors,
} from '../_actions/color-actions';
import { ThemeGallery } from './theme-gallery';
import { ColorStudio } from './color-studio';
import { PreviewPanel } from './preview-panel';
import Link from 'next/link';

interface ColorsClientProps {
  initialPresets: ColorPreset[];
  initialColors: ColorConfig | null;
}

// Default colors if none saved
const DEFAULT_COLORS: ColorConfig = {
  primary: '#2563eb',
  accent: '#10b981',
  sidebar_bg: '#1f2937',
  sidebar_text: '#f9fafb',
};

export function ColorsClient({ initialPresets, initialColors }: ColorsClientProps) {
  // Current working colors (what's shown in preview)
  const [colors, setColors] = useState<ColorConfig>(initialColors || DEFAULT_COLORS);

  // User's custom presets
  const [customPresets, setCustomPresets] = useState<ColorPreset[]>(initialPresets);

  // Currently selected preset (null = custom/unsaved)
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(() => {
    const defaultPreset = initialPresets.find((p) => p.is_default);
    return defaultPreset?.id || null;
  });

  // Hover preview state (temporary preview without committing)
  const [hoverPreviewColors, setHoverPreviewColors] = useState<ColorConfig | null>(null);

  // Auto-save state
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // The colors to display in preview (hover preview takes priority)
  const displayColors = hoverPreviewColors || colors;

  // ============================================
  // Auto-save with debounce
  // ============================================
  const debouncedSave = useCallback(
    async (newColors: ColorConfig) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      setHasUnsavedChanges(true);

      saveTimeoutRef.current = setTimeout(async () => {
        setIsSaving(true);
        try {
          // If we have a selected preset, update it
          if (selectedPresetId) {
            const result = await updateColorPreset(selectedPresetId, { colors: newColors });
            if (result.success) {
              setCustomPresets((prev) =>
                prev.map((p) =>
                  p.id === selectedPresetId ? { ...p, colors: newColors } : p
                )
              );
              toast.success('Theme saved');
            } else {
              toast.error(result.error || 'Failed to save');
            }
          } else {
            // Save directly to agency settings
            const result = await saveAgencyColors(newColors);
            if (result.success) {
              toast.success('Colors saved');
            } else {
              toast.error(result.error || 'Failed to save');
            }
          }
        } finally {
          setIsSaving(false);
          setHasUnsavedChanges(false);
        }
      }, 500); // 500ms debounce
    },
    [selectedPresetId]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // ============================================
  // Color Change Handlers
  // ============================================
  const handleColorChange = useCallback(
    (key: keyof ColorConfig, value: string) => {
      const newColors = { ...colors, [key]: value };
      setColors(newColors);
      debouncedSave(newColors);
    },
    [colors, debouncedSave]
  );

  const handleColorsChange = useCallback(
    (newColors: ColorConfig) => {
      setColors(newColors);
      debouncedSave(newColors);
    },
    [debouncedSave]
  );

  // ============================================
  // Preset Handlers
  // ============================================
  const handleSelectBuiltInPreset = useCallback((presetId: string) => {
    const preset = COLOR_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setColors(preset.colors);
      setSelectedPresetId(null); // Built-in presets aren't "selected" for saving
      setHasUnsavedChanges(true);
      // Don't auto-save - let user decide to create a custom preset or just use
    }
  }, []);

  const handleSelectCustomPreset = useCallback((preset: ColorPreset) => {
    setColors(preset.colors);
    setSelectedPresetId(preset.id);
    setHasUnsavedChanges(false);
  }, []);

  const handleCreatePreset = useCallback(
    async (name: string) => {
      const result = await createColorPreset({
        name,
        colors,
        is_default: customPresets.length === 0, // First preset is default
      });

      if (result.success && result.data) {
        const newPreset = result.data as ColorPreset;
        setCustomPresets((prev) => [...prev, newPreset]);
        setSelectedPresetId(newPreset.id);
        toast.success('Theme created');
        return true;
      } else {
        toast.error(result.error || 'Failed to create theme');
        return false;
      }
    },
    [colors, customPresets.length]
  );

  const handleDeletePreset = useCallback(async (presetId: string) => {
    const result = await deleteColorPreset(presetId);
    if (result.success) {
      setCustomPresets((prev) => prev.filter((p) => p.id !== presetId));
      setSelectedPresetId(null);
      toast.success('Theme deleted');
    } else {
      toast.error(result.error || 'Failed to delete theme');
    }
  }, []);

  const handleSetDefault = useCallback(async (presetId: string) => {
    const result = await setDefaultColorPreset(presetId);
    if (result.success) {
      setCustomPresets((prev) =>
        prev.map((p) => ({
          ...p,
          is_default: p.id === presetId,
        }))
      );
      toast.success('Default theme updated');
    } else {
      toast.error(result.error || 'Failed to set default');
    }
  }, []);

  // ============================================
  // Hover Preview (for built-in presets)
  // ============================================
  const handleHoverPreset = useCallback((presetColors: ColorConfig | null) => {
    setHoverPreviewColors(presetColors);
  }, []);

  // ============================================
  // Logo Color Extraction
  // ============================================
  const handleExtractedColors = useCallback(
    (extractedColors: string[]) => {
      if (extractedColors.length >= 4) {
        const newColors: ColorConfig = {
          primary: extractedColors[0],
          accent: extractedColors[1],
          sidebar_bg: extractedColors[2],
          sidebar_text: extractedColors[3],
        };
        setColors(newColors);
        debouncedSave(newColors);
        toast.success('Colors extracted from logo');
      } else if (extractedColors.length >= 2) {
        // Use what we have, keep the rest
        const newColors: ColorConfig = {
          primary: extractedColors[0],
          accent: extractedColors[1] || colors.accent,
          sidebar_bg: colors.sidebar_bg,
          sidebar_text: colors.sidebar_text,
        };
        setColors(newColors);
        debouncedSave(newColors);
        toast.success('Some colors extracted from logo');
      }
    },
    [colors, debouncedSave]
  );

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isSaving && (
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Saving...
            </span>
          )}
          {!isSaving && !hasUnsavedChanges && (
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              All changes saved
            </span>
          )}
          {!isSaving && hasUnsavedChanges && (
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Unsaved changes
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/settings">
            <Settings className="h-4 w-4 mr-2" />
            View Embed Code
          </Link>
        </Button>
      </div>

      {/* Main 3-Panel Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel - Theme Gallery */}
        <div className="col-span-3">
          <ThemeGallery
            customPresets={customPresets}
            selectedPresetId={selectedPresetId}
            onSelectBuiltIn={handleSelectBuiltInPreset}
            onSelectCustom={handleSelectCustomPreset}
            onCreatePreset={handleCreatePreset}
            onDeletePreset={handleDeletePreset}
            onSetDefault={handleSetDefault}
            onHoverPreset={handleHoverPreset}
          />
        </div>

        {/* Center Panel - Preview */}
        <div className="col-span-6">
          <PreviewPanel colors={displayColors} />
        </div>

        {/* Right Panel - Color Studio */}
        <div className="col-span-3">
          <ColorStudio
            colors={colors}
            onColorChange={handleColorChange}
            onColorsChange={handleColorsChange}
            onExtractedColors={handleExtractedColors}
          />
        </div>
      </div>

      {/* Bottom Info Panel */}
      <div className="rounded-xl border bg-card/50 backdrop-blur p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/10 p-2">
            <Settings className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Your theme is included in your embed code</p>
            <p className="text-sm text-muted-foreground mt-1">
              Changes are saved automatically and will be applied the next time your GHL
              dashboard loads. No need to copy any CSS - it's all handled by your embed
              script.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/settings">Go to Settings</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
