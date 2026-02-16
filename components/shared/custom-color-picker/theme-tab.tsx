'use client';

/**
 * Theme Tab Component
 *
 * Two sections:
 * 1. Brand Colors - User's custom brand colors (Primary, Accent, Sidebar BG, Sidebar Text)
 * 2. Built-in Themes - Preset color themes to pick colors from
 *
 * Click theme row to expand and see individual colors
 * Click any color swatch to apply it to the current field
 */

import * as React from 'react';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COLOR_PRESETS } from '@/lib/constants';
import type { BrandColors } from './types';

interface ThemeTabProps {
  brandColors?: BrandColors;
  onSelect: (color: string) => void;
  onOpenBrandColors?: () => void;
}

const BRAND_COLOR_LABELS = [
  { key: 'primary', label: 'Primary' },
  { key: 'accent', label: 'Accent' },
  { key: 'sidebar_bg', label: 'Sidebar BG' },
  { key: 'sidebar_text', label: 'Sidebar Text' },
] as const;

export function ThemeTab({ brandColors, onSelect, onOpenBrandColors }: ThemeTabProps) {
  const [expandedTheme, setExpandedTheme] = React.useState<string | null>(null);

  // Check if any brand colors are set
  const hasColors = brandColors && Object.values(brandColors).some((c) => c && c !== '#000000');

  const handleThemeClick = (themeId: string) => {
    if (expandedTheme === themeId) {
      setExpandedTheme(null);
    } else {
      setExpandedTheme(themeId);
    }
  };

  const handleColorSelect = (color: string) => {
    onSelect(color);
  };

  return (
    <div className="space-y-3">
      {/* Brand Colors Section */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-400 px-1">Brand Colors</p>

        {hasColors ? (
          <>
            <button
              onClick={() => handleThemeClick('brand')}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors',
                expandedTheme === 'brand'
                  ? 'bg-blue-50'
                  : 'hover:bg-gray-50'
              )}
            >
              {/* Color dots preview */}
              <div className="flex -space-x-1">
                {BRAND_COLOR_LABELS.map(({ key }) => {
                  const color = brandColors?.[key as keyof BrandColors];
                  if (!color) return null;
                  return (
                    <div
                      key={key}
                      className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  );
                })}
              </div>
              <span className="text-sm text-gray-700">Brand Colors</span>
            </button>

            {/* Expanded brand colors */}
            {expandedTheme === 'brand' && (
              <div className="ml-6 space-y-0.5">
                {BRAND_COLOR_LABELS.map(({ key, label }) => {
                  const color = brandColors?.[key as keyof BrandColors];
                  if (!color) return null;
                  return (
                    <button
                      key={key}
                      onClick={() => handleColorSelect(color)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className="w-5 h-5 rounded border border-gray-200"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm text-gray-600">{label}</span>
                      <span className="text-xs font-mono text-gray-400 ml-auto">{color}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="px-3 py-2 text-sm text-gray-500">
            No brand colors set.{' '}
            {onOpenBrandColors ? (
              <button
                onClick={onOpenBrandColors}
                className="text-blue-600 hover:underline"
              >
                Set brand colors →
              </button>
            ) : (
              <a href="/theme/colors" className="text-blue-600 hover:underline">
                Set brand colors →
              </a>
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Built-in Themes Section */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-400 px-1">Built-in Themes</p>

        {COLOR_PRESETS.map((preset) => (
          <div key={preset.id}>
            <button
              onClick={() => handleThemeClick(preset.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors',
                expandedTheme === preset.id
                  ? 'bg-blue-50'
                  : 'hover:bg-gray-50'
              )}
            >
              {/* Color dots preview */}
              <div className="flex -space-x-1">
                <div
                  className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: preset.colors.primary }}
                />
                <div
                  className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: preset.colors.accent }}
                />
              </div>
              <span className="text-sm text-gray-700">{preset.label}</span>
            </button>

            {/* Expanded theme colors */}
            {expandedTheme === preset.id && (
              <div className="ml-6 space-y-0.5">
                <button
                  onClick={() => handleColorSelect(preset.colors.primary)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 transition-colors"
                >
                  <div
                    className="w-5 h-5 rounded border border-gray-200"
                    style={{ backgroundColor: preset.colors.primary }}
                  />
                  <span className="text-sm text-gray-600">Primary</span>
                  <span className="text-xs font-mono text-gray-400 ml-auto">{preset.colors.primary}</span>
                </button>
                <button
                  onClick={() => handleColorSelect(preset.colors.accent)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 transition-colors"
                >
                  <div
                    className="w-5 h-5 rounded border border-gray-200"
                    style={{ backgroundColor: preset.colors.accent }}
                  />
                  <span className="text-sm text-gray-600">Accent</span>
                  <span className="text-xs font-mono text-gray-400 ml-auto">{preset.colors.accent}</span>
                </button>
                <button
                  onClick={() => handleColorSelect(preset.colors.sidebar_bg)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 transition-colors"
                >
                  <div
                    className="w-5 h-5 rounded border border-gray-200"
                    style={{ backgroundColor: preset.colors.sidebar_bg }}
                  />
                  <span className="text-sm text-gray-600">Background</span>
                  <span className="text-xs font-mono text-gray-400 ml-auto">{preset.colors.sidebar_bg}</span>
                </button>
                <button
                  onClick={() => handleColorSelect(preset.colors.sidebar_text)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 transition-colors"
                >
                  <div
                    className="w-5 h-5 rounded border border-gray-200"
                    style={{ backgroundColor: preset.colors.sidebar_text }}
                  />
                  <span className="text-sm text-gray-600">Text</span>
                  <span className="text-xs font-mono text-gray-400 ml-auto">{preset.colors.sidebar_text}</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reset to Default */}
      <div className="border-t border-gray-100 pt-2">
        <button
          onClick={() => handleColorSelect('#000000')}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="text-sm">Reset to Default</span>
        </button>
      </div>
    </div>
  );
}
