# Feature 42-43: Social Proof Widget

> **Status**: Spec Complete - Ready for Implementation
> **Priority**: Medium
> **Tier**: All plans (widget limit: 5 Toolkit / Unlimited Pro)
> **Dependencies**: None (standalone module)

---

## Overview

A social proof notification widget that displays real-time activity on agency marketing websites. Shows notifications like "John from Austin just signed up" to build trust and increase conversions.

**Key differentiator**: Zero-setup auto-capture. Agency pastes one script tag, and the widget automatically detects and captures form submissions.

### Where It's Used

- Agency's own marketing website (to convert visitors into GHL clients)
- Future: Agency can offer to their clients for client websites

### Separate from GHL Embed

This is a **standalone module** with its own embed code, completely separate from the GHL customization embed script:

| GHL Embed Script | Social Proof Script |
|------------------|---------------------|
| Goes in GHL sub-account | Goes on agency's marketing site |
| Customizes menu, colors, login | Captures leads + shows notifications |
| One script for all sub-accounts | Different script per widget/campaign |
| `embed.js?key=rp_xxx` | `sp.js?key=sp_xxx` |

---

## User Stories

1. **As an agency owner**, I want to show social proof on my marketing site so visitors see others are signing up
2. **As an agency owner**, I want the widget to auto-capture form submissions so I don't have to set up integrations
3. **As an agency owner**, I want multiple widgets for different landing pages (dental vs roofing)
4. **As an agency owner**, I want to import historical customers via CSV so I have data from day one
5. **As an agency owner**, I want to manually add milestone events ("100th 5-star review")
6. **As a site visitor**, I want to dismiss the notification so it doesn't distract me

---

## MVP Scope

### In Scope
- [x] Auto-capture form submissions (email, phone, name, business name)
- [x] Separate standalone embed script (`sp.js`)
- [x] Manual event entry (for milestones)
- [x] CSV import with drag-drop and field mapping
- [x] 3-4 themes (Minimal, Glass, Custom colors)
- [x] URL targeting (show on specific pages)
- [x] Dismissible per session
- [x] Timing controls (display duration, gap between)
- [x] Position selection (bottom-left, bottom-right)
- [x] Multiple widgets per agency

### Out of Scope (Phase 2)
- [ ] Stripe integration
- [ ] GHL webhook integration
- [ ] Analytics dashboard (impressions, clicks)
- [ ] A/B testing themes
- [ ] Live visitor count
- [ ] Review aggregation from Google API

---

## Data Model

### New Tables

```sql
-- ============================================
-- SOCIAL_PROOF_WIDGETS TABLE
-- Widget configuration (one per campaign/landing page)
-- ============================================
CREATE TABLE social_proof_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,

  name TEXT NOT NULL,  -- "Dental Landing Page", "Roofing Campaign"
  token TEXT UNIQUE NOT NULL,  -- sp_abc123 (used in embed code)
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Display Settings
  theme TEXT NOT NULL DEFAULT 'minimal' CHECK (theme IN ('minimal', 'glass', 'custom')),
  position TEXT NOT NULL DEFAULT 'bottom-left' CHECK (position IN ('bottom-left', 'bottom-right', 'top-left', 'top-right')),

  -- Custom theme colors (only used when theme = 'custom')
  custom_colors JSONB DEFAULT '{
    "background": "#ffffff",
    "text": "#1f2937",
    "accent": "#3b82f6",
    "border": "#e5e7eb"
  }'::jsonb,

  -- Timing (in seconds)
  display_duration INTEGER NOT NULL DEFAULT 5 CHECK (display_duration BETWEEN 3 AND 10),
  gap_between INTEGER NOT NULL DEFAULT 3 CHECK (gap_between BETWEEN 2 AND 10),
  initial_delay INTEGER NOT NULL DEFAULT 3 CHECK (initial_delay BETWEEN 0 AND 30),

  -- Content Template
  show_first_name BOOLEAN NOT NULL DEFAULT true,
  show_city BOOLEAN NOT NULL DEFAULT true,
  show_business_name BOOLEAN NOT NULL DEFAULT false,  -- Alternative to first_name
  show_time_ago BOOLEAN NOT NULL DEFAULT true,
  time_ago_text TEXT DEFAULT 'ago',  -- "2 hours ago" vs "2 hours"

  -- URL Targeting
  url_mode TEXT NOT NULL DEFAULT 'all' CHECK (url_mode IN ('all', 'include', 'exclude')),
  url_patterns TEXT[] DEFAULT '{}',  -- Array of URL patterns

  -- Form Capture Settings
  form_selector TEXT,  -- Optional CSS selector, null = auto-detect
  capture_email BOOLEAN NOT NULL DEFAULT true,
  capture_phone BOOLEAN NOT NULL DEFAULT true,
  capture_business_name BOOLEAN NOT NULL DEFAULT true,

  -- Rotation Settings
  max_events_in_rotation INTEGER NOT NULL DEFAULT 20,
  randomize_order BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_social_proof_widgets_agency_id ON social_proof_widgets(agency_id);
CREATE INDEX idx_social_proof_widgets_token ON social_proof_widgets(token);
```

