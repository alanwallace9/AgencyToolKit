# GHL Selector Reference

This document tracks the CSS selectors used by GoHighLevel's UI. These selectors are used by the Agency Toolkit embed script to apply customizations.

**Last Updated:** 2026-01-18
**Discovery Version:** 1.0.0

---

## Quick Reference (What Embed Script Should Use)

### Sidebar / Left Nav

| Target | Correct Selector | Notes |
|--------|------------------|-------|
| Sidebar container | `.lead-connector`, `#sidebar-v2` | Main wrapper |
| Menu items | `#sb_[name]` or `[id^="sb_"]` | Uses ID, NOT data-attribute |
| Menu text | `span.nav-title`, `span.hl_text-overflow` | Text inside menu items |
| Menu icons | `img.mr-2` | Icons are `<img>` tags |
| Active item | `.active`, `.exact-active` | On the `<a>` element |
| Settings link | `.hl_nav-settings` | Bottom settings area |

**Menu Item HTML Structure:**
```html
<a id="sb_launchpad" class="w-full group px-3 flex items-center ... active exact-active">
  <img class="md:mr-0 h-5 w-5 launchpad mr-2 lg:mr-2 xl:mr-2">
  <span class="hl_text-overflow sm:hidden md:hidden nav-title lg:block xl:block">
    Launchpad
  </span>
</a>
```

### Top Navigation / Header

| Target | Correct Selector | Notes |
|--------|------------------|-------|
| Header container | `.hl_header`, `.hl-header-container` | Top bar |
| Top bar tabs | `.hl_topbar-tabs` | Sub-navigation |
| User avatar | `.hl_header--avatar` | Profile dropdown trigger |
| Help icon | `#hl_header--help-icon` | Help button |
| Copilot icon | `#hl_header--copilot-icon` | AI assistant |

### Buttons

| Target | Correct Selector | Notes |
|--------|------------------|-------|
| Primary buttons | `.btn-primary`, `.hr-button--primary-type`, `.n-button--primary-type` | Main CTAs |
| Secondary buttons | `.hr-button--secondary`, `.hr-button--default-type` | Secondary actions |
| All buttons (generic) | `.hr-button`, `.n-button`, `.btn` | Base button classes |
| Text buttons | `.hl-text-btn`, `.hr-button--text` | Link-style buttons |

### Loading States

| Target | Correct Selector | Notes |
|--------|------------------|-------|
| Spinner | `.v-spinner`, `.app-loader`, `.hl-loader-container` | Loading spinners |
| Skeleton | `.hr-skeleton`, `.n-skeleton` | Placeholder content |
| Our loader | `.agency-toolkit-loader-instance`, `.at-loader` | Injected by embed |

### Forms

| Target | Correct Selector | Notes |
|--------|------------------|-------|
| Text inputs | `.hl-text-input`, `.hr-input__input-el`, `.n-input__input-el` | Input fields |
| Selects | `.hr-select`, `.n-select`, `.v-select`, `.bootstrap-select` | Dropdowns |
| Textarea | `.hl-text-area-input`, `.form-control` | Multi-line inputs |

### Cards & Containers

| Target | Correct Selector | Notes |
|--------|------------------|-------|
| Cards | `.hl-card`, `.ui-card`, `.card` | Content cards |
| Modals | `.modal`, `.modal-content`, `.modal-dialog` | Dialog windows |
| Dropdowns | `.dropdown-menu`, `.hr-dropdown-cntr` | Dropdown menus |

---

## Known Menu Item IDs

From discovery on 2026-01-18:

| ID | Display Name |
|----|--------------|
| `sb_launchpad` | Launchpad |
| `sb_dashboard` | Dashboard |
| `sb_conversations` | Conversations |
| `sb_calendars` | Calendars |
| `sb_contacts` | Contacts |
| `sb_opportunities` | Opportunities |
| `sb_payments` | Payments |
| `sb_AI Agents` | AI Agents |
| `sb_email-marketing` | Marketing |
| `sb_automation` | Automation |
| `sb_sites` | Sites |
| `sb_memberships` | Memberships |
| `sb_app-media` | Media Storage |
| `sb_reputation` | Reputation |
| `sb_reporting` | Reporting |
| `sb_app-marketplace` | App Marketplace |
| `sb_settings` | Settings |

**Sub-menu items (tb_ prefix):**
- `tb_workflow` - Workflows
- `tb_social-planner` - Social Planner
- `tb_funnels` - Funnels
- `tb_websites` - Websites
- `tb_pipeline` - Pipeline
- `tb_lists` - Lists
- (many more in full report)

