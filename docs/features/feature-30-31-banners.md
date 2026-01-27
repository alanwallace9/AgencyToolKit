# Features 30-31: Banners Builder & Embed

**Status:** Ready for Implementation
**Priority:** 2 (After Smart Tips)
**Estimated Sessions:** 2
**Dependencies:** F22 (Tours in Embed), F23 (Tour Themes)
**Blocks:** None
**Reference:** [Usetiful Banners](https://help.usetiful.com/support/solutions/articles/77000553186-banners-in-app-announcements), [ProductFruits Banners](https://help.productfruits.com/en/article/banners-overview)

---

## Overview

Banners are in-app announcement bars that communicate with subaccount users. Unlike floating modals, **banners push page content** rather than overlaying it, ensuring users can still interact with their dashboard while seeing important messages.

**Perfect for:**
- Trial expiration warnings ("Your trial ends in 3 days")
- Holiday promotions and sales
- New feature announcements
- Maintenance notices
- Upsell messages
- Urgent system alerts

**Key Differentiator:** Banners can trigger checklists and tours, not just navigate to URLs.

---

## User Stories

1. **As an agency owner**, I want to create announcement banners so I can communicate with my subaccount users.
2. **As an agency owner**, I want to schedule banners for specific date ranges (e.g., holiday promo Dec 20-31).
3. **As an agency owner**, I want banners to show only on specific pages (e.g., dashboard only).
4. **As an agency owner**, I want to notify users when their trial is almost over with automated banners.
5. **As an agency owner**, I want banner action buttons to start a checklist or tour, not just open URLs.
6. **As an agency owner**, I want users to be able to dismiss banners without losing page content.
7. **As an agency owner**, I want to see analytics on banner views, clicks, and dismissals.

---

## Acceptance Criteria

### Builder
- [ ] Banners list shows all banners with status (draft/live/archived/scheduled)
- [ ] 3-panel builder layout: Banner List | Settings Panel | Live Preview
- [ ] Can create banners with content, style, position, and optional action
- [ ] Actions: Open URL, Start Tour, Start Checklist, Dismiss
- [ ] Can schedule banners for future date ranges with timezone support
- [ ] Can target specific pages with URL patterns
- [ ] Can target specific customers
- [ ] Live preview updates in real-time as you edit

### Embed Behavior
- [ ] Banners appear at top or bottom of page
- [ ] **Inline mode** (default): Banner pushes page content down/up (not overlay)
- [ ] **Float mode**: Banner floats over content with shadow
- [ ] Dismissible banners remember dismissal (sessionStorage or localStorage)
- [ ] Schedule-aware: Only shows within date range
- [ ] Multiple banners stack by priority

### Special Features
- [ ] **Trial Expiration Banners**: Dynamic text with days remaining
- [ ] Style presets: Info (blue), Success (green), Warning (yellow), Error (red), Custom (theme)
- [ ] Theme integration: Custom style uses tour_themes colors

---

## UI Design

### Banners List Page (`/tours/banners`)

Following the card-based pattern from ToursClient, banners appear as a card on the main tours page:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  BANNERS                                                        [+ Create]   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Holiday Sale - 20% Off!                                    🟢 Live     │  │
│  │ Top · Info style · Dec 20 - Dec 31                                 ... │  │
│  │ 👁 145 views  · 23 clicks · 89 dismissed                               │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ System Maintenance Notice                                🟡 Scheduled  │  │
│  │ Top · Warning style · Jan 15, 2am-6am                              ... │  │
│  │ Starts in 3 days                                                       │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Trial Expiring Soon                                        🟡 Draft    │  │
│  │ Top · Warning style · Auto (trial users)                           ... │  │
│  │ Shows when trial < 7 days remaining                                    │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Banner Builder (`/tours/banners/[id]`) - 3-Panel Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ← Back    Holiday Sale Banner  ⚙ Settings   All changes saved     [PUBLISH] │
├──────────────────────────────────────────────────────────────────────────────┤
│                          │                            │                      │
│  CONTENT              << │  BANNER SETTINGS        ✕ │   LIVE PREVIEW       │
│  ─────────────────────── │  ────────────────────────  │   ──────────────     │
│                          │                            │                      │
│  Banner Text             │  Position                  │   ┌──────────────┐   │
│  ┌────────────────────┐  │  ○ Top (push content down) │   │🎄 Holiday... │   │
│  │ 🎄 Holiday Sale -  │  │  ○ Bottom (push content)   │   │  [Learn More]│✕  │
│  │ 20% off all serv.. │  │                            │   ├──────────────┤   │
│  └────────────────────┘  │  Display Mode              │   │              │   │
│                          │  ● Inline (pushes content) │   │  (Dashboard  │   │
│  ─────────────────────── │  ○ Float (over content)    │   │   mockup)    │   │
│                          │                            │   │              │   │
│  ACTION BUTTON           │  Style Preset              │   │              │   │
│  [✓] Include button      │  ┌─────┐┌─────┐┌─────┐    │   └──────────────┘   │
│                          │  │Info ││Succ ││Warn │    │                      │
│  Button Text             │  │ ████││ ████││ ████│    │                      │
│  ┌────────────────────┐  │  └──▲──┘└─────┘└─────┘    │                      │
│  │ Learn More         │  │                            │                      │
│  └────────────────────┘  │  ┌─────┐┌─────┐            │                      │
│                          │  │Error││Custom│            │                      │
│  On Click                │  │ ████││ ████│            │                      │
│  ┌────────────────────┐  │  └─────┘└─────┘            │                      │
│  │ Open URL         ▼ │  │                            │                      │
│  └────────────────────┘  │  ─────────────────────────  │                      │
│                          │                            │                      │
│  URL                     │  DISMISSIBLE               │                      │
│  ┌────────────────────┐  │  [✓] Allow users to        │                      │
│  │ /holiday-sale      │  │      dismiss this banner   │                      │
│  └────────────────────┘  │                            │                      │
│  [ ] Open in new tab     │  Remember dismissal:       │                      │
│                          │  ○ This session only       │                      │
│  ─────────────────────── │  ● Permanently (30 days)   │                      │
│                          │                            │                      │
│  ADVANCED                │                            │                      │
│  [▶] Whole banner        │                            │                      │
│      clickable           │                            │                      │
│                          │                            │                      │
└──────────────────────────┴────────────────────────────┴──────────────────────┘
```

### Settings Panel (Sheet - triggered by ⚙ button)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  BANNER SETTINGS                                                          ✕  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  GENERAL                                                                     │
│  ──────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  Internal Name (for your reference)                                          │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Holiday Sale - December 2026                                          │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ──────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  SCHEDULE                                                                    │
│  ──────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  When should this banner be active?                                          │
│  ○ Always (until manually archived)                                          │
│  ● Specific date range                                                       │
│                                                                              │
│  Start Date                        End Date                                  │
│  ┌──────────────────────────┐     ┌──────────────────────────┐              │
│  │ 📅 Dec 20, 2026          │     │ 📅 Dec 31, 2026          │              │
│  └──────────────────────────┘     └──────────────────────────┘              │
│                                                                              │
│  Start Time                        End Time                                  │
│  ┌──────────────────────────┐     ┌──────────────────────────┐              │
│  │ 12:00 AM                 │     │ 11:59 PM                 │              │
│  └──────────────────────────┘     └──────────────────────────┘              │
│                                                                              │
│  Timezone                                                                    │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ User's local timezone (recommended)                                  ▼ │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ──────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  PAGE TARGETING                                                              │
│  ──────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  Show on pages                                                               │
│  ○ All pages                                                                 │
│  ● Specific pages only                                                       │
│  ○ All pages EXCEPT certain pages                                            │
│                                                                              │
│  URL Patterns                                                    [+ Add]     │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  [contains ▼] [/dashboard]                                        [🗑️] │  │
│  │  ✓ Matches any URL containing /dashboard                               │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ──────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  CUSTOMER TARGETING                                                          │
│  ──────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  Show to customers                                                           │
│  ○ All customers                                                             │
│  ● Specific customers only                                                   │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ [✓] Tester Account                                                    │  │
│  │ [✓] Acme Corp                                                         │  │
│  │ [ ] Bob's Business                                                    │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ──────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  PRIORITY                                                                    │
│  ──────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  When multiple banners are active, show this banner:                         │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Normal priority (in order created)                                   ▼ │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│  Options: High (always first), Normal (by creation), Low (last)              │
│                                                                              │
│  [ ] Only show this banner (hide other active banners)                       │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Action Types

| Action | Behavior | Use Case |
|--------|----------|----------|
| **Open URL** | Navigate to specified URL | Promo pages, external links |
| **Start Tour** | Launch a specific tour (Driver.js) | Feature education |
| **Start Checklist** | **Opens the floating checklist widget** on current page | Onboarding prompts |
| **Dismiss Only** | Just close the banner (no navigation) | Informational banners |

> **Note:** "Start Checklist" expands the checklist widget on the current page (like clicking the manila tab). It does NOT navigate to a different URL.

### Action Configuration

```
On Click Action
┌────────────────────────────────────────────────────────────────────────┐
│ Open URL                                                             ▼ │
└────────────────────────────────────────────────────────────────────────┘

[If Open URL selected:]
URL
┌────────────────────────────────────────────────────────────────────────┐
│ https://example.com/holiday-sale                                       │
└────────────────────────────────────────────────────────────────────────┘
[ ] Open in new tab

[If Start Tour selected:]
Select Tour
┌────────────────────────────────────────────────────────────────────────┐
│ Welcome Tour                                                         ▼ │
└────────────────────────────────────────────────────────────────────────┘

[If Start Checklist selected:]
Select Checklist
┌────────────────────────────────────────────────────────────────────────┐
│ Getting Started Checklist                                            ▼ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Trial Expiration Banners (Special Banner Type)

Trial expiration banners are **built in the Banners tab** like regular banners, but have a special "Trial Expiration" type that enables dynamic triggers. The banner is **activated/deactivated in Settings**.

### How It Works

1. **Create**: User creates a banner in `/tours/banners` and selects "Trial Expiration" as the banner type
2. **Design**: User designs the banner like any other (text, style, action button)
3. **Triggers**: Special trigger settings appear for trial-type banners (days remaining threshold)
4. **Activate**: User enables/disables in Settings page (`/settings` > Trial Banner toggle)

### Banner Builder (Trial Type Selected)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  BANNER TYPE                                                                 │
│  ──────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  ○ Standard Banner (manual schedule)                                         │
│  ● Trial Expiration Banner (auto-triggers based on trial status)             │
│                                                                              │
│  ──────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  TRIAL TRIGGERS                                                              │
│  ──────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  Show when trial has:                                                        │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ 7                                                                      │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│  or fewer days remaining                                                     │
│                                                                              │
│  ──────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  CONTENT                                                                     │
│  ──────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  Banner Text (use {{days}} for dynamic count)                                │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Your trial ends in {{days}} days. Upgrade now to keep access!          │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Preview: "Your trial ends in 3 days. Upgrade now to keep access!"           │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Settings Page (Activation)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  TRIAL BANNER                                                                │
│  ──────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  [✓] Enable trial expiration banner                                          │
│                                                                              │
│  Using: "Trial Ending Soon" banner                              [Edit Banner]│
│  Shows when trial has 7 or fewer days remaining                              │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Dynamic Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{days}}` | Days remaining in trial | "3" |
| `{{customer_name}}` | Customer's name | "Acme Corp" |
| `{{agency_name}}` | Agency's name | "Marketing Pro" |

---

## Style Presets

Display as **visual color swatches** (clickable rectangles), not a dropdown:

```
Style Preset
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│  ████   │ │  ████   │ │  ████   │ │  ████   │ │  ████   │
│  Info   │ │ Success │ │ Warning │ │  Error  │ │ Custom  │
│  blue   │ │  green  │ │  amber  │ │   red   │ │  theme  │
└────▲────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
     └── Selected (highlighted border)