### Update Existing Table

The existing `social_proof_events` table needs updates:

```sql
-- Add widget_id to link events to specific widgets
ALTER TABLE social_proof_events
ADD COLUMN widget_id UUID REFERENCES social_proof_widgets(id) ON DELETE CASCADE;

-- Add source tracking
ALTER TABLE social_proof_events
ADD COLUMN source TEXT NOT NULL DEFAULT 'auto' CHECK (source IN ('auto', 'manual', 'csv', 'webhook', 'stripe'));

-- Add city field (from IP geolocation)
ALTER TABLE social_proof_events
ADD COLUMN city TEXT;

-- Add first_name field (separate from business_name)
ALTER TABLE social_proof_events
ADD COLUMN first_name TEXT;

-- Update event_type constraint to include more options
ALTER TABLE social_proof_events
DROP CONSTRAINT social_proof_events_event_type_check;

ALTER TABLE social_proof_events
ADD CONSTRAINT social_proof_events_event_type_check
CHECK (event_type IN (
  'signup',           -- "just signed up"
  'trial',            -- "just started their free trial"
  'demo',             -- "just requested a demo"
  'purchase',         -- "just subscribed" (future: Stripe)
  'review_milestone', -- "just got their 100th 5-star review"
  'lead_milestone',   -- "just got their 100th lead"
  'custom'            -- Agency-defined text
));

-- Add custom_text for custom event types
ALTER TABLE social_proof_events
ADD COLUMN custom_text TEXT;  -- "just downloaded our free guide"

-- Add display_time_override for CSV imports (show "recently" instead of real time)
ALTER TABLE social_proof_events
ADD COLUMN display_time_override TEXT;  -- null = use real time, or "recently"

CREATE INDEX idx_social_proof_events_widget_id ON social_proof_events(widget_id);
CREATE INDEX idx_social_proof_events_source ON social_proof_events(source);
```

### Updated TypeScript Types

```typescript
// types/social-proof.ts

export type SocialProofTheme = 'minimal' | 'glass' | 'custom';
export type SocialProofPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
export type SocialProofUrlMode = 'all' | 'include' | 'exclude';
export type SocialProofEventType = 'signup' | 'trial' | 'demo' | 'purchase' | 'review_milestone' | 'lead_milestone' | 'custom';
export type SocialProofEventSource = 'auto' | 'manual' | 'csv' | 'webhook' | 'stripe';

export interface SocialProofCustomColors {
  background: string;
  text: string;
  accent: string;
  border: string;
}

export interface SocialProofWidget {
  id: string;
  agency_id: string;
  name: string;
  token: string;
  is_active: boolean;

  // Display
  theme: SocialProofTheme;
  position: SocialProofPosition;
  custom_colors: SocialProofCustomColors;

  // Timing
  display_duration: number;
  gap_between: number;
  initial_delay: number;

  // Content
  show_first_name: boolean;
  show_city: boolean;
  show_business_name: boolean;
  show_time_ago: boolean;
  time_ago_text: string;

  // Targeting
  url_mode: SocialProofUrlMode;
  url_patterns: string[];

  // Form Capture
  form_selector: string | null;
  capture_email: boolean;
  capture_phone: boolean;
  capture_business_name: boolean;

  // Rotation
  max_events_in_rotation: number;
  randomize_order: boolean;

  created_at: string;
  updated_at: string;
}

export interface SocialProofEvent {
  id: string;
  agency_id: string;
  widget_id: string;

  event_type: SocialProofEventType;
  source: SocialProofEventSource;

  first_name: string | null;
  business_name: string;
  city: string | null;
  location: string | null;  // Legacy field

  custom_text: string | null;
  display_time_override: string | null;

  details: Record<string, unknown>;
  is_visible: boolean;

  created_at: string;
}

// Event type display text mapping
export const EVENT_TYPE_TEXT: Record<SocialProofEventType, string> = {
  signup: 'just signed up',
  trial: 'just started their free trial',
  demo: 'just requested a demo',
  purchase: 'just subscribed',
  review_milestone: '',  // Uses custom_text
  lead_milestone: '',    // Uses custom_text
  custom: '',            // Uses custom_text
};
```

