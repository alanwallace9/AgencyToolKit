# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Agency Toolkit** is a SaaS product for GoHighLevel (GHL) agencies to customize their white-label sub-accounts. It provides visual customization (menu, login, loading, colors), onboarding tours, personalized images, and embedded dashboards—all injected via a single JavaScript embed snippet.

This repository contains **specification documents only** - no implementation code exists yet. The specs are designed for use with AI-assisted development tools.

## Tech Stack

- **Framework**: Next.js 15.5 (App Router, Server Actions, Turbopack)
- **Auth**: Clerk (@clerk/nextjs v6) with async `auth()`
- **Database**: Supabase (Postgres + RLS + @supabase/ssr)
- **Styling**: Tailwind CSS 4.x + shadcn/ui CLI 3.0
- **Package Manager**: pnpm 9.x
- **Image Processing**: @vercel/og + Sharp
- **Image Storage**: Cloudflare R2
- **Onboarding Tours**: Driver.js 1.x
- **Drag & Drop**: @dnd-kit/sortable (menu reordering)
- **Hosting**: Vercel

## UI Components

- Use shadcn/ui for ALL UI components
- Install new components via: `pnpm dlx shadcn@latest add [component]`
- Don't build custom components when shadcn has one
- Customize shadcn components in /components/ui/ if needed
- Check https://ui.shadcn.com/docs/components for available components

## Development Commands (for future implementation)

```bash
# Initial setup
pnpm create next-app@latest agency-toolkit --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Install dependencies
pnpm add @clerk/nextjs@latest @supabase/supabase-js @supabase/ssr sharp driver.js @dnd-kit/core @dnd-kit/sortable

# shadcn/ui setup
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button card input label dialog dropdown-menu sidebar toast tooltip alert tabs

# Development
pnpm dev

# Build
pnpm build

# Type generation from Supabase
pnpm supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
```

## Architecture

### Two-Level Token System
- **Agency Token** (`rp_abc123`): Used in embed snippet, identifies the agency
- **Customer Token** (`bp_xyz789`): Used in GBP dashboard URLs, identifies sub-accounts

### Key Routes
- `/app/(dashboard)/*` - Protected admin routes (Clerk auth)
- `/app/(embed)/*` - Iframe-embeddable routes (token auth, no X-Frame-Options restrictions)
- `/api/config` - Public endpoint returning agency config for embed script
- `/embed.js` - Dynamic JavaScript embed script

### Iframe Compatibility (Critical)
All user-facing modules embedded in GHL must:
- NOT set restrictive X-Frame-Options (use `ALLOWALL`)
- Include `frame-ancestors *` in CSP
- Use URL tokens instead of localStorage for auth
- Be responsive to varying iframe sizes

### Database (Supabase)
Key tables: `agencies`, `customers`, `menu_presets`, `tours`, `image_templates`, `social_proof_events`

RLS policies enforce multi-tenant isolation via `clerk_user_id` in JWT. Public read access uses agency/customer tokens for embed script and image API.

## Specification Files

| File | Contents |
|------|----------|
| `spec/PROJECT_SPEC.md` | Architecture, tech stack, folder structure, env vars |
| `spec/DATABASE.md` | Complete SQL schema, RLS policies, TypeScript types |
| `spec/API.md` | All API routes with request/response types |
| `spec/COMPONENTS.md` | React component hierarchy, hooks, form patterns |
| `spec/CONSTANTS.md` | GHL menu items, loading animations, color presets |
| `spec/FEATURES.md` | Kanban-ready feature cards with acceptance criteria |

## Pricing Tiers

| Feature | Toolkit ($19) | Pro ($39) |
|---------|---------------|-----------|
| Menu Customizer | Yes | Yes |
| Login/Loading/Colors | Yes | Yes |
| Onboarding Tours | No | Yes |
| Image Personalization | No | Yes |
| GBP Dashboard | No | Yes |
| Customer Limit | 25 | Unlimited |

Feature gating is implemented via `agency.plan` field in database.

## Key Implementation Notes

- Clerk webhook (`/api/webhooks/clerk`) creates agency record on user signup
- Embed script fetches config from `/api/config?key={agency_token}` and applies CSS/JS customizations
- Tours use Driver.js with localStorage to track completion
- Image API (`/api/og/[templateId]`) uses @vercel/og edge runtime for dynamic image generation
- All settings stored as JSONB for flexibility