```

| Preset | Background | Text | Icon | Use Case |
|--------|------------|------|------|----------|
| **Info** | `#3B82F6` (blue) | White | ℹ️ | General announcements |
| **Success** | `#10B981` (green) | White | ✓ | Positive updates |
| **Warning** | `#F59E0B` (amber) | Dark | ⚠️ | Trial warnings, maintenance |
| **Error** | `#EF4444` (red) | White | ✕ | Critical alerts |
| **Custom** | Theme primary | Theme text | None | Brand-aligned |

### Custom Style (Theme Integration)

When "Custom" is selected, banner uses colors from selected tour theme:
- Background: `theme.primary_color`
- Text: `theme.text_color`
- Button: `theme.button_bg` / `theme.button_text`

---

## Display Modes

### Inline Mode (Default) - Pushes Content

```
┌────────────────────────────────────────────────────────────────────────┐
│ 🎄 Holiday Sale - 20% off through Dec 31!   [Shop Now]              ✕ │  ← Banner
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│                        Dashboard Content                               │  ← Pushed down
│                                                                        │
│                     (normal page, not covered)                         │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

**Implementation:**
```css
.at-banner-inline-top {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
}

body {
  padding-top: [banner-height]px !important;
}
```

### Float Mode - Over Content

```
┌────────────────────────────────────────────────────────────────────────┐
│ 🎄 Holiday Sale - 20% off through Dec 31!   [Shop Now]              ✕ │  ← Floating
├────────────────────────────────────────────────────────────────────────┤  ← Shadow
│                                                                        │
│                        Dashboard Content                               │  ← May be partially
│                                                                        │     covered at top
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

