# Agency Toolkit - Feature Cards for Automaker

> Kanban-ready feature cards organized by priority and dependency

---

## How to Use with Automaker

1. Import these as features in Automaker
2. Features are ordered by dependency (complete in order)
3. Each feature has clear acceptance criteria
4. Copy the feature description when creating cards

---

## Phase 1: Foundation (Week 1)

### Feature 1: Project Scaffolding
**Priority:** Critical | **Estimate:** 2 hours

Create the Next.js project with all dependencies.

**Tasks:**
- Run `pnpm create next-app@latest agency-toolkit --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*"`
- Install dependencies:
  - `pnpm add @clerk/nextjs@latest`
  - `pnpm add @supabase/supabase-js @supabase/ssr`
  - `pnpm add svix` (for Clerk webhooks)
- Initialize shadcn/ui:
  - `pnpm dlx shadcn@latest init`
  - Select: New York style, Zinc base color, CSS variables
- Add shadcn components:
  - `pnpm dlx shadcn@latest add button card input label dialog dropdown-menu toast tooltip alert tabs badge separator avatar sheet sidebar breadcrumb`
- Create folder structure per PROJECT_SPEC.md
- Create `.env.example` with all variables

**Acceptance Criteria:**
- [ ] Project runs with `pnpm dev`
- [ ] All dependencies installed without errors
- [ ] Folder structure matches spec
- [ ] shadcn components available

---

### Feature 2: Clerk Authentication Setup
**Priority:** Critical | **Estimate:** 2 hours

Configure Clerk for authentication.

**Tasks:**
- Create `middleware.ts` with public routes config
- Update `app/layout.tsx` with `<ClerkProvider>`
- Create auth routes:
  - `app/(auth)/sign-in/[[...sign-in]]/page.tsx`
  - `app/(auth)/sign-up/[[...sign-up]]/page.tsx`
- Create `lib/auth.ts` with `getCurrentAgency()` helper
- Test sign up and sign in flows

**Acceptance Criteria:**
- [ ] Can sign up new account
- [ ] Can sign in to existing account
- [ ] Protected routes redirect to sign-in
- [ ] User session accessible in server components

---

### Feature 3: Supabase Schema & Client Setup
**Priority:** Critical | **Estimate:** 3 hours

Set up Supabase database and clients.

**Tasks:**
- Create Supabase project (if not exists)
- Run complete SQL schema from DATABASE.md
- Enable RLS on all tables
- Create RLS policies
- Create client utilities:
  - `lib/supabase/client.ts` (browser)
  - `lib/supabase/server.ts` (server)
  - `lib/supabase/admin.ts` (service role)
- Generate TypeScript types: `pnpm supabase gen types typescript`
- Create `types/database.ts` with types from DATABASE.md

**Acceptance Criteria:**
- [ ] All tables created in Supabase
- [ ] RLS enabled on all tables
- [ ] Client connects without errors
- [ ] TypeScript types match schema

---

### Feature 4: Clerk Webhook Handler
**Priority:** Critical | **Estimate:** 2 hours

Sync Clerk users to Supabase agencies table.

**Tasks:**
- Create `app/api/webhooks/clerk/route.ts`
- Handle `user.created` event:
  - Generate agency token
  - Insert into agencies table
- Handle `user.deleted` event:
  - Delete agency (cascades to all related data)
- Configure webhook in Clerk dashboard
- Test with Clerk webhook testing tool

**Acceptance Criteria:**
- [ ] New Clerk user creates agency record
- [ ] Deleted Clerk user removes agency
- [ ] Token generated correctly
- [ ] Webhook signature verified

---

### Feature 5: Dashboard Layout Shell
**Priority:** Critical | **Estimate:** 3 hours

Create the admin dashboard layout with sidebar navigation.

**Tasks:**
- Create `app/(dashboard)/layout.tsx` with sidebar
- Use shadcn Sidebar component
- Create navigation items:
  - Dashboard (overview)
  - Customers
  - Menu Customizer
  - Login Customizer (Pro badge if not Pro)
  - Loading Animations
  - Dashboard Colors
  - Tours (Pro badge)
  - Images (Pro badge)
  - Settings
- Create `components/dashboard/sidebar.tsx`
- Create `components/dashboard/header.tsx` with:
  - Agency name
  - User button (Clerk)
- Create placeholder pages for each route
- Add mobile-responsive sidebar (Sheet)

