import type {
  LoginDesignFormStyle,
  LoginDesignBackground,
  CanvasElement,
} from '@/types/database';

// Default form style (including form container background)
export const DEFAULT_FORM_STYLE: LoginDesignFormStyle = {
  button_bg: '#2563eb',
  button_text: '#ffffff',
  input_bg: '#ffffff',
  input_border: '#d1d5db',
  input_text: '#111827',
  link_color: '#2563eb',
  form_bg: 'rgba(255, 255, 255, 0.05)',
  label_color: 'rgba(255, 255, 255, 0.6)',
};

// GHL-native form style — matches what GHL actually renders on the login page
// Used by "Blank Canvas" preset to strip all custom CSS
export const GHL_NATIVE_FORM_STYLE: LoginDesignFormStyle = {
  button_bg: '#2563eb',
  button_text: '#ffffff',
  input_bg: '#ffffff',
  input_border: '#d1d5db',
  input_text: '#111827',
  link_color: '#2563eb',
  form_bg: '#ffffff',
  label_color: '#374151',
  form_border_radius: 8,
  form_heading: 'Sign into your account',
  form_heading_color: '#000000',
  form_width: 420,
};

// Default canvas (16:9 aspect ratio)
export const DEFAULT_CANVAS: {
  width: number;
  height: number;
  background: LoginDesignBackground;
} = {
  width: 1600,
  height: 900,
  background: {
    type: 'solid' as const,
    color: '#1e293b',
  },
};

// Default login form element (required) - centered
export const DEFAULT_LOGIN_FORM_ELEMENT: CanvasElement = {
  id: 'login-form',
  type: 'login-form',
  x: 37.5, // Centers a 25% width element
  y: 25,
  width: 400, // 25% of 1600
  height: 400, // Nominal value — login-form renders with height: auto
  zIndex: 10,
  props: {
    variant: 'default',
  },
};
