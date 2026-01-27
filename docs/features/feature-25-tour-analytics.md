# Feature 25: Tour Analytics - Customer Progress Tracking

**Status:** Complete
**Priority:** High
**Dependencies:** F22 (Tours working), F26-27 (Checklists) for full value
**Blocks:** None

---

## Implementation Progress

| Step | Task | Status | Notes |
|------|------|--------|-------|
| 1 | Database migration - `customer_tour_progress` table | DONE | Created via Supabase MCP 2026-01-26 |
| 2 | Tracking API - `/api/track/progress` endpoint | DONE | Created + added to public routes in proxy.ts |
| 3 | Embed script updates - `trackCustomerProgress()` | DONE | Added function + calls for all events |
| 4 | Customer table - make rows clickable | DONE | Added click handler, hover style, View option |
| 5 | Filter tabs - All/Completed/In Progress/Not Started | DONE | Added filter tabs, tour filter banner, progress column |
| 6 | Customer detail page - two-column layout + progress card | DONE | Two-column grid, TourProgressCard with collapsible tours |
| 7 | Tour card - make stats clickable | DONE | Stats area links to /customers?tour=ID, chart icon same |

---

## Overview

This feature adds per-customer tracking for tours, enabling agencies to see exactly where each customer is in their onboarding journey and follow up with those who are stuck.

**Key insight:** This turns passive onboarding into actionable customer success.

---

## Executive Summary

### What We're Building

A customer-level progress tracking system that shows agencies which of their customers have started, completed, or gotten stuck on guided tours. Clicking tour stats reveals the specific customers filtered by progress status, allowing agencies to take action - send a follow-up email, apply a tag, or personally reach out to help stuck users complete onboarding.

### UI/UX Placement

| Location | What's Added |
|----------|--------------|
| Tour cards | Stats area becomes clickable, navigates to filtered customers |
| Customers page | Filter by tour, tabs for All/Completed/In Progress/Not Started |
| Customer detail page | Two-column layout with progress card showing step-by-step status |

### Key Deliverables

| Component | Description |
|-----------|-------------|
| Clickable tour stats | Click views/completions to see filtered customer list |
| Customer filter tabs | All / Completed / In Progress / Not Started |
| Tour progress column | Shows "4/6 steps" in customers table when filtered |
| Customer progress card | Step-by-step status on customer detail page |
| Progress tracking API | Endpoints for embed script to report progress |
| `customer_tour_progress` table | Per-customer, per-tour progress storage |

### Order of Operations

1. **Database migration** - Create `customer_tour_progress` table
2. **Tracking API** - Endpoints for embed script to report progress events
3. **Embed script updates** - Track per-customer progress (requires customer token)
4. **Customer table updates** - Make rows clickable, add progress column
5. **Filter tabs** - Add status filter tabs to customers page
6. **Customer detail page** - Add two-column layout with progress card
7. **Tour card updates** - Make stats clickable, link to filtered customers

### Database Changes

**New table:** `customer_tour_progress`

```sql
CREATE TABLE customer_tour_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'completed', 'dismissed')),
  current_step INTEGER DEFAULT 0,
  step_progress JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  UNIQUE(customer_id, tour_id)
);
```

### Scope Boundaries

| In Scope | Out of Scope |
|----------|--------------|
| Per-customer tour progress | Bulk actions (send reminder to all stuck) |
| Step-by-step status display | Export progress to CSV |
| Filter customers by tour/status | Progress change notifications |
| Clickable tour stats | Historical progress timeline |
| Verification status tracking | Aggregate charts (see backlog) |

### Quick Wins (UX Improvements)

| Suggestion | Why It Helps | Effort |
|------------|--------------|--------|
| "Stuck" badge on customers | Instantly see who needs help | Low |
| Last activity timestamp | Know how long they've been stuck | Low |
| Step title in progress | "Stuck on: Import Contacts" vs just "4/6" | Low |
| Hover preview on tour stats | See breakdown without clicking | Medium |
| Deep link to specific customer | Share link to stuck customer directly | Low |

---

## User Stories

1. **As an agency owner**, I want to see which customers have completed onboarding so I can identify who needs follow-up.
2. **As an agency owner**, I want to click on tour stats and see exactly which customers are stuck and at which step.
3. **As an agency owner**, I want to see a customer's full progress on their detail page.
4. **As an agency owner**, I want to click on a customer row to view their details (not just edit).

---

## Acceptance Criteria

### Customers Table
- [ ] Clicking anywhere on a customer row navigates to detail page
- [ ] Three-dot menu includes "View" option (in addition to Edit, Delete)
- [ ] When filtered by tour, shows "Tour Progress" column
- [ ] Filter tabs: All / Completed / In Progress / Not Started

### Tour/Checklist Cards
- [ ] Clicking stats area (views/completions) navigates to filtered customers page
- [ ] Stats are clickable with hover state indicating interactivity

### Customer Detail Page
- [ ] Two-column layout: Customer Details (left), Tour Progress (right)
- [ ] Tour Progress card shows all tours/checklists with step-by-step status
- [ ] Each step shows: title, status (completed/in-progress/not-started), verification status
- [ ] Empty state when no tour activity