**Acceptance Criteria:**
- [ ] Sidebar renders with all navigation items
- [ ] Active route highlighted
- [ ] Mobile sidebar works (Sheet)
- [ ] User can sign out
- [ ] Pro features show badge/lock icon for non-Pro

---

### Feature 6: Customers List Page
**Priority:** Critical | **Estimate:** 3 hours

Display list of customers with CRUD operations.

**Tasks:**
- Create `app/(dashboard)/customers/page.tsx`
- Create `app/api/customers/route.ts` (GET, POST)
- Display customers in Card grid or Table
- Show for each customer:
  - Name
  - Token
  - GHL Location ID (if set)
  - Created date
  - Edit/Delete actions
- Add "Add Customer" button with Dialog
- Add customer form with fields:
  - Name (required)
  - GHL Location ID (optional, with help text)
  - GBP Place ID (optional, with help link)
- Show empty state when no customers
- Implement delete with confirmation dialog

**Acceptance Criteria:**
- [ ] Customers load and display
- [ ] Can add new customer
- [ ] Can delete customer
- [ ] Empty state shows when no customers
- [ ] Plan limit enforced (25 for toolkit tier)

---

### Feature 7: Customer Edit Page
**Priority:** High | **Estimate:** 2 hours

Edit individual customer details.

**Tasks:**
- Create `app/(dashboard)/customers/[id]/page.tsx`
- Create `app/api/customers/[id]/route.ts` (GET, PATCH, DELETE)
- Form to edit:
  - Name
  - GHL Location ID
  - GBP Place ID
  - Active status toggle
- Show customer token (read-only, with copy button)
- Show embed URL for GBP dashboard (if GBP connected)
- Back button to customers list

**Acceptance Criteria:**
- [ ] Can load customer by ID
- [ ] Can update customer fields
- [ ] Token displayed with copy button
- [ ] Changes persist to database

---

### Feature 8: Embed Code Display
**Priority:** Critical | **Estimate:** 2 hours

Show agencies their embed snippet with copy functionality.

**Tasks:**
- Add embed code section to Settings page (or Dashboard)
- Display script tag with agency token:
  ```html
  <script src="https://app.agencytoolkit.com/embed.js?key={token}"></script>
  ```
- One-click copy button
- Instructions accordion:
  - Where to paste in GHL
  - What it does
  - Link to GHL docs
- Show different snippets for different features

**Acceptance Criteria:**
- [ ] Embed code displays correctly with token
- [ ] Copy button works
- [ ] Instructions are clear
- [ ] Code updates when token changes

---

### Feature 9: Config API Endpoint
**Priority:** Critical | **Estimate:** 2 hours

Create public API for embed script to fetch configuration.

**Tasks:**
- Create `app/api/config/route.ts`
- Accept `key` query parameter (agency token)
- Return agency settings and active tours
- Add CORS headers
- Add caching headers (60 seconds)
- Handle invalid/missing key gracefully

**Acceptance Criteria:**
- [ ] Returns config for valid token
- [ ] Returns 404 for invalid token
- [ ] CORS allows all origins
- [ ] Response cached appropriately

---

### Feature 10: Basic Embed Script
**Priority:** Critical | **Estimate:** 3 hours

Create the JavaScript embed script that GHL sub-accounts load.

**Tasks:**
- Create `app/embed.js/route.ts` (dynamic JS)
- Script should:
  - Accept key parameter
  - Fetch config from /api/config
  - Check for whitelisted locations
  - Log errors to console gracefully
- Make script resilient to failures (GHL should work normally if script fails)
- Add comments for debugging
- Minify in production

**Acceptance Criteria:**
- [ ] Script loads without errors
- [ ] Fetches config successfully
- [ ] Doesn't break GHL if API fails
- [ ] Whitelisted locations skip customizations

---

## Phase 2: Quick Wins / MVP (Week 2)

### Feature 11: Menu Customizer - Presets List
**Priority:** High | **Estimate:** 2 hours

List and manage menu customization presets.

**Tasks:**
- Create `app/(dashboard)/menu/page.tsx`
- Create `app/api/menu-presets/route.ts`
- Display existing presets as cards
- Show preset name and summary (X items hidden, Y renamed)
- Mark default preset
- Add/Edit/Delete presets
- Create preset dialog with name field

