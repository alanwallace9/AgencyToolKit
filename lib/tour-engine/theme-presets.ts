/**
 * Tour Theme Presets
 * 4 built-in themes that blend with common agency brand colors
 * No color picker needed - these cover most use cases
 */

export interface TourThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  textSecondary: string;
  border: string;
  overlay: string;
}

export interface TourThemePreset {
  id: string;
  name: string;
  colors: TourThemeColors;
}

export const TOUR_THEME_PRESETS: TourThemePreset[] = [
  {
    id: 'blue',
    name: 'Blue',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      background: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
  },
  {
    id: 'green',
    name: 'Green',
    colors: {
      primary: '#22c55e',
      secondary: '#64748b',
      background: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
  },
  {
    id: 'orange',
    name: 'Orange',
    colors: {
      primary: '#f97316',
      secondary: '#64748b',
      background: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
  },
  {
    id: 'navy',
    name: 'Dark Navy',
    colors: {
      primary: '#1e293b',
      secondary: '#475569',
      background: '#ffffff',
      text: '#1e293b',
      textSecondary: '#475569',
      border: '#e2e8f0',
      overlay: 'rgba(0, 0, 0, 0.6)',
    },
  },
];

export function getThemePreset(id: string): TourThemePreset | undefined {
  return TOUR_THEME_PRESETS.find((theme) => theme.id === id);
}

export function getDefaultTheme(): TourThemePreset {
  return TOUR_THEME_PRESETS[0]; // Blue is default
}
