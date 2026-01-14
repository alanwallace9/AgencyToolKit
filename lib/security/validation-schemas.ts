/**
 * Zod Validation Schemas for DAP System
 *
 * CRITICAL SECURITY MODULE
 * All user input MUST be validated using these schemas before processing.
 * These schemas enforce:
 * - Type safety
 * - String length limits
 * - Valid enum values
 * - Required fields
 */

import { z } from 'zod';

// ============================================
// COMMON SCHEMAS
// ============================================

// UUID schema
const uuidSchema = z.string().uuid();

// Non-empty string with max length
const safeString = (maxLength: number = 1000) =>
  z.string().min(1).max(maxLength).trim();

// Optional string with max length
const optionalString = (maxLength: number = 1000) =>
  z.string().max(maxLength).trim().optional();

// HTML content (will be sanitized, but limit length)
const htmlContent = z.string().max(50000);

// ============================================
// URL PATTERN SCHEMAS
// ============================================

export const urlPatternTypeSchema = z.enum([
  'exact',
  'contains',
  'starts_with',
  'ends_with',
  'wildcard',
  'regex',
]);

export const urlPatternSchema = z.object({
  id: safeString(50),
  type: urlPatternTypeSchema,
  value: safeString(500),
  description: optionalString(200),
});

export const urlTargetingSchema = z.object({
  mode: z.enum(['all', 'whitelist', 'blacklist']),
  patterns: z.array(urlPatternSchema).max(50),
});

// ============================================
// USER TARGETING SCHEMAS
// ============================================

export const segmentConditionSchema = z.object({
  attribute: safeString(100),
  operator: z.enum(['equals', 'not_equals', 'contains', 'gt', 'lt', 'exists']),
  value: z.unknown(),
});

export const userSegmentSchema = z.object({
  conditions: z.array(segmentConditionSchema).max(20),
  operator: z.enum(['and', 'or']),
});

export const userTargetingSchema = z.object({
  type: z.enum(['all', 'new_users', 'returning', 'not_completed', 'custom']),
  new_user_days: z.number().int().min(1).max(365).optional(),
  not_completed_tour: uuidSchema.optional(),
  custom_segment: userSegmentSchema.optional(),
});

// ============================================
// TOUR TARGETING SCHEMA
// ============================================

export const deviceTypeSchema = z.enum(['desktop', 'tablet', 'mobile']);

export const tourTargetingSchema = z.object({
  url_targeting: urlTargetingSchema,
  element_condition: z.string().max(500).nullable().optional(),
  user_targeting: userTargetingSchema,
  devices: z.array(deviceTypeSchema).min(1).max(3),
});

// ============================================
// TOUR SETTINGS SCHEMA
// ============================================

export const tourFrequencySchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('once') }),
  z.object({ type: z.literal('once_per_session') }),
  z.object({ type: z.literal('every_time') }),
  z.object({ type: z.literal('interval'), days: z.number().int().min(1).max(365) }),
]);

export const progressStyleSchema = z.enum(['dots', 'numbers', 'bar', 'none']);

export const tourSettingsSchema = z.object({
  autoplay: z.boolean(),
  trigger_element: z.string().max(500).optional(),
  remember_progress: z.boolean(),
  show_progress: z.boolean(),
  progress_style: progressStyleSchema,
  allow_skip: z.boolean(),
  show_close: z.boolean(),
  close_on_outside_click: z.boolean(),
  frequency: tourFrequencySchema,
});

// ============================================
// TOUR STEP SCHEMAS
// ============================================

export const stepTypeSchema = z.enum([
  'modal',
  'pointer',
  'slideout',
  'hotspot',
  'banner',
]);

export const stepPositionSchema = z.enum([
  'top',
  'right',
  'bottom',
  'left',
  'center',
  'auto',
]);

export const stepButtonActionSchema = z.enum([
  'next',
  'prev',
  'close',
  'url',
  'tour',
  'custom',
]);

export const stepButtonStyleSchema = z.enum(['primary', 'secondary', 'ghost']);

