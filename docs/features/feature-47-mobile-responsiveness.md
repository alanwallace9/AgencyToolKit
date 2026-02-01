# Feature 47: Mobile Responsiveness

**Status:** Ready to Implement
**Priority:** High
**Estimate:** 4-6 hours

---

## Overview

Make the Agency Toolkit admin dashboard fully usable on mobile devices (phones and tablets). Currently, the app has a desktop-first design with several critical usability issues on smaller screens.

---

## Current State Analysis

### What Works
- `useIsMobile()` hook exists (768px breakpoint)
- shadcn/ui Sidebar component has mobile Sheet support
- Some grids use responsive breakpoints (`md:`, `lg:`)
- Customer photo gallery is responsive

### What's Broken on Mobile

| Issue | Severity | Pages Affected |
|-------|----------|----------------|
| Fixed sidebars don't collapse | 🔴 Critical | Settings, Guidely |
| Hover-expand doesn't work on touch | 🔴 Critical | Guidely sidebar |
| Tables overflow horizontally | 🟠 High | Customers, Analytics |
| 3-panel builders unusable | 🟠 High | Tours, Checklists, Banners, Tips |
| Padding too large (px-8) | 🟡 Medium | All pages |
| Small tap targets (<44px) | 🟡 Medium | Various buttons |
| Image editor canvas cramped | 🟡 Medium | Image editor |

---

## Implementation Plan

### Phase 1: Critical Layout Fixes

#### 1.1 Settings Sidebar → Mobile Sheet

**Current:** Fixed 220px sidebar that doesn't respond to mobile
**Target:** Sheet overlay on mobile, sidebar on desktop

```tsx
// Settings layout pattern
const isMobile = useIsMobile();

{isMobile ? (
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="ghost" size="icon" className="fixed bottom-4 left-4 z-50">
        <Menu className="h-5 w-5" />
      </Button>
    </SheetTrigger>
    <SheetContent side="left">
      <SettingsNav />
    </SheetContent>
  </Sheet>
) : (
  <SettingsSidebar />
)}
```

**Files:**
- `app/(dashboard)/settings/layout.tsx`
- `app/(dashboard)/settings/_components/settings-sidebar.tsx`

#### 1.2 Guidely Sidebar → Mobile Sheet

