# Pricing and Plans Specification

**Last Updated:** 2026-01-31
**Status:** Approved

---

## Executive Summary

Agency Toolkit follows the **Alex Hormozi pricing philosophy**: if it scales for free, give it for free. Only charge when there are real costs involved.

**Two tiers:**
- **Toolkit (Free)** - Core customization features
- **Pro ($49/mo placeholder)** - Advanced features with operational costs

**Add-on:**
- **TrustSignal for Customers** - $5/customer/month (billed to agency)

---

## Tier Breakdown

### Toolkit (Free Tier)

Features that cost nothing to run at scale:

| Feature | Description | Marginal Cost |
|---------|-------------|---------------|
| **Menu Customizer** | Hide, rename, reorder GHL sidebar items | $0 - JSON config |
| **Theme Builder** | Login page designer, loading animations, dashboard colors | $0 - JSON config |
| **Customer Management** | Unlimited customers (no arbitrary limits) | $0 - DB rows |
| **TrustSignal (Agency Site)** | Social proof popups on agency's own website | $0 - Client-side widget |

**Why free?** All features are just configuration stored in the database and rendered client-side. No compute, no storage, no API costs.

### Pro ($49/month - placeholder)

Features with real operational costs or significant value:

| Feature | Description | Cost Driver |
|---------|-------------|-------------|
| **Guidely** | Tours, Checklists, Smart Tips, Banners | Human maintenance (~4x/year when GHL updates) |
| **Image Personalization** | Dynamic image generation with customer names | Vercel Blob storage + Sharp compute |
| **Future Features** | Any new features added to Pro | Included |

**Competitive Justification:**
- Userlane (similar to Guidely): $69-79/month
- Nifty Images: $25/month
- Combined value: $94-104/month
- Our price: $49/month (placeholder, may be $39-69)

### TrustSignal Customer Add-On

**Model:** Agency pays $5/month per customer sub-account that has TrustSignal enabled.

| Scenario | Monthly Cost |
|----------|--------------|
| Agency only (own site) | Free |
| Agency + 5 customers | $25/month |
| Agency + 20 customers | $100/month |

**Cost Driver:** Google Places API for pulling reviews (future feature). Even without Google Reviews, this represents value delivered to customer sub-accounts.

**Billing:** Aggregated per agency, billed monthly to the agency owner. The end customer (sub-account) is never billed directly.

---

## What's NOT Included

### Removed Features
- ~~GBP Dashboard~~ - Separate lead magnet product
- ~~Customer Limits~~ - Was arbitrary, removed

### Deferred to Backlog
- Google Reviews integration (requires API, has costs)
- Resource Center
- Tour Live Preview

---

## Database Schema

### Current State

```sql
-- agencies.plan field
plan TEXT CHECK (plan IN ('free', 'toolkit', 'pro')) DEFAULT 'free'
```

### Target State (Feature 45)

```sql
-- Simplify to two tiers (toolkit = free)
plan TEXT CHECK (plan IN ('toolkit', 'pro')) DEFAULT 'toolkit'
```

### Future State (TrustSignal Per-Customer)

```sql
-- Track which customers have TrustSignal enabled (for billing)
CREATE TABLE customer_trustsignal_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  widget_id UUID REFERENCES social_proof_widgets(id) ON DELETE SET NULL,

  -- Billing status
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'cancelled', 'past_due')),

  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  cancelled_at TIMESTAMPTZ,

  -- Stripe integration (future)
  stripe_subscription_item_id TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One subscription per customer
  UNIQUE(customer_id)
);

-- Index for agency billing aggregation
CREATE INDEX idx_customer_ts_subs_agency ON customer_trustsignal_subscriptions(agency_id, status);
```

**Billing Query Example:**
```sql
-- Get all agencies with their TrustSignal customer counts
SELECT
  a.id,
  a.name,
  a.plan,
  COUNT(cts.id) AS trustsignal_customer_count,
  COUNT(cts.id) * 5 AS monthly_addon_cost
FROM agencies a
LEFT JOIN customer_trustsignal_subscriptions cts
  ON cts.agency_id = a.id AND cts.status = 'active'
GROUP BY a.id, a.name, a.plan;
```

---

## Soft Gate UX Pattern

**Philosophy:** Let users experience value before asking them to pay. They invest time building, then the ask feels more reasonable.

### How It Works

