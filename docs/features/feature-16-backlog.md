# Feature 16: Dashboard Colors - Backlog

Items deferred from MVP for future enhancement.

---

## Phase 2: Dashboard Navigation Colors

### Top Navigation Theme
- `topnav_bg` - Top navigation background color
- `topnav_text` - Top navigation text color
- `topnav_border` - Top navigation border color
- Preview panel update to show top nav area

### Side Navigation Enhancements
- Menu item hover states
- Active item highlight
- Icon color customization
- Divider colors

---

## Phase 3: Granular Element Colors

*Reference: Similar to Marketer's Toolkit "Customize" tab with 50+ variables*

### Location Switcher & Quick Actions
- Location Switcher Input Background
- Location Switcher Border
- Location Switcher Color
- Quick Action Button Background/Border/Text
- Quick Action Button Hover states

### Form & Input Elements
- Form input backgrounds
- Card backgrounds and borders
- Dropdown styling
- Modal backgrounds

### Data Visualization
- Progress bar colors
- Chart/graph accent colors
- Alert/notification colors

---

## Phase 4: Custom Dashboard Buttons

*Reference: Marketer's Toolkit "Quick Actions" feature*

### Button Builder
- Add custom action buttons to dashboard header
- Configure button text, icon, color
- Link to external URLs or GHL pages
- Position control (left/right of header)

### Use Cases
- "Help Section" button linking to support portal
- "Book Appointment" linking to calendar
- "Training Videos" linking to course
- Agency-branded CTAs

---

## Phase 5: Advanced Customization

### Extended CSS Variables (50+)
- Form input backgrounds
- Card backgrounds and borders
- Progress bar colors
- Chart/graph accent colors
- Alert/notification colors
- Modal backgrounds
- Dropdown styling

### Typography Customization
- Font family selection (heading + body)
- Font weights
- Font sizes
- Line heights

### Spacing & Effects
- Border radius (global)
- Shadow intensity
- Padding adjustments
- Button styles (rounded, square, pill)

---

## Phase 6: Brand Import

### URL-Based Color Extraction
- Paste website URL
- Server-side screenshot via Playwright
- Extract dominant colors from page
- Suggest palette based on site branding
- Multiple URL support (extract from several pages)

---

## Phase 7: Multi-Tenant Themes

### Per Sub-Account Theme Assignment
- Assign themes to specific sub-accounts
- Group sub-accounts by industry (dentists, landscapers, etc.)
- Bulk assign theme to group
- Override at sub-account level
- "Click to activate" interface

### Theme Collections
- Create theme collections for industries
- Share collections across agencies (marketplace potential)
- Import/export theme packs

---

## Phase 8: Real-Time Sync

### Live GHL Integration
- Auto-apply theme changes without copy-paste
- Leverage embed.js for CSS injection
- Real-time preview inside actual GHL (not just mockup)
- Instant sync on save
- Version history with rollback

---

## CRITICAL: Subscription Protection (Before Launch)

### The Problem
Without protection, a user could:
1. Pay for one month, save all their presets
2. Cancel subscription
3. Continue using the embed code forever (or share it with others)

### How the Embed System Works
```
GHL Page Load → embed.js?key=TOKEN → GET /api/config?key=TOKEN → Server returns config → Script applies styles
```

The embed code is STATIC (paste once, never changes). The config is DYNAMIC (fetched live from our database on every page load). Changes in Theme Builder save to DB and take effect immediately - no need to re-copy embed code.

### Recommended Solution
Add subscription validation to `/api/config`:

```typescript
// In /api/config/route.ts
const agency = await getAgencyByToken(token);

// Check subscription status
if (!agency || agency.subscription_status !== 'active') {
  return NextResponse.json({
    error: 'subscription_inactive',
    config: {} // Return empty config - GHL shows default UI
  });
}

// Return full config only for active subscribers
return NextResponse.json({ config: agency.settings });
```

### Implementation Steps
1. Add `subscription_status` field to agencies table
   - Values: 'active', 'cancelled', 'past_due', 'trialing'
2. Set up Stripe webhooks to update status:
   - `customer.subscription.created` → 'active'
   - `customer.subscription.updated` → check status
   - `customer.subscription.deleted` → 'cancelled'
   - `invoice.payment_failed` → 'past_due'
3. Update `/api/config` to check status before returning config
4. Grace period: Allow access until `current_period_end` from Stripe

### Token Sharing Protection
- Token is tied to agency account
- If someone shares their token, the recipient gets the SHARER's branding (not useful)
- When sharer cancels, token stops working for everyone

### What Users See
- Active subscription: Full customizations applied
- Cancelled/expired: GHL shows default UI (no customizations)
- Past due: Maybe show warning banner but still work (grace period)

### Priority
**HIGH** - Must be implemented before public launch to prevent revenue loss.

---

## Notes

- AI-powered palette generation: Decided against (cost unpredictable, hard to manage)
- These items should be revisited after customer feedback on MVP
- Priority order may change based on user requests

---

*Created: 2026-01-12*
*Updated: 2026-01-12 - Added subscription protection documentation*
*Updated: 2026-01-12 - Added top nav colors, granular element colors, custom dashboard buttons phases*
