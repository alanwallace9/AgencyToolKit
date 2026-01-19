# Social Proof Widget - Competitor Analysis

**Date:** 2026-01-19
**Sources:** ProveSource (provesrc.com), Shapo (shapo.io) - same parent company
**Status:** Design conversation in progress

---

## Key Observations

### User Feedback
- Likes the left + top nav layout - "looks like a finished product"
- Appreciates that competitors didn't get bogged down in color pickers - focused on main goal
- ProveSource is parent company of Shapo (explains shared design language)

---

## ProveSource Screenshots Analysis

### 1. Notifications List Page

**Layout:**
- Left sidebar navigation (Collect Reviews, Notifications, Feed, Goals, Analytics, Plan & Billing, Settings, Video Guides, Help Center)
- Top bar with account info and key actions (Get Traffic, Refer & Earn, Install)
- Main content area with table

**Table Columns:**
| Priority | Name | Type | Preview | Status |
|----------|------|------|---------|--------|
| #1, #2, etc. | Name + date created | Type badge + icon | LIVE preview card | Toggle + Edit/Details |

**Key Features:**
- Inline live preview of each notification in the table
- Priority ordering (drag-to-reorder implied)
- Debug Mode toggle in header
- Search bar
- "+ New Notification" button (green CTA)

**Notification Types Visible:**
- Capterra reviews (Reviews type)
- Signups Stream (Stream type)
- No credit card required (Informational type)
- FB Reviews (Reviews type)
- Visits (Page Visits type)

---

### 2. Create New Notification - Type Selector

**Wizard Steps (left sidebar):**
1. Type ← Current step
2. Track
3. Display
4. Message
5. Customize
6. Launch

**6 Notification Types:**

| Type | Description | Preview Example |
|------|-------------|-----------------|
| **Stream** | Show recent individual actions taken by your customers | "Mike signed up for ProveSource" |
| **Social Counter** (New) | Show follower/subscriber counts across social profiles | FB/Twitter/YouTube/Instagram with counts |
| **Reviews** | Show positive reviews from Google, Facebook, other platforms | John Smith with 5 stars |
| **Informational** | Emphasize important points, make visitors comfortable | "Risk Free" with shield icon |
| **Counter** | Show total page visits, conversions, real-time visitors | "50 foodies seem to be hungry too" |
| **Combo** | Show large number of visitors who did action over time period | "50 visitors signed up in last 24 hours" |

**Additional Type (from other screenshot):**
| **Live Visitors** | Real-time visitor counter | "241 visitors are online" with green dot |

---

### 3. Customize Step (Step 5)

**Design Section:**
- Notification position: Dropdown (Bottom Left, etc.)
- Hide on mobile screens: Toggle (OFF/ON)
- Mobile Position: Separate setting (BOTTOM/TOP toggle)
- Title Color: Color picker with hex input

**Behavior Section:**
- Allow users to close the notification: Toggle
- Clickable Notification: Toggle → reveals Notification Link URL field
- Warning: "If http:// is omitted, the link will open relatively to the page displayed"
- Open notification link in a new tab: Toggle
- Automatically append UTM params: Toggle
- Add Call-To-Action: Toggle

**Live Preview:**
- Shows notification with Google Maps thumbnail for location
- Updates in real-time as settings change

---

### 4. Analytics Dashboard

**Performance Metrics (with date range selector):**

| Metric | Example Value |
|--------|---------------|
| Visitors | 34,323 |
| Engaged Visitors | 33,138 |
| Engagement Ratio | 96.5% |
| Impressions | 87,147 |
| Hovers | 7,517 |
| Clicks | 1,809 |
| CTR | 2.1% |

**Chart:**
- Line graph over time
- Multiple series: Visitors, Engaged Visitors, Impressions, Clicks, Hovers
- Export button, Date range picker, Refresh button

---

### 5. Notification Type Examples (Marketing Page)

**Stream:** Product image (Nike shoe) + "Mike purchased Nike Air Presto, 12 minutes ago"
**Combo:** "992 People visited our store in the last 24 hours"
**Live Visitors:** Green dot + "241 visitors are online"
**Reviews:** Google review with 5 stars and review text
**Informational:** Shield icon + "Risk Free - Your purchase is backed by our 30-day money-back guarantee"
**Social Counter:** Platform icons with follower counts

---

### 6. Notification Type Use Cases (Text List)

From their marketing:
- Live Visitors Count: "There are X visitors online right now."
- Page Visits Notification: "X people visited this page in the last 30 days."
- Product Purchase Notifications: "X just purchased this product."
- Sign Up Notifications: "X just signed up to our email newsletter."
- Add-to-Cart Notifications: "X shoppers added this item to their cart today."
- Download Notifications: "X just downloaded this product."
- Social Media Notifications: "X people followed us on Instagram today."

---

## Shapo Screenshots Analysis

### 7. Embed Snippet Format

```html
<div id="shapo-widget-509124a306f6ee308392"></div>
<script id="shapo-embed-js"
  type="text/javascript"
  src="https://cdn.shapo.io/embed.js" async></script>
```

**Approach:** Div placeholder + script (allows positioning widget in DOM)
**Our approach:** Single script tag (fixed position overlay)

---

### 8. Import Testimonials Dialog

