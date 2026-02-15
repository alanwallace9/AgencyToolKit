'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Trash2,
  Layers,
  Move,
  Palette,
  ImageIcon,
  AlignCenterHorizontal,
  AlignCenterVertical,
  ChevronDown,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { CustomColorPicker } from '@/components/shared/custom-color-picker';
import { FormStylePanel } from './form-style-panel';
import { cn } from '@/lib/utils';
import type {
  CanvasElement,
  LoginDesignBackground,
  LoginDesignFormStyle,
  LoginLayoutType,
  ColorConfig,
} from '@/types/database';

// Parse rgba color to extract opacity (0-100)
function parseOpacity(color: string | undefined): number {
  if (!color) return 100;
  const rgbaMatch = color.match(/rgba?\([\d\s,]+,\s*([\d.]+)\)/);
  if (rgbaMatch) {
    return Math.round(parseFloat(rgbaMatch[1]) * 100);
  }
  if (color.length === 9 && color.startsWith('#')) {
    const alpha = parseInt(color.slice(7), 16);
    return Math.round((alpha / 255) * 100);
  }
  return 100;
}

// Parse hex color from various formats
function parseHex(color: string | undefined): string {
  if (!color) return '#000000';
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1]);
    const g = parseInt(rgbaMatch[2]);
    const b = parseInt(rgbaMatch[3]);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  if (color.length === 9 && color.startsWith('#')) {
    return color.slice(0, 7);
  }
  return color;
}

// Format color with opacity as rgba
function formatWithOpacity(hex: string, opacity: number): string {
  if (opacity >= 100) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
}

// Background image position presets
const IMAGE_POSITION_PRESETS = [
  { label: 'Full Cover', position: 'center', size: 'cover' },
  { label: 'Left Half', position: 'left center', size: '50% 100%' },
  { label: 'Right Half', position: 'right center', size: '50% 100%' },
  { label: 'Above Form', position: 'center 10%', size: '200px auto' },
] as const;

// Default element sizes and positions (Rule of 4 - divisible by 16)
const ELEMENT_DEFAULTS: Record<string, { width: number; height: number; x: number; y: number }> = {
  'login-form': { width: 400, height: 400, x: 37.5, y: 25 },
};

// Login form positions based on preset layout
const getLoginFormPosition = (layout: LoginLayoutType | null): { x: number; y: number } => {
  switch (layout) {
    case 'split-left':
      // Image on left, form on right
      return { x: 62, y: 18 };
    case 'split-right':
      // Form on left, image on right
      return { x: 12, y: 18 };
    case 'centered':
    case 'gradient-overlay':
    default:
      // Centered layouts
      return { x: 37.5, y: 25 };
  }
};

// Default element props by type
const ELEMENT_PROP_DEFAULTS: Record<string, any> = {
  'login-form': { variant: 'default' },
};

interface PropertiesPanelProps {
  element: CanvasElement | null;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onDelete: () => void;
  canvasWidth?: number;
  canvasHeight?: number;
  formStyle?: LoginDesignFormStyle;
  onFormStyleChange?: (formStyle: LoginDesignFormStyle) => void;
  // Background image controls
  background?: LoginDesignBackground;
  onBackgroundChange?: (background: LoginDesignBackground) => void;
  brandColors?: ColorConfig | null;
  // Active preset for calculating reset positions
  activePreset?: LoginLayoutType | null;
}

