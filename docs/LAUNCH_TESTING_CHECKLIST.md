# Launch Testing Checklist

**Purpose:** Pre-launch testing organized by user journey
**Created:** 2026-02-01
**Status:** Ready for testing

---

## Testing Waves

| Wave | Focus | Priority |
|------|-------|----------|
| **Wave 1** | Core Flow (Signup → Embed Works) | Critical |
| **Wave 2** | Theme Builder Features | High |
| **Wave 3** | TrustSignal + Pro Soft Gate | Medium |

---

## Wave 1: Core Flow (Most Critical)

### Stage 1: Signup & First Visit

| # | Test | Route/Action | Pass |
|---|------|--------------|------|
| 1.1 | Sign up via Clerk works | `/sign-up` | [ ] |
| 1.2 | Webhook creates agency record in Supabase | Check `agencies` table | [ ] |
| 1.3 | Landing on Dashboard shows empty state correctly | `/dashboard` | [ ] |
| 1.4 | Navigation renders (Toolkit plan badge visible) | Header nav | [ ] |
| 1.5 | Mobile hamburger menu works | Resize browser | [ ] |

**Notes:**
```
```

---

### Stage 2: Customer Management (Free)

| # | Test | Route/Action | Pass |
|---|------|--------------|------|
| 2.1 | Customers page shows empty state | `/customers` | [ ] |
| 2.2 | Add customer dialog works | "Add Customer" button | [ ] |
| 2.3 | Customer created, token generated | Submit form | [ ] |
| 2.4 | Customer list displays correctly | View list | [ ] |
| 2.5 | Copy customer token works | Click copy icon | [ ] |
| 2.6 | Customer edit page loads | Click customer row | [ ] |
| 2.7 | Customer updates save | Edit and save | [ ] |
| 2.8 | Customer export (CSV) works | Export button | [ ] |
| 2.9 | Mobile: Card view instead of table | Resize browser | [ ] |

**Notes:**
```
```

---

### Stage 3: Settings & Embed Code (Free)

| # | Test | Route/Action | Pass |
|---|------|--------------|------|
| 3.1 | Settings page loads with left nav | `/settings` | [ ] |
| 3.2 | Profile shows editable name | `/settings/profile` | [ ] |
| 3.3 | Embed code displays correctly | `/settings/embed` | [ ] |
| 3.4 | Copy embed code works | Click copy | [ ] |
| 3.5 | GHL domain can be set | `/settings/ghl` | [ ] |
| 3.6 | Excluded locations add/remove works | `/settings/excluded` | [ ] |
| 3.7 | Mobile: Sidebar becomes sheet | Resize browser | [ ] |

**Notes:**
```
```

---

### Stage 9: Embed Script - The Real Test

| # | Test | How to Test | Pass |
|---|------|-------------|------|
| 9.1 | Script loads without errors | Install in GHL | [ ] |
| 9.2 | Menu customizations apply | Check sidebar | [ ] |
| 9.3 | Menu renames show | Check item labels | [ ] |
| 9.4 | Hidden items stay hidden | Check sidebar | [ ] |
| 9.5 | Dashboard colors apply | Check header/sidebar | [ ] |
| 9.6 | Loading animation appears | Refresh page | [ ] |
| 9.7 | Login design applies | Visit login page | [ ] |
| 9.8 | Excluded locations skip styling | Add current URL | [ ] |
| 9.9 | SPA navigation preserves styling | Click between pages | [ ] |
| 9.10 | No console errors | Check DevTools | [ ] |

**Notes:**
```
```

---

## Wave 2: Theme Builder Features

### Stage 4: Menu Customizer (Free)

| # | Test | Route/Action | Pass |
|---|------|--------------|------|
| 4.1 | Menu page loads with presets | `/menu` | [ ] |
| 4.2 | Built-in templates display | View template cards | [ ] |
| 4.3 | Create new preset from template | "Add Preset" dialog | [ ] |
| 4.4 | Visual editor loads | Click preset card | [ ] |
| 4.5 | Toggle visibility works | Click toggles | [ ] |
| 4.6 | Rename items works | Type in rename field | [ ] |
| 4.7 | Drag-drop reordering works | Drag items | [ ] |
| 4.8 | Add divider works | "Add Divider" button | [ ] |
| 4.9 | Banner options toggle | Hide promos/warnings | [ ] |
| 4.10 | Live preview updates | Watch sidebar preview | [ ] |
| 4.11 | Save persists to database | Save and reload | [ ] |
| 4.12 | Set as default works | Mark default | [ ] |
| 4.13 | Copy CSS works | Click copy CSS | [ ] |

**Notes:**
```
```

---

### Stage 5: Dashboard Colors (Free)

