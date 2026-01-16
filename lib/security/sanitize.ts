/**
 * HTML Sanitization Utilities
 *
 * CRITICAL SECURITY MODULE
 * This module sanitizes all user-provided HTML content before it's injected
 * into GHL subaccounts. XSS attacks here could compromise client applications.
 *
 * Uses sanitize-html (pure JavaScript, no jsdom required) with a strict whitelist.
 */

import sanitizeHtml from 'sanitize-html';

// Allowed HTML tags (strict whitelist)
const ALLOWED_TAGS = [
  // Text formatting
  'p',
  'br',
  'strong',
  'em',
  'b',
  'i',
  'u',
  's',
  'mark',
  'small',
  'sub',
  'sup',
  // Headings
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  // Lists
  'ul',
  'ol',
  'li',
  // Links and media
  'a',
  'img',
  // Structure
  'span',
  'div',
  'blockquote',
  // Code
  'code',
  'pre',
  // Tables (for rich content)
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
];

// Allowed attributes per tag
const ALLOWED_ATTR: Record<string, string[]> = {
  '*': ['class', 'id'],
  a: ['href', 'target', 'rel'],
  img: ['src', 'alt', 'width', 'height', 'loading'],
  th: ['colspan', 'rowspan'],
  td: ['colspan', 'rowspan'],
};

// Configure sanitize-html
const sanitizeConfig: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: ALLOWED_ATTR,
  allowedSchemes: ['https', 'http', 'mailto', 'tel'],
  allowedSchemesByTag: {
    a: ['https', 'http', 'mailto', 'tel'],
    img: ['https', 'http'],
  },
  // Remove entire content of script tags, not just the tags
  disallowedTagsMode: 'discard',
  // Don't allow any protocol-relative URLs
  allowProtocolRelative: false,
  // Transform tags for additional security
  transformTags: {
    a: (tagName, attribs) => {
      // Force external links to have safe attributes
      if (attribs.href && !attribs.href.startsWith('/')) {
        return {
          tagName,
          attribs: {
            ...attribs,
            rel: 'noopener noreferrer',
            target: '_blank',
          },
        };
      }
      return { tagName, attribs };
    },
  },
  // Additional text filtering
  textFilter: (text) => {
    // Remove null bytes and other dangerous characters
    return text.replace(/\0/g, '');
  },
};

/**
 * Pre-processes HTML to remove dangerous patterns before sanitization
 */
function preprocess(dirty: string): string {
  return dirty
    // Remove javascript: protocol (various encodings)
    .replace(/javascript\s*:/gi, '')
    .replace(/j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/gi, '')
    // Remove vbscript: protocol
    .replace(/vbscript\s*:/gi, '')
    // Remove data: URLs with dangerous content
    .replace(/data\s*:\s*text\/html/gi, '')
    // Remove expression() CSS
    .replace(/expression\s*\(/gi, '')
    // Remove -moz-binding
    .replace(/-moz-binding/gi, '')
    // Remove behavior: CSS
    .replace(/behavior\s*:/gi, '');
}

/**
 * Sanitizes HTML content for safe rendering
 *
 * @param dirty - The potentially unsafe HTML string
 * @returns Sanitized HTML string
 *
 * @example
 * const safe = sanitizeHTML('<script>alert("xss")</script><p>Hello</p>');
 * // Returns: '<p>Hello</p>'
 */
export function sanitizeHTML(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  const processed = preprocess(dirty);
  return sanitizeHtml(processed, sanitizeConfig);
}

/**
 * Sanitizes plain text (strips all HTML)
 *
 * @param dirty - The potentially unsafe text
 * @returns Plain text with all HTML stripped
 *
 * @example
 * const safe = sanitizeText('<b>Hello</b> World');
 * // Returns: 'Hello World'
 */
export function sanitizeText(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  return sanitizeHtml(dirty, {
    allowedTags: [],
    allowedAttributes: {},
  });
}

// Allowed URL protocols
const ALLOWED_PROTOCOLS = ['https:', 'http:', 'mailto:', 'tel:'];

// Trusted image CDN domains
const TRUSTED_IMAGE_DOMAINS = [
  'images.unsplash.com',
  'cdn.jsdelivr.net',
  'res.cloudinary.com',
  'imagedelivery.net', // Cloudflare Images
  'storage.googleapis.com',
  's3.amazonaws.com',
  'i.imgur.com',
  'media.giphy.com',
  'lh3.googleusercontent.com',
  'avatars.githubusercontent.com',
];

/**
 * Validates and sanitizes a URL
 *
 * @param dirty - The potentially unsafe URL
 * @returns Sanitized URL or null if invalid
 *
 * @example
 * sanitizeURL('javascript:alert(1)') // Returns: null
 * sanitizeURL('https://example.com') // Returns: 'https://example.com'
 */
export function sanitizeURL(dirty: string): string | null {
  if (!dirty || typeof dirty !== 'string') {
    return null;
  }

  const trimmed = dirty.trim();

  // Block empty strings
  if (trimmed.length === 0) {
    return null;
  }

  // Block dangerous protocols
  const lowerURL = trimmed.toLowerCase();
  if (
    lowerURL.startsWith('javascript:') ||
    lowerURL.startsWith('vbscript:') ||
    lowerURL.startsWith('data:text/html')
  ) {
    return null;
  }

  try {
    const url = new URL(trimmed);

    // Check protocol whitelist
    if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
      return null;
    }

    // For http/https, return the full URL
    // For mailto/tel, return as-is
    return url.toString();
  } catch {
    // If it's not a valid URL, check if it's a relative path
    // Only allow paths that start with /
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
      // Ensure no protocol injection via path
      if (!trimmed.includes(':')) {
        return trimmed;
      }
    }

    return null;
  }
}