**Implementation:**
```css
.at-banner-float-top {
  position: fixed;
  top: 10px;
  left: 10px;
  right: 10px;
  z-index: 9999;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
/* No body padding adjustment */
```

---

## Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `banners-card.tsx` | `tours/_components/` | Card on tours page with create dialog |
| `banner-builder.tsx` | `tours/banners/[id]/_components/` | Main 3-panel builder |
| `banner-content-panel.tsx` | `tours/banners/[id]/_components/` | Left - text and action config |
| `banner-settings-panel.tsx` | `tours/banners/[id]/_components/` | Center - style/position/dismiss |
| `banner-preview.tsx` | `tours/banners/[id]/_components/` | Right - live preview |
| `banner-full-settings.tsx` | `tours/banners/[id]/_components/` | Sheet - schedule/targeting |

---

## Database

### Table: `banners`

```sql
CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,

  -- Basic info
  name TEXT NOT NULL,               -- Internal reference name
  banner_type TEXT NOT NULL DEFAULT 'standard' CHECK (banner_type IN ('standard', 'trial_expiration')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'archived', 'scheduled')),

  -- Content
  content TEXT NOT NULL,            -- Banner text (supports emojis and variables like {{days}})

  -- Action button (optional)
  action JSONB,
  -- {
  --   enabled: boolean,
  --   label: string,
  --   type: 'url' | 'tour' | 'checklist' | 'dismiss',
  --   url?: string,
  --   tour_id?: string,
  --   checklist_id?: string,
  --   new_tab?: boolean,
  --   whole_banner_clickable?: boolean
  -- }

  -- Style
  position TEXT NOT NULL DEFAULT 'top' CHECK (position IN ('top', 'bottom')),
  display_mode TEXT NOT NULL DEFAULT 'inline' CHECK (display_mode IN ('inline', 'float')),
  style_preset TEXT NOT NULL DEFAULT 'info' CHECK (style_preset IN ('info', 'success', 'warning', 'error', 'custom')),
  theme_id UUID REFERENCES tour_themes(id),  -- For 'custom' style

  -- Dismissibility
  dismissible BOOLEAN DEFAULT true,
  dismiss_duration TEXT DEFAULT 'session' CHECK (dismiss_duration IN ('session', 'permanent')),  -- session = sessionStorage, permanent = localStorage 30d

  -- Priority (for multiple banners)
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('high', 'normal', 'low')),
  exclusive BOOLEAN DEFAULT false,  -- If true, hides other banners when this shows

  -- Targeting
  targeting JSONB DEFAULT '{
    "url_mode": "all",
    "url_patterns": [],
    "customer_mode": "all",
    "customer_ids": []
  }',

  -- Schedule (for standard banners)
  schedule JSONB DEFAULT '{
    "mode": "always",
    "start_date": null,
    "end_date": null,
    "start_time": null,
    "end_time": null,
    "timezone": "user"
  }',

  -- Trial triggers (for trial_expiration type)
  trial_triggers JSONB DEFAULT '{
    "days_remaining": 7
  }',

  -- Analytics
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  dismiss_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_banners_agency_status ON banners(agency_id, status);
CREATE INDEX idx_banners_schedule ON banners(agency_id) WHERE status IN ('live', 'scheduled');
```

