# TrustSignal Backlog

**Product:** Social Proof Widget (TrustSignal branding)
**Last Updated:** 2026-01-19

---

## Completed

### Phase 1A: Branding & Compliance ✅
*Completed: 2026-01-19*

- [x] Remove CSV import (FTC compliance)
- [x] Remove manual event entry (FTC compliance)
- [x] Add "✓ TrustSignal" attribution to notifications
- [x] Update default initial_delay to 10 seconds
- [x] Make dismiss button more prominent (always visible)
- [x] Update source enum: removed `csv`/`manual`, added `google`

---

## Phase 1B: Google Reviews Integration

**Goal:** Give new users a way to populate real, verifiable review data immediately via OAuth.

**Complexity:** Medium (~4-6 hours)

### Prerequisites

1. **Google Cloud Project**
   - Create project at console.cloud.google.com
   - Enable "Google Business Profile API"
   - Configure OAuth consent screen
   - Create OAuth 2.0 Client ID credentials
   - Add redirect URI: `{APP_URL}/api/auth/google/callback`

2. **Environment Variables**
   ```env
   GOOGLE_CLIENT_ID=xxx
   GOOGLE_CLIENT_SECRET=xxx
   GOOGLE_REDIRECT_URI=https://toolkit.getrapidreviews.com/api/auth/google/callback
   ```

### Database Changes

```sql
-- Migration: add_google_oauth_to_widgets
ALTER TABLE social_proof_widgets
ADD COLUMN google_place_id TEXT,
ADD COLUMN google_access_token TEXT,
ADD COLUMN google_refresh_token TEXT,
ADD COLUMN google_token_expires_at TIMESTAMPTZ,
ADD COLUMN google_business_name TEXT;
```

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/google` | GET | Start OAuth flow - redirects to Google |
| `/api/auth/google/callback` | GET | Handle OAuth callback, store tokens |
| `/api/social-proof/google/disconnect` | POST | Remove Google connection |
| `/api/social-proof/google/sync` | POST | Manually trigger review sync |

### OAuth Flow

```
User clicks "Connect Google Reviews"
         │
         ▼
GET /api/auth/google?widget_id=xxx
         │
         ▼
Redirect to Google OAuth with scopes:
- https://www.googleapis.com/auth/business.manage
         │
         ▼
User logs in, selects business, authorizes
         │
         ▼
Google redirects to /api/auth/google/callback
with authorization code
         │
         ▼
Exchange code for access_token + refresh_token
         │
         ▼
Store tokens in social_proof_widgets table
         │
         ▼
Fetch reviews from Google Business Profile API
         │
         ▼
Insert reviews as events with source='google'
         │
         ▼
