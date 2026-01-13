# Feature 17: Apply Visual Configs in Embed Script

## Overview

Feature 17 completes the embed script integration by ensuring Login Designer, Loading Animations, and Dashboard Colors all properly apply in GHL sub-accounts.

---

## Current State Analysis

| Module | Embed Function | Status |
|--------|---------------|--------|
| Menu Customizer | `applyMenuConfig()` | **Complete** - CSS-based hiding/renaming |
| Dashboard Colors | `applyColorConfig()` | **Complete** - CSS variable injection |
| Login Designer | `applyLoginDesign()` | **Complete** - Canvas-based with elements |
| Login (Legacy) | `applyLoginConfig()` | **Complete** - Simple fallback config |
| Loading Animations | `applyLoadingConfig()` | **Needs Enhancement** |

---

## What's Already Working

### 1. Menu Customizer (embed.js lines 66-127)
- Hides menu items via `[data-sidebar-item="ID"]` selectors
- Renames items via CSS `::after` content trick
- Hides promotional/warning banners
- Uses MutationObserver for SPA re-application

### 2. Dashboard Colors (embed.js lines 129-157)
- Injects CSS variables: `--at-primary`, `--at-accent`, `--at-sidebar-bg`, `--at-sidebar-text`
- Applies colors to GHL elements: `.hl-primary`, `.btn-primary`, sidebar

### 3. Login Designer (embed.js lines 218-358)
- Detects login pages via URL and DOM
- Applies background (solid, gradient, image with overlay)
- Applies form styling (button, input, links)
- Injects canvas elements (images, text, GIFs) as fixed overlays

---

## Enhancements Needed: Loading Animations

### Current Implementation (embed.js lines 159-172)

```javascript
function applyLoadingConfig(loadingConfig) {
  if (!loadingConfig) return;
  log('Applying loading config', loadingConfig);

  // Only handles custom_css - missing animation injection
  if (loadingConfig.custom_css) {
    var style = document.createElement('style');
    style.id = 'agency-toolkit-loading';
    style.textContent = loadingConfig.custom_css;
    document.head.appendChild(style);
  }
}
```

### What Feature 15 Actually Saves

The Loading Animation page (loading-client.tsx) saves this config structure:

```typescript
interface LoadingConfig {
  animation_id: string;      // e.g., 'spinning-ring', 'bouncing-dots'
  custom_color: string;      // Animation color, e.g., '#3b82f6'
  background_color: string;  // Background behind animation, e.g., '#1e293b'
  animation_speed: number;   // Speed multiplier (0.5 to 2)
  animation_size: number;    // Size multiplier (0.5 to 2)
  use_brand_color: boolean;  // Use Dashboard Colors primary instead
}
```

### What Needs to Be Done

#### Enhancement 1: Generate Animation CSS Server-Side

Update `/api/config/route.ts` to include the animation CSS and HTML in the response:

```typescript
// In /api/config/route.ts
import { getAnimationById, generateAnimationCSS } from '@/lib/loading-animations';

// In the config building section:
const loadingConfig = agency.settings?.loading;
let loadingPayload = null;

if (loadingConfig?.animation_id) {
  const animation = getAnimationById(loadingConfig.animation_id);
  if (animation) {
    // Resolve color (use brand color if specified)
    const effectiveColor = loadingConfig.use_brand_color && agency.settings?.colors?.primary
      ? agency.settings.colors.primary
      : loadingConfig.custom_color || '#3b82f6';

    loadingPayload = {
      animation_id: loadingConfig.animation_id,
      css: generateAnimationCSS(animation, effectiveColor, loadingConfig.background_color),
      html: animation.html,
      speed: loadingConfig.animation_speed || 1,
      size: loadingConfig.animation_size || 1,
    };
  }
}

// Return in config
loading: loadingPayload,
```

#### Enhancement 2: Update applyLoadingConfig()

Update the embed script to inject the animation:

```javascript
function applyLoadingConfig(loadingConfig) {
  if (!loadingConfig) return;
  log('Applying loading config', loadingConfig);

  // Remove existing loading styles
  var existing = document.getElementById('agency-toolkit-loading');
  if (existing) existing.remove();
  var existingLoader = document.getElementById('agency-toolkit-loader');
  if (existingLoader) existingLoader.remove();

  // Inject animation CSS
  if (loadingConfig.css) {
    var style = document.createElement('style');
    style.id = 'agency-toolkit-loading';

    var css = loadingConfig.css;

    // Apply speed modifier (adjust animation-duration)
    if (loadingConfig.speed && loadingConfig.speed !== 1) {
      // Speed > 1 = faster = shorter duration
      var speedMultiplier = 1 / loadingConfig.speed;
      css = css.replace(/(\d+\.?\d*)s/g, function(match, duration) {
        return (parseFloat(duration) * speedMultiplier) + 's';
      });
    }

    // Apply size modifier via transform scale
    if (loadingConfig.size && loadingConfig.size !== 1) {
      css += '\\n.at-loader > * { transform: scale(' + loadingConfig.size + '); }';
    }

    style.textContent = css;
    document.head.appendChild(style);
  }

  // Hide GHL's default loading spinner
  var hideGHLLoader = document.createElement('style');
  hideGHLLoader.id = 'agency-toolkit-hide-ghl-loader';
  hideGHLLoader.textContent = [
    '/* Hide GHL default loaders */',
    '.hl-loader, .hl-loading, [class*="hl-spinner"],',
    '.loading-spinner, .page-loader { display: none !important; }'
  ].join('\\n');
  document.head.appendChild(hideGHLLoader);

  // Inject our custom loader HTML into the page
  if (loadingConfig.html) {
    var loader = document.createElement('div');
    loader.id = 'agency-toolkit-loader';
    loader.innerHTML = loadingConfig.html;
    // Add to loading containers if they exist
    var loaderContainers = document.querySelectorAll('.hl-loader-container, .loading-container, [class*="loader-wrapper"]');
    if (loaderContainers.length > 0) {
      loaderContainers.forEach(function(container) {
        container.appendChild(loader.cloneNode(true));
      });
    } else {
      // Fallback: add a fullscreen loader that can be shown/hidden
      loader.style.cssText = 'position:fixed;inset:0;z-index:9999;display:none;';
      loader.setAttribute('data-at-loader', 'true');
      document.body.appendChild(loader);
    }
    log('Custom loader injected');
  }
}
```