**Acceptance Criteria:**
- [ ] Presets load and display
- [ ] Can create new preset
- [ ] Can delete preset
- [ ] Default preset indicated

---

### Feature 12: Menu Customizer - Visual Editor
**Priority:** High | **Estimate:** 4 hours

Visual interface to configure menu visibility.

**Tasks:**
- Create preset editor UI
- List all GHL menu items (from constants)
- Toggle switch for each item (visible/hidden)
- Inline rename field for each item
- Live preview panel (mockup of GHL sidebar)
- Save button updates preset
- Add banner hiding options:
  - Trial banners
  - Connection prompts
  - Promotional banners

### Feature 12: Menu Customizer - Visual Editor
...existing content...

**Additional Task:**
- Drag-to-reorder menu items using @dnd-kit/sortable
- Save custom order to menu preset config
- Embed script applies custom order via CSS `order` property or DOM manipulation

**Updated config structure:**
```typescript
config: {
  hidden_items: string[];
  renamed_items: Record<string, string>;
  item_order: string[];  // NEW: ordered array of menu IDs
  hidden_banners: string[];
}
```
```

The reorder UI component would live at:
```
app/(dashboard)/menu/_components/
├── menu-editor.tsx
├── menu-item-toggle.tsx
├── menu-sortable-list.tsx   ← drag-to-reorder here
└── menu-preview.tsx

**Acceptance Criteria:**
- [ ] All GHL menu items listed
- [ ] Can toggle visibility
- [ ] Can rename items
- [ ] Preview updates in real-time
- [ ] Changes save to database



---

### Feature 13: Apply Menu Config in Embed Script
**Priority:** High | **Estimate:** 2 hours

Update embed script to apply menu customizations.

**Tasks:**
- Add `applyMenuCSS()` function to embed script
- Generate CSS that hides items by selector
- Handle renamed items (if possible via CSS/JS)
- Test on actual GHL interface

**Acceptance Criteria:**
- [ ] Hidden items not visible in GHL
- [ ] Works across GHL page navigations
- [ ] No flicker on load

---

### Feature 14: Login Customizer Page
**Priority:** High | **Estimate:** 3 hours

Interface to customize GHL login page appearance.

**Tasks:**
- Create `app/(dashboard)/login/page.tsx`
- Check plan (Pro only) - show upgrade prompt if not Pro
- Form fields:
  - Logo upload (to R2)
  - Background color picker
  - Background image upload (optional)
  - Button color picker
  - Button text color picker
- Live preview panel
- Save to agency settings

**Acceptance Criteria:**
- [ ] Plan check works (Pro only)
- [ ] Can upload logo
- [ ] Color pickers functional
- [ ] Preview shows changes
- [ ] Saves to settings JSONB

---

### Feature 15: Loading Animations Page
**Priority:** High | **Estimate:** 3 hours

Select and preview loading animations.

**Tasks:**
- Create `app/(dashboard)/loading/page.tsx`
- Create 10 CSS animation files in `public/animations/`
- Display animation gallery (cards with live preview)
- Allow selection of one animation
- Save selection to agency settings
- Animations to create:
  - Pulse dot
  - Spinning ring
  - Bouncing dots
  - Progress bar
  - Morphing square
  - Rotating squares
  - Gradient spinner
  - Heartbeat
  - Wave bars
  - Orbiting dots

**Acceptance Criteria:**
- [ ] All 10 animations display
- [ ] Preview plays on hover
- [ ] Can select animation
- [ ] Selection persists

---

### Feature 16: Dashboard Colors Page
**Priority:** High | **Estimate:** 2 hours

Customize GHL dashboard color theme.

**Tasks:**
- Create `app/(dashboard)/colors/page.tsx`
- Color picker fields:
  - Primary color
  - Accent color
  - Sidebar background
  - Sidebar text
- Preview panel showing GHL mockup
- Preset color schemes (optional):
  - Default
  - Dark mode
  - Light mode
  - Custom (user picks)
- Save to agency settings

**Acceptance Criteria:**
- [ ] Color pickers work
- [ ] Preview updates live
- [ ] Presets apply correctly
- [ ] Saves to settings

---

### Feature 17: Apply Visual Configs in Embed Script
**Priority:** High | **Estimate:** 3 hours

Update embed script to apply login, loading, and color customizations.

**Tasks:**
- Add `applyLoginCSS()` - only on login pages
- Add `applyLoadingCSS()` - load animation stylesheet
- Add `applyColorCSS()` - inject CSS variables
- Test each customization type
- Ensure no conflicts between them