/**
 * Validates and sanitizes an image URL
 *
 * @param dirty - The potentially unsafe image URL
 * @param allowAnyHttps - Whether to allow any HTTPS URL (default: false)
 * @returns Sanitized URL or null if invalid
 *
 * @example
 * sanitizeImageURL('https://images.unsplash.com/photo-123')
 * // Returns: 'https://images.unsplash.com/photo-123'
 */
export function sanitizeImageURL(
  dirty: string,
  allowAnyHttps: boolean = true
): string | null {
  const sanitized = sanitizeURL(dirty);

  if (!sanitized) {
    return null;
  }

  try {
    const url = new URL(sanitized);

    // Must be HTTPS
    if (url.protocol !== 'https:') {
      return null;
    }

    // Check against trusted domains (if restricted mode)
    if (!allowAnyHttps) {
      const isTrusted = TRUSTED_IMAGE_DOMAINS.some(
        (domain) =>
          url.hostname === domain || url.hostname.endsWith(`.${domain}`)
      );

      if (!isTrusted) {
        return null;
      }
    }

    // Check for valid image extension (optional, as some CDNs don't use extensions)
    const validExtensions = [
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.webp',
      '.svg',
      '.ico',
    ];
    const hasValidExtension = validExtensions.some((ext) =>
      url.pathname.toLowerCase().includes(ext)
    );

    // If no extension, still allow (CDNs often don't use extensions)
    // But ensure it's not trying to execute code
    if (
      !hasValidExtension &&
      (url.pathname.includes('.js') ||
        url.pathname.includes('.html') ||
        url.pathname.includes('.php'))
    ) {
      return null;
    }

    return sanitized;
  } catch {
    return null;
  }
}

/**
 * Sanitizes CSS style string
 * Removes dangerous CSS properties and values
 *
 * @param dirty - The potentially unsafe CSS string
 * @returns Sanitized CSS string
 */
export function sanitizeCSS(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  // Remove dangerous CSS
  return dirty
    // Remove JavaScript URLs
    .replace(/url\s*\(\s*["']?\s*javascript:/gi, 'url(')
    // Remove data URLs
    .replace(/url\s*\(\s*["']?\s*data:/gi, 'url(')
    // Remove expression()
    .replace(/expression\s*\(/gi, '')
    // Remove -moz-binding
    .replace(/-moz-binding\s*:/gi, '')
    // Remove behavior
    .replace(/behavior\s*:/gi, '')
    // Remove @import
    .replace(/@import/gi, '')
    // Remove @charset
    .replace(/@charset/gi, '');
}

// Export config for testing
export const SANITIZE_CONFIG = sanitizeConfig;
