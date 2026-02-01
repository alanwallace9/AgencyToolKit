# Feature: Guidely Showcases (Interactive Product Demos)

**Status:** Backlog (Phase 6+)
**Priority:** Medium-Low (nice-to-have, not core)
**Estimated Sessions:** 4-6
**Dependencies:** F35-39 (Image system for screenshot storage), Guidely Core complete
**Blocks:** None
**Reference:** [Supademo](https://supademo.com), [Arcade](https://arcade.software), [Navattic](https://navattic.com)

---

## Naming Options

The feature needs a name that conveys "product demo" or "walkthrough" without conflicting with existing "Tours" terminology.

| Name | Pros | Cons |
|------|------|------|
| **Showcases** | Clear, professional, implies showing off work | Generic |
| **Demos** | Industry standard term | May confuse with "demo account" |
| **Walkthroughs** | Descriptive, action-oriented | Long, similar to Tours |
| **Spotlight** | Unique, memorable, implies highlighting | Less intuitive |
| **Replays** | Implies recorded experience | May suggest video |

**Recommendation:** Start with **Showcases** or **Demos**. Both are clear and professional.

---

## Overview

Showcases are **screenshot-based interactive demos** that let agencies demonstrate their GHL setup to prospects before they sign up. Unlike Tours (which run on live pages), Showcases are self-contained and can be embedded anywhere or shared via link.

**Key Difference from Tours:**

| Aspect | Tours | Showcases |
|--------|-------|-----------|
| **Medium** | Live DOM overlay | Static screenshots with hotspots |
| **Audience** | Logged-in users | Anyone (prospects, leads) |
| **Context** | Inside the app | Anywhere (website, email, docs) |
| **Dependency** | Embed script on GHL | None - standalone |
| **Interactivity** | Real page, real clicks | Simulated navigation |

**Perfect for:**
- Agency sales: "Here's what your GHL will look like when you work with us"
- Product marketing: Demo features on landing pages
- Documentation: Visual guides that never go stale
- Onboarding previews: Show new users what to expect

---

## User Stories

1. **As an agency owner**, I want to create an interactive demo of my GHL setup so I can show prospects what they'll get.
2. **As an agency owner**, I want to embed demos on my website so visitors can explore without signing up.
3. **As an agency owner**, I want to share demos via link so I can send them in proposals and emails.
4. **As an agency owner**, I want to see analytics on who viewed my demos and how far they got.
5. **As an agency owner**, I want to password-protect demos for specific prospects.
6. **As an agency owner**, I want to customize demo branding (logo, colors) to match my agency.
7. **As an agency owner**, I want to add call-to-action buttons so viewers can book a call after the demo.

---

## Acceptance Criteria

### Builder (`/g/showcases/[id]`)

- [ ] Screenshot upload (drag-drop or paste)
- [ ] Support for multiple screenshots in sequence (steps)
- [ ] Hotspot editor: click to place hotspots on screenshots
- [ ] Hotspot content: title, description, position (top/bottom/left/right)
- [ ] Step navigation: arrows, progress indicator
- [ ] Settings: auto-play, timing, loop
- [ ] Branding: custom logo, colors
- [ ] CTA configuration: button text, URL, position (end of demo or persistent)

### Playback (`/showcase/[id]` or embedded)

- [ ] Full-screen or embedded iframe mode
- [ ] Click-through navigation (arrows or hotspot clicks)
- [ ] Auto-play mode with configurable timing
- [ ] Progress bar showing steps
- [ ] Mobile responsive
- [ ] Keyboard navigation (arrow keys)
- [ ] CTA button at end

### Sharing

- [ ] Public shareable URL (`/showcase/{slug}`)
- [ ] Embed code (iframe)
- [ ] Password protection option
- [ ] Expiring links option
- [ ] Custom slugs (e.g., `/showcase/acme-demo`)

### Analytics

- [ ] View count
- [ ] Completion rate (% who reach last step)
- [ ] Drop-off by step
- [ ] CTA click rate
- [ ] Viewer tracking (if gated with email)

---

## UI Design

### Showcases List Page (`/g/showcases`)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Showcases                                                       [+ Create]   │
│  Interactive demos for prospects and marketing                               │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ ┌──────┐  GHL Setup Walkthrough                          🟢 Published  │  │
│  │ │ 📷   │  12 steps · Created Jan 15                              ...  │  │
│  │ │thumb │  👁 234 views · 67% completion · 12 CTA clicks               │  │
│  │ └──────┘                                                              │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ ┌──────┐  Pipeline Demo for Acme Corp                      🔒 Private  │  │
│  │ │ 📷   │  8 steps · Created Jan 20                               ...  │  │
│  │ │thumb │  Password protected · Expires Feb 1                          │  │
│  │ └──────┘                                                              │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ ┌──────┐  Reputation Management Features                   🟡 Draft    │  │
│  │ │ 📷   │  5 steps · Last edited 2 hours ago                      ...  │  │
│  │ │thumb │  Not published yet                                           │  │
│  │ └──────┘                                                              │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Showcase Builder (`/g/showcases/[id]`) - 3-Panel Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ← Back    GHL Setup Walkthrough                     Saved ✓       [PUBLISH]  │
├──────────────────────────────────────────────────────────────────────────────┤
│                          │                                                   │
│  STEPS                   │   CANVAS / PREVIEW                                │
│  ───────────────────     │   ────────────────────────────────────────────    │
│                          │                                                   │
│  [+ Add Screenshot]      │   ┌─────────────────────────────────────────────┐ │
│                          │   │                                             │ │
│  ┌────────────────────┐  │   │      (Screenshot with hotspot overlay)      │ │
│  │ 1. Dashboard       │◀─│   │                                             │ │
│  │    Overview        │  │   │         ┌─────────────────────────┐         │ │
│  └────────────────────┘  │   │         │ This is your dashboard  │         │ │
│                          │   │         │ where you can see all   │         │ │
│  ┌────────────────────┐  │   │    ●────│ your key metrics.       │         │ │
│  │ 2. Pipeline        │  │   │         │              [Next →]   │         │ │
│  │    View            │  │   │         └─────────────────────────┘         │ │
│  └────────────────────┘  │   │                                             │ │
│                          │   │                                             │ │
│  ┌────────────────────┐  │   └─────────────────────────────────────────────┘ │
│  │ 3. Contact         │  │                                                   │
│  │    Details         │  │   ─────────────────────────────────────────────   │
│  └────────────────────┘  │                                                   │
│                          │   HOTSPOT SETTINGS (when hotspot selected)        │
│  ┌────────────────────┐  │   ───────────────────────────────────────────     │
│  │ 4. Automation      │  │                                                   │
│  │    Workflow        │  │   Title: [This is your dashboard        ]        │
│  └────────────────────┘  │                                                   │
│                          │   Description:                                    │
│  ┌────────────────────┐  │   ┌─────────────────────────────────────────┐    │
│  │ 5. Reports         │  │   │ Where you can see all your key metrics │    │
│  │    Analytics       │  │   └─────────────────────────────────────────┘    │
│  └────────────────────┘  │                                                   │
│                          │   Position: [Bottom ▼]   Highlight: [● On]       │
│                          │                                                   │
└──────────────────────────┴───────────────────────────────────────────────────┘
```

### Hotspot Placement Mode

When user clicks "Add Hotspot" or clicks on the screenshot:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   Click anywhere on the screenshot to place a hotspot                       │
│   ─────────────────────────────────────────────────────                     │
│                                                                             │
│   ┌───────────────────────────────────────────────────────────────────────┐ │
│   │                                                                       │ │
│   │   ┌─────────┐                                                         │ │
│   │   │ Mercury │  Home    Tasks    Transactions                          │ │
│   │   └─────────┘                                                         │ │
│   │                                                                       │ │
│   │   Welcome, Joseph Lee                                                 │ │
│   │                                              ↑                        │ │
│   │   Mercury balance                         (click                     │ │
│   │   $5,216,471.18                            here)                     │ │
│   │                                              ●                        │ │
│   │                                                                       │ │
│   └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│   [Cancel]                                                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Public Playback View (`/showcase/[slug]`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GHL Setup Walkthrough                    [⛶ Full] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                                                                             │
│   ┌───────────────────────────────────────────────────────────────────────┐ │
│   │                                                                       │ │
│   │                    (Screenshot fills this area)                       │ │
│   │                                                                       │ │
│   │                                                                       │ │
│   │         ┌─────────────────────────────┐                               │ │
│   │         │ This is your dashboard      │                               │ │
│   │    ●────│ where you can see all       │                               │ │
│   │         │ your key metrics.           │                               │ │
│   │         │                  [Next →]   │                               │ │
│   │         └─────────────────────────────┘                               │ │
│   │                                                                       │ │
│   │                                                                       │ │
│   └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│   [←]  ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  1 of 12  [→]        │
│                                                                             │
│                     Powered by Agency Toolkit                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Final Step with CTA

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   ┌───────────────────────────────────────────────────────────────────────┐ │
│   │                                                                       │ │
│   │                    (Final screenshot)                                 │ │
│   │                                                                       │ │
│   │                                                                       │ │
│   │   ┌─────────────────────────────────────────────────────────────────┐ │ │
│   │   │                                                                 │ │ │
│   │   │                    That's the tour!                             │ │ │
│   │   │                                                                 │ │ │
│   │   │     Ready to get started with a GHL setup like this?            │ │ │
│   │   │                                                                 │ │ │
│   │   │                 [ Book a Demo Call ]                            │ │ │
│   │   │                                                                 │ │ │
│   │   │                    Restart tour                                 │ │ │
│   │   │                                                                 │ │ │
│   │   └─────────────────────────────────────────────────────────────────┘ │ │
│   │                                                                       │ │
│   └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│   [←]  ████████████████████████████████████████████████  12 of 12  [→]     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```sql
-- Showcases (main table)
CREATE TABLE showcases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,

  -- Basic info
  name TEXT NOT NULL,
  slug TEXT NOT NULL, -- URL-friendly identifier
  description TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),

  -- Steps (array of screenshots with hotspots)
  steps JSONB NOT NULL DEFAULT '[]',
  -- Structure: [{ id, image_url, hotspots: [{ id, x, y, title, description, position }] }]

  -- Settings
  settings JSONB NOT NULL DEFAULT '{}',
  -- Structure: { auto_play: bool, timing_seconds: number, loop: bool, show_progress: bool }

  -- Branding
  branding JSONB NOT NULL DEFAULT '{}',
  -- Structure: { logo_url, primary_color, background_color, font }

  -- CTA
  cta JSONB,
  -- Structure: { enabled: bool, text, url, position: 'end' | 'persistent' }

  -- Access control
  is_public BOOLEAN NOT NULL DEFAULT true,
  password_hash TEXT, -- bcrypt hash if password protected
  expires_at TIMESTAMPTZ, -- optional expiration

  -- Analytics (denormalized for quick access)
  view_count INTEGER NOT NULL DEFAULT 0,
  completion_count INTEGER NOT NULL DEFAULT 0,
  cta_click_count INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,

  -- Unique slug per agency
  UNIQUE(agency_id, slug)
);