export function PropertiesPanel({
  element,
  onUpdate,
  onDelete,
  canvasWidth = 1600,
  canvasHeight = 900,
  formStyle,
  onFormStyleChange,
  background,
  onBackgroundChange,
  brandColors,
  activePreset = null,
}: PropertiesPanelProps) {
  const showBackgroundImage = background?.type === 'image' && onBackgroundChange;

  if (!element) {
    // When no element is selected, show background image controls (if applicable)
    if (showBackgroundImage) {
      return (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              Background Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BackgroundImageProperties
              background={background}
              onBackgroundChange={onBackgroundChange}
              brandColors={brandColors}
            />
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Palette className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Select an element to edit its properties
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const updateProps = (propUpdates: Partial<CanvasElement['props']>) => {
    onUpdate({
      props: { ...element.props, ...propUpdates } as CanvasElement['props'],
    });
  };

  // Calculate centered positions
  const elementWidthPercent = (element.width / canvasWidth) * 100;
  const elementHeightPercent = (element.height / canvasHeight) * 100;

  // Full canvas centering
  const centeredX = Math.round(((100 - elementWidthPercent) / 2) * 10) / 10;
  const centeredY = Math.round(((100 - elementHeightPercent) / 2) * 10) / 10;

  // Context-aware centering for split layouts
  // Center on left half (0-50% of canvas)
  const centeredLeftX = Math.round(((50 - elementWidthPercent) / 2) * 10) / 10;
  // Center on right half (50-100% of canvas)
  const centeredRightX = Math.round((50 + (50 - elementWidthPercent) / 2) * 10) / 10;
  // Center on top half
  const centeredTopY = Math.round(((50 - elementHeightPercent) / 2) * 10) / 10;
  // Center on bottom half
  const centeredBottomY = Math.round((50 + (50 - elementHeightPercent) / 2) * 10) / 10;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium capitalize">
            {element.type.replace('-', ' ')}
          </CardTitle>
          <div className="flex items-center gap-1">
            {/* Reset Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    const defaults = ELEMENT_DEFAULTS[element.type];
                    if (defaults) {
                      onUpdate({ width: defaults.width, height: defaults.height });
                    }
                  }}
                >
                  Reset Size
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const defaults = ELEMENT_DEFAULTS[element.type];
                    if (defaults) {
                      // For login-form, use preset-aware position
                      if (element.type === 'login-form') {
                        const presetPosition = getLoginFormPosition(activePreset);
                        onUpdate({ x: presetPosition.x, y: presetPosition.y });
                      } else {
                        onUpdate({ x: defaults.x, y: defaults.y });
                      }
                    }
                  }}
                >
                  Reset Position
                </DropdownMenuItem>
                {element.type !== 'login-form' && (
                  <DropdownMenuItem
                    onClick={() => {
                      const defaults = ELEMENT_PROP_DEFAULTS[element.type];
                      if (defaults) {
                        onUpdate({ props: { ...element.props, ...defaults } as any });
                      }
                    }}
                  >
                    Reset Properties
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    const sizeDefaults = ELEMENT_DEFAULTS[element.type];
                    const propDefaults = ELEMENT_PROP_DEFAULTS[element.type];
                    if (sizeDefaults && propDefaults) {
                      // For login-form, use preset-aware position
                      if (element.type === 'login-form') {
                        const presetPosition = getLoginFormPosition(activePreset);
                        onUpdate({
                          width: sizeDefaults.width,
                          height: sizeDefaults.height,
                          x: presetPosition.x,
                          y: presetPosition.y,
                          props: propDefaults,
                        });
                      } else {
                        onUpdate({
                          width: sizeDefaults.width,
                          height: sizeDefaults.height,
                          x: sizeDefaults.x,
                          y: sizeDefaults.y,
                          props: propDefaults,
                        });
                      }
                    }
                  }}
                >
                  Reset All
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Delete Button */}
            {element.type !== 'login-form' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Position */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Move className="h-3 w-3" />
            POSITION
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">X (%)</Label>
              <div className="flex gap-1">
                <Input
                  type="number"
                  value={Math.round(element.x)}
                  onChange={(e) => onUpdate({ x: Number(e.target.value) })}
                  className="h-8 flex-1 min-w-[3rem]"
                  min={0}
                  max={100}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 shrink-0"
                      title="Center horizontally"
                    >
                      <AlignCenterHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onUpdate({ x: centeredX })}>
                      Center on page
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUpdate({ x: centeredLeftX })}>
                      Center on left side
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUpdate({ x: centeredRightX })}>
                      Center on right side
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div>
              <Label className="text-xs">Y (%)</Label>
              <div className="flex gap-1">
                <Input
                  type="number"
                  value={Math.round(element.y)}
                  onChange={(e) => onUpdate({ y: Number(e.target.value) })}
                  className="h-8 flex-1 min-w-[3rem]"
                  min={0}
                  max={100}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 shrink-0"
                      title="Center vertically"
                    >
                      <AlignCenterVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onUpdate({ y: centeredY })}>
                      Center on page
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUpdate({ y: centeredTopY })}>
                      Center on top half
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUpdate({ y: centeredBottomY })}>
                      Center on bottom half
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Size */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Layers className="h-3 w-3" />
            SIZE
          </div>
          <div className={element.type === 'login-form' ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-2 gap-4'}>
            <div>
              <Label className="text-xs">Width (px)</Label>
              <Input
                type="number"
                value={element.width}
                onChange={(e) => onUpdate({ width: Number(e.target.value) })}
                className="h-8"
                min={element.type === 'login-form' ? 320 : 50}
              />
            </div>
            {element.type !== 'login-form' && (
              <div>
                <Label className="text-xs">Height (px)</Label>
                <Input
                  type="number"
                  value={element.height}
                  onChange={(e) => onUpdate({ height: Number(e.target.value) })}
                  className="h-8"
                  min={50}
                />
              </div>
            )}
          </div>
        </div>


        {/* Form Style — shown when login-form is selected */}
        {element.type === 'login-form' && formStyle && onFormStyleChange && (
          <div className="border-t pt-4">
            <FormStylePanel
              formStyle={formStyle}
              onChange={onFormStyleChange}
              brandColors={brandColors}
            />
          </div>
        )}

      </CardContent>
    </Card>
  );
}