| User Action | Toolkit User Experience |
|-------------|-------------------------|
| Navigate to `/g/tours` | ✅ Can access |
| Create a new tour | ✅ Can click "New Tour" |
| Add steps, configure settings | ✅ Can interact with full UI |
| Play with themes, targeting, preview | ✅ Can explore everything |
| Click **Save** or **Publish** | 🔒 Upgrade modal appears |
| View embed code | 🔒 Hidden behind paywall |

### What NOT To Do

| Anti-Pattern | Why It's Wrong | Our Approach |
|--------------|----------------|--------------|
| Lock icon on nav | Feels restrictive | Small gold "PRO" badge |
| Disabled save/publish buttons | User can't explore commitment | Buttons work, trigger modal |
| Purple pro badge | Doesn't feel premium | Gold/amber color |
| Block page entirely | User never sees value | Full access, gate on save |

### Sticky Pro Banner

A persistent banner at the top of gated pages:

```
┌──────────────────────────────────────────────────────────────────────┐
│ ⭐ Pro Feature - You're in sandbox mode. Upgrade to save & publish. │
│                                                    [Upgrade to Pro]  │
└──────────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Sticky - stays visible as they scroll
- Pushes content down (not overlay)
- NOT dismissible - always visible
- Includes upgrade CTA button

### Nav Badge Style

Small superscript "PRO" badge in gold/amber:

```
Dashboard   Customize   Guidely ᴾᴿᴼ   Images ᴾᴿᴼ   TrustSignal   Settings
```

- Gold/amber color (not purple)
- Small, like a notification count
- Indicates premium feature

### Upgrade Modal

Triggered when user clicks Save/Publish on a gated feature.

**Tone:** Friendly + Value-focused combo

```
┌─────────────────────────────────────────────────────────────────┐
│                                                           [X]   │
│                           ⭐                                    │
│                                                                 │
│              Unlock Guidely with Pro                            │
│                                                                 │
│   You've built something great! Upgrade to Pro to:              │
│                                                                 │
│   ✓ Save and publish your tours                                 │
│   ✓ Track customer completion                                   │
│   ✓ Use unlimited tours, checklists, tips & banners             │
│   ✓ Access Image Personalization                                │
│                                                                 │
│   All for just $49/month                                        │
│                                                                 │
│              [ Upgrade to Pro ]                                 │
│                                                                 │
│              Maybe later                                        │
└─────────────────────────────────────────────────────────────────┘
```

**Payment Button:** Shows "Coming Soon" or links to Stripe (future)

---

## Feature Gating Logic

### Centralized Utility (`lib/plan-gating.ts`)

```typescript
export type PlanTier = 'toolkit' | 'pro';

export type GatedFeature =
  | 'guidely'           // Tours, Checklists, Tips, Banners
  | 'images'            // Image Personalization
  | 'trustsignal_customers'; // TrustSignal for sub-accounts (add-on)

export const FEATURE_ACCESS: Record<GatedFeature, PlanTier[]> = {
  guidely: ['pro'],
  images: ['pro'],
  trustsignal_customers: ['pro'], // Also requires per-customer subscription
};

export function canAccessFeature(plan: PlanTier, feature: GatedFeature): boolean {
  return FEATURE_ACCESS[feature].includes(plan);
}