export const stepButtonSchema = z.object({
  id: safeString(50),
  label: safeString(100),
  action: stepButtonActionSchema,
  url: z.string().max(2000).optional(),
  tour_id: uuidSchema.optional(),
  style: stepButtonStyleSchema,
  position: z.enum(['left', 'right']),
});

export const elementTargetSchema = z.object({
  selector: safeString(500),
  metadata: z
    .object({
      tagName: safeString(50),
      text: optionalString(200),
      attributes: z.record(z.string(), z.string().max(500)).optional(),
      parentSelector: optionalString(500),
    })
    .optional(),
});

export const stepMediaSchema = z.object({
  type: z.enum(['image', 'video', 'gif']),
  url: z.string().url().max(2000),
  alt: optionalString(200),
  width: z.number().int().min(1).max(4000).optional(),
  height: z.number().int().min(1).max(4000).optional(),
});

export const progressTriggerSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('button') }),
  z.object({ type: z.literal('element_click') }),
  z.object({ type: z.literal('any_click') }),
  z.object({
    type: z.literal('element_exists'),
    selector: safeString(500),
  }),
  z.object({
    type: z.literal('delay'),
    ms: z.number().int().min(100).max(60000),
  }),
]);

export const tourStepSchema = z.object({
  id: safeString(50),
  order: z.number().int().min(0).max(100),
  type: stepTypeSchema,
  title: optionalString(200),
  content: htmlContent,
  media: stepMediaSchema.optional(),
  element: elementTargetSchema.optional(),
  position: stepPositionSchema.optional(),
  highlight: z.boolean(),
  backdrop: z.boolean(),
  buttons: z.array(stepButtonSchema).max(5),
  progress_trigger: progressTriggerSchema,
  auto_skip: z.boolean().optional(),
  delay_ms: z.number().int().min(0).max(60000).optional(),
});

// ============================================
// TOUR SCHEMA
// ============================================

export const tourStatusSchema = z.enum(['draft', 'live', 'archived']);

export const tourSchema = z.object({
  id: uuidSchema.optional(), // Optional for create, required for update
  agency_id: uuidSchema,
  subaccount_id: uuidSchema.nullable().optional(),
  name: safeString(200),
  description: optionalString(1000).nullable(),
  status: tourStatusSchema,
  priority: z.number().int().min(0).max(1000),
  steps: z.array(tourStepSchema).max(50),
  settings: tourSettingsSchema,
  targeting: tourTargetingSchema,
  theme_id: uuidSchema.nullable().optional(),
});

// Create/Update variants
export const createTourSchema = tourSchema.omit({ id: true });
export const updateTourSchema = tourSchema.partial().required({ id: true });

// ============================================
// TOUR THEME SCHEMAS
// ============================================

export const tourThemeColorsSchema = z.object({
  primary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  secondary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  background: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  text: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  text_secondary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  border: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  overlay: safeString(100), // Can be rgba()
});

export const tourThemeTypographySchema = z.object({
  font_family: safeString(200),
  title_size: safeString(20),
  body_size: safeString(20),
  line_height: safeString(10),
});

export const tourThemeBordersSchema = z.object({
  radius: safeString(20),
  width: safeString(20),
  style: safeString(20),
});

export const tourThemeShadowsSchema = z.object({
  tooltip: safeString(200),
  modal: safeString(200),
});

export const tourThemeButtonStyleSchema = z.object({
  background: safeString(50),
  text: safeString(50),
  border: safeString(50),
  hover_background: safeString(50),
  hover_text: safeString(50),
  padding: safeString(50),
  border_radius: safeString(20),
});

export const tourThemeSchema = z.object({
  id: uuidSchema.optional(),
  agency_id: uuidSchema,
  name: safeString(100),
  is_default: z.boolean(),
  colors: tourThemeColorsSchema,
  typography: tourThemeTypographySchema,
  borders: tourThemeBordersSchema,
  shadows: tourThemeShadowsSchema,
  buttons: z.object({
    primary: tourThemeButtonStyleSchema,
    secondary: tourThemeButtonStyleSchema,
  }),
  custom_css: optionalString(10000).nullable(),
});

