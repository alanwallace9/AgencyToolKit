# Feature 25 Backlog: Enhancements & Aggregate Analytics

**Status:** Backlog (Nice-to-have after core Feature 25 ships)
**Priority:** Low - Add after Customer Progress Tracking is complete
**Dependencies:** Feature 25 (Customer Progress Tracking) must be done first

---

## Overview

This backlog contains enhancements to the Customer Progress Tracking feature, including:
1. **Notification bell** for stuck customers
2. **Nudge via GHL tag** to trigger agency workflows
3. **Aggregate analytics** charts and visualizations

**Note:** The core Feature 25 focuses on **Customer Progress Tracking** - seeing which individual customers are stuck and taking action. These backlog items add polish and reporting capabilities.

---

## Enhancement: Notification Bell for Stuck Customers

**Value:** Proactive alerts when customers stall on tours

### UI Design

```
┌─────────────────────────────────────────┐
│ 🔔 (3)                                  │  ← Bell icon in header
├─────────────────────────────────────────┤
│ 3 customers stuck on tours              │
│                                         │
│ • Tester - Welcome Tour (Step 4)        │
│   Inactive 26 hours                     │
│                                         │
│ • Bob's Biz - Welcome Tour (Step 1)     │
│   Inactive 3 days                       │
│                                         │
│ • New Client - Setup Guide (Step 2)     │
│   Inactive 28 hours                     │
│                                         │
│ [View All Stuck Customers]              │
└─────────────────────────────────────────┘
```

### Implementation Notes

- **Stuck threshold:** 24 hours of inactivity (configurable in settings?)
- **Query:** `customer_tour_progress WHERE status = 'in_progress' AND last_activity_at < NOW() - INTERVAL '24 hours'`
- **Badge count:** Number of stuck customers across all tours
- **Click action:** Opens dropdown or navigates to `/customers?status=stuck`
- **Polling vs real-time:** Simple polling on page load is fine; no need for WebSockets

### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `notification-bell.tsx` | `components/shared/` | Bell icon with badge |
| `stuck-customers-dropdown.tsx` | `components/shared/` | Dropdown content |
| `getStuckCustomers()` | Server action | Fetch stuck customers |

---

## Enhancement: Nudge via GHL Tag

**Value:** One-click to trigger agency's GHL workflow (SMS/email) without us building messaging

### How It Works

```
User clicks "Nudge"
        │
        ▼
API call to GHL: Add tag to contact
        │
        ▼
GHL Workflow triggers (configured by agency):
→ SMS: "Need help finishing setup?"
→ Email: "We noticed you stopped at..."
→ Task for sales rep
→ etc.
```

### UI Design

**In customer table (when filtered by tour):**
```
│ Tester     │ 4/6 steps │ 26 hrs ago │ [🏷️ Nudge] │
```

**In notification bell dropdown:**
```
│ • Tester - Welcome Tour (Step 4)        │
│   Inactive 26 hours          [🏷️ Nudge] │
```

### Implementation Notes

- **GHL API:** `POST /contacts/{contactId}/tags` to add tag
- **Tag name:** Configurable in agency settings (default: `stuck_onboarding`)
- **Requires:** `ghl_location_id` on customer record
- **Error handling:** Show toast if GHL API fails
- **Rate limiting:** Prevent spam-clicking (disable button for 24hrs after nudge)
- **Audit trail:** Store `nudged_at` timestamp to show "Nudged 2 hours ago"

### Settings Addition

```
┌─────────────────────────────────────────────────────────┐
│ Tour Settings                                           │
│                                                         │
│ Nudge Tag Name                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ stuck_onboarding                                    │ │
│ └─────────────────────────────────────────────────────┘ │
│ This tag will be added to the GHL contact when you      │
│ click "Nudge". Set up a workflow in GHL to respond.     │
└─────────────────────────────────────────────────────────┘
```

### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `nudge-button.tsx` | `customers/_components/` | Button to trigger nudge |
| `nudgeCustomer()` | Server action | Call GHL API |
| Settings field | `settings/page.tsx` | Configure tag name |

---

## Enhancement: Visual Progress Indicators

### Color-Coded Progress Bars

**In customer table row (when filtered by tour):**
```
│ Tester     │ ████████░░ 4/6  │ 2 hrs ago │
│ Bob's Biz  │ ██░░░░░░░░ 1/6  │ 3 days    │
│ New Client │ ░░░░░░░░░░ 0/6  │ —         │
```

**Color scheme:**
- Green segments: completed steps
- Gray segments: remaining steps
- Optional: Yellow for "current step in progress"

