/**
 * Guidely Theme Defaults & Constants
 *
 * This file contains the default values and system template definitions
 * for the Guidely unified themes system.
 *
 * Can be imported in both client and server components.
 */

import type {
  GuidelyThemeColors,
  GuidelyThemeTypography,
  GuidelyThemeShape,
  GuidelyThemeShadows,
  GuidelyThemeAvatar,
  GuidelyThemeButtonConfig,
  GuidelyTourOverrides,
  GuidelySmartTipOverrides,
  GuidelyBannerOverrides,
  GuidelyChecklistOverrides,
  GuidelyAvatarShape,
  GuidelyButtonStyle,
  GuidelyProgressStyle,
} from '@/types/database';

// ============================================
// SYSTEM TEMPLATE IDS
// ============================================

export const SYSTEM_THEME_IDS = {
  FRIENDLY: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  CORPORATE: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  BOLD: 'f47ac10b-58cc-4372-a567-0e02b2c3d481',
  MINIMAL: 'f47ac10b-58cc-4372-a567-0e02b2c3d482',
  COLORFUL: 'f47ac10b-58cc-4372-a567-0e02b2c3d483',
} as const;

// ============================================
// DEFAULT VALUES
// ============================================

export const DEFAULT_COLORS: GuidelyThemeColors = {
  primary: '#3B82F6',
  primary_hover: '#2563EB',
  primary_text: '#FFFFFF',
  secondary: '#64748B',
  secondary_hover: '#475569',
  secondary_text: '#FFFFFF',
  background: '#FFFFFF',
  text: '#1F2937',
  text_secondary: '#6B7280',
  border: '#E5E7EB',
};

export const DEFAULT_TYPOGRAPHY: GuidelyThemeTypography = {
  font_family: 'system-ui, -apple-system, sans-serif',
  title_size: '18px',
  body_size: '14px',
  line_height: '1.5',
};

export const DEFAULT_SHAPE: GuidelyThemeShape = {
  radius: '12px',
  width: '1px',
  style: 'solid',
};

export const DEFAULT_SHADOWS: GuidelyThemeShadows = {
  tooltip: '0 4px 12px rgba(0,0,0,0.15)',
  modal: '0 20px 40px rgba(0,0,0,0.2)',
};

export const DEFAULT_AVATAR: GuidelyThemeAvatar = {
  enabled: false,
  shape: 'circle',
  size: '48px',
  default_image_url: null,
};

export const DEFAULT_BUTTONS: GuidelyThemeButtonConfig = {
  style: 'filled',
  border_radius: '8px',
  primary: {
    background: '#3B82F6',
    text: '#FFFFFF',
    border: 'transparent',
    hover_background: '#2563EB',
    hover_text: '#FFFFFF',
    padding: '10px 20px',
    border_radius: '8px',
  },
  secondary: {
    background: 'transparent',
    text: '#64748B',
    border: '#E5E7EB',
    hover_background: '#F3F4F6',
    hover_text: '#1F2937',
    padding: '10px 20px',
    border_radius: '8px',
  },
};

export const DEFAULT_TOUR_OVERRIDES: GuidelyTourOverrides = {
  progress_color: null,
  progress_inactive: null,
  close_icon_color: null,
  backdrop_color: 'rgba(0,0,0,0.5)',
  progress_style: 'dots',
};

export const DEFAULT_SMART_TIP_OVERRIDES: GuidelySmartTipOverrides = {
  tooltip_background: null,
  beacon_color: null,
  arrow_color: null,
};

export const DEFAULT_BANNER_OVERRIDES: GuidelyBannerOverrides = {
  banner_background: null,
  banner_text: null,
  dismiss_icon_color: null,
};

export const DEFAULT_CHECKLIST_OVERRIDES: GuidelyChecklistOverrides = {
  header_background: null,
  header_text: null,
  completion_color: null,
  item_text_color: null,
  link_color: null,
};

// ============================================
// OPTIONS FOR DROPDOWNS
// ============================================

export const FONT_OPTIONS = [
  { value: 'system-ui, -apple-system, sans-serif', label: 'System UI (Recommended)' },
  { value: "'Inter', sans-serif", label: 'Inter' },
  { value: "'Roboto', sans-serif", label: 'Roboto' },
  { value: "'Open Sans', sans-serif", label: 'Open Sans' },
  { value: "'Poppins', sans-serif", label: 'Poppins' },
  { value: "'Lato', sans-serif", label: 'Lato' },
  { value: "'Nunito', sans-serif", label: 'Nunito' },
  { value: "'Montserrat', sans-serif", label: 'Montserrat' },
  { value: "'Source Sans Pro', sans-serif", label: 'Source Sans Pro' },
  { value: "'Helvetica Neue', Helvetica, sans-serif", label: 'Helvetica' },
  { value: "'Georgia', serif", label: 'Georgia' },
  { value: "'Merriweather', serif", label: 'Merriweather' },
];

