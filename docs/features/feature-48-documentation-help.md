# Feature 48: Documentation & Help

## Overview

Add an internal help center and use Guidely to onboard users to Agency Toolkit itself (dogfooding). This feature provides documentation infrastructure, inline contextual help via Smart Tips, and guided onboarding checklists for both free and Pro users.

**Philosophy:** Use Guidely to onboard people to a product whose main feature is Guidely. This showcases the product while helping users succeed.

---

## Target Users

| User Type | Needs |
|-----------|-------|
| **New agencies** | Getting started guide, setup checklist, understand core features |
| **Existing agencies (Toolkit)** | Feature docs, troubleshooting, upgrade info |
| **Existing agencies (Pro)** | Pro feature guides, advanced usage |

**Not in scope:** Sub-account end users (they never see Agency Toolkit dashboard)

---

## Components

### 1. Help Center (`/help`)

**Route:** `/help` (internal, same domain)

**Why `/help` over subdomain:**
- Simpler implementation (just another Next.js route)
- Shared auth context (can personalize content based on plan)
- User stays in-app (seamless navigation)
- Can be moved to subdomain later if content grows massive

**Design Reference:** Usetiful Help Center style
- Clean, functional layout
- Knowledge base organized by category
- Article links with descriptions
- Minimal marketing fluff

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Agency Toolkit Help Center                                 │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔍 Search help articles...              (disabled)  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Getting Started                                            │
│  ├─ What is Agency Toolkit?                                │
│  ├─ Adding your first customer                             │
│  ├─ Installing the embed script                            │
│  └─ Understanding plans (Toolkit vs Pro)                   │
│                                                             │
│  Theme Builder                                              │
│  ├─ Menu Customizer                                        │
│  ├─ Login Designer                                         │
│  ├─ Brand Colors                                           │
│  └─ Loading Animations                                     │
│                                                             │
│  Guidely (Pro)                                    PRO       │
│  ├─ Creating your first tour                               │
│  ├─ Building checklists                                    │
│  ├─ Smart Tips overview                                    │
│  ├─ Banners & announcements                                │
│  └─ Themes & styling                                       │
│                                                             │
│  Images (Pro)                                     PRO       │
│  ├─ Creating image templates                               │
│  ├─ Using the image editor                                 │
│  └─ Generating personalized URLs                           │
│                                                             │
│  TrustSignal                                                │
│  ├─ Setting up social proof events                         │
│  └─ Installing the widget                                  │
│                                                             │
│  Settings & Account                                         │
│  ├─ Managing your profile                                  │
│  ├─ Excluded locations                                     │
│  └─ Deleting your account                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Implementation Notes:**
- Search input is present but disabled (v1) — shows "Coming soon" tooltip
- PRO badge on Pro-only categories
- Articles are placeholder/stub content for now (infrastructure first)
- Each article is a sub-route: `/help/getting-started/first-customer`
- Articles can be markdown files or hardcoded components

---

### 2. Inline Smart Tips (Contextual Help)

**Pattern:** `?` icon on complex fields → Guidely Smart Tip popover → link to help article

**How it works:**
1. User sees `?` icon next to a complex field (e.g., "CSS Selector" in tour builder)
2. Clicking `?` triggers a Guidely Smart Tip
3. Smart Tip shows brief explanation
4. "Learn more →" link goes to relevant `/help` article

**Benefits:**
- Showcases Guidely Smart Tips feature (dogfooding)
- Contextual help without leaving the page
- Links to deeper documentation when needed

**Where to add `?` icons:**
| Location | Field | Help Topic |
|----------|-------|------------|
| Tour Builder | CSS Selector | Finding page elements |
| Tour Builder | URL Pattern | Page targeting |
| Tour Builder | Trigger type | Tour triggers explained |
| Checklist Builder | Completion trigger | When items complete |
| Menu Editor | GHL menu IDs | How menu hiding works |
| Settings | Excluded Locations | What exclusions do |
| Images Editor | Text positioning | Image personalization |
| TrustSignal | Event types | Social proof events |

**Component:** `components/shared/help-tip.tsx`
```tsx
// Renders ? icon that triggers Guidely Smart Tip
// Props: tipId (references smart tip), helpUrl (fallback link)
```

---

### 3. Guidely Onboarding Checklists

Use Guidely's own checklist feature to onboard Agency Toolkit users.

