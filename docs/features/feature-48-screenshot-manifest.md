# Feature 48: Help Article Screenshot Manifest

## Status: IN PROGRESS - Screenshots need replacement

## Overview
Help articles have 38 image slots across 23 articles. The user will create replacement images/GIFs manually and drop them into `public/help/staging/`. Claude will then move them into place and update code if file extensions change.

## Workflow
1. User creates screenshots/GIFs for each article
2. User drops files into `public/help/staging/` with naming like `Smart Tips 1.png` or `First Tour 2.gif`
3. User tells Claude which batch is ready (e.g., "First Customer 1-4 are in staging")
4. Claude moves files to correct paths and updates article code if extension changed

## GIF Support
The `Screenshot` component (`app/(dashboard)/help/_components/screenshot.tsx`) has been updated to detect `.gif` files and render them with a plain `<img>` tag instead of Next.js `<Image>` (which strips animation).

## Important Notes
- The `--primary` CSS color is currently near-black (`222 47% 11%`). A separate session will handle updating button colors across the app. Screenshots should be taken AFTER that color fix is done.
- Do NOT retake screenshots programmatically. The user is creating them manually.
- The previous audit incorrectly flagged most screenshots as "dirty" — most are actually fine. The user will decide which need replacing.

---

## Full Manifest

### 1. Overview (1 image)
**Article:** `/help/getting-started/overview`

| # | Name for staging | What to capture | Current file | Size |
|---|---|---|---|---|
| Overview 1 | Dashboard page — stat cards + getting started checklist | `getting-started/dashboard.png` | lg |

### 2. First Customer (4 images)
**Article:** `/help/getting-started/first-customer`

| # | Name for staging | What to capture | Current file | Size |
|---|---|---|---|---|
| First Customer 1 | Customers page empty state | `customers/empty-state.png` | lg |
| First Customer 2 | Add Customer dialog (3 fields) | `customers/add-customer-form.png` | md |
| First Customer 3 | Customers list with a customer row | `customers/customer-list.png` | lg |
| First Customer 4 | Customer detail page (fields, token, status toggle) | `customers/customer-detail.png` | lg |

### 3. Embed Script (1 image)
**Article:** `/help/getting-started/embed-script`

| # | Name for staging | What to capture | Current file | Size |
|---|---|---|---|---|
| Embed Script 1 | Settings > Embed Code page (script + Generated CSS) | `getting-started/embed-code-settings.png` | lg |

### 4. Menu Customizer (2 images)
**Article:** `/help/theme-builder/menu`

| # | Name for staging | What to capture | Current file | Size |
|---|---|---|---|---|
| Menu 1 | Full Menu Customizer (templates, preview, toggle list) | `theme-builder/menu-editor.png` | lg |
| Menu 2 | Banner & Notification Options + Custom Menu Links | `theme-builder/menu-banner-options.png` | md |

### 5. Login Designer (5 images)
**Article:** `/help/theme-builder/login`

| # | Name for staging | What to capture | Current file | Size |
|---|---|---|---|---|
| Login 1 | Full Login Designer (canvas + panels) | `theme-builder/login-canvas.png` | lg |
| Login 2 | "Choose a Starting Point" dialog (6 presets) | `theme-builder/login-presets.png` | md |
| Login 3 | Elements panel (6 types + Login Form) | `theme-builder/login-elements.png` | sm |
| Login 4 | Background tab (color picker + gradients) | `theme-builder/login-background.png` | sm |
| Login 5 | Form styling tab (logo, colors, labels, button) | `theme-builder/login-form-styling.png` | sm |

### 6. Brand Colors (3 images)
**Article:** `/help/theme-builder/colors`

| # | Name for staging | What to capture | Current file | Size |
|---|---|---|---|---|
| Colors 1 | Full 3-panel editor (gallery + preview + studio) | `theme-builder/colors-editor.png` | lg |
| Colors 2 | Theme Gallery panel (8 presets + My Themes) | `theme-builder/colors-presets.png` | sm |
| Colors 3 | Color Studio panel (4 colors, harmony, contrast) | `theme-builder/colors-studio.png` | sm |

### 7. Loading Animations (2 images)
**Article:** `/help/theme-builder/loading`

| # | Name for staging | What to capture | Current file | Size |
|---|---|---|---|---|
| Loading 1 | Full Loading page (tabs, grid, preview, settings) | `theme-builder/loading-picker.png` | lg |
| Loading 2 | Animation Settings panel (speed, size, color) | `theme-builder/loading-settings.png` | sm |

### 8. First Tour (3 images)
**Article:** `/help/guidely/first-tour`