## ROOT_STARTER_KIT.md Maintenance

Only add to `/ROOT_STARTER_KIT.md` when:
1. **User states a major problem has been solved** - After testing confirms it works
2. **User explicitly requests it** - e.g., "This is great, please add it to the file for all projects"

Content must be:
- **Project-agnostic** - Useful for future projects, not just this one
- **Proven** - Actually tested and working, not theoretical fixes
- **Approved** - User has reviewed and confirmed it should be added

**Never add unproven solutions or project-specific content to ROOT_STARTER_KIT.md.**

## Development Rules

### No Assumptions
- Do NOT implement features, changes, or fixes that weren't explicitly discussed and approved
- If something is ambiguous or missing from the spec, ASK before coding
- If you think something should be added/changed, propose it first and wait for approval
- When in doubt, stop and ask
- If you get an error, stop and present the plan to fix it before continuing

### Executive Plan (REQUIRED Before Implementation)

**Before starting ANY feature, present an Executive Plan for user approval.**

| Step | Action | Wait for User? |
|------|--------|----------------|
| 1 | **Read Feature Doc** - Check `docs/features/feature-N-*.md` | No |
| 2 | **Present Executive Plan** - Use template below | **YES - WAIT** |
| 3 | **Get Approval** - User confirms approach | **YES - WAIT** |
| 4 | **Implement** - Follow the approved plan | No |
| 5 | **Confirm** - Show user the results | **YES - WAIT** |
| 6 | **Ready to Commit?** - Ask before committing | **YES - WAIT** |

**Executive Plan Template:**

```markdown
## Executive Plan: Feature N - [Title]

### What We're Building
[2-3 sentence summary of what we're building and why it matters to users]

### UI/UX Placement
- Where new components will appear in the UI
- How they integrate with existing pages
- Visual mockup description if helpful

### Key Deliverables
| Component | Description |
|-----------|-------------|
| [Component 1] | [What it does] |
| [Component 2] | [What it does] |

### Order of Operations
1. [First task] - why this order
2. [Second task] - dependencies on #1
...

### Database Changes
- [Table/column changes if any, or "None - uses existing schema"]

### Key Decisions (Need Your Input)
- [Decision 1]: [Options and recommendation]
- [Decision 2]: [Options and recommendation]

### Scope Boundaries
| In Scope | Out of Scope |
|----------|--------------|
| [Item] | [Item] |

### Quick Wins (UX Improvements) ⭐ REQUIRED
**ALWAYS include 3-5 suggestions to enhance the user experience.**

| Suggestion | Why It Helps | Effort |
|------------|--------------|--------|
| [UX improvement idea] | [User benefit] | Low/Medium/High |
| [Convenience feature] | [User benefit] | Low/Medium/High |
| [Wow factor idea] | [User benefit] | Low/Medium/High |

*Think: What would make the user say "wow" or "that's convenient"? What keeps them coming back?*

### Questions for You
- [Any clarifying questions about requirements or preferences]
```

**Wait for user approval before proceeding to implementation.**

### Commit Workflow (WAIT FOR USER APPROVAL)

After feature completion:

1. **ASK USER**: "Feature complete - ready to commit?" - **WAIT FOR APPROVAL**
2. **CHECK ALL MODIFIED FILES**: Run `git status` and review ALL uncommitted changes
   - List all modified files to the user
   - Identify which files are related to the current work
   - Flag any files that were modified but might be forgotten
   - **ASK**: "These files have uncommitted changes. Should they be included?"
   - **IMPORTANT**: Code imports from other files may have been added - ensure those files are committed too
3. **RUN BUILD**: `pnpm build` - **MUST PASS before committing**
4. Stage ALL approved files, commit with format: `feat: [Feature #] - description`
5. **WAIT** for user approval before pushing

**DO NOT commit without user approval. DO NOT push without passing build.**
**DO NOT leave related files uncommitted - this causes production build failures.**

### Feature Documentation (On Commit)

When a feature is complete and committed:

1. **Update the Feature File** (`docs/features/feature-N-*.md`)
   - Add "## Implementation Notes" section with what was actually built
   - Document any deviations from the original plan
   - List files created/modified
   - Note any gotchas or lessons learned

2. **Update SPRINT.md** (Status Only)
   - Mark the feature as completed with date
   - Update "In Progress" to show the next feature
   - Keep it brief - details go in feature files

