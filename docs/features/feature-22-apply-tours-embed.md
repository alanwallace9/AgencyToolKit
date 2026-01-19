# Feature 22: Apply Tours in Embed Script (Driver.js Integration)

**Status:** Ready for Implementation
**Dependencies:** Feature 18 (DAP Foundation), Feature 19 (Tour Builder), Feature 21 (Tour Preview)
**Estimated Complexity:** High

---

## Documented Preferences (User Approved 2026-01-19)

### Technical Decisions
| Decision | Preference |
|----------|------------|
| Data transfer | BroadcastChannel + localStorage (same as builder mode) |
| Element validation | "Test All Elements" on-demand with report |
| V2 Enhancement | Auto-test periodically + notification bell for broken selectors |

### Tour Theme Presets (4 built-in, no color picker)
| Preset | Primary Color | Hex | Use Case |
|--------|---------------|-----|----------|
| Blue | Bright blue | `#3b82f6` | Professional, tech, default |
| Green | Success green | `#22c55e` | Growth, health, eco |
| Orange | Warm orange | `#f97316` | Energy, urgency, sales |
| Dark Navy | Slate/navy | `#1e293b` | Premium, enterprise, contrast |

### Design Preferences
| Element | Preference |
|---------|------------|
| Tour popovers | Clean white cards with shadows |
| Illustrations | Line art (no emojis) |
| Overall feel | Clean, whitespace, not cluttered |

### GHL Pages for Testing
| GHL Page | Agency Label | Notes |
|----------|--------------|-------|
| Dashboard | Dashboard | Primary test page |
| Media Storage | Image Upload | Renamed in GHL |
| Launchpad | Connect Google | Renamed in GHL |
| Custom links | User-defined | Agency adds their own |

### V2 Backlog (Out of Scope)
- Automatic periodic element testing
- Notification bell for DOM changes
- Full color picker for themes
- A/B testing

---

## Overview

This feature integrates Driver.js into the Agency Toolkit embed script to render guided tours on GHL subaccount pages. When end-users visit a GHL page where a tour is configured, the tour automatically launches based on targeting rules.

### Why This Matters

This is the **core runtime** for the DAP (Digital Adoption Platform). Without it, all the tour building is just UI - this feature makes tours actually work for end-users.

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────────────┐
│  END USER visits GHL Subaccount                                          │
│  URL: https://app.agency.com/v2/location/abc123/dashboard               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. Agency Toolkit embed script loads (already injected)                │
│                                                                         │
│  2. Script fetches config from /api/config?key=rp_abc123                │
│     Response includes: { tours: [...], tour_themes: {...} }             │
│                                                                         │
│  3. Script checks which tours match current conditions:                 │
│     - URL targeting (whitelist/blacklist patterns)                      │
│     - User targeting (new users, returning, etc.)                       │
│     - Device targeting (desktop, tablet, mobile)                        │
│     - Element targeting (required element exists on page)               │
│                                                                         │
│  4. If a tour matches AND user hasn't seen it (or frequency allows):    │
│     - Load Driver.js dynamically                                        │
│     - Apply theme to Driver.js                                          │
│     - Render tour with steps                                            │
│                                                                         │
│  5. Track analytics: view, step views, completion, dismissal            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Driver.js Integration

### Why Driver.js?

- **Lightweight**: ~5KB gzipped
- **No dependencies**: Pure JavaScript
- **Highly customizable**: Full control over styling
- **Animation support**: Smooth transitions
- **Multiple step types**: Popovers, highlights, modals
- **Active maintenance**: Regular updates

### Installation

Driver.js will be loaded dynamically only when tours need to be rendered:

```javascript
function loadDriverJS() {
  return new Promise(function(resolve, reject) {
    if (window.driver) {
      resolve(window.driver);
      return;
    }

    // Load CSS
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/driver.js@1.3.1/dist/driver.css';
    document.head.appendChild(link);

    // Load JS
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/driver.js@1.3.1/dist/driver.js.iife.js';
    script.onload = function() {
      resolve(window.driver);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
```

