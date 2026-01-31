# Customer Segmentation & Targeting System

**Date:** 2026-01-31
**Status:** Backlog
**Priority:** High (enables smarter Guidely targeting)

---

## Overview

Build a customer segmentation system that allows agency owners to target Guidely elements (Tours, Checklists, Banners, Smart Tips) based on customer tags, behaviors, and lifecycle events - rather than manually selecting individual customers.

---

## Problem

Currently, "Specific customers only" targeting requires manually selecting customers one by one. This doesn't scale and doesn't support common use cases like:
- "Show onboarding checklist to all new customers"
- "Show celebration banner on customer's 1-year anniversary"
- "Show upsell tour to customers with 50+ reviews"

---

## Solution

### 1. Customer Tags

**Manual Tags** (created by agency owner):
- VIP, Enterprise, Starter, Needs Training, etc.
- Applied on Customer page
- Can apply multiple tags per customer

**Auto-Calculated Tags** (system generates):
- "New Customer" (joined < 30 days)
- "Anniversary Soon" (anniversary within 7 days)
- "Milestone: 50 Reviews"
- "Milestone: 100 Reviews"
- "Inactive" (no login in 30 days)

### 2. Unified Targeting Component

Same component used across all Guidely elements:

```
Show to customers matching:
┌─────────────────────────────────────────────────┐
│ ○ All customers                                 │
│ ● Customers matching rules                      │
│                                                 │
│   TAGS (match any):                             │
│   [New Customer ×] [VIP ×] [+ Add tag]          │
│                                                 │
│   CONDITIONS:                                   │
│   ┌─────────────────────────────────────────┐   │
│   │ Joined within    [30 ▼] days            │   │
│   │ [× Remove]                              │   │
│   └─────────────────────────────────────────┘   │
│   ┌─────────────────────────────────────────┐   │
│   │ Anniversary within [7 ▼] days           │   │
│   │ [× Remove]                              │   │
│   └─────────────────────────────────────────┘   │
│   [+ Add condition]                             │
│                                                 │
│   ─── Plus specific customers ───               │
│   [Search by name...                        🔍] │
│   [Acme Corp ×] [Smith Agency ×]                │
│   (grayed out if already receiving this)        │
└─────────────────────────────────────────────────┘
```

### 3. Condition Types

| Condition | Description |
|-----------|-------------|
| Joined within X days | New customer targeting |
| Joined before X days | Established customers |
| Anniversary within X days | Celebrate milestones |
| Has X+ reviews | Engagement-based |
| Last active within X days | Active users |
| Last active before X days | Re-engagement |
| Custom field equals | Future: custom attributes |

### 4. Evaluation Logic

- Tags: Match ANY selected tag (OR logic)
- Conditions: Match ALL conditions (AND logic)
- Specific customers: Always included (OR with rules)

Example: "VIP tag OR New Customer tag" AND "Joined within 30 days" OR "Acme Corp (specific)"

---

## Use Cases

| Scenario | Configuration |
|----------|---------------|
| Onboard new users | Condition: Joined within 30 days |
| VIP treatment | Tag: VIP |
| Anniversary celebration | Condition: Anniversary within 7 days |
| Re-engage inactive | Condition: Last active > 14 days |
| Upsell power users | Condition: Has 50+ reviews |
| Specific customer demo | Search + select: "Demo Account" |
| Bulk training rollout | Tag: "Needs Training" |

---

## Database Changes

### New Table: `customer_tags`

```sql
CREATE TABLE customer_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT, -- For UI badge color
  is_auto BOOLEAN DEFAULT false, -- System-generated vs manual
  auto_rule JSONB, -- For auto tags: { type: 'joined_within', days: 30 }
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(agency_id, name)
);
```

### New Table: `customer_tag_assignments`

```sql
CREATE TABLE customer_tag_assignments (
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES customer_tags(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (customer_id, tag_id)
);
```

### Update: Targeting Schema

```typescript
interface GuidelyTargeting {
  customer_mode: 'all' | 'rules';

  // Tag-based (match any)
  tag_ids?: string[];

  // Condition-based (match all)
  conditions?: TargetingCondition[];

  // Specific customers (always include)
  customer_ids?: string[];

  // URL targeting (existing)
  url_mode: 'all' | 'specific';
  url_patterns: string[];
}

interface TargetingCondition {
  type: 'joined_within' | 'joined_before' | 'anniversary_within' |
        'reviews_gte' | 'last_active_within' | 'last_active_before';
  value: number; // days or count
}
```

---

## UI Changes

### Customer Page
- Add "Tags" section to customer detail/edit
- Multi-select to assign manual tags
- Show auto-tags as read-only badges
- Bulk tag assignment from customer list

### Guidely Settings Panels
- Replace current "Specific customers" picker with unified targeting component
- Consistent across Tours, Checklists, Banners, Smart Tips

### Tags Management Page (Settings > Tags)
- Create/edit/delete manual tags
- View auto-tag rules
- See customer counts per tag

---

## Embed Script Changes

Targeting evaluation needs to happen at runtime:
1. Embed script fetches customer context (tags, join date, etc.)
2. Evaluates rules for each Guidely element
3. Shows/hides based on match

Consider caching targeting results to reduce computation.

---

## Implementation Phases

### Phase 1: Manual Tags
- [ ] Customer tags table
- [ ] Tag assignment UI on Customer page
- [ ] Tag targeting in Guidely elements

### Phase 2: Conditions
- [ ] Condition builder UI
- [ ] Join date / anniversary conditions
- [ ] Embed script evaluation

### Phase 3: Auto Tags
- [ ] Auto-tag rules engine
- [ ] Review milestone tags
- [ ] Activity-based tags

### Phase 4: Bulk Operations
- [ ] Bulk tag assignment from customer list
- [ ] Import tags from CSV
- [ ] Tag-based filtering on customer list

---

## Current Stopgap (v1)

Until this system is built, we're shipping a **searchable multi-select combobox** for selecting specific customers by name. This allows:
- Search customers by name
- Select multiple customers
- See selected as chips
- Remove by clicking X

This covers the immediate need while we gather feedback on whether the full segmentation system is desired.

---

## Questions for Later

1. Should tags be shared across agencies (templates) or always per-agency?
2. Should we support custom fields on customers for more targeting options?
3. Should targeting rules support "exclude" logic (NOT tag)?
4. How do we handle targeting conflicts (customer matches multiple elements)?

---

## Related Features

- Customer management page
- Guidely targeting (all elements)
- Analytics (segment performance)