### Trial Banner Activation (in agencies table)

The trial banner is **designed in the Banners tab** but **activated in Settings**:

```sql
-- Add to agencies.settings JSONB:
{
  "trial_banner": {
    "enabled": true,
    "banner_id": "uuid-of-trial-banner"  -- References the banner created in Banners tab
  }
}
```

When `enabled: true`, the embed script looks for banners with `banner_type = 'trial_expiration'` and evaluates their `trial_triggers.days_remaining` against the customer's trial status.

---

## API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/banners` | List banners (with status filter) |
| POST | `/api/banners` | Create banner |
| GET | `/api/banners/[id]` | Get banner |
| PATCH | `/api/banners/[id]` | Update banner |
| DELETE | `/api/banners/[id]` | Delete banner |
| POST | `/api/banners/[id]/publish` | Set status to live |
| POST | `/api/banners/[id]/archive` | Set status to archived |
| POST | `/api/banners/[id]/duplicate` | Clone banner |

### Track API (for embed script)

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/track/banner` | Track view/click/dismiss events |

---

## Embed Script Changes

### Banner Injection

```javascript
function initBanners(banners, customerToken) {
  // Filter to active banners
  const activeBanners = banners.filter(b => shouldShowBanner(b, customerToken));

  // Sort by priority
  activeBanners.sort((a, b) => {
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // Check for exclusive banner
  const exclusiveBanner = activeBanners.find(b => b.exclusive);
  const bannersToShow = exclusiveBanner ? [exclusiveBanner] : activeBanners;

  // Render banners
  bannersToShow.forEach(banner => renderBanner(banner));
}

function shouldShowBanner(banner, customerToken) {
  // Check status
  if (!['live', 'scheduled'].includes(banner.status)) return false;

  // Check schedule
  if (banner.schedule.mode === 'range') {
    const now = new Date();
    const start = banner.schedule.start_date ? new Date(banner.schedule.start_date) : null;
    const end = banner.schedule.end_date ? new Date(banner.schedule.end_date) : null;
    if (start && now < start) return false;
    if (end && now > end) return false;
  }

  // Check URL targeting
  if (!matchesUrlTargeting(banner.targeting, window.location.href)) return false;

  // Check customer targeting
  if (!matchesCustomerTargeting(banner.targeting, customerToken)) return false;

  // Check dismissal
  if (banner.dismissible) {
    const storageKey = `at_banner_dismissed_${banner.id}`;
    if (banner.dismiss_duration === 'permanent') {
      if (localStorage.getItem(storageKey)) return false;
    } else {
      if (sessionStorage.getItem(storageKey)) return false;
    }
  }

  return true;
}

function renderBanner(banner) {
  const el = document.createElement('div');
  el.id = `at-banner-${banner.id}`;
  el.className = `at-banner at-banner-${banner.position} at-banner-${banner.display_mode} at-banner-${banner.style_preset}`;

  // Apply theme colors for custom style
  if (banner.style_preset === 'custom' && banner.theme) {
    el.style.setProperty('--at-banner-bg', banner.theme.primary_color);
    el.style.setProperty('--at-banner-text', banner.theme.text_color);
  }

  const actionHtml = banner.action?.enabled
    ? `<button class="at-banner-action" data-action='${JSON.stringify(banner.action)}'>${banner.action.label}</button>`
    : '';

  const dismissHtml = banner.dismissible
    ? '<button class="at-banner-dismiss" aria-label="Dismiss">✕</button>'
    : '';

  el.innerHTML = `
    <div class="at-banner-content">
      <span class="at-banner-text">${sanitizeHTML(banner.content)}</span>
      ${actionHtml}
    </div>
    ${dismissHtml}
  `;

  // Insert and adjust padding for inline mode
  if (banner.position === 'top') {
    document.body.prepend(el);
    if (banner.display_mode === 'inline') {
      document.body.style.paddingTop = `${el.offsetHeight}px`;
    }
  } else {
    document.body.append(el);
    if (banner.display_mode === 'inline') {
      document.body.style.paddingBottom = `${el.offsetHeight}px`;
    }
  }

  // Track view
  trackBannerEvent(banner.id, 'view');

  // Handle action click
  if (banner.action?.enabled) {
    const actionEl = banner.action.whole_banner_clickable ? el : el.querySelector('.at-banner-action');
    actionEl.addEventListener('click', () => {
      trackBannerEvent(banner.id, 'click');
      handleBannerAction(banner.action);
    });
  }

  // Handle dismiss
  if (banner.dismissible) {
    el.querySelector('.at-banner-dismiss').addEventListener('click', () => {
      const storageKey = `at_banner_dismissed_${banner.id}`;
      if (banner.dismiss_duration === 'permanent') {
        localStorage.setItem(storageKey, Date.now().toString());
      } else {
        sessionStorage.setItem(storageKey, 'true');
      }
      trackBannerEvent(banner.id, 'dismiss');
      el.remove();
      // Reset padding
      if (banner.display_mode === 'inline') {
        document.body.style[banner.position === 'top' ? 'paddingTop' : 'paddingBottom'] = '';
      }
    });
  }
}

function handleBannerAction(action) {
  switch (action.type) {
    case 'url':
      if (action.new_tab) {
        window.open(action.url, '_blank');
      } else {
        window.location.href = action.url;
      }
      break;
    case 'tour':
      if (window.__AGENCY_TOOLKIT__?.startTour) {
        window.__AGENCY_TOOLKIT__.startTour(action.tour_id);
      }
      break;
    case 'checklist':
      if (window.__AGENCY_TOOLKIT__?.openChecklist) {
        window.__AGENCY_TOOLKIT__.openChecklist(action.checklist_id);
      }
      break;
    case 'dismiss':
      // Handled by dismiss logic
      break;
  }
}
```

### Banner CSS

```css
/* Base banner styles */
.at-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  z-index: 99999;
}

/* Position */
.at-banner-top {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
}

.at-banner-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}