#### Getting Started Checklist (Free)

**Target:** All new agencies
**Trigger:** First login / checklist not completed
**Position:** Standard checklist widget position

| Step | Title | Action | Help Link |
|------|-------|--------|-----------|
| 1 | Add your first customer | Navigate to Customers → Add | `/help/getting-started/first-customer` |
| 2 | Customize your menu | Navigate to Menu → Edit preset | `/help/theme-builder/menu` |
| 3 | Set your brand colors | Navigate to Colors → Pick theme | `/help/theme-builder/colors` |
| 4 | Set up TrustSignal (optional) | Navigate to TrustSignal → Add event | `/help/trustsignal/setup` |
| 5 | Install the embed script | Navigate to Settings → Copy code | `/help/getting-started/embed-script` |

**Completion:** All required steps done (TrustSignal is optional)

#### Pro Features Checklist (Pro only)

**Target:** Pro agencies who haven't explored Pro features
**Trigger:** Plan = Pro AND checklist not completed
**Position:** Standard checklist widget position

| Step | Title | Action | Help Link |
|------|-------|--------|-----------|
| 1 | Create your first tour | Navigate to Guidely → Tours → Create | `/help/guidely/first-tour` |
| 2 | Build an onboarding checklist | Navigate to Guidely → Checklists → Create | `/help/guidely/checklists` |
| 3 | Add a Smart Tip | Navigate to Guidely → Smart Tips → Create | `/help/guidely/smart-tips` |
| 4 | Personalize an image | Navigate to Images → Create template | `/help/images/first-template` |

**Completion:** All steps done

---

### 4. Dogfooding Setup

To run Guidely on Agency Toolkit itself, the embed script needs to load on the dashboard domain.

**Approach:** Option A — Add domains to agency record

**Why not hardcode:**
- Domains will change (localhost → getrapidreviews.com → agencytoolkit.com)
- Database update is easier than code change + redeploy

**Setup Steps:**
1. Create an agency record for Agency Toolkit itself (or use existing dev agency)
2. Add target domains to agency settings or a new field:
   - `localhost` (development)
   - `getrapidreviews.com` (current staging/prod)
   - `agencytoolkit.com` (future production)
3. Create the onboarding checklists in Guidely UI
4. Create Smart Tips for inline help
5. Embed script loads on these domains, Guidely features activate

**Alternative consideration:** Could also inject Guidely directly in the app code for authenticated users (no embed script needed). This avoids the token-based flow entirely. Evaluate during implementation.

---

## File Structure

```
app/(dashboard)/
├── help/
│   ├── page.tsx                    # Help center home
│   ├── layout.tsx                  # Help layout with breadcrumbs
│   ├── _components/
│   │   ├── help-search.tsx         # Search input (disabled v1)
│   │   ├── help-category.tsx       # Category section with articles
│   │   ├── help-article-card.tsx   # Article link card
│   │   ├── help-breadcrumb.tsx     # Navigation breadcrumb
│   │   ├── recently-viewed.tsx     # Recent articles section
│   │   ├── article-feedback.tsx    # "Was this helpful?" component
│   │   ├── related-articles.tsx    # Related articles list
│   │   ├── callout.tsx             # Tip/warning callout box
│   │   ├── screenshot.tsx          # Image with caption
│   │   └── code-block.tsx          # Copyable code block
│   ├── getting-started/
│   │   ├── page.tsx                # Category index
│   │   ├── first-customer/
│   │   │   └── page.tsx            # Article page
│   │   ├── embed-script/
│   │   │   └── page.tsx
│   │   └── plans/
│   │       └── page.tsx
│   ├── theme-builder/
│   │   ├── page.tsx
│   │   ├── menu/
│   │   ├── login/
│   │   ├── colors/
│   │   └── loading/
│   ├── guidely/
│   │   ├── page.tsx
│   │   ├── first-tour/
│   │   ├── checklists/
│   │   ├── smart-tips/
│   │   ├── banners/
│   │   └── themes/
│   ├── images/
│   │   ├── page.tsx
│   │   ├── first-template/
│   │   └── personalized-urls/
│   ├── trustsignal/
│   │   ├── page.tsx
│   │   └── setup/
│   └── settings/
│       ├── page.tsx
│       ├── profile/
│       ├── excluded-locations/
│       └── delete-account/

components/shared/
├── help-tip.tsx                    # ? icon for inline field help
└── help-header-button.tsx          # ? icon in header (page-level help)

components/dashboard/
└── user-nav.tsx                    # Avatar dropdown (add Help + Settings links)
```

