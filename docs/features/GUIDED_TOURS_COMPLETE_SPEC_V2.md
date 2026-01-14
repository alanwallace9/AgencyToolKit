# Agency Toolkit - Guided Tours Feature
## Complete Product Specification V2

**Version:** 2.0  
**Last Updated:** January 13, 2026  
**Status:** Ready for Implementation  
**Tier:** Pro ($79-99/month)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [GHL-Specific Architecture](#ghl-specific-architecture)
3. [Complete Feature List (Mapped from Usetiful)](#complete-feature-list)
4. [URL Whitelisting System](#url-whitelisting-system)
5. [Interface Layout & Design](#interface-layout--design)
6. [Data Models](#data-models)
7. [API Endpoints](#api-endpoints)
8. [Security Implementation](#security-implementation)
9. [Claude Code Implementation Prompt](#claude-code-implementation-prompt)
10. [Claude.md Security Additions](#claudemd-security-additions)

---

## Executive Summary

### What We're Building

A complete Digital Adoption Platform (DAP) for GoHighLevel agencies, allowing them to create guided tours, tooltips, checklists, and announcements for their subaccount clients—all without requiring a Chrome extension.

### Key Differentiator

Unlike Usetiful which requires a Chrome extension for element selection, we leverage our **already-injected Agency Toolkit script** in GHL subaccounts to enable point-and-click element selection directly from the browser.

### Pricing Position

| Competitor | Price | Our Position |
|------------|-------|--------------|
| Usetiful Plus | €49/mo | Comparable features |
| Usetiful Premium | €69/mo | Our target |
| UserGuiding | $174/mo | 2-3x more expensive |
| Userpilot | $299/mo | 4x more expensive |
| **Agency Toolkit Pro** | **$79-99/mo** | Best value for GHL |

---

## GHL-Specific Architecture

### How Element Selection Works (No Chrome Extension Required)

Since Agency Toolkit already injects JavaScript into GHL subaccounts (for menu hiding, branding, etc.), we can activate a "builder mode" for element selection.

#### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AGENCY TOOLKIT DASHBOARD                          │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Tour Builder                                                │    │
│  │  ┌─────────────┐  ┌──────────────────────────────────────┐  │    │
│  │  │ Steps List  │  │  Step Editor                         │  │    │
│  │  │             │  │  ┌────────────────────────────────┐  │  │    │
│  │  │ 1. Welcome  │  │  │ Element Selector               │  │  │    │
│  │  │ 2. Feature  │  │  │ [________________________] [🎯] │  │  │    │
│  │  │ 3. CTA      │  │  │                                │  │  │    │
│  │  │             │  │  │ Click 🎯 to select element     │  │  │    │
│  │  │ [+ Add]     │  │  └────────────────────────────────┘  │  │    │
│  │  └─────────────┘  └──────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ User clicks 🎯
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     NEW TAB OPENS                                    │
│  URL: https://app.gohighlevel.com/...?at_builder_mode=true          │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  GHL Subaccount (with Agency Toolkit script injected)        │    │
│  │                                                               │    │
│  │  ┌─────────────────────────────────────────────────────────┐ │    │
│  │  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │    │
│  │  │ ░░░  SELECTION MODE ACTIVE - Click any element  ░░░░░░░ │ │    │
│  │  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │    │
│  │  └─────────────────────────────────────────────────────────┘ │    │
│  │                                                               │    │
│  │     ┌──────────────┐      ┌──────────────┐                   │    │
│  │     │   Dashboard  │      │  [HOVERED]   │ ← Blue outline    │    │
│  │     │    Button    │      │   Contacts   │   on hover        │    │
│  │     └──────────────┘      └──────────────┘                   │    │
│  │                                                               │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ User clicks element
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Selection captured:                                                 │
│  - CSS Selector: "nav > ul > li:nth-child(3) > a"                   │
│  - Element text: "Contacts"                                          │
│  - Tag: <a>                                                          │
│  - Attributes: href="/contacts", class="nav-link"                   │
│                                                                      │
│  Data sent back to dashboard via:                                    │
│  1. localStorage (same-origin)                                       │
│  2. BroadcastChannel API                                             │
│  3. postMessage (if needed)                                          │
└─────────────────────────────────────────────────────────────────────┘
```

#### Technical Implementation

**1. Builder Mode Activation (in Agency Toolkit injected script)**

```javascript
// This code runs in the GHL subaccount via Agency Toolkit's existing injection
(function() {
  // Check if builder mode is active
  const urlParams = new URLSearchParams(window.location.search);
  const builderMode = urlParams.get('at_builder_mode');
  const sessionId = urlParams.get('at_session');
  
  if (builderMode === 'true' && sessionId) {
    activateElementSelector(sessionId);
  }
})();

function activateElementSelector(sessionId) {
  // Create overlay banner
  const banner = document.createElement('div');
  banner.id = 'at-selector-banner';
  banner.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6);
      color: white;
      padding: 12px 20px;
      z-index: 999999;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: system-ui, -apple-system, sans-serif;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    ">
      <div>
        <strong>🎯 Element Selection Mode</strong>
        <span style="margin-left: 12px; opacity: 0.9;">Click any element to select it for your tour step</span>
      </div>
      <div>
        <button id="at-cancel-selection" style="
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 6px 16px;
          border-radius: 6px;
          cursor: pointer;
          margin-right: 8px;
        ">Cancel</button>
        <button id="at-manual-entry" style="
          background: white;
          border: none;
          color: #3b82f6;
          padding: 6px 16px;
          border-radius: 6px;
          cursor: pointer;
        ">Enter Manually</button>
      </div>
    </div>
  `;
  document.body.appendChild(banner);
  document.body.style.paddingTop = '52px';

  // Highlight element on hover
  let currentHighlight = null;
  
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('#at-selector-banner')) return;
    
    if (currentHighlight) {
      currentHighlight.style.outline = '';
      currentHighlight.style.outlineOffset = '';
    }
    
    e.target.style.outline = '2px solid #3b82f6';
    e.target.style.outlineOffset = '2px';
    currentHighlight = e.target;
  });

  // Capture click
  document.addEventListener('click', (e) => {
    if (e.target.closest('#at-selector-banner')) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const element = e.target;
    const selector = generateSelector(element);
    const elementData = {
      selector: selector,
      tagName: element.tagName.toLowerCase(),
      text: element.textContent?.slice(0, 100),
      attributes: getElementAttributes(element),
      rect: element.getBoundingClientRect(),
      timestamp: Date.now(),
      sessionId: sessionId
    };
    
    // Send back to dashboard
    localStorage.setItem('at_selected_element', JSON.stringify(elementData));
    
    // Also use BroadcastChannel for cross-tab communication
    const channel = new BroadcastChannel('at_element_selection');
    channel.postMessage(elementData);
    
    // Show confirmation
    showSelectionConfirmation(element, selector);
  }, true);
  
  // Cancel button
  document.getElementById('at-cancel-selection').addEventListener('click', () => {
    localStorage.setItem('at_selected_element', JSON.stringify({ cancelled: true, sessionId }));
    window.close();
  });
}

function generateSelector(element) {
  // Try ID first
  if (element.id) {
    return `#${element.id}`;
  }
  
  // Try unique class combination
  if (element.classList.length > 0) {
    const classes = Array.from(element.classList).join('.');
    const selector = `${element.tagName.toLowerCase()}.${classes}`;
    if (document.querySelectorAll(selector).length === 1) {
      return selector;
    }
  }
  
  // Try data attributes
  for (const attr of element.attributes) {
    if (attr.name.startsWith('data-')) {
      const selector = `[${attr.name}="${attr.value}"]`;
      if (document.querySelectorAll(selector).length === 1) {
        return selector;
      }
    }
  }
  
  // Fall back to path-based selector
  return generatePathSelector(element);
}

function generatePathSelector(element) {
  const path = [];
  let current = element;
  
  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();
    
    if (current.id) {
      selector = `#${current.id}`;
      path.unshift(selector);
      break;
    }
    
    const siblings = current.parentElement?.children || [];
    const sameTagSiblings = Array.from(siblings).filter(
      s => s.tagName === current.tagName
    );
    
    if (sameTagSiblings.length > 1) {
      const index = sameTagSiblings.indexOf(current) + 1;
      selector += `:nth-of-type(${index})`;
    }
    
    path.unshift(selector);
    current = current.parentElement;
  }
  
  return path.join(' > ');
}

function getElementAttributes(element) {
  const attrs = {};
  for (const attr of element.attributes) {
    if (!attr.name.startsWith('on')) { // Skip event handlers
      attrs[attr.name] = attr.value;
    }
  }
  return attrs;
}

function showSelectionConfirmation(element, selector) {
  const popup = document.createElement('div');
  popup.innerHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      z-index: 9999999;
      max-width: 500px;
      font-family: system-ui;
    ">
      <h3 style="margin: 0 0 16px; color: #1f2937;">✅ Element Selected</h3>
      <p style="color: #6b7280; margin: 0 0 12px;">Selector captured:</p>
      <code style="
        display: block;
        background: #f3f4f6;
        padding: 12px;
        border-radius: 6px;
        font-size: 13px;
        word-break: break-all;
        margin-bottom: 16px;
      ">${selector}</code>
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 16px;">
        This tab will close automatically. Return to the tour builder to continue.
      </p>
      <button onclick="window.close()" style="
        background: #3b82f6;
        color: white;
        border: none;
        padding: 10px 24px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
      ">Close & Return</button>
    </div>
  `;
  document.body.appendChild(popup);
  
  // Auto-close after 3 seconds
  setTimeout(() => window.close(), 3000);
}
```

**2. Dashboard Side (Listening for Selection)**

```typescript
// In the tour builder component
import { useEffect, useState } from 'react';

function useElementSelector() {
  const [selectedElement, setSelectedElement] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());

  const openSelector = (subaccountUrl: string) => {
    setIsSelecting(true);
    
    // Clear any previous selection
    localStorage.removeItem('at_selected_element');
    
    // Open GHL subaccount with builder mode
    const url = new URL(subaccountUrl);
    url.searchParams.set('at_builder_mode', 'true');
    url.searchParams.set('at_session', sessionId);
    
    window.open(url.toString(), '_blank');
  };

  useEffect(() => {
    if (!isSelecting) return;

    // Listen for BroadcastChannel messages
    const channel = new BroadcastChannel('at_element_selection');
    channel.onmessage = (event) => {
      if (event.data.sessionId === sessionId) {
        if (event.data.cancelled) {
          setIsSelecting(false);
        } else {
          setSelectedElement(event.data);
          setIsSelecting(false);
        }
      }
    };

    // Also poll localStorage as fallback
    const pollInterval = setInterval(() => {
      const data = localStorage.getItem('at_selected_element');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.sessionId === sessionId) {
          localStorage.removeItem('at_selected_element');
          if (parsed.cancelled) {
            setIsSelecting(false);
          } else {
            setSelectedElement(parsed);
            setIsSelecting(false);
          }
        }
      }
    }, 500);

    return () => {
      channel.close();
      clearInterval(pollInterval);
    };
  }, [isSelecting, sessionId]);

  return { selectedElement, isSelecting, openSelector };
}
```

---

## Complete Feature List

### Mapped from Usetiful + Our Enhancements

| Usetiful Feature | Our V1 | Our V2 | Notes |
|------------------|--------|--------|-------|
| **Product Tours** | ✅ | ✅ | Core feature |
| Modal dialogs | ✅ | ✅ | Full-page overlay |
| Pointers/Tooltips | ✅ | ✅ | Element-attached tips |
| Slideouts | ✅ | ✅ | Corner panels |
| **Smart Tips** | ✅ | ✅ | Hover tooltips |
| **Onboarding Checklists** | ✅ | ✅ | Progress tracking |
| **Banners** | ✅ | ✅ | Top/bottom announcements |
| **Hotspots/Beacons** | ✅ | ✅ | Pulsing indicators |
| **Resource Center Widget** | ✅ | ✅ | Help launcher |
| **Knowledge Base** | ❌ | ✅ | V2 feature |
| **Surveys & NPS** | ❌ | ✅ | V2 feature |
| **Interactive Demos** | ❌ | ✅ | V2 feature |
| **Usage Analytics** | ✅ Basic | ✅ Advanced | Views, completions, funnels |
| **URL/Page Targeting** | ✅ | ✅ | Core feature |
| **Element Targeting** | ✅ | ✅ | Via builder mode |
| **Triggers & Delays** | ✅ | ✅ | Multiple types |
| **White-labeling** | ✅ | ✅ | Full theme control |
| **Localization** | ❌ | ✅ | V2 feature |
| **A/B Testing** | ❌ | ✅ | V2 feature |
| **Chrome Extension** | ❌ NOT NEEDED | - | GHL-specific approach |
| **URL Whitelisting** | ✅ | ✅ | Security feature |

---

## URL Whitelisting System

### Overview

URL Whitelisting is a critical security and management feature that allows agencies to control exactly which pages/URLs can display tours.

### Why It's Important

1. **Security**: Prevents tours from running on unintended pages
2. **Performance**: Only loads tour engine on relevant pages
3. **Control**: Agencies can restrict tours to specific subaccount areas
4. **Multi-tenant**: Different tour sets for different subaccounts

### Configuration Levels

```
┌─────────────────────────────────────────────────────────────────┐
│                    WHITELIST HIERARCHY                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Agency Level (Global)                                          │
│  └── Applies to ALL tours unless overridden                     │
│      Example: *.gohighlevel.com, *.msgsndr.com                  │
│                                                                 │
│  Subaccount Level                                               │
│  └── Applies to specific subaccount's tours                     │
│      Example: agency123.gohighlevel.com/*                       │
│                                                                 │
│  Tour Level                                                     │
│  └── Specific URLs where THIS tour can appear                   │
│      Example: agency123.gohighlevel.com/contacts/*              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Data Model

```typescript
interface UrlWhitelist {
  id: string;
  agency_id: string;
  subaccount_id?: string;  // null = agency-wide
  tour_id?: string;        // null = applies to all tours
  
  // URL patterns
  patterns: UrlPattern[];
  
  // Settings
  mode: 'whitelist' | 'blacklist';  // Allow only these OR block these
  enabled: boolean;
  
  created_at: Date;
  updated_at: Date;
}

interface UrlPattern {
  type: 'exact' | 'contains' | 'starts_with' | 'ends_with' | 'regex' | 'wildcard';
  value: string;
  description?: string;
}

// Examples
const patterns: UrlPattern[] = [
  // Exact match
  { type: 'exact', value: 'https://app.gohighlevel.com/contacts' },
  
  // Contains
  { type: 'contains', value: '/contacts/' },
  
  // Starts with (most common)
  { type: 'starts_with', value: 'https://app.gohighlevel.com/' },
  
  // Wildcard (user-friendly)
  { type: 'wildcard', value: 'https://*.gohighlevel.com/*/contacts/*' },
  
  // Regex (advanced)
  { type: 'regex', value: '^https://[a-z]+\\.gohighlevel\\.com/.*$' }
];
```

### URL Matching Logic

```typescript
function isUrlAllowed(
  url: string,
  tourId: string,
  subaccountId: string,
  agencyId: string
): boolean {
  // 1. Check tour-level whitelist first (most specific)
  const tourWhitelist = getWhitelist({ tour_id: tourId });
  if (tourWhitelist?.enabled) {
    return matchesPatterns(url, tourWhitelist.patterns, tourWhitelist.mode);
  }
  
  // 2. Check subaccount-level whitelist
  const subaccountWhitelist = getWhitelist({ 
    subaccount_id: subaccountId, 
    tour_id: null 
  });
  if (subaccountWhitelist?.enabled) {
    return matchesPatterns(url, subaccountWhitelist.patterns, subaccountWhitelist.mode);
  }
  
  // 3. Check agency-level whitelist (least specific)
  const agencyWhitelist = getWhitelist({ 
    agency_id: agencyId, 
    subaccount_id: null, 
    tour_id: null 
  });
  if (agencyWhitelist?.enabled) {
    return matchesPatterns(url, agencyWhitelist.patterns, agencyWhitelist.mode);
  }
  
  // 4. Default: allow all GHL domains
  return isGhlDomain(url);
}

function matchesPatterns(
  url: string, 
  patterns: UrlPattern[], 
  mode: 'whitelist' | 'blacklist'
): boolean {
  const matches = patterns.some(pattern => matchPattern(url, pattern));
  return mode === 'whitelist' ? matches : !matches;
}

function matchPattern(url: string, pattern: UrlPattern): boolean {
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
      return matchWildcard(url, pattern.value);
    
    case 'regex':
      return new RegExp(pattern.value).test(url);
    
    default:
      return false;
  }
}

function matchWildcard(url: string, pattern: string): boolean {
  // Convert wildcard to regex
  // * = any characters except /
  // ** = any characters including /
  const regexPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')  // Escape special chars
    .replace(/\*\*/g, '{{DOUBLESTAR}}')      // Temp placeholder
    .replace(/\*/g, '[^/]*')                  // Single * = not slashes
    .replace(/{{DOUBLESTAR}}/g, '.*');        // ** = anything
  
  return new RegExp(`^${regexPattern}$`).test(url);
}
```

### UI for URL Whitelisting

```
┌─────────────────────────────────────────────────────────────────────────┐
│  URL Targeting                                                    [?]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ○ Show on all pages (where Agency Toolkit is installed)               │
│  ● Show on specific pages only                                          │
│  ○ Show on all pages EXCEPT specific pages                              │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  URL Patterns                                           [+ Add]  │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                  │   │
│  │  1. [starts_with ▼] [https://app.gohighlevel.com/conta] [🗑️]   │   │
│  │     ✅ Matches: /contacts, /contacts/123, /contacts/new          │   │
│  │                                                                  │   │
│  │  2. [exact ▼______] [https://app.gohighlevel.com/dash ] [🗑️]   │   │
│  │     ✅ Matches: exactly this URL only                            │   │
│  │                                                                  │   │
│  │  3. [contains ▼___] [/settings/                       ] [🗑️]   │   │
│  │     ✅ Matches: any URL containing /settings/                    │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  💡 Test URL                                                     │   │
│  │  [https://app.gohighlevel.com/contacts/12345           ] [Test]  │   │
│  │                                                                  │   │
│  │  ✅ This URL matches pattern #1 - tour WILL show                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Default GHL Domain Whitelist

```typescript
const DEFAULT_GHL_PATTERNS: UrlPattern[] = [
  { type: 'wildcard', value: 'https://*.gohighlevel.com/**' },
  { type: 'wildcard', value: 'https://*.msgsndr.com/**' },
  { type: 'wildcard', value: 'https://*.highlevel.com/**' },
  // Custom domains (subaccounts can have their own domains)
  // These are dynamically added per-subaccount
];
```

---

## Interface Layout & Design

### Main Dashboard - Tours List

Based on Usetiful's clean interface:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Agency Toolkit                                              [?] [⚙️] [👤]  │
├───────────┬─────────────────────────────────────────────────────────────────┤
│           │                                                                 │
│  📊 Home  │  Guided Tours                                    [+ New Tour]  │
│           │                                                                 │
│  🎯 Tours │  ┌──────────────────────────────────────────────────────────┐  │
│    ├ All  │  │  🔍 Search tours...            [Status ▼] [Sort by ▼]   │  │
│    ├ Live │  └──────────────────────────────────────────────────────────┘  │
│    └ Draft│                                                                 │
│           │  ┌──────────────────────────────────────────────────────────┐  │
│  💡 Tips  │  │  ┌────────────────────────────────────────────────────┐  │  │
│           │  │  │  Welcome Tour                          🟢 Live     │  │  │
│  ✅ Lists │  │  │  5 steps · Created Jan 10 · 234 views · 67% done   │  │  │
│           │  │  │                              [Edit] [📊] [⋮]       │  │  │
│  📢 Banners│ │  └────────────────────────────────────────────────────┘  │  │
│           │  │                                                          │  │
│  🎨 Themes│  │  ┌────────────────────────────────────────────────────┐  │  │
│           │  │  │  Feature Highlight                     🟡 Draft    │  │  │
│  📈 Stats │  │  │  3 steps · Created Jan 12 · Not published          │  │  │
│           │  │  │                              [Edit] [📊] [⋮]       │  │  │
│  ⚙️ Settings│ │  └────────────────────────────────────────────────────┘  │  │
│           │  │                                                          │  │
│           │  └──────────────────────────────────────────────────────────┘  │
│           │                                                                 │
└───────────┴─────────────────────────────────────────────────────────────────┘
```

### Tour Builder - Main Editor

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Back to Tours        Welcome Tour                    [Preview] [Publish] │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Steps] [Settings] [Targeting] [Theme] [Analytics]                         │
├───────────────────────┬─────────────────────────────────────────────────────┤
│                       │                                                     │
│  STEPS                │  STEP EDITOR                                        │
│  ─────────────────    │  ───────────────────────────────────────────────    │
│                       │                                                     │
│  ┌─────────────────┐  │  Step Type                                          │
│  │ 1. Welcome      │◀─│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │
│  │    Modal        │  │  │Modal│ │Point│ │Slide│ │ Hot │ │Banner│         │
│  └─────────────────┘  │  │ 💬  │ │ 👆  │ │ 📤  │ │ ●   │ │ 📢  │          │
│  ┌─────────────────┐  │  └──▲──┘ └─────┘ └─────┘ └─────┘ └─────┘          │
│  │ 2. Dashboard    │  │     └── Selected                                    │
│  │    Pointer      │  │                                                     │
│  └─────────────────┘  │  ─────────────────────────────────────────────      │
│  ┌─────────────────┐  │                                                     │
│  │ 3. Contacts     │  │  Content                                            │
│  │    Pointer      │  │  ┌─────────────────────────────────────────────┐   │
│  └─────────────────┘  │  │ [B] [I] [U] [🔗] [📷] [🎬] [</>]            │   │
│  ┌─────────────────┐  │  ├─────────────────────────────────────────────┤   │
│  │ 4. Complete!    │  │  │                                             │   │
│  │    Modal        │  │  │  Welcome to your new CRM! 👋                │   │
│  └─────────────────┘  │  │                                             │   │
│                       │  │  Let's take a quick tour to help you        │   │
│  [+ Add Step]         │  │  get started with the most important        │   │
│                       │  │  features.                                   │   │
│  ─────────────────    │  │                                             │   │
│                       │  │  [Add image or video]                       │   │
│  ☰ Drag to reorder   │  │                                             │   │
│                       │  └─────────────────────────────────────────────┘   │
│                       │                                                     │
│                       │  ─────────────────────────────────────────────      │
│                       │                                                     │
│                       │  Buttons                                            │
│                       │  ┌────────────────┐  ┌────────────────┐            │
│                       │  │ ← Previous     │  │ Next →         │            │
│                       │  │ [Hide] [Edit]  │  │ [Show] [Edit]  │            │
│                       │  └────────────────┘  └────────────────┘            │
│                       │                                                     │
│                       │  ─────────────────────────────────────────────      │
│                       │                                                     │
│                       │  Progress Indicator                                 │
│                       │  ○ None  ● Dots  ○ Numbers  ○ Progress Bar         │
│                       │                                                     │
└───────────────────────┴─────────────────────────────────────────────────────┘
```

### Tour Builder - Pointer/Tooltip Step

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       │                                                     │
│  STEPS                │  STEP EDITOR - Pointer                              │
│  ─────────────────    │  ───────────────────────────────────────────────    │
│                       │                                                     │
│  ┌─────────────────┐  │  Element Selection                                  │
│  │ 1. Welcome      │  │  ┌─────────────────────────────────────────────┐   │
│  │    Modal        │  │  │ nav > ul > li:nth-child(2) > a      [🎯]   │   │
│  └─────────────────┘  │  └─────────────────────────────────────────────┘   │
│  ┌─────────────────┐  │  [🎯] = Click to open GHL and select element       │
│  │ 2. Dashboard    │◀─│                                                     │
│  │    Pointer      │  │  Or enter CSS selector manually                     │
│  └─────────────────┘  │                                                     │
│  ...                  │  ─────────────────────────────────────────────      │
│                       │                                                     │
│                       │  Pointer Position                                   │
│                       │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                   │
│                       │  │ Top │ │Right│ │Bottm│ │Left │                   │
│                       │  │  ▼  │ │  ▶  │ │  ▲  │ │  ◀  │                   │
│                       │  └──▲──┘ └─────┘ └─────┘ └─────┘                   │
│                       │     └── Selected                                    │
│                       │                                                     │
│                       │  ─────────────────────────────────────────────      │
│                       │                                                     │
│                       │  Highlight Element?                                 │
│                       │  [✓] Darken rest of page (spotlight effect)        │
│                       │                                                     │
│                       │  ─────────────────────────────────────────────      │
│                       │                                                     │
│                       │  Progress Trigger                                   │
│                       │  ○ Click "Next" button                              │
│                       │  ● Click the highlighted element                    │
│                       │  ○ Click anywhere on page                           │
│                       │                                                     │
│                       │  [✓] Perform default action (e.g., navigate)       │
│                       │                                                     │
└───────────────────────┴─────────────────────────────────────────────────────┘
```

### Tour Settings Tab

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Steps] [Settings] [Targeting] [Theme] [Analytics]                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  GENERAL SETTINGS                                                           │
│  ────────────────────────────────────────────────────────────────────       │
│                                                                             │
│  Tour Name                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │ Welcome Tour                                                     │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  Internal Notes (not shown to users)                                        │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │ Onboarding flow for new subaccount users                        │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  ────────────────────────────────────────────────────────────────────       │
│                                                                             │
│  LAUNCH BEHAVIOR                                                            │
│  ────────────────────────────────────────────────────────────────────       │
│                                                                             │
│  When should this tour start?                                               │
│  ● Automatically on page load                                               │
│  ○ When user clicks a button/link (specify trigger element)                 │
│  ○ From Resource Center widget only                                         │
│  ○ Via JavaScript API call only                                             │
│                                                                             │
│  [✓] Remember user's progress (resume where they left off)                 │
│  [✓] Show progress indicator                                                │
│  [ ] Allow users to skip tour                                               │
│  [✓] Show "X" close button                                                  │
│                                                                             │
│  ────────────────────────────────────────────────────────────────────       │
│                                                                             │
│  FREQUENCY                                                                  │
│  ────────────────────────────────────────────────────────────────────       │
│                                                                             │
│  How often should this tour show?                                           │
│  ● Once per user (until completed or dismissed)                             │
│  ○ Every time the trigger conditions are met                                │
│  ○ Once per session                                                         │
│  ○ Custom interval: [ 7 ] days                                              │
│                                                                             │
│  ────────────────────────────────────────────────────────────────────       │
│                                                                             │
│  PRIORITY                                                                   │
│  ────────────────────────────────────────────────────────────────────       │
│                                                                             │
│  If multiple tours qualify, which should show first?                        │
│  Priority: [ 10 ] (higher = shows first)                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Targeting Tab (with URL Whitelisting)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Steps] [Settings] [Targeting] [Theme] [Analytics]                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PAGE TARGETING (URL WHITELIST)                                             │
│  ────────────────────────────────────────────────────────────────────       │
│                                                                             │
│  Where should this tour appear?                                             │
│  ○ All pages where Agency Toolkit is installed                              │
│  ● Specific pages only                                                      │
│  ○ All pages EXCEPT certain pages                                           │
│                                                                             │
│  URL Patterns                                                   [+ Add]     │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │  [starts with ▼] https://app.gohighlevel.com/v2/locati    [🗑️] │       │
│  │  ✓ Will match: /v2/location/abc123/dashboard, etc.              │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  Test a URL                                                                 │
│  ┌─────────────────────────────────────────────────┐ [Test]                │
│  │ https://app.gohighlevel.com/v2/location/abc/... │                       │
│  └─────────────────────────────────────────────────┘                       │
│  ✅ URL matches - tour will show on this page                              │
│                                                                             │
│  ────────────────────────────────────────────────────────────────────       │
│                                                                             │
│  ELEMENT TARGETING (Optional)                                               │
│  ────────────────────────────────────────────────────────────────────       │
│                                                                             │
│  Only show when this element exists on page:                                │
│  ┌─────────────────────────────────────────────────┐ [🎯]                  │
│  │ (optional - leave blank to ignore)              │                       │
│  └─────────────────────────────────────────────────┘                       │
│                                                                             │
│  ────────────────────────────────────────────────────────────────────       │
│                                                                             │
│  USER TARGETING                                                             │
│  ────────────────────────────────────────────────────────────────────       │
│                                                                             │
│  Who should see this tour?                                                  │
│  ● All users                                                                │
│  ○ New users only (first 7 days)                                           │
│  ○ Users who haven't completed [select tour ▼]                             │
│  ○ Custom segment (advanced)                                                │
│                                                                             │
│  ────────────────────────────────────────────────────────────────────       │
│                                                                             │
│  DEVICE TARGETING                                                           │
│  ────────────────────────────────────────────────────────────────────       │
│                                                                             │
│  [✓] Desktop    [✓] Tablet    [ ] Mobile                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Checklist Builder

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Back to Checklists        Getting Started              [Preview] [Save]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CHECKLIST SETTINGS                                                         │
│  ────────────────────────────────────────────────────────────────────       │
│                                                                             │
│  Title (shown to users)                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │ Getting Started with Your CRM                                    │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  Description                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │ Complete these steps to set up your account                      │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  ────────────────────────────────────────────────────────────────────       │
│                                                                             │
│  CHECKLIST ITEMS                                                 [+ Add]    │
│  ────────────────────────────────────────────────────────────────────       │
│                                                                             │
│  ☰ ┌─────────────────────────────────────────────────────────────────┐     │
│    │ 1. Complete your profile                                         │     │
│    │    Action: [Launch Tour ▼] → [Welcome Tour        ▼]            │     │
│    │    Auto-complete: [When tour is finished ▼]                      │     │
│    └─────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ☰ ┌─────────────────────────────────────────────────────────────────┐     │
│    │ 2. Import your contacts                                          │     │
│    │    Action: [Open URL ▼] → [/contacts/import                 ]   │     │
│    │    Auto-complete: [When URL visited ▼]                           │     │
│    └─────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ☰ ┌─────────────────────────────────────────────────────────────────┐     │
│    │ 3. Send your first email                                         │     │
│    │    Action: [Launch Tour ▼] → [Email Campaign Tour ▼]            │     │
│    │    Auto-complete: [When user clicks element ▼] [🎯 Select]      │     │
│    └─────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ────────────────────────────────────────────────────────────────────       │
│                                                                             │
│  COMPLETION REWARD (Optional)                                               │
│  ────────────────────────────────────────────────────────────────────       │
│                                                                             │
│  When all items complete:                                                   │
│  [✓] Show celebration modal                                                │
│  [ ] Trigger JavaScript event                                               │
│  [ ] Redirect to URL                                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Analytics Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Steps] [Settings] [Targeting] [Theme] [Analytics]                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  OVERVIEW                                        [Last 30 days ▼] [Export]  │
│  ────────────────────────────────────────────────────────────────────       │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │    Views     │  │  Completions │  │  Completion  │  │   Avg Time   │    │
│  │    1,247     │  │     834      │  │     67%      │  │    2m 34s    │    │
│  │   ↑ 12%      │  │    ↑ 8%      │  │    ↑ 5%      │  │    ↓ 15s     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                                             │
│  ────────────────────────────────────────────────────────────────────       │
│                                                                             │
│  STEP-BY-STEP FUNNEL                                                        │
│  ────────────────────────────────────────────────────────────────────       │
│                                                                             │
│  Step 1: Welcome Modal                                                      │
│  ████████████████████████████████████████████████████ 1,247 (100%)         │
│                                                                             │
│  Step 2: Dashboard Pointer        ↓ 8% drop-off                            │
│  ████████████████████████████████████████████████ 1,147 (92%)              │
│                                                                             │
│  Step 3: Contacts Pointer         ↓ 15% drop-off ⚠️                        │
│  ████████████████████████████████████████ 975 (78%)                        │
│                                                                             │
│  Step 4: Complete Modal           ↓ 11% drop-off                           │
│  ████████████████████████████████████ 834 (67%)                            │
│                                                                             │
│  ────────────────────────────────────────────────────────────────────       │
│                                                                             │
│  💡 Insight: Step 3 has highest drop-off. Consider:                        │
│     • Simplifying the content                                               │
│     • Checking if the element selector is reliable                          │
│     • Adding more context about why contacts matter                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Models

### Complete TypeScript Interfaces

```typescript
// ============================================
// CORE TOUR TYPES
// ============================================

interface Tour {
  id: string;
  agency_id: string;
  subaccount_id?: string;  // null = available to all subaccounts
  
  // Basic info
  name: string;
  description?: string;
  status: 'draft' | 'live' | 'archived';
  priority: number;  // Higher = shows first if multiple qualify
  
  // Content
  steps: TourStep[];
  
  // Configuration
  settings: TourSettings;
  targeting: TourTargeting;
  theme_id?: string;  // Reference to Theme
  
  // Metadata
  created_at: Date;
  updated_at: Date;
  published_at?: Date;
  created_by: string;
}

interface TourStep {
  id: string;
  order: number;
  
  // Step type
  type: 'modal' | 'pointer' | 'slideout' | 'hotspot' | 'banner';
  
  // Content (sanitized HTML)
  title?: string;
  content: string;  // Rich text content
  media?: StepMedia;
  
  // Element targeting (for pointer/hotspot)
  element?: ElementTarget;
  
  // Positioning
  position?: 'top' | 'right' | 'bottom' | 'left' | 'center';
  
  // Visual options
  highlight: boolean;  // Spotlight effect
  backdrop: boolean;   // Darken background
  
  // Navigation
  buttons: StepButton[];
  progress_trigger: ProgressTrigger;
  
  // Conditions
  auto_skip: boolean;  // Skip if element not found
  delay_ms?: number;   // Delay before showing
}

interface StepMedia {
  type: 'image' | 'video' | 'gif';
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface ElementTarget {
  selector: string;
  // Fallback metadata for dynamic elements
  metadata?: {
    tagName: string;
    text?: string;
    attributes?: Record<string, string>;
    parentSelector?: string;
  };
}

interface StepButton {
  id: string;
  label: string;
  action: 'next' | 'prev' | 'close' | 'url' | 'tour' | 'custom';
  url?: string;        // For 'url' action
  tour_id?: string;    // For 'tour' action
  style: 'primary' | 'secondary' | 'ghost';
  position: 'left' | 'right';
}

type ProgressTrigger = 
  | { type: 'button' }                    // Click Next button
  | { type: 'element_click' }             // Click the targeted element
  | { type: 'any_click' }                 // Click anywhere
  | { type: 'element_exists'; selector: string }  // Auto-advance when element appears
  | { type: 'delay'; ms: number };        // Auto-advance after delay

interface TourSettings {
  // Launch behavior
  autoplay: boolean;
  trigger_element?: string;  // CSS selector for manual trigger
  
  // Progress
  remember_progress: boolean;
  show_progress: boolean;
  progress_style: 'dots' | 'numbers' | 'bar' | 'none';
  
  // Controls
  allow_skip: boolean;
  show_close: boolean;
  close_on_outside_click: boolean;
  
  // Frequency
  frequency: TourFrequency;
}

type TourFrequency =
  | { type: 'once' }                     // Once per user ever
  | { type: 'once_per_session' }         // Once per browser session
  | { type: 'every_time' }               // Every time conditions met
  | { type: 'interval'; days: number };  // Every N days

interface TourTargeting {
  // URL targeting (whitelist)
  url_targeting: UrlTargeting;
  
  // Element targeting
  element_condition?: string;  // Only show if this element exists
  
  // User targeting
  user_targeting: UserTargeting;
  
  // Device targeting
  devices: ('desktop' | 'tablet' | 'mobile')[];
}

interface UrlTargeting {
  mode: 'all' | 'whitelist' | 'blacklist';
  patterns: UrlPattern[];
}

interface UrlPattern {
  id: string;
  type: 'exact' | 'contains' | 'starts_with' | 'ends_with' | 'wildcard' | 'regex';
  value: string;
  description?: string;
}

interface UserTargeting {
  type: 'all' | 'new_users' | 'returning' | 'not_completed' | 'custom';
  new_user_days?: number;       // For 'new_users' type
  not_completed_tour?: string;  // Tour ID for 'not_completed' type
  custom_segment?: UserSegment; // For 'custom' type
}

interface UserSegment {
  conditions: SegmentCondition[];
  operator: 'and' | 'or';
}

interface SegmentCondition {
  attribute: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'gt' | 'lt' | 'exists';
  value: any;
}

// ============================================
// CHECKLIST TYPES
// ============================================

interface Checklist {
  id: string;
  agency_id: string;
  subaccount_id?: string;
  
  // Basic info
  name: string;
  title: string;      // Displayed to users
  description?: string;
  status: 'draft' | 'live' | 'archived';
  
  // Items
  items: ChecklistItem[];
  
  // Configuration
  targeting: TourTargeting;  // Reuse tour targeting
  theme_id?: string;
  
  // Widget settings
  widget: ChecklistWidget;
  
  // Completion
  on_complete?: CompletionAction;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
}

interface ChecklistItem {
  id: string;
  order: number;
  
  // Content
  title: string;
  description?: string;
  
  // Action when clicked
  action: ChecklistAction;
  
  // Completion trigger
  completion_trigger: CompletionTrigger;
}

type ChecklistAction =
  | { type: 'tour'; tour_id: string }
  | { type: 'url'; url: string; new_tab?: boolean }
  | { type: 'js_event'; event_name: string }
  | { type: 'none' };

type CompletionTrigger =
  | { type: 'tour_complete'; tour_id: string }
  | { type: 'url_visited'; pattern: UrlPattern }
  | { type: 'element_clicked'; selector: string }
  | { type: 'manual' }  // User checks it off
  | { type: 'js_event'; event_name: string };

interface ChecklistWidget {
  position: 'bottom-left' | 'bottom-right';
  collapsed_by_default: boolean;
  show_progress: boolean;
  hide_when_complete: boolean;
}

type CompletionAction =
  | { type: 'modal'; content: string }
  | { type: 'redirect'; url: string }
  | { type: 'js_event'; event_name: string }
  | { type: 'confetti' }
  | { type: 'none' };

// ============================================
// SMART TIPS (TOOLTIPS) TYPES
// ============================================

interface SmartTip {
  id: string;
  agency_id: string;
  subaccount_id?: string;
  
  name: string;
  status: 'draft' | 'live' | 'archived';
  
  // Target element
  element: ElementTarget;
  
  // Content
  content: string;
  
  // Trigger
  trigger: 'hover' | 'click' | 'focus';
  
  // Positioning
  position: 'top' | 'right' | 'bottom' | 'left' | 'auto';
  
  // Targeting
  targeting: TourTargeting;
  
  theme_id?: string;
  
  created_at: Date;
  updated_at: Date;
}

// ============================================
// BANNER TYPES
// ============================================

interface Banner {
  id: string;
  agency_id: string;
  subaccount_id?: string;
  
  name: string;
  status: 'draft' | 'live' | 'archived';
  
  // Content
  content: string;
  
  // Visual
  position: 'top' | 'bottom';
  style: 'info' | 'success' | 'warning' | 'error' | 'custom';
  dismissible: boolean;
  
  // Action button (optional)
  action?: {
    label: string;
    type: 'url' | 'tour' | 'dismiss';
    url?: string;
    tour_id?: string;
  };
  
  // Targeting
  targeting: TourTargeting;
  
  // Scheduling
  start_date?: Date;
  end_date?: Date;
  
  theme_id?: string;
  
  created_at: Date;
  updated_at: Date;
}

// ============================================
// RESOURCE CENTER TYPES
// ============================================

interface ResourceCenter {
  id: string;
  agency_id: string;
  subaccount_id?: string;
  
  name: string;
  status: 'draft' | 'live' | 'archived';
  
  // Widget settings
  widget: {
    position: 'bottom-right' | 'bottom-left';
    icon: 'help' | 'book' | 'lightbulb' | 'custom';
    custom_icon_url?: string;
    label?: string;
  };
  
  // Sections
  sections: ResourceSection[];
  
  // Search
  search_enabled: boolean;
  
  // Targeting
  targeting: TourTargeting;
  
  theme_id?: string;
  
  created_at: Date;
  updated_at: Date;
}

interface ResourceSection {
  id: string;
  order: number;
  title: string;
  type: 'tours' | 'links' | 'checklist';
  
  // For 'tours' type
  tour_ids?: string[];
  
  // For 'links' type
  links?: ResourceLink[];
  
  // For 'checklist' type
  checklist_id?: string;
}

interface ResourceLink {
  id: string;
  label: string;
  url: string;
  icon?: string;
  new_tab: boolean;
}

// ============================================
// THEME TYPES
// ============================================

interface Theme {
  id: string;
  agency_id: string;
  
  name: string;
  is_default: boolean;
  
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    text_secondary: string;
    border: string;
    overlay: string;  // Backdrop/spotlight
  };
  
  typography: {
    font_family: string;
    title_size: string;
    body_size: string;
    line_height: string;
  };
  
  borders: {
    radius: string;
    width: string;
    style: string;
  };
  
  shadows: {
    tooltip: string;
    modal: string;
  };
  
  buttons: {
    primary: ButtonStyle;
    secondary: ButtonStyle;
  };
  
  custom_css?: string;  // Advanced customization
  
  created_at: Date;
  updated_at: Date;
}

interface ButtonStyle {
  background: string;
  text: string;
  border: string;
  hover_background: string;
  hover_text: string;
  padding: string;
  border_radius: string;
}

// ============================================
// ANALYTICS TYPES
// ============================================

interface TourAnalytics {
  tour_id: string;
  period: { start: Date; end: Date };
  
  summary: {
    total_views: number;
    unique_users: number;
    completions: number;
    completion_rate: number;
    avg_completion_time_ms: number;
    dismissals: number;
  };
  
  steps: StepAnalytics[];
  
  trends: {
    date: string;
    views: number;
    completions: number;
  }[];
}

interface StepAnalytics {
  step_id: string;
  step_order: number;
  step_title: string;
  
  views: number;
  completions: number;
  drop_off_rate: number;
  avg_time_on_step_ms: number;
}

interface AnalyticsEvent {
  id: string;
  tour_id?: string;
  checklist_id?: string;
  banner_id?: string;
  smart_tip_id?: string;
  
  type: 'view' | 'step_view' | 'complete' | 'dismiss' | 'skip' | 'click';
  step_id?: string;
  
  user_id?: string;
  session_id: string;
  
  url: string;
  device_type: 'desktop' | 'tablet' | 'mobile';
  
  timestamp: Date;
  metadata?: Record<string, any>;
}

// ============================================
// USER STATE TYPES
// ============================================

interface UserTourState {
  user_id: string;
  tour_id: string;
  
  status: 'not_started' | 'in_progress' | 'completed' | 'dismissed';
  current_step: number;
  
  started_at?: Date;
  completed_at?: Date;
  dismissed_at?: Date;
  
  step_history: {
    step_id: string;
    viewed_at: Date;
    completed_at?: Date;
  }[];
}

interface UserChecklistState {
  user_id: string;
  checklist_id: string;
  
  completed_items: string[];  // Item IDs
  dismissed: boolean;
  
  started_at: Date;
  completed_at?: Date;
}
```

---

## API Endpoints

### Tours API

```typescript
// Tours CRUD
POST   /api/tours                    // Create tour
GET    /api/tours                    // List tours (with filters)
GET    /api/tours/:id                // Get single tour
PUT    /api/tours/:id                // Update tour
DELETE /api/tours/:id                // Delete tour

// Tour actions
POST   /api/tours/:id/duplicate      // Duplicate tour
POST   /api/tours/:id/publish        // Publish draft tour
POST   /api/tours/:id/unpublish      // Unpublish live tour
POST   /api/tours/:id/archive        // Archive tour

// Checklists CRUD
POST   /api/checklists               // Create checklist
GET    /api/checklists               // List checklists
GET    /api/checklists/:id           // Get checklist
PUT    /api/checklists/:id           // Update checklist
DELETE /api/checklists/:id           // Delete checklist

// Smart Tips CRUD
POST   /api/smart-tips               // Create smart tip
GET    /api/smart-tips               // List smart tips
GET    /api/smart-tips/:id           // Get smart tip
PUT    /api/smart-tips/:id           // Update smart tip
DELETE /api/smart-tips/:id           // Delete smart tip

// Banners CRUD
POST   /api/banners                  // Create banner
GET    /api/banners                  // List banners
GET    /api/banners/:id              // Get banner
PUT    /api/banners/:id              // Update banner
DELETE /api/banners/:id              // Delete banner

// Resource Center
POST   /api/resource-centers         // Create resource center
GET    /api/resource-centers         // List resource centers
GET    /api/resource-centers/:id     // Get resource center
PUT    /api/resource-centers/:id     // Update resource center
DELETE /api/resource-centers/:id     // Delete resource center

// Themes
POST   /api/themes                   // Create theme
GET    /api/themes                   // List themes
GET    /api/themes/:id               // Get theme
PUT    /api/themes/:id               // Update theme
DELETE /api/themes/:id               // Delete theme
POST   /api/themes/:id/set-default   // Set as default theme

// URL Whitelists
POST   /api/whitelists               // Create whitelist
GET    /api/whitelists               // List whitelists
PUT    /api/whitelists/:id           // Update whitelist
DELETE /api/whitelists/:id           // Delete whitelist
POST   /api/whitelists/test          // Test URL against patterns

// Templates
GET    /api/templates                // List templates (system + custom)
POST   /api/templates                // Save as template
DELETE /api/templates/:id            // Delete custom template

// Analytics
GET    /api/analytics/tours/:id              // Tour analytics
GET    /api/analytics/checklists/:id         // Checklist analytics
GET    /api/analytics/overview               // Overall analytics
POST   /api/analytics/export                 // Export to CSV

// Client-side API (used by injected script)
GET    /api/client/config                    // Get all active content for subaccount
POST   /api/client/events                    // Track analytics events
GET    /api/client/state/:user_id            // Get user's tour states
PUT    /api/client/state/:user_id/:tour_id   // Update user's tour state
```

---

## Security Implementation

### Files to Create

```
src/
├── lib/
│   ├── security/
│   │   ├── index.ts              // Export all security utilities
│   │   ├── sanitize.ts           // HTML/text sanitization
│   │   ├── selector-validator.ts // CSS selector validation
│   │   ├── url-validator.ts      // URL validation
│   │   ├── validation-schemas.ts // Zod schemas for all inputs
│   │   ├── csp.ts                // CSP header generation
│   │   └── audit-log.ts          // Security event logging
│   │
│   └── tour-engine/
│       ├── index.ts              // Export tour engine
│       ├── renderer.ts           // Render tour steps safely
│       ├── state.ts              // User state management
│       ├── triggers.ts           // Trigger evaluation
│       └── url-matcher.ts        // URL pattern matching
│
├── middleware/
│   ├── rate-limit.ts             // Rate limiting
│   ├── auth.ts                   // JWT verification
│   └── security-headers.ts       // Security headers
│
└── api/
    └── tours/
        └── route.ts              // API routes with validation
```

---

## Claude Code Implementation Prompt

Copy and paste this prompt to Claude Code to implement the security features:

---

### PROMPT FOR CLAUDE CODE

```
# Agency Toolkit - Guided Tours Security Implementation

## Context
I'm building a guided tours feature for Agency Toolkit, a SaaS product that helps GoHighLevel agencies customize their subaccounts. The tours feature allows agencies to create product tours, tooltips, checklists, and banners that are injected into GHL subaccounts via JavaScript.

## Security Criticality
This is a HIGH SECURITY feature because:
1. We inject JavaScript into third-party applications (GHL subaccounts)
2. Agencies create HTML content that will be rendered in users' browsers
3. CSS selectors are used to target DOM elements
4. User input could potentially contain XSS attacks

## What I Need You to Implement

### 1. Security Utilities (`src/lib/security/`)

Create these files with production-ready security code:

**sanitize.ts**
- Use DOMPurify for HTML sanitization
- Strict whitelist of allowed tags: p, br, strong, em, b, i, u, h1-h6, ul, ol, li, a, img, span, div, blockquote, code, pre
- Forbidden: script, style, iframe, object, embed, form, input, button, svg, math
- Remove all event handler attributes (onclick, onerror, onload, etc.)
- Validate URLs: only allow https://, http://, mailto:, tel:
- Validate image URLs: must be HTTPS from trusted CDNs or have valid extensions
- Export: sanitizeHTML(), sanitizeText(), sanitizeURL(), sanitizeImageURL()

**selector-validator.ts**
- Max selector length: 500 characters
- Max nesting depth: 10 levels
- Forbidden element selectors: script, style, iframe, object, embed, applet, frame, frameset, meta, link, base, noscript, template
- Block dangerous patterns: javascript:, data:, expression(), -moz-binding, behavior:, vbscript:
- Validate syntax before execution
- Export: validateSelector(), safeQuerySelector(), safeQuerySelectorAll()

**url-validator.ts**
- Validate URL format
- Check against whitelist patterns
- Support pattern types: exact, contains, starts_with, ends_with, wildcard, regex
- Prevent open redirect vulnerabilities
- Export: validateUrl(), matchUrlPattern(), isGhlDomain()

**validation-schemas.ts**
- Use Zod for all input validation
- Create schemas for: Tour, TourStep, Checklist, ChecklistItem, SmartTip, Banner, Theme, UrlPattern
- Include strict string length limits
- Export: tourSchema, tourStepSchema, checklistSchema, etc.

**csp.ts**
- Generate Content-Security-Policy headers for injected content
- Nonce-based script allowlisting
- Export: generateCSPHeaders(), generateNonce()

**audit-log.ts**
- Log security events: XSS attempts, invalid selectors, rate limit hits, auth failures
- Include: timestamp, event_type, user_id, agency_id, details
- Export: logSecurityEvent(), SecurityEventType enum

### 2. Tour Engine (`src/lib/tour-engine/`)

**renderer.ts**
- Render tour steps using sanitized content
- Safely apply CSS selectors
- Handle missing elements gracefully
- Export: renderTourStep(), renderTooltip(), renderModal()

**url-matcher.ts**
- Implement URL pattern matching logic
- Support all pattern types
- Optimize for performance (cache compiled patterns)
- Export: matchUrl(), compilePattern(), clearPatternCache()

### 3. Middleware (`src/middleware/`)

**rate-limit.ts**
- Use Upstash Redis for distributed rate limiting
- Limits: 
  - Tour creates: 10/minute per agency
  - Tour updates: 30/minute per agency
  - Analytics reads: 60/minute per agency
  - Client config fetches: 100/minute per subaccount
- Export: rateLimitMiddleware()

**security-headers.ts**
- Set security headers on all API responses
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY (for API routes)
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Export: securityHeadersMiddleware()

### 4. API Route Example (`src/app/api/tours/route.ts`)

Show me how to implement a secure API route that:
- Validates JWT authentication
- Applies rate limiting
- Validates all input with Zod
- Sanitizes all user content
- Logs security events
- Returns proper error responses

### 5. Test Files

Create test files for:
- XSS attack prevention (test various payloads)
- Selector validation (test dangerous selectors)
- URL pattern matching (test all pattern types)
- Rate limiting behavior

## Technical Requirements
- Next.js 14+ App Router
- TypeScript strict mode
- Supabase for database
- Clerk for authentication
- Upstash Redis for rate limiting

## Files Structure
```
src/
├── lib/
│   ├── security/
│   │   ├── index.ts
│   │   ├── sanitize.ts
│   │   ├── selector-validator.ts
│   │   ├── url-validator.ts
│   │   ├── validation-schemas.ts
│   │   ├── csp.ts
│   │   └── audit-log.ts
│   └── tour-engine/
│       ├── index.ts
│       ├── renderer.ts
│       ├── url-matcher.ts
│       └── state.ts
├── middleware/
│   ├── rate-limit.ts
│   └── security-headers.ts
└── app/api/tours/route.ts
```

## Important Notes
1. NEVER use innerHTML with unsanitized content
2. NEVER execute CSS selectors without validation
3. NEVER use eval() or Function() constructor
4. NEVER trust user input in URLs
5. ALWAYS validate before processing
6. ALWAYS log security events

Please implement all these files with production-quality code, including:
- Comprehensive error handling
- TypeScript types for everything
- JSDoc comments explaining security rationale
- Unit test examples

Start with the security utilities since everything else depends on them.
```

---

## Claude.md Security Additions

Add this to your project's `claude.md` file:

```markdown
## Security Guidelines for Guided Tours Feature

### Critical Security Rules

When working on the guided tours feature, ALWAYS follow these rules:

#### HTML Sanitization
```typescript
// ❌ NEVER do this
element.innerHTML = userContent;

// ✅ ALWAYS do this
import { sanitizeHTML } from '@/lib/security';
element.innerHTML = sanitizeHTML(userContent);
```

#### CSS Selector Execution
```typescript
// ❌ NEVER do this
document.querySelector(userSelector);

// ✅ ALWAYS do this
import { safeQuerySelector } from '@/lib/security';
const element = safeQuerySelector(userSelector);
```

#### URL Handling
```typescript
// ❌ NEVER do this
window.location.href = userUrl;
element.href = userUrl;

// ✅ ALWAYS do this
import { sanitizeURL } from '@/lib/security';
const safeUrl = sanitizeURL(userUrl);
if (safeUrl) {
  window.location.href = safeUrl;
}
```

#### API Input Validation
```typescript
// ❌ NEVER do this
const tour = await req.json();
await db.tours.create(tour);

// ✅ ALWAYS do this
import { tourSchema } from '@/lib/security/validation-schemas';
const body = await req.json();
const result = tourSchema.safeParse(body);
if (!result.success) {
  return new Response('Invalid input', { status: 400 });
}
await db.tours.create(result.data);
```

### Forbidden Patterns

NEVER use these patterns in the guided tours codebase:

1. `eval()` - Never execute arbitrary strings as code
2. `new Function()` - Same as eval
3. `innerHTML = ` without sanitization
4. `document.write()` - Never use
5. `setTimeout/setInterval` with string arguments
6. `location.href = ` with user input
7. `document.cookie` manipulation
8. `postMessage` without origin validation

### Security Checklist for New Code

Before submitting any code for the guided tours feature:

- [ ] All HTML content is sanitized with `sanitizeHTML()`
- [ ] All CSS selectors are validated with `validateSelector()`
- [ ] All URLs are validated with `sanitizeURL()`
- [ ] All API inputs are validated with Zod schemas
- [ ] No use of forbidden patterns listed above
- [ ] Security events are logged for suspicious activity
- [ ] Rate limiting is applied to new endpoints
- [ ] Error messages don't leak sensitive information

### Testing Security

Always test with these XSS payloads:

```javascript
const XSS_TEST_PAYLOADS = [
  '<script>alert("xss")</script>',
  '<img src=x onerror=alert("xss")>',
  '<svg onload=alert("xss")>',
  'javascript:alert("xss")',
  '<a href="javascript:alert(\'xss\')">click</a>',
  '"><script>alert("xss")</script>',
  "'-alert('xss')-'",
  '<div style="background:url(javascript:alert(\'xss\'))">',
  '<input onfocus=alert("xss") autofocus>',
  '<body onload=alert("xss")>',
];
```

### File Locations

Security utilities are located at:
- `src/lib/security/sanitize.ts` - HTML/text sanitization
- `src/lib/security/selector-validator.ts` - CSS selector validation
- `src/lib/security/url-validator.ts` - URL validation
- `src/lib/security/validation-schemas.ts` - Zod schemas
- `src/lib/security/audit-log.ts` - Security event logging

ALWAYS import from these files. Never create ad-hoc sanitization.
```

---

## V1 vs V2 Feature Summary

### V1 Features (Launch)

| Category | Features |
|----------|----------|
| **Content Types** | Tours, Smart Tips, Checklists, Banners, Hotspots |
| **Step Types** | Modal, Pointer/Tooltip, Slideout, Hotspot, Banner |
| **Content Editor** | Rich text, images, videos, GIFs, buttons |
| **Element Selection** | GHL builder mode (no extension), manual CSS entry |
| **URL Targeting** | Whitelist/blacklist, all pattern types |
| **User Targeting** | All users, new users, returning users |
| **Device Targeting** | Desktop, tablet, mobile |
| **Triggers** | Page load, element click, manual, delay |
| **Progress** | Dots, numbers, progress bar |
| **Themes** | Full customization, multiple themes |
| **Resource Center** | Help widget, tour launcher, external links |
| **Analytics** | Views, completions, funnel, drop-off |
| **Templates** | System templates (4), save custom |

### V2 Features (Future)

| Category | Features |
|----------|----------|
| **Content Types** | Knowledge Base, Surveys/NPS, Interactive Demos |
| **Advanced Triggers** | Scroll depth, exit intent, custom JS events |
| **A/B Testing** | Variation testing, statistical significance |
| **Advanced Analytics** | Session replay, heatmaps, conversion tracking |
| **Localization** | Multi-language support, auto-detect |
| **Integrations** | Webhooks, Google Analytics, Segment |
| **Team Features** | Permissions, approval workflows |
| **Advanced Targeting** | Custom attributes, behavioral segments |

---

## Success Metrics

### For Agency Toolkit

| Metric | Target |
|--------|--------|
| Tours created per Pro user | 3+ in first month |
| Tour completion rate | >60% |
| Founders → Pro conversion | 25% |
| Pro tier churn reduction | 15% lower than Founders |

### For Agency Clients

| Metric | Target |
|--------|--------|
| User activation improvement | +30-50% |
| Support tickets reduction | -20-40% |
| Feature adoption rate | +25% |
| Time to value reduction | -40% |

---

## Next Steps

1. **Run Claude Code prompt** to generate security utilities
2. **Review generated code** for completeness
3. **Add claude.md security section** to project
4. **Build tour engine** with security utilities
5. **Implement GHL builder mode** for element selection
6. **Create tour builder UI** based on layouts above
7. **Add URL whitelisting UI** to targeting tab
8. **Implement analytics tracking**
9. **Test with XSS payloads**
10. **Launch to beta users**
