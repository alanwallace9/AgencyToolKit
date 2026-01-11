# Testing Guide

Manual testing checklist for Agency Toolkit APIs and embed functionality.

## Prerequisites

- Dev server running: `pnpm dev`
- Signed in with a test account
- Agency record exists in Supabase (created via Clerk webhook on signup)

---

## 1. Get Your Agency Token

**Option A:** Check Settings page at http://localhost:3000/settings

**Option B:** Query Supabase directly:
```sql
SELECT token FROM agencies WHERE email = 'your-email@example.com';
```

Your token format: `rp_` followed by random characters.

---

## 2. API Endpoints

### 2.1 Config API

**Endpoint:** `GET /api/config?key={token}`

```bash
# Basic test - should return agency config
curl "http://localhost:3000/api/config?key=YOUR_TOKEN"

# Pretty print with jq
curl "http://localhost:3000/api/config?key=YOUR_TOKEN" | jq .

# Check just the menu config
curl "http://localhost:3000/api/config?key=YOUR_TOKEN" | jq .menu
```

**Expected response:**
```json
{
  "token": "rp_xxx",
  "plan": "free",
  "menu": {
    "hidden_items": [],
    "renamed_items": {},
    "item_order": [],
    "hidden_banners": [],
    "dividers": []
  },
  "login": null,
  "loading": null,
  "colors": null,
  "whitelisted_locations": [],
  "tours": []
}
```

**Error cases:**
```bash
# Missing key - should return 400
curl "http://localhost:3000/api/config"

# Invalid key - should return 404
curl "http://localhost:3000/api/config?key=invalid_token"
```

---

### 2.2 Customers API

**List customers:** `GET /api/customers`
```bash
curl "http://localhost:3000/api/customers" \
  -H "Cookie: YOUR_SESSION_COOKIE"
```

**Create customer:** `POST /api/customers`
```bash
curl -X POST "http://localhost:3000/api/customers" \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  -d '{"name": "Test Customer"}'
```

**Get customer:** `GET /api/customers/{id}`

**Update customer:** `PATCH /api/customers/{id}`

**Delete customer:** `DELETE /api/customers/{id}`

---

### 2.3 Menu Presets API

**List presets:** `GET /api/menu-presets`
```bash
curl "http://localhost:3000/api/menu-presets" \
  -H "Cookie: YOUR_SESSION_COOKIE"
```

**Create preset:** `POST /api/menu-presets`
```bash
curl -X POST "http://localhost:3000/api/menu-presets" \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  -d '{
    "name": "Test Preset",
    "is_default": true,
    "config": {
      "hidden_items": ["sb_payments", "sb_opportunities"],
      "renamed_items": {"sb_launchpad": "Home"},
      "item_order": [],
      "hidden_banners": ["hide_promos"]
    }
  }'
```

**Update preset:** `PATCH /api/menu-presets/{id}`

**Delete preset:** `DELETE /api/menu-presets/{id}`

---

### 2.4 Clerk Webhook

**Endpoint:** `POST /api/webhooks/clerk`

Tested automatically when:
- New user signs up → Creates agency record
- User deleted → Deletes agency and cascades

Check Supabase `agencies` table after signup to verify.

---

## 3. Embed Script

**Endpoint:** `GET /embed.js?key={token}`

### 3.1 View Generated Script

```bash
# View the embed script
curl "http://localhost:3000/embed.js?key=YOUR_TOKEN"
```

### 3.2 Test in HTML File

