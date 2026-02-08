# Feature: Help Article Feedback System

## Summary

Wire up the existing "Was this article helpful?" widget to persist feedback in Supabase and surface it in a Super Admin dashboard. Only the platform owner (super_admin role) can view feedback data. Any logged-in agency user can submit feedback.

## Prerequisites: Super Admin Role (Foundation)

**This is the first feature that needs a platform admin concept.** Today every Clerk user is just an agency owner — nothing distinguishes the platform owner from customers.

### Database Change

```sql
-- Add role column to agencies table
alter table agencies
  add column role text default 'agency'
  check (role in ('agency', 'super_admin'));

-- Set yourself as super_admin (run once manually)
update agencies set role = 'super_admin' where clerk_user_id = 'YOUR_CLERK_USER_ID';
```

### Route Guard

```ts
// lib/auth.ts — add helper
export async function requireSuperAdmin() {
  const agency = await getCurrentAgency();
  if (!agency || agency.role !== 'super_admin') {
    redirect('/dashboard');
  }
  return agency;
}
```

### Admin Routes

- All admin pages live under `/admin/*`
- `/admin/layout.tsx` calls `requireSuperAdmin()` — blocks non-admins at the layout level
- Agency users who navigate to `/admin` get redirected to `/dashboard`
- No admin nav link visible to regular agency users
- Super admin sees an "Admin" link in the header nav

### What Super Admin Unlocks (Future)

This role column is the foundation for future admin features:
- Agency management (activate/deactivate/suspend accounts)
- Plan overrides (give someone free Pro access)
- Error logs viewer
- Usage metrics
- Canny-style feedback/bug reporter (separate feature, ported from District Tracker)

**This spec only implements the role column + feedback. Other admin features are separate specs.**

---

## What Exists Today

- `article-feedback.tsx` renders Yes/No buttons on every help article
- Feedback saves to `localStorage` only (per-browser, lost on clear)
- `articleId` is derived from the URL path (e.g., `help-getting-started-first-customer`)
- No backend, no persistence, no admin view

---

## What We're Building

### 1. Database Migration

Two changes in one migration:

```sql
-- 1. Add role to agencies
alter table agencies
  add column role text default 'agency'
  check (role in ('agency', 'super_admin'));

-- 2. Create feedback table
create table help_feedback (
  id uuid primary key default gen_random_uuid(),
  article_id text not null,
  helpful boolean not null,
  comment text,                        -- phase 2: optional "what could be better?"
  clerk_user_id text,                  -- which agency submitted (for context)
  agency_name text,                    -- denormalized for easy admin viewing
  created_at timestamptz default now()
);

create index idx_help_feedback_article on help_feedback(article_id);
create index idx_help_feedback_created on help_feedback(created_at desc);
```

**No RLS on help_feedback.** Writes go through a validated server action. Reads use the admin client behind `requireSuperAdmin()`.

### 2. Server Actions

**Submit feedback** — called by any logged-in user:

```ts
// app/(dashboard)/help/_actions/feedback-actions.ts
'use server';

export async function submitFeedback(articleId: string, helpful: boolean) {
  // Validate articleId format (alphanumeric + hyphens only)
  // Get clerk_user_id + agency name from auth()
  // Insert into help_feedback via admin client
  // Return { success: true }
}
```

**Get feedback (admin only)** — called by the admin dashboard:

```ts
// app/admin/_actions/admin-feedback-actions.ts
'use server';

export async function getFeedbackSummary() {
  await requireSuperAdmin();
  // Aggregate query grouped by article_id
  // Returns: article_id, helpful_count, not_helpful_count, total, score, last_feedback
}

export async function getFeedbackDetail(articleId: string) {
  await requireSuperAdmin();
  // All individual entries for one article
  // Returns: helpful, agency_name, clerk_user_id, comment, created_at
}
```

### 3. Update article-feedback.tsx

Minimal changes to existing component:
- Import and call `submitFeedback()` on click
- Keep localStorage for instant optimistic UI
- Fire-and-forget the server action (no loading spinner needed)
- The user sees "Thanks for your feedback!" immediately as before

### 4. Admin Dashboard: `/admin/feedback`

**Route:** `app/admin/feedback/page.tsx`

**Layout:** Simple table with sortable columns.

| Column | Description |
|--------|-------------|
| Article | Friendly name (mapped from articleId) |
| Helpful | Count of Yes votes |
| Not Helpful | Count of No votes |
| Score | % helpful (green/red bar) |
| Total | Total votes |
| Last Feedback | Relative timestamp |

**Features:**
- Sort by score ascending (worst articles first = needs attention)
- Sort by total votes (most-read articles)
- Click a row → slide-out or detail view showing individual entries
- Each entry shows: agency name, helpful/not-helpful, timestamp, comment (if any)
- Green/red ratio bar per article for quick visual scanning

**Aggregate query:**

```sql
select
  article_id,
  count(*) filter (where helpful = true) as helpful_count,
  count(*) filter (where helpful = false) as not_helpful_count,
  count(*) as total,
  round(100.0 * count(*) filter (where helpful = true) / count(*), 1) as score,
  max(created_at) as last_feedback
from help_feedback
group by article_id
order by score asc;
```

### 5. Article Title Mapping

Static map so the admin view shows "Adding Your First Customer" instead of `help-getting-started-first-customer`:

```ts
// app/admin/_lib/article-titles.ts
export const ARTICLE_TITLES: Record<string, string> = {
  'help-getting-started-first-customer': 'Adding Your First Customer',
  'help-getting-started-embed-script': 'Installing the Embed Script',
  'help-getting-started-plans': 'Understanding Plans',
  // ... all articles
};
```

Updated as new articles are added. Falls back to the slug if unmapped.

---

## Order of Operations

1. Database migration (role column + help_feedback table)
2. Set your agency as `super_admin` (one-time SQL)
3. `requireSuperAdmin()` helper in `lib/auth.ts`
4. `/admin/layout.tsx` with super admin guard
5. `submitFeedback` server action
6. Update `article-feedback.tsx` to call it
7. Admin feedback summary page (`/admin/feedback`)
8. Article title mapping

---

## Effort Estimate

| Task | Scope |
|------|-------|
| Database migration | 1 alter + 1 table + 2 indexes |
| Super admin auth helpers | ~15 lines |
| Admin layout with guard | ~20 lines |
| Submit feedback server action | ~20 lines |
| Update feedback component | ~5 lines changed |
| Admin feedback page + detail | 1 page, 1-2 components |
| Article title map | Static file |
| **Total** | **One session** |

---

## Scope Boundaries

| In Scope | Out of Scope |
|----------|--------------|
| `role` column on agencies table | Full agency management UI |
| `requireSuperAdmin()` guard | Plan override UI |
| Feedback persistence to Supabase | Canny-style bug reporter (separate feature) |
| Admin feedback table at `/admin/feedback` | Email notifications |
| Sort by score / total votes | Rate limiting |
| Attach agency name to feedback | Anonymous feedback |
| Article title mapping | Automated article discovery |

---

## Phase 2 (Later)

- **Comment field on "No"** — small textarea after thumbs-down: "What could be better?" (max 500 chars)
- **Weekly digest** — edge function that emails a feedback summary
- **Other admin pages** — agency management, plan overrides, error logs (separate specs)
- **Canny-style feedback widget** — port from District Tracker (separate feature)