---

## Tour Matching Logic

### Priority Resolution

When multiple tours match, use priority field:

```javascript
function getMatchingTours(tours, context) {
  return tours
    .filter(function(tour) {
      return tour.status === 'live'
        && matchesUrlTargeting(tour.targeting, context.url)
        && matchesUserTargeting(tour.targeting, context.user)
        && matchesDeviceTargeting(tour.targeting, context.device)
        && matchesElementTargeting(tour.targeting)
        && !hasSeenTour(tour.id, tour.settings?.frequency);
    })
    .sort(function(a, b) {
      // Higher priority first
      return (b.priority || 0) - (a.priority || 0);
    });
}
```

### URL Targeting

```javascript
function matchesUrlTargeting(targeting, currentUrl) {
  if (!targeting?.url_targeting) return true; // No targeting = all pages

  var urlTargeting = targeting.url_targeting;
  if (urlTargeting.mode === 'all') return true;

  var patterns = urlTargeting.patterns || [];
  var matches = patterns.some(function(pattern) {
    return matchUrlPattern(currentUrl, pattern);
  });

  return urlTargeting.mode === 'whitelist' ? matches : !matches;
}

function matchUrlPattern(url, pattern) {
  switch (pattern.type) {
    case 'exact':
      return url === pattern.value;
    case 'contains':
      return url.indexOf(pattern.value) !== -1;
    case 'starts_with':
      return url.indexOf(pattern.value) === 0;
    case 'ends_with':
      return url.slice(-pattern.value.length) === pattern.value;
    case 'wildcard':
      return matchWildcard(url, pattern.value);
    case 'regex':
      return new RegExp(pattern.value).test(url);
    default:
      return false;
  }
}
```

### User Targeting

```javascript
function matchesUserTargeting(targeting, user) {
  if (!targeting?.user_targeting) return true;

  var userTargeting = targeting.user_targeting;
  switch (userTargeting.type) {
    case 'all':
      return true;
    case 'new_users':
      var days = userTargeting.new_user_days || 7;
      return user.daysSinceFirstVisit <= days;
    case 'returning':
      return user.visitCount > 1;
    case 'not_completed':
      return !hasCompletedTour(userTargeting.not_completed_tour);
    default:
      return true;
  }
}
```

### Device Targeting

```javascript
function matchesDeviceTargeting(targeting, device) {
  if (!targeting?.devices || targeting.devices.length === 0) return true;

  return targeting.devices.indexOf(device) !== -1;
}

function detectDevice() {
  var width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}
```

### Element Targeting

```javascript
function matchesElementTargeting(targeting) {
  if (!targeting?.element_condition) return true;

  try {
    var element = document.querySelector(targeting.element_condition);
    return element !== null;
  } catch (e) {
    logWarn('Invalid element condition selector', targeting.element_condition);
    return true; // Don't block tour on invalid selector
  }
}
```

---

## User State Management

### State Storage

User tour state is stored in localStorage:

```javascript
var TOUR_STATE_KEY = 'at_tour_state';

function getTourState() {
  try {
    var state = localStorage.getItem(TOUR_STATE_KEY);
    return state ? JSON.parse(state) : {};
  } catch (e) {
    return {};
  }
}

function setTourState(tourId, state) {
  try {
    var allState = getTourState();
    allState[tourId] = {
      ...allState[tourId],
      ...state,
      updated_at: Date.now()
    };
    localStorage.setItem(TOUR_STATE_KEY, JSON.stringify(allState));
  } catch (e) {
    logError('Failed to save tour state', e);
  }
}
```

### State Shape

```javascript
{
  "tour-abc123": {
    "status": "completed",        // not_started | in_progress | completed | dismissed
    "current_step": 0,            // For resume functionality
    "started_at": 1705000000000,
    "completed_at": 1705000100000,
    "dismissed_at": null,
    "view_count": 3,
    "last_viewed_at": 1705000000000,
    "step_history": [
      { "step_id": "step-1", "viewed_at": 1705000010000, "completed_at": 1705000020000 },
      { "step_id": "step-2", "viewed_at": 1705000030000, "completed_at": 1705000040000 }
    ]
  }
}
```