export const SHADOW_OPTIONS: { value: string; label: string; css: string }[] = [
  { value: 'none', label: 'None', css: 'none' },
  { value: 'subtle', label: 'Subtle', css: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)' },
  { value: 'medium', label: 'Medium', css: '0 4px 12px rgba(0,0,0,0.15)' },
  { value: 'strong', label: 'Strong', css: '0 20px 40px rgba(0,0,0,0.2)' },
];

export const AVATAR_SHAPE_OPTIONS: { value: GuidelyAvatarShape; label: string }[] = [
  { value: 'circle', label: 'Circle' },
  { value: 'rounded', label: 'Rounded Square' },
  { value: 'square', label: 'Square' },
];

export const BUTTON_STYLE_OPTIONS: { value: GuidelyButtonStyle; label: string }[] = [
  { value: 'filled', label: 'Filled' },
  { value: 'outline', label: 'Outline' },
  { value: 'ghost', label: 'Ghost' },
];

export const PROGRESS_STYLE_OPTIONS: { value: GuidelyProgressStyle; label: string }[] = [
  { value: 'dots', label: 'Dots' },
  { value: 'numbers', label: 'Numbers (1/5)' },
  { value: 'bar', label: 'Progress Bar' },
];

export const FONT_SIZE_OPTIONS = [
  { value: '14px', label: '14px' },
  { value: '16px', label: '16px' },
  { value: '18px', label: '18px' },
  { value: '20px', label: '20px' },
  { value: '22px', label: '22px' },
  { value: '24px', label: '24px' },
];

export const BODY_SIZE_OPTIONS = [
  { value: '12px', label: '12px' },
  { value: '13px', label: '13px' },
  { value: '14px', label: '14px' },
  { value: '15px', label: '15px' },
  { value: '16px', label: '16px' },
];

// ============================================
// SYSTEM TEMPLATE DEFINITIONS (for reference)
// ============================================

export interface SystemTemplate {
  id: string;
  name: string;
  description: string;
  hasAvatar: boolean;
  cornerRadius: string;
  primaryColor: string;
  vibe: string;
}

export const SYSTEM_TEMPLATES: SystemTemplate[] = [
  {
    id: SYSTEM_THEME_IDS.FRIENDLY,
    name: 'Friendly',
    description: 'Warm and approachable with avatar support. Great for SaaS and consumer apps.',
    hasAvatar: true,
    cornerRadius: '16px',
    primaryColor: '#3B82F6',
    vibe: 'Warm, approachable',
  },
  {
    id: SYSTEM_THEME_IDS.CORPORATE,
    name: 'Corporate',
    description: 'Professional and clean for B2B and enterprise applications.',
    hasAvatar: false,
    cornerRadius: '8px',
    primaryColor: '#1E3A5F',
    vibe: 'Professional, clean',
  },
  {
    id: SYSTEM_THEME_IDS.BOLD,
    name: 'Bold',
    description: 'Modern and energetic with high contrast. Perfect for startups and creative brands.',
    hasAvatar: false,
    cornerRadius: '24px',
    primaryColor: '#7C3AED',
    vibe: 'Modern, energetic',
  },
  {
    id: SYSTEM_THEME_IDS.MINIMAL,
    name: 'Minimal',
    description: 'Clean and understated. Ideal for productivity and developer tools.',
    hasAvatar: false,
    cornerRadius: '4px',
    primaryColor: '#18181B',
    vibe: 'Clean, understated',
  },
  {
    id: SYSTEM_THEME_IDS.COLORFUL,
    name: 'Colorful',
    description: 'Fun and engaging with bright accents. Great for marketing and education.',
    hasAvatar: true,
    cornerRadius: '20px',
    primaryColor: '#F97316',
    vibe: 'Fun, engaging',
  },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if a color combination has sufficient contrast for WCAG AA
 * Returns true if contrast ratio is >= 4.5:1
 */
export function hasGoodContrast(foreground: string, background: string): boolean {
  const getLuminance = (hex: string): number => {
    // Remove # if present
    hex = hex.replace('#', '');

    // Handle shorthand hex
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }

    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const [rs, gs, bs] = [r, g, b].map(c =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  const contrastRatio = (lighter + 0.05) / (darker + 0.05);

  return contrastRatio >= 4.5;
}

/**
 * Get contrast ratio between two colors
 */
export function getContrastRatio(foreground: string, background: string): number {
  const getLuminance = (hex: string): number => {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const [rs, gs, bs] = [r, g, b].map(c =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Recommended avatar image size
 */
export const AVATAR_RECOMMENDED_SIZE = {
  width: 112,
  height: 112,
  maxFileSize: 500 * 1024, // 500KB
  formats: ['image/png', 'image/jpeg', 'image/webp'],
  displayNote: '112x112px recommended (2x for retina displays)',
};

/**
 * Parse border radius value to number (for sliders)
 */
export function parseRadius(value: string): number {
  return parseInt(value.replace('px', ''), 10) || 0;
}

/**
 * Format border radius number to string
 */
export function formatRadius(value: number): string {
  return `${value}px`;
}
