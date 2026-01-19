/**
 * Tour State Management
 * Handles localStorage persistence for tour progress and completion
 */

const TOUR_STATE_KEY = 'at_tour_state';
const SESSION_KEY_PREFIX = 'at_tour_session_';

export interface TourStepHistory {
  stepId: string;
  viewedAt: number;
  completedAt?: number;
}

export interface TourUserState {
  status: 'not_started' | 'in_progress' | 'completed' | 'dismissed';
  currentStep: number;
  startedAt?: number;
  completedAt?: number;
  dismissedAt?: number;
  viewCount: number;
  lastViewedAt?: number;
  stepHistory: TourStepHistory[];
}

export interface AllTourStates {
  [tourId: string]: TourUserState;
}

/**
 * Get all tour states from localStorage
 */
export function getAllTourStates(): AllTourStates {
  if (typeof window === 'undefined') return {};

  try {
    const state = localStorage.getItem(TOUR_STATE_KEY);
    return state ? JSON.parse(state) : {};
  } catch {
    return {};
  }
}

/**
 * Get state for a specific tour
 */
export function getTourState(tourId: string): TourUserState | null {
  const allStates = getAllTourStates();
  return allStates[tourId] || null;
}

/**
 * Update state for a specific tour
 */
export function setTourState(tourId: string, updates: Partial<TourUserState>): void {
  if (typeof window === 'undefined') return;

  try {
    const allStates = getAllTourStates();
    const existingState = allStates[tourId] || {
      status: 'not_started',
      currentStep: 0,
      viewCount: 0,
      stepHistory: [],
    };

    allStates[tourId] = {
      ...existingState,
      ...updates,
    };

    localStorage.setItem(TOUR_STATE_KEY, JSON.stringify(allStates));
  } catch (error) {
    console.error('[AgencyToolkit] Failed to save tour state:', error);
  }
}

/**
 * Mark tour as started
 */
export function markTourStarted(tourId: string): void {
  const existing = getTourState(tourId);
  setTourState(tourId, {
    status: 'in_progress',
    startedAt: Date.now(),
    currentStep: 0,
    viewCount: (existing?.viewCount || 0) + 1,
    lastViewedAt: Date.now(),
  });
}

/**
 * Mark tour as completed
 */
export function markTourCompleted(tourId: string): void {
  setTourState(tourId, {
    status: 'completed',
    completedAt: Date.now(),
  });
}

/**
 * Mark tour as dismissed
 */
export function markTourDismissed(tourId: string, atStep: number): void {
  setTourState(tourId, {
    status: 'dismissed',
    dismissedAt: Date.now(),
    currentStep: atStep,
  });
}

/**
 * Record step view
 */
export function recordStepView(tourId: string, stepId: string, stepIndex: number): void {
  const state = getTourState(tourId);
  const stepHistory = state?.stepHistory || [];

  // Check if step already recorded
  const existingStep = stepHistory.find((s) => s.stepId === stepId);
  if (!existingStep) {
    stepHistory.push({
      stepId,
      viewedAt: Date.now(),
    });
  }

  setTourState(tourId, {
    currentStep: stepIndex,
    stepHistory,
  });
}

/**
 * Check if user has seen tour based on frequency settings
 */
export function hasSeenTour(
  tourId: string,
  frequency?: { type: string; days?: number }
): boolean {
  const state = getTourState(tourId);
  if (!state) return false;

  const freqType = frequency?.type || 'once';

  switch (freqType) {
    case 'once':
      return state.status === 'completed' || state.status === 'dismissed';

    case 'once_per_session':
      return sessionStorage.getItem(`${SESSION_KEY_PREFIX}${tourId}`) === 'seen';

    case 'interval':
      if (!state.lastViewedAt || !frequency?.days) return false;
      const daysSinceLastView = (Date.now() - state.lastViewedAt) / (1000 * 60 * 60 * 24);
      return daysSinceLastView < frequency.days;

    case 'every_time':
      return false; // Always show

    default:
      return false;
  }
}

/**
 * Mark tour as seen this session (for once_per_session frequency)
 */
export function markSeenThisSession(tourId: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(`${SESSION_KEY_PREFIX}${tourId}`, 'seen');
}

/**
 * Clear all tour state (for testing/debugging)
 */
export function clearAllTourState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOUR_STATE_KEY);
}

/**
 * Check if this is the user's first completed tour (for celebration)
 */
export function isFirstCompletedTour(): boolean {
  const allStates = getAllTourStates();
  const completedTours = Object.values(allStates).filter(
    (state) => state.status === 'completed'
  );
  return completedTours.length === 0;
}