---

## Auto-Capture Logic

### Form Detection Algorithm

```javascript
// sp.js - Form detection logic

function detectLeadForms() {
  const forms = document.querySelectorAll('form');
  const leadForms = [];

  forms.forEach(form => {
    const fields = {
      email: null,
      phone: null,
      name: null,
      firstName: null,
      lastName: null,
      businessName: null,
    };

    // Find email field
    const emailInput = form.querySelector(
      'input[type="email"], ' +
      'input[name*="email" i], ' +
      'input[id*="email" i], ' +
      'input[placeholder*="email" i]'
    );
    if (emailInput) fields.email = emailInput;

    // Find phone field
    const phoneInput = form.querySelector(
      'input[type="tel"], ' +
      'input[name*="phone" i], ' +
      'input[id*="phone" i], ' +
      'input[placeholder*="phone" i]'
    );
    if (phoneInput) fields.phone = phoneInput;

    // Find name fields
    const nameInput = form.querySelector(
      'input[name*="name" i]:not([name*="company" i]):not([name*="business" i]), ' +
      'input[id*="name" i]:not([id*="company" i]):not([id*="business" i]), ' +
      'input[placeholder*="name" i]:not([placeholder*="company" i])'
    );
    if (nameInput) fields.name = nameInput;

    // Find first name specifically
    const firstNameInput = form.querySelector(
      'input[name*="first" i], ' +
      'input[id*="first" i], ' +
      'input[placeholder*="first" i]'
    );
    if (firstNameInput) fields.firstName = firstNameInput;

    // Find business/company name
    const businessInput = form.querySelector(
      'input[name*="company" i], ' +
      'input[name*="business" i], ' +
      'input[id*="company" i], ' +
      'input[id*="business" i], ' +
      'input[placeholder*="company" i], ' +
      'input[placeholder*="business" i]'
    );
    if (businessInput) fields.businessName = businessInput;

    // Qualify as lead form if has (email OR phone) AND (name OR firstName)
    const hasContact = fields.email || fields.phone;
    const hasName = fields.name || fields.firstName;

    // Exclude login forms (has password field)
    const hasPassword = form.querySelector('input[type="password"]');

    // Exclude search forms (single input)
    const inputCount = form.querySelectorAll('input:not([type="hidden"]):not([type="submit"])').length;
    const isSearchForm = inputCount === 1;

    if (hasContact && hasName && !hasPassword && !isSearchForm) {
      leadForms.push({ form, fields });
    }
  });

  return leadForms;
}

function attachFormListeners(leadForms, config) {
  leadForms.forEach(({ form, fields }) => {
    form.addEventListener('submit', async (e) => {
      // Extract values
      const data = {
        first_name: fields.firstName?.value || fields.name?.value?.split(' ')[0] || null,
        email: fields.email?.value || null,
        phone: fields.phone?.value || null,
        business_name: fields.businessName?.value || null,
      };

      // Only send if we have meaningful data
      if (data.first_name || data.business_name) {
        await sendEvent(config.apiUrl, config.widgetToken, data);
      }
    });
  });
}

async function sendEvent(apiUrl, token, data) {
  try {
    await fetch(`${apiUrl}/api/social-proof/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        ...data,
        // IP geolocation happens server-side
      }),
    });
  } catch (err) {
    // Fail silently - don't break the form
    console.warn('[SocialProof] Failed to capture event:', err);
  }
}
```

### IP Geolocation (Server-Side)

When we receive a captured event, we use the request IP to get city:

```typescript
// Using free ip-api.com service (45 req/min free)
// Or ipinfo.io (50k/month free)