**Acceptance Criteria:**
- [ ] Login page customizations apply
- [ ] Loading animation replaces default
- [ ] Color theme applies to dashboard
- [ ] All work together without conflicts

---

## Phase 3: Onboarding Tours (Week 3)

### Feature 18: Tours List Page
**Priority:** High | **Estimate:** 2 hours

List and manage onboarding tours.

**Tasks:**
- Create `app/(dashboard)/tours/page.tsx`
- Create `app/api/tours/route.ts`
- Check plan (Pro only)
- Display tours as cards showing:
  - Name
  - Target page
  - Trigger type
  - Step count
  - Active status toggle
- Add/Delete tours
- Link to tour builder

**Acceptance Criteria:**
- [ ] Tours load and display
- [ ] Can create new tour
- [ ] Can toggle active status
- [ ] Can delete tour

---

### Feature 19: Tour Builder - Basic UI
**Priority:** High | **Estimate:** 4 hours

Visual interface to build tour steps.

**Tasks:**
- Create `app/(dashboard)/tours/[id]/page.tsx`
- Create `app/api/tours/[id]/route.ts`
- Form fields:
  - Tour name
  - Target page dropdown (dashboard, reputation, etc.)
  - Trigger type (first_visit, manual, button)
- Step list with drag-to-reorder
- Add step button
- Each step shows: title, selector, position

**Acceptance Criteria:**
- [ ] Can edit tour metadata
- [ ] Steps display in order
- [ ] Can reorder steps
- [ ] Can add new step

---

### Feature 20: Tour Builder - Step Editor
**Priority:** High | **Estimate:** 3 hours

Edit individual tour steps.

**Tasks:**
- Step edit dialog/drawer with:
  - Title field
  - Description field (rich text optional)
  - CSS Selector field
  - Position dropdown (top/bottom/left/right)
- Selector helper tips (common GHL selectors)
- Delete step button
- Save step changes

**Acceptance Criteria:**
- [ ] Can edit all step fields
- [ ] Selector help is useful
- [ ] Can delete step
- [ ] Changes persist

---

### Feature 21: Tour Preview
**Priority:** Medium | **Estimate:** 2 hours

Preview tour in a simulated environment.

**Tasks:**
- Add "Preview" button to tour builder
- Open modal with mock GHL interface
- Run tour using Driver.js
- Show how each step will look

**Acceptance Criteria:**
- [ ] Preview opens
- [ ] Tour runs through steps
- [ ] Accurate representation of final result

---

### Feature 22: Apply Tours in Embed Script
**Priority:** High | **Estimate:** 3 hours

Update embed script to initialize Driver.js tours.

**Tasks:**
- Add `loadDriverJS()` - dynamically load library
- Add `initializeTours()` function
- Match tours to current page
- Implement trigger logic:
  - first_visit: check localStorage, run on load
  - manual: expose global function
  - button: find trigger element
- Store completion in localStorage

**Acceptance Criteria:**
- [ ] Driver.js loads successfully
- [ ] Tours run on correct pages
- [ ] First visit tours don't repeat
- [ ] Completion tracked

---

## Phase 4: Image Personalization (Week 4)

### Feature 23: Image Templates List
**Priority:** High | **Estimate:** 2 hours

List and manage image templates.

**Tasks:**
- Create `app/(dashboard)/images/page.tsx`
- Create `app/api/images/route.ts`
- Check plan (Pro only)
- Display templates as cards showing:
  - Thumbnail preview
  - Name
  - Render count
  - Created date
- Add/Delete templates
- Link to image editor

**Acceptance Criteria:**
- [ ] Templates load and display
- [ ] Can create new template
- [ ] Can delete template
- [ ] Render stats shown

---

### Feature 24: Image Upload to R2
**Priority:** High | **Estimate:** 3 hours

Upload base images to Cloudflare R2.

**Tasks:**
- Create `app/api/images/upload/route.ts`
- Configure S3 client for R2
- Accept file upload via FormData
- Validate file type (png, jpg, webp)
- Upload to R2 with agency prefix
- Return public URL
- Handle errors gracefully

**Acceptance Criteria:**
- [ ] Can upload image
- [ ] File appears in R2
- [ ] URL returned works
- [ ] Invalid files rejected

---

