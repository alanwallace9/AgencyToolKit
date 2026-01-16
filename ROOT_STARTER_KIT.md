# ROOT_STARTER_KIT.md

> **Purpose**: Portable template for starting new projects. Contains lessons learned, patterns, and instructions organized by where they should be applied.
>
> **Last Updated**: 2026-01-16

---

## Table of Contents

1. [CLAUDE.md Instructions](#claudemd-instructions)
2. [Environment Setup](#environment-setup)
3. [Authentication Patterns](#authentication-patterns)
4. [Database Patterns](#database-patterns)
5. [Deployment Gotchas](#deployment-gotchas)
6. [Lessons Learned](#lessons-learned)

---

## CLAUDE.md Instructions

> `[CLAUDE.md]` - Copy these sections into your new project's CLAUDE.md file

### Executive Plan Template

Before starting ANY feature, present an Executive Plan for user approval.

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

### Quick Wins (UX Improvements)
| Suggestion | Why It Helps | Effort |
|------------|--------------|--------|
| [UX improvement idea] | [User benefit] | Low/Medium/High |

### Questions for You
- [Any clarifying questions about requirements or preferences]
```

### Commit Workflow

```markdown
### Commit Workflow (WAIT FOR USER APPROVAL)

After feature completion: and approved testing

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
```

### Development Rules

```markdown
### No Assumptions
- Do NOT implement features, changes, or fixes that weren't explicitly discussed and approved
- If something is ambiguous or missing from the spec, ASK before coding
- If you think something should be added/changed, propose it first and wait for approval
- When in doubt, stop and ask
- If you get an error, stop and present the plan to fix it before continuing
```

### Starter Kit Maintenance

```markdown
### ROOT_STARTER_KIT.md Maintenance
After user state major problems has been solved or discovering important patterns:
1. Document the issue and solution in ROOT_STARTER_KIT.md
2. Place it in the appropriate section (Auth, Database, Deployment, etc.)
3. Include the date and context
4. Mark whether it's [CLAUDE.md], [REFERENCE], or [CODE] content
```

---

## Environment Setup

> `[REFERENCE]` - Tech stack decisions and setup commands

### Recommended Tech Stack (2026)

| Category | Technology | Why |
|----------|------------|-----|
| Framework | Next.js 16+ (App Router) | Server components, Server Actions |
| Auth | Clerk (@clerk/nextjs v6+) | Easy setup, webhooks, multi-tenant |
| Database | Supabase (Postgres + RLS) | RLS for multi-tenant, real-time |
| Styling | Tailwind CSS 4.x + shadcn/ui | Rapid UI development |
| Package Manager | pnpm 9.x+ | Faster than npm, better monorepo support |
| Hosting | Vercel | Native Next.js support, easy deploys |

### Initial Setup Commands

```bash
# Create project
pnpm create next-app@latest my-project --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Core dependencies
pnpm add @clerk/nextjs@latest @supabase/supabase-js @supabase/ssr

# shadcn/ui setup
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button card input label dialog dropdown-menu toast

# Development
pnpm dev

# Build (always run before committing)
pnpm build
```

### Essential .env Variables

```bash
# .env.local (never commit this file)

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## Authentication Patterns

> `[CODE]` + `[REFERENCE]` - Auth setup and gotchas

### Clerk + Next.js 16 Setup

**CRITICAL**: Next.js 16 renamed `middleware.ts` to `proxy.ts`. The export format matters!

#### Correct proxy.ts Format (Next.js 16+)

```typescript
// proxy.ts (root of project or /src)
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  // Add other public routes
]);

// CORRECT: Use `export default`
export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

#### Common Mistakes

| Wrong | Correct |
|-------|---------|
| `export const proxy = clerkMiddleware(...)` | `export default clerkMiddleware(...)` |
| File named `middleware.ts` (Next.js 16) | File named `proxy.ts` |
| File named `proxy.ts` (Next.js 15) | File named `middleware.ts` |

#### Clerk Webhook Handler

```typescript
// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) throw new Error('Missing CLERK_WEBHOOK_SECRET');

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response('Invalid signature', { status: 400 });
  }

  // Handle events
  if (evt.type === 'user.created') {
    // Create user record in your database
  }

  return new Response('OK', { status: 200 });
}
```

---

## Database Patterns

> `[CODE]` + `[REFERENCE]` - Supabase patterns and RLS

### Supabase Client Setup (SSR)

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component - ignore
          }
        },
      },
    }
  );
}
```

### Multi-Tenant RLS Pattern

```sql
-- Enable RLS on table
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- Policy using Clerk user ID from JWT
CREATE POLICY "Users can only see their own data"
ON your_table
FOR ALL
USING (clerk_user_id = auth.jwt() ->> 'sub');
```

---

## Deployment Gotchas

> `[REFERENCE]` - Platform-specific issues and solutions

### Vercel + Next.js 16

| Issue | Solution |
|-------|----------|
| `middleware.ts` build error | Rename to `proxy.ts`, use `export default` |
| Auth redirect loop | Check proxy.ts export format (see Auth section) |
| Build fails silently | Run `pnpm build` locally first |

### Vercel Environment Variables

- Set in Vercel Dashboard > Project > Settings > Environment Variables
- Use different values for Preview vs Production
- `CLERK_WEBHOOK_SECRET` must match Clerk dashboard webhook config

---

## Lessons Learned

> `[REFERENCE]` - Running log of issues and solutions

### 2026-01-16: Clerk + Next.js 16 Login Loop

**Problem**: Production site looped between `/sign-in` and `/dashboard`

**Root Cause**: `proxy.ts` used `export const proxy = clerkMiddleware(...)` instead of `export default clerkMiddleware(...)`

**Solution**: Change export format:
```typescript
// Wrong
export const proxy = clerkMiddleware(...)

// Correct
export default clerkMiddleware(...)
```

**Prevention**: Always check Next.js version and use correct middleware/proxy format:
- Next.js 15 and earlier: `middleware.ts`
- Next.js 16+: `proxy.ts` with `export default`

---

## How to Use This File

### Starting a New Project

1. Copy this file to your new project root
2. Copy relevant `[CLAUDE.md]` sections to your CLAUDE.md
3. Follow `[CODE]` sections for initial setup
4. Reference `[REFERENCE]` sections as needed

### Maintaining This File

When you solve a significant problem:
1. Add it to the appropriate section
2. Include date, problem, root cause, solution
3. Add prevention tips for the future
4. Mark content type: `[CLAUDE.md]`, `[CODE]`, or `[REFERENCE]`
