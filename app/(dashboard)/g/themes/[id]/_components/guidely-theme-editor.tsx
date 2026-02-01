'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ArrowLeft,
  Save,
  Star,
  Undo2,
  Redo2,
  RotateCcw,
  ChevronDown,
  Copy,
  Check,
  AlertCircle,
  User,
  MapPin,
  MessageSquare,
  Flag,
  CheckSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ColorControl } from './color-control';
import { ThemePreviewPanel } from './theme-preview-panel';
import { updateGuidelyTheme, setDefaultGuidelyTheme } from '../../_actions/guidely-theme-actions';
import {
  FONT_OPTIONS,
  SHADOW_OPTIONS,
  BUTTON_STYLE_OPTIONS,
  PROGRESS_STYLE_OPTIONS,
  FONT_SIZE_OPTIONS,
  BODY_SIZE_OPTIONS,
  hasGoodContrast,
  parseRadius,
  formatRadius,
} from '@/lib/guidely-theme-defaults';
import type {
  GuidelyTheme,
  GuidelyThemeColors,
  GuidelyThemeTypography,
  GuidelyThemeShape,
  GuidelyThemeShadows,
  GuidelyThemeAvatar,
  GuidelyThemeButtonConfig,
  GuidelyTourOverrides,
  GuidelySmartTipOverrides,
  GuidelyBannerOverrides,
  GuidelyChecklistOverrides,
} from '@/types/database';

interface ThemeUsage {
  tours: { id: string; name: string }[];
  smart_tips: { id: string; name: string }[];
  banners: { id: string; name: string }[];
  checklists: { id: string; name: string }[];
  total: number;
}

interface GuidelyThemeEditorProps {
  theme: GuidelyTheme;
  usage: ThemeUsage;
  canEdit: boolean;
}

type PreviewType = 'tour' | 'tip' | 'banner' | 'checklist';

interface ThemeState {
  name: string;
  description: string | null;
  colors: GuidelyThemeColors;
  typography: GuidelyThemeTypography;
  borders: GuidelyThemeShape;
  shadows: GuidelyThemeShadows;
  avatar: GuidelyThemeAvatar;
  buttons: GuidelyThemeButtonConfig;
  tour_overrides: GuidelyTourOverrides;
  smart_tip_overrides: GuidelySmartTipOverrides;
  banner_overrides: GuidelyBannerOverrides;
  checklist_overrides: GuidelyChecklistOverrides;
}

const MAX_HISTORY = 20;

