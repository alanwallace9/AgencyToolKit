# Prompt: Features 25-27 Spec & Executive Summary

Use this prompt to generate specification documents for Tour Analytics and Checklists.

---

## Context

**Project:** Agency Toolkit - SaaS for GoHighLevel agencies to customize white-label sub-accounts

**Tech Stack:**
- Next.js 15.5 (App Router, Server Actions)
- Clerk auth, Supabase database
- Tailwind CSS + shadcn/ui
- Driver.js for tours (already implemented)
- Embed script injected via single JS snippet

**What's Already Built:**
- Tours system with Builder, Themes, Templates (Features 18-24)
- Visual Element Selector for targeting DOM elements
- Tours run via Driver.js in the embed script
- `tour_analytics` table exists in database (created in Feature 18)

---

## Feature 25: Tour Analytics Dashboard

### Requirements to Define

1. **Metrics to Track:**
   - Tour views (started)
   - Tour completions
   - Step-by-step drop-off rates
   - Completion rate percentage
   - Average time to complete
   - Dismissal rate (closed early)

2. **Dashboard UI:**
   - Where does it live? (Tours list page? Separate analytics page? Per-tour view?)
   - Time range selector (7d, 30d, 90d, all time)
   - Chart types (line chart for trends, funnel for drop-off, cards for KPIs)
   - Per-tour breakdown vs aggregate view

3. **Data Collection:**
   - What events to track in embed script
   - How to send events to API (fire-and-forget POST?)
   - Privacy considerations (anonymous vs customer-linked)

4. **Database:**
   - `tour_analytics` table already exists - review schema
   - Any additional tables needed?
   - Aggregation strategy (real-time vs batch)

### Questions to Answer
- Should analytics be Pro-only or all plans?
- Do we show analytics per-customer (subaccount) or just aggregate?
- What's the data retention policy?

---

## Feature 26: Checklists Builder

### Requirements to Define

1. **Checklist Structure:**
   - Checklist name and description
   - List of items (tasks)
   - Each item has: title, description, action type
   - Action types: open URL, start tour, custom JS, manual check

2. **Builder UI:**
   - Where does it live? (New /checklists route)
   - Item reordering (drag-drop)
   - Item editing (inline or modal?)
   - Preview of checklist appearance

3. **Completion Triggers:**
   - Manual (user clicks checkbox)
   - Automatic (tour completed, URL visited, element clicked)
   - How to persist completion state per user

4. **Targeting:**
   - Which customers/subaccounts see this checklist?
   - URL patterns (same as tours)
   - Show once vs show until complete

5. **Database:**
   - `checklists` table (already exists from Feature 18 migration)
   - Items stored as JSONB or separate table?
   - User completion state storage

---

## Feature 27: Checklists Widget + Embed

### Requirements to Define

1. **Widget Appearance:**
   - Floating button (bottom-right corner?)
   - Expandable panel showing checklist
   - Progress indicator (3/5 complete)
   - Minimized vs expanded state

2. **Widget Behavior:**
   - Click item to trigger action
   - Checkmark animation on completion
   - Persistence (localStorage? server-side?)
   - Auto-advance when task completed

3. **Embed Integration:**
   - Add to existing embed.js
   - Fetch checklist config from /api/config
   - Track completion events

4. **Styling:**
   - Use tour theme colors for consistency?
   - Customizable position?
   - Mobile responsive

---

## Deliverables Requested

1. **Spec Document** (`docs/features/feature-25-tour-analytics.md`)
   - Database schema (review existing, propose changes)
   - API endpoints needed
   - UI components and layout
   - Embed script changes

2. **Spec Document** (`docs/features/feature-26-27-checklists.md`)
   - Database schema for checklists and completion state
   - Builder UI components
   - Widget design and behavior
   - Embed script integration

3. **Executive Summary** for each feature following CLAUDE.md template:
   - What We're Building (2-3 sentences)
   - UI/UX Placement
   - Key Deliverables table
   - Order of Operations
   - Database Changes
   - Scope Boundaries
   - Quick Wins suggestions

---

## Reference Files

- `docs/spec/DATABASE.md` - Existing schema
- `supabase/migrations/20260113_dap_system.sql` - DAP tables including tour_analytics, checklists
- `app/embed.js/route.ts` - Current embed script
- `app/(dashboard)/tours/` - Tour builder for UI patterns

---

## Output Format

Please create:
1. `docs/features/feature-25-tour-analytics.md`
2. `docs/features/feature-26-27-checklists.md`

Each file should include the spec details AND an Executive Summary section at the top that I can review and approve before implementation begins.