**Multi-Source Import Sidebar:**
- Text Testimonial (manual entry)
- Google
- Facebook
- Twitter
- LinkedIn
- Instagram
- Capterra
- Trustpilot
- Reddit
- Yelp
- G2
- App Store
- Play Store

**Manual Entry Form Fields:**
- Full name (required)
- Tagline (e.g., "Co-founder & CTO at...")
- Email
- Link
- Rating (5 stars)
- Profile Picture (pick an image)
- Message (required)
- Date

---

### 9. Google Review Badge Widget

**Business Search:**
- Search by Google business name or address
- Shows result with name, address, rating, review count
- "Search another business" link

**Badge Preview:**
- Live preview on mock website layout
- Shows: Google logo, 5 stars, "4.9 rating from 609 reviews", stacked avatars, "Leave a Review" button, "Powered by Shapo"

**Badge Settings:**
- Badge Template: 6 presets (Classic, Modern, Minimal, Dark, Compact, Colorful)
- Button Text: Editable (default "Leave a Review")
- Button Color: Color picker
- Badge Position: Top Left, Top Right, Bottom Left, Bottom Right (visual selector)

**Output:**
- "Copy Badge Code" button

---

### 10-12. Google Review Link Generator

**Flow:**
1. Search for business by name
2. Select from results (shows name, address, rating)
3. Get Place ID automatically
4. Generate review link: `https://search.google.com/local/writereview?placeid=XXX`
5. Copy link button
6. QR Code generator with:
   - Background Color picker
   - Foreground Color picker
   - Download button

---

## Feature Categorization for Our Implementation

### MVP (Current Sprint)
| Feature | Status | Notes |
|---------|--------|-------|
| Stream notifications | ✅ Built | Individual action notifications |
| Placements system | 📋 Planned | Bitly-style embed code manager |
| Shape/shadow presets | 📋 Planned | Square, Rounded, Pill + shadow levels |
| Basic styling | ✅ Built | Colors, position, timing |
| Theme presets | ✅ Built | Minimal, Glass, Dark, Rounded |

### Quick Wins (Easy Adds)
| Feature | Effort | Value |
|---------|--------|-------|
| Informational type | Low | Static promotional messages, no capture needed |
| Clickable notification | Low | Link URL + new tab toggle |
| Mobile visibility toggle | Low | Hide on mobile screens option |
| Call-to-action text | Low | "Learn more →" link at bottom |

### V2 Backlog
| Feature | Effort | Notes |
|---------|--------|-------|
| Reviews type | Medium | Google/Facebook review display (needs API) |
| Counter type | Medium | Page visit counts |
| Combo type | Medium | Aggregate stats over time periods |
| Live Visitors | High | Real-time tracking |
| Analytics dashboard | High | Impressions, clicks, CTR tracking |
| UTM parameter appending | Low | Auto-append to notification links |
| Separate mobile position | Low | Different position on mobile |
| Multi-source import | High | OAuth integrations for platforms |
| Social Counter | High | Follower counts (needs OAuth) |

### Separate Module (Future Feature)
| Feature | Effort | Notes |
|---------|--------|-------|
| Google Review Link Generator | Medium | Google Places API integration |
| Review Badge Widget | Medium | Embeddable badge with rating display |
| QR Code Generator | Low | Library exists, easy to add |

---

## Design Takeaways

### What ProveSource Does Well
1. **Clean left + top nav** - Professional, finished look
2. **Inline previews** - See exactly what notification looks like in list
3. **Focused wizard** - Step-by-step for first-time creation
4. **Didn't over-engineer color customization** - Simple, goal-focused
5. **Priority ordering** - Drag to reorder notifications
6. **Debug mode** - Easy testing

### What Shapo Does Well
1. **Minimal aesthetic** - Clean, modern
2. **Visual template selectors** - Cards with previews
3. **Live preview prominence** - Always visible
4. **Google Review integration** - Simple, valuable tool
5. **QR code generation** - Nice touch for offline use

### Our Direction
- Closer to Shapo's cleaner aesthetic
- Tab-based editor (good for editing, wizard might be good for creation)
- Placements table will add organizational clarity
- Keep focused on core goal - don't over-engineer styling options

---

## Open Questions for Next Session

1. Should we add a creation wizard flow for new users, or keep tab-based?
2. Should "Informational" type be added to MVP? (static messages, very easy)
3. How important is inline preview in the widget list?
4. Should we explore the Google Review Link Generator as a separate quick feature?
5. What's the priority on analytics/tracking?

---

## Next Session Prompt

```
Continue the Social Proof Widget design conversation.

Read the competitor analysis first:
docs/sessions/session-social-proof-competitor-analysis.md

We were discussing ProveSource and Shapo features and design patterns.

Key points from last session:
1. User likes the left + top nav layout - looks finished
2. Appreciates competitors didn't over-engineer color pickers - focused on main goal
3. ProveSource and Shapo are same parent company

Open questions to discuss:
1. Should we add an "Informational" notification type to MVP? (static promotional messages)
2. Wizard flow vs tab-based for creating new widgets?
3. Priority on adding inline previews to widget list?
4. Google Review Link Generator as separate feature?
5. Analytics/tracking priority?

After finalizing design decisions, we can proceed with implementation from:
docs/sessions/session-social-proof-v2-handoff.md
```
