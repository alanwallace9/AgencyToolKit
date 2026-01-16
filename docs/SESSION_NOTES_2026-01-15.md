# Session Notes - January 15, 2026

## FIRST THING TO DO WHEN RESUMING

**1. Embed your embed script into your GHL white-label account!**

Add this to your GHL Custom JS section (Settings → White Label → Custom JS):
```javascript
// Agency Toolkit - add after your existing favicon code
var s=document.createElement('script');s.src='https://agencytoolkit.vercel.app/embed.js?key=al_f63631494c1ade12';document.head.appendChild(s);
```

**2. Test the Visual Element Selector:**
1. Go to Agency Toolkit → Tours → Create/Edit a tour
2. Change step type to **Tooltip** or **Hotspot**
3. Click the **🎯 Select** button
4. The builder toolbar should appear at top of your GHL page
5. Toggle "Builder Mode" ON, hover elements, click to select

---

## Commits This Session (oldest → newest)

| Commit | Hash | Description |
|--------|------|-------------|
| Feature 19 | `7e8e173` | Tour Builder Basic UI + Templates Cards Layout |
| Save fix | `1cdf2eb` | Tour editor save state cycling fix + UI improvements |
| **Feature 20** | `a0b7ef7` | Visual Element Selector with Builder Mode |
| UI Polish | `118dffc` | Premium UI theme polish (Apple/Adobe/Google aesthetic) |
| Middleware | `fc98494` | Add Clerk middleware (caused build error) |
| **Proxy fix** | `919d576` | Rename middleware.ts to proxy.ts for Next.js 16 |

---

## Feature 20: Visual Element Selector - COMPLETE

### What Was Built
Visual element picker that lets users select DOM elements from their GHL dashboard without writing CSS selectors manually.

### Files Created
- `app/(dashboard)/settings/_actions/settings-actions.ts` - Server action for GHL settings
- `app/(dashboard)/settings/_components/ghl-integration-settings.tsx` - GHL domain input + auto-close toggle
- `app/(dashboard)/tours/[id]/_components/element-selector-field.tsx` - 🎯 selector UI
- `app/(dashboard)/tours/[id]/_hooks/use-element-selector.ts` - Cross-tab communication hook
- `app/embed.js/builder-toolbar-styles.ts` - Polished toolbar CSS
- `docs/features/feature-20-visual-element-selector.md` - Feature documentation

### Files Modified
- `app/(dashboard)/settings/page.tsx` - Added GHL Integration section
- `app/(dashboard)/tours/[id]/_components/step-editor.tsx` - Uses ElementSelectorField
- `app/(dashboard)/tours/[id]/_components/tour-editor.tsx` - Passes ghlDomain prop
- `app/(dashboard)/tours/[id]/page.tsx` - Fetches ghlDomain from agency
- `app/embed.js/route.ts` - Full builder mode implementation (~800 lines added)
- `types/database.ts` - Added ghl_domain, builder_auto_close, SelectedElementData, ElementTarget

### Builder Mode Features
- Polished floating toolbar (Plus Jakarta Sans, glassmorphism, cyan accents)
- Draggable with position memory (localStorage)
- Two-stage flow: Navigate (OFF) → Select (ON)
- Element highlighting on hover (cyan dashed border)
- Smart selector generation (ID → data-attr → class → path)
- Fragile selector warning for dynamic classes
- Selection popup with element preview
- BroadcastChannel + localStorage for cross-tab communication
- **SessionStorage persistence** - survives GHL's URL parameter stripping
- **MutationObserver** - keeps toolbar attached during GHL page transitions

### Database Changes
Added to `agencies` table:
- `ghl_domain` (text, nullable) - White-label GHL URL
- `builder_auto_close` (boolean, default true) - Auto-close after selection

---

## UI Theme Polish - COMPLETE

### What Was Built
Premium Apple/Adobe/Google-style theme across all dashboard pages.

### Files Modified
- `app/globals.css` - Refined color palette, premium shadows, typography, utility classes
- `app/(dashboard)/layout.tsx` - Blur header, gradient logo, refined badges
- `app/(dashboard)/dashboard/page.tsx` - Interactive stat cards with gradient hovers
- `components/dashboard/main-nav.tsx` - Icons, hover states, PRO badges
- `components/shared/page-header.tsx` - Refined typography, border separator

### New CSS Utility Classes
- `.header-blur` - Backdrop blur for header
- `.badge-pro` / `.badge-toolkit` - Gradient plan badges
- `.gradient-subtle` - Page background gradient
- `.card-premium` - Enhanced card styling
- `.btn-premium` - Hover lift effect

---

## Bug Fixes This Session

### 1. Tour Editor Save State Cycling
**Problem:** Tour editor constantly cycled between "Saved" and "Unsaved"
**Cause:** Comparing `steps` against `initialTour.steps` where `null` vs `[]` mismatch
**Fix:** Added `lastSavedRef` to track actual saved state, update after successful save
**File:** `tour-editor.tsx`

### 2. Clerk Auth Redirect Loop
**Problem:** Production site looped between /sign-in and /dashboard
**Cause:** Missing middleware.ts file
**Fix:** Created middleware file

### 3. Next.js 16 Build Error
**Problem:** `middleware.ts` caused build error in Next.js 16
**Cause:** Next.js 16 renamed middleware.ts to proxy.ts
**Fix:** Renamed file and changed `export default` to `export const proxy`
**File:** `proxy.ts`

### 4. GHL URL Parameter Stripping
**Problem:** Builder mode params stripped when GHL SPA navigates
**Cause:** GHL router changes URL during auth/navigation
**Fix:** Capture params immediately in sessionStorage, restore in initBuilderMode()
**File:** `embed.js/route.ts`

---

## Backlog Additions

Added to `docs/features/phase-3-backlog.md`:

### Prerequisite-Based Tour Triggers
- Auto-show "setup first" tours when users try features before completing required setup
- Example: User clicks "Select Element" but hasn't embedded script → Show setup tour

### Smart Step Completion Detection (Auto-Resume)
- Tours detect which steps are already complete and resume from the right point
- Example: User completes "Connect Google" step, returns next day → Tour starts at step 2

---

## What's Next (from sprint.md)

### Current: Feature 20 - COMPLETE ✅

### Up Next:
1. **Feature 21: Tour Preview** - Live preview in iframe
2. **Feature 22: Apply Tours in Embed Script** - Driver.js integration
3. **Feature 23: Tour Themes Builder** - Custom colors, typography, buttons

---

## Testing Checklist

When you resume, test these:

- [ ] Sign in works on production (no redirect loop)
- [ ] Dashboard loads with new premium theme
- [ ] Tours page shows templates in correct order
- [ ] Create a Tooltip step, click 🎯 Select button
- [ ] GHL page opens with builder toolbar visible
- [ ] Toggle Builder Mode ON, elements highlight on hover
- [ ] Click element → selection popup appears
- [ ] Confirm selection → data returns to tour editor
- [ ] Element field shows friendly name and selector

---

## Environment Notes

- **Production URL:** https://agencytoolkit.vercel.app
- **GHL Test Domain:** https://app.getrapidreviews.com
- **Agency Token:** al_f63631494c1ade12
- **Clerk:** Development mode with fallback host configured
- **Next.js:** 16.1.1 (uses proxy.ts instead of middleware.ts)
