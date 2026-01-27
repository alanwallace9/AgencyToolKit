# Smart Tips Session Handoff

**Date:** 2026-01-27
**Previous Session:** Guidely Left Nav Refactor (complete)
**Next Feature:** Features 28-29 Smart Tips Builder + Embed

---

## Context

The Guidely left navigation is now complete. Smart Tips needs to integrate into this structure.

### What Was Built

1. **Guidely Sidebar** (`app/(dashboard)/g/_components/guidely-sidebar.tsx`)
   - Collapsible sidebar with hover expand and pin functionality
   - "Guidely" header is clickable → navigates to `/g` dashboard
   - Smart Tips already listed with "Coming Soon" badge

2. **Route Structure** (under `/g/`)
   - `/g` - Guidely dashboard with feature cards
   - `/g/tours` - Tours list
   - `/g/tours/[id]` - Tour builder
   - `/g/checklists` - Checklists list
   - `/g/checklists/[id]` - Checklist builder
   - `/g/banners` - Banners list
   - `/g/banners/[id]` - Banner builder
   - `/g/themes` - Themes list
   - `/g/themes/[id]` - Theme editor
   - `/g/analytics` - Analytics dashboard

3. **Pattern for New Features**
   - List page at `/g/[feature]/page.tsx`
   - Client component at `/g/[feature]/_components/[feature]-list-client.tsx`
   - Builder page at `/g/[feature]/[id]/page.tsx`
   - Builder component lives in original location (e.g., `tours/tips/[id]/_components/`)
   - Builder wrapper passes `backHref="/g/tips"` prop

---

## Smart Tips Integration Plan

### 1. Routes to Create

```
app/(dashboard)/g/tips/
├── page.tsx                    # List page (server component)
├── _components/
│   └── tips-list-client.tsx    # Client component with search, filter, create
└── [id]/
    └── page.tsx                # Builder page (wraps SmartTipsBuilder)
```

### 2. Builder Components Location

Following the established pattern, build the Smart Tips builder at:

```
app/(dashboard)/tours/tips/[id]/
├── page.tsx                    # Original route (will redirect to /g/tips/[id])
└── _components/
    ├── smart-tips-builder.tsx  # Main layout with collapsible settings
    ├── tips-list-panel.tsx     # Left panel: tips with ⚙ gear icons
    ├── tip-settings-panel.tsx  # Collapsible center panel (slides in/out)
    ├── tip-preview.tsx         # Right panel: expands when settings closed
    └── tip-global-settings.tsx # Sheet: targeting, theme selection
```

**Key UX Pattern:** Settings panel is collapsible
- Click ⚙ gear on tip → settings slides in
- Click ✕ or gear again → settings slides out, preview expands
- Auto-save on all changes

### 3. Server Actions

Create at `app/(dashboard)/tours/_actions/smart-tip-actions.ts`:
- Follow the pattern from `banner-actions.ts` and `checklist-actions.ts`
- Include: getSmartTips, getSmartTip, createSmartTip, updateSmartTip, deleteSmartTip, publishSmartTip, unpublishSmartTip, archiveSmartTip, duplicateSmartTip

### 4. Sidebar Update

When ready, update `guidely-sidebar.tsx`:
```tsx
{
  title: "Smart Tips",
  href: "/g/tips",
  icon: Lightbulb,
  description: "Contextual tooltips",
  // Remove: comingSoon: true,
},
```

### 5. Dashboard Card Update

Update `/g/page.tsx` to fetch and display Smart Tips stats (currently shows "Coming soon").

### 6. Redirects

Add to `next.config.ts`:
```ts
{
  source: '/tours/tips/:id',
  destination: '/g/tips/:id',
  permanent: true,
},
```

---

## Key Files to Reference

| Purpose | File |
|---------|------|
| Sidebar with nav items | `app/(dashboard)/g/_components/guidely-sidebar.tsx` |
| Dashboard with cards | `app/(dashboard)/g/page.tsx` |
| List page pattern | `app/(dashboard)/g/banners/page.tsx` |
| List client pattern | `app/(dashboard)/g/banners/_components/banners-list-client.tsx` |
| Builder wrapper pattern | `app/(dashboard)/g/banners/[id]/page.tsx` |
| Builder with backHref | `app/(dashboard)/tours/banners/[id]/_components/banner-builder.tsx` |
| Server actions pattern | `app/(dashboard)/tours/_actions/banner-actions.ts` |
| 3-column layout pattern | `app/(dashboard)/tours/checklists/[id]/_components/checklist-builder.tsx` |
| Redirects config | `next.config.ts` |

---

## Database

The `smart_tips` table should already exist from Feature 18 migration. Verify schema matches the spec in `docs/features/feature-28-29-smart-tips.md`.

---

## Reusable Components

From the spec, these can be imported directly:
- `ElementSelectorField` from `tours/[id]/_components/element-selector-field.tsx`
- `useElementSelector` hook from `tours/[id]/_hooks/use-element-selector.ts`
- Theme selector pattern from `banner-settings-panel.tsx`
- Targeting UI patterns from `checklist-settings-panel.tsx`

---

## Key Decisions Made

| Decision | Choice |
|----------|--------|
| **Content format** | Plain text + links only (no bold/italic). Links for Loom videos, help docs, courses. |
| **Tips list** | Flat list with status filter (like banners) |
| **Analytics** | Deferred to Phase 3 backlog (track views/clicks later) |
| **Settings panel** | Collapsible - click ⚙ to open, preview expands when closed |
| **Character limit** | 200 chars recommended, show counter (e.g., "142/200") |

---

## Checklist for Smart Tips Session

1. [ ] Create database migration if `smart_tips` table doesn't exist
2. [ ] Create `smart-tip-actions.ts` server actions
3. [ ] Create builder components in `tours/tips/[id]/_components/`
4. [ ] Create `/g/tips/page.tsx` list page
5. [ ] Create `/g/tips/_components/tips-list-client.tsx`
6. [ ] Create `/g/tips/[id]/page.tsx` builder wrapper
7. [ ] Update sidebar to remove "Coming Soon" from Smart Tips
8. [ ] Update dashboard `/g/page.tsx` to show Smart Tips stats
9. [ ] Add redirect in `next.config.ts`
10. [ ] Update embed.js to load and display smart tips
11. [ ] Test all navigation paths
12. [ ] Run build, fix any issues

---

## Spec Document

Full specification: `docs/features/feature-28-29-smart-tips.md`