### Data Tracking
- [ ] Per-customer tour progress stored in database
- [ ] Step completion recorded with timestamp
- [ ] Verification status recorded when element-exists check passes

---

## UI Design

### Tour Card - Clickable Stats

```
┌─────────────────────────────────────────────────────────┐
│ Welcome Tour                                   Live     │
│ 6 steps · Updated about 1 hour ago                  ... │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │  12 views   8 completed (67%)                       │ │  <- Hover shows pointer
│ └─────────────────────────────────────────────────────┘ │    Click -> /customers?tour=xyz
│                                        [Edit]  [chart]  │
└─────────────────────────────────────────────────────────┘
```

### Customers Page - Filtered by Tour

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Customers                                                                    │
│ Viewing progress for: Welcome Tour                        [x Clear Filter]   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [All (12)] [Completed (8)] [In Progress (3)] [Not Started (1)]              │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ Name         │ Token          │ Tour Progress     │ Last Activity │ Status   │
├──────────────┼────────────────┼───────────────────┼───────────────┼──────────┤
│ > Acme Corp  │ te_abc123...   │ Complete          │ Yesterday     │ Active   │
│ > Tester     │ te_b3f8db...   │ 4/6 steps         │ 2 hours ago   │ Active   │
│ > Bob's Biz  │ te_def456...   │ 1/6 steps         │ 3 days ago    │ Active   │
│ > New Client │ te_ghi789...   │ Not started       │ -             │ Active   │
└──────────────┴────────────────┴───────────────────┴───────────────┴──────────┘

Note: Entire row is clickable -> navigates to customer detail page
```

### Customer Detail Page - Two Column Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ <- Back to Customers                                                         │
│                                                                              │
│ Tester                                                              Active   │
│ Customer details and onboarding progress                                     │
├────────────────────────────────────┬─────────────────────────────────────────┤
│                                    │                                         │
│  Customer Details                  │  Onboarding Progress                    │
│  --------------------------------  │  ------------------------------------   │
│                                    │                                         │
│  Customer Name *                   │  ┌─────────────────────────────────┐    │
│  ┌────────────────────────────┐   │  │ Welcome Tour              4/6   │    │
│  │ Tester                     │   │  ├─────────────────────────────────┤    │
│  └────────────────────────────┘   │  │ [done] Welcome                  │    │
│                                    │  │ [done] Navigate Dashboard       │    │
│  GHL Location ID                   │  │ [done] Upload Your Photo        │    │
│  ┌────────────────────────────┐   │  │ [done] Connect Google  Verified │    │
│  │ dhYAj0u9t0di7ZW02N3v       │   │  │ [curr] Import Contacts          │    │
│  └────────────────────────────┘   │  │ [    ] You're All Set!          │    │
│                                    │  └─────────────────────────────────┘    │
│                                    │  Started: Jan 24 · Last: 2 hrs ago      │
│                                    │                                         │
└────────────────────────────────────┴─────────────────────────────────────────┘
```

### Tour Progress Card - Step Status Icons

| Icon | Meaning |
|------|---------|
| [done] | Step completed (action verified if applicable) |
| [done] Verified | Step completed AND success element was detected |
| [curr] | Step in progress (viewed but not completed) |
| [    ] | Step not started |

---

## Database

### Table: `customer_tour_progress`

```sql
CREATE TABLE customer_tour_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,

  -- Progress tracking
  status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'completed', 'dismissed')),
  current_step INTEGER DEFAULT 0,

  -- Step-by-step tracking
  step_progress JSONB DEFAULT '[]',
  -- Array of: { step_id, step_order, viewed_at, completed_at, verified_at? }

  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(customer_id, tour_id)
);

CREATE INDEX idx_tour_progress_customer ON customer_tour_progress(customer_id);
CREATE INDEX idx_tour_progress_tour ON customer_tour_progress(tour_id);
CREATE INDEX idx_tour_progress_status ON customer_tour_progress(status);
```

### Step Progress JSONB Structure

```json
[
  {
    "step_id": "step_1",
    "step_order": 1,
    "title": "Welcome",
    "viewed_at": "2026-01-24T10:00:00Z",
    "completed_at": "2026-01-24T10:00:30Z",
    "verified": true,
    "verified_at": "2026-01-24T10:00:30Z"
  },
  {
    "step_id": "step_4",
    "step_order": 4,
    "title": "Connect Google",
    "viewed_at": "2026-01-24T10:05:00Z",
    "completed_at": "2026-01-24T10:05:15Z",
    "verified": true,
    "verified_at": "2026-01-24T10:06:00Z",
    "verification_selector": "[data-integration='google'][data-status='connected']"
  },
  {
    "step_id": "step_5",
    "step_order": 5,
    "title": "Import Contacts",
    "viewed_at": "2026-01-24T10:10:00Z",
    "completed_at": null,
    "verified": false
  }
]
```

---

## API Routes

