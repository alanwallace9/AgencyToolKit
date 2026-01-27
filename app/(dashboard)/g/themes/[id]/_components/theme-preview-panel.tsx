'use client';

import { X, ChevronRight, CircleDot, CheckCircle2 } from 'lucide-react';
import type {
  GuidelyThemeColors,
  GuidelyThemeTypography,
  GuidelyThemeShape,
  GuidelyThemeShadows,
  GuidelyThemeButtonConfig,
  GuidelyTourOverrides,
  GuidelySmartTipOverrides,
  GuidelyBannerOverrides,
  GuidelyChecklistOverrides,
} from '@/types/database';

type PreviewType = 'tour' | 'tip' | 'banner' | 'checklist';

interface ThemePreviewPanelProps {
  previewType: PreviewType;
  colors: GuidelyThemeColors;
  typography: GuidelyThemeTypography;
  borders: GuidelyThemeShape;
  shadows: GuidelyThemeShadows;
  buttons: GuidelyThemeButtonConfig;
  tourOverrides: GuidelyTourOverrides;
  smartTipOverrides: GuidelySmartTipOverrides;
  bannerOverrides: GuidelyBannerOverrides;
  checklistOverrides: GuidelyChecklistOverrides;
}

export function ThemePreviewPanel({
  previewType,
  colors,
  typography,
  borders,
  shadows,
  buttons,
  tourOverrides,
  smartTipOverrides,
  bannerOverrides,
  checklistOverrides,
}: ThemePreviewPanelProps) {
  // Common style helpers
  const containerStyle = {
    fontFamily: typography.font_family,
    backgroundColor: colors.background,
    color: colors.text,
    borderRadius: borders.radius,
    borderColor: colors.border,
    boxShadow: shadows.modal,
  };

  const primaryButtonStyle = {
    backgroundColor: buttons.style === 'filled' ? colors.primary : 'transparent',
    color: buttons.style === 'filled' ? colors.primary_text : colors.primary,
    border:
      buttons.style === 'outline'
        ? `2px solid ${colors.primary}`
        : buttons.style === 'ghost'
          ? 'none'
          : 'none',
    borderRadius: buttons.border_radius,
    padding: '10px 20px',
    fontFamily: typography.font_family,
    fontSize: typography.body_size,
    fontWeight: 500,
    cursor: 'pointer',
  };

  const secondaryButtonStyle = {
    backgroundColor: buttons.style === 'filled' ? colors.secondary : 'transparent',
    color: buttons.style === 'filled' ? colors.secondary_text : colors.secondary,
    border:
      buttons.style === 'outline'
        ? `2px solid ${colors.secondary}`
        : buttons.style === 'ghost'
          ? 'none'
          : 'none',
    borderRadius: buttons.border_radius,
    padding: '10px 20px',
    fontFamily: typography.font_family,
    fontSize: typography.body_size,
    fontWeight: 500,
    cursor: 'pointer',
  };

  return (
    <div className="w-full">
      {previewType === 'tour' && (
        <TourPreview
          colors={colors}
          typography={typography}
          borders={borders}
          shadows={shadows}
          buttons={buttons}
          tourOverrides={tourOverrides}
          containerStyle={containerStyle}
          primaryButtonStyle={primaryButtonStyle}
          secondaryButtonStyle={secondaryButtonStyle}
        />
      )}
      {previewType === 'tip' && (
        <SmartTipPreview
          colors={colors}
          typography={typography}
          borders={borders}
          shadows={shadows}
          smartTipOverrides={smartTipOverrides}
          containerStyle={containerStyle}
          primaryButtonStyle={primaryButtonStyle}
        />
      )}
      {previewType === 'banner' && (
        <BannerPreview
          colors={colors}
          typography={typography}
          borders={borders}
          bannerOverrides={bannerOverrides}
          primaryButtonStyle={primaryButtonStyle}
        />
      )}
      {previewType === 'checklist' && (
        <ChecklistPreview
          colors={colors}
          typography={typography}
          borders={borders}
          shadows={shadows}
          checklistOverrides={checklistOverrides}
          containerStyle={containerStyle}
        />
      )}
    </div>
  );
}