---

## UI/UX Details

### Navigation Placement

| Element | Location | Purpose |
|---------|----------|---------|
| `?` icon (circled) | Header, next to PRO badge | Page-specific contextual help |
| "Help" link | Avatar dropdown menu | Full help center |
| "Settings" link | Avatar dropdown menu | Account settings (moved from main nav) |

**Rationale:** Moves utility items under avatar, keeps main nav focused on features. Common pattern (Notion, Linear, Figma).

### Help Center Home (`/help`)

**Header:**
- Title: "Help Center" or "How can we help?"
- Search input (disabled, shows tooltip "Coming soon")
- "New" badge for first 7 days after launch

**Categories:**
- Displayed as expandable sections or card grid
- Each category shows 3-5 top articles
- "View all →" link to category page
- PRO badge on Pro-only categories

**Article Pages (MDX Format):**
- Breadcrumb navigation
- Numbered steps with bold headings
- Screenshots inline with content
- Callout boxes for tips/notes
- Copy-paste code blocks
- Related articles at bottom
- "Was this helpful?" feedback

**Recently Viewed:**
- Show on help home page
- Stored in localStorage
- Max 5 recent articles

### Help Tip Component

```tsx
<HelpTip
  tipId="tour-css-selector"           // Guidely Smart Tip ID
  helpUrl="/help/guidely/selectors"   // Fallback if Smart Tip not loaded
/>
```

**Behavior:**
1. Renders `?` icon (small, circled, muted color)
2. On click: triggers Guidely Smart Tip if available
3. Fallback: opens help URL in same tab
4. Tooltip on hover: "Click for help"

### Header `?` Icon (Global)

Separate from field-level HelpTip — this is the page-level help icon in header.

**Behavior:**
1. Click → Opens contextual help for current page
2. Could trigger a Smart Tip overview OR link directly to relevant help section
3. Keyboard shortcut: `?` key or `Cmd+/` opens help

### Checklist Behavior

| Scenario | Behavior |
|----------|----------|
| **Completed** | Auto-dismisses with confetti animation, brief "🎉 All set!" message |
| **Minimized by user** | Stays minimized, small icon to re-expand |
| **14 days incomplete** | Auto-hides (stops showing widget) |
| **Restart** | Button on Help page: "Restart Getting Started guide" |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `?` | Open Help center |
| `Cmd+/` or `Ctrl+/` | Open Help center (alternative) |

---

## Acceptance Criteria

### Help Center
- [ ] `/help` route accessible from avatar dropdown menu
- [ ] Categories display with article links
- [ ] Article pages render with MDX components (placeholder content OK)
- [ ] Search input present but disabled with "Coming soon" tooltip
- [ ] PRO badges on Pro-only categories
- [ ] Breadcrumb navigation on article pages
- [ ] Recently viewed articles on help home
- [ ] "Was this helpful?" feedback component
- [ ] Related articles at bottom of each article
- [ ] Mobile responsive

### Navigation Updates
- [ ] Help link added to avatar dropdown
- [ ] Settings moved to avatar dropdown
- [ ] `?` icon in header (next to PRO badge) for page-level help
- [ ] Keyboard shortcut (`?` or `Cmd+/`) opens help center

### Inline Smart Tips
- [ ] `HelpTip` component created
- [ ] `?` icons added to key complex fields (5+ locations)
- [ ] Clicking triggers Guidely Smart Tip (requires dogfooding setup)
- [ ] Fallback to help URL if Smart Tips not configured

### Guidely Onboarding
- [ ] Getting Started checklist created in Guidely (5 steps)
- [ ] Pro Features checklist created in Guidely (4 steps)
- [ ] Checklists target Agency Toolkit domain
- [ ] Checklists trigger appropriately (new user, Pro user)
- [ ] Confetti animation on checklist completion
- [ ] Auto-dismiss after completion
- [ ] Auto-hide after 14 days if incomplete
- [ ] "Restart guide" button on Help page