---

## CSS Patterns for Common Operations

### Hide a Menu Item
```css
#sb_calendars { display: none !important; }
```

### Rename a Menu Item
```css
#sb_launchpad span.nav-title {
  font-size: 0 !important;
}
#sb_launchpad span.nav-title::after {
  content: "Home";
  font-size: 14px;
}
```

### Style Sidebar Background
```css
.lead-connector,
#sidebar-v2,
.sidebar-v2-location {
  background-color: #1a1a2e !important;
}
```

### Style Sidebar Text
```css
.lead-connector a,
#sidebar-v2 a,
[id^="sb_"] {
  color: #ffffff !important;
}
```

### Style Primary Buttons
```css
.btn-primary,
.hr-button--primary-type,
.n-button--primary-type {
  background-color: #ea580c !important;
  border-color: #ea580c !important;
}
```

### Style Header/Top Nav
```css
.hl_header,
.hl-header-container {
  background-color: #1a1a2e !important;
}
```

---

## What Changed (History)

### 2026-01-18 - Initial Discovery

**Major findings vs. original assumptions:**

| What We Assumed | What GHL Actually Uses |
|-----------------|------------------------|
| `[data-sidebar-item="sb_*"]` | `#sb_*` (ID selector) |
| `span.hl-text-md` | `span.nav-title`, `span.hl_text-overflow` |
| `.sidebar` | `.lead-connector`, `#sidebar-v2` |
| Generic `.loading` | `.v-spinner`, `.app-loader` |

---

## Full Discovery Report Archive

### Report: 2026-01-18

<details>
<summary>Click to expand full JSON report</summary>

```json
{
  "version": "1.0.0",
  "timestamp": "2026-01-18T14:22:17.926Z",
  "pagesVisited": [
    "/v2/location/CAS1bzxeYd2KN6Hb0BnU/launchpad",
    "/v2/location/CAS1bzxeYd2KN6Hb0BnU/dashboard",
    "/v2/location/CAS1bzxeYd2KN6Hb0BnU/conversations/conversations",
    "/v2/location/CAS1bzxeYd2KN6Hb0BnU/contacts/smart_list/All",
    "/v2/location/CAS1bzxeYd2KN6Hb0BnU/opportunities/list",
    "/v2/location/CAS1bzxeYd2KN6Hb0BnU/payments/invoices",
    "/v2/location/CAS1bzxeYd2KN6Hb0BnU/marketing/social-planner",
    "/v2/location/CAS1bzxeYd2KN6Hb0BnU/automation/workflows",
    "/v2/location/CAS1bzxeYd2KN6Hb0BnU/reputation/overview",
    "/v2/location/CAS1bzxeYd2KN6Hb0BnU/reporting/reports",
    "/v2/location/CAS1bzxeYd2KN6Hb0BnU/settings/company"
  ],
  "sidebar": {
    "container": ".lead-connector, #sidebar-v2",
    "menuItems": "#sb_* or [id^='sb_']",
    "menuText": "span.nav-title, span.hl_text-overflow"
  },
  "buttons": {
    "primary": ".btn-primary, .hr-button--primary-type, .n-button--primary-type",
    "secondary": ".hr-button--secondary, .hr-button--default-type"
  },
  "loading": {
    "spinners": ".v-spinner, .app-loader, .hl-loader-container"
  }
}
```

</details>

---

## How to Update This Document

### Step 1: Run the Discovery Script

1. Open your GHL subaccount in Chrome
2. Open DevTools (F12 or Cmd+Option+I)
3. Go to Console tab
4. Copy/paste the contents of `scripts/ghl-selector-discovery.js`
5. Press Enter

### Step 2: Navigate Through GHL

Visit these pages to capture all selectors:
- Dashboard
- Contacts
- Conversations
- Calendar
- Opportunities (Pipeline)
- Payments
- Marketing
- Automation
- Reputation
- Reporting
- Settings

### Step 3: Export the Report

```javascript
GHLDiscovery.export()
```

### Step 4: Update This Document

1. Update the "Last Updated" date
2. Update the Quick Reference tables if selectors changed
3. Add entry to "What Changed (History)" section
4. Archive the full report

---

## Maintenance Schedule

- **Quarterly check**: Run discovery script and compare
- **After GHL updates**: Run discovery when GHL announces UI changes
- **User reports**: Investigate when users report broken customizations