**In tour progress card on customer detail:**
```
┌─────────────────────────────────┐
│ Welcome Tour            4/6    │
│ ████████████░░░░░░ 67%         │
├─────────────────────────────────┤
│ [x] Welcome                     │
│ ...                             │
└─────────────────────────────────┘
```

### Progress Percentage on Customer Cards

**If/when we have a card view for customers:**
```
┌─────────────────────────────┐
│ Tester                      │
│ ████████░░░░ 67% onboarded  │
│ Last active: 2 hours ago    │
└─────────────────────────────┘
```

### Sort by Most Stuck

Add sort option to customers table when filtered by tour:

```
Sort by: [Last Activity ▼]
         ├─ Name
         ├─ Progress (least to most)
         ├─ Progress (most to least)
         └─ Last Activity (oldest first) ← "Most stuck"
```

---

## Aggregate Analytics Dashboard

---

## What This Adds

| Component | Description |
|-----------|-------------|
| KPI cards | Total views, completions, avg completion rate across all tours |
| Time series chart | Line chart showing trends over 7d/30d/90d |
| Step funnel chart | Visual showing aggregate drop-off at each step |
| Analytics overview card | Summary stats on tours list page |
| Sparklines on tour cards | Mini trend lines for at-a-glance performance |

---

## Technical Specification

### Database Queries

#### Aggregate Stats Query (All Tours)
```sql
SELECT
  COUNT(*) FILTER (WHERE event_type = 'view') as total_views,
  COUNT(*) FILTER (WHERE event_type = 'complete') as total_completions,
  COUNT(*) FILTER (WHERE event_type = 'dismiss') as total_dismissals,
  COUNT(DISTINCT tour_id) FILTER (WHERE event_type = 'view') as tours_with_views
FROM tour_analytics
WHERE tour_id IN (SELECT id FROM tours WHERE agency_id = $1)
  AND created_at >= $2
  AND created_at <= $3;
```

#### Per-Tour Stats Query
```sql
SELECT
  event_type,
  step_order,
  COUNT(*) as count,
  DATE_TRUNC('day', created_at) as date
FROM tour_analytics
WHERE tour_id = $1
  AND created_at >= $2
  AND created_at <= $3
GROUP BY event_type, step_order, DATE_TRUNC('day', created_at)
ORDER BY date ASC;
```

#### Step Funnel Query
```sql
WITH tour_sessions AS (
  SELECT DISTINCT session_id
  FROM tour_analytics
  WHERE tour_id = $1
    AND event_type = 'view'
    AND created_at >= $2
),
step_counts AS (
  SELECT
    step_order,
    COUNT(DISTINCT session_id) as viewers
  FROM tour_analytics
  WHERE tour_id = $1
    AND event_type = 'step_view'
    AND session_id IN (SELECT session_id FROM tour_sessions)
  GROUP BY step_order
)
SELECT
  step_order,
  viewers,
  (SELECT COUNT(*) FROM tour_sessions) as total_started
FROM step_counts
ORDER BY step_order;
```

### Server Actions

#### `tour-aggregate-analytics-actions.ts`

```typescript
'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentAgency } from '@/lib/auth';
import { subDays, startOfDay, endOfDay } from 'date-fns';

export type DateRange = '7d' | '30d' | '90d' | 'all';

export interface TourAnalyticsSummary {
  views: number;
  completions: number;
  dismissals: number;
  completionRate: number;
  avgTimeToComplete: number | null; // seconds
}

export interface DailyMetric {
  date: string;
  views: number;
  completions: number;
  dismissals: number;
}

export interface StepFunnelData {
  stepOrder: number;
  stepTitle: string;
  viewers: number;
  dropOffRate: number;
}

export interface TourAnalyticsData {
  summary: TourAnalyticsSummary;
  daily: DailyMetric[];
  funnel: StepFunnelData[];
}

// Get date range boundaries
function getDateRange(range: DateRange): { start: Date; end: Date } {
  const end = endOfDay(new Date());
  let start: Date;

  switch (range) {
    case '7d':
      start = startOfDay(subDays(new Date(), 7));
      break;
    case '30d':
      start = startOfDay(subDays(new Date(), 30));
      break;
    case '90d':
      start = startOfDay(subDays(new Date(), 90));
      break;
    case 'all':
      start = new Date(0); // Epoch
      break;
  }

  return { start, end };
}

// Fetch analytics for a single tour
export async function getTourAnalytics(
  tourId: string,
  range: DateRange = '30d'
): Promise<TourAnalyticsData> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Unauthorized');

  const supabase = createAdminClient();
  const { start, end } = getDateRange(range);

  // Verify tour belongs to agency
  const { data: tour, error: tourError } = await supabase
    .from('tours')
    .select('id, steps')
    .eq('id', tourId)
    .eq('agency_id', agency.id)
    .single();

  if (tourError || !tour) throw new Error('Tour not found');

  // Fetch all events in range
  const { data: events } = await supabase
    .from('tour_analytics')
    .select('*')
    .eq('tour_id', tourId)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .order('created_at', { ascending: true });

  // Process into summary, daily, and funnel data
  return {
    summary: calculateSummary(events || []),
    daily: calculateDaily(events || []),
    funnel: calculateFunnel(events || [], tour.steps),
  };
}

// Fetch aggregate analytics across all tours
export async function getAggregateTourAnalytics(
  range: DateRange = '30d'
): Promise<{
  totalViews: number;
  totalCompletions: number;
  avgCompletionRate: number;
  topTour: { id: string; name: string; views: number } | null;
  trending: 'up' | 'down' | 'stable';
}> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Unauthorized');

  // ... implementation
}
```