| # | Name for staging | What to capture | Current file | Size |
|---|---|---|---|---|
| First Tour 1 | Tours list page (sidebar, search, grid, New Tour) | `guidely/tours-list.png` | lg |
| First Tour 2 | Create New Tour dialog | `guidely/tour-create-dialog.png` | md |
| First Tour 3 | Tour builder (step list + editor + preview) | `guidely/tour-step-editor.png` | lg |

### 9. Checklists (1 image)
**Article:** `/help/guidely/checklists`

| # | Name for staging | What to capture | Current file | Size |
|---|---|---|---|---|
| Checklists 1 | Checklist builder (items + live widget preview) | `guidely/checklist-builder.png` | lg |

### 10. Smart Tips (1 image)
**Article:** `/help/guidely/smart-tips`

| # | Name for staging | What to capture | Current file | Size |
|---|---|---|---|---|
| Smart Tips 1 | Tip editor (beacon, content, triggers, preview) | `guidely/tip-editor.png` | lg |

### 11. Banners (1 image)
**Article:** `/help/guidely/banners`

| # | Name for staging | What to capture | Current file | Size |
|---|---|---|---|---|
| Banners 1 | Banner editor (content, action, appearance, preview) | `guidely/banner-editor.png` | lg |

### 12. Themes (1 image)
**Article:** `/help/guidely/themes`

| # | Name for staging | What to capture | Current file | Size |
|---|---|---|---|---|
| Themes 1 | Themes page (5 starters, My Themes, Feature Defaults) | `guidely/themes-page.png` | lg |

### 13. Analytics (1 image)
**Article:** `/help/guidely/analytics`

| # | Name for staging | What to capture | Current file | Size |
|---|---|---|---|---|
| Analytics 1 | Analytics dashboard (stats, breakdown, top performers) | `guidely/analytics-dashboard.png` | lg |

### 14. Image Templates (1 image)
**Article:** `/help/images/templates`

| # | Name for staging | What to capture | Current file | Size |
|---|---|---|---|---|
| Templates 1 | Image Personalization page (template cards) | `images/templates-list.png` | lg |

### 15. Image Editor (2 images)
**Article:** `/help/images/editor`

| # | Name for staging | What to capture | Current file | Size |
|---|---|---|---|---|
| Editor 1 | Full image editor (names, canvas, controls) | `images/image-editor.png` | lg |
| Editor 2 | Text & image toolbar strip | `images/editor-toolbar.png` | full |

### 16. Image URLs (1 image)
**Article:** `/help/images/urls`

| # | Name for staging | What to capture | Current file | Size |
|---|---|---|---|---|
| URLs 1 | URLs tab (links, merge tags, live preview) | `images/urls-tab.png` | lg |

### 17. Events (1 image)
**Article:** `/help/trustsignal/events`

| # | Name for staging | What to capture | Current file | Size |
|---|---|---|---|---|
| Events 1 | Events tab (table, source badges, notification preview) | `trustsignal/events-table.png` | lg |

### 18. Widget (2 images)
**Article:** `/help/trustsignal/widget`

| # | Name for staging | What to capture | Current file | Size |
|---|---|---|---|---|
| Widget 1 | Widgets list (cards with theme, events, previews) | `trustsignal/widgets-list.png` | lg |
| Widget 2 | Appearance settings (themes, colors, CSS, position) | `trustsignal/widget-appearance.png` | md |

### 19. Profile (1 image)
**Article:** `/help/settings/profile`

| # | Name for staging | What to capture | Current file | Size |
|---|---|---|---|---|
| Profile 1 | Profile page (name, email, plan badge, token) | `settings/profile-page.png` | lg |

### 20. GHL Setup (1 image)
**Article:** `/help/settings/ghl`

| # | Name for staging | What to capture | Current file | Size |
|---|---|---|---|---|
| GHL 1 | GHL Integration card (domain, auto-close) | `settings/ghl-setup.png` | lg |

### 21. Photos (1 image)
**Article:** `/help/settings/photos`

| # | Name for staging | What to capture | Current file | Size |
|---|---|---|---|---|
| Photos 1 | Photo Uploads card (toggle, coming soon, notifications) | `settings/photo-uploads.png` | lg |

### 22. Excluded Locations (1 image)
**Article:** `/help/settings/excluded`

| # | Name for staging | What to capture | Current file | Size |
|---|---|---|---|---|
| Excluded 1 | Excluded Locations page (input, list, Copy All) | `settings/excluded-locations.png` | lg |

### 23. Delete Account (1 image)
**Article:** `/help/settings/delete`

| # | Name for staging | What to capture | Current file | Size |
|---|---|---|---|---|
| Delete 1 | Danger Zone page (warning, deletion list, red button) | `settings/danger-zone.png` | lg |

---

**Total: 38 image slots across 23 articles**
(Plans article has no screenshots)