### Feature 25: Image Editor - Canvas
**Priority:** High | **Estimate:** 5 hours

Visual editor for positioning text on images.

**Tasks:**
- Create `app/(dashboard)/images/[id]/page.tsx`
- Display base image
- Draggable text element
- Text config panel:
  - Font dropdown (Google Fonts subset)
  - Size slider
  - Color picker
  - Background color (optional)
  - Fallback text input
- Preview with sample names
- Save configuration

**Acceptance Criteria:**
- [ ] Base image displays
- [ ] Text draggable
- [ ] Config changes update preview
- [ ] Position saves correctly

---

### Feature 26: Image Generation API
**Priority:** High | **Estimate:** 4 hours

Generate personalized images on-the-fly.

**Tasks:**
- Create `app/api/og/[templateId]/route.ts`
- Use `@vercel/og` ImageResponse
- Accept `name` query parameter
- Fetch template config
- Render image with text overlay
- Implement caching (24h)
- Increment render count
- Handle missing name (use fallback)

**Acceptance Criteria:**
- [ ] Returns valid PNG image
- [ ] Name appears correctly
- [ ] Fallback works
- [ ] Caching headers set
- [ ] Render count increments

---

### Feature 27: Image URL Generator
**Priority:** High | **Estimate:** 2 hours

Display ready-to-use URLs with GHL merge tags.

**Tasks:**
- Add URL display section to image editor
- Show URL with placeholder: `/api/og/{id}?name={{contact.first_name}}`
- Copy button
- Preview with different sample names
- Instructions for GHL workflow setup

**Acceptance Criteria:**
- [ ] URL displays correctly
- [ ] GHL merge tag included
- [ ] Copy works
- [ ] Instructions clear

---

## Phase 5: Integrations (Week 5)

### Feature 28: GBP Dashboard - Customer Connection
**Priority:** Medium | **Estimate:** 3 hours

Allow customers to be connected to their GBP.

**Tasks:**
- Add GBP section to customer edit page
- Place ID input with help link
- Optional: GBP OAuth flow (future)
- Save Place ID to customer record
- Generate dashboard URL with customer token

**Acceptance Criteria:**
- [ ] Can enter Place ID
- [ ] Help link works
- [ ] URL generated correctly
- [ ] Token embedded in URL

---

### Feature 29: GBP Dashboard - Embed Page
**Priority:** Medium | **Estimate:** 4 hours

Create embeddable dashboard for GHL iframe.

**Tasks:**
- Create `app/(embed)/dashboard/page.tsx`
- Create `app/(embed)/layout.tsx` (minimal, no nav)
- Accept `token` query parameter
- Fetch customer and GBP data
- Display:
  - Overall rating
  - Total reviews
  - Recent reviews list
  - Response rate (if available)
- Style to look good in iframe
- Add X-Frame-Options headers

**Acceptance Criteria:**
- [ ] Loads with valid token
- [ ] Shows GBP data
- [ ] Works in GHL iframe
- [ ] Rejects invalid tokens

---

### Feature 30: Social Proof Widget - Events Management
**Priority:** Medium | **Estimate:** 3 hours

Manage social proof events in admin.

**Tasks:**
- Create social proof section in dashboard
- Create `app/api/social-proof/route.ts`
- Event list showing:
  - Type
  - Business name
  - Location
  - Timestamp
  - Visible toggle
- Add event form:
  - Type dropdown
  - Business name
  - Location (optional)
  - Details (type-specific)
- Delete events

**Acceptance Criteria:**
- [ ] Events load and display
- [ ] Can add new event
- [ ] Can toggle visibility
- [ ] Can delete event

---

### Feature 31: Social Proof Widget - Script
**Priority:** Medium | **Estimate:** 4 hours

Create embeddable social proof widget for agency websites.

**Tasks:**
- Create `app/widgets/social-proof.js/route.ts`
- Fetch visible events for agency
- Display toast notifications:
  - Slide in from corner
  - Show for 5-10 seconds
  - Cycle through events
- Configuration options:
  - Position (bottom-left, bottom-right)
  - Display duration
  - Max per session
  - Demo mode
- Self-contained (no external dependencies)

**Acceptance Criteria:**
- [ ] Widget loads on page
- [ ] Events display as toasts
- [ ] Configuration works
- [ ] Demo mode shows fake data

---

### Feature 32: Settings Page Complete
**Priority:** High | **Estimate:** 3 hours