### Dashboard API (for admin UI)

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/customers?tour=[id]` | List customers filtered by tour |
| GET | `/api/customers?tour=[id]&status=in_progress` | Filter by progress status |
| GET | `/api/customer-progress/[customerId]` | Get all progress for a customer |

### Progress Tracking API (for embed script)

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/track/progress` | Record tour/step progress events |

**Payload:**
```json
{
  "customer_token": "te_abc123",
  "tour_id": "uuid",
  "event_type": "step_view | step_complete | verify | tour_complete | tour_dismiss",
  "step_id": "step_1",
  "step_order": 1,
  "metadata": {}
}
```

---

## Embed Script Changes

Update tracking in `embed.js` to include customer-level progress:

```javascript
// Track tour events with customer context
function trackCustomerProgress(tourId, eventType, stepId = null, metadata = {}) {
  // Only track if we have a customer token
  if (!CUSTOMER_TOKEN) {
    // Fall back to anonymous session tracking
    return trackTourEvent(eventType, tourId, { step_id: stepId, ...metadata });
  }

  const payload = {
    customer_token: CUSTOMER_TOKEN,
    tour_id: tourId,
    event_type: eventType,
    step_id: stepId,
    step_order: currentStepOrder,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    ...metadata
  };

  fetch(API_BASE + '/api/track/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(function(e) {
    log('Progress tracking failed', e);
  });
}

// When tour starts
onTourStart(tourId) {
  trackCustomerProgress(tourId, 'tour_start');
}

// When step is viewed
onStepChange(tourId, stepId, stepConfig) {
  trackCustomerProgress(tourId, 'step_view', stepId);

  // If step has verification selector, start checking
  if (stepConfig.verification_selector) {
    startVerificationChecker(tourId, stepId, stepConfig.verification_selector);
  }
}

// When user completes step (clicks Next)
onStepComplete(tourId, stepId) {
  trackCustomerProgress(tourId, 'step_complete', stepId);
}

// When verification element is found
function onVerificationSuccess(tourId, stepId, selector) {
  trackCustomerProgress(tourId, 'verify', stepId, { selector });
}

// When tour completes
onTourComplete(tourId) {
  trackCustomerProgress(tourId, 'tour_complete');
}

// When tour is dismissed
onTourDismiss(tourId) {
  trackCustomerProgress(tourId, 'tour_dismiss');
}
```

---

## Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `customer-table.tsx` | `customers/_components/` | **Update** - make rows clickable |
| `customer-progress-column.tsx` | `customers/_components/` | New column for filtered view |
| `customer-filter-tabs.tsx` | `customers/_components/` | All/Completed/In Progress/Not Started |
| `tour-progress-card.tsx` | `customers/[id]/_components/` | Shows tour step-by-step progress |
| `progress-empty-state.tsx` | `customers/[id]/_components/` | No activity message |
| `tour-stats-clickable.tsx` | `tours/_components/` | Clickable stats on tour card |

---

## File Structure

```
app/(dashboard)/
├── customers/
│   ├── page.tsx                    # Update: add tour filter param handling
│   ├── [id]/
│   │   ├── page.tsx                # Update: two-column layout
│   │   └── _components/
│   │       ├── tour-progress-card.tsx
│   │       └── progress-empty-state.tsx
│   └── _components/
│       ├── customer-table.tsx      # Update: clickable rows
│       ├── customer-progress-column.tsx
│       └── customer-filter-tabs.tsx
├── tours/
│   └── _components/
│       └── tour-card.tsx           # Update: clickable stats
└── api/
    ├── track/
    │   └── progress/route.ts       # New: progress tracking endpoint
    └── customer-progress/
        └── [customerId]/route.ts   # New: get customer progress
```

---

## Testing Checklist

### Customers Table
- [ ] Click row -> navigates to detail page
- [ ] Three-dot menu -> View option works
- [ ] Hover state shows row is clickable

### Filtered View
- [ ] Navigate to `/customers?tour=xyz`
- [ ] Filter banner shows tour name
- [ ] Clear filter button works
- [ ] Tab filters work (All/Completed/In Progress/Not Started)
- [ ] Tour Progress column appears
- [ ] Progress shows correct status

### Tour Card Stats
- [ ] Hovering stats area shows pointer cursor
- [ ] Clicking stats navigates to filtered customers page
- [ ] URL includes correct tour ID

### Customer Detail Page
- [ ] Two-column layout renders correctly
- [ ] Tour Progress card shows in right column
- [ ] Steps show correct status icons
- [ ] Verified steps show badge
- [ ] Timestamps show correctly
- [ ] Empty state shows when no activity

### Tracking
- [ ] Tour start recorded with customer
- [ ] Step views recorded
- [ ] Step completions recorded
- [ ] Verifications recorded when element found
- [ ] Tour completion updates status

---

## Out of Scope (See Backlog)

- Aggregate analytics charts and funnels (`feature-25-backlog.md`)
- Bulk actions on filtered customers
- Export customer progress to CSV
- Progress change notifications/alerts
- Historical progress timeline

---

## Questions for You

1. Should the "Stuck on step X" show the step title or just the number?
2. How long without activity before we consider someone "stuck"? (3 days?)
3. Should we show a count badge on the Tours sidebar nav when customers are stuck?
