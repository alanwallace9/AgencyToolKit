# Remaining Features Specification

## Executive Summary

Agency Toolkit is at **90% completion** (36 of 40 features). The core product is fully functional with all major features shipped:

- **Customization Suite**: Menu, Login Designer, Loading Animations, Dashboard Colors
- **Digital Adoption Platform**: Tours, Checklists, Smart Tips, Banners (all with builders + embed)
- **Guidely Themes**: Unified theming across all DAP components
- **Image Personalization**: Template editor, R2 storage, dynamic generation API
- **Social Proof**: TrustSignal widget system

**What Remains**: Polish, settings consolidation, plan enforcement, and quality-of-life improvements. No new major features - just finishing touches for production readiness.

---

## Session Start Prompt

```
Continue Agency Toolkit - Final 10% Sprint

## Project Context
Agency Toolkit is a SaaS for GHL agencies to customize white-label sub-accounts.
We're at 90% completion with all major features shipped. This session focuses on
the final polish and production readiness.

## What's Done (Don't Rebuild)
- Full DAP system: Tours, Checklists, Smart Tips, Banners (builders + embed)
- Guidely Themes: 5 templates, component overrides, per-feature defaults
- Image Personalization: Fabric.js editor, R2 storage, Sharp-based generation
- Customization: Menu editor, Login designer, Loading animations, Colors
- TrustSignal: Social proof widget system

## Remaining Work (Prioritize These)
See docs/features/remaining-features-spec.md for full details:

1. **Feature 44: Settings Page** - Consolidate scattered settings into one page
2. **Feature 45: Plan Gating** - Enforce Toolkit vs Pro limits, upgrade prompts
3. **Feature 34: URL Pattern Tester** - Test targeting patterns before going live
4. **Feature 46: Error Handling** - Consistent error states and toasts
5. **Feature 47: Mobile Responsiveness** - Dashboard works on tablets
6. **Feature 48: Documentation** - In-app help and onboarding

## First Steps
1. Read docs/features/remaining-features-spec.md
2. Review current Settings page: app/(dashboard)/settings/page.tsx
3. Check plan gating in lib/auth.ts (getCurrentAgency)
4. Propose prioritization order based on user impact

## Key Files
- docs/sprint.md - Progress tracking
- docs/CLAUDE.md - Project rules and patterns
- types/database.ts - All TypeScript types
- app/(dashboard)/settings/ - Current settings implementation
```

---

## Remaining Features

### Feature 34: URL Pattern Tester UI
**Priority**: Low | **Effort**: Small | **Impact**: Medium

**What**: A utility page to test URL patterns against sample URLs before deploying tours/tips/banners.

**Why**: Agencies configure URL targeting (exact, contains, wildcard, regex) but have no way to verify patterns work correctly before going live. Bad patterns = tours showing on wrong pages.

**Acceptance Criteria**:
- [ ] Input field for URL pattern
- [ ] Pattern type selector (exact, contains, starts_with, wildcard, regex)
- [ ] Input field for test URL(s) - support multiple
- [ ] Real-time match/no-match indicator
- [ ] Show which part of URL matched (highlight)
- [ ] Link from Tour/Tip/Banner targeting sections

**Tech Notes**:
- Reuse `lib/security/url-validator.ts` - already has `matchesUrlPattern()`
- Pure client-side, no API needed
- Could be a modal or standalone page at `/g/url-tester`

---

### Feature 44: Settings Page Complete
**Priority**: High | **Effort**: Medium | **Impact**: High

**What**: Consolidate all agency settings into a single, organized Settings page.

**Current State**: Settings are scattered:
- `/settings` - Basic embed code display
- `/colors` - Dashboard colors (separate page)
- `/loading` - Loading animations (separate page)
- GHL Domain is on settings page
- Builder auto-close is on settings page

**Proposed Structure**:
```
Settings
├── General
│   ├── Agency Name
│   ├── GHL Domain (for builder mode)
│   └── Builder Auto-Close toggle
├── Embed Code
│   ├── Script tag display
│   ├── Copy button
│   └── Installation instructions
├── Branding (consolidate from /colors)
│   ├── Primary/Accent colors
│   ├── Sidebar colors
│   └── Extended colors
├── Plan & Billing
│   ├── Current plan display
│   ├── Usage stats (customers, tours, etc.)
│   └── Upgrade button
└── Danger Zone
    ├── Reset all settings
    └── Delete account (future)
```

**Acceptance Criteria**:
- [ ] Tabbed or accordion layout for sections
- [ ] All agency settings editable in one place
- [ ] Embed code section with copy functionality
- [ ] Plan info with usage stats
- [ ] Auto-save with toast notifications
- [ ] Keep `/colors` and `/loading` as dedicated pages (link from settings)

**Tech Notes**:
- Extend existing `settings/page.tsx`
- Pull from `agency.settings` JSONB field
- Use shadcn Tabs or Accordion components

---

### Feature 45: Plan Gating & Upgrade Prompts
**Priority**: High | **Effort**: Medium | **Impact**: Critical

**What**: Enforce feature limits based on plan tier and show contextual upgrade prompts.

**Plan Tiers**:
| Feature | Toolkit ($19) | Pro ($39) |
|---------|---------------|-----------|
| Customers | 25 | Unlimited |
| Menu Customizer | ✅ | ✅ |
| Login/Loading/Colors | ✅ | ✅ |
| Tours | ❌ | ✅ |
| Checklists | ❌ | ✅ |
| Smart Tips | ❌ | ✅ |
| Banners | ❌ | ✅ |
| Image Personalization | ❌ | ✅ |
| TrustSignal | ❌ | ✅ |

