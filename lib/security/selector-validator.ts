/**
 * CSS Selector Validation Utilities
 *
 * CRITICAL SECURITY MODULE
 * This module validates CSS selectors before they're used to query DOM elements.
 * Invalid or malicious selectors could be used to:
 * - Target script/style elements
 * - Cause performance issues (complex selectors)
 * - Break the page (invalid syntax)
 *
 * All user-provided selectors MUST be validated before use.
 */

// Maximum selector length (prevents DoS via very long selectors)
const MAX_SELECTOR_LENGTH = 500;

// Maximum nesting depth (prevents overly complex selectors)
const MAX_NESTING_DEPTH = 10;

// Forbidden element selectors (security-sensitive elements)
const FORBIDDEN_ELEMENTS = [
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'applet',
  'frame',
  'frameset',
  'meta',
  'link',
  'base',
  'noscript',
  'template',
  'slot',
  'portal',
];

// Forbidden patterns in selectors
const FORBIDDEN_PATTERNS = [
  // JavaScript protocol
  /javascript\s*:/i,
  // Data protocol
  /data\s*:/i,
  // Expression (IE)
  /expression\s*\(/i,
  // Moz binding
  /-moz-binding/i,
  // Behavior (IE)
  /behavior\s*:/i,
  // VBScript
  /vbscript\s*:/i,
  // URL function with protocol
  /url\s*\(\s*["']?\s*(?:javascript|data|vbscript):/i,
];

export interface SelectorValidationResult {
  valid: boolean;
  error?: string;
  selector?: string;
}

/**
 * Validates a CSS selector for security and correctness
 *
 * @param selector - The CSS selector to validate
 * @returns Validation result with error message if invalid
 *
 * @example
 * validateSelector('script') // { valid: false, error: 'Forbidden element selector: script' }
 * validateSelector('#my-button') // { valid: true, selector: '#my-button' }
 */
export function validateSelector(selector: string): SelectorValidationResult {
  // Check for empty or non-string input
  if (!selector || typeof selector !== 'string') {
    return { valid: false, error: 'Selector must be a non-empty string' };
  }

  const trimmed = selector.trim();

  // Check length
  if (trimmed.length === 0) {
    return { valid: false, error: 'Selector cannot be empty' };
  }

  if (trimmed.length > MAX_SELECTOR_LENGTH) {
    return {
      valid: false,
      error: `Selector exceeds maximum length of ${MAX_SELECTOR_LENGTH} characters`,
    };
  }

  // Check for forbidden patterns (security)
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { valid: false, error: 'Selector contains forbidden pattern' };
    }
  }

  // Check for forbidden element selectors
  const lowerSelector = trimmed.toLowerCase();
  for (const element of FORBIDDEN_ELEMENTS) {
    // Check if selector starts with forbidden element
    if (
      lowerSelector === element ||
      lowerSelector.startsWith(`${element} `) ||
      lowerSelector.startsWith(`${element}.`) ||
      lowerSelector.startsWith(`${element}#`) ||
      lowerSelector.startsWith(`${element}[`) ||
      lowerSelector.startsWith(`${element}:`) ||
      lowerSelector.startsWith(`${element}>`) ||
      lowerSelector.startsWith(`${element}+`) ||
      lowerSelector.startsWith(`${element}~`)
    ) {
      return {
        valid: false,
        error: `Forbidden element selector: ${element}`,
      };
    }

    // Check if selector contains forbidden element (after combinator)
    const combinatorPatterns = [
      ` ${element} `,
      ` ${element}.`,
      ` ${element}#`,
      ` ${element}[`,
      ` ${element}:`,
      `>${element}`,
      `+${element}`,
      `~${element}`,
      ` ${element}`,
    ];

    for (const pattern of combinatorPatterns) {
      if (lowerSelector.includes(pattern)) {
        return {
          valid: false,
          error: `Forbidden element selector: ${element}`,
        };
      }
    }
  }

  // Check nesting depth (count combinators)
  const combinators = trimmed.match(/[\s>+~]/g) || [];
  if (combinators.length > MAX_NESTING_DEPTH) {
    return {
      valid: false,
      error: `Selector exceeds maximum nesting depth of ${MAX_NESTING_DEPTH}`,
    };
  }

  // Validate selector syntax by trying to use it
  try {
    // Use a minimal document to test the selector
    if (typeof document !== 'undefined') {
      document.querySelector(trimmed);
    } else {
      // Server-side validation: basic syntax check
      // Check for obviously invalid patterns
      if (
        trimmed.includes('[[') ||
        trimmed.includes(']]') ||
        trimmed.includes('::') ||
        trimmed.includes('...') ||
        /^\s*[>+~]/.test(trimmed) || // Starts with combinator
        /[>+~]\s*$/.test(trimmed) // Ends with combinator
      ) {
        return { valid: false, error: 'Invalid selector syntax' };
      }
    }
  } catch (e) {
    return {
      valid: false,
      error: `Invalid selector syntax: ${e instanceof Error ? e.message : 'Unknown error'}`,
    };
  }

  return { valid: true, selector: trimmed };
}

/**
 * Safely queries a single element using a validated selector
 * Returns null if selector is invalid or element not found
 *
 * @param selector - The CSS selector to use
 * @param root - The root element to search within (default: document)
 * @returns The found element or null
 *
 * @example
 * const el = safeQuerySelector('#my-button');
 * if (el) {
 *   // Safe to use element
 * }
 */
export function safeQuerySelector(
  selector: string,
  root: Document | Element = document
): Element | null {
  const validation = validateSelector(selector);

  if (!validation.valid || !validation.selector) {
    console.warn(
      `[Security] Invalid selector rejected: ${validation.error}`,
      selector
    );
    return null;
  }

  try {
    return root.querySelector(validation.selector);
  } catch (e) {
    console.warn(`[Security] Selector query failed:`, e);
    return null;
  }
}

/**
 * Safely queries all matching elements using a validated selector
 * Returns empty array if selector is invalid
 *
 * @param selector - The CSS selector to use
 * @param root - The root element to search within (default: document)
 * @returns Array of found elements (empty if invalid or none found)
 *
 * @example
 * const buttons = safeQuerySelectorAll('.action-button');
 * buttons.forEach(btn => {
 *   // Safe to use element
 * });
 */
export function safeQuerySelectorAll(
  selector: string,
  root: Document | Element = document
): Element[] {
  const validation = validateSelector(selector);

  if (!validation.valid || !validation.selector) {
    console.warn(
      `[Security] Invalid selector rejected: ${validation.error}`,
      selector
    );
    return [];
  }

  try {
    return Array.from(root.querySelectorAll(validation.selector));
  } catch (e) {
    console.warn(`[Security] Selector query failed:`, e);
    return [];
  }
}

/**
 * Generates a safe, unique selector for an element
 * Used by the element picker in builder mode
 *
 * @param element - The DOM element to generate a selector for
 * @returns A CSS selector string
 */
export function generateSafeSelector(element: Element): string {
  // Try ID first (most specific)
  if (element.id) {
    // Validate ID doesn't contain special characters
    if (/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(element.id)) {
      return `#${element.id}`;
    }
  }

  // Try unique class combination
  if (element.classList.length > 0) {
    const classes = Array.from(element.classList)
      .filter((cls) => /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(cls)) // Valid class names only
      .slice(0, 3) // Limit to first 3 classes
      .join('.');

    if (classes) {
      const selector = `${element.tagName.toLowerCase()}.${classes}`;
      try {
        if (document.querySelectorAll(selector).length === 1) {
          return selector;
        }
      } catch {
        // Invalid selector, continue to next strategy
      }
    }
  }

  // Try data attributes
  for (const attr of element.attributes) {
    if (attr.name.startsWith('data-') && attr.value) {
      // Sanitize attribute value
      const safeValue = attr.value.replace(/["\\]/g, '');
      if (safeValue && safeValue.length < 50) {
        const selector = `[${attr.name}="${safeValue}"]`;
        try {
          if (document.querySelectorAll(selector).length === 1) {
            return selector;
          }
        } catch {
          // Invalid selector, continue
        }
      }
    }
  }

  // Fall back to path-based selector
  return generatePathSelector(element);
}

/**
 * Generates a path-based selector (tag1 > tag2 > target)
 */
function generatePathSelector(element: Element): string {
  const path: string[] = [];
  let current: Element | null = element;
  let depth = 0;

  while (current && current !== document.body && depth < MAX_NESTING_DEPTH) {
    let selector = current.tagName.toLowerCase();

    // Skip forbidden elements
    if (FORBIDDEN_ELEMENTS.includes(selector)) {
      current = current.parentElement;
      continue;
    }

    // Add ID if available
    if (current.id && /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(current.id)) {
      path.unshift(`#${current.id}`);
      break;
    }

    // Add nth-of-type if needed for uniqueness
    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        (s) => s.tagName === current!.tagName
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }

    path.unshift(selector);
    current = parent;
    depth++;
  }

  return path.join(' > ');
}

// Export constants for testing
export const SELECTOR_LIMITS = {
  MAX_LENGTH: MAX_SELECTOR_LENGTH,
  MAX_DEPTH: MAX_NESTING_DEPTH,
  FORBIDDEN_ELEMENTS,
};