-- Showcase analytics events
CREATE TABLE showcase_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  showcase_id UUID NOT NULL REFERENCES showcases(id) ON DELETE CASCADE,

  -- Event type
  event_type TEXT NOT NULL
    CHECK (event_type IN ('view', 'step_view', 'completion', 'cta_click', 'drop_off')),

  -- Event data
  step_index INTEGER, -- which step (for step_view, drop_off)

  -- Viewer info (anonymous unless gated)
  viewer_id TEXT, -- fingerprint or email if gated
  viewer_email TEXT, -- if email-gated

  -- Context
  referrer TEXT,
  user_agent TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_showcases_agency ON showcases(agency_id);
CREATE INDEX idx_showcases_slug ON showcases(agency_id, slug);
CREATE INDEX idx_showcases_status ON showcases(status);
CREATE INDEX idx_showcase_events_showcase ON showcase_events(showcase_id);
CREATE INDEX idx_showcase_events_type ON showcase_events(event_type);
```

### TypeScript Types

```typescript
export interface Showcase {
  id: string;
  agency_id: string;
  name: string;
  slug: string;
  description: string | null;
  status: 'draft' | 'published' | 'archived';
  steps: ShowcaseStep[];
  settings: ShowcaseSettings;
  branding: ShowcaseBranding;
  cta: ShowcaseCTA | null;
  is_public: boolean;
  password_hash: string | null;
  expires_at: string | null;
  view_count: number;
  completion_count: number;
  cta_click_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface ShowcaseStep {
  id: string;
  image_url: string; // Vercel Blob URL
  hotspots: ShowcaseHotspot[];
}

export interface ShowcaseHotspot {
  id: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  highlight_radius?: number; // optional spotlight effect
}

export interface ShowcaseSettings {
  auto_play: boolean;
  timing_seconds: number; // seconds between auto-advance
  loop: boolean;
  show_progress: boolean;
  allow_keyboard: boolean;
}

export interface ShowcaseBranding {
  logo_url?: string;
  primary_color?: string;
  background_color?: string;
  font?: string;
}

export interface ShowcaseCTA {
  enabled: boolean;
  text: string;
  url: string;
  position: 'end' | 'persistent';
  open_in_new_tab: boolean;
}

export interface ShowcaseEvent {
  id: string;
  showcase_id: string;
  event_type: 'view' | 'step_view' | 'completion' | 'cta_click' | 'drop_off';
  step_index: number | null;
  viewer_id: string | null;
  viewer_email: string | null;
  referrer: string | null;
  user_agent: string | null;
  created_at: string;
}
```

---

## API Routes

### CRUD Operations

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/showcases` | List all showcases for agency |
| POST | `/api/showcases` | Create new showcase |
| GET | `/api/showcases/[id]` | Get showcase by ID |
| PATCH | `/api/showcases/[id]` | Update showcase |
| DELETE | `/api/showcases/[id]` | Delete showcase |
| POST | `/api/showcases/[id]/publish` | Publish showcase |
| POST | `/api/showcases/[id]/unpublish` | Unpublish showcase |
| POST | `/api/showcases/[id]/duplicate` | Clone showcase |

### Public Routes (no auth required)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/showcase/[slug]` | Get public showcase data |
| POST | `/api/showcase/[slug]/verify-password` | Verify password for protected showcase |
| POST | `/api/showcase/[slug]/event` | Track analytics event |

### Screenshot Upload

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/showcases/[id]/upload` | Upload screenshot to Vercel Blob |

---

## File Structure

```
app/
├── (dashboard)/g/showcases/
│   ├── page.tsx                      # List page
│   ├── _components/
│   │   ├── showcases-list-client.tsx
│   │   └── showcase-card.tsx
│   └── [id]/
│       ├── page.tsx                  # Builder page
│       └── _components/
│           ├── showcase-builder.tsx  # Main builder
│           ├── steps-panel.tsx       # Left panel (step list)
│           ├── canvas-panel.tsx      # Center (screenshot + hotspots)
│           ├── hotspot-editor.tsx    # Hotspot placement/editing
│           ├── settings-sheet.tsx    # Settings sidebar
│           └── branding-panel.tsx    # Branding controls
│
├── showcase/[slug]/
│   ├── page.tsx                      # Public playback page
│   └── _components/
│       ├── showcase-player.tsx       # Main player component
│       ├── hotspot-tooltip.tsx       # Tooltip overlay
│       ├── progress-bar.tsx          # Step progress
│       ├── password-gate.tsx         # Password entry form
│       └── cta-overlay.tsx           # Call-to-action
│
└── api/
    ├── showcases/
    │   ├── route.ts                  # GET, POST
    │   └── [id]/
    │       ├── route.ts              # GET, PATCH, DELETE
    │       ├── publish/route.ts
    │       ├── unpublish/route.ts
    │       ├── duplicate/route.ts
    │       └── upload/route.ts       # Screenshot upload
    │
    └── showcase/[slug]/
        ├── route.ts                  # GET (public)
        ├── verify-password/route.ts  # POST
        └── event/route.ts            # POST (analytics)
```

---

## Implementation Phases

### Phase 1: MVP Builder (Sessions 1-2)
- [ ] Database schema and types
- [ ] Basic CRUD API routes
- [ ] Screenshot upload to Vercel Blob
- [ ] Builder UI: step list, screenshot display
- [ ] Hotspot placement (click to add)
- [ ] Hotspot editing (title, description, position)
- [ ] Save/publish flow

### Phase 2: Public Player (Sessions 2-3)
- [ ] Public showcase route (`/showcase/[slug]`)
- [ ] Player component with navigation
- [ ] Hotspot tooltip rendering
- [ ] Progress bar
- [ ] Keyboard navigation
- [ ] Mobile responsive

### Phase 3: Polish & Features (Sessions 3-4)
- [ ] Auto-play mode
- [ ] CTA configuration and display
- [ ] Password protection
- [ ] Expiring links
- [ ] Custom branding
- [ ] Embed code generation

### Phase 4: Analytics (Sessions 4-5)
- [ ] Event tracking (view, step_view, completion, cta_click)
- [ ] Analytics dashboard in builder
- [ ] Drop-off visualization
- [ ] Export analytics

### Phase 5: Advanced (Future)
- [ ] Email gating (collect email before viewing)
- [ ] Chrome extension for easier screenshot capture
- [ ] HTML cloning mode (scrollable demos - complex)
- [ ] A/B testing different CTAs
- [ ] Team sharing/collaboration

---

## Competitive Analysis

| Feature | Supademo | Arcade | Navattic | **Guidely Showcases** |
|---------|----------|--------|----------|----------------------|
| Screenshot demos | ✅ | ✅ | ✅ | ✅ |
| HTML cloning | ✅ ($350/mo) | ❌ | ✅ | ❌ (v1) |
| Hotspot editor | ✅ | ✅ | ✅ | ✅ |
| Auto-play | ✅ | ✅ | ✅ | ✅ |
| Password protection | ✅ | ✅ | ✅ | ✅ |
| Analytics | ✅ | ✅ | ✅ | ✅ |
| CTA buttons | ✅ | ✅ | ✅ | ✅ |
| Free tier | 5 demos | 3 demos | ❌ | Included in Pro |
| Pricing | $38-350/mo | $38/mo | $500+/mo | Included |

**Our advantage:** Showcases is bundled with Pro ($49/mo) alongside Tours, Checklists, Images, etc. Competitors charge $38-500/mo for standalone demo tools.

---

## Marketing Positioning

**For agencies selling GHL services:**

> "Show prospects exactly how you've customized GHL for them—before they sign up. Create interactive demos that sell your setup, not just describe it."

**Key messages:**
1. "Demo your GHL setup without giving away the keys"
2. "Interactive proposals that close deals"
3. "Let your setup sell itself"

---

## Open Questions

1. **Chrome extension for capture?** - MVP uses manual screenshot upload. Extension could come later to streamline.

2. **HTML cloning?** - Supademo charges $350/mo for this. Assess demand before building.

3. **Separate from Guidely?** - Keep in `/g/showcases` for now, but could spin out if it becomes a major feature.

4. **Pricing if standalone?** - Currently planned as Pro bundle. Could be add-on if demand is high.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Showcases created per agency | 2+ |
| Average steps per showcase | 5-10 |
| Completion rate (viewers) | 60%+ |
| CTA click rate | 10%+ |
| Feature adoption (Pro users) | 30% |

---

## Approval

- [ ] Feature name finalized
- [ ] Scope confirmed (screenshot-based MVP, no HTML cloning)
- [ ] Priority confirmed (Phase 6+)
- [ ] Database schema reviewed

**Ready for backlog.**
