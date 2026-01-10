# Agency Toolkit - Automaker Specification Package

> Complete technical specification for building Agency Toolkit with Automaker

---

## Quick Start with Automaker

### 1. Set Up Automaker

```bash
# Clone Automaker
git clone git@github.com:AutoMaker-Org/automaker.git
cd automaker

# Install dependencies
npm install

# Run Automaker
npm run dev:electron
```

### 2. Create New Project

In Automaker:
1. Click "Create New Project"
2. Name it "agency-toolkit"
3. Copy the contents of this `context/` folder into the project's context directory

### 3. Add Context Files

Automaker uses context files to understand your project. Add these files:

| File | Purpose |
|------|---------|
| `PROJECT_SPEC.md` | Overall architecture, tech stack, folder structure |
| `DATABASE.md` | Supabase schema, RLS policies, TypeScript types |
| `API.md` | All API routes with request/response types |
| `COMPONENTS.md` | React component hierarchy and patterns |
| `FEATURES.md` | Kanban-ready feature cards (use these!) |

### 4. Import Features

From `FEATURES.md`, create Kanban cards for each feature. Start with:

**Phase 1 (Foundation):**
1. Project Scaffolding
2. Clerk Authentication Setup
3. Supabase Schema & Client Setup
4. Clerk Webhook Handler
5. Dashboard Layout Shell
6. Customers List Page
7. Customer Edit Page
8. Embed Code Display
9. Config API Endpoint
10. Basic Embed Script

**Phase 2 (MVP):**
11-17 (Menu, Login, Loading, Colors customizers)

### 5. Run Automaker

Move Feature 1 to "In Progress" and let Automaker begin building!

---

## Spec Files Overview

### PROJECT_SPEC.md
- Executive summary and value proposition
- Tech stack with current versions (Jan 2026)
- Architecture diagram
- Iframe compatibility requirements for GHL
- Token system (agency/customer)
- Folder structure
- Environment variables
- Module dependencies

### DATABASE.md
- Complete SQL schema for all tables
- Row Level Security (RLS) policies
- Public access policies for embed script
- Database functions and triggers
- TypeScript type definitions
- Supabase client setup patterns

### API.md
- Clerk middleware configuration
- Protected routes (customers, settings, tours, images)
- Public routes (config, image generation, webhooks)
- Embed script generation
- Error handling patterns
- Request/response types

### COMPONENTS.md
- Design system (shadcn/ui base)
- Layout components (Dashboard, Sidebar, Header)
- Shared components (PageHeader, EmptyState, CopyButton)
- Feature-specific components
- Custom hooks (useAgency, useCustomers, usePlanGate)
- Form patterns with Zod validation

### FEATURES.md
- 36 features organized by phase
- Each feature has:
  - Priority level
  - Time estimate
  - Detailed tasks
  - Acceptance criteria
- Dependency graph
- MVP scope defined

---

## Development Phases

| Phase | Duration | Features | Outcome |
|-------|----------|----------|---------|
| **Phase 1** | Week 1 | 1-10 | Foundation + Admin Shell |
| **Phase 2** | Week 2 | 11-17 | MVP (Sellable Product) |
| **Phase 3** | Week 3 | 18-22 | Onboarding Tours |
| **Phase 4** | Week 4 | 23-27 | Image Personalization |
| **Phase 5** | Week 5 | 28-36 | Full Product Launch |

---

## Key Technical Decisions

### Why These Versions?

| Tech | Version | Reason |
|------|---------|--------|
| Next.js 15.5 | Latest stable | Turbopack stable, Server Actions |
| @clerk/nextjs v6 | Latest | Async auth(), Next.js 15 support |
| @supabase/ssr | Latest | Replaced deprecated auth-helpers |
| shadcn/ui CLI 3.0 | Latest | Namespaced registries, improved DX |
| Driver.js 1.x | Latest | Lightweight tours, MIT license |

### Iframe Requirements

GHL embeds external apps via iframes. All user-facing pages must:
- NOT set restrictive X-Frame-Options
- Include `frame-ancestors *` in CSP
- Use URL tokens instead of localStorage for auth
- Be responsive to varying iframe sizes

### Token Architecture

Two-level system:
1. **Agency Token** (e.g., `rp_abc123`) - Used in embed snippet
2. **Customer Token** (e.g., `bp_xyz789`) - Used in GBP dashboard URLs

---

## Pre-Build Checklist

Before starting Automaker, ensure you have:

- [ ] Clerk account created (https://clerk.com)
- [ ] Supabase project created (https://supabase.com)
- [ ] Cloudflare R2 bucket (for Pro tier images)
- [ ] Vercel account (for deployment)
- [ ] Domain name (optional, but recommended)

### Required API Keys

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# Cloudflare R2 (for Pro tier)
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
```

---

## Tips for Automaker

### Good Feature Descriptions

When creating features in Automaker, be specific:

✅ Good: "Create customers table with columns: id, agency_id, name, token, ghl_location_id, gbp_place_id, settings, is_active, created_at, updated_at"

❌ Bad: "Set up database"

### Acceptance Criteria

Each feature should have testable criteria:

✅ Good: 
- [ ] API returns 401 for unauthenticated requests
- [ ] API returns 403 when customer limit exceeded
- [ ] Customer appears in list after creation

❌ Bad:
- [ ] It should work

### Breaking Down Complex Features

If a feature takes >4 hours, split it:

Instead of: "Build complete image editor"

Split into:
1. Image upload to R2 (2h)
2. Canvas display with draggable text (3h)
3. Text styling controls (2h)
4. Save and preview (1h)

---

## Support

For questions about this spec:
- Review the original Agency Toolkit documentation
- Check Clerk/Supabase/Next.js docs for current APIs
- Adjust versions if significant updates released

For Automaker issues:
- https://github.com/AutoMaker-Org/automaker/issues
- Discord: (check Automaker repo for link)
