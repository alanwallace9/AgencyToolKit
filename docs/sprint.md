# Sprint Tracking

## Progress: 39% Complete (14 of 36 Features)

---

## Feature Checklist

### Phase 1: Foundation
- [x] Feature 1: Project Scaffolding
- [x] Feature 2: Clerk Authentication Setup
- [x] Feature 3: Supabase Schema & Client Setup
- [x] Feature 4: Clerk Webhook Handler
- [x] Feature 5: Dashboard Layout Shell
- [x] Feature 6: Customers List Page
- [x] Feature 7: Customer Edit Page
- [x] Feature 8: Embed Code Display
- [x] Feature 9: Config API Endpoint
- [x] Feature 10: Basic Embed Script

### Phase 2: Quick Wins / MVP
- [x] Feature 11: Menu Customizer - Presets List
- [x] Feature 12: Menu Customizer - Visual Editor
- [x] Feature 13: Apply Menu Config in Embed Script
- [x] Feature 14: Login Customizer Page (Canvas-based Designer)
- [ ] Feature 15: Loading Animations Page
- [ ] Feature 16: Dashboard Colors Page
- [ ] Feature 17: Apply Visual Configs in Embed Script

### Phase 3: Onboarding Tours
- [ ] Feature 18: Tours List Page
- [ ] Feature 19: Tour Builder - Basic UI
- [ ] Feature 20: Tour Builder - Step Editor
- [ ] Feature 21: Tour Preview
- [ ] Feature 22: Apply Tours in Embed Script

### Phase 4: Image Personalization
- [ ] Feature 23: Image Templates List
- [ ] Feature 24: Image Upload to R2
- [ ] Feature 25: Image Editor - Canvas
- [ ] Feature 26: Image Generation API
- [ ] Feature 27: Image URL Generator

### Phase 5: Integrations
- [ ] Feature 28: GBP Dashboard - Customer Connection
- [ ] Feature 29: GBP Dashboard - Embed Page
- [ ] Feature 30: Social Proof Widget - Events Management
- [ ] Feature 31: Social Proof Widget - Script
- [ ] Feature 32: Settings Page Complete
- [ ] Feature 33: Plan Gating & Upgrade Prompts

### Polish & Launch
- [ ] Feature 34: Error Handling & Toasts
- [ ] Feature 35: Mobile Responsiveness
- [ ] Feature 36: Documentation & Help

---

## Current Sprint

### Completed This Session
- [x] Feature 5 - Dashboard Layout Shell (sidebar fix applied)
- [x] Feature 6 - Customers List Page
- [x] Feature 7 - Customer Edit Page
- [x] Feature 8 - Embed Code Display
- [x] Feature 9 - Config API Endpoint
- [x] Feature 10 - Basic Embed Script
- [x] Feature 11 - Menu Customizer - Presets List
- [x] Feature 12 - Menu Customizer - Visual Editor

### Up Next
- Feature 13 - Apply Menu Config in Embed Script

---

## Detailed Completion Log

### Feature 1: Project Scaffolding
**Completed:** 2026-01-10

- Created Next.js 16 project with TypeScript, Tailwind CSS 4, ESLint
- Installed dependencies: Clerk, Supabase, Sharp, Driver.js, @dnd-kit/sortable, svix
- Initialized shadcn/ui with components: button, card, input, label, dialog, dropdown-menu, sonner, tooltip, alert, tabs, badge, separator, avatar, sheet, breadcrumb, sidebar, switch
- Created folder structure per PROJECT_SPEC.md
- Created .env.example with all required variables
- Dev server runs successfully with Turbopack

### Feature 2: Clerk Authentication Setup
**Completed:** 2026-01-10

- Created proxy.ts with clerkMiddleware() and public route matcher
- Updated landing page with SignInButton, SignUpButton, SignedIn, SignedOut
- Created sign-in and sign-up pages using Clerk's catch-all routes
- Created lib/auth.ts with getCurrentAgency() helper (uses async auth())
- Fixed Tailwind CSS v4 setup (@tailwindcss/postcss, tw-animate-css, @theme inline)
- Clerk keys configured in .env.local - auth working!

### Feature 3: Supabase Schema & Client Setup
**Completed:** 2026-01-10

