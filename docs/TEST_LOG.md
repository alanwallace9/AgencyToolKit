# Agency Toolkit - Test Log

This file persists test results across Claude sessions to survive context compaction.

---

## Test Run: 2026-02-07

### Test Credentials
- **Test User**: Tester Wallace (Test@test.com / T3st!Ag3ncy2026)
- **Dev Agency Token**: `al_dev_7123fd88cf74`
- **Prod Agency Token**: `al_f63631494c1ade12`
- **GHL Sub-account ID**: `rylJEjzUV9vcWl9bId9c`
- **Supabase Project**: `hldtxlzxneifdzvoobte`

---

### Test 1: Auth & Public Routes

| Test | Result | Detail |
|------|--------|--------|
| GET `/api/config?key=al_dev_7123fd88cf74` | PASS | 200 OK, valid JSON config |
| GET `/api/config` (invalid key) | PASS | Returns `{"error": "Invalid key"}` |
| GET `/api/config` (no key) | PASS | Returns `{"error": "Missing key parameter"}` |
| GET `/embed.js?key=al_dev_7123fd88cf74` | PASS | 200 OK, returns JavaScript |
| GET `/embed.js` (no key) | PASS | Handles gracefully |
| GET `/ts.js` | PASS | 200 OK, TrustSignal JavaScript |
| `/dashboard` without auth | PASS | Redirects to `/sign-in` (307) |
| `/settings/profile` without auth | PASS | Redirects to `/sign-in` (307) |
| `/menu` without auth | PASS | Redirects to `/sign-in` (307) |
| `/customers` without auth | PASS | Redirects to `/sign-in` (307) |
| Sign-in completion | BLOCKED | Clerk 2FA requires email verification to dummy test@test.com |
| Dashboard post-login | NOT TESTED | Blocked by sign-in |
| Agency record check | NOT TESTED | Blocked by sign-in |

**Status**: Partial — public APIs all pass, auth redirects work, sign-in blocked by Clerk 2FA on test account.

---

### Test 2: Full UI Section Tests (2026-02-08)

Playwright browser testing of every major section. Dev server running on localhost:3000.

| Section | Route | Result | Detail |
|---------|-------|--------|--------|
| **Dashboard** | `/dashboard` | PASS | 4 stat cards (Customers: 0, Presets: 0, Tours: 1, Images: 2), Getting Started guide |
| **Theme Builder - Login** | `/theme-builder` | PASS | Login tab loads, designer loading, Active toggle |
| **Theme Builder - Loading** | `/theme-builder?tab=loading` | PASS | 14 animations, speed/size/color controls, preview |
| **Theme Builder - Menu** | `/theme-builder?tab=menu` | PASS | 17 items with toggles/rename/drag, preview, templates, banner options |
| **Theme Builder - Colors** | `/theme-builder?tab=colors` | PASS | 8 themes, color studio, 4 pickers, contrast checker, pipeline preview |
| **Customers** | `/customers` | PASS | Empty state with "Add Your First Customer" button, help link |
| **Guidely Hub** | `/g` | PASS | Sidebar nav, quick actions, stats, features overview |
| **Guidely - Tours** | `/g/tours` | PASS | "Welcome Tour" (draft, 1 step), search/filter/grid/table views |
| **Guidely - Checklists** | `/g/checklists` | PASS | "Getting Started" (draft, 4 items) |
| **Guidely - Smart Tips** | `/g/tips` | PASS | 2 tips (New Tip, Save Button Tip), both draft |
| **Guidely - Banners** | `/g/banners` | PASS | 2 banners (Trial Expiration, Onboarding Prompt), both draft |
| **Images** | `/images` | PASS | 2 templates, 104 total renders |
| **TrustSignal** | `/trustsignal` | PASS | 2 widgets (both active), 4 events on first widget |
| **Settings - Profile** | `/settings/profile` | PASS | Agency name, email, plan (Pro), token |
| **Settings - Embed Code** | `/settings/embed` | PASS | Embed script + Generated CSS (213 lines incl. login page) |
| **Settings - GHL Setup** | `/settings/ghl` | PASS | Domain field, builder settings |
| **Settings - Photos** | `/settings/photos` | PASS | Photo upload toggles, notification settings |
| **Settings - Excluded** | `/settings/excluded` | PASS | Empty state, location ID input |
| **Settings - Admin** | `/settings/admin` | PASS | Feedback stats, empty state |
| **Settings - Danger** | `/settings/danger` | PASS | Warning banner, Delete Account button with bullet list |
| **Help - Index** | `/help` | PASS | Search bar, 6 categories (24 articles), Knowledge Base layout |
| **Help - Article** | `/help/getting-started/overview` | PASS | Breadcrumbs, screenshots, Key Features, full content |
| **Help - Article** | `/help/theme-builder/menu` | PASS | Article loads, no errors |

**Status**: ALL 23 routes tested — ALL PASS. Zero page-level errors. Only non-critical console items: Clerk dev mode warnings, notifications fetch error (expected in dev).

### Test 3: Feature 49 — Login CSS Export (2026-02-08)

