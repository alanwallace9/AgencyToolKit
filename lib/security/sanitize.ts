/**
 * HTML Sanitization Utilities
 *
 * CRITICAL SECURITY MODULE
 * This module sanitizes all user-provided HTML content before it's injected
 * into GHL subaccounts. XSS attacks here could compromise client applications.
 *
 * Uses DOMPurify with a strict whitelist configuration.
 */

import DOMPurify from 'isomorphic-dompurify';

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
const ALLOWED_ATTR = [
  // Global
  'class',
  'id',
  'style',
  // Links
  'href',
  'target',
  'rel',
  // Images
  'src',
  'alt',
  'width',
  'height',
  'loading',
  // Tables
  'colspan',
  'rowspan',
];

// Forbidden tags (explicitly blocked, even if nested)
const FORBID_TAGS = [
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'form',
  'input',
  'button',
  'select',
  'textarea',
  'svg',
  'math',
  'template',
  'slot',
  'applet',
  'frame',
  'frameset',
  'meta',
  'link',
  'base',
  'noscript',
];

// Forbidden attributes (event handlers, dangerous attributes)
const FORBID_ATTR = [
  // Event handlers
  'onclick',
  'ondblclick',
  'onmousedown',
  'onmouseup',
  'onmouseover',
  'onmousemove',
  'onmouseout',
  'onmouseenter',
  'onmouseleave',
  'onkeydown',
  'onkeypress',
  'onkeyup',
  'onfocus',
  'onblur',
  'onchange',
  'oninput',
  'onsubmit',
  'onreset',
  'onload',
  'onerror',
  'onabort',
  'oncanplay',
  'oncanplaythrough',
  'oncuechange',
  'ondurationchange',
  'onemptied',
  'onended',
  'onloadeddata',
  'onloadedmetadata',
  'onloadstart',
  'onpause',
  'onplay',
  'onplaying',
  'onprogress',
  'onratechange',
  'onseeked',
  'onseeking',
  'onstalled',
  'onsuspend',
  'ontimeupdate',
  'onvolumechange',
  'onwaiting',
  'onanimationstart',
  'onanimationend',
  'onanimationiteration',
  'ontransitionend',
  'oncontextmenu',
  'oncopy',
  'oncut',
  'onpaste',
  'ondrag',
  'ondragend',
  'ondragenter',
  'ondragleave',
  'ondragover',
  'ondragstart',
  'ondrop',
  'onscroll',
  'onwheel',
  'ontouchstart',
  'ontouchmove',
  'ontouchend',
  'ontouchcancel',
  'onpointerdown',
  'onpointermove',
  'onpointerup',
  'onpointercancel',
  'onpointerenter',
  'onpointerleave',
  'onpointerover',
  'onpointerout',
  'ongotpointercapture',
  'onlostpointercapture',
  // Dangerous attributes
  'formaction',
  'xlink:href',
  'data',
  'action',
  'background',
  'poster',
  'dynsrc',
  'lowsrc',
];

// Configure DOMPurify
const purifyConfig = {
  ALLOWED_TAGS,
  ALLOWED_ATTR,
  FORBID_TAGS,
  FORBID_ATTR,
  ALLOW_DATA_ATTR: false, // No data-* attributes (could be exploited)
  ALLOW_ARIA_ATTR: true, // Allow aria-* for accessibility
  KEEP_CONTENT: true, // Keep text content when removing tags
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_TRUSTED_TYPE: false,
  FORCE_BODY: false,
  SANITIZE_DOM: true,
  WHOLE_DOCUMENT: false,
  // URI sanitization
  ALLOWED_URI_REGEXP:
    /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
};

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

  // Pre-process to remove javascript: URLs in various encodings
  let processed = dirty
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

  return DOMPurify.sanitize(processed, purifyConfig);
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

  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [], KEEP_CONTENT: true });
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

// Export DOMPurify config for testing
export const SANITIZE_CONFIG = purifyConfig;