- Created lib/supabase/client.ts (browser client)
- Created lib/supabase/server.ts (server client)
- Created lib/supabase/admin.ts (admin/service role client)
- Created types/database.ts (TypeScript types)
- Created supabase/schema.sql (full schema file)
- Supabase credentials added to .env.local
- Schema applied via Supabase MCP (5 migrations):
  - create_extensions (uuid-ossp)
  - create_tables (agencies, customers, menu_presets, tours, image_templates, social_proof_events, analytics_events)
  - create_indexes (15 indexes)
  - enable_rls_and_policies (RLS enabled + 17 policies)
  - create_functions_and_triggers (3 functions + 6 triggers)
- Project ID: hldtxlzxneifdzvoobte

### Feature 4: Clerk Webhook Handler
**Completed:** 2026-01-10

- Created lib/tokens.ts with generateAgencyToken() and generateCustomerToken()
- Created app/api/webhooks/clerk/route.ts
- Handles user.created event: creates agency record with generated token
- Handles user.deleted event: deletes agency (cascades to related data)
- Uses svix for webhook signature verification
- Uses Supabase admin client for database operations
- Deployed to Vercel with environment variables configured
- Configured Clerk webhook endpoint pointing to Vercel deployment
- Added Vercel Speed Insights (@vercel/speed-insights)
- Disabled Vercel deployment protection (was blocking webhooks)
- Webhook tested successfully - agency record created in Supabase!

### Feature 5: Dashboard Layout Shell
**Completed:** 2026-01-10

- Created hooks/use-mobile.ts for responsive sidebar
- Created components/dashboard/app-sidebar.tsx with navigation items
- Created components/dashboard/dashboard-header.tsx with breadcrumbs and UserButton
- Created components/shared/page-header.tsx (reusable)
- Created app/(dashboard)/layout.tsx with SidebarProvider
- Created 9 placeholder pages:
  - dashboard, customers, menu, login, loading, colors, tours, images, settings
- Pro features (login, tours, images) show upgrade prompt for non-Pro users
- Sidebar shows Pro badge on gated features
- Mobile responsive via shadcn Sheet component
- Added SignOutButton to landing page
- Fixed Clerk environment mismatch (was using wrong Clerk app keys)
- Clerk webhook working - creates agency on signup
- User can sign in and access dashboard

**Navigation Overhaul (2026-01-10):**
- Replaced sidebar with horizontal Navigation Menu (better UX for GHL iframe embedding)
- Created `components/dashboard/main-nav.tsx` with multi-level dropdowns
- Navigation structure: Dashboard, Customers, Customize▼, Pro▼, Settings
- Customize dropdown: Menu, Login, Loading, Colors (2x2 grid with descriptions)
- Pro dropdown: Tours, Images (redirects to upgrade page for non-Pro users)
- Created `app/(dashboard)/upgrade/[feature]/page.tsx` for Pro feature upsell
- Plan badge in header shows current tier (Toolkit/Pro)
- Deleted unused sidebar files: `app-sidebar.tsx`, `search-form.tsx`, `version-switcher.tsx`

### Feature 6: Customers List Page
**Completed:** 2026-01-10

- Created `app/api/customers/route.ts` (GET list, POST create)
- Created `app/api/customers/[id]/route.ts` (GET, PATCH, DELETE)
- Created server actions in `customers/_actions/customer-actions.ts`
- Created components in `customers/_components/`:
  - `customer-table.tsx` - Table with name, token (copy), GHL location, status, created date
  - `customer-form.tsx` - Form for name, GHL location ID, GBP place ID
  - `add-customer-dialog.tsx` - Dialog wrapper for creating customers
  - `delete-customer-dialog.tsx` - Confirmation dialog for deletion
  - `empty-state.tsx` - Empty state with CTA
  - `customers-client.tsx` - Client wrapper with state management
- Updated `customers/page.tsx` with server-side data fetching
- Plan limit enforced (25 for Toolkit tier) with upgrade prompt
- Added date-fns for relative date formatting
- Added shadcn table and alert-dialog components

### Feature 7: Customer Edit Page
**Completed:** 2026-01-10

- Created `app/(dashboard)/customers/[id]/page.tsx` with server-side data fetching
- Created `customers/[id]/_components/customer-edit-form.tsx`:
  - Editable fields: Name, GHL Location ID, GBP Place ID, Active status toggle
  - Read-only token display with copy button
  - GBP Dashboard URL display (when GBP Place ID is set)
  - Back button navigation to customers list
