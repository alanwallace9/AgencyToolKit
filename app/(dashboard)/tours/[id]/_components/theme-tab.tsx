'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Check, Palette, Plus, ExternalLink, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';
import { createTheme } from '../../_actions/theme-actions';
import { DEFAULT_THEME_COLORS } from '../../_lib/theme-constants';
import type { TourTheme, TourThemeColors } from '@/types/database';

interface ThemeTabProps {
  themes: TourTheme[];
  selectedThemeId?: string;
  onSelectTheme: (themeId: string | undefined) => void;
}

// Default theme colors when no theme is selected (matches embed baseline)
const defaultTheme = {
  name: 'Default',
  colors: DEFAULT_THEME_COLORS,
};

export function ThemeTab({
  themes,
  selectedThemeId,
  onSelectTheme,
}: ThemeTabProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTheme = async () => {
    setIsCreating(true);
    try {
      const theme = await createTheme({
        name: 'New Theme',
        colors: DEFAULT_THEME_COLORS,
      });
      toast.success('Theme created');
      router.push(`/tours/themes/${theme.id}`);
    } catch (error) {
      toast.error('Failed to create theme', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Find the default theme among custom themes
  const defaultCustomTheme = themes.find(t => t.is_default);

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
          {/* Default theme option - only show if no custom themes exist */}
          {themes.length === 0 && (
            <ThemeCard
              name="Default"
              colors={defaultTheme.colors}
              isSelected={!selectedThemeId}
              onSelect={() => onSelectTheme(undefined)}
            />
          )}

          {/* Custom themes */}
          {themes.map((theme) => (
            <ThemeCard
              key={theme.id}
              name={theme.name}
              colors={theme.colors as TourThemeColors}
              isSelected={selectedThemeId === theme.id}
              isAgencyDefault={theme.is_default}
              onSelect={() => onSelectTheme(theme.id)}
              onEdit={() => router.push(`/tours/themes/${theme.id}`)}
            />
          ))}

          {/* Create new theme */}
          <button
            onClick={handleCreateTheme}
            disabled={isCreating}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed hover:border-primary hover:bg-muted/50 transition-colors min-h-[140px] disabled:opacity-50"
          >
            <div className="rounded-full bg-muted p-2">
              <Plus className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium">
              {isCreating ? 'Creating...' : 'Create Theme'}
            </span>
          </button>
        </div>

        {/* Help text if using default */}
        {!selectedThemeId && themes.length === 0 && (
          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            No theme selected. Your tour will use the default styling with blue buttons and white background.
            Create a theme to customize colors and fonts.
          </p>
        )}

        {/* Help text if theme is selected */}
        {selectedThemeId && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
            <Check className="h-4 w-4" />
            <span>Theme applied to this tour</span>
          </div>
        )}
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

      {/* Link to theme management */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Palette className="h-4 w-4" />
        <span>Manage all themes in</span>
        <Link
          href="/tours"
          className="text-primary hover:underline inline-flex items-center gap-1"
        >
          Guided Tours
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

interface ThemeCardProps {
  name: string;
  colors: TourThemeColors;
  isSelected: boolean;
  isAgencyDefault?: boolean;
  onSelect: () => void;
  onEdit?: () => void;
}

function ThemeCard({
  name,
  colors,
  isSelected,
  isAgencyDefault,
  onSelect,
  onEdit,
}: ThemeCardProps) {
  return (
    <div className="relative group">
      <button
        onClick={onSelect}
        className={cn(
          'w-full relative flex flex-col gap-3 p-4 rounded-lg border transition-all text-left',
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
          {isAgencyDefault && (
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
          )}
        </div>
      </button>

      {/* Edit button on hover */}
      {onEdit && (
        <Button
          variant="secondary"
          size="sm"
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          Edit
        </Button>
      )}
    </div>
  );
}

function ThemePreview({ theme }: { theme?: TourTheme }) {
  const colors = (theme?.colors as TourThemeColors) || defaultTheme.colors;
  const typography = (theme?.typography as { font_family?: string; title_size?: string; body_size?: string }) || {};
  const borders = (theme?.borders as { radius?: string }) || { radius: '12px' };
  const shadows = (theme?.shadows as { tooltip?: string }) || {
    tooltip: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
  };

  return (
    <div className="p-8 bg-muted/30 rounded-lg flex items-center justify-center">
      {/* Mock tooltip */}
      <div
        className="relative"
        style={{
          fontFamily: typography.font_family || 'system-ui, -apple-system, sans-serif',
          width: '340px',
        }}
      >
        {/* Arrow */}
        <div
          className="absolute -top-2 left-8 w-4 h-4 rotate-45"
          style={{
            backgroundColor: colors.background,
            border: `1px solid ${colors.border}`,
            borderRight: 'none',
            borderBottom: 'none',
          }}
        />

        {/* Tooltip body */}
        <div
          className="relative p-4"
          style={{
            backgroundColor: colors.background,
            border: `1px solid ${colors.border}`,
            borderRadius: borders.radius || '12px',
            boxShadow: shadows.tooltip,
          }}
        >
          {/* Progress */}
          <div className="flex items-center gap-1.5 mb-3">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: colors.primary }}
            />
            <div
              className="w-2 h-2 rounded-full opacity-40"
              style={{ backgroundColor: colors.text_secondary }}
            />
            <div
              className="w-2 h-2 rounded-full opacity-40"
              style={{ backgroundColor: colors.text_secondary }}
            />
          </div>

          {/* Title */}
          <h4
            className="font-semibold mb-2"
            style={{
              color: colors.text,
              fontSize: typography.title_size || '18px',
            }}
          >
            Welcome to the Dashboard
          </h4>

          {/* Content */}
          <p
            className="mb-4"
            style={{
              color: colors.text_secondary,
              fontSize: typography.body_size || '14px',
              lineHeight: '1.5',
            }}
          >
            This is your main command center. Here you can see all your key
            metrics at a glance.
          </p>

          {/* Buttons */}
          <div className="flex justify-between items-center">
            <button
              className="text-sm px-4 py-2 rounded font-medium"
              style={{
                color: colors.secondary,
                border: `1px solid ${colors.border}`,
                borderRadius: borders.radius || '8px',
              }}
            >
              Skip
            </button>
            <button
              className="text-sm px-5 py-2 rounded font-semibold"
              style={{
                backgroundColor: colors.primary,
                color: '#ffffff',
                borderRadius: borders.radius || '8px',
              }}
            >
              Next &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
