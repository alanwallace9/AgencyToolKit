/**
 * Tour Engine - Shared utilities for preview and production tour rendering
 *
 * Used by:
 * - Dashboard preview mode (Feature 21)
 * - Production embed script (Feature 22)
 */

// Theme presets
export {
  TOUR_THEME_PRESETS,
  getThemePreset,
  getDefaultTheme,
  type TourThemeColors,
  type TourThemePreset,
} from './theme-presets';

// State management
export {
  getAllTourStates,
  getTourState,
  setTourState,
  markTourStarted,
  markTourCompleted,
  markTourDismissed,
  recordStepView,
  hasSeenTour,
  markSeenThisSession,
  clearAllTourState,
  isFirstCompletedTour,
  type TourUserState,
  type TourStepHistory,
  type AllTourStates,
} from './state';

// Targeting logic
export {
  detectDevice,
  matchUrlPattern,
  matchesUrlTargeting,
  matchesUserTargeting,
  matchesDeviceTargeting,
  matchesElementTargeting,
  shouldShowTour,
  getUserContext,
  type UrlPattern,
  type UrlTargeting,
  type UserTargeting,
  type TourTargeting,
  type TourFrequency,
  type MatchContext,
} from './targeting';
