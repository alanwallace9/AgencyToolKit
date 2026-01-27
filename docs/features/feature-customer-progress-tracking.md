# Feature: Customer Progress Tracking & UX Improvements

**Status:** Ready for Implementation
**Priority:** 4 (After Checklists - needs progress data to display)
**Estimated Sessions:** 1
**Dependencies:** F22 (Tours working), F26-27 (Checklists) for full value
**Blocks:** None

---

## Overview

This feature adds per-customer tracking for tours and checklists, plus UX improvements to the Customers page and detail page. Agencies can see exactly where each customer is in their onboarding journey and follow up with those who are stuck.

**Key insight:** This turns passive onboarding into actionable customer success.

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
- [ ] Each step shows: title, status (✅/⏳/○), verification status
- [ ] Empty state when no tour activity

### Data Tracking
- [ ] Per-customer tour progress stored in database
- [ ] Per-customer checklist progress stored in database
- [ ] Step completion only recorded when action verified (element-exists)

---

## UI Design

### Tour Card - Clickable Stats

```
┌─────────────────────────────────────────────────────────┐
│ Welcome Tour                                   🟢 Live  │
│ 6 steps · Updated about 1 hour ago                  ... │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │  👁 12 views   ✓ 8 completed (67%)                  │ │  ← Hover shows pointer
│ └─────────────────────────────────────────────────────┘ │    Click → /customers?tour=xyz
│                                        [Edit]  [📊]     │
└─────────────────────────────────────────────────────────┘
```

### Customers Page - Filtered by Tour

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Customers                                                                    │
│ Viewing progress for: Welcome Tour                        [✕ Clear Filter]  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [All (12)] [Completed (8)] [In Progress (3)] [Not Started (1)]              │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ Name         │ Token          │ Tour Progress     │ Last Activity │ Status   │
├──────────────┼────────────────┼───────────────────┼───────────────┼──────────┤
│ ▸ Acme Corp  │ te_abc123...   │ ✅ Complete       │ Yesterday     │ Active   │
│ ▸ Tester     │ te_b3f8db...   │ ⏳ 4/6 steps      │ 2 hours ago   │ Active   │
│ ▸ Bob's Biz  │ te_def456...   │ ⏳ 1/6 steps      │ 3 days ago    │ Active   │
│ ▸ New Client │ te_ghi789...   │ ○ Not started     │ —             │ Active   │
└──────────────┴────────────────┴───────────────────┴───────────────┴──────────┘

Note: Entire row is clickable → navigates to customer detail page
```

### Customer Detail Page - Two Column Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ← Back to Customers                                                          │
│                                                                              │
│ Tester                                                              Active ● │
│ Customer details and onboarding progress                                     │
├────────────────────────────────────┬─────────────────────────────────────────┤
│                                    │                                         │
│  Customer Details                  │  Onboarding Progress                    │
│  ────────────────────────────────  │  ────────────────────────────────────   │
│                                    │                                         │
│  Customer Name *                   │  ┌─────────────────────────────────┐    │
│  ┌────────────────────────────┐   │  │ Welcome Tour              ⏳ 4/6 │    │
│  │ Tester                     │   │  ├─────────────────────────────────┤    │
│  └────────────────────────────┘   │  │ ✅ Welcome                      │    │
│                                    │  │ ✅ Navigate Dashboard           │    │
│  GHL Location ID                   │  │ ✅ Upload Your Photo            │    │
│  ┌────────────────────────────┐   │  │ ✅ Connect Google     ✓ Verified│    │
│  │ dhYAj0u9t0di7ZW02N3v       │   │  │ ⏳ Import Contacts              │    │
│  └────────────────────────────┘   │  │ ○  You're All Set!              │    │
│  Found in GHL Settings > ...       │  └─────────────────────────────────┘    │
│                                    │  Started: Jan 24 · Last: 2 hrs ago      │
│  Google Business Place ID          │                                         │
│  ┌────────────────────────────┐   │  ┌─────────────────────────────────┐    │
│  │ e.g., ChIJ...              │   │  │ Getting Started          ⏳ 2/5 │    │
│  └────────────────────────────┘   │  ├─────────────────────────────────┤    │
│                                    │  │ ✅ Complete profile             │    │
│  ┌────────────────────────────┐   │  │ ✅ Upload photo                 │    │
│  │ Active Status          🔘 │   │  │ ○  Connect Google               │    │
│  │ Inactive customers won't...│   │  │ ○  Import contacts              │    │
│  └────────────────────────────┘   │  │ ○  Send first request           │    │
│                                    │  └─────────────────────────────────┘    │
│                                    │  Started: Jan 24 · Last: 2 hrs ago      │
│                                    │                                         │
├────────────────────────────────────┴─────────────────────────────────────────┤
│                                                                              │
│  Integration Details                                                         │
│  ──────────────────────────────────────────────────────────────────────────  │
│  Customer Token: te_b3f8dbaeb83a5449                                    📋   │
│  ...                                                                         │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Uploaded Photos                                                             │
│  ...                                                                         │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Tour Progress Card - Step Status Icons

| Icon | Meaning |
|------|---------|
| ✅ | Step completed (action verified if applicable) |
| ✅ ✓ Verified | Step completed AND success element was detected |
| ⏳ | Step in progress (viewed but not completed) |
| ○ | Step not started |

### Empty State - No Tour Activity

```
┌─────────────────────────────────────┐
│  Onboarding Progress                │
│  ─────────────────────────────────  │
│                                     │
│  📋                                 │
│  No activity yet                    │
│                                     │
│  This customer hasn't started       │
│  any onboarding tours or            │
│  checklists.                        │
│                                     │
└─────────────────────────────────────┘
```

---

## Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `customer-table.tsx` | `customers/_components/` | **Update** - make rows clickable |
| `customer-progress-column.tsx` | `customers/_components/` | New column for filtered view |
| `customer-filter-tabs.tsx` | `customers/_components/` | All/Completed/In Progress/Not Started |
| `tour-progress-card.tsx` | `customers/[id]/_components/` | Shows tour step-by-step progress |
| `checklist-progress-card.tsx` | `customers/[id]/_components/` | Shows checklist item progress |
| `progress-empty-state.tsx` | `customers/[id]/_components/` | No activity message |
| `tour-stats-clickable.tsx` | `tours/_components/` | Clickable stats on tour card |

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

### Verification Tracking

The `step_progress` JSONB stores verification status:

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

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/customers?tour=[id]` | List customers filtered by tour |
| GET | `/api/customers?tour=[id]&status=in_progress` | Further filter by progress status |
| GET | `/api/customer-progress/[customerId]` | Get all progress for a customer |
| GET | `/api/tour-progress/[tourId]` | Get aggregated progress for a tour |