Redirect back to widget editor with success message
```

### Token Refresh Logic

```typescript
// lib/google-auth.ts
async function getValidAccessToken(widget: SocialProofWidget): Promise<string> {
  // Check if token is expired (with 5 min buffer)
  if (widget.google_token_expires_at &&
      new Date(widget.google_token_expires_at) < new Date(Date.now() + 5 * 60 * 1000)) {
    // Refresh the token
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: widget.google_refresh_token!,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();

    // Update stored token
    await updateWidget(widget.id, {
      google_access_token: data.access_token,
      google_token_expires_at: new Date(Date.now() + data.expires_in * 1000),
    });

    return data.access_token;
  }

  return widget.google_access_token!;
}
```

### Fetching Reviews

```typescript
// lib/google-reviews.ts
async function fetchGoogleReviews(widget: SocialProofWidget) {
  const accessToken = await getValidAccessToken(widget);

  // Get reviews from Google Business Profile API
  const response = await fetch(
    `https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();
  return data.reviews;
}
```

### Review Event Format

When importing a Google review as an event:

```typescript
{
  widget_id: widget.id,
  agency_id: widget.agency_id,
  event_type: 'review',  // New event type
  source: 'google',
  first_name: review.reviewer.displayName.split(' ')[0],
  business_name: null,
  city: null,  // Not provided by Google
  custom_text: `"${review.comment?.substring(0, 100)}..."`,
  details: {
    google_review_id: review.reviewId,
    rating: review.starRating,  // FIVE, FOUR, THREE, TWO, ONE
    full_comment: review.comment,
    reviewer_photo: review.reviewer.profilePhotoUrl,
    create_time: review.createTime,
  },
  is_visible: review.starRating === 'FIVE' || review.starRating === 'FOUR',  // Auto-show 4-5 star
}
```

### UI Components

**1. Connect Button (in Events Tab or Settings)**
```tsx
// _components/google-connect-button.tsx
<Button onClick={startGoogleOAuth}>
  <GoogleIcon className="h-4 w-4 mr-2" />
  Connect Google Reviews
</Button>
```

**2. Connected Status**
```tsx
// When connected
<div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
  <CheckCircle className="h-4 w-4 text-green-600" />
  <span>Connected to {widget.google_business_name}</span>
  <Button variant="ghost" size="sm" onClick={syncReviews}>
    <RefreshCw className="h-3 w-3" />
  </Button>
  <Button variant="ghost" size="sm" onClick={disconnect}>
    Disconnect
  </Button>
</div>
```

**3. Review Notification Format**
```
⭐⭐⭐⭐⭐
"Amazing service, highly recommend!"
— John D.
2 hours ago

✓ TrustSignal
```

### Sync Strategy

| Option | Trigger | Notes |
|--------|---------|-------|
| Manual sync | User clicks "Sync" button | Always available |
| On page load | When widget editor opens | Check if last sync > 1 hour |
| Scheduled | Cron job every 6 hours | For Pro plan only |

### Filter Options (Future)

Once connected, users could filter which reviews to show:
- Minimum rating (4-5 stars only)
- Date range (last 30 days)
- Keywords in review text

### Files to Create

| File | Purpose |
|------|---------|
| `lib/google-auth.ts` | OAuth helpers, token refresh |
| `lib/google-reviews.ts` | Fetch and sync reviews |
| `app/api/auth/google/route.ts` | Start OAuth |
| `app/api/auth/google/callback/route.ts` | Handle callback |
| `app/api/social-proof/google/sync/route.ts` | Manual sync |
| `app/api/social-proof/google/disconnect/route.ts` | Disconnect |
| `[id]/_components/google-connect-button.tsx` | UI component |

### Acceptance Criteria

- [ ] User can click "Connect Google Reviews" and complete OAuth flow
- [ ] After connecting, widget shows business name and sync button
- [ ] Reviews are imported as events with `source: 'google'`
- [ ] 4-5 star reviews auto-show, 1-3 star auto-hide
- [ ] User can manually sync to get new reviews
- [ ] User can disconnect Google connection
- [ ] Token refresh works automatically
- [ ] Build passes

---

## Phase 2: Placements System

**Goal:** Replace single embed code with multiple "placements" - each placement has its own event type and can be installed on different pages.

**Why:** Agencies want one widget but different notifications on different pages:
- Homepage: "John just signed up"
- Pricing page: "Sarah just purchased"
- Demo page: "Mike just booked a demo"

### Database Changes

```sql
-- New table for placements
CREATE TABLE social_proof_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id UUID REFERENCES social_proof_widgets(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'signup',
  custom_event_text TEXT,
  page_url TEXT,  -- Optional: for reference only
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add shape and shadow to widgets
ALTER TABLE social_proof_widgets
ADD COLUMN shape TEXT DEFAULT 'rounded',  -- 'square', 'rounded', 'pill'
ADD COLUMN shadow TEXT DEFAULT 'medium';  -- 'none', 'subtle', 'medium', 'strong'

-- Link events to placements (optional)
ALTER TABLE social_proof_events
ADD COLUMN placement_id UUID REFERENCES social_proof_placements(id);

-- RLS
ALTER TABLE social_proof_placements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own placements" ON social_proof_placements
  FOR ALL USING (agency_id IN (
    SELECT id FROM agencies WHERE clerk_user_id = auth.jwt()->>'sub'
  ));
```

### Placement Limits by Plan

| Plan | Placements per Widget |
|------|----------------------|
| Free | 1 |
| Toolkit | 3 |
| Pro | 10 |

### TypeScript Types

```typescript
// types/database.ts
export interface SocialProofPlacement {
  id: string;
  widget_id: string;
  agency_id: string;
  name: string;
  event_type: SocialProofEventType;
  custom_event_text: string | null;
  page_url: string | null;
  created_at: string;
  updated_at: string;
}

export type SocialProofShape = 'square' | 'rounded' | 'pill';
export type SocialProofShadow = 'none' | 'subtle' | 'medium' | 'strong';
```

### Embed Code Changes

Current:
```html
<script src="https://toolkit.getrapidreviews.com/sp.js?key=sp_xxx"></script>
```

With placements:
```html
<script src="https://toolkit.getrapidreviews.com/sp.js?key=sp_xxx&event=signup"></script>
```

The `&event=` parameter tells the script which event type to show AND which event type to capture.

### UI: Placements Tab

Replace the current "Embed Code" tab with a "Placements" tab:

```
┌─────────────────────────────────────────────────────────────────┐
│ Placements                                           + Add New  │
├─────────────────────────────────────────────────────────────────┤
│ NAME           │ EVENT TYPE    │ PAGE URL        │ ACTIONS     │
├────────────────┼───────────────┼─────────────────┼─────────────┤
│ Homepage       │ signup        │ /               │ 📋 ✏️ 🗑️    │
│ Pricing        │ purchase      │ /pricing        │ 📋 ✏️ 🗑️    │
│ Demo Page      │ demo          │ /book-demo      │ 📋 ✏️ 🗑️    │
└────────────────┴───────────────┴─────────────────┴─────────────┘

📋 = Copy embed code
✏️ = Edit
🗑️ = Delete
```

### Settings Tab Updates

Add to Settings tab:

**Shape**
```
[ Square ] [ Rounded ] [ Pill ]
```

**Shadow**
```
┌─────────────────────┐
│ Shadow    [Medium ▼]│
│  • None             │
│  • Subtle           │
│  • Medium           │
│  • Strong           │
└─────────────────────┘
```

### sp.js Updates

```javascript
// Parse event parameter
var urlParams = new URLSearchParams(window.location.search);
var eventType = urlParams.get('event') || 'all';

// Filter events by type (if specified)
if (eventType !== 'all') {
  events = events.filter(e => e.event_type === eventType);
}

// Apply shape styles
function getShapeStyles() {
  switch (config.shape) {
    case 'square': return 'border-radius: 4px;';
    case 'pill': return 'border-radius: 9999px;';
    default: return 'border-radius: 8px;';  // rounded
  }
}

// Apply shadow styles
function getShadowStyles() {
  switch (config.shadow) {
    case 'none': return 'box-shadow: none;';
    case 'subtle': return 'box-shadow: 0 2px 8px rgba(0,0,0,0.08);';
    case 'strong': return 'box-shadow: 0 12px 40px rgba(0,0,0,0.2);';
    default: return 'box-shadow: 0 4px 12px rgba(0,0,0,0.1);';  // medium
  }
}
```

### Server Actions

```typescript
// New actions for placements
export async function getPlacementLimitInfo()
export async function getPlacements(widgetId: string)
export async function createPlacement(widgetId: string, data: {...})
export async function updatePlacement(id: string, data: {...})
export async function deletePlacement(id: string)
```

### Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `[id]/_components/placements-tab.tsx` | Create | New placements management UI |
| `[id]/_components/add-placement-dialog.tsx` | Create | Dialog for creating placements |
| `[id]/_components/embed-code-tab.tsx` | Delete | Replaced by placements tab |
| `[id]/_components/settings-tab.tsx` | Modify | Add shape/shadow controls |
| `[id]/_components/widget-editor.tsx` | Modify | Replace Embed tab with Placements |
| `_actions/social-proof-actions.ts` | Modify | Add placement CRUD actions |
| `app/sp.js/route.ts` | Modify | Event filtering, shape, shadow |
| `types/database.ts` | Modify | Add placement types |

### Acceptance Criteria

- [ ] Can create/edit/delete placements
- [ ] Each placement has unique embed code with event type
- [ ] Placement limits enforced by plan
- [ ] Shape selector works (square/rounded/pill)
- [ ] Shadow dropdown works (none/subtle/medium/strong)
- [ ] Embed script filters events by type parameter
- [ ] Embed script respects shape and shadow settings
- [ ] Notification preview reflects shape/shadow
- [ ] Build passes

---

## Phase 3: Polish & UX

**Goal:** Final polish, messaging updates, and any remaining UX improvements.

### Tasks

- [ ] Update notification preview with shape/shadow
- [ ] Show placement count on widget cards
- [ ] Update limit displays ("3 of 5 placements")
- [ ] Emphasize "real data only" in empty states
- [ ] Add help tooltips for new features
- [ ] Consider adding "Verified" badge to notifications

---

## Future Backlog (Post-V2)

### Additional Data Sources

| Source | Priority | Notes |
|--------|----------|-------|
| Stripe Webhooks | High | "John just purchased X" - verified transactions |
| GHL Webhooks | High | Pipeline moves, form submissions, tag triggers |
| System Milestones | Medium | Auto-generated: "100th customer!" |
| Facebook Reviews | Medium | Similar OAuth flow to Google |
| Zapier Webhooks | Low | Generic webhook receiver |

### Advanced Features

- Review response from dashboard
- A/B testing notification styles
- Analytics (impressions, dismissals, conversions)
- Mobile-specific positioning
- Sound/vibration options
- Custom animations

---

## Notes

- Domain: Currently using `toolkit.getrapidreviews.com`, update when TrustSignal domain secured
- Google OAuth: Requires verification for production (can use testing mode with 100 users initially)
- All data sources must be verifiable - no manual entry allowed