// ============================================
// CHECKLIST SCHEMAS
// ============================================

export const checklistActionSchema = z.object({
  type: z.enum(['tour', 'url', 'js_event', 'none']),
  tour_id: uuidSchema.optional(),
  url: z.string().max(2000).optional(),
  new_tab: z.boolean().optional(),
  event_name: safeString(100).optional(),
});

export const checklistCompletionTriggerSchema = z.object({
  type: z.enum([
    'tour_complete',
    'url_visited',
    'element_clicked',
    'manual',
    'js_event',
  ]),
  tour_id: uuidSchema.optional(),
  pattern: urlPatternSchema.optional(),
  selector: safeString(500).optional(),
  event_name: safeString(100).optional(),
});

export const checklistItemSchema = z.object({
  id: safeString(50),
  order: z.number().int().min(0).max(100),
  title: safeString(200),
  description: optionalString(500),
  action: checklistActionSchema,
  completion_trigger: checklistCompletionTriggerSchema,
});

export const checklistWidgetSchema = z.object({
  position: z.enum(['bottom-left', 'bottom-right']),
  collapsed_by_default: z.boolean(),
  show_progress: z.boolean(),
  hide_when_complete: z.boolean(),
});

export const checklistCompletionActionSchema = z.object({
  type: z.enum(['modal', 'redirect', 'js_event', 'confetti', 'none']),
  content: optionalString(5000),
  url: z.string().max(2000).optional(),
  event_name: safeString(100).optional(),
});

export const checklistSchema = z.object({
  id: uuidSchema.optional(),
  agency_id: uuidSchema,
  subaccount_id: uuidSchema.nullable().optional(),
  name: safeString(200),
  title: safeString(200),
  description: optionalString(1000),
  status: tourStatusSchema,
  items: z.array(checklistItemSchema).max(20),
  targeting: tourTargetingSchema,
  widget: checklistWidgetSchema,
  on_complete: checklistCompletionActionSchema.optional(),
  theme_id: uuidSchema.nullable().optional(),
});

// ============================================
// SMART TIP SCHEMAS
// ============================================

export const smartTipTriggerSchema = z.enum(['hover', 'click', 'focus']);

export const smartTipSchema = z.object({
  id: uuidSchema.optional(),
  agency_id: uuidSchema,
  subaccount_id: uuidSchema.nullable().optional(),
  name: safeString(200),
  status: tourStatusSchema,
  element: elementTargetSchema,
  content: htmlContent.max(5000),
  trigger: smartTipTriggerSchema,
  position: stepPositionSchema,
  targeting: tourTargetingSchema,
  theme_id: uuidSchema.nullable().optional(),
});

// ============================================
// BANNER SCHEMAS
// ============================================

export const bannerPositionSchema = z.enum(['top', 'bottom']);
export const bannerStyleSchema = z.enum([
  'info',
  'success',
  'warning',
  'error',
  'custom',
]);

export const bannerActionSchema = z.object({
  label: safeString(100),
  type: z.enum(['url', 'tour', 'dismiss']),
  url: z.string().max(2000).optional(),
  tour_id: uuidSchema.optional(),
});

export const bannerSchema = z.object({
  id: uuidSchema.optional(),
  agency_id: uuidSchema,
  subaccount_id: uuidSchema.nullable().optional(),
  name: safeString(200),
  status: tourStatusSchema,
  content: htmlContent.max(2000),
  position: bannerPositionSchema,
  style: bannerStyleSchema,
  dismissible: z.boolean(),
  action: bannerActionSchema.optional(),
  targeting: tourTargetingSchema,
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  theme_id: uuidSchema.nullable().optional(),
});

// ============================================
// RESOURCE CENTER SCHEMAS
// ============================================

export const resourceCenterIconSchema = z.enum([
  'help',
  'book',
  'lightbulb',
  'custom',
]);

export const resourceCenterWidgetSchema = z.object({
  position: z.enum(['bottom-right', 'bottom-left']),
  icon: resourceCenterIconSchema,
  custom_icon_url: z.string().url().max(2000).optional(),
  label: optionalString(50),
});