| Test | Result | Detail |
|------|--------|--------|
| Build (`pnpm build`) | PASS | Zero errors, all routes compiled |
| Generated CSS card shows "login page" | PASS | Description: "5 colors, 11 hidden items, 4 renamed items, login page" |
| CSS includes LOGIN PAGE sections | PASS | 7 commented sections: Background, Form Container, Heading, Inputs, Labels, Button, Links |
| Background color matches DB | PASS | `#14532d` in both |
| Image URL matches DB | PASS | Unsplash office photo URL |
| Split layout detected correctly | PASS | Image x=50 → "right center", form "margin-left: 8%" |
| Form background matches DB | PASS | `rgba(255, 255, 255, 0.05)` |
| Input fields match DB | PASS | bg: `#ffffff`, text: `#111827`, border: `#d1d5db` |
| Button matches DB | PASS | bg: `#2563eb`, text: `#ffffff` |
| Label color matches DB | PASS | `rgba(255, 255, 255, 0.6)` |
| Link color matches DB | PASS | `#2563eb` |
| Backdrop blur for glass effect | PASS | `backdrop-filter: blur(4px)` applied (form_bg uses rgba) |
| Accordion "What this CSS does" updated | PASS | Lists "Login Page" with correct description |
| Troubleshooting section updated | PASS | CSS + JS usage guide, correct instructions |
| Total CSS lines | PASS | 213 lines (colors + menu + login) |

**Status**: Feature 49 fully verified — all values match database, all CSS sections generate correctly.

---

### Test 4: Functional Testing (2026-02-08)

End-to-end CRUD and persistence tests — verifying data actually saves to Supabase and round-trips correctly.

| Feature | Test | Result | Detail |
|---------|------|--------|--------|
| **Config API** | GET `/api/config?key=al_dev_7123fd88cf74` | PASS | All 15 fields match DB (token, plan, hidden_items, renamed_items, login_design, colors, loading) |
| **Embed Script** | GET `/embed.js?key=al_dev_7123fd88cf74` | PASS | Returns JavaScript with correct key |
| **TrustSignal Script** | GET `/ts.js` (no key) | PASS | Returns "Missing widget key" (expected) |
| **Customer CRUD** | Add customer via UI dialog | PASS | 3 fields (name, GHL Location ID, GBP Place ID) → persisted to DB with token `te_*`, is_active=true |
| **Theme Builder Colors** | Change theme + Save | PASS | Clicked "Midnight Blue" → Save → DB updated (primary, accent, sidebar_bg, sidebar_text all changed) → Config API reflected change → restored original |
| **GHL Login Page** | Screenshot of `app.getrapidreviews.com` login | PASS | Feature 49 CSS working: dark green bg, office photo right, form left, blue button |
| **Guidely Tour CRUD** | Create tour via "New Tour" dialog | PASS | "Functional Test Tour" created → redirected to editor → verified in DB (name, description, status=draft) → cleaned up |
| **Settings - Profile** | Edit agency name | PASS | Changed to "Functional Test Agency" → DB updated → restored original |
| **Settings - Excluded** | Add + Remove location | PASS | Added `test_excluded_loc_123` → DB `whitelisted_locations` updated → removed → DB empty array |
| **Settings - GHL Setup** | Toggle auto-close | PASS | Toggled off → Save Changes → DB `builder_auto_close=false` → restored to `true` |
| **Menu Toggle (Theme Builder)** | Toggle Calendars hidden → Save | **BUG** | UI shows "6 visible" + "Settings saved" toast, but `sb_calendars` NOT added to DB `hidden_items` — see BUG-003 |

**Status**: 10/11 tests PASS. 1 BUG found (menu save from Theme Builder header).

---

### Bugs Found

#### BUG-003: Theme Builder Save Button Doesn't Save Menu Changes
- **Severity**: MEDIUM
- **Status**: OPEN
- **Files**: `app/(dashboard)/theme-builder/_components/tabs/menu-tab-content.tsx`, `app/(dashboard)/menu/_components/menu-client.tsx`
- **Description**: Clicking the global "Save" button in the Theme Builder header shows "Settings saved" toast but does NOT persist menu toggle changes to the database.
- **Root Cause**: The menu tab does NOT register a save handler with the theme context (`registerSaveHandler`). The colors tab does this correctly at `colors-tab-content.tsx:47`, but `menu-tab-content.tsx` has no equivalent. When `saveAllTabs()` is called from the header Save button, it only saves tabs that have registered handlers — the menu tab is skipped entirely.
- **The menu has its own autosave** (`triggerAutosave` with 500ms debounce in `menu-client.tsx:175`), but this is independent of the theme builder's save system. There may also be a stale closure issue where the debounced callback captures an old `buildConfig` before React has updated `items` state.
- **Fix needed**: `menu-tab-content.tsx` needs to register a save handler with the theme status context, similar to how `colors-tab-content.tsx` does it.
- **Workaround**: Menu changes may save on autosave or tab switch, but the header Save button is unreliable for menu.