#### Enhancement 3: Loader Show/Hide Functions

Add helper functions to show/hide the custom loader:

```javascript
// Expose global functions for showing/hiding loader
window.AgencyToolkit = window.AgencyToolkit || {};
window.AgencyToolkit.showLoader = function() {
  var loader = document.querySelector('[data-at-loader]');
  if (loader) loader.style.display = 'flex';
};
window.AgencyToolkit.hideLoader = function() {
  var loader = document.querySelector('[data-at-loader]');
  if (loader) loader.style.display = 'none';
};
```

---

## Available Animations (from loading-animations.ts)

| ID | Label | Category | Description |
|----|-------|----------|-------------|
| `pulse-dot` | Pulse Dot | Minimal | Simple pulsing circle |
| `spinning-ring` | Spinning Ring | Professional | Rotating ring border |
| `bouncing-dots` | Bouncing Dots | Playful | Three bouncing dots |
| `progress-bar` | Progress Bar | Professional | Animated progress bar |
| `morphing-square` | Morphing Square | Creative | Shape-shifting square |
| `rotating-squares` | Rotating Squares | Creative | Two rotating squares |
| `gradient-spinner` | Gradient Spinner | Creative | Gradient colored spinner |
| `heartbeat` | Heartbeat | Playful | Pulsing heart animation |
| `wave-bars` | Wave Bars | Playful | Voice/audio visualization |
| `orbiting-dots` | Orbiting Dots | Professional | Dots orbiting center |
| `typing-dots` | Typing Dots | Minimal | iPhone-style typing indicator |
| `grid-slide` | Grid Slide | Creative | 3x3 sliding puzzle |
| `grid-rotate` | Grid Rotate | Creative | 3x3 clockwise rotation |
| `grid-fold` | Grid Fold | Creative | 3x3 domino fold effect |

Each animation uses CSS variables:
- `--loading-color` - Animation color (default: `#3b82f6`)
- `--loading-bg` - Background color (default: `transparent`)

---

## Testing Requirements

### Prerequisites
1. GHL sub-account with embed code installed
2. Agency Toolkit with configured Loading Animation

### Test Cases

| # | Test | Expected Result |
|---|------|-----------------|
| 1 | Set animation to "Bouncing Dots" | See bouncing dots instead of GHL spinner |
| 2 | Change custom_color to red | Animation appears in red |
| 3 | Change background_color | Background behind animation changes |
| 4 | Enable use_brand_color | Animation uses Dashboard Colors primary |
| 5 | Set speed to 2 (fast) | Animation plays twice as fast |
| 6 | Set speed to 0.5 (slow) | Animation plays at half speed |
| 7 | Set size to 1.5 | Animation appears 50% larger |
| 8 | Switch animation type | New animation appears correctly |

### GHL Selectors to Verify

Need to identify the exact selectors GHL uses for their loading states:
- Page load spinner
- AJAX/content loading indicators
- Modal loading states

**Action Item**: Test in GHL sub-account to identify correct selectors.

---

## Order of Implementation

1. **Update /api/config** - Add animation CSS/HTML to response
2. **Update embed.js applyLoadingConfig()** - Full animation injection
3. **Test in GHL** - Verify selectors and visual appearance
4. **Refine selectors** - Adjust based on testing
5. **Document** - Update user-facing docs

---

## Files to Modify

| File | Changes |
|------|---------|
| `app/api/config/route.ts` | Generate animation CSS in response |
| `app/embed.js/route.ts` | Enhance `applyLoadingConfig()` function |
| `lib/loading-animations.ts` | Already complete - has `generateAnimationCSS()` |

---

## Implementation Notes

**Completed:** 2026-01-13

### What Was Built

1. **`/api/config/route.ts`** - Enhanced to generate animation CSS/HTML
   - Imports `getAnimationById` from loading-animations
   - Resolves `use_brand_color` to use Dashboard Colors primary color
   - Replaces CSS variables with actual color values
   - Returns payload: `{ animation_id, css, html, speed, size }`

2. **`embed.js` `applyLoadingConfig()`** - Full rewrite
   - Injects animation CSS with speed modifier (scales all durations)
   - Applies size modifier via CSS transform scale
   - Hides GHL default loaders via CSS
   - Injects custom HTML into GHL loading containers
   - MutationObserver watches for dynamically-added loaders (SPA support)
   - Exposes `window.AgencyToolkit.showLoader()` / `.hideLoader()` helpers

### Files Modified
- `app/api/config/route.ts` - Animation CSS generation
- `app/embed.js/route.ts` - Enhanced applyLoadingConfig()
- `CLAUDE.md` - Added feature documentation workflow
- `docs/sprint.md` - Status update

### GHL Selectors Used
```css
.hl-loader, .hl-loading, [class*="hl-spinner"],
.loading-spinner, .page-loader, .hl-page-loader,
[class*="loading-indicator"], .spinner-border,
.hl-loading-overlay .hl-loading-spinner
```

### Testing Status
- Build passes
- Awaiting GHL sub-account testing

---

*Created: 2026-01-12*
*Completed: 2026-01-13*