**Feature files are the source of truth for what was built. SPRINT.md is just a status tracker.**

### Sprint Tracking
- Maintain a `docs/SPRINT.md` file in the project root
- Keep entries brief - just status updates
- Before starting work, check SPRINT.md for current status
- Format:
```
## Current Sprint

### Completed
- [x] 2026-01-10: Feature 1 - Project scaffolding
- [x] 2026-01-10: Feature 2 - Clerk auth setup

### In Progress
- [ ] Feature 3 - Supabase schema

### Up Next
- Feature 4 - Clerk webhook handler

### Decisions Log
- 2026-01-10: Using pnpm over npm for faster installs
```

## Testing Rules
  - CHeck to see if teh dev server is running before trying to start a new one.

## Code Standards

### Before Writing Code
- Read relevant spec file in docs/spec/ before implementing
- Check SPRINT.md for context on what's already done
- Confirm the approach before writing more than 20 lines

### File Organization
- Follow folder structure in docs/spec/PROJECT_SPEC.md
- Components go in /components/{feature}/
- API routes follow RESTful conventions
- Keep files under 200 lines - split if larger

### Git Commits
- Commit after each completed task
- Format: "feat: [Feature #] - brief description"
- Example: "feat: [Feature 1] - project scaffolding complete"

### Error Handling
- All API routes need try/catch with proper error responses
- Use the error patterns from docs/spec/API.md
- Never swallow errors silently

### Environment Variables
- Never hardcode secrets
- Add new env vars to .env.example with comments
- Reference docs/spec/PROJECT_SPEC.md for required vars

## Tech Stack Reference
- Next.js 15.5 (App Router, Server Actions)
- @clerk/nextjs v6 (async auth())
- @supabase/ssr (not the old auth-helpers)
- shadcn/ui CLI 3.0
- pnpm (not npm)

## File Organization (Feature-Based)

### Structure
```
app/
├── (auth)/                    # Auth pages (sign-in, sign-up)
├── (dashboard)/
│   ├── layout.tsx             # Shared dashboard layout
│   ├── dashboard/             # Overview page
│   │
│   ├── customers/             # SELF-CONTAINED MODULE
│   │   ├── page.tsx           # List view
│   │   ├── [id]/page.tsx      # Detail view
│   │   ├── _components/       # Customer-specific components
│   │   │   ├── customer-card.tsx
│   │   │   ├── customer-form.tsx
│   │   │   └── customer-table.tsx
│   │   ├── _hooks/            # Customer-specific hooks
│   │   │   └── use-customers.ts
│   │   └── _actions/          # Server actions for customers
│   │       └── customer-actions.ts
│   │
│   ├── menu/                  # SELF-CONTAINED MODULE
│   │   ├── page.tsx
│   │   ├── _components/
│   │   │   ├── menu-editor.tsx
│   │   │   ├── menu-item-toggle.tsx
│   │   │   └── menu-preview.tsx
│   │   └── _actions/
│   │       └── menu-actions.ts
│   │
│   ├── login/                 # SELF-CONTAINED MODULE
│   ├── loading/               # SELF-CONTAINED MODULE
│   ├── colors/                # SELF-CONTAINED MODULE
│   ├── tours/                 # SELF-CONTAINED MODULE
│   ├── images/                # SELF-CONTAINED MODULE
│   └── settings/
│
├── (embed)/                   # Public embeddable pages
│   ├── dashboard/             # GBP dashboard for customers
│   └── layout.tsx             # Minimal layout (no sidebar)
│
└── api/
    ├── config/                # Public config endpoint
    ├── webhooks/              # Clerk webhooks
    └── og/                    # Image generation

components/
├── ui/                        # shadcn/ui (shared)
└── shared/                    # App-wide shared components
    ├── page-header.tsx
    ├── empty-state.tsx
    ├── copy-button.tsx
    └── upgrade-prompt.tsx

lib/
├── supabase/                  # DB clients
├── utils.ts                   # General utilities
├── constants.ts               # App constants
└── tokens.ts                  # Token generation
```

### Rules
- Underscore prefix (`_components/`) keeps folders private to that route
- Each module should be self-contained - don't import from other modules
- Shared components go in `/components/shared/`
- If working on "menu", stay in `app/(dashboard)/menu/`
- API routes mirror the feature: `/api/menu/` for menu endpoints