| # | Test | Route/Action | Pass |
|---|------|--------------|------|
| 5.1 | Colors page loads with 3-panel layout | `/colors` | [ ] |
| 5.2 | Theme gallery shows 8 built-in presets | Left panel | [ ] |
| 5.3 | Hover-to-preview works | Hover over themes | [ ] |
| 5.4 | Click theme applies colors | Click theme | [ ] |
| 5.5 | Color pickers work | Right panel | [ ] |
| 5.6 | Preview mockup updates | Center panel | [ ] |
| 5.7 | Pipeline/Dashboard/Reviews tabs work | Tab navigation | [ ] |
| 5.8 | Logo drop extracts colors | Drop logo image | [ ] |
| 5.9 | Harmony suggestions work | Click suggestions | [ ] |
| 5.10 | Save color preset works | "Save as Preset" | [ ] |
| 5.11 | Custom preset appears in gallery | Check left panel | [ ] |

**Notes:**
```
```

---

### Stage 6: Loading Animations (Free)

| # | Test | Route/Action | Pass |
|---|------|--------------|------|
| 6.1 | Loading page displays | `/loading` | [ ] |
| 6.2 | Category filters work | Click tabs | [ ] |
| 6.3 | Hover-to-preview in main area | Hover animation cards | [ ] |
| 6.4 | Click-to-select saves | Click animation | [ ] |
| 6.5 | Color customization works | Color picker | [ ] |
| 6.6 | Speed slider adjusts animation | Drag slider | [ ] |
| 6.7 | "Use brand color" toggle works | Toggle switch | [ ] |
| 6.8 | "Currently Active" badge shows | View selected | [ ] |

**Notes:**
```
```

---

### Stage 7: Login Designer (Free)

| # | Test | Route/Action | Pass |
|---|------|--------------|------|
| 7.1 | Login page loads with canvas | `/login` | [ ] |
| 7.2 | Layout presets work | Click preset picker | [ ] |
| 7.3 | Drag elements onto canvas | Drag from element panel | [ ] |
| 7.4 | Drag to position elements | Move elements | [ ] |
| 7.5 | Properties panel shows on select | Click element | [ ] |
| 7.6 | Text styling works | Change font/size/color | [ ] |
| 7.7 | Image element accepts URL | Paste image URL | [ ] |
| 7.8 | Background editor works | Change bg color/gradient | [ ] |
| 7.9 | Form styling applies | Button/input colors | [ ] |
| 7.10 | Save design works | Click save | [ ] |
| 7.11 | Set as default works | Toggle default | [ ] |
| 7.12 | Mobile: "Better on desktop" banner | Resize browser | [ ] |

**Notes:**
```
```

---

## Wave 3: TrustSignal + Pro Soft Gate

### Stage 8: TrustSignal (Free for Agency Site)

| # | Test | Route/Action | Pass |
|---|------|--------------|------|
| 8.1 | TrustSignal page loads | `/trustsignal` | [ ] |
| 8.2 | Create event works | Add new event | [ ] |
| 8.3 | Event types display correctly | View event list | [ ] |
| 8.4 | Edit event works | Click edit | [ ] |
| 8.5 | Delete event works | Delete with confirm | [ ] |
| 8.6 | Copy widget embed code works | Copy script tag | [ ] |
| 8.7 | Widget previews correctly | Live preview | [ ] |

**Notes:**
```
```

---

### Stage 10: Pro Features - Soft Gate Experience

| # | Test | Route/Action | Pass |
|---|------|--------------|------|
| 10.1 | Guidely shows PRO badge in nav | Main nav | [ ] |
| 10.2 | Images shows PRO badge in nav | Main nav | [ ] |
| 10.3 | Guidely sidebar accessible | `/g` | [ ] |
| 10.4 | Can browse Tours page | `/g/tours` | [ ] |
| 10.5 | Can create new tour | Click "New Tour" | [ ] |
| 10.6 | Can add steps to tour | Tour builder | [ ] |
| 10.7 | Upgrade modal on Save/Publish | Click Save | [ ] |
| 10.8 | Sticky banner visible | Top of page | [ ] |
| 10.9 | Same flow for Checklists | `/g/checklists` | [ ] |
| 10.10 | Same flow for Smart Tips | `/g/tips` | [ ] |
| 10.11 | Same flow for Banners | `/g/banners` | [ ] |
| 10.12 | Images page soft-gated | `/images` | [ ] |

**Notes:**
```
```

---

## Summary

| Wave | Tests | Passed | Failed |
|------|-------|--------|--------|
| Wave 1 (Core) | 24 | | |
| Wave 2 (Theme) | 36 | | |
| Wave 3 (Extra) | 19 | | |
| **Total** | **79** | | |

---

## Issues Found

| # | Test | Issue | Severity | Fixed |
|---|------|-------|----------|-------|
| | | | | [ ] |
| | | | | [ ] |
| | | | | [ ] |

---

## Sign-Off

- [ ] Wave 1 complete - Core flow works
- [ ] Wave 2 complete - Theme Builder works
- [ ] Wave 3 complete - TrustSignal + Pro gate works
- [ ] All critical issues resolved
- [ ] Ready for launch