### Frequency Control

```javascript
function hasSeenTour(tourId, frequency) {
  var state = getTourState()[tourId];
  if (!state) return false;

  if (!frequency || frequency.type === 'once') {
    return state.status === 'completed' || state.status === 'dismissed';
  }

  if (frequency.type === 'once_per_session') {
    // Session = unique browser session (uses sessionStorage check)
    return sessionStorage.getItem('at_tour_seen_' + tourId) === 'true';
  }

  if (frequency.type === 'interval' && frequency.days) {
    var daysSinceLastView = (Date.now() - state.last_viewed_at) / (1000 * 60 * 60 * 24);
    return daysSinceLastView < frequency.days;
  }

  if (frequency.type === 'every_time') {
    return false; // Always show
  }

  return false;
}
```

---

## Tour Rendering

### Main Render Function

```javascript
function renderTour(tour, theme) {
  return loadDriverJS().then(function(driver) {
    // Map our step types to Driver.js config
    var driverSteps = tour.steps.map(function(step, index) {
      return mapStepToDriver(step, index, tour.steps.length, tour.settings);
    });

    // Create Driver instance with theme
    var driverConfig = {
      showProgress: tour.settings?.show_progress !== false,
      showButtons: true,
      animate: true,
      allowClose: tour.settings?.allow_skip !== false,
      overlayOpacity: 0.5,
      stagePadding: 10,
      stageRadius: 8,
      popoverClass: 'at-tour-popover',
      steps: driverSteps,
      onHighlightStarted: function(element, step, options) {
        trackStepView(tour.id, tour.steps[options.state.activeIndex].id);
      },
      onDestroyStarted: function(element, step, options) {
        var completed = options.state.activeIndex === driverSteps.length - 1;
        if (completed) {
          handleTourComplete(tour.id);
        } else {
          handleTourDismiss(tour.id, options.state.activeIndex);
        }
      }
    };

    // Apply theme colors
    if (theme) {
      injectThemeStyles(theme);
    }

    // Start the tour
    var driverInstance = driver.driver(driverConfig);
    driverInstance.drive();

    // Track tour start
    trackTourView(tour.id);
    setTourState(tour.id, {
      status: 'in_progress',
      started_at: Date.now(),
      current_step: 0
    });

    return driverInstance;
  });
}
```

### Step Type Mapping

```javascript
function mapStepToDriver(step, index, totalSteps, tourSettings) {
  var driverStep = {
    popover: {
      title: step.title,
      description: step.content,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: index === totalSteps - 1 ? 'Finish' : (step.buttons?.primary?.text || 'Next'),
      prevBtnText: step.buttons?.secondary?.text || 'Previous',
      doneBtnText: 'Finish',
      showProgress: tourSettings?.show_progress !== false,
      progressText: '{{current}} of {{total}}',
    }
  };

  // Handle different step types
  switch (step.type) {
    case 'modal':
      // No element targeting - centered modal
      driverStep.popover.align = 'center';
      break;

    case 'tooltip':
    case 'pointer':
      // Target specific element
      if (step.element?.selector) {
        driverStep.element = step.element.selector;
        driverStep.popover.side = mapPosition(step.position);
      }
      break;

    case 'hotspot':
      // Target element with pulsing animation
      if (step.element?.selector) {
        driverStep.element = step.element.selector;
        driverStep.popover.side = mapPosition(step.position);
      }
      break;

    case 'slideout':
      // Corner positioned popover
      driverStep.popover.align = step.position || 'end';
      break;

    case 'banner':
      // Top or bottom banner (custom rendering)
      driverStep.popover.align = step.position === 'bottom' ? 'end' : 'start';
      break;
  }

  // Handle step-level settings
  if (step.settings?.show_overlay === false) {
    driverStep.disableActiveInteraction = false;
  }

  return driverStep;
}

function mapPosition(position) {
  var positionMap = {
    'top': 'top',
    'bottom': 'bottom',
    'left': 'left',
    'right': 'right',
    'center': 'over',
  };
  return positionMap[position] || 'bottom';
}
```

