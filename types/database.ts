// types/database.ts

export interface Agency {
  id: string;
  clerk_user_id: string;
  email: string;
  name: string;
  token: string;
  plan: 'free' | 'toolkit' | 'pro';
  settings: AgencySettings;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgencySettings {
  menu: MenuConfig | null;
  login: LoginConfig | null;
  loading: LoadingConfig | null;
  colors: ColorConfig | null;
  whitelisted_locations: string[];
}

export interface MenuConfig {
  hidden_items: string[];
  renamed_items: Record<string, string>;
  hidden_banners: string[];
}

export interface LoginConfig {
  logo_url: string | null;
  background_color: string;
  background_image_url: string | null;
  button_color: string;
  button_text_color: string;
}

// Canvas-based Login Designer types
export type LoginLayoutType =
  | 'centered'
  | 'split-left'
  | 'split-right'
  | 'gradient-overlay'
  | 'minimal-dark'
  | 'blank';

export type BackgroundType = 'solid' | 'gradient' | 'image';

export type CanvasElementType =
  | 'image'
  | 'text'
  | 'gif'
  | 'login-form'
  | 'testimonial'
  | 'shape'
  | 'button';

export interface LoginDesignBackground {
  type: BackgroundType;
  color?: string;
  gradient?: {
    from: string;
    to: string;
    angle: number;
  };
  image_url?: string;
  image_blur?: number;
  image_overlay?: string;
}

export interface LoginDesignFormStyle {
  button_bg: string;
  button_text: string;
  input_bg: string;
  input_border: string;
  input_text: string;
  link_color: string;
  form_bg?: string; // Form container background
  form_border?: string; // Form container border color
  form_border_width?: number; // Form container border width in px
  form_border_radius?: number; // Form container border radius in px
  label_color?: string; // Form field label color (Email, Password)
  logo_url?: string; // Custom logo URL for the form
  form_heading?: string; // Heading text displayed above form fields
  form_heading_color?: string; // Heading text color
}

export interface CanvasElementBase {
  id: string;
  type: CanvasElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export interface ImageElementProps {
  url: string;
  opacity: number;
  borderRadius: number;
  objectFit: 'cover' | 'contain' | 'fill';
}

export interface TextElementProps {
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  color: string;
  textAlign: 'left' | 'center' | 'right';
}

export interface GifElementProps {
  url: string;
  opacity: number;
  borderRadius: number;
}

export interface TestimonialElementProps {
  quote: string;
  author: string;
  variant: 'card' | 'minimal' | 'quote-only';
  bgColor: string;
  textColor: string;
}

export interface ShapeElementProps {
  shapeType: 'line' | 'rectangle' | 'circle';
  color: string;
  opacity: number;
  borderWidth?: number;
  orientation?: 'horizontal' | 'vertical'; // For line shapes
}

export interface ButtonElementProps {
  text: string;
  url: string;
  bgColor: string;
  textColor: string;
  borderRadius: number;
}

export interface LoginFormElementProps {
  // Login form is required, just controls position
  variant: 'default' | 'compact';
}

export type CanvasElement = CanvasElementBase & {
  props:
    | ImageElementProps
    | TextElementProps
    | GifElementProps
    | TestimonialElementProps
    | ShapeElementProps
    | ButtonElementProps
    | LoginFormElementProps;
};

export interface LoginDesign {
  id: string;
  agency_id: string;
  name: string;
  is_default: boolean;
  layout: LoginLayoutType;
  canvas: {
    width: number;
    height: number;
    background: LoginDesignBackground;
  };
  elements: CanvasElement[];
  form_style: LoginDesignFormStyle;
  created_at: string;
  updated_at: string;
}

export interface LoadingConfig {
  animation_id: string;
  custom_color?: string;
  use_brand_color?: boolean;
  background_color?: string;
  animation_speed?: number; // 0.5 to 2.0 (1.0 = normal)
  custom_css?: string | null;
}

export interface ColorConfig {
  primary: string;
  accent: string;
  sidebar_bg: string;
  sidebar_text: string;
}

export interface Customer {
  id: string;
  agency_id: string;
  name: string;
  token: string;
  ghl_location_id: string | null;
  gbp_place_id: string | null;
  gbp_connected_at: string | null;
  settings: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuPresetDivider {
  id: string;
  type: string;
  text: string;
  visible: boolean;
}

export interface MenuPreset {
  id: string;
  agency_id: string;
  name: string;
  is_default: boolean;
  config: {
    hidden_items: string[];
    renamed_items: Record<string, string>;
    item_order: string[];
    hidden_banners: string[];
    dividers?: MenuPresetDivider[];
  };
  created_at: string;
  updated_at: string;
}

export interface Tour {
  id: string;
  agency_id: string;
  name: string;
  page: string;
  trigger: 'first_visit' | 'manual' | 'button';
  is_active: boolean;
  steps: TourStep[];
  created_at: string;
  updated_at: string;
}

export interface TourStep {
  selector: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export interface ImageTemplate {
  id: string;
  agency_id: string;
  name: string;
  base_image_url: string;
  base_image_width: number;
  base_image_height: number;
  text_config: {
    x: number;
    y: number;
    font: string;
    size: number;
    color: string;
    background_color: string | null;
    fallback: string;
  };
  render_count: number;
  last_rendered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SocialProofEvent {
  id: string;
  agency_id: string;
  event_type: 'signup' | 'subscription' | 'milestone' | 'connected';
  business_name: string;
  location: string | null;
  details: Record<string, unknown>;
  is_visible: boolean;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  agency_id: string;
  customer_id: string | null;
  event_type: string;
  event_data: Record<string, unknown>;
  created_at: string;
}
