/**
 * Color Picker Utility Functions
 *
 * Handles color format conversions between hex, rgba, and hsva
 */

import type { HsvaColor, GradientValue } from './types';

/**
 * Parse a color string to extract hex and opacity
 * Supports: #rgb, #rrggbb, #rrggbbaa, rgb(), rgba()
 */
export function parseColor(color: string): { hex: string; opacity: number } {
  if (!color) return { hex: '#000000', opacity: 100 };

  // Handle rgba format
  const rgbaMatch = color.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
  );
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1]);
    const g = parseInt(rgbaMatch[2]);
    const b = parseInt(rgbaMatch[3]);
    const a = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1;
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    return { hex, opacity: Math.round(a * 100) };
  }

  // Handle hex format
  let hex = color.startsWith('#') ? color : `#${color}`;

  // Handle shorthand hex (#rgb -> #rrggbb)
  if (hex.length === 4) {
    hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }

  // Handle 8-character hex with alpha
  if (hex.length === 9) {
    const alpha = parseInt(hex.slice(7, 9), 16);
    return {
      hex: hex.slice(0, 7),
      opacity: Math.round((alpha / 255) * 100),
    };
  }

  return { hex: hex.slice(0, 7), opacity: 100 };
}

/**
 * Format a color with opacity
 * Returns 8-char hex if opacity < 100, otherwise 6-char hex
 */
export function formatColorWithOpacity(hex: string, opacity: number): string {
  const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
  if (opacity >= 100) {
    return `#${cleanHex.slice(0, 6)}`;
  }
  const alpha = Math.round((opacity / 100) * 255)
    .toString(16)
    .padStart(2, '0');
  return `#${cleanHex.slice(0, 6)}${alpha}`;
}

/**
 * Convert hex to HSVA (used by react-colorful)
 */
export function hexToHsva(hex: string): HsvaColor {
  const { hex: cleanHex, opacity } = parseColor(hex);
  const rgb = hexToRgb(cleanHex);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  return { ...hsv, a: opacity / 100 };
}

/**
 * Convert HSVA to hex with alpha
 */
export function hsvaToHex(hsva: HsvaColor): string {
  // Guard against invalid values
  const h = Number.isFinite(hsva.h) ? hsva.h : 0;
  const s = Number.isFinite(hsva.s) ? hsva.s : 0;
  const v = Number.isFinite(hsva.v) ? hsva.v : 100;
  const a = Number.isFinite(hsva.a) ? hsva.a : 1;

  const rgb = hsvToRgb(h, s, v);

  // Guard against NaN in RGB values
  const r = Number.isFinite(rgb.r) ? rgb.r : 0;
  const g = Number.isFinite(rgb.g) ? rgb.g : 0;
  const b = Number.isFinite(rgb.b) ? rgb.b : 0;

  const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  return formatColorWithOpacity(hex, Math.round(a * 100));
}

/**
 * Hex to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
  const r = parseInt(cleanHex.slice(0, 2), 16);
  const g = parseInt(cleanHex.slice(2, 4), 16);
  const b = parseInt(cleanHex.slice(4, 6), 16);
  return {
    r: Number.isFinite(r) ? r : 0,
    g: Number.isFinite(g) ? g : 0,
    b: Number.isFinite(b) ? b : 0,
  };
}

/**
 * RGB to HSV
 */
export function rgbToHsv(
  r: number,
  g: number,
  b: number
): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, v: v * 100 };
}

/**
 * HSV to RGB
 */
export function hsvToRgb(
  h: number,
  s: number,
  v: number
): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  v /= 100;

  let r = 0,
    g = 0,
    b = 0;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Validate hex color
 */
export function isValidHex(hex: string): boolean {
  return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(hex);
}

/**
 * Normalize hex (add # prefix, lowercase)
 */
export function normalizeHex(hex: string): string {
  let clean = hex.startsWith('#') ? hex : `#${hex}`;
  if (clean.length === 4) {
    clean = `#${clean[1]}${clean[1]}${clean[2]}${clean[2]}${clean[3]}${clean[3]}`;
  }
  return clean.toLowerCase();
}

/**
 * Generate CSS gradient string from GradientValue
 */
export function gradientToCss(gradient: GradientValue): string {
  const sortedStops = [...gradient.stops].sort((a, b) => a.position - b.position);
  const stopsStr = sortedStops
    .map((stop) => `${stop.color} ${stop.position}%`)
    .join(', ');

  if (gradient.type === 'radial') {
    return `radial-gradient(circle, ${stopsStr})`;
  }

  return `linear-gradient(${gradient.angle}deg, ${stopsStr})`;
}