async function getCityFromIP(ip: string): Promise<string | null> {
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=city`);
    const data = await res.json();
    return data.city || null;
  } catch {
    return null;
  }
}
```

---

## API Endpoints

### Widget Management

```
GET    /api/social-proof/widgets          - List all widgets for agency
POST   /api/social-proof/widgets          - Create new widget
GET    /api/social-proof/widgets/[id]     - Get widget details
PATCH  /api/social-proof/widgets/[id]     - Update widget
DELETE /api/social-proof/widgets/[id]     - Delete widget
```

### Event Management

```
GET    /api/social-proof/events?widget_id=xxx  - List events for widget
POST   /api/social-proof/events                - Create manual event
PATCH  /api/social-proof/events/[id]           - Update event (toggle visibility)
DELETE /api/social-proof/events/[id]           - Delete event
POST   /api/social-proof/events/import         - CSV import
```

### Public Endpoints (for embed script)

```
POST   /api/social-proof/capture          - Auto-capture form submission
GET    /api/social-proof/config?key=sp_x  - Get widget config + recent events
```

---

## UI Components

### Dashboard Page: `/app/(dashboard)/social-proof/page.tsx`

```
Social Proof Widgets
├── Page Header: "Social Proof" + [+ New Widget] button
├── Widgets Grid (3 columns)
│   └── Widget Card
│       ├── Name + Status badge (Active/Paused)
│       ├── Stats: "47 events • 12 today"
│       ├── Theme preview thumbnail
│       └── Actions: Edit, Duplicate, Delete
└── Empty State: "Create your first widget"
```

### Widget Editor: `/app/(dashboard)/social-proof/[id]/page.tsx`

```
Edit Widget: "Dental Landing Page"
├── Tabs: [Settings] [Events] [Embed Code]
│
├── Settings Tab
│   ├── Basic Info
│   │   ├── Widget Name
│   │   └── Active toggle
│   │
│   ├── Appearance
│   │   ├── Theme selector (Minimal, Glass, Custom)
│   │   ├── Position (4 corners, visual picker)
│   │   ├── Custom colors (if theme = custom)
│   │   │   ├── Background
│   │   │   ├── Text
│   │   │   ├── Accent
│   │   │   └── Border
│   │   └── Live preview panel
│   │
│   ├── Timing
│   │   ├── Display duration slider (3-10s)
│   │   ├── Gap between slider (2-10s)
│   │   └── Initial delay slider (0-30s)
│   │
│   ├── Content Display
│   │   ├── Show first name (toggle, default on)
│   │   ├── Show city (toggle, default on)
│   │   ├── Show business name (toggle, default off)
│   │   ├── Show time ago (toggle, default on)
│   │   └── Template preview: "John from Austin just signed up • 2 hours ago"
│   │
│   ├── URL Targeting
│   │   ├── Show on: All pages / Specific pages / All except
│   │   └── URL patterns list (add/remove)
│   │
│   └── Form Capture
│       ├── Auto-detect forms (default)
│       └── Or specify CSS selector
│
├── Events Tab
│   ├── Toolbar
│   │   ├── [+ Add Event] (manual milestone)
│   │   ├── [Import CSV]
│   │   └── Filter: All / Auto / Manual / CSV
│   │
│   ├── Events Table
│   │   ├── Columns: Name, City, Type, Source, Time, Visible
│   │   ├── Toggle visibility per event
│   │   └── Delete event
│   │
│   └── Empty State: "Events will appear here when captured"
│
└── Embed Code Tab
    ├── Script tag with copy button
    ├── Instructions accordion
    │   ├── Where to paste
    │   ├── What it does
    │   └── Testing tips
    └── Preview button (opens in new tab)
```

### CSV Import Modal

```
Import Events from CSV
├── Drag & drop zone OR [Browse files]
├── File selected: "customers.csv" (47 rows)
│
├── Column Mapping
│   ┌─────────────────────────────────────────┐
│   │ Your Column      →    Map To            │
│   ├─────────────────────────────────────────┤
│   │ "customer_name"  →    [First Name ▼]    │
│   │ "city"           →    [City ▼]          │
│   │ "company"        →    [Business Name ▼] │
│   │ "signup_date"    →    [Skip ▼]          │
│   └─────────────────────────────────────────┘
│
├── Event Type for all: [Signed up ▼]
│   Or: [ ] Map from column: [type ▼]
│
├── Time Display
│   ○ Show as "recently" (recommended for old data)
│   ○ Use actual dates (may show "3 months ago")
│
├── Preview (first 3 rows)
│   • John from Austin just signed up • recently
│   • Sarah from Denver just signed up • recently
│   • Mike from Portland just signed up • recently
│
└── [Cancel] [Import 47 Events]
```

### Manual Event Modal

```
Add Milestone Event
├── Event Type: [Review Milestone ▼]
│
├── Display Text: "just got their 100th 5-star review"
│   (or auto-filled based on type)
│
├── Name to Display
│   ○ First name: [John]
│   ○ Business name: [Bill's Plumbing]
│
├── City: [Austin]
│
├── Preview
│   "Bill's Plumbing from Austin just got their 100th 5-star review"
│
└── [Cancel] [Add Event]
```

---

## Embed Script (`sp.js`)

### Script URL
```
https://app.agencytoolkit.com/sp.js?key=sp_abc123
```

### Script Behavior

```javascript
(function() {
  // 1. Parse widget token from script src
  const scriptTag = document.currentScript;
  const token = new URL(scriptTag.src).searchParams.get('key');

  // 2. Fetch config + events
  const config = await fetch(`/api/social-proof/config?key=${token}`);

  // 3. Check URL targeting
  if (!matchesUrlRules(config.url_mode, config.url_patterns)) {
    return; // Don't show on this page
  }

  // 4. Detect and attach to forms (for auto-capture)
  const leadForms = detectLeadForms();
  attachFormListeners(leadForms, config);

  // 5. Inject notification container + styles
  injectStyles(config.theme, config.custom_colors);
  createNotificationContainer(config.position);

  // 6. Start rotation after initial delay
  setTimeout(() => {
    startEventRotation(config.events, config);
  }, config.initial_delay * 1000);

  // 7. Handle dismiss (store in sessionStorage)
  window.__SP_DISMISSED__ = sessionStorage.getItem('sp_dismissed') === 'true';
})();

function startEventRotation(events, config) {
  if (window.__SP_DISMISSED__) return;

  let queue = config.randomize_order
    ? shuffleArray([...events])
    : [...events];
  let index = 0;

  function showNext() {
    if (window.__SP_DISMISSED__ || index >= queue.length) {
      // Reset queue and continue
      queue = config.randomize_order ? shuffleArray([...events]) : [...events];
      index = 0;
    }

    const event = queue[index++];
    showNotification(event, config);

    // Schedule next after display + gap
    setTimeout(showNext, (config.display_duration + config.gap_between) * 1000);
  }

  showNext();
}

function showNotification(event, config) {
  const notification = document.getElementById('sp-notification');

  // Build content
  const name = config.show_business_name && event.business_name
    ? event.business_name
    : event.first_name;
  const city = config.show_city && event.city ? ` from ${event.city}` : '';
  const action = event.custom_text || EVENT_TYPE_TEXT[event.event_type];
  const time = config.show_time_ago
    ? formatTimeAgo(event.display_time_override || event.created_at, config.time_ago_text)
    : '';

  notification.innerHTML = `
    <div class="sp-content">
      <div class="sp-main">${name}${city}</div>
      <div class="sp-action">${action}</div>
      ${time ? `<div class="sp-time">${time}</div>` : ''}
    </div>
    <button class="sp-close" onclick="dismissSocialProof()">×</button>
  `;

  // Animate in
  notification.classList.add('sp-visible');

  // Animate out after duration
  setTimeout(() => {
    notification.classList.remove('sp-visible');
  }, config.display_duration * 1000);
}

function dismissSocialProof() {
  window.__SP_DISMISSED__ = true;
  sessionStorage.setItem('sp_dismissed', 'true');
  document.getElementById('sp-notification').classList.remove('sp-visible');
}
```

---

## Themes

### Minimal Theme
```css
.sp-notification.sp-minimal {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  padding: 12px 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.sp-minimal .sp-main {
  font-weight: 600;
  color: #1f2937;
}

.sp-minimal .sp-action {
  color: #6b7280;
  font-size: 14px;
}

.sp-minimal .sp-time {
  color: #9ca3af;
  font-size: 12px;
  margin-top: 4px;
}
```

### Glass Theme
```css
.sp-notification.sp-glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 14px 18px;
}

.sp-glass .sp-main {
  font-weight: 600;
  color: #1f2937;
}

.sp-glass .sp-action {
  color: #4b5563;
  font-size: 14px;
}

.sp-glass .sp-time {
  color: #6b7280;
  font-size: 12px;
  margin-top: 4px;
}
```

### Custom Theme
Uses colors from `custom_colors` field, applies to same structure.

---

## File Structure

```
app/
├── (dashboard)/
│   └── social-proof/
│       ├── page.tsx                    # Widgets list
│       ├── [id]/
│       │   └── page.tsx                # Widget editor
│       ├── _components/
│       │   ├── widget-card.tsx
│       │   ├── widget-form.tsx
│       │   ├── theme-selector.tsx
│       │   ├── position-picker.tsx
│       │   ├── timing-controls.tsx
│       │   ├── url-targeting.tsx
│       │   ├── events-table.tsx
│       │   ├── add-event-dialog.tsx
│       │   ├── csv-import-dialog.tsx
│       │   ├── embed-code-display.tsx
│       │   └── notification-preview.tsx
│       └── _actions/
│           └── social-proof-actions.ts
│
├── api/
│   └── social-proof/
│       ├── widgets/
│       │   ├── route.ts                # GET, POST
│       │   └── [id]/route.ts           # GET, PATCH, DELETE
│       ├── events/
│       │   ├── route.ts                # GET, POST
│       │   ├── [id]/route.ts           # PATCH, DELETE
│       │   └── import/route.ts         # POST (CSV)
│       ├── capture/route.ts            # POST (auto-capture)
│       └── config/route.ts             # GET (public, for embed)
│
└── sp.js/
    └── route.ts                        # Dynamic JavaScript embed script

lib/
├── social-proof/
│   ├── tokens.ts                       # Generate sp_xxx tokens
│   ├── geolocation.ts                  # IP to city lookup
│   └── csv-parser.ts                   # CSV parsing + validation
└── constants.ts                        # Add EVENT_TYPE_TEXT

types/
└── social-proof.ts                     # TypeScript types
```

---

## Implementation Order

1. **Database**: Run migrations for new table + updates
2. **Types**: Add TypeScript types
3. **API - Widgets**: CRUD endpoints for widget management
4. **API - Events**: CRUD + CSV import
5. **API - Config**: Public endpoint for embed script
6. **API - Capture**: Auto-capture endpoint with IP geolocation
7. **Dashboard - List**: Widget cards grid
8. **Dashboard - Editor**: Settings tab (theme, timing, targeting)
9. **Dashboard - Events**: Events tab with table + dialogs
10. **Dashboard - Embed**: Embed code tab
11. **Embed Script**: `sp.js` with auto-capture + notification display
12. **Testing**: End-to-end flow

---

## Acceptance Criteria

### Widget Management
- [ ] Agency can create multiple widgets
- [ ] Each widget has unique token (sp_xxx)
- [ ] Can toggle widget active/inactive
- [ ] Can delete widget (cascades to events)

### Auto-Capture
- [ ] Script detects forms with email/phone + name fields
- [ ] Form submissions are captured without breaking form
- [ ] City is resolved from IP address
- [ ] Events appear in dashboard within seconds

### Manual Entry
- [ ] Can add milestone events with custom text
- [ ] Can choose first name OR business name display
- [ ] Event appears in rotation immediately

### CSV Import
- [ ] Drag and drop file upload
- [ ] Column mapping UI for non-standard headers
- [ ] Preview before import
- [ ] Option to show "recently" instead of old dates
- [ ] Success message with count

### Display
- [ ] Notifications appear in configured position
- [ ] Timing controls work (delay, duration, gap)
- [ ] Events rotate (randomized or sequential)
- [ ] Close button dismisses for session
- [ ] URL targeting respects include/exclude rules

### Themes
- [ ] Minimal theme looks clean and modern
- [ ] Glass theme has blur effect
- [ ] Custom theme uses agency's colors
- [ ] All themes are responsive

---

## Open Questions (Resolved)

| Question | Decision |
|----------|----------|
| Where is widget embedded? | Agency's marketing site (separate from GHL) |
| How are events captured? | Auto-capture from forms (primary) |
| What about Stripe/webhooks? | Phase 2 |
| Widget limit? | 5 Toolkit / Unlimited Pro |
| Dismissible behavior? | Per session (sessionStorage) |
| IP geolocation? | Yes, server-side, free API |
| Historical data? | CSV import with field mapping |
| Milestones? | Manual entry with custom text |
