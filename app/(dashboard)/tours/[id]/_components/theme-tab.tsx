'use client';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Check, Palette, Plus, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { TourTheme } from '@/types/database';

interface ThemeTabProps {
  themes: TourTheme[];
  selectedThemeId?: string;
  onSelectTheme: (themeId: string | undefined) => void;
}

// Default theme colors when no theme is selected
const defaultTheme = {
  name: 'Default',
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    background: '#ffffff',
    text: '#1f2937',
    text_secondary: '#6b7280',
    border: '#e5e7eb',
  },
};

export function ThemeTab({
  themes,
  selectedThemeId,
  onSelectTheme,
}: ThemeTabProps) {
  return (
    <div className="max-w-3xl space-y-8">
      {/* Theme Selection */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Tour Theme</h3>
          <p className="text-sm text-muted-foreground">
            Choose a visual theme for this tour's tooltips and modals
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Default theme option */}
          <ThemeCard
            name="Default"
            colors={defaultTheme.colors}
            isSelected={!selectedThemeId}
            onSelect={() => onSelectTheme(undefined)}
          />

          {/* Custom themes */}
          {themes.map((theme) => (
            <ThemeCard
              key={theme.id}
              name={theme.name}
              colors={theme.colors as typeof defaultTheme.colors}
              isSelected={selectedThemeId === theme.id}
              isDefault={theme.is_default}
              onSelect={() => onSelectTheme(theme.id)}
            />
          ))}

          {/* Create new theme */}
          <Link
            href="/colors"
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed hover:border-primary hover:bg-muted/50 transition-colors min-h-[140px]"
          >
            <div className="rounded-full bg-muted p-2">
              <Plus className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium">Create Theme</span>
            <span className="text-xs text-muted-foreground">in Colors page</span>
          </Link>
        </div>
      </section>

      <Separator />

      {/* Theme Preview */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Preview</h3>
          <p className="text-sm text-muted-foreground">
            How your tour steps will look with this theme
          </p>
        </div>

        <ThemePreview
          theme={
            selectedThemeId
              ? themes.find((t) => t.id === selectedThemeId)
              : undefined
          }
        />
      </section>

      {/* Link to full theme editor */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Palette className="h-4 w-4" />
        <span>Want more customization?</span>
        <Link
          href="/colors"
          className="text-primary hover:underline inline-flex items-center gap-1"
        >
          Go to Colors page
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

interface ThemeCardProps {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    border?: string;
  };
  isSelected: boolean;
  isDefault?: boolean;
  onSelect: () => void;
}

function ThemeCard({
  name,
  colors,
  isSelected,
  isDefault,
  onSelect,
}: ThemeCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'relative flex flex-col gap-3 p-4 rounded-lg border transition-all text-left',
        isSelected
          ? 'border-primary ring-2 ring-primary/20'
          : 'hover:border-muted-foreground/30'
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 rounded-full bg-primary p-0.5">
          <Check className="h-3 w-3 text-primary-foreground" />
        </div>
      )}

      {/* Color swatches */}
      <div className="flex gap-1.5">
        <div
          className="w-8 h-8 rounded-md border"
          style={{ backgroundColor: colors.primary }}
          title="Primary"
        />
        <div
          className="w-8 h-8 rounded-md border"
          style={{ backgroundColor: colors.secondary }}
          title="Secondary"
        />
        <div
          className="w-8 h-8 rounded-md border"
          style={{ backgroundColor: colors.background }}
          title="Background"
        />
        <div
          className="w-8 h-8 rounded-md border"
          style={{ backgroundColor: colors.text }}
          title="Text"
        />
      </div>

      {/* Theme name */}
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm">{name}</span>
        {isDefault && (
          <span className="text-xs bg-muted px-1.5 py-0.5 rounded">Default</span>
        )}
      </div>
    </button>
  );
}

function ThemePreview({ theme }: { theme?: TourTheme }) {
  const colors = (theme?.colors as typeof defaultTheme.colors) || defaultTheme.colors;
  const typography = (theme?.typography as { font_family?: string }) || {};
  const borders = (theme?.borders as { radius?: string }) || {};
  const shadows = (theme?.shadows as { tooltip?: string }) || {};

  return (
    <div className="p-8 bg-muted/30 rounded-lg flex items-center justify-center">
      {/* Mock tooltip */}
      <div
        className="relative max-w-sm"
        style={{
          fontFamily: typography.font_family || 'system-ui, sans-serif',
        }}
      >
        {/* Arrow */}
        <div
          className="absolute -top-2 left-8 w-4 h-4 rotate-45"
          style={{
            backgroundColor: colors.background,
            border: `1px solid ${colors.border || '#e5e7eb'}`,
            borderRight: 'none',
            borderBottom: 'none',
          }}
        />

        {/* Tooltip body */}
        <div
          className="relative p-4 rounded-lg"
          style={{
            backgroundColor: colors.background,
            border: `1px solid ${colors.border || '#e5e7eb'}`,
            borderRadius: borders.radius || '8px',
            boxShadow: shadows.tooltip || '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {/* Progress */}
          <div
            className="text-xs mb-2"
            style={{ color: colors.text_secondary || colors.secondary }}
          >
            Step 1 of 3
          </div>

          {/* Title */}
          <h4
            className="font-semibold text-base mb-1"
            style={{ color: colors.text }}
          >
            Welcome to the Dashboard
          </h4>

          {/* Content */}
          <p
            className="text-sm mb-4"
            style={{ color: colors.text_secondary || colors.secondary }}
          >
            This is your main command center. Here you can see all your key
            metrics at a glance.
          </p>

          {/* Buttons */}
          <div className="flex justify-between items-center">
            <button
              className="text-sm px-3 py-1.5 rounded"
              style={{
                color: colors.secondary,
              }}
            >
              Skip
            </button>
            <button
              className="text-sm px-4 py-1.5 rounded font-medium"
              style={{
                backgroundColor: colors.primary,
                color: '#ffffff',
                borderRadius: borders.radius || '6px',
              }}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