Complete the agency settings page.

**Tasks:**
- Agency profile section:
  - Name (editable)
  - Email (read-only)
  - Plan display
- Whitelist section:
  - List of whitelisted GHL location IDs
  - Add/remove locations
  - Explanation of what whitelist does
- Danger zone:
  - Export data
  - Delete account (with confirmation)
- Billing link (if Stripe integrated)

**Acceptance Criteria:**
- [ ] Can update agency name
- [ ] Can manage whitelist
- [ ] Delete account works
- [ ] All settings persist

---

### Feature 33: Plan Gating & Upgrade Prompts
**Priority:** High | **Estimate:** 3 hours

Enforce plan limits throughout the app.

**Tasks:**
- Create `lib/plans.ts` with feature definitions
- Create `components/upgrade-prompt.tsx`
- Add gating to:
  - Customer limit (25 for toolkit)
  - Tours (Pro only)
  - Images (Pro only)
  - GBP Dashboard (Pro only)
  - Social Proof (Pro only)
- Show upgrade prompts with:
  - Feature description
  - Price comparison
  - Upgrade button/link

**Acceptance Criteria:**
- [ ] Limits enforced correctly
- [ ] Upgrade prompts are helpful
- [ ] Pro users see all features
- [ ] Free users can use basic features

---

## Polish & Launch Prep

### Feature 34: Error Handling & Toasts
**Priority:** Medium | **Estimate:** 2 hours

Improve error handling UX.

**Tasks:**
- Add toast notifications for:
  - Save success
  - Errors
  - Copy confirmations
- Add error boundaries
- Improve API error messages
- Add loading states to all async operations

**Acceptance Criteria:**
- [ ] Toasts show for all actions
- [ ] Errors are user-friendly
- [ ] Loading states present

---

### Feature 35: Mobile Responsiveness
**Priority:** Medium | **Estimate:** 3 hours

Ensure dashboard works on mobile.

**Tasks:**
- Test all pages on mobile viewport
- Fix layout issues
- Ensure sidebar works (Sheet on mobile)
- Test touch interactions
- Test embedded views in mobile GHL app

**Acceptance Criteria:**
- [ ] All pages usable on mobile
- [ ] No horizontal scroll
- [ ] Touch targets adequate

---

### Feature 36: Documentation & Help
**Priority:** Medium | **Estimate:** 2 hours

Add inline help throughout the app.

**Tasks:**
- Add tooltips to complex fields
- Add help links to external docs
- Create setup checklist on dashboard
- Add "What's this?" buttons where needed

**Acceptance Criteria:**
- [ ] Key features have tooltips
- [ ] Help links go to useful pages
- [ ] New users have clear path

---

## Summary

**Total Features:** 36
**Estimated Total Time:** ~90-100 hours
**Recommended Order:** Follow feature numbers 1-36

**MVP (Features 1-17):** ~40 hours - Basic dashboard + menu/login/loading/colors
**Full Product (Features 1-36):** ~100 hours - All modules complete

---

## Feature Dependencies Graph

```
1 (Scaffolding)
└── 2 (Clerk Auth)
    └── 3 (Supabase)
        └── 4 (Webhook)
            └── 5 (Layout)
                ├── 6 (Customers List)
                │   └── 7 (Customer Edit)
                │       └── 28 (GBP Connection)
                │           └── 29 (GBP Dashboard)
                ├── 8 (Embed Code)
                │   └── 9 (Config API)
                │       └── 10 (Basic Embed)
                │           ├── 13 (Menu in Embed)
                │           ├── 17 (Visual in Embed)
                │           └── 22 (Tours in Embed)
                ├── 11 (Menu List)
                │   └── 12 (Menu Editor)
                ├── 14 (Login Customizer)
                ├── 15 (Loading Animations)
                ├── 16 (Dashboard Colors)
                ├── 18 (Tours List)
                │   └── 19 (Tour Builder)
                │       └── 20 (Step Editor)
                │           └── 21 (Tour Preview)
                ├── 23 (Images List)
                │   └── 24 (Image Upload)
                │       └── 25 (Image Editor)
                │           └── 26 (Image API)
                │               └── 27 (URL Generator)
                ├── 30 (Social Proof Events)
                │   └── 31 (Social Proof Widget)
                └── 32 (Settings)
                    └── 33 (Plan Gating)
```