### Progress API (for embed script)

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/track/tour-view` | Record tour started |
| POST | `/api/track/step-view` | Record step viewed |
| POST | `/api/track/step-complete` | Record step completed |
| POST | `/api/track/step-verify` | Record step verification passed |
| POST | `/api/track/tour-complete` | Record tour finished |
| POST | `/api/track/tour-dismiss` | Record tour dismissed |

---

## Embed Script Changes

Update tracking in `embed.js`:

```javascript
// Track tour events
function trackTourEvent(tourId, eventType, stepId = null, metadata = {}) {
  const payload = {
    customer_id: currentCustomerId,
    tour_id: tourId,
    event_type: eventType,  // 'view', 'step_view', 'step_complete', 'verify', 'complete', 'dismiss'
    step_id: stepId,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    ...metadata
  };

  // Send to tracking endpoint
  fetch(`${CONFIG_BASE_URL}/api/track/${eventType}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

// When tour step advances
onStepChange(tourId, stepId, stepConfig) {
  trackTourEvent(tourId, 'step_view', stepId);

  // If step has verification selector, start checking
  if (stepConfig.verification_selector) {
    startVerificationChecker(tourId, stepId, stepConfig.verification_selector);
  }
}

// When user clicks Next/completes step
onStepComplete(tourId, stepId) {
  trackTourEvent(tourId, 'step_complete', stepId);
}

// Verification checker
function startVerificationChecker(tourId, stepId, selector) {
  const checkInterval = setInterval(() => {
    if (document.querySelector(selector)) {
      trackTourEvent(tourId, 'verify', stepId, { selector });
      clearInterval(checkInterval);
    }
  }, 2000);

  // Stop checking after 5 minutes
  setTimeout(() => clearInterval(checkInterval), 300000);
}
```

---

## Page Changes

### `/customers/page.tsx`

- Add query param handling for `?tour=xyz`
- Show filter banner when filtered
- Add tab filters (All/Completed/In Progress/Not Started)
- Pass filter state to table component

### `/customers/_components/customer-table.tsx`

- Make entire row clickable (navigate to detail)
- Add cursor-pointer hover state
- Conditionally show "Tour Progress" column when filtered
- Update three-dot menu to include "View" option

### `/customers/[id]/page.tsx`

- Change layout to two-column grid
- Add Tour Progress card in right column
- Fetch customer progress data

---

## Out of Scope

- Bulk actions on filtered customers (e.g., send reminder email)
- Export customer progress to CSV
- Progress change notifications/alerts
- Historical progress timeline
- Step-level analytics (avg time on step)

---

## Testing Checklist

### Customers Table
- [ ] Click row → navigates to detail page
- [ ] Three-dot menu → View option works
- [ ] Three-dot menu → Edit option still works
- [ ] Hover state shows row is clickable

### Filtered View
- [ ] Navigate to `/customers?tour=xyz`
- [ ] Filter banner shows tour name
- [ ] Clear filter button works
- [ ] Tab filters work (All/Completed/In Progress/Not Started)
- [ ] Tour Progress column appears
- [ ] Progress shows correct status (✅/⏳/○)

### Tour Card Stats
- [ ] Hovering stats area shows pointer cursor
- [ ] Clicking stats navigates to filtered customers page
- [ ] URL includes correct tour ID

### Customer Detail Page
- [ ] Two-column layout renders correctly
- [ ] Tour Progress card shows in right column
- [ ] Steps show correct status icons
- [ ] Verified steps show "✓ Verified" badge
- [ ] Timestamps show correctly
- [ ] Empty state shows when no activity
- [ ] Multiple tours/checklists all display

### Tracking
- [ ] Tour start recorded in database
- [ ] Step views recorded
- [ ] Step completions recorded
- [ ] Verifications recorded when element found
- [ ] Tour completion updates status