export function GuidelyThemeEditor({
  theme,
  usage,
  canEdit,
}: GuidelyThemeEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);
  const [previewType, setPreviewType] = useState<PreviewType>('tour');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // Collapsible sections
  const [colorsExpanded, setColorsExpanded] = useState(true);
  const [tourOverridesOpen, setTourOverridesOpen] = useState(false);
  const [tipOverridesOpen, setTipOverridesOpen] = useState(false);
  const [bannerOverridesOpen, setBannerOverridesOpen] = useState(false);
  const [checklistOverridesOpen, setChecklistOverridesOpen] = useState(false);

  // Extract initial state from theme
  const getInitialState = useCallback((): ThemeState => {
    return {
      name: theme.name,
      description: theme.description,
      colors: theme.colors as GuidelyThemeColors,
      typography: theme.typography as GuidelyThemeTypography,
      borders: theme.borders as GuidelyThemeShape,
      shadows: theme.shadows as GuidelyThemeShadows,
      avatar: theme.avatar as GuidelyThemeAvatar,
      buttons: theme.buttons as GuidelyThemeButtonConfig,
      tour_overrides: theme.tour_overrides as GuidelyTourOverrides,
      smart_tip_overrides: theme.smart_tip_overrides as GuidelySmartTipOverrides,
      banner_overrides: theme.banner_overrides as GuidelyBannerOverrides,
      checklist_overrides: theme.checklist_overrides as GuidelyChecklistOverrides,
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
  const pushHistory = useCallback(
    (newState: ThemeState) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(newState);
        if (newHistory.length > MAX_HISTORY) {
          newHistory.shift();
          return newHistory;
        }
        return newHistory;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1));
    },
    [historyIndex]
  );

  // Update state and add to history
  const updateState = useCallback(
    (updates: Partial<ThemeState>) => {
      setState((prev) => {
        const newState = { ...prev, ...updates };
        pushHistory(newState);
        return newState;
      });
    },
    [pushHistory]
  );

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setState(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
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
    if (!canEdit) return;
    setIsSaving(true);
    try {
      await updateGuidelyTheme(theme.id, {
        name: state.name,
        description: state.description,
        colors: state.colors,
        typography: state.typography,
        borders: state.borders,
        shadows: state.shadows,
        avatar: state.avatar,
        buttons: state.buttons,
        tour_overrides: state.tour_overrides,
        smart_tip_overrides: state.smart_tip_overrides,
        banner_overrides: state.banner_overrides,
        checklist_overrides: state.checklist_overrides,
      });
      toast.success('Theme saved');
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
      await setDefaultGuidelyTheme(theme.id);
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

  // Copy color to clipboard
  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
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
  const updateColors = (key: keyof GuidelyThemeColors, value: string) => {
    updateState({ colors: { ...state.colors, [key]: value } });
  };

  const updateTypography = (key: keyof GuidelyThemeTypography, value: string) => {
    updateState({ typography: { ...state.typography, [key]: value } });
  };

  const updateBorders = (key: keyof GuidelyThemeShape, value: string) => {
    updateState({ borders: { ...state.borders, [key]: value } });
  };

  const updateShadows = (key: keyof GuidelyThemeShadows, value: string) => {
    updateState({ shadows: { ...state.shadows, [key]: value } });
  };

  const updateButtons = (updates: Partial<GuidelyThemeButtonConfig>) => {
    updateState({ buttons: { ...state.buttons, ...updates } });
  };

  const updateTourOverrides = (updates: Partial<GuidelyTourOverrides>) => {
    updateState({ tour_overrides: { ...state.tour_overrides, ...updates } });
  };

  const updateSmartTipOverrides = (updates: Partial<GuidelySmartTipOverrides>) => {
    updateState({ smart_tip_overrides: { ...state.smart_tip_overrides, ...updates } });
  };

  const updateBannerOverrides = (updates: Partial<GuidelyBannerOverrides>) => {
    updateState({ banner_overrides: { ...state.banner_overrides, ...updates } });
  };

  const updateChecklistOverrides = (updates: Partial<GuidelyChecklistOverrides>) => {
    updateState({ checklist_overrides: { ...state.checklist_overrides, ...updates } });
  };

  // Get contrast status for important color pairs
  const textBgContrast = hasGoodContrast(state.colors.text, state.colors.background);
  const primaryTextContrast = hasGoodContrast(
    state.colors.primary_text,
    state.colors.primary
  );

  // Get current shadow preset value
  const getCurrentShadowValue = () => {
    const preset = SHADOW_OPTIONS.find((p) => p.css === state.shadows.tooltip);
    return preset?.value || 'medium';
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b bg-background sticky top-0 z-10">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-4">
            <Link
              href="/g/themes"
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
                disabled={!canEdit}
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

            {!theme.is_default && canEdit && (
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
              disabled={isSaving || !hasChanges || !canEdit}
            >
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Controls (scrollable) */}
        <div className="w-[400px] border-r bg-muted/30 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Usage Badge */}
            {usage.total > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full cursor-help">
                      Used by {usage.total} item{usage.total > 1 ? 's' : ''}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs" side="right">
                    <div className="space-y-2 text-xs">
                      {usage.tours.length > 0 && (
                        <div>
                          <div className="font-medium flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Tours ({usage.tours.length})
                          </div>
                          <div className="text-muted-foreground">
                            {usage.tours.map((t) => t.name).join(', ')}
                          </div>
                        </div>
                      )}
                      {usage.smart_tips.length > 0 && (
                        <div>
                          <div className="font-medium flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            Smart Tips ({usage.smart_tips.length})
                          </div>
                          <div className="text-muted-foreground">
                            {usage.smart_tips.map((t) => t.name).join(', ')}
                          </div>
                        </div>
                      )}
                      {usage.banners.length > 0 && (
                        <div>
                          <div className="font-medium flex items-center gap-1">
                            <Flag className="h-3 w-3" />
                            Banners ({usage.banners.length})
                          </div>
                          <div className="text-muted-foreground">
                            {usage.banners.map((t) => t.name).join(', ')}
                          </div>
                        </div>
                      )}
                      {usage.checklists.length > 0 && (
                        <div>
                          <div className="font-medium flex items-center gap-1">
                            <CheckSquare className="h-3 w-3" />
                            Checklists ({usage.checklists.length})
                          </div>
                          <div className="text-muted-foreground">
                            {usage.checklists.map((t) => t.name).join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Main Colors Section */}
            <section className="space-y-4">
              <Collapsible open={colorsExpanded} onOpenChange={setColorsExpanded}>
                <CollapsibleTrigger className="flex items-center justify-between w-full group">
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                    Main Colors
                  </h3>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-muted-foreground transition-transform',
                      colorsExpanded && 'rotate-180'
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <ColorControl
                      label="Primary"
                      value={state.colors.primary}
                      onChange={(v) => updateColors('primary', v)}
                      onCopy={copyColor}
                      copied={copiedColor}
                    />
                    <ColorControl
                      label="Primary Hover"
                      value={state.colors.primary_hover}
                      onChange={(v) => updateColors('primary_hover', v)}
                      onCopy={copyColor}
                      copied={copiedColor}
                    />
                    <div className="col-span-2">
                      <ColorControl
                        label="Primary Text"
                        value={state.colors.primary_text}
                        onChange={(v) => updateColors('primary_text', v)}
                        onCopy={copyColor}
                        copied={copiedColor}
                      />
                      {!primaryTextContrast && (
                        <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                          <AlertCircle className="h-3 w-3" />
                          Low contrast with primary background
                        </div>
                      )}
                    </div>
                    <ColorControl
                      label="Secondary"
                      value={state.colors.secondary}
                      onChange={(v) => updateColors('secondary', v)}
                      onCopy={copyColor}
                      copied={copiedColor}
                    />
                    <ColorControl
                      label="Secondary Hover"
                      value={state.colors.secondary_hover}
                      onChange={(v) => updateColors('secondary_hover', v)}
                      onCopy={copyColor}
                      copied={copiedColor}
                    />
                    <ColorControl
                      label="Background"
                      value={state.colors.background}
                      onChange={(v) => updateColors('background', v)}
                      onCopy={copyColor}
                      copied={copiedColor}
                    />
                    <ColorControl
                      label="Border"
                      value={state.colors.border}
                      onChange={(v) => updateColors('border', v)}
                      onCopy={copyColor}
                      copied={copiedColor}
                    />
                    <div className="col-span-2">
                      <ColorControl
                        label="Text"
                        value={state.colors.text}
                        onChange={(v) => updateColors('text', v)}
                        onCopy={copyColor}
                        copied={copiedColor}
                      />
                      {!textBgContrast && (
                        <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                          <AlertCircle className="h-3 w-3" />
                          Low contrast with background
                        </div>
                      )}
                    </div>
                    <ColorControl
                      label="Text Secondary"
                      value={state.colors.text_secondary}
                      onChange={(v) => updateColors('text_secondary', v)}
                      onCopy={copyColor}
                      copied={copiedColor}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </section>

            <Separator />

            {/* Typography Section */}
            <section className="space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Typography
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Font Family</Label>
                  <Select
                    value={state.typography.font_family}
                    onValueChange={(v) => updateTypography('font_family', v)}
                    disabled={!canEdit}
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Title Size</Label>
                    <Select
                      value={state.typography.title_size}
                      onValueChange={(v) => updateTypography('title_size', v)}
                      disabled={!canEdit}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_SIZE_OPTIONS.map((size) => (
                          <SelectItem key={size.value} value={size.value}>
                            {size.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Body Size</Label>
                    <Select
                      value={state.typography.body_size}
                      onValueChange={(v) => updateTypography('body_size', v)}
                      disabled={!canEdit}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BODY_SIZE_OPTIONS.map((size) => (
                          <SelectItem key={size.value} value={size.value}>
                            {size.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* Shape Section */}
            <section className="space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Shape
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Border Radius</Label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 border-2 border-foreground/30 bg-muted"
                        style={{
                          borderRadius: state.borders.radius,
                        }}
                      />
                      <span className="text-xs text-muted-foreground font-mono w-10">
                        {state.borders.radius}
                      </span>
                    </div>
                  </div>
                  <Slider
                    value={[parseRadius(state.borders.radius)]}
                    onValueChange={([v]) => updateBorders('radius', formatRadius(v))}
                    min={0}
                    max={24}
                    step={1}
                    disabled={!canEdit}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Shadow</Label>
                  <Select
                    value={getCurrentShadowValue()}
                    onValueChange={(v) => {
                      const preset = SHADOW_OPTIONS.find((p) => p.value === v);
                      if (preset) {
                        updateState({
                          shadows: {
                            ...state.shadows,
                            tooltip: preset.css,
                            modal: preset.css,
                          },
                        });
                      }
                    }}
                    disabled={!canEdit}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SHADOW_OPTIONS.map((preset) => (
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

            {/* Buttons Section */}
            <section className="space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Buttons
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Style</Label>
                  <Select
                    value={state.buttons.style}
                    onValueChange={(v) =>
                      updateButtons({ style: v as 'filled' | 'outline' | 'ghost' })
                    }
                    disabled={!canEdit}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BUTTON_STYLE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Button Radius</Label>
                    <span className="text-xs text-muted-foreground font-mono">
                      {state.buttons.border_radius}
                    </span>
                  </div>
                  <Slider
                    value={[parseRadius(state.buttons.border_radius)]}
                    onValueChange={([v]) =>
                      updateButtons({ border_radius: formatRadius(v) })
                    }
                    min={0}
                    max={16}
                    step={1}
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </section>

            <Separator />

            {/* Component-Specific Overrides */}
            <section className="space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Component Overrides
              </h3>

              {/* Tours Overrides */}
              <Collapsible open={tourOverridesOpen} onOpenChange={setTourOverridesOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Tours
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      tourOverridesOpen && 'rotate-180'
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3 space-y-4">
                  <ColorControl
                    label="Progress Color"
                    value={state.tour_overrides.progress_color || state.colors.primary}
                    onChange={(v) => updateTourOverrides({ progress_color: v })}
                    onCopy={copyColor}
                    copied={copiedColor}
                  />
                  <ColorControl
                    label="Backdrop Color"
                    value={state.tour_overrides.backdrop_color || 'rgba(0,0,0,0.5)'}
                    onChange={(v) => updateTourOverrides({ backdrop_color: v })}
                    onCopy={copyColor}
                    copied={copiedColor}
                    showOpacity
                  />
                  <div className="space-y-2">
                    <Label className="text-sm">Progress Style</Label>
                    <Select
                      value={state.tour_overrides.progress_style}
                      onValueChange={(v) =>
                        updateTourOverrides({
                          progress_style: v as 'dots' | 'numbers' | 'bar',
                        })
                      }
                      disabled={!canEdit}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROGRESS_STYLE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Smart Tips Overrides */}
              <Collapsible open={tipOverridesOpen} onOpenChange={setTipOverridesOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Smart Tips
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      tipOverridesOpen && 'rotate-180'
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3 space-y-4">
                  <ColorControl
                    label="Tooltip Background"
                    value={
                      state.smart_tip_overrides.tooltip_background ||
                      state.colors.background
                    }
                    onChange={(v) =>
                      updateSmartTipOverrides({ tooltip_background: v })
                    }
                    onCopy={copyColor}
                    copied={copiedColor}
                  />
                  <ColorControl
                    label="Beacon Color"
                    value={
                      state.smart_tip_overrides.beacon_color || state.colors.primary
                    }
                    onChange={(v) => updateSmartTipOverrides({ beacon_color: v })}
                    onCopy={copyColor}
                    copied={copiedColor}
                  />
                </CollapsibleContent>
              </Collapsible>

              {/* Banners Overrides */}
              <Collapsible
                open={bannerOverridesOpen}
                onOpenChange={setBannerOverridesOpen}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4" />
                    Banners
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      bannerOverridesOpen && 'rotate-180'
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3 space-y-4">
                  <ColorControl
                    label="Banner Background"
                    value={
                      state.banner_overrides.banner_background || state.colors.primary
                    }
                    onChange={(v) => updateBannerOverrides({ banner_background: v })}
                    onCopy={copyColor}
                    copied={copiedColor}
                  />
                  <ColorControl
                    label="Banner Text"
                    value={
                      state.banner_overrides.banner_text || state.colors.primary_text
                    }
                    onChange={(v) => updateBannerOverrides({ banner_text: v })}
                    onCopy={copyColor}
                    copied={copiedColor}
                  />
                </CollapsibleContent>
              </Collapsible>

              {/* Checklists Overrides */}
              <Collapsible
                open={checklistOverridesOpen}
                onOpenChange={setChecklistOverridesOpen}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Checklists
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      checklistOverridesOpen && 'rotate-180'
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3 space-y-4">
                  <ColorControl
                    label="Header Background"
                    value={
                      state.checklist_overrides.header_background ||
                      state.colors.primary
                    }
                    onChange={(v) =>
                      updateChecklistOverrides({ header_background: v })
                    }
                    onCopy={copyColor}
                    copied={copiedColor}
                  />
                  <ColorControl
                    label="Completion Color"
                    value={
                      state.checklist_overrides.completion_color ||
                      state.colors.primary
                    }
                    onChange={(v) =>
                      updateChecklistOverrides({ completion_color: v })
                    }
                    onCopy={copyColor}
                    copied={copiedColor}
                  />
                </CollapsibleContent>
              </Collapsible>
            </section>
          </div>
        </div>

        {/* Right Panel - Preview (sticky, no scroll) */}
        <div className="flex-1 bg-muted/10 flex flex-col sticky top-14">
          {/* Preview Type Tabs */}
          <div className="p-4 border-b bg-background">
            <Tabs
              value={previewType}
              onValueChange={(v) => setPreviewType(v as PreviewType)}
            >
              <TabsList className="w-full justify-start">
                <TabsTrigger value="tour" className="gap-2">
                  <MapPin className="h-4 w-4" />
                  Tour
                </TabsTrigger>
                <TabsTrigger value="tip" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Smart Tip
                </TabsTrigger>
                <TabsTrigger value="banner" className="gap-2">
                  <Flag className="h-4 w-4" />
                  Banner
                </TabsTrigger>
                <TabsTrigger value="checklist" className="gap-2">
                  <CheckSquare className="h-4 w-4" />
                  Checklist
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Preview Area */}
          <div className="flex-1 flex items-center justify-center p-8">
            <ThemePreviewPanel
              previewType={previewType}
              colors={state.colors}
              typography={state.typography}
              borders={state.borders}
              shadows={state.shadows}
              buttons={state.buttons}
              tourOverrides={state.tour_overrides}
              smartTipOverrides={state.smart_tip_overrides}
              bannerOverrides={state.banner_overrides}
              checklistOverrides={state.checklist_overrides}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
