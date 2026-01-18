# GHL Integration Research

Research findings for integrating Agency Toolkit with GoHighLevel.

**Last Updated:** 2026-01-18

---

## GHL Technical Architecture

### Framework & Rendering
- **GHL is built on VueJS** - Single Page Application (SPA)
- **DOM does NOT load instantly** - Vue renders components after initial load
- **DOM loads AFTER loading animation completes**
- **Custom JS/CSS injected BEFORE DOM is ready** - Timing matters
- **Page navigation doesn't trigger full reloads** - Vue handles routing internally

### Loading States (4 distinct states)
1. **Initializing the App** - Spinner when launching/loading pages
2. **Loading Fresh Data** - Fetching based on user actions
3. **Retrieving Sub-account Details** - Switching accounts
4. **Infinite Loading** - Timeout after ~30 seconds with refresh prompt

### Impact of Custom Code on GHL
- Custom CSS can **override loader styles** causing visual issues
- Custom JS can **alter event handlers** disrupting functionality
- Test thoroughly after GHL platform updates
- Use **specific selectors** - avoid broad wildcards like `[class*="something"]`

---

## How Other GHL Customization Tools Work

### GHL Style (ghlstyle.com)
- **Approach:** Pure CSS injection via GHL's native Custom CSS field
- **Delivery:** CDN-delivered for fast loading
- **Scope:** Visual-only changes - doesn't modify functionality
- **User Action:** User copies generated CSS into GHL settings manually

### GHL Customizer (The Marketer's Toolkit)
- **Approach:** Directly connected to HighLevel via GHL's Custom JS/CSS fields
- **Maintenance:** 4 full-time developers maintaining it
- **Scale:** 500+ agencies using it
- **Integration:** Software is "locked" to a single HighLevel account

### Native GHL Features
- **Custom Menu Links:** Add custom navigation links (iframe, new tab, or current tab)
- **Custom CSS Field:** Agency Settings → Company → Custom CSS (applies to ALL sub-accounts)
- **Per Sub-Account CSS:** Requires manual configuration or developer involvement

---

## Where Custom Code Goes in GHL

| Location | Scope | Access |
|----------|-------|--------|
| Agency Settings → Company → Custom CSS | ALL sub-accounts | Agency admins |
| Per sub-account custom code | Single sub-account | Requires manual setup |
| Community Group custom code | Community only | Group admins |

### Disabling Custom Code for Debugging
Add `?customCode=false` to any GHL URL to temporarily disable custom code.

---

## CSS Selectors Reference

See `docs/GHL_SELECTORS.md` for the complete selector reference discovered on 2026-01-18.

### Key Selector Patterns
- **Sidebar container:** `.lead-connector`, `#sidebar-v2`
- **Menu items:** `#sb_*` (ID selector, NOT data-attribute)
- **Menu text:** `span.nav-title`, `span.hl_text-overflow`
- **Buttons:** `.btn-primary`, `.hr-button--primary-type`, `.n-button--primary-type`
- **Inputs:** `.hl-text-input`, `.hr-input__input-el`, `.n-input__input-el`
- **Loading:** `.v-spinner`, `.app-loader`, `.hl-loader-container`

### Dangerous Selectors to AVOID
- `[class*="lead-connector"]` - Matches entire sidebar container!
- Any `[class*="..."]` pattern that could match parent containers
- Overly broad selectors that hide/style unintended elements

---

## Caching Layers

Understanding where caching occurs in the embed script flow:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CACHING LAYERS                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Layer 1: Browser Cache                                              │
│  └── Browser caches embed.js based on Cache-Control headers          │
│  └── Hard refresh (Cmd+Shift+R) bypasses this                        │
│                                                                      │
│  Layer 2: Vercel CDN Edge Cache                                      │
│  └── Vercel caches at edge locations worldwide                       │
│  └── New deployments should invalidate, but propagation takes time   │
│                                                                      │
│  Layer 3: Embed Script Cache-Control Header                          │
│  └── Currently set to: max-age=300 (5 minutes)                       │
│  └── Means browsers/CDNs can serve cached version for 5 min          │
│                                                                      │
│  Layer 4: API Config Response                                        │
│  └── /api/config endpoint - should reflect DB changes immediately    │
│  └── No caching currently (needs verification)                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Why Changes May Appear Delayed
1. Browser has old embed.js cached
2. CDN edge hasn't received new version yet
3. 5-minute cache header allows stale responses
4. Multiple refreshes needed to get fresh code

### Recommendations for Development
- Reduce cache time during development/testing
- Consider adding cache-busting version parameter
- Document expected propagation times for users

---

## Alternative Approaches for Customization

### Approach 1: Pure CSS (User Pastes Code)
**How it works:** Theme Builder generates CSS, user copies it into GHL's Custom CSS field

**Pros:**
- No JavaScript dependencies
- GHL's native feature, stable
- User has full control
- Changes apply immediately after paste

**Cons:**
- Manual step for user (copy/paste)
- User must re-paste when making changes
- Not "live" - requires user action

### Approach 2: JavaScript Embed Script
**How it works:** Script tag loads JS that fetches config and injects CSS dynamically

**Pros:**
- Changes apply automatically (after cache clears)
- Enables dynamic features (tours, social proof)
- Single setup - no repeated user action

**Cons:**
- Timing issues with VueJS rendering
- Risk of breaking GHL functionality
- Caching complexity
- Security considerations

### Approach 3: Hybrid Approach
**How it works:** CSS-only for styling, JavaScript only for features that require it (tours, social proof)

**Pros:**
- Minimizes JavaScript risk
- Theme styling is stable via CSS
- JS only for truly dynamic features

**Cons:**
- Two different delivery mechanisms
- More complex setup documentation

### Approach 4: In-App Builder with Iframe
**How it works:** User loads GHL inside Agency Toolkit iframe, builds tours/styles there

**Pros:**
- Full control over the iframe environment
- Can inject scripts without embed code
- Better for element selection (tours)

**Cons:**
- Cross-origin restrictions may apply
- User experience of "GHL inside another app"
- Synchronization of changes to actual GHL

---

## Features Requiring JavaScript

These features CANNOT be CSS-only:

| Feature | Why JS Required |
|---------|-----------------|
| Onboarding Tours | Driver.js library, step sequencing, progress tracking |
| Personalized Images | Dynamic URL generation with merge fields |
| Social Proof Widget | Real-time notifications, animations, data fetching |
| Builder Mode (element selector) | Click handling, DOM inspection, cross-tab messaging |

---

## Sources

- [HighLevel Support: Custom Menu Links](https://help.gohighlevel.com/support/solutions/articles/48001185767-customizing-highlevel-menus-a-guide-to-custom-menu-links)
- [HighLevel Support: Loading States & Custom CSS/JS Impact](https://help.gohighlevel.com/support/solutions/articles/48001176375-crm-loading-states-troubleshooting-lags-and-impact-of-custom-css-and-js)
- [HighLevel Support: Agency Company Settings](https://help.gohighlevel.com/support/solutions/articles/48000982604-agency-company-settings-in-highlevel)
- [HighLevel Support: Adding Custom CSS/JS in Community Groups](https://help.gohighlevel.com/support/solutions/articles/155000002165-adding-custom-css-js-in-community-group)
- [GHL Style](https://www.ghlstyle.com/)
- [The Marketer's Toolkit](https://themarketerstoolkit.com/)
- [GoHighLevel Custom CSS Guide](https://supplygem.com/gohighlevel-custom-css/)

---

*Document created: 2026-01-18*