/**
 * Parse CSS gradient string to GradientValue
 * Supports: linear-gradient(Xdeg, color1, color2) and radial-gradient(circle, color1, color2)
 */
export function parseGradient(css: string): GradientValue | null {
  if (!css || !css.includes('gradient')) return null;

  const isRadial = css.startsWith('radial-gradient');
  const isLinear = css.startsWith('linear-gradient');

  if (!isRadial && !isLinear) return null;

  // Extract angle for linear gradients
  let angle = 135;
  if (isLinear) {
    const angleMatch = css.match(/linear-gradient\((\d+)deg/);
    if (angleMatch) {
      angle = parseInt(angleMatch[1], 10);
    }
  }

  // Extract color stops - match colors with optional positions
  // Pattern: #hex, rgb(), rgba(), or color name followed by optional percentage
  const colorStopPattern = /(#[0-9A-Fa-f]{3,8}|rgba?\([^)]+\)|[a-zA-Z]+)(?:\s+(\d+)%)?/g;
  const stops: GradientValue['stops'] = [];
  let match;
  let index = 0;

  // Get the content inside the gradient function
  const contentMatch = css.match(/gradient\([^,]*,\s*(.+)\)$/);
  const content = contentMatch ? contentMatch[1] : css;

  while ((match = colorStopPattern.exec(content)) !== null) {
    const color = match[1];
    // If position is specified, use it; otherwise calculate based on index
    let position = match[2] ? parseInt(match[2], 10) : -1;

    stops.push({
      id: `stop_${index}`,
      color,
      position, // Will be fixed below
    });
    index++;
  }

  // Fix positions for stops without explicit positions
  if (stops.length > 0) {
    // First stop defaults to 0, last to 100
    if (stops[0].position === -1) stops[0].position = 0;
    if (stops.length > 1 && stops[stops.length - 1].position === -1) {
      stops[stops.length - 1].position = 100;
    }
    // Interpolate any middle stops without positions
    for (let i = 1; i < stops.length - 1; i++) {
      if (stops[i].position === -1) {
        // Find next stop with position
        let nextWithPos = i + 1;
        while (nextWithPos < stops.length && stops[nextWithPos].position === -1) {
          nextWithPos++;
        }
        // Find previous stop with position
        let prevWithPos = i - 1;
        while (prevWithPos >= 0 && stops[prevWithPos].position === -1) {
          prevWithPos--;
        }
        // Interpolate
        const prevPos = stops[prevWithPos].position;
        const nextPos = stops[nextWithPos].position;
        const range = nextWithPos - prevWithPos;
        stops[i].position = prevPos + ((nextPos - prevPos) * (i - prevWithPos)) / range;
      }
    }
  }

  if (stops.length < 2) return null;

  return {
    type: isRadial ? 'radial' : 'linear',
    angle,
    stops,
  };
}

/**
 * Generate unique ID for gradient stops
 */
export function generateStopId(): string {
  return `stop_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Check if browser supports EyeDropper API
 */
export function supportsEyeDropper(): boolean {
  return typeof window !== 'undefined' && 'EyeDropper' in window;
}

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  SAVED_COLORS: 'agency-toolkit-saved-colors',
  COACH_MARKS: 'agency-toolkit-color-picker-coach',
} as const;

/**
 * Get saved colors from localStorage
 */
export function getSavedColors(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED_COLORS);
    if (saved) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed.colors) ? parsed.colors : [];
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}

/**
 * Save colors to localStorage
 */
export function setSavedColors(colors: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const current = localStorage.getItem(STORAGE_KEYS.SAVED_COLORS);
    const parsed = current ? JSON.parse(current) : { colors: [], gradients: [] };
    parsed.colors = colors.slice(0, 20); // Max 20 colors
    localStorage.setItem(STORAGE_KEYS.SAVED_COLORS, JSON.stringify(parsed));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Check if coach marks have been seen
 */
export function hasSeenCoachMarks(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const state = localStorage.getItem(STORAGE_KEYS.COACH_MARKS);
    return state ? JSON.parse(state).hasSeenColorPicker : false;
  } catch {
    return false;
  }
}

/**
 * Mark coach marks as seen
 */
export function setCoachMarksSeen(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      STORAGE_KEYS.COACH_MARKS,
      JSON.stringify({ hasSeenColorPicker: true })
    );
  } catch {
    // Ignore storage errors
  }
}