### Dogfooding Setup
- [ ] Agency record configured with target domains
- [ ] Embed script loads on localhost/getrapidreviews.com
- [ ] Guidely features (checklists, smart tips) work on Agency Toolkit

### Quick Wins
- [ ] "New" badge on Help nav item (7-day expiry)
- [ ] Empty states link to relevant help articles
- [ ] Error states include help/troubleshooting link
- [ ] Progress indicator near avatar while checklist incomplete
- [ ] Contextual help banner on complex pages (Tour Builder, Image Editor)
- [ ] Copy-paste code blocks in articles

---

## Quick Wins (UX Enhancements)

Include these in the implementation for better user experience:

| Quick Win | Description | Effort |
|-----------|-------------|--------|
| **"New" badge on Help** | Badge on Help nav item for first 7 days, trains users to look there | Low |
| **Empty state → Help links** | When pages have no content, link to relevant help article | Low |
| **Keyboard shortcut** | `?` or `Cmd+/` opens help center from anywhere | Low |
| **Checklist confetti** | Celebration animation when Getting Started is 100% complete | Low |
| **Help link in error states** | When something fails, include link to troubleshooting | Low |
| **Progress indicator** | Small progress ring next to avatar while checklist incomplete | Medium |
| **Contextual help banner** | On complex pages (Tour Builder), show dismissible "First time? [Start guide]" | Medium |
| **Recently viewed articles** | Show on help home for quick return | Medium |
| **Copy-paste snippets** | One-click copy for code blocks (embed script, selectors) | Low |

---

## Article Format (MDX)

Articles use MDX (Markdown + React components) for flexibility.

**Custom Components Available:**

```mdx
# Article Title

Introduction paragraph explaining what this covers.

<Callout type="tip">
  Pro tip or important note goes here.
</Callout>

<Callout type="warning">
  Warning or caution message.
</Callout>

## Step 1: Do the thing

Instructions with **bold** for UI elements.

<Screenshot
  src="/help/images/example.png"
  alt="Description of screenshot"
  caption="Optional caption below image"
/>

## Step 2: Configure settings

- **Option A** — What it does
- **Option B** — What it does

<CodeBlock copyable label="Embed Script">
<script src="https://app.agencytoolkit.com/embed.js?key=YOUR_KEY"></script>
</CodeBlock>

---

<RelatedArticles>
  - [Related Article 1](/help/category/article-1)
  - [Related Article 2](/help/category/article-2)
</RelatedArticles>

<Feedback articleId="unique-article-id" />
```

**File Location:** `/app/(dashboard)/help/content/` or `/content/help/`

---

## Out of Scope (Backlog)

| Item | Description | Priority |
|------|-------------|----------|
| **Search functionality** | Full-text search across help articles | Medium |
| **Video tutorials** | Loom/YouTube embeds in articles | Medium |
| **Article analytics** | Track views, helpful/not helpful ratings | Low |
| **Public help access** | Allow non-logged-in users to browse | Low |
| **AI chat assistant** | Chatbot trained on help content | Low |
| **Help subdomain** | Migrate to `help.agencytoolkit.com` if content grows | Low |
| **Intercom integration** | Floating help/chat widget | Low |
| **Localization** | Multi-language support | Low |

---

## Dependencies

- **Guidely system** (Features 26-31) — For checklists and Smart Tips
- **Existing navigation** — Add "Help" link to main nav
- **Agency record** — For dogfooding domain configuration

---

## Implementation Order

1. **Help Center infrastructure**
   - Create `/help` route and layout
   - Build category and article components
   - Add placeholder content structure

2. **Navigation update**
   - Add "Help" link to main nav (header or footer position)

3. **HelpTip component**
   - Create shared component
   - Add to 3-5 high-value locations initially

4. **Dogfooding setup**
   - Configure agency record with domains
   - Ensure embed script loads on Agency Toolkit

5. **Create Guidely content**
   - Getting Started checklist
   - Pro Features checklist
   - Smart Tips for inline help fields

6. **Polish**
   - Mobile responsiveness
   - Loading states
   - Error handling

---

## Design Notes

- **Style:** Clean, minimal, functional (Usetiful-inspired)
- **No marketing fluff:** Users are already in the app, they need answers
- **Consistent with app:** Use existing design system, colors, components
- **Progressive disclosure:** Categories → Articles → Details
- **Escape hatches:** Every Smart Tip links to full article

---

## Future Considerations