/* Display mode */
.at-banner-float {
  margin: 10px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.at-banner-float.at-banner-top {
  left: 10px;
  right: 10px;
  top: 10px;
}

.at-banner-float.at-banner-bottom {
  left: 10px;
  right: 10px;
  bottom: 10px;
}

/* Style presets */
.at-banner-info {
  background: #3B82F6;
  color: white;
}

.at-banner-success {
  background: #10B981;
  color: white;
}

.at-banner-warning {
  background: #F59E0B;
  color: #1F2937;
}

.at-banner-error {
  background: #EF4444;
  color: white;
}

.at-banner-custom {
  background: var(--at-banner-bg, #3B82F6);
  color: var(--at-banner-text, white);
}

/* Content layout */
.at-banner-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  justify-content: center;
}

.at-banner-action {
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 4px;
  padding: 6px 12px;
  color: inherit;
  cursor: pointer;
  font-weight: 500;
  white-space: nowrap;
}

.at-banner-action:hover {
  background: rgba(255,255,255,0.3);
}

.at-banner-dismiss {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 4px 8px;
  margin-left: 8px;
  opacity: 0.7;
}

.at-banner-dismiss:hover {
  opacity: 1;
}
```

---

## Implementation Order

1. **Database migration** - Create/update `banners` table with new fields
2. **Server actions** - CRUD operations + publish/archive
3. **Banners card** - Add to tours page with create dialog
4. **Builder layout** - 3-panel design following checklist pattern
5. **Content panel** - Text editor, action configuration
6. **Settings panel** - Position, display mode, style preset, dismissibility
7. **Preview panel** - Live preview with GHL mockup
8. **Full settings sheet** - Schedule, targeting, priority
9. **API routes** - CRUD + tracking endpoint
10. **Embed script** - Banner rendering with all features
11. **Analytics** - View/click/dismiss tracking

---

## Out of Scope

### V1 Limitations
- Plain text + emojis only (no rich text editor)
- Solid color presets only (no gradients)
- Priority sorting for multiple banners (no visual stacking)
- Fixed position only (no scroll-following)

### V2 Roadmap

| Feature | Description | Priority |
|---------|-------------|----------|
| **Rich Text Editor** | Bold, italic, links in banner content | High |
| **Image/Video Support** | Add media to banners (like ProductFruits) | High |
| **Gradient Backgrounds** | Custom gradient angle and colors | Medium |
| **Visual Banner Stacking** | Stack multiple banners visually (not just priority) | Medium |
| **A/B Testing** | Test different banner variants | Medium |
| **Frequency Caps** | "Show X times per day/week" | Medium |
| **Banner Animations** | Slide-in, fade, bounce effects | Low |
| **AI-Generated Text** | "Generate with AI" button | Low |
| **Left Nav Redesign** | Collapsible left nav for Tours/Checklists/Banners | Future |
| **Inline Embedded** | Insert banner in middle of page (not just top/bottom) | Future |

---

## Testing Checklist

### Builder
- [ ] Create banner from tours page
- [ ] 3-panel layout loads correctly
- [ ] Edit content - preview updates live
- [ ] Select style preset - preview shows correct colors
- [ ] Toggle dismissible - dismiss button appears/disappears
- [ ] Configure action button - preview shows button
- [ ] Select "Start Tour" action - tour dropdown appears
- [ ] Select "Start Checklist" action - checklist dropdown appears
- [ ] Settings sheet opens with gear button
- [ ] Schedule configuration works
- [ ] Page targeting with URL patterns
- [ ] Customer targeting with checkboxes
- [ ] Save and reload - all settings persist

### Embed Display
- [ ] Banner appears at correct position (top/bottom)
- [ ] Inline mode pushes page content
- [ ] Float mode floats over content with shadow
- [ ] Style presets apply correct colors
- [ ] Custom style uses theme colors
- [ ] Dismiss button removes banner
- [ ] Session dismissal - gone on refresh but back in new session
- [ ] Permanent dismissal - stays gone for 30 days
- [ ] Schedule works - only shows in date range
- [ ] URL targeting filters correctly
- [ ] Customer targeting filters correctly
- [ ] Action button: Open URL works
- [ ] Action button: Start Tour works
- [ ] Action button: Start Checklist works
- [ ] Whole-banner clickable option works
- [ ] Multiple banners sort by priority
- [ ] Exclusive banner hides others
- [ ] Analytics: view_count increments
- [ ] Analytics: click_count increments
- [ ] Analytics: dismiss_count increments

---

---

## Future UI Consideration: Left Nav Redesign

**Note:** User is considering a future redesign to match ProductFruits' approach:

```
Current (V1):                           Future (V2):
┌─────────────────────────────┐        ┌───────┬─────────────────────┐
│ Tours page with cards       │        │ Tours │ Content │ Settings │
│ - ToursCard                 │   →    │ Check │─────────┴──────────│
│ - ChecklistsCard            │        │ Banners│ [Full-width       │
│ - BannersCard               │        │  ▼    │  builder area]     │
└─────────────────────────────┘        └───────┴────────────────────┘
                                       Collapsible left nav
```

This would:
- Replace cards with a collapsible left sidebar for Tours/Checklists/Banners navigation
- Give more horizontal space for the builder
- Match ProductFruits' Content/Settings top tabs pattern

**For V1:** Stick with 3-panel layout matching checklist builder.

---

## Implementation Progress

### Task 1: Database Migration ✅ COMPLETE
**Date:** 2026-01-26

**Files Created/Modified:**
- `supabase/migrations/create_banners_table` - Full table with all fields
- `types/database.ts` - Added Banner types (BannerAction, BannerTargeting, BannerSchedule, BannerTrialTriggers, Banner)

**Database Schema Applied:**
- `banners` table with: banner_type, display_mode, dismiss_duration, priority, exclusive, trial_triggers
- RLS policies for agency isolation
- Indexes on agency_id + status, agency_id + banner_type

### Task 2: Server Actions ✅ COMPLETE
**Date:** 2026-01-26

**Files Created:**
- `tours/_actions/banner-actions.ts` - Full CRUD + status management + stats
- `tours/_lib/banner-defaults.ts` - Default values and 5 templates
- `api/track/banner/route.ts` - Public tracking endpoint for view/click/dismiss

**Functions Available:**
- `getBanners()`, `getBanner(id)`, `createBanner()`, `updateBanner()`, `deleteBanner()`
- `duplicateBanner()`, `publishBanner()`, `unpublishBanner()`, `archiveBanner()`
- `getBannersWithStats()`, `createBannerFromTemplate()`, `getBannerTemplates()`
### Task 3: BannersCard Component ✅ COMPLETE
**Date:** 2026-01-26

**Files Created/Modified:**
- `tours/_components/banners-card.tsx` - Card component for tours page
- `tours/page.tsx` - Added getBannersWithStats fetch and banners prop
- `tours/_components/tours-client.tsx` - Added BannersCard to grid (4-column layout)

**Features:**
- Create dialog with template selection (5 templates)
- Banner list with status badges (Live/Scheduled/Draft/Archived)
- Style color indicators and analytics display
- Dropdown actions: Publish, Unpublish, Duplicate, Archive, Delete
- Click to edit navigation
### Task 4: Banner Builder Layout ✅ COMPLETE
**Date:** 2026-01-26

**Files Created:**
- `tours/banners/[id]/page.tsx` - Server component fetching banner, themes, tours, checklists
- `tours/banners/[id]/_components/banner-builder.tsx` - Main 3-panel layout with header

**Features:**
- Header with back button, editable name, status badge, save status indicator
- Auto-save with 1-second debounce
- Publish/Unpublish buttons based on status
- More actions dropdown (Duplicate, Archive, Delete)
- Settings button to open full settings sheet

### Task 5: Content & Settings Panels ✅ COMPLETE
**Date:** 2026-01-26

**Files Created:**
- `tours/banners/[id]/_components/banner-content-panel.tsx` - Left panel
- `tours/banners/[id]/_components/banner-settings-panel.tsx` - Center panel

**Content Panel Features:**
- Banner text with emoji support
- Action button configuration (enabled, label, type)
- Action types: URL, Start Tour, Start Checklist, Dismiss
- Tour/Checklist selectors with live tours/checklists
- Advanced: Whole banner clickable option
- Trial triggers section for trial_expiration type

**Settings Panel Features:**
- Position selector with visual diagrams (Top/Bottom)
- Display mode radio (Inline/Float)
- Style preset swatches (Info, Success, Warning, Error, Custom)
- Theme selector for custom style
- Dismissibility toggle with duration (Session/Permanent)

### Task 6: Preview & Full Settings ✅ COMPLETE
**Date:** 2026-01-26

**Files Created:**
- `tours/banners/[id]/_components/banner-preview.tsx` - Right panel live preview
- `tours/banners/[id]/_components/banner-full-settings.tsx` - Sheet for advanced settings

**Preview Features:**
- Interactive dismissible banner preview
- Shows both top and bottom positions
- Inline vs float mode visualization
- Dynamic variable preview ({{days}} → 3)
- Reset button to restore dismissed state

**Full Settings Features:**
- General: Internal name
- Schedule: Always or date range with calendar pickers
- Page targeting: All, Specific, or Except with URL patterns
- Customer targeting: All or Specific
- Priority: High/Normal/Low
- Exclusive banner toggle

**Additional Changes:**
- Added shadcn calendar and popover components
- Simplified BannerTargeting.url_patterns to string[] for V1

### Task 7: Embed Script Updates ✅ COMPLETE
**Date:** 2026-01-26

**Files Modified:**
- `api/config/route.ts` - Added banners to config API response
- `embed.js/route.ts` - Added banner rendering and tracking

**API Config Updates:**
- Added banners query to agency fetch (status, content, action, position, etc.)
- Filter to active banners (live or scheduled status)
- Map banner data for embed script consumption

**Embed Script Features:**
- `shouldShowBanner()` - Schedule, URL targeting, and dismissal checks
- `getBannerColors()` - Style preset and custom theme color resolution
- `renderBanner()` - DOM rendering with inline styles
- `handleBannerAction()` - URL, Tour, Checklist, Dismiss actions
- `trackBannerEvent()` - View/Click/Dismiss analytics
- `initProductionBanners()` - Main initialization with priority sorting and exclusive handling

**Banner Rendering Features:**
- Top/Bottom positioning with inline/float modes
- Style presets (info, success, warning, error, custom)
- Action button with click handling
- Dismiss button with session/permanent storage
- Body padding adjustment for inline mode
- Exclusive banner support (hides others)

---

## Implementation Complete

All 7 tasks have been completed. Features 30-31 (Banners Builder & Embed) are ready for testing.

---

## Sources

- [Usetiful Banners Documentation](https://help.usetiful.com/support/solutions/articles/77000553186-banners-in-app-announcements)
- [ProductFruits Banners Overview](https://help.productfruits.com/en/article/banners-overview)
- [ProductFruits Announcements Features](https://productfruits.com/product/announcements)
