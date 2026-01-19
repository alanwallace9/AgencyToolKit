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
  ghl_domain: string | null;
  builder_auto_close: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgencySettings {
  menu: MenuConfig | null;
  login: LoginConfig | null;
  loading: LoadingConfig | null;
  colors: ColorConfig | null;
  whitelisted_locations: string[];
  // Theme Builder activation states (all default to false)
  login_active?: boolean;
  loading_active?: boolean;
  menu_active?: boolean;
  colors_active?: boolean;
  // Saved colors from color picker (max 20)
  saved_colors?: string[];
  // Saved widget themes for Social Proof
  saved_widget_themes?: SavedWidgetTheme[];
}

export interface MenuConfig {
  hidden_items: string[];
  renamed_items: Record<string, string>;
  hidden_banners: string[];
  item_order?: string[];
  dividers?: MenuPresetDivider[];
  preview_theme?: string | null;
  // Track which template was last loaded (for display purposes)
  last_template?: string | null;
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
  animation_speed?: number; // 0.25 to 2.0 (1.0 = normal)
  animation_size?: number; // 0.5 to 2.0 (1.0 = default ~40px base)
  custom_css?: string | null;
}

export interface ColorConfig {
  primary: string;
  accent: string;
  sidebar_bg: string;
  sidebar_text: string;
  // Extended elements (optional, generates additional CSS)
  extended?: ExtendedElementsConfig;
}

// Extended elements configuration for additional GHL styling beyond the 4 native colors
export interface ExtendedElementsConfig {
  top_nav_bg?: ExtendedColorOption;
  top_nav_text?: ExtendedColorOption;
  main_area_bg?: ExtendedColorOption;
  card_bg?: ExtendedColorOption;
  button_primary_bg?: ExtendedColorOption;
  button_primary_text?: ExtendedColorOption;
  input_bg?: ExtendedColorOption;
  input_border?: ExtendedColorOption;
  link_color?: ExtendedColorOption;
}

// Each extended color can be a fixed color or a percentage variation of a base color
export interface ExtendedColorOption {
  enabled: boolean;
  type: 'fixed' | 'variation';
  // For fixed colors
  color?: string;
  // For variations (tint/shade of base color)
  baseColor?: 'primary' | 'accent' | 'sidebar_bg' | 'sidebar_text';
  percentage?: 10 | 25 | 50 | 75 | 100;
}

// Available extended element keys for type safety
export type ExtendedElementKey = keyof ExtendedElementsConfig;

export interface Customer {
  id: string;
  agency_id: string;
  name: string;
  token: string;
  ghl_location_id: string | null;
  ghl_url: string | null; // Optional override for custom GHL domains
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
    preview_theme?: string | null;
  };
  created_at: string;
  updated_at: string;
}

// ============================================
// DIGITAL ADOPTION PLATFORM (DAP) TYPES
// ============================================

// Tour status
export type TourStatus = 'draft' | 'live' | 'archived';

// Step types
export type TourStepType = 'modal' | 'tooltip' | 'slideout' | 'hotspot' | 'banner';

// Button actions
export type StepButtonAction = 'next' | 'prev' | 'close' | 'url' | 'tour' | 'custom';

// Button styles
export type StepButtonStyle = 'primary' | 'secondary' | 'ghost';

// Progress indicator styles
export type ProgressStyle = 'dots' | 'numbers' | 'bar' | 'none';

// Position options
export type StepPosition =
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'center'
  | 'auto'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left';

// Device types
export type DeviceType = 'desktop' | 'tablet' | 'mobile';

// Frequency types
export type TourFrequency = {
  type: 'once' | 'session' | 'always' | 'interval';
  interval_days?: number;
};

// URL pattern types
export type UrlPatternType = 'exact' | 'contains' | 'starts_with' | 'ends_with' | 'wildcard' | 'regex';

export interface UrlPattern {
  id?: string;
  type: UrlPatternType;
  value: string;
  description?: string;
}

export interface UrlTargeting {
  mode: 'all' | 'specific' | 'exclude';
  patterns?: UrlPattern[];
}