### When to add Search
- When article count exceeds ~20-30
- When users report difficulty finding content
- Can use simple client-side search initially (no backend needed)

### When to move to Subdomain
- When help content becomes a significant portion of the codebase
- When you want public access for prospects (SEO)
- When you need a different tech stack (e.g., GitBook, Notion)

### Article Content Strategy (for later)
- Start with "how to" guides for each feature
- Add troubleshooting based on support questions
- Include screenshots/GIFs where helpful
- Keep articles focused (one topic per article)

---

## Implementation Notes

### Task #1: Help Center Route and Layout ✅
**Completed:** 2026-02-01

**Files Created:**
- `app/(dashboard)/help/layout.tsx` — Layout wrapper
- `app/(dashboard)/help/page.tsx` — Help center home with categories
- `app/(dashboard)/help/_components/help-layout-client.tsx` — Responsive layout (sidebar desktop, mobile nav)
- `app/(dashboard)/help/_components/help-sidebar.tsx` — Collapsible sidebar with categories
- `app/(dashboard)/help/_components/help-mobile-nav.tsx` — Horizontal scrollable nav for mobile
- `app/(dashboard)/help/_components/help-search.tsx` — Disabled search input with "Coming soon" tooltip
- `app/(dashboard)/help/_components/help-category.tsx` — Category section with article links
- `app/(dashboard)/help/_components/recently-viewed.tsx` — Recently viewed articles (localStorage)

**Pattern:** Follows Settings page pattern with collapsible sidebar, mobile-responsive layout, localStorage state persistence.

### Task #2: MDX Article Components ✅
**Completed:** 2026-02-01

**Files Created:**
- `app/(dashboard)/help/_components/callout.tsx` — Info/tip/warning/success callout boxes
- `app/(dashboard)/help/_components/screenshot.tsx` — Image with optional caption
- `app/(dashboard)/help/_components/code-block.tsx` — Copyable code block with label
- `app/(dashboard)/help/_components/related-articles.tsx` — Related articles list
- `app/(dashboard)/help/_components/article-feedback.tsx` — "Was this helpful?" Yes/No buttons
- `app/(dashboard)/help/_components/help-breadcrumb.tsx` — Breadcrumb navigation
- `app/(dashboard)/help/_components/article-layout.tsx` — Wrapper component for all articles

**Features:**
- Callout supports 4 types: info, tip, warning, success
- CodeBlock has one-click copy with visual feedback
- ArticleFeedback stores response in localStorage
- ArticleLayout auto-tracks recently viewed articles

### Task #3: Article Page Structure ✅
**Completed:** 2026-02-01

**Category Index Pages Created:**
- `/help/getting-started/page.tsx`
- `/help/theme-builder/page.tsx`
- `/help/guidely/page.tsx`
- `/help/images/page.tsx`
- `/help/trustsignal/page.tsx`
- `/help/settings/page.tsx`

**Article Pages Created (24 total):**
- Getting Started: overview, first-customer, embed-script, plans
- Theme Builder: menu, login, colors, loading
- Guidely: first-tour, checklists, smart-tips, banners, themes
- Images: templates, editor, urls
- TrustSignal: events, widget
- Settings: profile, excluded, delete

**Notes:**
- Full articles written for key pages (overview, embed-script, first-customer, plans, menu, delete)
- Placeholder content for remaining articles ("Detailed documentation coming soon")
- All pages use ArticleLayout component with breadcrumbs, related articles, and feedback

### Task #4: Navigation Update ✅
**Completed:** 2026-02-01

**Changes:**
- Created `components/dashboard/user-nav.tsx` — Custom UserButton with menu items
- Updated `app/(dashboard)/layout.tsx` — Uses new UserNav component
- Updated `components/dashboard/main-nav.tsx` — Removed Settings from main nav

**UserNav Features:**
- Clerk UserButton with custom menu items
- Help Center link (HelpCircle icon) → /help
- Settings link (Settings icon) → /settings
- Maintains original avatar styling

### Task #5 & #6: Header Help Button + Keyboard Shortcut ✅
**Completed:** 2026-02-01

**Files Created:**
- `components/dashboard/help-header-button.tsx`

