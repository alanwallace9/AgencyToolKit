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

export interface LoadingConfig {
  animation_id: string;
  custom_css: string | null;
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
