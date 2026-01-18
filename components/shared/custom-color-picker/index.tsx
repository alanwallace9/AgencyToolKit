'use client';

/**
 * Custom Color Picker
 *
 * A premium, Apple-like color picker with tabs: Color | Gradient | Theme
 * Built on react-colorful for the color area, with custom additions:
 * - Opacity slider (built-in, not separate)
 * - Hex input with eyedropper
 * - Saved colors grid (4x5, 20 max)
 * - Gradient editor with draggable stops
 * - Theme colors from brand settings
 *
 * @see docs/THEME_BUILDER_COLOR_PICKER.md for full spec
 */

import * as React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { HelpCircle } from 'lucide-react';
import type { ColorPickerProps, ColorPickerTab, GradientValue } from './types';
import { parseColor, parseGradient } from './utils';
import { ColorTab } from './color-tab';
import { GradientTab } from './gradient-tab';
import { ThemeTab } from './theme-tab';
import { SavedColors } from './saved-colors';

export function CustomColorPicker({
  value,
  onChange,
  brandColors,
  showGradient = true,
  showTheme = true,
  disabled = false,
  label,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<ColorPickerTab>('color');
  const [showCoachMarks, setShowCoachMarks] = React.useState(false);

  // Parse current value
  const { hex, opacity } = parseColor(value);

  // Determine if value is a gradient
  const isGradient = value?.includes('gradient');

  // Gradient state (for gradient tab)
  const [gradientValue, setGradientValue] = React.useState<GradientValue>({
    type: 'linear',
    angle: 135,
    stops: [
      { id: 'stop_1', color: '#3b82f6', position: 0 },
      { id: 'stop_2', color: '#8b5cf6', position: 100 },
    ],
  });

  // Sync external gradient value to internal state
  React.useEffect(() => {
    if (isGradient && value) {
      const parsed = parseGradient(value);
      if (parsed) {
        setGradientValue(parsed);
        // Auto-switch to gradient tab when a gradient is selected externally
        setActiveTab('gradient');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const tabs: { id: ColorPickerTab; label: string }[] = [
    { id: 'color', label: 'Color' },
    ...(showGradient ? [{ id: 'gradient' as const, label: 'Gradient' }] : []),
    ...(showTheme && brandColors
      ? [{ id: 'theme' as const, label: 'Theme' }]
      : []),
  ];

  const handleColorChange = (newColor: string) => {
    onChange(newColor);
  };

  const handleGradientChange = (gradient: GradientValue) => {
    setGradientValue(gradient);
    // Convert gradient to CSS string for onChange
    const sortedStops = [...gradient.stops].sort(
      (a, b) => a.position - b.position
    );
    const stopsStr = sortedStops
      .map((stop) => `${stop.color} ${stop.position}%`)
      .join(', ');
    const css =
      gradient.type === 'radial'
        ? `radial-gradient(circle, ${stopsStr})`
        : `linear-gradient(${gradient.angle}deg, ${stopsStr})`;
    onChange(css);
  };

  const handleSavedColorSelect = (color: string) => {
    onChange(color);
    // Switch to color tab if selecting a solid color
    if (!color.includes('gradient')) {
      setActiveTab('color');
    }
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <button
            className={cn(
              'flex h-10 w-full items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2',
              'transition-all duration-200',
              'hover:border-gray-300 hover:shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {/* Color preview swatch */}
            <div
              className="h-6 w-6 rounded border border-gray-200 flex-shrink-0"
              style={{
                background: isGradient ? value : hex,
                opacity: isGradient ? 1 : opacity / 100,
              }}
            />
            {/* Hex value display */}
            <span className="flex-1 text-left text-sm text-gray-700 font-mono truncate">
              {isGradient ? 'Gradient' : hex}
            </span>
            {/* Dropdown indicator */}
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[340px] p-0 shadow-xl border-gray-200"
          align="start"
          sideOffset={8}
        >
          {/* Tab navigation */}
          <div className="flex items-center justify-between border-b border-gray-100 px-1 pt-1">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'relative px-4 py-2.5 text-sm font-medium transition-colors duration-200',
                    activeTab === tab.id
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  {tab.label}
                  {/* Active indicator (slides smoothly) */}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Help icon to replay coach marks */}
            <button
              onClick={() => setShowCoachMarks(true)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Show tips"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>

          {/* Tab content */}
          <div className="px-5 py-4">
            {activeTab === 'color' && (
              <ColorTab
                value={hex}
                opacity={opacity}
                onChange={handleColorChange}
              />
            )}

            {activeTab === 'gradient' && (
              <GradientTab
                value={gradientValue}
                onChange={handleGradientChange}
              />
            )}

            {activeTab === 'theme' && brandColors && (
              <ThemeTab
                brandColors={brandColors}
                onSelect={handleColorChange}
              />
            )}
          </div>

          {/* Saved colors section (always visible) */}
          <div className="border-t border-gray-100 px-5 py-3">
            <SavedColors
              currentColor={isGradient ? undefined : hex}
              onSelect={handleSavedColorSelect}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Re-export types for convenience
export type { ColorPickerProps, BrandColors, GradientValue } from './types';