// Background image properties component
function BackgroundImageProperties({
  background,
  onBackgroundChange,
  brandColors,
}: {
  background: LoginDesignBackground;
  onBackgroundChange: (background: LoginDesignBackground) => void;
  brandColors?: ColorConfig | null;
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const updateBackground = (updates: Partial<LoginDesignBackground>) => {
    onBackgroundChange({ ...background, ...updates });
  };

  const pickerBrandColors = brandColors ? {
    primary: brandColors.primary,
    accent: brandColors.accent,
    sidebar_bg: brandColors.sidebar_bg,
    sidebar_text: brandColors.sidebar_text,
  } : undefined;

  const overlayOpacity = background.image_overlay ? parseOpacity(background.image_overlay) : 0;
  const overlayHex = parseHex(background.image_overlay) || '#000000';

  return (
    <div className="space-y-4">
      {/* Image URL */}
      <div>
        <Label className="text-xs">Image URL</Label>
        <Input
          value={background.image_url || ''}
          onChange={(e) => updateBackground({ image_url: e.target.value })}
          placeholder="https://..."
          className="h-8"
        />
      </div>

      {/* Layout Presets — always visible */}
      <div>
        <Label className="text-xs mb-2 block">Layout</Label>
        <div className="grid grid-cols-2 gap-1.5">
          {IMAGE_POSITION_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => updateBackground({
                image_position: preset.position,
                image_size: preset.size,
              })}
              className={cn(
                'text-xs px-2 py-1.5 rounded border transition-colors',
                background.image_position === preset.position && background.image_size === preset.size
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'hover:border-primary/50'
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced: Custom Position & Size — collapsed by default */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          {advancedOpen ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
          Custom Position & Size
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-3">
          <div>
            <Label className="text-xs">Position</Label>
            <Input
              value={background.image_position || 'center'}
              onChange={(e) => updateBackground({ image_position: e.target.value })}
              placeholder="center, left center, 50% 20%..."
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs">Size</Label>
            <Input
              value={background.image_size || 'cover'}
              onChange={(e) => updateBackground({ image_size: e.target.value })}
              placeholder="cover, contain, 50% 100%..."
              className="h-8 text-xs"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Blur — 0 = off, no toggle needed */}
      <div>
        <Label className="text-xs">Blur ({background.image_blur || 0}px)</Label>
        <Slider
          value={[background.image_blur || 0]}
          onValueChange={([v]) => updateBackground({ image_blur: v })}
          min={0}
          max={20}
          step={1}
        />
      </div>

      {/* Overlay — opacity 0 = off, slide up to apply color */}
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Overlay Opacity ({overlayOpacity}%)</Label>
          <Slider
            value={[overlayOpacity]}
            onValueChange={([v]) => {
              if (v === 0) {
                updateBackground({ image_overlay: undefined });
              } else {
                updateBackground({ image_overlay: formatWithOpacity(overlayHex, v) });
              }
            }}
            min={0}
            max={100}
            step={5}
          />
        </div>
        {overlayOpacity > 0 && (
          <CustomColorPicker
            label="Overlay Color"
            value={overlayHex}
            onChange={(color) => {
              updateBackground({ image_overlay: formatWithOpacity(color, overlayOpacity) });
            }}
            showGradient={false}
            showTheme={!!brandColors}
            brandColors={pickerBrandColors}
          />
        )}
      </div>
    </div>
  );
}
