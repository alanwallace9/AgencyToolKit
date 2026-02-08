# Feature 50: Subaccount-Aware Customizations

## Status: Backlog

## Overview

Two related improvements to how the embed script handles subaccount switching in GHL:

1. **Bug Fix (P1)**: Embed script doesn't re-evaluate excluded locations when switching subaccounts via GHL's SPA navigation. Customizations get "stuck" in whatever state they were in on the last hard refresh.
2. **Future Feature (P2)**: Customization Profiles — allow agencies to assign different customization sets to different groups of subaccounts, rather than one global config with an exclusion list.

---

## Part 1: SPA Navigation — Location Re-Check

### Priority: High (Pre-Launch Fix)

### The Problem

GHL is a SPA. Switching subaccounts changes the URL from `/v2/location/{locationA}/...` to `/v2/location/{locationB}/...` without a full page reload. The embed script's `shouldSkipCustomizations()` runs once during `init()` and never again.

**Current behavior:**
- On excluded subaccount → switch to regular subaccount → customizations DON'T apply (stuck in skip mode)
- On regular subaccount → switch to excluded subaccount → customizations STILL apply (stuck in apply mode)
- Hard refresh fixes it every time (script re-runs from scratch)

### Root Cause

`embed.js` line ~5443: `shouldSkipCustomizations(config)` is called once. If it returns `true`, `init()` exits entirely. If it returns `false`, customizations are applied and the MutationObserver only watches for DOM changes to re-apply menu CSS — it never re-checks the location ID.

### Current Architecture Reference

```
embed.js init() flow:
  1. Fetch /api/config
  2. shouldSkipCustomizations() → runs ONCE
  3. If excluded: return (exit everything)
  4. If not excluded: apply all customizations
  5. MutationObserver → only re-applies menu CSS on DOM changes
```

### Proposed Fix

Add URL polling to detect subaccount switches. When the location ID segment changes:

- If new location is excluded → remove all injected customizations (CSS, DOM elements)
- If new location is NOT excluded → re-apply customizations
- If switching between two non-excluded locations → no action needed (same config applies)

**Implementation approach:**
```
// Pseudocode
var lastLocationId = extractLocationId(window.location.href);

setInterval(function() {
  var currentLocationId = extractLocationId(window.location.href);
  if (currentLocationId !== lastLocationId) {
    lastLocationId = currentLocationId;

    if (shouldSkipCustomizations(config)) {
      removeAllCustomizations();  // Strip injected <style> tags, DOM elements
    } else {
      reapplyAllCustomizations(config);  // Re-inject everything
    }
  }
}, 1000);  // Check every second — lightweight
```

**URL pattern:** `https://{domain}/v2/location/{locationId}/...`
- Extract `locationId` from the path segment after `/location/`
- This is more reliable than the current `indexOf()` approach

### Additional Bug Found

The current `shouldSkipCustomizations()` uses `indexOf()` for matching:
```javascript
return currentUrl.indexOf(locationId) !== -1;
```
This is a substring match — location ID `"123"` would match a URL containing `"1234567"`. Should use a path-segment-aware check instead.

### Cleanup Requirements

When removing customizations (switching TO an excluded location), the script needs to:
- Remove injected `<style>` tags (menu CSS, color CSS, loading CSS)
- Remove injected DOM elements (loading overlay, banners, tooltips, checklists)
- Disconnect any active tour instances
- This means customization elements need identifiable markers (data attributes or IDs) for clean removal

### Files to Modify
- `app/embed.js/route.ts` — main embed script generation

---

## Part 2: Customization Profiles (Future Feature)

### Priority: Backlog (Post-Launch)
### Pricing: Pro Feature

### The Vision

Instead of one global config with an exclusion list, agencies can create **named customization profiles** and assign them to groups of subaccounts.

**Current model:**
> One agency → one set of customizations → apply everywhere except excluded locations

**Proposed model:**
> One agency → multiple profiles → each profile has its own customizations → assigned to subaccount groups

### Use Cases (From Founding Member Feedback)

1. **Different service verticals**: Dental subaccounts get blue theme + dental tours, roofing subaccounts get green theme + roofing tours
2. **Tiered feature access**: High-performing customer gets extra menu items unlocked (e.g., reporting, website builder) while standard customers get the base menu
3. **Different onboarding paths**: Non-techie clients get a guided tour, power users get a different tour or no tour
4. **Per-client TrustSignal**: Different social proof widget per subaccount (note: TrustSignal already has its own separate embed script and token system — may already support this naturally)