#### BUG-001: Login Page Design Not Applied on GHL — RESOLVED (approach change)
- **Severity**: HIGH
- **Status**: RESOLVED — Root cause identified, solution validated
- **Description**: The custom login page design created in Theme Builder was not being applied to the GHL sub-account login page.
- **Root Cause**: GHL does NOT load Custom JavaScript on the login page. The login page is served before authentication, so the Custom JS field (where the embed script goes) is not executed. This was confirmed by checking the browser console on `app.getrapidreviews.com` — zero `[AgencyToolkit]` messages on the login page, while the dashboard shows full script execution.
- **NOT a code bug**: The embed.js login detection logic (isLoginPage check) was never the problem. The script simply never loads on the login page.
- **Solution**: Use GHL's **Custom CSS field** instead of Custom JS for login page styling. Custom CSS loads on ALL pages including the login page. This was confirmed by:
  1. Generating CSS from the login_design database record using `.hl_login` GHL selectors
  2. Pasting it into GHL → Settings → Company → Custom CSS
  3. Verified on `app.getrapidreviews.com/?logout=true` — design applied successfully (dark green bg, office photo right, form left, blue buttons)
- **Selectors confirmed working**: `.hl_login`, `div.hl_login--body`, `.hl_login .form-control`, `.hl_login .btn.btn-blue`
- **Tweaks needed**: Heading color selector needs adjustment (showing pinkish instead of green), label colors not applying correctly
- **Next step**: Build feature to auto-generate login CSS in the Generated CSS section of Settings → Embed Code

#### BUG-002: TypeScript Errors in Settings Sidebar (FIXED)
- **Severity**: Medium (build failure)
- **Status**: FIXED
- **Files**: `settings-sidebar.tsx`, `settings-mobile-nav.tsx`
- **Description**: 16 TS2339 errors due to discriminated union not narrowing after divider check.
- **Fix**: Extracted `NavItem` type, added explicit cast after early return.

---

## Key Discoveries (2026-02-07)

### GHL Custom Code Behavior
- **Custom JS field** (Agency → Settings → Company): Only loads AFTER authentication (dashboard/app pages only)
- **Custom CSS field** (Agency → Settings → Company → Whitelabel): Loads on ALL pages INCLUDING the login page
- **Implication**: Login page customization MUST use CSS, not JS. All other features (menu, loading, tours, colors) can use either.

### GHL Login Page Selectors (confirmed working)
| Selector | Element |
|----------|---------|
| `.hl_login` | Main login container / page background |
| `div.hl_login--body` | Login form card/wrapper |
| `.hl_login--header` | Header area |
| `.hl_login .form-control` | Input fields |
| `.hl_login .btn.btn-blue` | Sign-in button |
| `.hl_login--body .heading2` | "Sign into your account" heading |
| `.hl_login label` | Form labels |
| `.hl_login a` | Links (forgot password, terms) |

### Embed Script on GHL (confirmed working)
- Console shows: `[AgencyToolkit] Script loaded` then `Customizations applied: menu (11 hidden, 4 renamed), colors, loading, login (advanced)`
- The embed script correctly applies menu, colors, loading, and login design on authenticated pages
- The GHL Custom JS field is at: Agency View → Settings → Company → Custom JavaScript
- Currently using dev key in GHL: `<script src="https://toolkit.getrapidreviews.com/embed.js?key=al_dev_7123fd88cf74"></script>`

### Current Generated CSS (Settings → Embed Code)
- Currently generates: sidebar colors, hidden menu items, renamed menu items
- File: `app/(dashboard)/settings/_components/css-export-card.tsx`
- Line 266 incorrectly states "CSS alone cannot do login page customization" — needs updating
- **NEXT FEATURE**: Add login page CSS generation to this same output

### User Notes
- Colors/sidebar customization on dashboard is from the embed JS (user had nothing in Custom CSS previously)
- Menu renaming confirmed working via embed JS
- The user currently does NOT need to use Generated CSS for dashboard features — embed JS handles it
- Generated CSS is an alternative/fallback for users who can't use JS, AND the required method for login pages

---

## Feature 49: Login CSS Export — BUILT (2026-02-08)

### Status: Built & Verified (not yet tested on GHL)

### Files modified
1. `app/(dashboard)/settings/embed/page.tsx` — Queries login_designs table, passes to CssExportCard
2. `app/(dashboard)/settings/_components/css-export-card.tsx` — Full rewrite with `generateLoginCss()` function
3. `app/(dashboard)/settings/_components/embed-section.tsx` — Updated props to pass loginDesign

### CSS sections generated (with commented headers)
- LOGIN PAGE - Background & Layout ✅
- LOGIN PAGE - Form Container ✅
- LOGIN PAGE - Heading ✅
- LOGIN PAGE - Input Fields ✅
- LOGIN PAGE - Labels ✅
- LOGIN PAGE - Sign In Button ✅
- LOGIN PAGE - Links ✅

### Next: GHL testing
- Copy the Generated CSS from Settings → Embed Code
- Paste into GHL Custom CSS at Settings → Company → White Label → Custom CSS
- Verify on `app.getrapidreviews.com` login page
- Tweaks expected: form width ("too skinny"), white form background control