---

## Theme Application

### Theme CSS Injection

```javascript
function injectThemeStyles(theme) {
  var existingStyle = document.getElementById('at-tour-theme');
  if (existingStyle) existingStyle.remove();

  var colors = theme.colors || {};
  var typography = theme.typography || {};
  var borders = theme.borders || {};

  var css = \`
    .at-tour-popover {
      --driver-primary: \${colors.primary || '#3b82f6'};
      --driver-secondary: \${colors.secondary || '#64748b'};
      --driver-bg: \${colors.background || '#ffffff'};
      --driver-text: \${colors.text || '#1f2937'};
      --driver-text-secondary: \${colors.text_secondary || '#6b7280'};
      --driver-border: \${colors.border || '#e5e7eb'};
    }

    .at-tour-popover .driver-popover {
      background-color: var(--driver-bg);
      color: var(--driver-text);
      border: 1px solid var(--driver-border);
      border-radius: \${borders.radius || '8px'};
      font-family: \${typography.font_family || 'system-ui, sans-serif'};
    }

    .at-tour-popover .driver-popover-title {
      color: var(--driver-text);
      font-size: \${typography.title_size || '16px'};
      font-weight: 600;
    }

    .at-tour-popover .driver-popover-description {
      color: var(--driver-text-secondary);
      font-size: \${typography.body_size || '14px'};
    }

    .at-tour-popover .driver-popover-next-btn,
    .at-tour-popover .driver-popover-done-btn {
      background-color: var(--driver-primary);
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      font-weight: 500;
    }

    .at-tour-popover .driver-popover-prev-btn {
      background-color: transparent;
      color: var(--driver-secondary);
      border: 1px solid var(--driver-border);
      border-radius: 6px;
      padding: 8px 16px;
    }

    .at-tour-popover .driver-popover-progress-text {
      color: var(--driver-text-secondary);
      font-size: 12px;
    }

    .driver-active-element {
      box-shadow: 0 0 0 4px var(--driver-primary) !important;
    }
  \`;

  // Add custom CSS if provided
  if (theme.custom_css) {
    css += '\\n' + theme.custom_css;
  }

  var style = document.createElement('style');
  style.id = 'at-tour-theme';
  style.textContent = css;
  document.head.appendChild(style);
}
```

---

## Analytics Tracking

### Event Types

| Event | Trigger | Data |
|-------|---------|------|
| `tour_view` | Tour starts | tour_id, url, device, timestamp |
| `step_view` | Step becomes visible | tour_id, step_id, step_order, timestamp |
| `tour_complete` | User finishes all steps | tour_id, duration_ms, steps_viewed |
| `tour_dismiss` | User closes early | tour_id, step_at_dismiss, reason |
| `step_interaction` | User clicks/interacts | tour_id, step_id, action_type |

### Tracking Implementation