**Current:** Hover-expand sidebar (doesn't work on touch)
**Target:** Sheet overlay on mobile with hamburger trigger

**Files:**
- `app/(dashboard)/g/layout.tsx`
- `app/(dashboard)/g/_components/guidely-sidebar.tsx`

#### 1.3 Fixed Layout → Responsive Layout

**Current:** `fixed inset-0 top-16 flex` creates scroll issues
**Target:** Normal flow on mobile, fixed on desktop

```tsx
// Mobile: normal scroll, Desktop: fixed
<div className={cn(
  "flex",
  isMobile ? "min-h-[calc(100vh-4rem)]" : "fixed inset-0 top-16"
)}>
```

---

### Phase 2: Table & Grid Responsiveness

#### 2.1 Customer Table → Responsive Cards on Mobile

**Current:** Multi-column table overflows
**Target:** Card view on mobile, table on desktop

```tsx
{isMobile ? (
  <div className="space-y-3">
    {customers.map(c => <CustomerCard key={c.id} customer={c} />)}
  </div>
) : (
  <CustomerTable customers={customers} />
)}
```

**Files:**
- `app/(dashboard)/customers/_components/customers-client.tsx`
- Create: `app/(dashboard)/customers/_components/customer-card.tsx`

#### 2.2 Analytics Tables → Horizontal Scroll

Add `overflow-x-auto` wrapper with scroll hints.

**Files:**
- `app/(dashboard)/g/analytics/_components/analytics-table.tsx`

#### 2.3 Grid Breakpoints Audit

Update grids missing mobile breakpoints:

| Component | Current | Target |
|-----------|---------|--------|
| Theme grid | `grid-cols-3` | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` |
| Color presets | `grid-cols-5` | `grid-cols-3 sm:grid-cols-5` |
| Tour cards | `grid-cols-3` | `grid-cols-1 md:grid-cols-2 xl:grid-cols-3` |

---

### Phase 3: Builder Panel Stacking

#### 3.1 Tour Builder

**Current:** Side-by-side panels
**Target:** Stacked with tab navigation on mobile

```
Desktop:                    Mobile:
┌─────┬─────┬─────┐        ┌─────────────┐
│Steps│Editor│Prev │   →   │ [Steps|Edit|Preview] │ ← Tabs
└─────┴─────┴─────┘        ├─────────────┤
                           │   Content   │
                           └─────────────┘
```

**Files:**
- `app/(dashboard)/g/tours/[id]/_components/tour-builder-new.tsx`

#### 3.2 Checklist/Banner/Tips Builders

Same pattern - stack panels with tabs on mobile.

**Files:**
- `app/(dashboard)/g/checklists/[id]/_components/checklist-builder.tsx`
- `app/(dashboard)/g/banners/[id]/_components/banner-builder.tsx`
- `app/(dashboard)/g/tips/[id]/_components/smart-tips-builder.tsx`

---

### Phase 4: Spacing & Touch Optimization

#### 4.1 Padding Reduction

**Current:** `px-8 lg:px-14` everywhere
**Target:** `px-4 sm:px-6 lg:px-14`

**Files:**
- `app/(dashboard)/layout.tsx`
- `components/dashboard/main-nav.tsx`

#### 4.2 Touch Target Sizing

Ensure all interactive elements are minimum 44x44px on mobile:

```tsx
// Button example
<Button
  size="icon"
  className="h-8 w-8 md:h-9 md:w-9 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0"
>
```

Focus areas:
- Icon buttons in tables
- Sidebar navigation items
- Close/dismiss buttons on dialogs

---

### Phase 5: Image Editor Mobile

#### 5.1 Canvas Responsive Sizing

**Current:** Fixed aspect ratio container
**Target:** Full-width on mobile with vertical scroll for tools

```
Desktop:                    Mobile:
┌────────────┬─────┐        ┌─────────────┐
│            │Tools│   →    │   Canvas    │
│   Canvas   │     │        ├─────────────┤
│            │     │        │   Tools     │
└────────────┴─────┘        └─────────────┘
```

#### 5.2 Touch-Friendly Controls

- Larger drag handles for text boxes
- Pinch-to-zoom support (future)
- Simplified toolbar on mobile

---

## Files to Modify

### Layouts (Priority 1)
```
app/(dashboard)/layout.tsx
app/(dashboard)/settings/layout.tsx
app/(dashboard)/g/layout.tsx
```

### Sidebars (Priority 1)
```
app/(dashboard)/settings/_components/settings-sidebar.tsx
app/(dashboard)/g/_components/guidely-sidebar.tsx
```

### Tables & Lists (Priority 2)
```
app/(dashboard)/customers/_components/customers-client.tsx
app/(dashboard)/customers/_components/customer-table.tsx
app/(dashboard)/g/analytics/_components/*.tsx
```

### Builders (Priority 2)
```
app/(dashboard)/g/tours/[id]/_components/tour-builder-new.tsx
app/(dashboard)/g/checklists/[id]/_components/checklist-builder.tsx
app/(dashboard)/g/banners/[id]/_components/banner-builder.tsx
app/(dashboard)/g/tips/[id]/_components/smart-tips-builder.tsx
```

### Image Editor (Priority 3)
```
app/(dashboard)/images/[id]/_components/image-editor.tsx
```

---

## Testing Checklist

### Device Targets
- [ ] iPhone SE (375px) - Smallest common phone
- [ ] iPhone 14 (390px) - Standard phone
- [ ] iPad Mini (768px) - Tablet portrait
- [ ] iPad (1024px) - Tablet landscape

### Critical Paths to Test
- [ ] Navigate all Settings sub-pages on phone
- [ ] Open/close Guidely sidebar on phone
- [ ] View customer list on phone
- [ ] Create a tour step on tablet
- [ ] Edit an image template on tablet
- [ ] Complete a full workflow on phone (create customer → view → edit)

### Chrome DevTools Testing
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test at: 375px, 390px, 768px, 1024px
4. Test both portrait and landscape

---

## Acceptance Criteria

- [ ] Settings sidebar becomes sheet overlay on mobile
- [ ] Guidely sidebar becomes sheet overlay on mobile
- [ ] Customer table converts to cards on mobile
- [ ] All builders stack panels vertically on mobile
- [ ] No horizontal overflow on any page at 375px
- [ ] All tap targets are minimum 44px on mobile
- [ ] Padding reduces appropriately on smaller screens
- [ ] Image editor is usable on tablet

---

## Out of Scope

- Native mobile app
- Offline support
- Pull-to-refresh
- Bottom navigation bar (future consideration)
- Pinch-to-zoom on image editor
- Mobile-specific features (camera upload, etc.)

---

## Dependencies

- `useIsMobile` hook (exists)
- shadcn/ui Sheet component (exists)
- Tailwind responsive prefixes (exists)

No new packages required.
