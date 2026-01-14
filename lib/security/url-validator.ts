/**
 * URL Validation and Pattern Matching Utilities
 *
 * CRITICAL SECURITY MODULE
 * This module validates URLs and matches them against patterns for tour targeting.
 * Prevents open redirect vulnerabilities and ensures URLs are safe to use.
 */

import type { UrlPattern, UrlPatternType } from '@/types/database';

// GHL domains whitelist (default allowed)
const GHL_DOMAINS = [
  'gohighlevel.com',
  'msgsndr.com',
  'highlevel.com',
  'leadconnectorhq.com',
];

// Maximum pattern length
const MAX_PATTERN_LENGTH = 500;

// Maximum regex complexity (approximate)
const MAX_REGEX_LENGTH = 200;

/**
 * Validates if a URL is from a known GHL domain
 *
 * @param url - The URL to check
 * @returns True if URL is from a GHL domain
 */
export function isGhlDomain(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    return GHL_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * Validates a URL format and checks for dangerous patterns
 *
 * @param url - The URL to validate
 * @returns True if URL is valid and safe
 */
export function validateUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  const trimmed = url.trim();

  // Check for dangerous protocols
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('data:text/html')
  ) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);

    // Only allow http/https
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    return true;
  } catch {
    // Allow relative URLs that start with /
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
      return !trimmed.includes(':'); // No protocol in path
    }

    return false;
  }
}

// Pattern cache for performance
const patternCache = new Map<string, RegExp>();

/**
 * Clears the pattern cache
 * Useful for testing or memory management
 */
export function clearPatternCache(): void {
  patternCache.clear();
}

/**
 * Compiles a URL pattern into a RegExp
 *
 * @param pattern - The URL pattern to compile
 * @returns Compiled RegExp or null if invalid
 */
export function compilePattern(pattern: UrlPattern): RegExp | null {
  const cacheKey = `${pattern.type}:${pattern.value}`;

  if (patternCache.has(cacheKey)) {
    return patternCache.get(cacheKey) || null;
  }

  try {
    let regex: RegExp;

    switch (pattern.type) {
      case 'exact':
        // Escape special regex characters and match exactly
        regex = new RegExp(`^${escapeRegex(pattern.value)}$`, 'i');
        break;

      case 'contains':
        regex = new RegExp(escapeRegex(pattern.value), 'i');
        break;

      case 'starts_with':
        regex = new RegExp(`^${escapeRegex(pattern.value)}`, 'i');
        break;

      case 'ends_with':
        regex = new RegExp(`${escapeRegex(pattern.value)}$`, 'i');
        break;

      case 'wildcard':
        regex = compileWildcard(pattern.value);
        break;

      case 'regex':
        // Validate regex length
        if (pattern.value.length > MAX_REGEX_LENGTH) {
          console.warn(`[Security] Regex pattern too long: ${pattern.value.length}`);
          return null;
        }
        // Test if regex is valid and not catastrophic
        regex = new RegExp(pattern.value, 'i');
        // Quick test to ensure it doesn't hang
        testRegexPerformance(regex);
        break;

      default:
        return null;
    }

    patternCache.set(cacheKey, regex);
    return regex;
  } catch (e) {
    console.warn(`[Security] Failed to compile pattern:`, pattern, e);
    return null;
  }
}

/**
 * Escapes special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Compiles a wildcard pattern into a RegExp
 * * = any characters except /
 * ** = any characters including /
 */
function compileWildcard(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special chars
    .replace(/\*\*/g, '{{DOUBLESTAR}}') // Temp placeholder
    .replace(/\*/g, '[^/]*') // Single * = not slashes
    .replace(/{{DOUBLESTAR}}/g, '.*'); // ** = anything

  return new RegExp(`^${escaped}$`, 'i');
}

/**
 * Tests regex performance to prevent ReDoS attacks
 */
function testRegexPerformance(regex: RegExp): void {
  const testString = 'a'.repeat(50);
  const start = Date.now();
  regex.test(testString);
  const elapsed = Date.now() - start;

  if (elapsed > 100) {
    throw new Error('Regex execution took too long (potential ReDoS)');
  }
}

/**
 * Matches a URL against a single pattern
 *
 * @param url - The URL to match
 * @param pattern - The pattern to match against
 * @returns True if URL matches the pattern
 */
export function matchUrlPattern(url: string, pattern: UrlPattern): boolean {
  if (!url || !pattern || !pattern.value) {
    return false;
  }

  // Validate pattern length
  if (pattern.value.length > MAX_PATTERN_LENGTH) {
    console.warn(`[Security] Pattern too long: ${pattern.value.length}`);
    return false;
  }

  const regex = compilePattern(pattern);

  if (!regex) {
    return false;
  }

  try {
    return regex.test(url);
  } catch (e) {
    console.warn(`[Security] Pattern match failed:`, e);
    return false;
  }
}