export interface UserTargeting {
  type: 'all' | 'new_users' | 'returning' | 'not_completed' | 'custom';
  new_user_days?: number;
  not_completed_tour?: string;
  custom_segment?: {
    conditions: Array<{
      attribute: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'gt' | 'lt' | 'exists';
      value: unknown;
    }>;
    operator: 'and' | 'or';
  };
}

export interface TourTargeting {
  url_targeting?: UrlTargeting;
  element_condition?: {
    selector: string;
    must_exist?: boolean;
  } | null;
  user_targeting?: UserTargeting;
  devices?: DeviceType[];
}

export interface TourSettings {
  autoplay?: boolean;
  trigger_element?: string;
  delay_seconds?: number;
  remember_progress?: boolean;
  show_progress?: boolean;
  progress_style?: ProgressStyle;
  allow_skip?: boolean;
  show_close?: boolean;
  close_on_outside_click?: boolean;
  frequency?: TourFrequency;
  priority?: number;
}

export interface ElementTarget {
  selector: string;
  displayName?: string;
  isFragile?: boolean;
  pageUrl?: string;
  metadata?: {
    tagName: string;
    text?: string;
    attributes?: Record<string, string>;
    parentSelector?: string;
  };
}

// Data returned from builder mode element selection
export interface SelectedElementData {
  selector: string;
  displayName: string;
  tagName: string;
  pageUrl: string;
  pageTitle: string;
  isFragile: boolean;
  attributes: Record<string, string>;
  rect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  sessionId: string;
  timestamp: number;
  cancelled?: boolean;
}