export const resourceLinkSchema = z.object({
  id: safeString(50),
  label: safeString(100),
  url: z.string().max(2000),
  icon: optionalString(50),
  new_tab: z.boolean(),
});

export const resourceSectionSchema = z.object({
  id: safeString(50),
  order: z.number().int().min(0).max(20),
  title: safeString(100),
  type: z.enum(['tours', 'links', 'checklist']),
  tour_ids: z.array(uuidSchema).max(20).optional(),
  links: z.array(resourceLinkSchema).max(20).optional(),
  checklist_id: uuidSchema.optional(),
});

export const resourceCenterSchema = z.object({
  id: uuidSchema.optional(),
  agency_id: uuidSchema,
  subaccount_id: uuidSchema.nullable().optional(),
  name: safeString(200),
  status: tourStatusSchema,
  widget: resourceCenterWidgetSchema,
  sections: z.array(resourceSectionSchema).max(10),
  search_enabled: z.boolean(),
  targeting: tourTargetingSchema,
  theme_id: uuidSchema.nullable().optional(),
});

// ============================================
// TOUR TEMPLATE SCHEMAS
// ============================================

export const tourTemplateSchema = z.object({
  id: uuidSchema.optional(),
  agency_id: uuidSchema.nullable(),
  name: safeString(200),
  description: optionalString(1000),
  category: z.enum(['system', 'custom']),
  steps: z.array(tourStepSchema).max(50),
  settings: tourSettingsSchema.partial(),
  preview_image_url: z.string().url().max(2000).optional(),
});

// ============================================
// ANALYTICS EVENT SCHEMA
// ============================================

export const analyticsEventTypeSchema = z.enum([
  'view',
  'step_view',
  'complete',
  'dismiss',
  'skip',
  'click',
]);

export const tourAnalyticsEventSchema = z.object({
  tour_id: uuidSchema.optional(),
  event_type: analyticsEventTypeSchema,
  step_id: safeString(50).optional(),
  step_order: z.number().int().min(0).max(100).optional(),
  session_id: safeString(100),
  user_identifier: optionalString(200),
  url: z.string().max(2000).optional(),
  device_type: deviceTypeSchema.optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// ============================================
// EXPORT ALL SCHEMAS
// ============================================

export const schemas = {
  // URL and Targeting
  urlPattern: urlPatternSchema,
  urlTargeting: urlTargetingSchema,
  userTargeting: userTargetingSchema,
  tourTargeting: tourTargetingSchema,

  // Tour
  tour: tourSchema,
  createTour: createTourSchema,
  updateTour: updateTourSchema,
  tourStep: tourStepSchema,
  tourSettings: tourSettingsSchema,

  // Theme
  tourTheme: tourThemeSchema,

  // Checklist
  checklist: checklistSchema,
  checklistItem: checklistItemSchema,

  // Smart Tip
  smartTip: smartTipSchema,

  // Banner
  banner: bannerSchema,

  // Resource Center
  resourceCenter: resourceCenterSchema,

  // Template
  tourTemplate: tourTemplateSchema,

  // Analytics
  analyticsEvent: tourAnalyticsEventSchema,
};

// Type exports
export type UrlPatternInput = z.infer<typeof urlPatternSchema>;
export type TourInput = z.infer<typeof tourSchema>;
export type CreateTourInput = z.infer<typeof createTourSchema>;
export type UpdateTourInput = z.infer<typeof updateTourSchema>;
export type TourStepInput = z.infer<typeof tourStepSchema>;
export type TourThemeInput = z.infer<typeof tourThemeSchema>;
export type ChecklistInput = z.infer<typeof checklistSchema>;
export type SmartTipInput = z.infer<typeof smartTipSchema>;
export type BannerInput = z.infer<typeof bannerSchema>;
export type ResourceCenterInput = z.infer<typeof resourceCenterSchema>;
export type TourTemplateInput = z.infer<typeof tourTemplateSchema>;
export type AnalyticsEventInput = z.infer<typeof tourAnalyticsEventSchema>;
