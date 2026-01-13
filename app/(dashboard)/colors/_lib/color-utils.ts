// Color utility functions for HSL conversion, harmony calculations, and WCAG contrast

export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export interface ColorConfig {
  primary: string;
  accent: string;
  sidebar_bg: string;
  sidebar_text: string;
}

// ============================================
// Color Conversion Functions
// ============================================

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert hex color to HSL
 */
export function hexToHsl(hex: string): HSL {
  const rgb = hexToRgb(hex);
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: l * 100 };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    case b:
      h = ((r - g) / d + 4) / 6;
      break;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to hex color
 */
export function hslToHex(hsl: HSL): string {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  if (s === 0) {
    const gray = Math.round(l * 255);
    return rgbToHex(gray, gray, gray);
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);

  return rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
}

// ============================================
// Color Harmony Functions
// ============================================

export type HarmonyType = 'complementary' | 'triadic' | 'analogous' | 'split-complementary';

/**
 * Get harmonious colors based on color theory
 * Uses HSL hue rotation for mathematically correct harmonies
 */
export function getHarmonyColors(hex: string, type: HarmonyType): string[] {
  const hsl = hexToHsl(hex);

  switch (type) {
    case 'complementary':
      // Opposite on color wheel (180 degrees)
      return [hslToHex({ ...hsl, h: (hsl.h + 180) % 360 })];

    case 'triadic':
      // Three colors evenly spaced (120 degrees apart)
      return [
        hslToHex({ ...hsl, h: (hsl.h + 120) % 360 }),
        hslToHex({ ...hsl, h: (hsl.h + 240) % 360 }),
      ];

    case 'analogous':
      // Adjacent colors (30 degrees apart)
      return [
        hslToHex({ ...hsl, h: (hsl.h + 30) % 360 }),
        hslToHex({ ...hsl, h: (hsl.h - 30 + 360) % 360 }),
      ];

    case 'split-complementary':
      // Complement's neighbors (150 and 210 degrees)
      return [
        hslToHex({ ...hsl, h: (hsl.h + 150) % 360 }),
        hslToHex({ ...hsl, h: (hsl.h + 210) % 360 }),
      ];

    default:
      return [];
  }
}

/**
 * Get all harmony suggestions for a given color
 */
export function getAllHarmonies(hex: string): { type: HarmonyType; colors: string[] }[] {
  return [
    { type: 'complementary', colors: getHarmonyColors(hex, 'complementary') },
    { type: 'triadic', colors: getHarmonyColors(hex, 'triadic') },
    { type: 'analogous', colors: getHarmonyColors(hex, 'analogous') },
    { type: 'split-complementary', colors: getHarmonyColors(hex, 'split-complementary') },
  ];
}

// ============================================
// WCAG Contrast Functions
// ============================================

/**
 * Calculate relative luminance of a color
 * Per WCAG 2.1 guidelines
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);

  const sRGB = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
  const [r, g, b] = sRGB.map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 and 21
 */
export function getContrastRatio(color1: string, color2: string): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG requirements
 */
export interface ContrastResult {
  ratio: number;
  ratioText: string;
  passesAA: boolean; // 4.5:1 for normal text
  passesAALarge: boolean; // 3:1 for large text (18pt+ or 14pt bold)
  passesAAA: boolean; // 7:1 for normal text
  level: 'fail' | 'AA-large' | 'AA' | 'AAA';
}

export function checkContrast(foreground: string, background: string): ContrastResult {
  const ratio = getContrastRatio(foreground, background);
  const passesAA = ratio >= 4.5;
  const passesAALarge = ratio >= 3;
  const passesAAA = ratio >= 7;

  let level: ContrastResult['level'] = 'fail';
  if (passesAAA) level = 'AAA';
  else if (passesAA) level = 'AA';
  else if (passesAALarge) level = 'AA-large';

  return {
    ratio,
    ratioText: `${ratio.toFixed(1)}:1`,
    passesAA,
    passesAALarge,
    passesAAA,
    level,
  };
}

// ============================================
// Color Name Mapping
// ============================================

const COLOR_NAMES: Record<string, string> = {
  '#2563eb': 'Royal Blue',
  '#1d4ed8': 'Deep Blue',
  '#3b82f6': 'Sky Blue',
  '#06b6d4': 'Cyan',
  '#0891b2': 'Teal',
  '#16a34a': 'Forest Green',
  '#059669': 'Emerald',
  '#10b981': 'Mint',
  '#84cc16': 'Lime',
  '#22c55e': 'Green',
  '#ea580c': 'Burnt Orange',
  '#f97316': 'Orange',
  '#f59e0b': 'Amber',
  '#fbbf24': 'Gold',
  '#d97706': 'Bronze',
  '#6366f1': 'Indigo',
  '#8b5cf6': 'Violet',
  '#7c3aed': 'Purple',
  '#0f172a': 'Midnight',
  '#1f2937': 'Charcoal',
  '#334155': 'Slate',
  '#f8fafc': 'Snow',
  '#f0f9ff': 'Ice Blue',
  '#ecfdf5': 'Mint Cream',
  '#fff7ed': 'Peach',
  '#fef3c7': 'Cream',
  '#e2e8f0': 'Silver',
  '#dcfce7': 'Pale Green',
  '#fed7aa': 'Apricot',
  '#0c4a6e': 'Navy',
  '#14532d': 'Pine',
  '#431407': 'Espresso',
  '#7c2d12': 'Rust',
  '#064e3b': 'Teal Dark',
  '#0a0a0a': 'Black',
};

/**
 * Get a friendly name for a color, or generate one based on hue
 */
export function getColorName(hex: string): string {
  const normalized = hex.toLowerCase();
  if (COLOR_NAMES[normalized]) {
    return COLOR_NAMES[normalized];
  }

  // Generate name based on hue
  const hsl = hexToHsl(hex);
  const hueNames = [
    'Red', 'Orange', 'Yellow', 'Lime', 'Green', 'Teal',
    'Cyan', 'Sky', 'Blue', 'Indigo', 'Purple', 'Pink',
  ];
  const hueIndex = Math.round(hsl.h / 30) % 12;
  const lightness = hsl.l > 70 ? 'Light ' : hsl.l < 30 ? 'Dark ' : '';

  return `${lightness}${hueNames[hueIndex]}`;
}

// ============================================
// Validation
// ============================================

/**
 * Check if a string is a valid hex color
 */
export function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

/**
 * Normalize hex to lowercase with # prefix
 */
export function normalizeHex(hex: string): string {
  const cleaned = hex.replace('#', '').toLowerCase();
  if (cleaned.length === 3) {
    // Expand shorthand (#abc -> #aabbcc)
    return `#${cleaned[0]}${cleaned[0]}${cleaned[1]}${cleaned[1]}${cleaned[2]}${cleaned[2]}`;
  }
  return `#${cleaned}`;
}