export interface StepMedia {
  type: 'image' | 'video' | 'gif';
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface StepButton {
  text?: string;
  action?: string;
  visible?: boolean;
  url?: string;
  tour_id?: string;
  style?: StepButtonStyle;
}

export type ProgressTrigger =
  | { type: 'button' }
  | { type: 'element_click' }
  | { type: 'any_click' }
  | { type: 'element_exists'; selector: string }
  | { type: 'delay'; ms: number };

export interface TourStep {
  id: string;
  order: number;
  type: TourStepType;
  title?: string;
  content: string;
  media?: StepMedia;
  element?: ElementTarget;
  position?: StepPosition;
  highlight?: boolean;
  backdrop?: boolean;
  buttons?: {
    primary?: StepButton;
    secondary?: StepButton;
  };
  progress_trigger?: ProgressTrigger;
  auto_skip?: boolean;
  delay_ms?: number;
  settings?: {
    show_overlay?: boolean;
    highlight_element?: boolean;
    allow_interaction?: boolean;
  };
}

export interface Tour {
  id: string;
  agency_id: string;
  subaccount_id: string | null;
  name: string;
  description: string | null;
  status: TourStatus;
  priority: number;
  steps: TourStep[];
  settings: TourSettings;
  targeting: TourTargeting;
  theme_id: string | null;
  published_at: string | null;
  created_by: string | null;
  // Legacy fields (for backwards compatibility)
  page?: string;
  trigger?: 'first_visit' | 'manual' | 'button';
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// TOUR THEME TYPES
// ============================================

export interface TourThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  text_secondary: string;
  border: string;
  overlay: string;
}

export interface TourThemeTypography {
  font_family: string;
  title_size: string;
  body_size: string;
  line_height: string;
}

export interface TourThemeBorders {
  radius: string;
  width: string;
  style: string;
}

export interface TourThemeShadows {
  tooltip: string;
  modal: string;
}

export interface TourThemeButtonStyle {
  background: string;
  text: string;
  border: string;
  hover_background: string;
  hover_text: string;
  padding: string;
  border_radius: string;
}

export interface TourTheme {
  id: string;
  agency_id: string;
  name: string;
  is_default: boolean;
  colors: TourThemeColors;
  typography: TourThemeTypography;
  borders: TourThemeBorders;
  shadows: TourThemeShadows;
  buttons: {
    primary: TourThemeButtonStyle;
    secondary: TourThemeButtonStyle;
  };
  custom_css?: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// TOUR ANALYTICS TYPES
// ============================================

export type TourAnalyticsEventType = 'view' | 'step_view' | 'complete' | 'dismiss' | 'skip' | 'click';

export interface TourAnalyticsEvent {
  id: string;
  agency_id: string;
  tour_id: string | null;
  event_type: TourAnalyticsEventType;
  step_id?: string;
  step_order?: number;
  session_id: string;
  user_identifier?: string;
  url?: string;
  device_type?: DeviceType;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface TourAnalyticsSummary {
  total_views: number;
  unique_users: number;
  completions: number;
  completion_rate: number;
  avg_completion_time_ms: number;
  dismissals: number;
}

export interface TourStepAnalytics {
  step_id: string;
  step_order: number;
  step_title: string;
  views: number;
  completions: number;
  drop_off_rate: number;
  avg_time_on_step_ms: number;
}

// ============================================
// CHECKLIST TYPES
// ============================================

export type ChecklistActionType = 'tour' | 'url' | 'js_event' | 'none';
export type CompletionTriggerType = 'tour_complete' | 'url_visited' | 'element_clicked' | 'manual' | 'js_event';
export type CompletionActionType = 'modal' | 'redirect' | 'js_event' | 'confetti' | 'none';

export interface ChecklistAction {
  type: ChecklistActionType;
  tour_id?: string;
  url?: string;
  new_tab?: boolean;
  event_name?: string;
}

export interface ChecklistCompletionTrigger {
  type: CompletionTriggerType;
  tour_id?: string;
  pattern?: UrlPattern;
  selector?: string;
  event_name?: string;
}

export interface ChecklistItem {
  id: string;
  order: number;
  title: string;
  description?: string;
  action: ChecklistAction;
  completion_trigger: ChecklistCompletionTrigger;
}

export interface ChecklistWidget {
  position: 'bottom-left' | 'bottom-right';
  collapsed_by_default: boolean;
  show_progress: boolean;
  hide_when_complete: boolean;
}

export interface ChecklistCompletionAction {
  type: CompletionActionType;
  content?: string;
  url?: string;
  event_name?: string;
}

export interface Checklist {
  id: string;
  agency_id: string;
  subaccount_id: string | null;
  name: string;
  title: string;
  description?: string;
  status: TourStatus;
  items: ChecklistItem[];
  targeting: TourTargeting;
  widget: ChecklistWidget;
  on_complete?: ChecklistCompletionAction;
  theme_id: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// SMART TIP (TOOLTIP) TYPES
// ============================================

export type SmartTipTrigger = 'hover' | 'click' | 'focus';

export interface SmartTip {
  id: string;
  agency_id: string;
  subaccount_id: string | null;
  name: string;
  status: TourStatus;
  element: ElementTarget;
  content: string;
  trigger: SmartTipTrigger;
  position: StepPosition;
  targeting: TourTargeting;
  theme_id: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// BANNER TYPES
// ============================================

export type BannerPosition = 'top' | 'bottom';
export type BannerStyle = 'info' | 'success' | 'warning' | 'error' | 'custom';

export interface BannerAction {
  label: string;
  type: 'url' | 'tour' | 'dismiss';
  url?: string;
  tour_id?: string;
}

export interface Banner {
  id: string;
  agency_id: string;
  subaccount_id: string | null;
  name: string;
  status: TourStatus;
  content: string;
  position: BannerPosition;
  style: BannerStyle;
  dismissible: boolean;
  action?: BannerAction;
  targeting: TourTargeting;
  start_date?: string;
  end_date?: string;
  theme_id: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// RESOURCE CENTER TYPES
// ============================================

export type ResourceCenterIcon = 'help' | 'book' | 'lightbulb' | 'custom';
export type ResourceSectionType = 'tours' | 'links' | 'checklist';

export interface ResourceCenterWidget {
  position: 'bottom-right' | 'bottom-left';
  icon: ResourceCenterIcon;
  custom_icon_url?: string;
  label?: string;
}

export interface ResourceLink {
  id: string;
  label: string;
  url: string;
  icon?: string;
  new_tab: boolean;
}

export interface ResourceSection {
  id: string;
  order: number;
  title: string;
  type: ResourceSectionType;
  tour_ids?: string[];
  links?: ResourceLink[];
  checklist_id?: string;
}

export interface ResourceCenter {
  id: string;
  agency_id: string;
  subaccount_id: string | null;
  name: string;
  status: TourStatus;
  widget: ResourceCenterWidget;
  sections: ResourceSection[];
  search_enabled: boolean;
  targeting: TourTargeting;
  theme_id: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// TOUR TEMPLATE TYPES
// ============================================

export type TourTemplateCategory = 'system' | 'custom';

export interface TourTemplate {
  id: string;
  agency_id: string | null; // null = system template
  name: string;
  description?: string;
  category: TourTemplateCategory;
  steps: TourStep[];
  settings: Partial<TourSettings>;
  preview_image_url?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// USER TOUR STATE TYPES
// ============================================

export type UserTourStatus = 'not_started' | 'in_progress' | 'completed' | 'dismissed';

export interface StepHistoryEntry {
  step_id: string;
  viewed_at: string;
  completed_at?: string;
}

export interface UserTourState {
  id: string;
  agency_id: string;
  tour_id: string;
  user_identifier: string;
  status: UserTourStatus;
  current_step: number;
  started_at?: string;
  completed_at?: string;
  dismissed_at?: string;
  step_history: StepHistoryEntry[];
  created_at: string;
  updated_at: string;
}

export interface UserChecklistState {
  user_identifier: string;
  checklist_id: string;
  completed_items: string[];
  dismissed: boolean;
  started_at: string;
  completed_at?: string;
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

// ============================================
// SOCIAL PROOF WIDGET TYPES
// ============================================

export type SocialProofTheme = 'minimal' | 'glass' | 'dark' | 'rounded' | 'custom';
export type SocialProofPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
export type SocialProofUrlMode = 'all' | 'include' | 'exclude';
export type SocialProofEventType =
  | 'signup'
  | 'trial'
  | 'demo'
  | 'purchase'
  | 'subscription'
  | 'milestone'
  | 'connected'
  | 'review_milestone'
  | 'lead_milestone'
  | 'custom';
// Verified data sources only - no manual entry or CSV import
export type SocialProofEventSource = 'auto' | 'google' | 'webhook' | 'stripe';

export interface SocialProofCustomColors {
  background: string;
  text: string;
  accent: string;
  border: string;
}

export interface SavedWidgetTheme {
  id: string;
  name: string;
  colors: SocialProofCustomColors;
}

export interface SocialProofWidget {
  id: string;
  agency_id: string;
  name: string;
  token: string;
  is_active: boolean;