Create `test-embed.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Agency Toolkit - Embed Test</title>
  <style>
    body { font-family: sans-serif; padding: 20px; background: #1e293b; color: #fff; }
    .sidebar { width: 250px; }
    .menu-item { padding: 10px 15px; display: flex; align-items: center; gap: 10px; }
    .menu-item:hover { background: rgba(255,255,255,0.1); }
    .hl-text-md { font-size: 14px; }
    h3 { color: #94a3b8; font-size: 12px; margin: 20px 0 10px; }
  </style>
</head>
<body>
  <h1>Embed Script Test</h1>
  <p>Check console for [AgencyToolkit] logs</p>

  <div class="sidebar">
    <h3>MENU ITEMS</h3>

    <div class="menu-item" data-sidebar-item="sb_launchpad">
      <span>🚀</span>
      <span class="hl-text-md">Launchpad</span>
    </div>

    <div class="menu-item" data-sidebar-item="sb_dashboard">
      <span>📊</span>
      <span class="hl-text-md">Dashboard</span>
    </div>

    <div class="menu-item" data-sidebar-item="sb_conversations">
      <span>💬</span>
      <span class="hl-text-md">Conversations</span>
    </div>

    <div class="menu-item" data-sidebar-item="sb_contacts">
      <span>👥</span>
      <span class="hl-text-md">Contacts</span>
    </div>

    <div class="menu-item" data-sidebar-item="sb_payments">
      <span>💳</span>
      <span class="hl-text-md">Payments</span>
    </div>

    <div class="menu-item" data-sidebar-item="sb_opportunities">
      <span>🎯</span>
      <span class="hl-text-md">Opportunities</span>
    </div>

    <div class="menu-item" data-sidebar-item="sb_reputation">
      <span>⭐</span>
      <span class="hl-text-md">Reputation</span>
    </div>

    <div class="menu-item" data-sidebar-item="sb_email-marketing">
      <span>📧</span>
      <span class="hl-text-md">Email Marketing</span>
    </div>

    <h3>BANNERS (should hide based on config)</h3>

    <div class="promo-banner" style="background: #3b82f6; padding: 10px; margin: 5px 0;">
      Promotional Banner
    </div>

    <div class="warning-banner" style="background: #f59e0b; padding: 10px; margin: 5px 0;">
      Warning Banner
    </div>

    <div class="connect-prompt" style="background: #10b981; padding: 10px; margin: 5px 0;">
      Connect Prompt
    </div>
  </div>

  <!-- Enable debug mode -->
  <script>window.AGENCY_TOOLKIT_DEBUG = true;</script>

  <!-- Embed script - replace YOUR_TOKEN -->
  <script src="http://localhost:3000/embed.js?key=YOUR_TOKEN"></script>
</body>
</html>
```

Open in browser and verify:
- [ ] Console shows `[AgencyToolkit] Initializing with key: rp_xxx...`
- [ ] Console shows `[AgencyToolkit] Config loaded`
- [ ] Console shows `[AgencyToolkit] Applying menu config`
- [ ] Hidden items disappear from the list
- [ ] Renamed items show new names
- [ ] Hidden banners disappear

---

## 4. UI Testing Checklist

### 4.1 Menu Customizer Page

- [ ] Built-in templates display (Reputation Management, Voice AI)
- [ ] Clicking template loads its configuration
- [ ] Can save as new preset
- [ ] Can set preset as default
- [ ] Can delete custom presets
- [ ] Drag-and-drop reordering works
- [ ] Toggle visibility hides/shows items
- [ ] Rename input updates preview
- [ ] Add Plain Divider works
- [ ] Add Labeled Divider works
- [ ] Divider text is editable
- [ ] Dividers can be deleted
- [ ] Banner options toggle correctly
- [ ] CSS Preview Panel shows generated CSS
- [ ] Copy CSS button works (shows checkmark)
- [ ] Preview panel shows "Apply colors" button
- [ ] "Set custom colors" link goes to /colors

### 4.2 Customers Page

- [ ] List displays customers
- [ ] Can add new customer
- [ ] Can edit customer
- [ ] Can delete customer
- [ ] Token copy button works
- [ ] Plan limit enforced (shows upgrade prompt when at limit)

### 4.3 Settings Page

- [ ] Shows agency details (name, email, plan, token)
- [ ] Embed code displays correctly
- [ ] Copy embed code works
- [ ] Instructions accordion expands

---

## 5. Database Verification

```sql
-- Check agency exists
SELECT * FROM agencies WHERE email = 'your-email@example.com';

-- Check menu presets
SELECT * FROM menu_presets WHERE agency_id = 'YOUR_AGENCY_ID';

-- Check default preset
SELECT * FROM menu_presets WHERE agency_id = 'YOUR_AGENCY_ID' AND is_default = true;

-- Check customers
SELECT * FROM customers WHERE agency_id = 'YOUR_AGENCY_ID';
```

---

## 6. Common Issues

### Config API returns null menu
- Check if a default preset exists
- Verify preset has `is_default: true`

### Embed script not applying styles
- Check browser console for errors
- Verify token is correct
- Enable debug: `window.AGENCY_TOOLKIT_DEBUG = true`

### Menu items not hiding in GHL
- GHL selectors may have changed
- Check actual GHL HTML for correct `data-sidebar-item` values
- CSS specificity may need `!important`