```javascript
var ANALYTICS_QUEUE = [];
var ANALYTICS_FLUSH_INTERVAL = 5000; // 5 seconds

function trackEvent(eventType, data) {
  var event = {
    type: eventType,
    timestamp: Date.now(),
    url: window.location.href,
    device: detectDevice(),
    session_id: getSessionId(),
    ...data
  };

  ANALYTICS_QUEUE.push(event);

  // Flush if queue is large
  if (ANALYTICS_QUEUE.length >= 10) {
    flushAnalytics();
  }
}

function flushAnalytics() {
  if (ANALYTICS_QUEUE.length === 0) return;

  var events = ANALYTICS_QUEUE.splice(0);

  // Use sendBeacon for reliability (survives page unload)
  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      API_BASE + '/api/analytics/events',
      JSON.stringify({ events: events, key: CONFIG_KEY })
    );
  } else {
    // Fallback to fetch
    fetch(API_BASE + '/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: events, key: CONFIG_KEY })
    }).catch(logError);
  }
}

// Flush on page unload
window.addEventListener('beforeunload', flushAnalytics);

// Periodic flush
setInterval(flushAnalytics, ANALYTICS_FLUSH_INTERVAL);

// Convenience functions
function trackTourView(tourId) {
  trackEvent('tour_view', { tour_id: tourId });
}

function trackStepView(tourId, stepId) {
  trackEvent('step_view', { tour_id: tourId, step_id: stepId });
}

function handleTourComplete(tourId) {
  var state = getTourState()[tourId];
  var duration = Date.now() - (state?.started_at || Date.now());

  trackEvent('tour_complete', {
    tour_id: tourId,
    duration_ms: duration,
    steps_viewed: state?.step_history?.length || 0
  });

  setTourState(tourId, { status: 'completed', completed_at: Date.now() });
}

function handleTourDismiss(tourId, stepIndex) {
  trackEvent('tour_dismiss', {
    tour_id: tourId,
    step_at_dismiss: stepIndex
  });

  setTourState(tourId, { status: 'dismissed', dismissed_at: Date.now() });
}
```

---

## API Endpoint Updates

### /api/config Response

Update `/api/config` to include tours and themes:

```typescript
// Response shape
{
  agency: {...},
  menu: {...},
  login_design: {...},
  loading: {...},
  colors: {...},

  // NEW: Tours data
  tours: [
    {
      id: "tour-abc123",
      name: "Welcome Tour",
      status: "live",
      priority: 10,
      steps: [...],
      settings: {...},
      targeting: {...},
      theme_id: "theme-xyz"
    }
  ],

  // NEW: Tour themes
  tour_themes: [
    {
      id: "theme-xyz",
      name: "Brand Theme",
      colors: {...},
      typography: {...},
      borders: {...}
    }
  ]
}
```

### /api/analytics/events Endpoint

Create new endpoint to receive analytics events:

```typescript
// POST /api/analytics/events
{
  key: "rp_abc123",  // Agency token
  events: [
    { type: "tour_view", tour_id: "...", timestamp: 1705000000000, ... },
    { type: "step_view", ... }
  ]
}
```

---

## Key Deliverables

### Embed Script Functions

| Function | Description |
|----------|-------------|
| `loadDriverJS()` | Dynamically load Driver.js from CDN |
| `getMatchingTours(tours, context)` | Filter tours by targeting rules |
| `matchesUrlTargeting(targeting, url)` | URL pattern matching |
| `matchesUserTargeting(targeting, user)` | User segment matching |
| `matchesDeviceTargeting(targeting, device)` | Device type matching |
| `matchesElementTargeting(targeting)` | Element existence check |
| `renderTour(tour, theme)` | Render tour using Driver.js |
| `mapStepToDriver(step)` | Convert our step format to Driver.js |
| `injectThemeStyles(theme)` | Apply theme CSS to Driver.js |
| `getTourState() / setTourState()` | LocalStorage state management |
| `hasSeenTour(tourId, frequency)` | Frequency control |
| `trackEvent(type, data)` | Analytics tracking |
| `flushAnalytics()` | Send analytics to server |

### API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/config` | GET | Updated to include tours & themes |
| `/api/analytics/events` | POST | Receive analytics events |

### Database

No new tables needed - uses existing `tour_analytics` table from Feature 18.

---

## Scope Boundaries

| In Scope | Out of Scope |
|----------|--------------|
| Driver.js integration and rendering | Custom tour library (use Driver.js) |
| URL/user/device/element targeting | Advanced user segmentation |
| LocalStorage state management | Server-side state sync |
| Basic analytics tracking | Real-time analytics dashboard |
| Theme application | A/B testing |
| Frequency control | Complex trigger conditions |
| Resume functionality | Cross-device state sync |

---

## Quick Wins (UX Improvements)

