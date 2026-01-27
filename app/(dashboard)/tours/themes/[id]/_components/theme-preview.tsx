'use client';

import { useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { POPOVER_SIZE_PRESETS, type PopoverSize, type ProgressStyle } from '../../../_lib/theme-constants';
import type { TourThemeColors, TourThemeTypography, TourThemeBorders, TourThemeShadows } from '@/types/database';

interface ThemePreviewProps {
  colors: TourThemeColors;
  typography: TourThemeTypography;
  borders: TourThemeBorders;
  shadows: TourThemeShadows;
  popoverSize: PopoverSize;
  progressStyle: ProgressStyle;
}

type PreviewMode = 'tooltip' | 'modal';

export function ThemePreview({
  colors,
  typography,
  borders,
  shadows,
  popoverSize,
  progressStyle,
}: ThemePreviewProps) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('tooltip');

  const sizePreset = POPOVER_SIZE_PRESETS[popoverSize];

  // Render progress indicator based on style
  const renderProgress = () => {
    const currentStep = 1;
    const totalSteps = 3;

    switch (progressStyle) {
      case 'dots':
        return (
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  i === currentStep - 1 ? 'opacity-100' : 'opacity-40'
                )}
                style={{
                  backgroundColor: i === currentStep - 1 ? colors.primary : colors.text_secondary,
                }}
              />
            ))}
          </div>
        );

      case 'numbers':
        return (
          <span
            className="text-sm font-medium"
            style={{ color: colors.text_secondary }}
          >
            {currentStep} of {totalSteps}
          </span>
        );

      case 'bar':
        return (
          <div className="w-full space-y-1">
            <div className="flex items-center justify-between text-xs" style={{ color: colors.text_secondary }}>
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: colors.border }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(currentStep / totalSteps) * 100}%`,
                  backgroundColor: colors.primary,
                }}
              />
            </div>
          </div>
        );

      case 'none':
      default:
        return null;
    }
  };

  // Common popover content
  const renderPopoverContent = (isModal: boolean) => (
    <div
      className="relative"
      style={{
        width: isModal ? '400px' : sizePreset.width,
        fontFamily: typography.font_family,
      }}
    >
      {/* Arrow for tooltip */}
      {!isModal && (
        <div
          className="absolute -top-2 left-8 w-4 h-4 rotate-45"
          style={{
            backgroundColor: colors.background,
            borderTop: `1px solid ${colors.border}`,
            borderLeft: `1px solid ${colors.border}`,
          }}
        />
      )}

      {/* Popover body */}
      <div
        className="relative"
        style={{
          backgroundColor: colors.background,
          border: `1px solid ${colors.border}`,
          borderRadius: borders.radius,
          boxShadow: isModal ? shadows.modal : shadows.tooltip,
          padding: sizePreset.padding,
        }}
      >
        {/* Close button */}
        <button
          className="absolute top-3 right-3 opacity-50 hover:opacity-100 transition-opacity"
          style={{ color: colors.text_secondary }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Progress */}
        {progressStyle !== 'none' && (
          <div className="mb-3">
            {renderProgress()}
          </div>
        )}

        {/* Title */}
        <h4
          className="font-semibold mb-2 pr-6"
          style={{
            color: colors.text,
            fontSize: typography.title_size,
          }}
        >
          Welcome to the Dashboard
        </h4>

        {/* Content */}
        <p
          className="mb-4"
          style={{
            color: colors.text_secondary,
            fontSize: typography.body_size,
            lineHeight: typography.line_height,
          }}
        >
          This is your main command center. Here you can see all your key metrics at a glance and manage your account.
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            className="px-4 py-2 text-sm font-medium rounded transition-colors hover:opacity-80"
            style={{
              color: colors.secondary,
              border: `1px solid ${colors.border}`,
              borderRadius: borders.radius,
            }}
          >
            Skip
          </button>
          <button
            className="px-5 py-2 text-sm font-semibold rounded transition-colors hover:brightness-110"
            style={{
              backgroundColor: colors.primary,
              color: '#ffffff',
              borderRadius: borders.radius,
            }}
          >
            Next &rarr;
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Preview mode toggle */}
      <div className="p-4 border-b flex items-center justify-center">
        <ToggleGroup
          type="single"
          value={previewMode}
          onValueChange={(v) => v && setPreviewMode(v as PreviewMode)}
        >
          <ToggleGroupItem value="tooltip" aria-label="Tooltip preview">
            Tooltip
          </ToggleGroupItem>
          <ToggleGroupItem value="modal" aria-label="Modal preview">
            Modal
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Preview area */}
      <div className="flex-1 flex items-center justify-center p-8">
        {previewMode === 'modal' ? (
          // Modal preview with backdrop
          <div
            className="w-full h-full flex items-center justify-center rounded-lg"
            style={{ backgroundColor: colors.overlay }}
          >
            {renderPopoverContent(true)}
          </div>
        ) : (
          // Tooltip preview
          <div className="relative">
            {/* Mock target element */}
            <div className="relative">
              <div
                className="px-4 py-2 rounded border-2 text-sm font-medium mb-4"
                style={{
                  borderColor: colors.primary,
                  color: colors.primary,
                  boxShadow: `0 0 0 4px ${colors.primary}40`,
                }}
              >
                Target Element
              </div>
              {renderPopoverContent(false)}
            </div>
          </div>
        )}
      </div>

      {/* Info footer */}
      <div className="p-4 border-t text-center">
        <p className="text-xs text-muted-foreground">
          This preview shows how your tours will look. Colors, fonts, and sizes update in real-time.
        </p>
      </div>
    </div>
  );
}
