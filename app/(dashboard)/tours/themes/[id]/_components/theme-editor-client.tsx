'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Save, Star, Undo2, Redo2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ThemePreview } from './theme-preview';
import { ColorControl } from './color-control';
import { updateTheme, setDefaultTheme } from '../../../_actions/theme-actions';
import {
  FONT_OPTIONS,
  SHADOW_PRESETS,
  POPOVER_SIZE_PRESETS,
  DEFAULT_THEME_COLORS,
  DEFAULT_THEME_TYPOGRAPHY,
  DEFAULT_THEME_BORDERS,
  DEFAULT_THEME_SHADOWS,
  type PopoverSize,
  type ProgressStyle,
} from '../../../_lib/theme-constants';
import type { TourTheme, TourThemeColors, TourThemeTypography, TourThemeBorders, TourThemeShadows } from '@/types/database';

interface ThemeEditorClientProps {
  theme: TourTheme;
  backHref?: string;
}

interface ThemeState {
  name: string;
  colors: TourThemeColors;
  typography: TourThemeTypography;
  borders: TourThemeBorders;
  shadows: TourThemeShadows;
  popover_size: PopoverSize;
  progress_style: ProgressStyle;
}

// Maximum undo history
const MAX_HISTORY = 20;

export function ThemeEditorClient({ theme, backHref = '/tours' }: ThemeEditorClientProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);

  // Extract initial state from theme
  const getInitialState = useCallback((): ThemeState => {
    const buttons = theme.buttons as Record<string, unknown> || {};
    const settings = (buttons._settings as Record<string, unknown>) || {};

    return {
      name: theme.name,
      colors: theme.colors as TourThemeColors,
      typography: theme.typography as TourThemeTypography,
      borders: theme.borders as TourThemeBorders,
      shadows: theme.shadows as TourThemeShadows,
      popover_size: (settings.popover_size as PopoverSize) || 'medium',
      progress_style: (settings.progress_style as ProgressStyle) || 'dots',
    };
  }, [theme]);

  // Current state
  const [state, setState] = useState<ThemeState>(getInitialState);

  // Undo/Redo history
  const [history, setHistory] = useState<ThemeState[]>([getInitialState()]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Track if we have unsaved changes
  const initialStateRef = useRef(getInitialState());
  const hasChanges = JSON.stringify(state) !== JSON.stringify(initialStateRef.current);

  // Push state to history
  const pushHistory = useCallback((newState: ThemeState) => {
    setHistory(prev => {
      // Remove any future states if we're not at the end
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newState);
      // Limit history size
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [historyIndex]);

  // Update state and add to history
  const updateState = useCallback((updates: Partial<ThemeState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      pushHistory(newState);
      return newState;
    });
  }, [pushHistory]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setState(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setState(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  // Reset to initial
  const resetToInitial = useCallback(() => {
    const initial = getInitialState();
    setState(initial);
    setHistory([initial]);
    setHistoryIndex(0);
    toast.info('Reset to saved state');
  }, [getInitialState]);

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateTheme(theme.id, {
        name: state.name,
        colors: state.colors,
        typography: state.typography,
        borders: state.borders,
        shadows: state.shadows,
        popover_size: state.popover_size,
        progress_style: state.progress_style,
      });
      toast.success('Theme saved');
      // Update initial state ref
      initialStateRef.current = { ...state };
      router.refresh();
    } catch (error) {
      toast.error('Failed to save', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle set as default
  const handleSetDefault = async () => {
    setIsSettingDefault(true);
    try {
      await setDefaultTheme(theme.id);
      toast.success('Theme set as default');
      router.refresh();
    } catch (error) {
      toast.error('Failed to set default', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSettingDefault(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Update nested state helpers
  const updateColors = (key: keyof TourThemeColors, value: string) => {
    updateState({ colors: { ...state.colors, [key]: value } });
  };

  const updateTypography = (key: keyof TourThemeTypography, value: string) => {
    updateState({ typography: { ...state.typography, [key]: value } });
  };

  const updateBorders = (key: keyof TourThemeBorders, value: string) => {
    updateState({ borders: { ...state.borders, [key]: value } });
  };

  const updateShadows = (key: keyof TourThemeShadows, value: string) => {
    updateState({ shadows: { ...state.shadows, [key]: value } });
  };

  // Get current shadow preset name (normalize strings for comparison)
  const getCurrentShadowPreset = () => {
    const current = state.shadows.tooltip?.replace(/\s+/g, ' ').trim() || '';
    const preset = SHADOW_PRESETS.find(p =>
      p.css.replace(/\s+/g, ' ').trim() === current
    );
    return preset?.value || 'medium';
  };

  // Parse border radius for slider
  const getBorderRadiusValue = () => {
    const match = state.borders.radius.match(/(\d+)/);
    return match ? parseInt(match[1]) : 8;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background sticky top-0 z-10">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-4">
            <Link
              href={backHref}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <Input
                value={state.name}
                onChange={(e) => updateState({ name: e.target.value })}
                className="h-8 w-48 font-medium"
              />
              {theme.is_default && (
                <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                  <Star className="h-3 w-3 fill-amber-500" />
                  Default
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Undo/Redo */}
            <div className="flex items-center gap-1 mr-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={undo}
                disabled={historyIndex === 0}
                title="Undo (Cmd+Z)"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={redo}
                disabled={historyIndex === history.length - 1}
                title="Redo (Cmd+Shift+Z)"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={resetToInitial}
                disabled={!hasChanges}
                title="Reset to saved"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {!theme.is_default && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSetDefault}
                disabled={isSettingDefault}
              >
                <Star className="h-4 w-4 mr-1" />
                Set as Default
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
            >
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Controls */}
        <div className="w-96 border-r overflow-y-auto bg-muted/30">
          <div className="p-6 space-y-8">
            {/* Colors Section */}
            <section className="space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Colors
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <ColorControl
                  label="Background"
                  value={state.colors.background}
                  onChange={(v) => updateColors('background', v)}
                />
                <ColorControl
                  label="Text"
                  value={state.colors.text}
                  onChange={(v) => updateColors('text', v)}
                />
                <ColorControl
                  label="Text Secondary"
                  value={state.colors.text_secondary}
                  onChange={(v) => updateColors('text_secondary', v)}
                />
                <ColorControl
                  label="Border"
                  value={state.colors.border}
                  onChange={(v) => updateColors('border', v)}
                />
                <ColorControl
                  label="Primary (Button)"
                  value={state.colors.primary}
                  onChange={(v) => updateColors('primary', v)}
                />
                <ColorControl
                  label="Secondary"
                  value={state.colors.secondary}
                  onChange={(v) => updateColors('secondary', v)}
                />
              </div>

              <ColorControl
                label="Backdrop Overlay"
                value={state.colors.overlay}
                onChange={(v) => updateColors('overlay', v)}
                showOpacity
              />
            </section>

            <Separator />

            {/* Typography Section */}
            <section className="space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Typography
              </h3>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm">Font Family</Label>
                  <Select
                    value={state.typography.font_family}
                    onValueChange={(v) => updateTypography('font_family', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map((font) => (
                        <SelectItem
                          key={font.value}
                          value={font.value}
                          style={{ fontFamily: font.value }}
                        >
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <Separator />

            {/* Size & Shape Section */}
            <section className="space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Size & Shape
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Popover Size</Label>
                  <RadioGroup
                    value={state.popover_size}
                    onValueChange={(v) => {
                      const size = v as PopoverSize;
                      const preset = POPOVER_SIZE_PRESETS[size];
                      updateState({
                        popover_size: size,
                        typography: {
                          ...state.typography,
                          title_size: preset.title_size,
                          body_size: preset.body_size,
                        },
                      });
                    }}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="small" id="size-small" />
                      <Label htmlFor="size-small" className="cursor-pointer">Small</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="size-medium" />
                      <Label htmlFor="size-medium" className="cursor-pointer">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="large" id="size-large" />
                      <Label htmlFor="size-large" className="cursor-pointer">Large</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Border Radius</Label>
                    <span className="text-xs text-muted-foreground font-mono">
                      {getBorderRadiusValue()}px
                    </span>
                  </div>
                  <Slider
                    value={[getBorderRadiusValue()]}
                    onValueChange={([v]) => updateBorders('radius', `${v}px`)}
                    min={0}
                    max={24}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Shadow</Label>
                  <Select
                    value={getCurrentShadowPreset()}
                    onValueChange={(v) => {
                      const preset = SHADOW_PRESETS.find(p => p.value === v);
                      if (preset) {
                        // Update both shadows in a single state update to avoid race conditions
                        updateState({
                          shadows: {
                            ...state.shadows,
                            tooltip: preset.css,
                            modal: preset.css,
                          }
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SHADOW_PRESETS.map((preset) => (
                        <SelectItem key={preset.value} value={preset.value}>
                          {preset.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <Separator />

            {/* Progress Indicator Section */}
            <section className="space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Progress Indicator
              </h3>

              <div className="space-y-2">
                <Label className="text-sm">Style</Label>
                <RadioGroup
                  value={state.progress_style}
                  onValueChange={(v) => updateState({ progress_style: v as ProgressStyle })}
                  className="grid grid-cols-2 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dots" id="progress-dots" />
                    <Label htmlFor="progress-dots" className="cursor-pointer">
                      Dots
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="numbers" id="progress-numbers" />
                    <Label htmlFor="progress-numbers" className="cursor-pointer">
                      Numbers (1/3)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bar" id="progress-bar" />
                    <Label htmlFor="progress-bar" className="cursor-pointer">
                      Progress Bar
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="progress-none" />
                    <Label htmlFor="progress-none" className="cursor-pointer">
                      Hidden
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </section>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 bg-muted/10 overflow-y-auto">
          <ThemePreview
            colors={state.colors}
            typography={state.typography}
            borders={state.borders}
            shadows={state.shadows}
            popoverSize={state.popover_size}
            progressStyle={state.progress_style}
          />
        </div>
      </div>
    </div>
  );
}
