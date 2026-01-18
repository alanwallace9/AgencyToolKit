/**
 * Custom Color Picker Types
 *
 * Premium color picker with tabs: Color | Gradient | Theme
 * Built on react-colorful (2.8KB, zero deps)
 */

export interface ColorPickerProps {
  /** Current color value (hex with optional alpha, e.g., "#14532d" or "#14532dcc") */
  value: string;
  /** Callback when color changes */
  onChange: (color: string) => void;
  /** Brand colors for Theme tab */
  brandColors?: BrandColors;
  /** Whether to show the gradient tab */
  showGradient?: boolean;
  /** Whether to show the theme tab */
  showTheme?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Optional label above the trigger */
  label?: string;
}

export interface BrandColors {
  primary: string;
  accent: string;
  sidebar_bg: string;
  sidebar_text: string;
}

export interface GradientStop {
  id: string;
  color: string;
  position: number; // 0-100
}

export interface GradientValue {
  type: 'linear' | 'radial';
  angle: number; // 0-360
  stops: GradientStop[];
}

export interface SavedColors {
  colors: string[]; // Up to 20 hex values with alpha
  gradients: SavedGradient[];
}

export interface SavedGradient {
  id: string;
  name?: string;
  type: 'linear' | 'radial';
  angle: number;
  stops: { color: string; position: number }[];
}

export type ColorPickerTab = 'color' | 'gradient' | 'theme';

// HSVA color format used internally by react-colorful
export interface HsvaColor {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
  a: number; // 0-1
}

// Utility type for the eyedropper API
export interface EyeDropperResult {
  sRGBHex: string;
}

// Coach marks state
export interface CoachMarksState {
  hasSeenColorPicker: boolean;
}
