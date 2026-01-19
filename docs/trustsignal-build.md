# TrustSignal Build Plan

**Last Updated:** 2026-01-19

---

## V1 Status: Shippable ✅

### What's Included in V1

| Feature | Status | Notes |
|---------|--------|-------|
| Create/edit/delete widgets | ✅ | Full CRUD |
| Auto-capture form submissions | ✅ | Detects lead forms automatically |
| Display notifications | ✅ | Rotating notifications on visitor sites |
| Theme selection | ✅ | Minimal, Glass, Dark, Rounded, Custom |
| Custom colors | ✅ | Background, text, accent, border |
| Position control | ✅ | 4 corners |
| Timing controls | ✅ | Duration, gap, initial delay (10s default) |
| URL targeting | ✅ | Include/exclude paths |
| Content display options | ✅ | Name, city, time ago |
| TrustSignal attribution | ✅ | "✓ TrustSignal" on all notifications |
| Prominent dismiss button | ✅ | Always visible |
| Single embed code | ✅ | One script tag per widget |
| FTC compliant | ✅ | No manual/CSV entry - real data only |

### What's NOT in V1 (Moved to V2)

- Multiple placements per widget
- Shape controls (square/rounded/pill)
- Shadow controls
- Google Reviews integration
- Event type filtering

### Why V1 is Shippable

The current product delivers complete social proof functionality:

1. **Core Value Delivered** - Captures real form submissions and displays them as social proof notifications
2. **Differentiated** - "Real data only" positioning (no fake testimonials)
3. **Professional** - TrustSignal branding, polished UI
4. **Flexible** - Multiple themes, custom colors, positioning options
5. **Workaround Exists** - Users needing different notifications per page can create multiple widgets

---

## V2: Phase 2 Placements System

### BMAD Analysis

| Task | Complexity | Dependencies | Effort | Priority |
|------|------------|--------------|--------|----------|
| **2.1** Database Migration | Low | None | 30 min | P0 |
| **2.2** TypeScript Types | Low | 2.1 | 15 min | P0 |
| **2.3** Placement Server Actions | Medium | 2.1, 2.2 | 1-2 hrs | P0 |
| **2.4** Placements Tab UI | Medium | 2.3 | 2-3 hrs | P0 |
| **2.5** Add/Edit Placement Dialog | Medium | 2.3 | 1-2 hrs | P0 |
| **2.6** Settings: Shape & Shadow | Low | 2.1 | 1 hr | P1 |
| **2.7** Update Editor Tabs | Low | 2.4 | 30 min | P0 |
| **2.8** Embed Script Updates | Medium | 2.1 | 1-2 hrs | P0 |
| **2.9** Preview Updates | Low | 2.6 | 1 hr | P1 |
| **2.10** Testing & Polish | Low | All | 1 hr | P0 |

**Total V2 Estimate: 8-12 hours**

### Build Order (Dependency Graph)

```
Phase 2.1: Foundation
├── 2.1 Database Migration (30 min)
│    └── 2.2 TypeScript Types (15 min)
│
Phase 2.2: Core Features
├── 2.3 Server Actions (1-2 hrs) [depends on 2.1, 2.2]
│    ├── 2.4 Placements Tab UI (2-3 hrs)
│    │    └── 2.7 Update Editor Tabs (30 min)
│    └── 2.5 Add/Edit Dialog (1-2 hrs)
│
Phase 2.3: Polish (can run parallel)
├── 2.6 Shape/Shadow Settings (1 hr) [depends on 2.1]
│    └── 2.9 Preview Updates (1 hr)
├── 2.8 Embed Script Updates (1-2 hrs) [depends on 2.1]
│
Phase 2.4: Finalize
└── 2.10 Testing & Polish (1 hr) [depends on all]
```

### Task Details

#### 2.1 Database Migration
```sql
CREATE TABLE social_proof_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id UUID REFERENCES social_proof_widgets(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'signup',
  custom_event_text TEXT,
  page_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE social_proof_widgets
ADD COLUMN shape TEXT DEFAULT 'rounded',
ADD COLUMN shadow TEXT DEFAULT 'medium';

ALTER TABLE social_proof_events
ADD COLUMN placement_id UUID REFERENCES social_proof_placements(id);
```

#### 2.2 TypeScript Types
- `SocialProofPlacement` interface
- `SocialProofShape` = 'square' | 'rounded' | 'pill'
- `SocialProofShadow` = 'none' | 'subtle' | 'medium' | 'strong'

#### 2.3 Server Actions
- `getPlacementLimitInfo()`
- `getPlacements(widgetId)`
- `createPlacement(widgetId, data)`
- `updatePlacement(id, data)`
- `deletePlacement(id)`

#### 2.4 Placements Tab UI
Bitly-style table with columns: Name, Event Type, Page URL, Actions (Copy/Edit/Delete)

#### 2.5 Add/Edit Placement Dialog
Form fields: Name, Event Type (dropdown + custom), Page URL (optional)

#### 2.6 Shape & Shadow Settings
- Shape: Button group (Square / Rounded / Pill)
- Shadow: Dropdown (None / Subtle / Medium / Strong)

#### 2.7 Update Editor Tabs
Replace "Embed Code" tab with "Placements" tab

#### 2.8 Embed Script Updates
- Parse `&event=` parameter
- Filter events by type
- Apply shape/shadow CSS

#### 2.9 Preview Updates
Reflect shape and shadow in live preview

#### 2.10 Testing
- Verify placement limits by plan
- Test embed codes work independently
- Build passes

### Placement Limits by Plan

| Plan | Placements per Widget |
|------|----------------------|
| Free | 1 |
| Toolkit | 3 |
| Pro | 10 |

---

## Recommendation

**Ship V1 now. Build V2 when customers request it.**

V1 solves the core problem. V2 is a power-user feature for agencies managing multiple page types. Most users won't need it initially.

---

## Testing Checklist (V1)

See testing instructions in main documentation.
