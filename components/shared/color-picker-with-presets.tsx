'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Palette, Star, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { COLOR_PRESETS } from '@/lib/constants';
import type { ColorConfig } from '@/types/database';
import { cn } from '@/lib/utils';

interface ColorPreset {
  id: string;
  name: string;
  is_default: boolean;
  colors: ColorConfig;
}

// Base color fields (excludes extended which is an object, not a string)
type BaseColorField = 'primary' | 'accent' | 'sidebar_bg' | 'sidebar_text';

interface ColorPickerWithPresetsProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
  /** Custom presets from database (user-created themes) */
  customPresets?: ColorPreset[];
  /** Which color field to extract from presets */
  colorField?: BaseColorField;
  /** Show harmony suggestions (only for primary color) */
  showHarmony?: boolean;
  /** Callback when a full theme is selected (all colors) */
  onApplyTheme?: (colors: ColorConfig) => void;
  /** Compact mode - smaller size */
  compact?: boolean;
  /** Show opacity slider - allows transparency adjustment */
  showOpacity?: boolean;
}

// Simple color name lookup
function getColorName(hex: string): string {
  const colors: Record<string, string> = {
    '#2563eb': 'Blue',
    '#1d4ed8': 'Dark Blue',
    '#06b6d4': 'Cyan',
    '#0891b2': 'Teal',
    '#16a34a': 'Green',
    '#059669': 'Emerald',
    '#84cc16': 'Lime',
    '#10b981': 'Mint',
    '#ea580c': 'Orange',
    '#f97316': 'Tangerine',
    '#f59e0b': 'Amber',
    '#fbbf24': 'Yellow',
    '#d97706': 'Gold',
    '#6366f1': 'Indigo',
    '#8b5cf6': 'Violet',
    '#ffffff': 'White',
    '#000000': 'Black',
    '#0f172a': 'Slate 900',
    '#1e293b': 'Slate 800',
    '#f8fafc': 'Slate 50',
    '#f0f9ff': 'Sky 50',
  };

  const normalized = hex.toLowerCase();
  return colors[normalized] || hex;
}

// Validate hex color (6 or 8 character)
function isValidHex(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(color);
}

// Normalize hex input
function normalizeHex(value: string): string {
  let hex = value.trim();
  if (!hex.startsWith('#')) {
    hex = '#' + hex;
  }
  return hex.toLowerCase();
}

// Parse color and extract base hex and opacity (0-100)
function parseColor(color: string): { hex: string; opacity: number } {
  if (!color) return { hex: '#000000', opacity: 100 };

  // Handle rgba() format
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1]);
    const g = parseInt(rgbaMatch[2]);
    const b = parseInt(rgbaMatch[3]);
    const a = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1;
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    return { hex, opacity: Math.round(a * 100) };
  }

  // Handle hex with alpha (#rrggbbaa)
  if (color.length === 9 && color.startsWith('#')) {
    const hex = color.slice(0, 7);
    const alpha = parseInt(color.slice(7), 16);
    return { hex, opacity: Math.round((alpha / 255) * 100) };
  }

  // Handle regular hex (#rrggbb)
  if (color.length === 7 && color.startsWith('#')) {
    return { hex: color, opacity: 100 };
  }

  return { hex: color, opacity: 100 };
}