### Granularity

Profiles should be able to customize per-profile:

| Customization | Per-Profile? | Notes |
|--------------|-------------|-------|
| Menu items (show/hide/rename) | Yes | Most requested — unlock specific items per client tier |
| Brand colors | Maybe | Less common, but possible for white-label-within-white-label |
| Loading animation | Maybe | Lower priority |
| Login design | Probably not | Login page is per-agency, not per-subaccount |
| Tours | Yes | Different onboarding for different client types |
| Checklists | Yes | Different onboarding for different client types |
| Smart Tips | Yes | Context-sensitive to what menu items are visible |
| Banners | Yes | Announcements could target specific client groups |
| TrustSignal | Separate system | Already has its own token per customer — investigate if this already works per-subaccount |

### Default Behavior

- If a subaccount is NOT assigned to any profile → gets the **base/default customizations** (same as today's global config)
- If a subaccount IS assigned to a profile → gets that profile's customizations instead
- If a subaccount is explicitly excluded → gets NO customizations (preserves current exclusion feature)

### UI Concepts (Rough Ideas)

**Option A: Profile-based (top-down)**
- Settings or dedicated page to create named profiles ("Dental Package", "Roofing Package", "Premium Tier")
- Each profile has its own menu config, color config, tour assignments, etc.
- Assign subaccounts to profiles

**Option B: Customer-list-based (bottom-up)**
- From the Customers list, checkbox multiple customers
- Bulk action: "Apply preset → [dropdown of profiles]"
- Or individually per customer: "Customize → override menu items, assign tour"

**Option C: Hybrid**
- Profiles exist as reusable templates
- From customer list, assign profiles OR do individual overrides
- Individual overrides take precedence over profile defaults

### Data Model (Conceptual)

```
New table: customization_profiles
  - id
  - agency_id
  - name (e.g., "Dental Package")
  - menu_config (JSONB - overrides)
  - color_config (JSONB - overrides)
  - loading_config (JSONB - overrides)
  - tour_ids (array - which tours to apply)
  - checklist_ids (array)
  - banner_ids (array)
  - smart_tip_ids (array)
  - is_default (boolean - the fallback profile)

Modified table: customers
  - profile_id (FK → customization_profiles, nullable)
  - custom_overrides (JSONB - per-customer tweaks that override the profile)
```

### Embed Script Changes

The `/api/config` endpoint would need to accept a location ID parameter:
```
GET /api/config?key={agencyToken}&location={locationId}
```

The response would merge: `default config` → `profile overrides` → `customer overrides`

The embed script would:
1. Extract current location ID from URL
2. Pass it to the config endpoint
3. Receive the merged/resolved config for that specific subaccount
4. Apply it
5. On subaccount switch (Part 1's URL watcher), re-fetch config with new location ID

### Open Questions

1. **Config caching**: Currently embed.js caches config. With per-subaccount configs, does it need to re-fetch on every subaccount switch? Or cache per-location?
2. **Profile editor UI**: Build a dedicated page, or extend existing Theme Builder / Settings?
3. **Override granularity**: Can a customer override just one menu item from their profile, or is it all-or-nothing per category?
4. **TrustSignal integration**: Already has per-customer tokens — does it already support per-subaccount differentiation naturally?
5. **Guidely targeting**: Tours already have targeting rules — can those be leveraged instead of profiles for tour assignment?
6. **Migration**: How to handle existing agencies when this feature ships? Auto-create a "Default" profile from current config?

### Estimated Complexity

This is a significant feature:
- New database table + migrations
- New UI for profile management
- Modified config API to resolve per-subaccount
- Modified embed script to pass location context
- Customer list UI updates for profile assignment
- Plan gating (Pro only)

Recommend scoping as its own sprint/epic after launch.

---

## Relationship Between Part 1 and Part 2

Part 1 (URL watcher) is a prerequisite for Part 2 (profiles). The URL watcher establishes the pattern of:
- Detecting subaccount changes
- Extracting location IDs from URLs
- Re-evaluating and re-applying customizations

Part 2 builds on that by making the re-evaluation fetch a location-specific config instead of just checking an exclusion list.

**Implement Part 1 now → Part 2 later.**

---

## Implementation Notes

*To be filled in when implemented.*