// For components
export function useFeatureGate(feature: GatedFeature) {
  const { agency } = useAgency(); // Your agency context
  const hasAccess = canAccessFeature(agency.plan, feature);
  return { hasAccess, plan: agency.plan };
}
```

### Pages to Gate

| Page/Route | Feature | Gate Type |
|------------|---------|-----------|
| `/g/*` (Guidely) | `guidely` | Hard gate - show upgrade prompt |
| `/g/tours/*` | `guidely` | Hard gate |
| `/g/checklists/*` | `guidely` | Hard gate |
| `/g/tips/*` | `guidely` | Hard gate |
| `/g/banners/*` | `guidely` | Hard gate |
| `/g/themes/*` | `guidely` | Hard gate |
| `/g/analytics/*` | `guidely` | Hard gate |
| `/images/*` | `images` | Hard gate - show upgrade prompt |
| `/trustsignal/*` | None | Free for agency use |

### Soft Gates (Future)

For some features, we may show a preview but gate the action:
- "Create Tour" button → upgrade prompt if not Pro
- Tour list shows existing tours but can't edit

---

## Upgrade Flow

### Current Upgrade Page
`/upgrade/[feature]` - Shows benefits and upgrade button

### Upgrade Prompts Should Include:
1. Feature name and icon
2. 3-5 bullet points of benefits
3. Price ($49/mo or current)
4. "Upgrade to Pro" CTA
5. "Back to Dashboard" secondary action

### Stripe Integration (Future)
- `agencies.stripe_customer_id` - Already exists
- `agencies.stripe_subscription_id` - Already exists
- Webhook to update `plan` field on subscription change

---

## Launch Strategy (Not in Code)

### Founding Members Program
- 50 founding members OR 10 customers for feedback
- Duration: TBD (6 months or 1 year)
- Purpose: Gather feedback, guide product direction

### Affiliate Program
- Planned for future
- Will need tracking mechanism
- Not in initial launch scope

---

## Implementation Phases

### Phase 1: Feature 45 (Current Sprint)
- [ ] Update database: Remove 'free', keep 'toolkit' and 'pro'
- [ ] Create `lib/plan-gating.ts` with feature access map
- [ ] Gate all Guidely pages (`/g/*`)
- [ ] Gate Image Personalization (`/images/*`)
- [ ] Update upgrade page with all features
- [ ] Add Pro badges to navigation
- [ ] Update `SOCIAL_PROOF_WIDGET_LIMITS` (toolkit = unlimited for agency)

### Phase 2: TrustSignal Per-Customer (Post-Launch)
- [ ] Create `customer_trustsignal_subscriptions` table
- [ ] Add UI to enable TrustSignal per customer
- [ ] Add billing aggregation view in Settings
- [ ] Stripe metered billing integration

### Phase 3: Google Reviews (Future)
- [ ] Google Places API integration
- [ ] Additional per-customer costs
- [ ] Update pricing model if needed

---

## Migration Notes

### Existing Agencies
When deploying Feature 45:
1. Agencies with `plan = 'free'` → migrate to `plan = 'toolkit'`
2. Agencies with `plan = 'toolkit'` → keep as is
3. Agencies with `plan = 'pro'` → keep as is

```sql
-- Migration script
UPDATE agencies SET plan = 'toolkit' WHERE plan = 'free';
```

### Type Updates
Update `types/database.ts`:
```typescript
// Before
plan: 'free' | 'toolkit' | 'pro';

// After
plan: 'toolkit' | 'pro';
```

Update `SOCIAL_PROOF_WIDGET_LIMITS`:
```typescript
// Before
export const SOCIAL_PROOF_WIDGET_LIMITS: Record<string, number> = {
  free: 0,
  toolkit: 5,
  pro: Infinity,
};

// After
export const SOCIAL_PROOF_WIDGET_LIMITS: Record<string, number> = {
  toolkit: Infinity,  // Free for agency's own site
  pro: Infinity,
};
```

---

## Open Questions (To Resolve Before Building)

### 1. Embed Code Separation

Current state: One embed code on Settings page that includes both CSS (Theme Builder) and JS (Guidely/Tours).

**Problem:** If embed code is the same for free and pro, how do we gate it?

**Options to consider:**
- **Option A:** CSS embed = free, JS embed = separate Pro code
- **Option B:** Single embed, but JS features only activate for Pro agencies
- **Option C:** Two separate embed codes displayed based on plan

**Investigation needed:**
- Review `app/(dashboard)/settings/_components/` for current embed display
- Review `app/embed.js/route.ts` for what's CSS vs JS
- Determine if embed script already checks `agency.plan`

### 2. TrustSignal Customer Install UI

When agency attaches TrustSignal to a customer sub-account ($5/mo), where does the confirmation appear?

**Options:**
- Customer edit page (`/customers/[id]`) - toggle to enable
- TrustSignal page - list of customers with enable/disable
- Dedicated page for customer add-ons

**Note:** UI not built yet. This is Phase 2 (post-launch).

---

## Summary

| Question | Answer |
|----------|--------|
| How many tiers? | 2 (Toolkit free, Pro paid) |
| What's in Toolkit? | Menu, Theme, Customers, TrustSignal (agency) |
| What's in Pro? | Guidely, Images, Future features |
| Pro price? | $49/mo placeholder |
| TrustSignal for customers? | $5/customer/month add-on (Pro only) |
| Customer limits? | None (removed) |
| GBP Dashboard? | Removed (separate product) |
| Founding members? | 50 free, duration TBD |

---

## Approval

- [x] Pricing philosophy confirmed (Hormozi approach)
- [x] Two-tier model approved (Toolkit + Pro)
- [x] TrustSignal per-customer model approved ($5/customer/month)
- [x] Feature allocation confirmed
- [x] Deferred features identified

**Ready for Feature 45 implementation.**