/**
 * Matches a URL against multiple patterns
 *
 * @param url - The URL to match
 * @param patterns - Array of patterns to match against
 * @param mode - 'whitelist' (any match = true) or 'blacklist' (any match = false)
 * @returns True if URL passes the filter
 */
export function matchUrlPatterns(
  url: string,
  patterns: UrlPattern[],
  mode: 'whitelist' | 'blacklist' = 'whitelist'
): boolean {
  if (!patterns || patterns.length === 0) {
    // No patterns = allow all in whitelist mode, block all in blacklist mode
    return mode === 'whitelist' ? true : true; // Actually, empty blacklist means allow
  }

  const anyMatch = patterns.some((pattern) => matchUrlPattern(url, pattern));

  return mode === 'whitelist' ? anyMatch : !anyMatch;
}

/**
 * Checks if a URL is allowed based on targeting rules
 *
 * @param url - The URL to check
 * @param targeting - The URL targeting configuration
 * @returns True if URL is allowed
 */
export function isUrlAllowed(
  url: string,
  targeting: { mode: 'all' | 'whitelist' | 'blacklist'; patterns: UrlPattern[] }
): boolean {
  // 'all' mode = allow everything
  if (targeting.mode === 'all') {
    return true;
  }

  // Empty patterns with whitelist = allow none
  // Empty patterns with blacklist = allow all
  if (!targeting.patterns || targeting.patterns.length === 0) {
    return targeting.mode === 'blacklist';
  }

  return matchUrlPatterns(
    url,
    targeting.patterns,
    targeting.mode as 'whitelist' | 'blacklist'
  );
}

/**
 * Validates a URL pattern configuration
 *
 * @param pattern - The pattern to validate
 * @returns Object with valid flag and error message
 */
export function validateUrlPattern(pattern: UrlPattern): {
  valid: boolean;
  error?: string;
} {
  if (!pattern) {
    return { valid: false, error: 'Pattern is required' };
  }

  if (!pattern.type) {
    return { valid: false, error: 'Pattern type is required' };
  }

  if (!pattern.value || typeof pattern.value !== 'string') {
    return { valid: false, error: 'Pattern value is required' };
  }

  const validTypes: UrlPatternType[] = [
    'exact',
    'contains',
    'starts_with',
    'ends_with',
    'wildcard',
    'regex',
  ];

  if (!validTypes.includes(pattern.type)) {
    return { valid: false, error: `Invalid pattern type: ${pattern.type}` };
  }

  if (pattern.value.length > MAX_PATTERN_LENGTH) {
    return {
      valid: false,
      error: `Pattern exceeds maximum length of ${MAX_PATTERN_LENGTH}`,
    };
  }

  // For regex type, validate the regex
  if (pattern.type === 'regex') {
    try {
      new RegExp(pattern.value);
    } catch (e) {
      return {
        valid: false,
        error: `Invalid regex: ${e instanceof Error ? e.message : 'Unknown error'}`,
      };
    }
  }

  // Try to compile the pattern
  const compiled = compilePattern(pattern);
  if (!compiled) {
    return { valid: false, error: 'Failed to compile pattern' };
  }

  return { valid: true };
}

/**
 * Creates a default GHL whitelist pattern
 *
 * @param locationId - Optional GHL location ID to scope the pattern
 * @returns Array of UrlPattern objects
 */
export function createGhlWhitelist(locationId?: string): UrlPattern[] {
  const patterns: UrlPattern[] = [
    {
      id: 'ghl-main',
      type: 'wildcard',
      value: 'https://*.gohighlevel.com/**',
      description: 'GoHighLevel main domain',
    },
    {
      id: 'ghl-msgsndr',
      type: 'wildcard',
      value: 'https://*.msgsndr.com/**',
      description: 'GoHighLevel msgsndr domain',
    },
    {
      id: 'ghl-highlevel',
      type: 'wildcard',
      value: 'https://*.highlevel.com/**',
      description: 'GoHighLevel highlevel domain',
    },
  ];

  // If location ID provided, add more specific pattern
  if (locationId) {
    patterns.unshift({
      id: 'ghl-location',
      type: 'contains',
      value: `/location/${locationId}`,
      description: 'Specific GHL location',
    });
  }

  return patterns;
}

// Export constants for testing
export const URL_VALIDATOR_LIMITS = {
  MAX_PATTERN_LENGTH,
  MAX_REGEX_LENGTH,
  GHL_DOMAINS,
};
