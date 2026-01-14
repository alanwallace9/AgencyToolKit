/**
 * Security Utilities Index
 *
 * This module exports all security utilities for the DAP system.
 * Import from here for a clean API:
 *
 * @example
 * import {
 *   sanitizeHTML,
 *   validateSelector,
 *   safeQuerySelector,
 *   matchUrlPattern,
 *   schemas
 * } from '@/lib/security';
 */

// HTML Sanitization
export {
  sanitizeHTML,
  sanitizeText,
  sanitizeURL,
  sanitizeImageURL,
  sanitizeCSS,
  SANITIZE_CONFIG,
} from './sanitize';

// CSS Selector Validation
export {
  validateSelector,
  safeQuerySelector,
  safeQuerySelectorAll,
  generateSafeSelector,
  SELECTOR_LIMITS,
  type SelectorValidationResult,
} from './selector-validator';

// URL Validation and Pattern Matching
export {
  isGhlDomain,
  validateUrl,
  compilePattern,
  clearPatternCache,
  matchUrlPattern,
  matchUrlPatterns,
  isUrlAllowed,
  validateUrlPattern,
  createGhlWhitelist,
  URL_VALIDATOR_LIMITS,
} from './url-validator';

// Zod Validation Schemas
export {
  // Individual schemas
  urlPatternSchema,
  urlTargetingSchema,
  userTargetingSchema,
  tourTargetingSchema,
  tourSettingsSchema,
  tourStepSchema,
  tourSchema,
  createTourSchema,
  updateTourSchema,
  tourThemeSchema,
  checklistSchema,
  checklistItemSchema,
  smartTipSchema,
  bannerSchema,
  resourceCenterSchema,
  tourTemplateSchema,
  tourAnalyticsEventSchema,
  // All schemas object
  schemas,
  // Types
  type UrlPatternInput,
  type TourInput,
  type CreateTourInput,
  type UpdateTourInput,
  type TourStepInput,
  type TourThemeInput,
  type ChecklistInput,
  type SmartTipInput,
  type BannerInput,
  type ResourceCenterInput,
  type TourTemplateInput,
  type AnalyticsEventInput,
} from './validation-schemas';
