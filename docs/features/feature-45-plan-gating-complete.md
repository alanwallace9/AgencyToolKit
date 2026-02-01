# Feature 45: Plan Gating & Upgrade Prompts - COMPLETE

**Status:** Completed 2026-02-01
**Session:** Context compaction occurred, continuing from previous work

---

## What Was Built

### 1. Soft Gate UX Pattern
Users can **explore and create freely** but see upgrade modal on **Publish/Save** actions.

**Philosophy (Alex Hormozi approach):**
- If it scales for free, give it for free
- Only charge for features with real operational costs
- Toolkit = Free tier (unlimited)
- Pro = $49/mo (placeholder price)

### 2. Components Created

| Component | Path | Purpose |
|-----------|------|---------|
| `use-soft-gate.ts` | `/hooks/` | Reusable hook with `gatedAction()` wrapper |
| `pro-badge.tsx` | `/components/shared/` | Gold PRO badge + superscript variant |
| `upgrade-banner.tsx` | `/components/shared/` | Sticky banner for Pro feature pages |
| `upgrade-modal.tsx` | `/components/shared/` | Modal triggered on save/publish |
| `plan-gating.ts` | `/lib/` | Central feature access utilities |

### 3. Files Modified

**Removed hard gates from server actions:**
- `tours/_actions/tour-actions.ts` - Tour creation
- `tours/_actions/theme-actions.ts` - Theme creation
- `g/themes/_actions/guidely-theme-actions.ts` - Guidely theme creation
- `images/_actions/image-actions.ts` - Image template creation
- `tours/themes/[id]/page.tsx` - Theme editor page

**Added soft gates to builders:**
- `tours/[id]/_components/tour-editor.tsx` - Publish, Save as Template
- `tours/checklists/[id]/_components/checklist-builder.tsx` - Publish
- `tours/banners/[id]/_components/banner-builder.tsx` - Publish
- `g/tips/[id]/_components/smart-tips-builder.tsx` - Publish
- `g/themes/[id]/_components/guidely-theme-editor.tsx` - Save, Set Default
- `images/_components/images-client.tsx` - Create, Duplicate
- `images/[id]/_components/image-editor.tsx` - Save

**Added upgrade banners:**
- `g/layout.tsx` - Guidely section
- `images/page.tsx` - Images list
- `images/[id]/page.tsx` - Image editor

### 4. Styling Changes

**Gold PRO badge (was purple):**
```css
/* globals.css */
--plan-pro: 43 96% 56%; /* Gold/amber */

.badge-pro {
  background: linear-gradient(135deg, hsl(43 96% 56%) 0%, hsl(48 96% 53%) 100%);
  @apply text-amber-950 font-semibold;
}
```

**PRO superscript in nav:**
- Gold `PRO` text next to Guidely and Images links for non-Pro users

### 5. Database Changes

```sql
-- Removed 'free' tier
UPDATE agencies SET plan = 'toolkit' WHERE plan = 'free';
ALTER TABLE agencies DROP CONSTRAINT IF EXISTS agencies_plan_check;
ALTER TABLE agencies ADD CONSTRAINT agencies_plan_check CHECK (plan IN ('toolkit', 'pro'));
ALTER TABLE agencies ALTER COLUMN plan SET DEFAULT 'toolkit';
```

---

## Decisions Made

### Pricing Model
| Feature | Toolkit (Free) | Pro ($49/mo) |
|---------|----------------|--------------|
| Menu Customizer | ✅ | ✅ |
| Login/Loading/Colors | ✅ | ✅ |
| Theme Builder | ✅ | ✅ |
| TrustSignal (agency site) | ✅ | ✅ |
| TrustSignal (sub-accounts) | ❌ | ✅ |
| Guidely (Tours, Checklists, etc.) | Preview | ✅ |
| Image Personalization | Preview | ✅ |
| Customer Limit | Unlimited | Unlimited |

### Banner Messaging
**Before:** "You're in sandbox mode. Upgrade to save & publish."
**After:** "Create & explore freely — upgrade to Pro to publish your guidely."

---

## Still To Implement

### 1. Self-Dogfooding Guidely: "Tour of Tours"