// Format color with opacity
function formatColorWithOpacity(hex: string, opacity: number): string {
  if (opacity >= 100) return hex;

  // Convert to rgba for better CSS compatibility
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const a = Math.round(opacity) / 100;

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function ColorPickerWithPresets({
  label,
  value,
  onChange,
  description,
  customPresets = [],
  colorField = 'primary',
  showHarmony = false,
  onApplyTheme,
  compact = false,
  showOpacity = false,
}: ColorPickerWithPresetsProps) {
  // Parse initial value to separate hex and opacity
  const parsedInitial = parseColor(value);
  const [inputValue, setInputValue] = useState(parsedInitial.hex);
  const [opacity, setOpacity] = useState(parsedInitial.opacity);
  const [isPresetOpen, setIsPresetOpen] = useState(false);

  // Sync input when value prop changes
  useEffect(() => {
    const parsed = parseColor(value);
    if (parsed.hex !== inputValue) {
      setInputValue(parsed.hex);
    }
    if (parsed.opacity !== opacity) {
      setOpacity(parsed.opacity);
    }
  }, [value]);

  // Helper to emit color change with current opacity
  const emitColorChange = (hex: string, newOpacity?: number) => {
    const op = newOpacity !== undefined ? newOpacity : opacity;
    if (showOpacity && op < 100) {
      onChange(formatColorWithOpacity(hex, op));
    } else {
      onChange(hex);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (newValue.length >= 4) {
      const normalized = normalizeHex(newValue);
      if (isValidHex(normalized)) {
        emitColorChange(normalized);
      }
    }
  };

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    emitColorChange(newValue);
  };

  const handleOpacityChange = (values: number[]) => {
    const newOpacity = values[0];
    setOpacity(newOpacity);
    emitColorChange(inputValue, newOpacity);
  };

  const handlePresetSelect = (preset: typeof COLOR_PRESETS[number] | ColorPreset) => {
    if (onApplyTheme) {
      // Apply full theme
      onApplyTheme(preset.colors);
    } else {
      // Apply just the specific color field
      const color = preset.colors[colorField];
      setInputValue(color);
      setOpacity(100); // Reset opacity when selecting a preset
      onChange(color);
    }
    setIsPresetOpen(false);
  };

  return (
    <div className={cn('space-y-2', compact && 'space-y-1')}>
      <Label className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>
        {label}
      </Label>

      <div className="flex items-center gap-2">
        {/* Color Picker */}
        <div className="relative">
          <input
            type="color"
            value={inputValue}
            onChange={handleColorPickerChange}
            className={cn(
              'rounded-lg cursor-pointer border border-border',
              compact ? 'w-8 h-8' : 'w-10 h-10'
            )}
            style={{ padding: 0, opacity: showOpacity ? opacity / 100 : 1 }}
          />
        </div>

        {/* Hex Input */}
        <Input
          value={inputValue}
          onChange={handleInputChange}
          placeholder="#000000"
          className={cn('font-mono flex-1', compact ? 'h-8 text-xs' : 'h-10 text-sm')}
        />

        {/* From Theme Dropdown */}
        <Popover open={isPresetOpen} onOpenChange={setIsPresetOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size={compact ? 'sm' : 'default'}
              className={cn('gap-1', compact ? 'h-8 px-2' : 'h-10')}
            >
              <Palette className={cn(compact ? 'h-3 w-3' : 'h-4 w-4')} />
              <span className={cn('hidden sm:inline', compact && 'text-xs')}>
                Themes
              </span>
              <ChevronDown className={cn(compact ? 'h-3 w-3' : 'h-4 w-4')} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="end">
            <div className="space-y-2">
              {/* Custom Presets */}
              {customPresets.length > 0 && (
                <>
                  <div className="px-2 py-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      My Themes
                    </p>
                  </div>
                  {customPresets.map((preset) => (
                    <PresetButton
                      key={preset.id}
                      name={preset.name}
                      colors={preset.colors}
                      isDefault={preset.is_default}
                      isSelected={preset.colors[colorField] === value}
                      onClick={() => handlePresetSelect(preset)}
                    />
                  ))}
                  <div className="border-t my-2" />
                </>
              )}

              {/* Built-in Presets */}
              <div className="px-2 py-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Built-in Themes
                </p>
              </div>
              {COLOR_PRESETS.map((preset) => (
                <PresetButton
                  key={preset.id}
                  name={preset.label}
                  colors={preset.colors}
                  isSelected={preset.colors[colorField] === value}
                  onClick={() => handlePresetSelect(preset)}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Opacity Slider */}
      {showOpacity && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className={cn('text-muted-foreground', compact ? 'text-[10px]' : 'text-xs')}>
              Opacity
            </Label>
            <span className={cn('font-mono text-muted-foreground', compact ? 'text-[10px]' : 'text-xs')}>
              {opacity}%
            </span>
          </div>
          <Slider
            value={[opacity]}
            onValueChange={handleOpacityChange}
            min={0}
            max={100}
            step={1}
            className={cn(compact ? 'h-1' : 'h-2')}
          />
        </div>
      )}

      {/* Color Name / Description */}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <p className="text-xs text-muted-foreground/70">{getColorName(inputValue)}</p>
    </div>
  );
}

function PresetButton({
  name,
  colors,
  isDefault,
  isSelected,
  onClick,
}: {
  name: string;
  colors: ColorConfig;
  isDefault?: boolean;
  isSelected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors',
        isSelected
          ? 'bg-primary/10 text-primary'
          : 'hover:bg-accent/50'
      )}
    >
      {/* Color swatches */}
      <div className="flex -space-x-1">
        <div
          className="w-5 h-5 rounded-full border-2 border-background"
          style={{ backgroundColor: colors.primary }}
        />
        <div
          className="w-5 h-5 rounded-full border-2 border-background"
          style={{ backgroundColor: colors.accent }}
        />
        <div
          className="w-5 h-5 rounded-full border-2 border-background"
          style={{ backgroundColor: colors.sidebar_bg }}
        />
      </div>

      {/* Name */}
      <span className="flex-1 text-sm truncate">{name}</span>

      {/* Indicators */}
      {isDefault && (
        <Star className="h-3 w-3 text-amber-500 fill-amber-500 flex-shrink-0" />
      )}
      {isSelected && (
        <Check className="h-4 w-4 text-primary flex-shrink-0" />
      )}
    </button>
  );
}

// Simplified component for when you just want to apply a full theme
export function ThemeSelector({
  label = 'Apply Theme',
  customPresets = [],
  onApplyTheme,
  compact = false,
}: {
  label?: string;
  customPresets?: ColorPreset[];
  onApplyTheme: (colors: ColorConfig) => void;
  compact?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (colors: ColorConfig) => {
    onApplyTheme(colors);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={compact ? 'sm' : 'default'}
          className="gap-2"
        >
          <Palette className={cn(compact ? 'h-3 w-3' : 'h-4 w-4')} />
          {label}
          <ChevronDown className={cn(compact ? 'h-3 w-3' : 'h-4 w-4')} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="space-y-2">
          {/* Custom Presets */}
          {customPresets.length > 0 && (
            <>
              <div className="px-2 py-1">
                <p className="text-xs font-medium text-muted-foreground">
                  My Themes
                </p>
              </div>
              {customPresets.map((preset) => (
                <PresetButton
                  key={preset.id}
                  name={preset.name}
                  colors={preset.colors}
                  isDefault={preset.is_default}
                  onClick={() => handleSelect(preset.colors)}
                />
              ))}
              <div className="border-t my-2" />
            </>
          )}

          {/* Built-in Presets */}
          <div className="px-2 py-1">
            <p className="text-xs font-medium text-muted-foreground">
              Built-in Themes
            </p>
          </div>
          {COLOR_PRESETS.map((preset) => (
            <PresetButton
              key={preset.id}
              name={preset.label}
              colors={preset.colors}
              onClick={() => handleSelect(preset.colors)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Component that lets user pick a specific color from a theme
// Shows themes, then expands to show individual color swatches
export function ThemeColorSwatchPicker({
  label = 'From Theme',
  customPresets = [],
  onSelectColor,
  compact = false,
}: {
  label?: string;
  customPresets?: ColorPreset[];
  onSelectColor: (color: string) => void;
  compact?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ColorConfig | null>(null);
  const [selectedThemeName, setSelectedThemeName] = useState<string>('');

  const handleThemeSelect = (colors: ColorConfig, name: string) => {
    setSelectedTheme(colors);
    setSelectedThemeName(name);
  };

  const handleColorSelect = (color: string) => {
    onSelectColor(color);
    setIsOpen(false);
    setSelectedTheme(null);
    setSelectedThemeName('');
  };

  const handleBack = () => {
    setSelectedTheme(null);
    setSelectedThemeName('');
  };

  // Color swatch with label
  const ColorSwatch = ({ color, colorLabel }: { color: string; colorLabel: string }) => (
    <button
      onClick={() => handleColorSelect(color)}
      className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-accent/50 transition-colors"
    >
      <div
        className="w-8 h-8 rounded-md border border-border flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <div className="flex-1 text-left">
        <p className="text-sm font-medium">{colorLabel}</p>
        <p className="text-xs text-muted-foreground font-mono">{color}</p>
      </div>
    </button>
  );

  return (
    <Popover open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        setSelectedTheme(null);
        setSelectedThemeName('');
      }
    }}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={compact ? 'sm' : 'default'}
          className="gap-2"
        >
          <Palette className={cn(compact ? 'h-3 w-3' : 'h-4 w-4')} />
          {label}
          <ChevronDown className={cn(compact ? 'h-3 w-3' : 'h-4 w-4')} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        {selectedTheme ? (
          // Show color swatches for selected theme
          <div className="space-y-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to themes
            </button>
            <div className="px-2 py-1 border-b">
              <p className="text-sm font-medium">{selectedThemeName}</p>
              <p className="text-xs text-muted-foreground">Click a color to apply</p>
            </div>
            <div className="space-y-1">
              <ColorSwatch color={selectedTheme.primary} colorLabel="Primary" />
              <ColorSwatch color={selectedTheme.accent} colorLabel="Accent" />
              <ColorSwatch color={selectedTheme.sidebar_bg} colorLabel="Background" />
              <ColorSwatch color={selectedTheme.sidebar_text} colorLabel="Text" />
            </div>
          </div>
        ) : (
          // Show theme list
          <div className="space-y-2">
            <div className="px-2 py-1">
              <p className="text-xs text-muted-foreground">Select a theme to see its colors</p>
            </div>

            {/* Custom Presets */}
            {customPresets.length > 0 && (
              <>
                <div className="px-2 py-1">
                  <p className="text-xs font-medium text-muted-foreground">My Themes</p>
                </div>
                {customPresets.map((preset) => (
                  <PresetButton
                    key={preset.id}
                    name={preset.name}
                    colors={preset.colors}
                    isDefault={preset.is_default}
                    onClick={() => handleThemeSelect(preset.colors, preset.name)}
                  />
                ))}
                <div className="border-t my-2" />
              </>
            )}

            {/* Built-in Presets */}
            <div className="px-2 py-1">
              <p className="text-xs font-medium text-muted-foreground">Built-in Themes</p>
            </div>
            {COLOR_PRESETS.map((preset) => (
              <PresetButton
                key={preset.id}
                name={preset.label}
                colors={preset.colors}
                onClick={() => handleThemeSelect(preset.colors, preset.label)}
              />
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
