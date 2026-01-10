# Sprint Tracking

## Progress: 11% Complete (4 of 36 Features, Feature 5 at 90%)

---

## Feature Checklist

### Phase 1: Foundation
- [x] Feature 1: Project Scaffolding
- [x] Feature 2: Clerk Authentication Setup
- [x] Feature 3: Supabase Schema & Client Setup
- [x] Feature 4: Clerk Webhook Handler
- [ ] Feature 5: Dashboard Layout Shell (90% - sidebar layout fix pending)
- [ ] Feature 6: Customers List Page
- [ ] Feature 7: Customer Edit Page
- [ ] Feature 8: Embed Code Display
- [ ] Feature 9: Config API Endpoint
- [ ] Feature 10: Basic Embed Script

### Phase 2: Quick Wins / MVP
- [ ] Feature 11: Menu Customizer - Presets List
- [ ] Feature 12: Menu Customizer - Visual Editor
- [ ] Feature 13: Apply Menu Config in Embed Script
- [ ] Feature 14: Login Customizer Page
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

### In Progress
- [ ] Feature 5 - Dashboard Layout Shell (sidebar overlap fix remaining)

### Up Next
- Feature 6 - Customers List Page

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
**Status:** 90% Complete - Layout issue pending
**Started:** 2026-01-10

**Completed:**
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

**Known Issue - To Fix Next Session:**
- Sidebar overlaps main content when expanded (works when collapsed)
- Root cause identified: Need to use SidebarInset correctly and spread props to Sidebar component
- Reference: shadcn sidebar-01 block structure (installed for reference)
- Fix plan documented below

**Files created by shadcn sidebar-01 block (for reference, can delete after fix):**
- app/dashboard/page.tsx (conflicts with route group - delete after copying pattern)
- components/app-sidebar.tsx (reference for props spreading)
- components/search-form.tsx (not needed)
- components/version-switcher.tsx (not needed)

**Fix Plan for Next Session:**
1. Delete conflicting /app/dashboard/page.tsx
2. Update components/dashboard/app-sidebar.tsx to spread {...props} to <Sidebar>
3. Update app/(dashboard)/layout.tsx to use SidebarInset properly:
   ```tsx
   <SidebarProvider>
     <AppSidebar agencyPlan={agency.plan} />
     <SidebarInset>
       <DashboardHeader agencyName={agency.name} />
       <main className="flex flex-1 flex-col gap-4 p-4">
         {children}
       </main>
     </SidebarInset>
   </SidebarProvider>
   ```
4. Delete temporary shadcn reference files
5. Test sidebar expand/collapse

---

## Decisions Log
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