### UI Components

#### Analytics Tab (`/tours/[id]/_components/aggregate-analytics-tab.tsx`)

```tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { KpiCard } from './kpi-card';
import { TimeSeriesChart } from './time-series-chart';
import { StepFunnelChart } from './step-funnel-chart';
import { getTourAnalytics, DateRange } from '../_actions/tour-analytics-actions';

interface AnalyticsTabProps {
  tourId: string;
  initialData: TourAnalyticsData;
}

export function AggregateAnalyticsTab({ tourId, initialData }: AnalyticsTabProps) {
  const [range, setRange] = useState<DateRange>('30d');
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  async function handleRangeChange(newRange: DateRange) {
    setRange(newRange);
    setLoading(true);
    const newData = await getTourAnalytics(tourId, newRange);
    setData(newData);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Tour Performance</h3>
        <Select value={range} onValueChange={handleRangeChange}>
          {/* options */}
        </Select>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Views" value={data.summary.views} icon={Eye} />
        <KpiCard title="Completions" value={data.summary.completions} icon={CheckCircle} />
        <KpiCard title="Completion Rate" value={`${data.summary.completionRate}%`} icon={CheckCircle} />
        <KpiCard title="Dismissals" value={data.summary.dismissals} icon={XCircle} />
      </div>

      {/* Time Series Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <TimeSeriesChart data={data.daily} />
        </CardContent>
      </Card>

      {/* Step Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Step Drop-off</CardTitle>
        </CardHeader>
        <CardContent>
          <StepFunnelChart data={data.funnel} />
        </CardContent>
      </Card>
    </div>
  );
}
```

#### Step Funnel Chart

A horizontal funnel visualization showing:
- Each step as a bar
- Width/color indicating % of users who reached that step
- Drop-off percentage between steps
- Hover shows absolute numbers

```
Step 1: Welcome          ████████████████████████  100% (1,234)
                                      ↓ 15% drop-off
Step 2: Dashboard        ████████████████████      85% (1,049)
                                      ↓ 8% drop-off
Step 3: Features         ██████████████████        77% (950)
                                      ↓ 12% drop-off
Step 4: Complete         ████████████████          65% (802)
```

---

## File Structure (When Implemented)

```
app/(dashboard)/tours/
├── [id]/
│   ├── _components/
│   │   ├── aggregate-analytics-tab.tsx  # Charts & KPIs
│   │   ├── kpi-card.tsx                 # Stat card component
│   │   ├── time-series-chart.tsx        # Trend line chart
│   │   └── step-funnel-chart.tsx        # Drop-off funnel
├── _components/
│   └── analytics-overview-card.tsx      # Aggregate stats on list page
└── _actions/
    └── tour-aggregate-analytics-actions.ts
```

---

## Dependencies

- **Recharts** - For chart visualizations
- Feature 25 core (Customer Progress Tracking) - Provides the underlying data

---

## Quick Wins (When Implementing)

| Suggestion | Why It Helps | Effort |
|------------|--------------|--------|
| Sparkline on tour cards | At-a-glance trends without clicking in | Low |
| "Problem tour" indicators | Flag tours with <20% completion | Low |
| Comparison to average | Show if tour is above/below agency average | Medium |
| Date range persistence | Remember last selected range | Low |
| Empty state with tips | Suggest improvements when no data | Low |

---

## Notes

This was originally drafted as the primary Feature 25, but was moved to backlog because:

1. **Customer Progress Tracking is more actionable** - Agencies can directly follow up with stuck customers
2. **Charts are passive** - They tell you there's a problem but not who specifically
3. **Build actionable first** - Get the core value shipped, add reporting layer later

When ready to implement, this can be added as a secondary tab or enhancement to the Customer Progress view.