// Tour Preview Component
function TourPreview({
  colors,
  typography,
  borders,
  shadows,
  buttons,
  tourOverrides,
  containerStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
}: {
  colors: GuidelyThemeColors;
  typography: GuidelyThemeTypography;
  borders: GuidelyThemeShape;
  shadows: GuidelyThemeShadows;
  buttons: GuidelyThemeButtonConfig;
  tourOverrides: GuidelyTourOverrides;
  containerStyle: React.CSSProperties;
  primaryButtonStyle: React.CSSProperties;
  secondaryButtonStyle: React.CSSProperties;
}) {
  const backdropColor = tourOverrides.backdrop_color || 'rgba(0,0,0,0.5)';
  const progressColor = tourOverrides.progress_color || colors.primary;
  const progressInactive = tourOverrides.progress_inactive || colors.border;

  return (
    <div
      className="relative w-full max-w-lg p-8 rounded-xl mx-auto"
      style={{ backgroundColor: backdropColor }}
    >
      {/* Tour Modal */}
      <div
        className="relative p-6 border"
        style={{
          ...containerStyle,
          minWidth: '360px',
        }}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/5 transition-colors"
          style={{ color: tourOverrides.close_icon_color || colors.text_secondary }}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-4">
          {/* Content */}
          <div className="text-center space-y-2">
            <h3
              style={{
                fontSize: typography.title_size,
                fontWeight: 600,
                color: colors.text,
              }}
            >
              Welcome to the Dashboard!
            </h3>
            <p
              style={{
                fontSize: typography.body_size,
                color: colors.text_secondary,
                lineHeight: typography.line_height,
              }}
            >
              Let&apos;s take a quick tour to help you get started with the key
              features.
            </p>
          </div>

          {/* Progress */}
          <div className="flex justify-center gap-1.5">
            {tourOverrides.progress_style === 'dots' && (
              <>
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full transition-colors"
                    style={{
                      backgroundColor: i === 0 ? progressColor : progressInactive,
                    }}
                  />
                ))}
              </>
            )}
            {tourOverrides.progress_style === 'numbers' && (
              <span
                style={{
                  fontSize: typography.body_size,
                  color: colors.text_secondary,
                }}
              >
                1 / 4
              </span>
            )}
            {tourOverrides.progress_style === 'bar' && (
              <div
                className="w-full h-1 rounded-full overflow-hidden"
                style={{ backgroundColor: progressInactive }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{ backgroundColor: progressColor, width: '25%' }}
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-center pt-2">
            <button style={secondaryButtonStyle}>Skip</button>
            <button style={primaryButtonStyle}>
              Next
              <ChevronRight className="inline-block ml-1 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Smart Tip Preview Component
function SmartTipPreview({
  colors,
  typography,
  borders,
  shadows,
  smartTipOverrides,
  containerStyle,
  primaryButtonStyle,
}: {
  colors: GuidelyThemeColors;
  typography: GuidelyThemeTypography;
  borders: GuidelyThemeShape;
  shadows: GuidelyThemeShadows;
  smartTipOverrides: GuidelySmartTipOverrides;
  containerStyle: React.CSSProperties;
  primaryButtonStyle: React.CSSProperties;
}) {
  const tooltipBg = smartTipOverrides.tooltip_background || colors.background;
  const beaconColor = smartTipOverrides.beacon_color || colors.primary;

  return (
    <div className="relative">
      {/* Target element simulation */}
      <div
        className="px-4 py-2 rounded-lg border-2 border-dashed"
        style={{
          borderColor: colors.border,
          fontFamily: typography.font_family,
          color: colors.text_secondary,
        }}
      >
        Target Element
      </div>

      {/* Beacon */}
      <div className="absolute -top-1 -right-1">
        <div
          className="w-4 h-4 rounded-full animate-pulse"
          style={{ backgroundColor: beaconColor }}
        />
        <div
          className="absolute inset-0 w-4 h-4 rounded-full animate-ping opacity-50"
          style={{ backgroundColor: beaconColor }}
        />
      </div>

      {/* Tooltip */}
      <div
        className="absolute top-full left-1/2 -translate-x-1/2 mt-3 p-4 border min-w-[280px]"
        style={{
          ...containerStyle,
          backgroundColor: tooltipBg,
          boxShadow: shadows.tooltip,
        }}
      >
        {/* Arrow */}
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-l border-t"
          style={{
            backgroundColor: tooltipBg,
            borderColor: colors.border,
          }}
        />

        <div className="space-y-3">
          <h4
            style={{
              fontSize: typography.title_size,
              fontWeight: 600,
              color: colors.text,
            }}
          >
            Pro Tip
          </h4>
          <p
            style={{
              fontSize: typography.body_size,
              color: colors.text_secondary,
              lineHeight: typography.line_height,
            }}
          >
            Click here to access your analytics dashboard and track your
            progress.
          </p>
          <button style={{ ...primaryButtonStyle, width: '100%' }}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

// Banner Preview Component
function BannerPreview({
  colors,
  typography,
  borders,
  bannerOverrides,
  primaryButtonStyle,
}: {
  colors: GuidelyThemeColors;
  typography: GuidelyThemeTypography;
  borders: GuidelyThemeShape;
  bannerOverrides: GuidelyBannerOverrides;
  primaryButtonStyle: React.CSSProperties;
}) {
  const bannerBg = bannerOverrides.banner_background || colors.primary;
  const bannerText = bannerOverrides.banner_text || colors.primary_text;
  const dismissColor = bannerOverrides.dismiss_icon_color || bannerText;

  return (
    <div className="w-full max-w-2xl space-y-6">
      {/* Top Banner */}
      <div
        className="relative px-4 py-3 flex items-center justify-between gap-4"
        style={{
          backgroundColor: bannerBg,
          borderRadius: borders.radius,
          fontFamily: typography.font_family,
        }}
      >
        <p
          className="flex-1"
          style={{
            fontSize: typography.body_size,
            color: bannerText,
          }}
        >
          New feature available! Check out our improved analytics dashboard.
        </p>
        <button
          style={{
            ...primaryButtonStyle,
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: bannerText,
            padding: '6px 12px',
            fontSize: '13px',
          }}
        >
          Learn More
        </button>
        <button
          className="p-1 rounded hover:bg-white/10 transition-colors"
          style={{ color: dismissColor }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Floating Banner */}
      <div className="flex justify-end">
        <div
          className="relative px-4 py-3 max-w-sm shadow-lg border"
          style={{
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderRadius: borders.radius,
            fontFamily: typography.font_family,
          }}
        >
          <button
            className="absolute top-2 right-2 p-1 rounded hover:bg-black/5 transition-colors"
            style={{ color: colors.text_secondary }}
          >
            <X className="h-3 w-3" />
          </button>
          <div className="pr-6">
            <h4
              style={{
                fontSize: typography.title_size,
                fontWeight: 600,
                color: colors.text,
                marginBottom: '4px',
              }}
            >
              Limited Time Offer
            </h4>
            <p
              style={{
                fontSize: typography.body_size,
                color: colors.text_secondary,
                marginBottom: '12px',
              }}
            >
              Upgrade to Pro and get 50% off your first month!
            </p>
            <button style={{ ...primaryButtonStyle, padding: '8px 16px' }}>
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Checklist Preview Component
function ChecklistPreview({
  colors,
  typography,
  borders,
  shadows,
  checklistOverrides,
  containerStyle,
}: {
  colors: GuidelyThemeColors;
  typography: GuidelyThemeTypography;
  borders: GuidelyThemeShape;
  shadows: GuidelyThemeShadows;
  checklistOverrides: GuidelyChecklistOverrides;
  containerStyle: React.CSSProperties;
}) {
  const headerBg = checklistOverrides.header_background || colors.primary;
  const headerText = checklistOverrides.header_text || colors.primary_text;
  const completionColor = checklistOverrides.completion_color || colors.primary;
  const itemTextColor = checklistOverrides.item_text_color || colors.text;
  const linkColor = checklistOverrides.link_color || colors.primary;

  const items = [
    { label: 'Complete your profile', completed: true },
    { label: 'Set up notifications', completed: true },
    { label: 'Create your first project', completed: false },
    { label: 'Invite team members', completed: false },
  ];

  const completedCount = items.filter((i) => i.completed).length;
  const progress = (completedCount / items.length) * 100;

  return (
    <div
      className="w-80 border overflow-hidden"
      style={{
        ...containerStyle,
        padding: 0,
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3"
        style={{
          backgroundColor: headerBg,
          fontFamily: typography.font_family,
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <h4
            style={{
              fontSize: typography.title_size,
              fontWeight: 600,
              color: headerText,
            }}
          >
            Getting Started
          </h4>
          <span
            style={{
              fontSize: '12px',
              color: headerText,
              opacity: 0.8,
            }}
          >
            {completedCount}/{items.length}
          </span>
        </div>
        {/* Progress bar */}
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              backgroundColor: headerText,
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {/* Items */}
      <div className="p-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-black/5 transition-colors cursor-pointer"
            style={{ fontFamily: typography.font_family }}
          >
            {item.completed ? (
              <CheckCircle2
                className="h-5 w-5 flex-shrink-0"
                style={{ color: completionColor }}
              />
            ) : (
              <CircleDot
                className="h-5 w-5 flex-shrink-0"
                style={{ color: colors.border }}
              />
            )}
            <span
              style={{
                fontSize: typography.body_size,
                color: item.completed ? colors.text_secondary : itemTextColor,
                textDecoration: item.completed ? 'line-through' : 'none',
              }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="px-4 py-3 border-t"
        style={{
          borderColor: colors.border,
          fontFamily: typography.font_family,
        }}
      >
        <a
          href="#"
          style={{
            fontSize: '13px',
            color: linkColor,
            textDecoration: 'none',
          }}
        >
          Skip setup for now
        </a>
      </div>
    </div>
  );
}
