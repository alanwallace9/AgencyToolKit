'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Palette, Star, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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

interface ColorPickerWithPresetsProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
  /** Custom presets from database (user-created themes) */
  customPresets?: ColorPreset[];
  /** Which color field to extract from presets */
  colorField?: keyof ColorConfig;
  /** Show harmony suggestions (only for primary color) */
  showHarmony?: boolean;
  /** Callback when a full theme is selected (all colors) */
  onApplyTheme?: (colors: ColorConfig) => void;
  /** Compact mode - smaller size */
  compact?: boolean;
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

// Validate hex color
function isValidHex(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

// Normalize hex input
function normalizeHex(value: string): string {
  let hex = value.trim();
  if (!hex.startsWith('#')) {
    hex = '#' + hex;
  }
  return hex.toLowerCase();
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
}: ColorPickerWithPresetsProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isPresetOpen, setIsPresetOpen] = useState(false);

  // Sync input when value prop changes
  useEffect(() => {
    if (value !== inputValue && isValidHex(value)) {
      setInputValue(value);
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (newValue.length >= 4) {
      const normalized = normalizeHex(newValue);
      if (isValidHex(normalized)) {
        onChange(normalized);
      }
    }
  };

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const handlePresetSelect = (preset: typeof COLOR_PRESETS[number] | ColorPreset) => {
    if (onApplyTheme) {
      // Apply full theme
      onApplyTheme(preset.colors);
    } else {
      // Apply just the specific color field
      const color = preset.colors[colorField];
      setInputValue(color);
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
            value={value}
            onChange={handleColorPickerChange}
            className={cn(
              'rounded-lg cursor-pointer border border-border',
              compact ? 'w-8 h-8' : 'w-10 h-10'
            )}
            style={{ padding: 0 }}
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

      {/* Color Name / Description */}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <p className="text-xs text-muted-foreground/70">{getColorName(value)}</p>
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
