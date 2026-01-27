import type { TourThemeColors, TourThemeTypography, TourThemeBorders, TourThemeShadows, TourTheme } from '@/types/database';

// Default theme values - matches the nice preview style
export const DEFAULT_THEME_COLORS: TourThemeColors = {
  primary: '#3b82f6',
  secondary: '#64748b',
  background: '#ffffff',
  text: '#1f2937',
  text_secondary: '#6b7280',
  border: '#e5e7eb',
  overlay: 'rgba(0,0,0,0.5)',
};

export const DEFAULT_THEME_TYPOGRAPHY: TourThemeTypography = {
  font_family: 'system-ui, -apple-system, sans-serif',
  title_size: '18px',
  body_size: '14px',
  line_height: '1.5',
};

export const DEFAULT_THEME_BORDERS: TourThemeBorders = {
  radius: '12px',
  width: '1px',
  style: 'solid',
};

export const DEFAULT_THEME_SHADOWS: TourThemeShadows = {
  tooltip: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
  modal: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
};

// Popover size presets
export type PopoverSize = 'small' | 'medium' | 'large';

export const POPOVER_SIZE_PRESETS: Record<PopoverSize, { width: string; padding: string; title_size: string; body_size: string }> = {
  small: { width: '280px', padding: '12px', title_size: '16px', body_size: '13px' },
  medium: { width: '340px', padding: '16px', title_size: '18px', body_size: '14px' },
  large: { width: '420px', padding: '20px', title_size: '20px', body_size: '15px' },
};

// Progress style options
export type ProgressStyle = 'dots' | 'numbers' | 'bar' | 'none';

// Font options
export const FONT_OPTIONS = [
  { value: 'system-ui, -apple-system, sans-serif', label: 'System UI' },
  { value: "'Inter', sans-serif", label: 'Inter' },
  { value: "'Roboto', sans-serif", label: 'Roboto' },
  { value: "'Open Sans', sans-serif", label: 'Open Sans' },
  { value: "'Poppins', sans-serif", label: 'Poppins' },
  { value: "'Helvetica Neue', Helvetica, sans-serif", label: 'Helvetica' },
  { value: "'Georgia', serif", label: 'Georgia' },
  { value: "'Merriweather', serif", label: 'Merriweather' },
];

// Shadow presets
export const SHADOW_PRESETS = [
  { value: 'none', label: 'None', css: 'none' },
  { value: 'subtle', label: 'Subtle', css: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)' },
  { value: 'medium', label: 'Medium', css: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)' },
  { value: 'strong', label: 'Strong', css: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' },
];

// Built-in theme templates
export const BUILT_IN_THEMES = [
  {
    name: 'Default',
    description: 'Clean and professional with blue accents',
    colors: DEFAULT_THEME_COLORS,
    typography: DEFAULT_THEME_TYPOGRAPHY,
    borders: DEFAULT_THEME_BORDERS,
    shadows: DEFAULT_THEME_SHADOWS,
  },
  {
    name: 'Dark Mode',
    description: 'Easy on the eyes with dark backgrounds',
    colors: {
      primary: '#60a5fa',
      secondary: '#94a3b8',
      background: '#1f2937',
      text: '#f9fafb',
      text_secondary: '#9ca3af',
      border: '#374151',
      overlay: 'rgba(0,0,0,0.7)',
    },
    typography: DEFAULT_THEME_TYPOGRAPHY,
    borders: DEFAULT_THEME_BORDERS,
    shadows: {
      tooltip: '0 4px 6px -1px rgba(0,0,0,0.3), 0 2px 4px -2px rgba(0,0,0,0.2)',
      modal: '0 20px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.2)',
    },
  },
  {
    name: 'Minimal',
    description: 'Simple and distraction-free',
    colors: {
      primary: '#111827',
      secondary: '#6b7280',
      background: '#ffffff',
      text: '#111827',
      text_secondary: '#6b7280',
      border: '#f3f4f6',
      overlay: 'rgba(0,0,0,0.3)',
    },
    typography: DEFAULT_THEME_TYPOGRAPHY,
    borders: {
      radius: '4px',
      width: '1px',
      style: 'solid',
    },
    shadows: {
      tooltip: '0 1px 3px rgba(0,0,0,0.08)',
      modal: '0 4px 6px rgba(0,0,0,0.1)',
    },
  },
];

/**
 * Helper to get theme settings (popover_size, progress_style)
 */
export function getThemeSettings(theme: TourTheme): { popover_size: PopoverSize; progress_style: ProgressStyle } {
  const buttons = theme.buttons as Record<string, unknown> || {};
  const settings = (buttons._settings as Record<string, unknown>) || {};

  return {
    popover_size: (settings.popover_size as PopoverSize) || 'medium',
    progress_style: (settings.progress_style as ProgressStyle) || 'dots',
  };
}