**Features:**
- `?` icon button in header (next to PRO badge)
- Keyboard shortcuts: `?` key and `Cmd+/` (Ctrl+/)
- Contextual navigation — maps current page to relevant help article
- Tooltip shows keyboard shortcut hint
- Ignores keypresses when user is typing in input/textarea

**Help URL Mapping:**
- `/dashboard` → `/help/getting-started`
- `/menu` → `/help/theme-builder/menu`
- `/g/tours` → `/help/guidely/first-tour`
- etc. (defaults to `/help` for unmapped routes)

### Task #7: HelpTip Component ✅
**Completed:** 2026-02-01

**Files Created:**
- `components/shared/help-tip.tsx`

**Features:**
- Reusable `?` icon that links to help articles
- TooltipProvider for hover hint
- Predefined `helpTips` object with common field mappings
- Size variants (sm/md)
- Future-ready: includes `tipId` prop for Guidely Smart Tip integration

**Example Usage:**
```tsx
<Label>
  Excluded Locations <HelpTip {...helpTips.excludedLocations} />
</Label>
```

**Added to:**
- Settings → Excluded Locations section (as example)

**Note:** Additional locations can be incrementally updated to use HelpTip. The component and predefined tips are ready for: CSS selectors, URL patterns, tour triggers, completion triggers, embed script, personalized URLs, event types, etc.

### Task #9: Dogfooding Setup Documentation ✅
**Completed:** 2026-02-01

## Dogfooding Guide: Using Guidely on Agency Toolkit

To use Guidely (tours, checklists, smart tips, banners) on Agency Toolkit itself, follow these steps:

### Step 1: Identify Your Agency Record

Your Agency Toolkit account has an agency record in the database. Find your `agency_id` from:
- The Supabase dashboard → `agencies` table
- Or check `Settings → Embed Code` to see your agency token

### Step 2: Add Target Domains

Update your agency record to include Agency Toolkit domains. Add these to the `settings.target_domains` array (or create a new `target_domains` field):

```json
{
  "target_domains": [
    "localhost",
    "localhost:3000",
    "getrapidreviews.com",
    "agencytoolkit.com"
  ]
}
```

**SQL to update:**
```sql
UPDATE agencies
SET settings = jsonb_set(
  COALESCE(settings, '{}'),
  '{target_domains}',
  '["localhost", "localhost:3000", "getrapidreviews.com", "agencytoolkit.com"]'
)
WHERE id = 'YOUR_AGENCY_ID';
```

### Step 3: Add Embed Script to Agency Toolkit (Optional)

**Option A: Inject via `<Script>` in layout**
Add to `app/(dashboard)/layout.tsx`:
```tsx
import Script from 'next/script';

// In the component, before closing </div>:
<Script
  src={`https://app.agencytoolkit.com/embed.js?key=${agency.token}`}
  strategy="afterInteractive"
/>
```

**Option B: Direct Guidely Injection (Recommended)**
Since Agency Toolkit users are authenticated, you can inject Guidely directly without the embed script. This avoids the token-based flow:
- Create a `useGuidely` hook that fetches checklists/tips for the current agency
- Render Guidely components directly in the layout

### Step 4: Create Guidely Content

In the Agency Toolkit dashboard, go to **Guidely** and create:

**Getting Started Checklist:**
1. "Add your first customer" → `/customers`
2. "Customize your menu" → `/menu`
3. "Set your brand colors" → `/colors`
4. "Set up TrustSignal (optional)" → `/trustsignal`
5. "Install the embed script" → `/settings/embed`

**Pro Features Checklist:**
1. "Create your first tour" → `/g/tours`
2. "Build an onboarding checklist" → `/g/checklists`
3. "Add a Smart Tip" → `/g/tips`
4. "Personalize an image" → `/images`

**Smart Tips for Help Icons:**
Create Smart Tips matching the `tipId` values in `helpTips` object:
- `tour-css-selector` → Explains CSS selectors
- `tour-url-pattern` → Explains page targeting
- etc.

### Step 5: Configure Targeting

Set each checklist/tip to target:
- **URL Pattern:** `*` (all pages) or specific paths
- **Trigger:** `first_visit` for checklists
- **Audience:** All users (or filter by plan for Pro checklist)

### Domain Change Process

When you change domains (e.g., from `getrapidreviews.com` to `agencytoolkit.com`):
1. Update the `target_domains` array in your agency settings
2. No code changes required
3. Guidely will work on the new domain immediately