  // Display
  theme: SocialProofTheme;
  position: SocialProofPosition;
  custom_colors: SocialProofCustomColors;
  custom_css: string | null;

  // Timing
  display_duration: number;
  gap_between: number;
  initial_delay: number;

  // Content
  show_first_name: boolean;
  show_city: boolean;
  show_business_name: boolean;
  show_time_ago: boolean;
  time_ago_text: string;

  // Targeting
  url_mode: SocialProofUrlMode;
  url_patterns: string[];

  // Form Capture
  form_selector: string | null;
  capture_email: boolean;
  capture_phone: boolean;
  capture_business_name: boolean;

  // Rotation
  max_events_in_rotation: number;
  randomize_order: boolean;

  created_at: string;
  updated_at: string;
}

export interface SocialProofEvent {
  id: string;
  agency_id: string;
  widget_id: string | null;
  event_type: SocialProofEventType;
  source: SocialProofEventSource;
  first_name: string | null;
  business_name: string;
  city: string | null;
  location: string | null; // Legacy field
  custom_text: string | null;
  display_time_override: string | null;
  details: Record<string, unknown>;
  is_visible: boolean;
  created_at: string;
}

// Event type display text mapping
export const SOCIAL_PROOF_EVENT_TYPE_TEXT: Record<SocialProofEventType, string> = {
  signup: 'just signed up',
  trial: 'just started their free trial',
  demo: 'just requested a demo',
  purchase: 'just subscribed',
  subscription: 'just subscribed',
  milestone: '',
  connected: 'just connected',
  review_milestone: '',
  lead_milestone: '',
  custom: '',
};

// Widget limits by plan
export const SOCIAL_PROOF_WIDGET_LIMITS: Record<string, number> = {
  free: 0,
  toolkit: 5,
  pro: Infinity,
};

export interface AnalyticsEvent {
  id: string;
  agency_id: string;
  customer_id: string | null;
  event_type: string;
  event_data: Record<string, unknown>;
  created_at: string;
}