**The Idea:**
Use Guidely to introduce Guidely itself. When a user first visits `/g/tours`, they'd see an actual Guidely tour walking them through:
- Step 1 (Modal): "Welcome to Guidely! Let's show you how to create tours."
- Step 2 (Tooltip): Points to "+ New Tour" button
- Step 3 (Tooltip): Points to templates section
- Step 4 (Tooltip): Points to a sample tour card
- Step 5 (Modal): "Ready to create your first tour?"

**The Problem:**
Our current builder mode only works on GHL sites because:
- Builder mode opens the live GHL site with `?builder_mode=true`
- Our embed script detects this and shows the overlay toolbar
- It's NOT iframe-based - it's a JS script injected on the live site
- Currently, the embed script only runs on GHL domains

**Options Discussed:**

| Option | Description | Effort | Verdict |
|--------|-------------|--------|---------|
| **A. Hardcoded tour** | Manually code Driver.js steps in React. No builder mode. | Low | Quick but inflexible |
| **B. Self-Embed** | Add our domains to whitelist, use actual builder mode | Medium | **CHOSEN** - Real dogfooding |
| **C. Universal Mode** | Let users tour ANY website via iframe | Medium | Won't work - most sites block iframes |
| **D. Browser Extension** | Chrome extension injects on any site | 2-3 weeks | V2 feature |

**Decision: Option B (Self-Embed)**

We'll add `localhost:3000` and `agencytoolkit.com` to the embed script's domain whitelist, then:
1. Navigate to `/g/tours?builder_mode=true`
2. Use existing element selector to pick elements
3. Save tour like normal
4. Embed script plays it back on our pages

**Files to modify:**
- Embed script domain whitelist (check where domains are validated)
- Builder mode URL validation
- Possibly CORS settings

---

### 2. System Templates for Empty State

**Current State:**
- Empty state shows "No tours yet" with create button
- `tour_templates` table only stores agency-created templates
- No pre-built system templates exist

**What We Need:**
Pre-built templates all users can access:
- "Welcome Tour" template (3 steps - intro modal, key highlights)
- "Feature Discovery" template (4 steps - tooltip highlights)
- "Onboarding Flow" template

**Implementation:**
- Add `is_system` boolean column to `tour_templates` table
- Seed system templates (NULL agency_id, is_system=true)
- Update empty state UI to show templates
- Allow users to duplicate system templates

---

### 3. Browser Extension (Future/V2)

**Why It Matters:**
For touring ANY website (not just GHL or Agency Toolkit), a browser extension is the only real solution. This is how Pendo, WalkMe, Appcues work.

**Architecture:**
```
┌─────────────────────────────────────────────────────┐
│ Browser Extension                                    │
├─────────────────────────────────────────────────────┤
│ manifest.json     - Permissions, config             │
│ Content Script    - Injected into pages             │
│                   - Element selector                │
│                   - Driver.js for playback          │
│ Background Script - API calls, auth sync            │
│ Popup UI          - Login, toggle builder, actions  │
└─────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│ Backend API                                          │
├─────────────────────────────────────────────────────┤
│ - Endpoints for extension to fetch/save tours       │
│ - Domain configurations per agency                  │
│ - Auth bridge with Clerk                            │
└─────────────────────────────────────────────────────┘
```

**Workload Estimate:**

| Component | Description | Effort |
|-----------|-------------|--------|
| manifest.json | Extension config, permissions | 1 day |
| Content Script | Element selector, Driver.js playback | 1 week |
| Background Script | API calls, auth sync with Clerk | 3-4 days |
| Popup UI | Small React app - login, toggle, actions | 3-4 days |
| Backend API | Endpoints for extension | 2-3 days |
| Auth Bridge | Sync Clerk session to extension | 2-3 days |

**Totals:**
- MVP (Chrome only): **2-3 weeks**
- Polished (nice UI, error handling): **4-5 weeks**
- Multi-browser (Firefox, Safari): **+1 week each**

**What We'd Reuse:**
- Driver.js (tour playback) ✅
- Tour data structure ✅
- Themes system ✅
- API patterns ✅

**What's New:**
- Extension architecture
- Cross-origin messaging
- Extension-specific auth flow

**Decision:** Browser extension is a **V2/future feature**. For now, self-embed solves our dogfooding need.

---

## Questions for Next Session

These are questions Claude should ask at the start of the next session:

### 1. Self-Embed Scope
**Question:** Should the self-embed feature be hardcoded to just Agency Toolkit domains, or should we make it configurable so customers can tour their own SaaS apps too?

**Context:** If we make it configurable, it becomes a feature: "Tour any website you control" - users add their domain, embed script, build tours. This could be a differentiator before we build a full browser extension.

**Options:**
- A) Hardcode to just our domains (quick, simple)
- B) Make it configurable (more work, but adds value for customers)

---

### 2. System Templates Content
**Question:** What 2-3 starter templates should we create?

**Options:**
- GHL-specific: "GHL Dashboard Tour", "GHL Settings Walkthrough"
- Generic: "Welcome Tour", "Feature Discovery", "Onboarding Checklist"
- Both

**Consideration:** GHL-specific templates demonstrate GHL knowledge but limit reuse. Generic templates are more flexible.

---

### 3. Meta-Tour Trigger
**Question:** How should the "Welcome to Guidely" tour be triggered?

**Options:**
- A) Auto-trigger on first visit to /g/* (could be annoying)
- B) Show a "Take a Tour" button that users click
- C) Part of a broader onboarding checklist
- D) Combination: Auto-trigger once, then accessible via help button

---

### 4. Browser Extension Priority
**Question:** Is browser extension a V2 feature, or should it move up the roadmap?

**Context:** Browser extension would unlock "tour any website" which is powerful. Estimated 2-3 weeks for MVP.

**Consideration:** Could be a major differentiator. Pendo/WalkMe charge enterprise prices for this.

---

### 5. Stripe Integration Timeline
**Question:** When should we integrate Stripe for actual payments?

**Current state:** Upgrade buttons use placeholder link. Need:
- Payment link or Checkout Session
- Webhook to update `agency.plan` on success
- Handle cancellations/downgrades

**Options:**
- A) Before launch (required for monetization)
- B) Soft launch first, add Stripe in week 2
- C) Manual upgrades initially (user contacts, we update DB)

---

## Next Session Prompt

**Copy this entire prompt to start the next session:**

```
Read /docs/features/feature-45-plan-gating-complete.md for full context.

## Summary
Last session we completed Feature 45 (Plan Gating & Soft Gate UX). We also discussed using Guidely to tour Guidely itself ("Tour of Tours") and decided on a self-embed approach rather than building a browser extension.

## Completed
- Soft gate UX: Users create/explore freely, upgrade modal on Publish
- Gold PRO badge (was purple)
- Upgrade banner on /g/* and /images pages
- Removed all server-side hard gates
- All builders use useSoftGate hook

## Current Tasks
1. **Self-Embed for Dogfooding:**
   - Add localhost:3000 and agencytoolkit.com to embed script domain whitelist
   - Test builder mode on /g/tours?builder_mode=true
   - Create "Welcome to Guidely" tour using our own tool

2. **System Templates:**
   - Add is_system column to tour_templates table
   - Create 2-3 starter templates
   - Update empty state UI

## Questions to Ask Me
Before starting, ask me about (see doc for full context):
1. Self-embed scope: Just our domains or configurable for customers?
2. System templates: GHL-specific, generic, or both?
3. Meta-tour trigger: Auto on first visit or manual?
4. Browser extension priority: V2 or sooner?
5. Stripe integration timeline

## Key Files
- Embed script (find domain whitelist)
- Builder mode URL validation
- tour_templates table schema

## Architecture Note
Our builder mode is NOT iframe-based. It opens the live site with ?builder_mode=true and our embed script shows an overlay toolbar. This is why we need to whitelist our own domain to tour our own app.
```

---

## Files Reference

```
Created:
- /hooks/use-soft-gate.ts
- /components/shared/pro-badge.tsx
- /components/shared/upgrade-banner.tsx
- /components/shared/upgrade-modal.tsx
- /lib/plan-gating.ts
- /docs/spec/PRICING_AND_PLANS.md
- /docs/features/feature-45-plan-gating-complete.md (this file)

Modified:
- /app/globals.css (gold badge styling)
- /app/(dashboard)/layout.tsx (badge uses gold)
- /components/dashboard/main-nav.tsx (PRO superscripts)
- /app/(dashboard)/g/layout.tsx (upgrade banner)
- /types/database.ts (removed 'free' plan type)
- Multiple builder components (soft gate integration)
- Multiple server actions (removed hard gates)
```