- Added `updateCustomer` server action to customer-actions.ts
- API route `customers/[id]` already existed from Feature 6 (GET, PATCH, DELETE)

### Feature 8: Embed Code Display
**Completed:** 2026-01-10

- Created `settings/_components/embed-code-display.tsx`:
  - Displays script tag with agency token
  - One-click copy button with toast notification
  - Instructions accordion with 3 sections:
    - Where to paste in GHL (step-by-step)
    - What the script does (feature list)
    - Troubleshooting tips
- Updated `settings/page.tsx` to use the new component
- Added improved agency details grid (name, email, plan, token)
- Added shadcn accordion component

### Feature 9: Config API Endpoint
**Completed:** 2026-01-11

- Created `app/api/config/route.ts`:
  - Accepts `key` query parameter (agency token)
  - Returns agency settings (menu, login, loading, colors)
  - Returns active tours only (filtered by is_active)
  - Returns whitelisted_locations array
  - CORS headers for cross-origin access
  - Cache-Control: 60 seconds
  - Proper error handling (400 for missing key, 404 for invalid key)
  - OPTIONS handler for preflight requests

### Feature 10: Basic Embed Script
**Completed:** 2026-01-11

- Created `app/embed.js/route.ts` (dynamic JavaScript endpoint)
- Script features:
  - Accepts `key` query parameter
  - Fetches config from /api/config
  - Checks whitelisted_locations (skips if matched)
  - Applies menu customizations (hide items, rename items, hide banners)
  - Applies color customizations (primary, accent, sidebar colors)
  - Applies loading animation (custom CSS)
  - Applies login page customizations (logo, colors, background)
  - MutationObserver for SPA support (re-applies on DOM changes)
  - Graceful error handling (fails silently, doesn't break GHL)
  - Debug mode in development
  - Global config available at `window.__AGENCY_TOOLKIT_CONFIG__`
- Cache-Control: 5 minutes
- CORS enabled

**Phase 1: Foundation Complete!**

### Feature 11: Menu Customizer - Presets List
**Completed:** 2026-01-11

- Created `lib/constants.ts` with GHL menu items (16 items matching sidebar IDs)
- Added 2 built-in preset templates:
  - **Reputation Management** - 6 visible items with renames (Reviews, Inbox, Social Planner)
  - **Voice AI Package** - 8 visible items (RM + AI Agents, Automation)
- Created `app/api/menu-presets/route.ts` (GET list, POST create)
- Created `app/api/menu-presets/[id]/route.ts` (GET, PATCH, DELETE)
- Created server actions in `menu/_actions/menu-actions.ts`:
  - createMenuPreset, createMenuPresetFromTemplate, deleteMenuPreset, setDefaultPreset, updatePresetConfig
- Created components in `menu/_components/`:
  - `preset-card.tsx` - Card showing preset name, summary, default badge
  - `add-preset-dialog.tsx` - Dialog with template selector dropdown
  - `delete-preset-dialog.tsx` - Confirmation dialog for deletion
  - `menu-client.tsx` - Shows built-in templates + custom presets
- Updated `menu/page.tsx` with server-side data fetching
- Preset cards show: hidden items count, renamed items count, hidden banners count
- Default preset management (only one default at a time)
- Added shadcn select component

### Feature 12: Menu Customizer - Visual Editor
**Completed:** 2026-01-11

- Created `app/(dashboard)/menu/[id]/page.tsx` - Preset editor page with server-side data fetching
- Created components in `menu/[id]/_components/`:
  - `menu-editor.tsx` - Main editor with state management for items, visibility, renames, ordering, banners
  - `menu-sortable-list.tsx` - DndContext wrapper using @dnd-kit for drag-drop reordering
  - `menu-item-row.tsx` - Individual sortable row with drag handle, toggle switch, label, rename input
  - `banner-options.tsx` - Toggle switches for hiding promos, warnings, and connect prompts
  - `menu-preview.tsx` - Live sidebar preview showing visible items with icons and custom names
- Features:
  - Drag-and-drop reordering using @dnd-kit/sortable
  - Toggle visibility for each menu item
  - Rename input field (disabled when item is hidden)
  - Live preview panel showing how sidebar will appear
  - Banner options (hide promos, hide warnings, hide connects)
  - Save changes persists to database via updatePresetConfig server action
- Added `@dnd-kit/utilities` package for CSS transforms
- Updated `lib/constants.ts` with `GHL_HIDE_OPTIONS` array
- Icon mapping for all 16 GHL sidebar items in preview component

**Enhancements (2026-01-11):**
- Consolidated menu UI to single-page editor (presets at top, visual editor always visible)
- Added divider support:
  - `lib/constants.ts` - Added DIVIDER_TYPES (plain and labeled)
  - `menu/_components/divider-row.tsx` - Sortable divider component with dashed border
  - Updated `menu-sortable-list.tsx` to render both MenuItemRow and DividerRow
  - "Add Divider" dropdown button with Plain/Labeled options
- Added CSS generation:
  - `lib/css-generator.ts` - Generates CSS for menu customization
  - `menu/_components/css-preview-panel.tsx` - Collapsible CSS preview with small copy icon
  - Help accordion (Where to paste, What it does, Troubleshooting)
- Updated MenuPreview:
  - Renders dividers (plain lines and labeled sections)
  - "Apply colors" button to preview with agency colors
  - "Set custom colors" link to /colors page
- Added Custom Menu Links placeholder:
  - `menu/_components/custom-links-section.tsx` - GHL sync placeholder
  - "Sync with GHL" button disabled with "Coming Soon" tooltip
- Added shadcn collapsible component
- Updated database types to include dividers in MenuPreset config

### Feature 13: Apply Menu Config in Embed Script
**Completed:** 2026-01-11

- Updated `/api/config` to fetch default menu preset:
  - Joins with `menu_presets` table
  - Finds preset where `is_default: true`
  - Falls back to `agency.settings.menu` if no default preset
  - Includes `hidden_items`, `renamed_items`, `item_order`, `hidden_banners`, `dividers`
- Updated embed script with CSS injection approach:
  - Uses GHL-specific selectors: `[data-sidebar-item="sb_*"]`
  - Hides menu items via `display: none !important`
  - Renames items using CSS `::after` trick (font-size: 0 + ::after content)
  - Hides promotional banners (`[class*="promo-banner"]`, etc.)
  - Hides warning banners (`[class*="warning-banner"]`, `[class*="twilio-warning"]`)
  - Hides connect prompts (`[class*="connect-prompt"]`, etc.)
  - Removes and re-injects styles on re-application (SPA support)

---

## Decisions Log
- 2026-01-10: Replaced sidebar with Navigation Menu - better UX for iframe-embedded apps (GHL already has sidebar)
- 2026-01-10: Using npm/pnpm hybrid (pnpm installed globally via npm)
- 2026-01-10: Using sonner instead of deprecated toast component
- 2026-01-10: Using new-york style for shadcn/ui (now default)
- 2026-01-10: Next.js 16.1.1 installed (latest stable)
- 2026-01-10: Renamed middleware.ts to proxy.ts (Next.js 16 convention)
- 2026-01-10: Added @tailwindcss/postcss for Tailwind v4 compatibility
- 2026-01-10: Using Supabase MCP for schema migrations (better versioning than SQL Editor)
- 2026-01-10: Disabled Vercel deployment protection (was blocking Clerk webhooks)
- 2026-01-10: Added @vercel/speed-insights for performance monitoring
- 2026-01-10: GitHub repo: https://github.com/alanwallace9/AgencyToolKit
- 2026-01-10: Vercel URL: https://agencytoolkit-alanwallace9-5200s-projects.vercel.app
- 2026-01-11: Feature 14 implemented as drag-drop canvas designer (major differentiator vs competitors)

### Feature 14: Login Customizer Page (Canvas-based Designer)
**Completed:** 2026-01-11

**Major Differentiator Feature** - True visual drag-drop canvas editor for login pages, unlike competitors who require Chrome extensions or CSS knowledge.

- Created database infrastructure:
  - `login_designs` table via Supabase migration
  - Full TypeScript types in `types/database.ts` for canvas-based design
  - Types include: LoginLayoutType, CanvasElementType, LoginDesignBackground, LoginDesignFormStyle, CanvasElement

- Created server actions in `login/_actions/login-actions.ts`:
  - getLoginDesigns, getDefaultLoginDesign
  - createLoginDesign, updateLoginDesign, deleteLoginDesign
  - setDefaultLoginDesign
  - Default constants: DEFAULT_FORM_STYLE, DEFAULT_CANVAS, DEFAULT_LOGIN_FORM_ELEMENT

- Created main designer components:
  - `login-designer.tsx` - Main client component with DndContext, state management, save/load
  - `element-panel.tsx` - Draggable element buttons (Image, Text, GIF, Testimonial, Shape, Button)
  - `canvas.tsx` - Visual canvas with drag-drop positioning, aspect ratio container
  - `properties-panel.tsx` - Properties editor for selected element (position, size, type-specific props)
  - `preset-picker.tsx` - Layout preset dialog with 6 templates (Centered, Split-Left, Split-Right, Gradient, Minimal Dark, Blank)
  - `background-panel.tsx` - Background editor (solid, gradient, image with blur/overlay)
  - `form-style-panel.tsx` - Form styling (button, input, link colors with quick presets)

- Created element components in `login/_components/elements/`:
  - `image-element.tsx` - Image with URL, opacity, border-radius, object-fit
  - `text-element.tsx` - Text with font controls (size, weight, color, alignment)
  - `gif-element.tsx` - Animated GIF support
  - `login-form-element.tsx` - Login form preview with form styling applied
  - `testimonial-element.tsx` - Quote cards with 3 variants (card, minimal, quote-only)
  - `shape-element.tsx` - Shapes (rectangle, circle, line)
  - `button-element.tsx` - Custom CTA buttons

- Updated page and API:
  - `login/page.tsx` - Server component fetching designs, rendering LoginDesigner
  - Updated `/api/config` to include `login_designs` in query and return `login_design` field

- Updated embed script:
  - Added `applyLoginDesign()` function for canvas-based designs
  - Applies background (solid, gradient, image with overlay)
  - Applies form styling (button, input, link colors)
  - Injects canvas elements as positioned overlays (images, text, GIFs)
  - Falls back to legacy `applyLoginConfig()` if no design exists

- Added shadcn components: slider, textarea

**Competitive Advantage:**
| Feature | HL Pro Tools | Marketer's Toolkit | Extendly | **Agency Toolkit** |
|---------|-------------|-------------------|----------|-------------------|
| True drag-drop | ❌ | ❌ | ❌ | **✅** |
| No extension | ❌ | ❌ (Magic CSS) | ✅ | **✅** |
| Drag images anywhere | ❌ | ❌ | ❌ | **✅** |
| Animated GIF support | ❌ | ❌ | ❌ | **✅** |
| Live preview | Partial | Extension | ❌ | **✅** |

---

## Known Issues & Fixes Applied (Feature 14)

### Issue: Canvas Drag Positioning
**Status:** ✅ FIXED (2026-01-11)

**Problem:**
1. Native mouse event handling (previous attempt) - jerky, elements don't drag smoothly
2. @dnd-kit (original) - smooth dragging BUT position calculation wrong when releasing

**Root Cause:**
- The canvas displays at a scaled size (e.g., 600px wide) but elements are positioned using percentages based on virtual canvas (1600x900)
- When dragging ends, the delta calculation didn't properly convert screen pixels to canvas percentages

**Solution Applied:**
1. ✅ **Reverted to @dnd-kit** - smooth dragging restored
2. ✅ **Fixed delta calculation** - now uses `canvasRef.getBoundingClientRect()` to get actual rendered dimensions
   - `deltaXPercent = (delta.x / actualWidth) * 100`
   - `deltaYPercent = (delta.y / actualHeight) * 100`
3. ✅ **Added Center X/Y buttons** - in Properties panel with quick-center functionality
   - Uses AlignCenterHorizontal and AlignCenterVertical icons
   - Formula: `centeredX = (100 - elementWidthPercent) / 2`
4. ✅ **Added bounds checking** - elements constrained to canvas (0% to 100%-elementWidth%)
5. ✅ **Form background color** - added `form_bg` field to LoginDesignFormStyle

**Files modified:**
- `app/(dashboard)/login/_components/canvas.tsx` - canvasRef for dimensions
- `app/(dashboard)/login/_components/login-designer.tsx` - DndContext with handleDragEnd
- `app/(dashboard)/login/_components/properties-panel.tsx` - Center X/Y buttons
- `app/(dashboard)/login/_lib/defaults.ts` - moved constants out of "use server" file
- `types/database.ts` - added form_bg to LoginDesignFormStyle

**Remaining (lower priority):**
- Element visual scaling when browser resizes (elements currently use fixed % of canvas)
