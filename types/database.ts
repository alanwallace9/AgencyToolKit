// types/database.ts

export interface Agency {
  id: string;
  clerk_user_id: string;
  email: string;
  name: string;
  token: string;
  plan: 'toolkit' | 'pro'; // toolkit = free tier
  role: 'agency' | 'super_admin'; // super_admin = platform owner
  settings: AgencySettings;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  ghl_domain: string | null;
  builder_auto_close: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null; // Soft delete timestamp. NULL = active
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
  // Photo upload settings
  photo_uploads?: PhotoUploadSettings;
}

export interface CustomMenuLink {
  id: string;              // "custom_" + hash of selector
  selector: string;        // CSS selector in GHL DOM
  original_label: string;  // Text found during scan
  href?: string;           // Link URL if detectable
  scanned_at: string;      // ISO timestamp
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
  // Custom menu links (agency-specific, detected via sidebar scan)
  custom_links?: CustomMenuLink[];
  hidden_custom_links?: string[];
  renamed_custom_links?: Record<string, string>;
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
  image_position?: string; // CSS background-position (e.g., 'center', 'left center', '50% 20%')
  image_size?: string;     // CSS background-size (e.g., 'cover', 'contain', '50% 100%')
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
  logo_url?: string; // Agency logo override for the GHL header bar (CSS content: url)
  form_logo_url?: string; // Logo inside the form card, above heading (CSS ::before on .login-card-heading)
  form_logo_height?: number; // Form logo height in px (40-100, default 60)
  form_heading?: string; // Heading text displayed above form fields
  form_heading_color?: string; // Heading text color
  form_width?: number; // Form container width in px (GHL default: 370)
  hide_google_signin?: boolean; // Hide Google sign-in button + "Or Continue with" divider
  hide_login_header?: boolean; // Hide GHL header (logo + language picker)
  secondary_text_color?: string; // "Or Continue with" and footer text color
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
  photo_count: number;
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
  auto_advance?: boolean; // Auto-advance when highlighted element is clicked
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
  tag_id: string | null;
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
// GUIDELY THEME TYPES (Unified Themes System)
// ============================================

export interface GuidelyThemeColors {
  primary: string;
  primary_hover: string;
  primary_text: string;
  secondary: string;
  secondary_hover: string;
  secondary_text: string;
  background: string;
  text: string;
  text_secondary: string;
  border: string;
}

export interface GuidelyThemeTypography {
  font_family: string;
  title_size: string;
  body_size: string;
  line_height: string;
}

export interface GuidelyThemeShape {
  radius: string;
  width: string;
  style: string;
}

export interface GuidelyThemeShadows {
  tooltip: string;
  modal: string;
}

export type GuidelyAvatarShape = 'circle' | 'rounded' | 'square';

export interface GuidelyThemeAvatar {
  enabled: boolean;
  shape: GuidelyAvatarShape;
  size: string;
  default_image_url: string | null;
}

export type GuidelyButtonStyle = 'filled' | 'outline' | 'ghost';

export interface GuidelyThemeButtonConfig {
  style: GuidelyButtonStyle;
  border_radius: string;
  primary: TourThemeButtonStyle;
  secondary: TourThemeButtonStyle;
}

export type GuidelyProgressStyle = 'dots' | 'numbers' | 'bar';

export interface GuidelyTourOverrides {
  progress_color: string | null;
  progress_inactive: string | null;
  close_icon_color: string | null;
  backdrop_color: string;
  progress_style: GuidelyProgressStyle;
}

export interface GuidelySmartTipOverrides {
  tooltip_background: string | null;
  beacon_color: string | null;
  arrow_color: string | null;
}

export interface GuidelyBannerOverrides {
  banner_background: string | null;
  banner_text: string | null;
  dismiss_icon_color: string | null;
}

export interface GuidelyChecklistOverrides {
  header_background: string | null;
  header_text: string | null;
  completion_color: string | null;
  item_text_color: string | null;
  link_color: string | null;
}

export interface GuidelyTheme {
  id: string;
  agency_id: string | null;  // null = system template
  name: string;
  description: string | null;
  is_system: boolean;
  is_default: boolean;
  colors: GuidelyThemeColors;
  typography: GuidelyThemeTypography;
  borders: GuidelyThemeShape;  // Using 'borders' for DB compatibility
  shadows: GuidelyThemeShadows;
  buttons: GuidelyThemeButtonConfig;
  avatar: GuidelyThemeAvatar;
  tour_overrides: GuidelyTourOverrides;
  smart_tip_overrides: GuidelySmartTipOverrides;
  banner_overrides: GuidelyBannerOverrides;
  checklist_overrides: GuidelyChecklistOverrides;
  custom_css?: string | null;
  created_at: string;
  updated_at: string;
}

export interface GuidelyDefaults {
  tour_theme_id: string | null;
  smart_tip_theme_id: string | null;
  banner_theme_id: string | null;
  checklist_theme_id: string | null;
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
  default_state: 'expanded' | 'minimized';
  minimized_text: string;
  cta_text: string;
  hide_when_complete: boolean;
  show_confetti: boolean;
}

export interface ChecklistOnComplete {
  type: 'none' | 'celebration' | 'redirect';
  url?: string;
}

export interface ChecklistTargeting {
  url_mode: 'all' | 'specific';
  url_patterns: string[];
  customer_mode: 'all' | 'specific';
  customer_ids: string[];
}

export interface Checklist {
  id: string;
  agency_id: string;
  name: string;
  title: string;
  description?: string | null;
  status: 'draft' | 'live' | 'archived';
  items: ChecklistItem[];
  widget: ChecklistWidget;
  on_complete: ChecklistOnComplete;
  targeting: ChecklistTargeting;
  theme_id: string | null;
  tag_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerChecklistProgress {
  id: string;
  customer_id: string;
  checklist_id: string;
  completed_items: string[];
  status: 'not_started' | 'in_progress' | 'completed' | 'dismissed';
  started_at: string | null;
  completed_at: string | null;
  dismissed_at: string | null;
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// SMART TIP (TOOLTIP) TYPES
// ============================================

export type SmartTipTrigger = 'hover' | 'click' | 'focus' | 'delay';
export type SmartTipSize = 'small' | 'medium' | 'large';
export type SmartTipBeaconStyle = 'pulse' | 'question' | 'info';
export type SmartTipBeaconPosition = 'top' | 'right' | 'bottom' | 'left';
export type SmartTipBeaconTarget = 'element' | 'beacon' | 'automatic'; // Where tooltip appears (automatic = beacon if enabled, else element)

export interface SmartTipBeacon {
  enabled: boolean;
  style: SmartTipBeaconStyle; // pulse = pulsating dot, question = ?, info = !
  position: SmartTipBeaconPosition; // Where beacon appears relative to element
  offset_x: number; // Horizontal offset in pixels
  offset_y: number; // Vertical offset in pixels
  size: number; // Beacon size in pixels (12-40px range)
  target: SmartTipBeaconTarget; // Whether tooltip targets element or beacon
}

export interface SmartTip {
  id: string;
  agency_id: string;
  subaccount_id: string | null;
  name: string;
  status: TourStatus;
  element: ElementTarget;
  content: string;
  trigger: SmartTipTrigger;
  delay_seconds?: number; // Used when trigger is 'delay'
  position: StepPosition;
  size?: SmartTipSize; // Tooltip width: small=200px, medium=280px, large=360px
  beacon?: SmartTipBeacon; // Optional beacon/hotspot indicator
  targeting: TourTargeting;
  theme_id: string | null;
  tag_id: string | null;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// BANNER TYPES
// ============================================

export type BannerType = 'standard' | 'trial_expiration';
export type BannerStatus = 'draft' | 'live' | 'archived' | 'scheduled';
export type BannerPosition = 'top' | 'bottom';
export type BannerDisplayMode = 'inline' | 'float';
export type BannerStylePreset = 'info' | 'success' | 'warning' | 'error' | 'custom';
export type BannerActionType = 'url' | 'tour' | 'checklist' | 'dismiss';
export type BannerPriority = 'high' | 'normal' | 'low';
export type BannerDismissDuration = 'session' | 'permanent';

export interface BannerAction {
  enabled: boolean;
  label: string;
  type: BannerActionType;
  url?: string | null;
  tour_id?: string | null;
  checklist_id?: string | null;
  new_tab?: boolean;
  whole_banner_clickable?: boolean;
}

export interface BannerTargeting {
  url_mode: 'all' | 'specific' | 'except';
  url_patterns: string[];  // Simple string patterns with wildcard support for V1
  customer_mode: 'all' | 'specific';
  customer_ids: string[];
}

export interface BannerSchedule {
  mode: 'always' | 'range';
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  timezone: 'user' | string;
}

export interface BannerTrialTriggers {
  days_remaining: number;
}

export interface BannerCustomColors {
  background: string;
  text: string;
  button_bg?: string;
  button_text?: string;
}

export interface Banner {
  id: string;
  agency_id: string;
  name: string;
  banner_type: BannerType;
  status: BannerStatus;
  content: string;
  action: BannerAction;
  position: BannerPosition;
  display_mode: BannerDisplayMode;
  style_preset: BannerStylePreset;
  custom_colors: BannerCustomColors | null;
  theme_id: string | null;
  tag_id: string | null;
  dismissible: boolean;
  dismiss_duration: BannerDismissDuration;
  priority: BannerPriority;
  exclusive: boolean;
  targeting: BannerTargeting;
  schedule: BannerSchedule;
  trial_triggers: BannerTrialTriggers;
  view_count: number;
  click_count: number;
  dismiss_count: number;
  published_at: string | null;
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

// Image Template text configuration
export interface ImageTemplateTextConfig {
  // Position (percentage of image dimensions for responsive positioning)
  x: number;
  y: number;

  // Text box dimensions (percentage)
  width?: number;
  height?: number;

  // Typography
  font: string;
  size: number;
  font_weight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  font_style?: 'normal' | 'italic';
  text_decoration?: 'none' | 'underline';
  text_align?: 'left' | 'center' | 'right';
  text_transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  letter_spacing?: number;

  // Colors
  color: string;
  background_color: string | null;
  padding?: number;

  // Content
  fallback: string;
  prefix?: string; // e.g., "Hi " for "Hi Sarah!"
  suffix?: string; // e.g., "!" for "Hi Sarah!"
}

export interface ImageTemplate {
  id: string;
  agency_id: string;
  name: string;

  // Image source
  base_image_url: string;
  base_image_width: number;
  base_image_height: number;

  // Text overlay configuration
  text_config: ImageTemplateTextConfig;

  // Optional customer association (for per-subaccount images)
  customer_id?: string | null;

  // A/B testing
  ab_pair_id?: string | null;
  ab_variant?: 'A' | 'B' | null;

  // Usage stats
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

// Widget limits by plan (TrustSignal for agency's own site is free for all plans)
export const SOCIAL_PROOF_WIDGET_LIMITS: Record<string, number> = {
  toolkit: Infinity, // Free for agency use
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

// ============================================
// CUSTOMER PHOTO UPLOAD TYPES
// ============================================

export interface CustomerPhoto {
  id: string;
  customer_id: string;
  agency_id: string;
  blob_url: string;
  name: string;
  original_filename: string | null;
  file_size: number | null;
  uploaded_at: string;
  created_at: string;
}

export interface Notification {
  id: string;
  agency_id: string;
  type: 'photo_upload' | 'tour_complete' | 'system' | string;
  title: string;
  message: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

export type PhotoNotificationMethod = 'in_app' | 'webhook';

export interface PhotoUploadSettings {
  enabled: boolean;
  allow_text_positioning: boolean;
  notify_on_upload: boolean;
  notification_method: PhotoNotificationMethod;
  webhook_url?: string;
}

export const DEFAULT_PHOTO_UPLOAD_SETTINGS: PhotoUploadSettings = {
  enabled: true,
  allow_text_positioning: false,
  notify_on_upload: true,
  notification_method: 'in_app',
};