**Current State**:
- `getCurrentAgency()` returns `agency.plan` field
- Some pages check `agency.plan !== 'pro'` but inconsistently
- Upgrade page exists at `/upgrade/[feature]` but is basic

**Acceptance Criteria**:
- [ ] Centralized plan check utility: `canAccessFeature(plan, feature)`
- [ ] Consistent gate on all Pro features (redirect to upgrade)
- [ ] Customer limit enforcement (block creation at 25 for Toolkit)
- [ ] Contextual upgrade prompts (not just redirects)
- [ ] "Pro" badge in sidebar for gated features
- [ ] Upgrade page shows feature benefits + pricing

**Tech Notes**:
- Create `lib/plan-gating.ts` with feature map
- HOC or hook: `useFeatureGate('tours')`
- Upgrade prompts as inline banners, not just page redirects
- Consider soft gates (show preview, prompt on action)

---

### Feature 46: Error Handling & Toasts
**Priority**: Medium | **Effort**: Small | **Impact**: Medium

**What**: Consistent error states and user feedback across the app.

**Current State**:
- Using `sonner` for toasts (already installed)
- Inconsistent error handling in server actions
- Some pages have no error states
- API errors sometimes swallowed

**Acceptance Criteria**:
- [ ] All server actions wrapped in try/catch with toast feedback
- [ ] Loading states on all async operations
- [ ] Empty states for all list pages (already mostly done)
- [ ] Error boundary for unexpected crashes
- [ ] Consistent toast patterns (success = green, error = red)
- [ ] Network error handling (offline state)

**Tech Notes**:
- Audit all `_actions/*.ts` files for error handling
- Create `components/shared/error-boundary.tsx`
- Standardize toast messages (keep concise)

---

### Feature 47: Mobile Responsiveness
**Priority**: Low | **Effort**: Medium | **Impact**: Low

**What**: Ensure dashboard is usable on tablets (not phones - GHL isn't mobile).

**Current State**:
- Desktop-first design
- Some pages may break on smaller screens
- Navigation menu works on mobile (hamburger)

**Acceptance Criteria**:
- [ ] All pages render correctly at 768px width (iPad)
- [ ] Tables become cards or scroll horizontally
- [ ] Forms stack vertically on narrow screens
- [ ] Modal dialogs don't overflow
- [ ] Tour/Tip builders have responsive 2-panel → stacked layout

**Tech Notes**:
- Use Tailwind responsive prefixes (`md:`, `lg:`)
- Test on iPad simulator
- Low priority - most agencies use desktop

---

### Feature 48: Documentation & Help
**Priority**: Low | **Effort**: Medium | **Impact**: Medium

**What**: In-app help content and onboarding guidance.

**Current State**:
- No in-app documentation
- Some pages have brief descriptions
- No onboarding flow for new users

**Acceptance Criteria**:
- [ ] Help tooltips on complex features
- [ ] "Learn more" links to docs (external or modal)
- [ ] First-time user onboarding checklist
- [ ] Video embed support for tutorials
- [ ] Contextual help panel (slide-out)

**Tech Notes**:
- Could use our own Checklist feature for onboarding!
- Help content stored in MDX or CMS
- Lower priority than core features

---

## Tech Spec Summary

### Architecture (No Changes)
- Next.js 15.5 App Router
- Clerk auth with async `auth()`
- Supabase Postgres + RLS
- Tailwind CSS 4 + shadcn/ui

### Database (No Changes Needed)
All tables exist. Plan gating uses `agencies.plan` field.

### New Files to Create
```
lib/plan-gating.ts              # Feature access control
components/shared/error-boundary.tsx
components/shared/upgrade-prompt.tsx
app/(dashboard)/g/url-tester/   # URL pattern tester (optional)
```

### Files to Modify
```
app/(dashboard)/settings/page.tsx    # Expand with sections
app/(dashboard)/settings/_components/* # New setting panels
lib/auth.ts                          # Add plan utilities
```

### Testing Checklist
- [ ] Create Toolkit plan test account
- [ ] Verify all Pro features gated
- [ ] Test customer limit at 25
- [ ] Test upgrade flow end-to-end
- [ ] Responsive testing at 768px, 1024px, 1440px

---

## Prioritization Recommendation

### Must Have (Ship Blockers)
1. **Feature 45: Plan Gating** - Can't launch without enforcing paid features
2. **Feature 44: Settings Page** - Users need to manage their account

### Should Have (Quality)
3. **Feature 46: Error Handling** - Professional UX
4. **Feature 34: URL Pattern Tester** - Prevents support tickets

### Nice to Have (Polish)
5. **Feature 47: Mobile** - Low usage on mobile
6. **Feature 48: Documentation** - Can add post-launch

---

## Estimated Effort

| Feature | Effort | Sessions |
|---------|--------|----------|
| 45: Plan Gating | Medium | 1 |
| 44: Settings | Medium | 1 |
| 46: Error Handling | Small | 0.5 |
| 34: URL Tester | Small | 0.5 |
| 47: Mobile | Medium | 1 |
| 48: Documentation | Medium | 1 |
| **Total** | | **~5 sessions** |

---

## Backlog (Not in Scope)

These are deferred and should NOT be worked on:
- Feature 21: Tour Preview (Live iframe)
- Features 32-33: Resource Center
- Features 40-41: GBP Dashboard
