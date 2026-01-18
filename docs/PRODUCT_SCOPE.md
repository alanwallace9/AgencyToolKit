# Agency Toolkit - Product Scope

Complete overview of Agency Toolkit features, both built and planned.

**Last Updated:** 2026-01-18

---

## Product Vision

Agency Toolkit is a SaaS product for GoHighLevel (GHL) agencies to customize their white-label sub-accounts. It provides visual customization, onboarding tours, personalized images, and embedded dashboards—all designed to help agencies deliver a premium, branded experience to their clients.

---

## Pricing Tiers

| Feature | Toolkit ($19/mo) | Pro ($39/mo) |
|---------|------------------|--------------|
| Menu Customizer | Yes | Yes |
| Login Page Designer | Yes | Yes |
| Loading Animation | Yes | Yes |
| Brand Colors / Theme Builder | Yes | Yes |
| Onboarding Tours | No | Yes |
| Personalized Image Generator | No | Yes |
| Social Proof Widget | No | Yes |
| GBP Dashboard | No | Yes |
| Customer Limit | 25 | Unlimited |

---

## Feature Details

### 1. Theme Builder (Toolkit + Pro)
**Status:** Built, needs embed script fixes

Visual interface to customize GHL's appearance:
- **Brand Colors Tab:** Primary, accent, sidebar bg/text colors + extended elements
- **Menu Tab:** Hide items, rename items, reorder (future), hide banners
- **Login Tab:** Background, form styling, logo, images/animations
- **Loading Tab:** Custom loading animations with speed/size controls

**Delivery:** Embed script injects CSS into GHL

---

### 2. Onboarding Tours (Pro Only)
**Status:** Partially built, needs completion

Create guided tours to onboard users to GHL:
- **Tour Builder:** Step-by-step tour creation
- **Element Selector:** Visual tool to select GHL elements for tour steps
- **Checklist Builder:** Companion checklist for tour progress
- **Driver.js Integration:** Tour library for step sequencing

**Delivery:** Embed script injects JavaScript + Driver.js

**Key Challenge:** Element selection requires JavaScript interaction with GHL DOM. Current approach uses Builder Mode with floating toolbar. May need alternative approach.

---

### 3. Personalized Image Generator (Pro Only)
**Status:** Not yet built

Dynamic image generation with personalization (like Nifty Images):
- **Template Library:** Pre-designed image templates
- **Merge Fields:** Insert dynamic data (name, company, etc.)
- **Use Cases:** Email headers, social proof, personalized greetings
- **@vercel/og Integration:** Edge-based image generation

**Delivery:** API endpoint generates images on-demand, URLs include merge field parameters

**Example URL:**
```
https://toolkit.example.com/api/og/welcome?name=John&company=Acme
```

**Note:** This is NOT the same as the login page image/GIF placement. This is for generating unique images per contact for use in emails, etc.

---

### 4. Social Proof Widget (Pro Only)
**Status:** Not yet built

Real-time notification popups showing recent activity:
- **"John just signed up!"** style notifications
- **Customizable appearance:** Colors, position, timing
- **Event triggers:** New customer, review received, etc.
- **Animation options:** Slide in, fade, etc.

**Delivery:** Embed script injects HTML/CSS/JavaScript

---

### 5. GBP Dashboard (Pro Only)
**Status:** Deferred to Phase 5

Google Business Profile analytics dashboard:
- **Iframe embeddable:** Loads inside GHL via custom menu link
- **Customer-specific:** Uses customer token for data isolation
- **Metrics:** Reviews, insights, performance data

**Delivery:** Agency Toolkit hosted page, embedded in GHL via iframe

---

## What Requires JavaScript (Cannot Be CSS-Only)

| Feature | Why JS Required |
|---------|-----------------|
| Onboarding Tours | Driver.js library, step sequencing, progress tracking, localStorage |
| Personalized Images | Dynamic URL generation (though could be API-only) |
| Social Proof Widget | Real-time notifications, animations, data fetching |
| Builder Mode | Click handling, DOM inspection, cross-tab messaging |
| Tour Completion Tracking | localStorage, API calls |

---

## What CAN Be CSS-Only

| Feature | Notes |
|---------|-------|
| Brand Colors | All color customizations |
| Menu Hiding | `display: none` on specific IDs |
| Menu Renaming | CSS `::after` pseudo-element trick |
| Loading Animation | CSS animations (though replacing GHL loader needs JS) |
| Login Page Styling | Background, form, buttons, inputs |
| Extended Elements | Top nav, cards, buttons, inputs, links |

---

## Delivery Mechanisms

### Option 1: JavaScript Embed Script (Current)
```html
<script src="https://toolkit.example.com/embed.js?key=al_xxx"></script>
```
- Fetches config from API
- Injects CSS dynamically
- Enables JS features (tours, social proof)
- Has caching/timing complexities

### Option 2: Pure CSS (User Copies)
- Theme Builder generates CSS code
- User pastes into GHL Settings → Company → Custom CSS
- Immediate application, no caching issues
- Manual step required for changes

### Option 3: Hybrid
- CSS features → User pastes generated CSS
- JS features → Minimal embed script for tours/social proof only

### Option 4: GHL Marketplace App (Future?)
- Official integration via GHL's marketplace
- More stable, blessed by GHL
- Requires GHL approval process

---

## Customer Journey

```
1. Agency signs up for Agency Toolkit
   └── Clerk creates user, webhook creates agency record

2. Agency configures Theme Builder
   └── Selects colors, menu items, login design, loading animation

3. Agency installs embed snippet in GHL
   └── GHL Agency Settings → Custom Code (head)

4. Agency's sub-accounts see customizations
   └── Embed script loads, fetches config, applies styles

5. (Pro) Agency creates onboarding tour
   └── Uses Builder Mode to select elements, creates steps

6. (Pro) Agency's users see tour on first login
   └── Driver.js guides them through GHL

7. (Pro) Agency uses personalized images
   └── Generates dynamic images for emails/campaigns
```

---

## Technical Architecture

### Database Tables
- `agencies` - Main agency record with all config
- `customers` - Sub-accounts (for GBP dashboard, etc.)
- `menu_presets` - Saved menu configurations
- `tours` - Tour definitions with steps
- `image_templates` - Personalized image templates

### Key API Endpoints
- `GET /api/config?key=xxx` - Returns agency config for embed script
- `GET /api/og/[templateId]` - Generates personalized images
- `POST /api/tours` - CRUD for tours
- `GET /embed.js?key=xxx` - Dynamic embed script

### Embed Script Flow
```
GHL Page Loads
  → Browser requests embed.js from Vercel
    → Embed script executes
      → Fetches config from /api/config
        → Injects CSS into <head>
        → If tours enabled, loads Driver.js
        → If social proof enabled, creates notification container
```

---

## Dependencies

| Dependency | Used For |
|------------|----------|
| Driver.js | Onboarding tours |
| @vercel/og | Personalized image generation |
| @dnd-kit | Menu reordering (future) |
| Sharp | Image processing |
| Cloudflare R2 | Image storage |

---

## Open Questions

1. **Embed approach:** JavaScript vs CSS-only vs Hybrid?
2. **Builder Mode:** Keep floating toolbar or use iframe in our app?
3. **Tours:** How to handle element selection safely?
4. **Caching:** What's acceptable delay for changes to appear?
5. **Custom menu links:** How to identify/handle them?

---

*Document created: 2026-01-18*
