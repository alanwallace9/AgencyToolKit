/**
 * Tour Targeting Logic
 * Determines if a tour should show based on URL, user, device, and element conditions
 */

import { hasSeenTour } from './state';

export interface UrlPattern {
  type: 'exact' | 'contains' | 'starts_with' | 'ends_with' | 'wildcard' | 'regex';
  value: string;
}

export interface UrlTargeting {
  mode: 'all' | 'whitelist' | 'blacklist';
  patterns?: UrlPattern[];
}

export interface UserTargeting {
  type: 'all' | 'new_users' | 'returning' | 'not_completed';
  newUserDays?: number;
  notCompletedTour?: string;
}

export interface TourTargeting {
  url_targeting?: UrlTargeting;
  user_targeting?: UserTargeting;
  devices?: ('desktop' | 'tablet' | 'mobile')[];
  element_condition?: string; // CSS selector that must exist
}

export interface TourFrequency {
  type: 'once' | 'once_per_session' | 'interval' | 'every_time';
  days?: number;
}

export interface MatchContext {
  url: string;
  userVisitCount: number;
  daysSinceFirstVisit: number;
  device: 'desktop' | 'tablet' | 'mobile';
}

/**
 * Detect current device type based on viewport width
 */
export function detectDevice(): 'desktop' | 'tablet' | 'mobile' {
  if (typeof window === 'undefined') return 'desktop';

  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Match URL against a pattern
 */
export function matchUrlPattern(url: string, pattern: UrlPattern): boolean {
  try {
    switch (pattern.type) {
      case 'exact':
        return url === pattern.value;

      case 'contains':
        return url.includes(pattern.value);

      case 'starts_with':
        return url.startsWith(pattern.value);

      case 'ends_with':
        return url.endsWith(pattern.value);

      case 'wildcard':
        // Convert wildcard to regex: * becomes .*
        const wildcardRegex = new RegExp(
          '^' + pattern.value.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
        );
        return wildcardRegex.test(url);

      case 'regex':
        return new RegExp(pattern.value).test(url);

      default:
        return false;
    }
  } catch (error) {
    console.warn('[AgencyToolkit] Invalid URL pattern:', pattern, error);
    return false;
  }
}

/**
 * Check if URL matches targeting rules
 */
export function matchesUrlTargeting(targeting: UrlTargeting | undefined, currentUrl: string): boolean {
  if (!targeting) return true; // No targeting = show on all pages
  if (targeting.mode === 'all') return true;

  const patterns = targeting.patterns || [];
  if (patterns.length === 0) return true;

  const matchesAny = patterns.some((pattern) => matchUrlPattern(currentUrl, pattern));

  // Whitelist: show if matches, Blacklist: show if doesn't match
  return targeting.mode === 'whitelist' ? matchesAny : !matchesAny;
}

/**
 * Check if user matches targeting rules
 */
export function matchesUserTargeting(
  targeting: UserTargeting | undefined,
  context: MatchContext
): boolean {
  if (!targeting) return true;

  switch (targeting.type) {
    case 'all':
      return true;

    case 'new_users':
      const days = targeting.newUserDays || 7;
      return context.daysSinceFirstVisit <= days;

    case 'returning':
      return context.userVisitCount > 1;

    case 'not_completed':
      if (!targeting.notCompletedTour) return true;
      return !hasSeenTour(targeting.notCompletedTour, { type: 'once' });

    default:
      return true;
  }
}

/**
 * Check if device matches targeting rules
 */
export function matchesDeviceTargeting(
  devices: ('desktop' | 'tablet' | 'mobile')[] | undefined,
  currentDevice: 'desktop' | 'tablet' | 'mobile'
): boolean {
  if (!devices || devices.length === 0) return true;
  return devices.includes(currentDevice);
}

/**
 * Check if required element exists on page
 */
export function matchesElementTargeting(selector: string | undefined): boolean {
  if (!selector) return true;
  if (typeof document === 'undefined') return true;

  try {
    const element = document.querySelector(selector);
    return element !== null;
  } catch (error) {
    console.warn('[AgencyToolkit] Invalid element selector:', selector, error);
    return true; // Don't block on invalid selector
  }
}

/**
 * Main function: Check if a tour should show
 */
export function shouldShowTour(
  tourId: string,
  targeting: TourTargeting | undefined,
  frequency: TourFrequency | undefined,
  context: MatchContext
): boolean {
  // Check frequency first (has user already seen this?)
  if (hasSeenTour(tourId, frequency)) {
    return false;
  }

  // Check URL targeting
  if (!matchesUrlTargeting(targeting?.url_targeting, context.url)) {
    return false;
  }

  // Check user targeting
  if (!matchesUserTargeting(targeting?.user_targeting, context)) {
    return false;
  }

  // Check device targeting
  if (!matchesDeviceTargeting(targeting?.devices, context.device)) {
    return false;
  }

  // Check element targeting
  if (!matchesElementTargeting(targeting?.element_condition)) {
    return false;
  }

  return true;
}

/**
 * Get user context for targeting checks
 */
export function getUserContext(): MatchContext {
  const visitCountKey = 'at_visit_count';
  const firstVisitKey = 'at_first_visit';

  let visitCount = 1;
  let daysSinceFirstVisit = 0;

  if (typeof localStorage !== 'undefined') {
    // Get or set first visit timestamp
    let firstVisit = localStorage.getItem(firstVisitKey);
    if (!firstVisit) {
      firstVisit = Date.now().toString();
      localStorage.setItem(firstVisitKey, firstVisit);
    }
    daysSinceFirstVisit = (Date.now() - parseInt(firstVisit)) / (1000 * 60 * 60 * 24);

    // Increment visit count
    const storedCount = localStorage.getItem(visitCountKey);
    visitCount = storedCount ? parseInt(storedCount) + 1 : 1;
    localStorage.setItem(visitCountKey, visitCount.toString());
  }

  return {
    url: typeof window !== 'undefined' ? window.location.href : '',
    userVisitCount: visitCount,
    daysSinceFirstVisit,
    device: detectDevice(),
  };
}
