'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useResizablePanels } from '@/hooks/use-resizable-panels';
import { ResizeHandle } from '@/components/shared/resize-handle';
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

interface ColorsClientProps {
  initialPresets: ColorPreset[];
  initialColors: ColorConfig | null;
  /** Optional callback when save completes (for integrating with parent save status) */
  onSaveComplete?: () => void;
  /** Optional: Register a save handler for external save triggers (e.g., tab change) */
  onRegisterSaveHandler?: (handler: (() => Promise<boolean>) | null) => void;
  /** Optional: Report unsaved changes state to parent */
  onUnsavedChangesChange?: (hasChanges: boolean) => void;
  /** Optional: Report actual saving state (network request in flight) to parent */
  onSavingChange?: (isSaving: boolean) => void;
}

// Default colors if none saved
const DEFAULT_COLORS: ColorConfig = {
  primary: '#2563eb',
  accent: '#10b981',
  sidebar_bg: '#1f2937',
  sidebar_text: '#f9fafb',
};

export function ColorsClient({
  initialPresets,
  initialColors,
  onSaveComplete,
  onRegisterSaveHandler,
  onUnsavedChangesChange,
  onSavingChange,
}: ColorsClientProps) {
  // Resizable panels
  const {
    leftWidth,
    rightWidth,
    leftCollapsed,
    rightCollapsed,
    startDrag,
    toggleLeftCollapse,
    toggleRightCollapse,
  } = useResizablePanels({
    storageKey: 'colors-designer-panels',
    leftPanel: { minWidth: 260, maxWidth: 420, defaultWidth: 420 },
    rightPanel: { minWidth: 260, maxWidth: 400, defaultWidth: 300 },
  });

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

  // Keep a ref to the current colors for the save handler
  const colorsRef = useRef<ColorConfig>(colors);
  useEffect(() => {
    colorsRef.current = colors;
  }, [colors]);

  // The colors to display in preview (hover preview takes priority)
  const displayColors = hoverPreviewColors || colors;

  // Notify parent of unsaved changes state
  useEffect(() => {
    onUnsavedChangesChange?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, onUnsavedChangesChange]);

  // Notify parent of actual saving state (network request in flight)
  useEffect(() => {
    onSavingChange?.(isSaving);
  }, [isSaving, onSavingChange]);

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
              onSaveComplete?.();
            } else {
              toast.error(result.error || 'Failed to save');
            }
          } else {
            // Save directly to agency settings
            const result = await saveAgencyColors(newColors);
            if (result.success) {
              toast.success('Colors saved');
              onSaveComplete?.();
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
    [selectedPresetId, onSaveComplete]
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
  // External Save Handler (for tab change / Save button)
  // ============================================
  // This function saves the current colors immediately (no debounce)
  // Used when user clicks Save button or switches tabs
  const saveNow = useCallback(async (): Promise<boolean> => {
    // Clear any pending debounced save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    // If no unsaved changes, nothing to do
    if (!hasUnsavedChanges) {
      return true;
    }

    setIsSaving(true);
    try {
      const currentColors = colorsRef.current;

      // If we have a selected custom preset, update it
      if (selectedPresetId) {
        const result = await updateColorPreset(selectedPresetId, { colors: currentColors });
        if (result.success) {
          setCustomPresets((prev) =>
            prev.map((p) =>
              p.id === selectedPresetId ? { ...p, colors: currentColors } : p
            )
          );
          onSaveComplete?.();
          setHasUnsavedChanges(false);
          return true;
        } else {
          toast.error(result.error || 'Failed to save');
          return false;
        }
      } else {
        // Save directly to agency settings (built-in preset or custom edits)
        const result = await saveAgencyColors(currentColors);
        if (result.success) {
          onSaveComplete?.();
          setHasUnsavedChanges(false);
          return true;
        } else {
          toast.error(result.error || 'Failed to save');
          return false;
        }
      }
    } finally {
      setIsSaving(false);
    }
  }, [hasUnsavedChanges, selectedPresetId, onSaveComplete]);

  // Register the save handler with parent on mount
  useEffect(() => {
    onRegisterSaveHandler?.(saveNow);
    return () => {
      onRegisterSaveHandler?.(null);
    };
  }, [saveNow, onRegisterSaveHandler]);

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
      setSelectedPresetId(null); // Built-in presets save directly to agency settings
      debouncedSave(preset.colors);
    }
  }, [debouncedSave]);

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
      {/* Main 3-Panel Layout with Resizable Panels */}
      <div className="flex gap-0">
        {/* Left Panel - Theme Gallery */}
        <div
          className="flex-shrink-0 transition-all duration-200 ease-in-out overflow-hidden"
          style={{ width: leftCollapsed ? 0 : leftWidth }}
        >
          <div className="pr-2" style={{ width: leftWidth }}>
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
        </div>

        {/* Left Resize Handle */}
        {!leftCollapsed && (
          <ResizeHandle
            onDragStart={(clientX) => startDrag('left', clientX)}
            className="mx-1"
          />
        )}

        {/* Left Collapse Button */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-5 flex-shrink-0 hover:bg-muted/50"
                onClick={toggleLeftCollapse}
              >
                {leftCollapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {leftCollapsed ? 'Expand left panel' : 'Collapse left panel'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Center Panel - Preview */}
        <div className="flex-1 min-w-[400px] mx-2">
          <PreviewPanel colors={displayColors} />
        </div>

        {/* Right Collapse Button */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-5 flex-shrink-0 hover:bg-muted/50"
                onClick={toggleRightCollapse}
              >
                {rightCollapsed ? (
                  <PanelRightOpen className="h-4 w-4" />
                ) : (
                  <PanelRightClose className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              {rightCollapsed ? 'Expand right panel' : 'Collapse right panel'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Right Resize Handle */}
        {!rightCollapsed && (
          <ResizeHandle
            onDragStart={(clientX) => startDrag('right', clientX)}
            className="mx-1"
          />
        )}

        {/* Right Panel - Color Studio */}
        <div
          className="flex-shrink-0 transition-all duration-200 ease-in-out overflow-hidden"
          style={{ width: rightCollapsed ? 0 : rightWidth }}
        >
          <div className="pl-2" style={{ width: rightWidth }}>
            <ColorStudio
              colors={colors}
              onColorChange={handleColorChange}
              onColorsChange={handleColorsChange}
              onExtractedColors={handleExtractedColors}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