| Suggestion | Why It Helps | Effort |
|------------|--------------|--------|
| Smart re-show | If user navigates away mid-tour, offer to resume | Medium |
| Keyboard navigation | Arrow keys to navigate, Escape to dismiss | Low |
| Mobile optimization | Responsive popovers, touch-friendly buttons | Medium |
| Skip to step | Deep link to specific step (for debugging) | Low |
| Completion celebration | Confetti or animation on tour complete | Low |

---

## Performance Considerations

1. **Lazy Loading**: Driver.js only loaded when a tour needs to render
2. **Minimal Blocking**: Tour matching is fast, doesn't delay page load
3. **Batched Analytics**: Events queued and sent in batches
4. **Caching**: Tour config cached with /api/config response
5. **CDN Delivery**: Driver.js loaded from jsDelivr CDN

---

## Error Handling

### Scenarios

| Error | Handling |
|-------|----------|
| Driver.js fails to load | Log error, don't show tour, graceful degradation |
| Element not found | Show step without highlighting, log warning |
| Invalid selector | Skip step, continue tour |
| Analytics send fails | Queue for retry, don't block UI |
| LocalStorage unavailable | Fallback to sessionStorage, then memory |
| Theme CSS fails | Use default Driver.js styling |

### Graceful Degradation

```javascript
function safeTourRender(tour, theme) {
  try {
    return renderTour(tour, theme);
  } catch (error) {
    logError('Failed to render tour', error);
    // Don't break the page - just skip the tour
    return null;
  }
}
```

---

## Acceptance Criteria

- [ ] Driver.js loaded dynamically only when tours exist
- [ ] Tours render on matching pages with correct targeting
- [ ] URL targeting works (whitelist/blacklist/patterns)
- [ ] User targeting works (new/returning/not_completed)
- [ ] Device targeting works (desktop/tablet/mobile)
- [ ] Element targeting works (show only when element exists)
- [ ] Frequency control works (once/session/interval)
- [ ] Theme colors applied to Driver.js popovers
- [ ] Step navigation works (next/prev/skip)
- [ ] Tour state persisted in localStorage
- [ ] Analytics events tracked and sent to server
- [ ] Resume functionality works (pick up where left off)
- [ ] Graceful error handling (no page breaks)

---

## Testing Checklist

1. **Targeting**
   - [ ] Tour shows on matching URLs only
   - [ ] Tour hidden for users who completed it
   - [ ] Tour respects device targeting
   - [ ] Tour waits for element existence

2. **Rendering**
   - [ ] Modal steps render centered
   - [ ] Tooltip steps point to correct elements
   - [ ] Hotspot steps have pulsing indicator
   - [ ] Theme colors applied correctly

3. **Navigation**
   - [ ] Next/Previous buttons work
   - [ ] Progress indicator shows correct position
   - [ ] Close button dismisses tour
   - [ ] Last step shows "Finish" button

4. **State**
   - [ ] Tour marked complete after finishing
   - [ ] Tour marked dismissed after closing early
   - [ ] Resume works after page reload
   - [ ] Frequency control prevents re-showing

5. **Analytics**
   - [ ] tour_view event sent on start
   - [ ] step_view events sent for each step
   - [ ] tour_complete event sent on finish
   - [ ] tour_dismiss event sent on close
   - [ ] Events survive page navigation (sendBeacon)

---

## Implementation Notes

### Implementation Order

1. **Update /api/config** - Add tours and themes to response
2. **Add tour matching logic** - Targeting functions
3. **Add Driver.js loader** - Dynamic script loading
4. **Add tour renderer** - Step mapping, theme injection
5. **Add state management** - LocalStorage helpers
6. **Add analytics** - Event tracking and batching
7. **Create analytics endpoint** - /api/analytics/events
8. **Integration testing** - End-to-end on test GHL account

### Shared Code with Feature 21

Many functions are shared between Feature 21 (Preview) and Feature 22 (Runtime):
- `renderTour()`
- `mapStepToDriver()`
- `injectThemeStyles()`
- `loadDriverJS()`

Extract these to a shared section of the embed script that both preview mode and production mode can use.
