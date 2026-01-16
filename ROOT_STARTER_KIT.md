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

### 2026-01-16: Clerk Production Setup - Complete Guide

**Problem**: Login loop on Vercel production - client-side Clerk sees session, server-side `auth()` returns null

**Symptoms**:
- Console shows: "The <SignIn/> component cannot render when a user is already signed in"
- This message repeats rapidly as the page loops
- Debug endpoint shows: `{ userId: null, sessionId: null }`
- Works perfectly on localhost

**Root Cause**: Clerk Development instances (`pk_test_`, `sk_test_` keys) have cookie/session handling that doesn't work reliably on production domains.

---

## Complete Clerk Production Setup (Step-by-Step)

### Prerequisites
- A custom domain (Clerk Production does NOT allow `.vercel.app` domains)
- You can use a subdomain of an existing domain (e.g., `toolkit.yourdomain.com`)

### Step 1: Create Clerk Production Instance

1. Go to Clerk Dashboard → Instance → Create Production Instance
2. Enter your custom domain (e.g., `toolkit.yourdomain.com`)
3. Get your new `pk_live_` and `sk_live_` API keys

### Step 2: Add DNS Records (5-6 records required)

In your DNS provider (Cloudflare, etc.), add ALL of these CNAME records:

| Name | Target | Purpose |
|------|--------|---------|
| `toolkit` | `cname.vercel-dns.com` (or Vercel's target) | Your app |
| `clerk.toolkit` | `frontend-api.clerk.services` | Clerk JS/API |
| `accounts.toolkit` | `accounts.clerk.services` | Account portal |
| `clkmail.toolkit` | `mail.{instance-id}.clerk.services` | Transactional emails |
| `clk._domainkey.toolkit` | `dkim1.{instance-id}.clerk.services` | Email DKIM |
| `clk2._domainkey.toolkit` | `dkim2.{instance-id}.clerk.services` | Email DKIM |

**Important**: Set proxy status to "DNS only" (gray cloud in Cloudflare) for Clerk records.

The exact targets are shown in Clerk Dashboard → Domains → DNS Configuration.

### Step 3: Verify DNS in Clerk

1. Go to Clerk Dashboard → Domains
2. Click "Verify configuration"
3. Wait until all records show green (5-15 minutes usually)

### Step 4: Configure Clerk Paths

In Clerk Dashboard → Paths, set Component Paths to **"application domain"** (not Account Portal):

| Setting | Select | Value |
|---------|--------|-------|
| `<SignIn />` | Sign-in page on **application domain** | `/sign-in` |
| `<SignUp />` | Sign-up page on **application domain** | `/sign-up` |
| Signing Out | Path on **application domain** | `/sign-in` |

### Step 5: Update Vercel Environment Variables

Replace the development keys with production keys:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

### Step 6: Create New User Account

**CRITICAL**: Clerk Production is a separate user database. Your Development account doesn't exist in Production.

1. Go to `https://yourdomain.com/sign-up`
2. Create a new account
3. Note the new Clerk user ID (format: `user_xxxxx`)

### Step 7: Link Supabase Agency Record

Update your Supabase agency record with the new Clerk user ID:

```sql
UPDATE agencies
SET clerk_user_id = 'user_NEW_PRODUCTION_ID',
    updated_at = now()
WHERE clerk_user_id = 'user_OLD_DEVELOPMENT_ID';
```

### Step 8: Test

Visit `https://yourdomain.com/dashboard` - you should be logged in without loops!

---

## Debugging Tips

### Add a Debug Endpoint

Create `/api/debug-auth/route.ts` to see what Clerk returns:

```typescript
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId, sessionId } = await auth();

  let agency = null;
  if (userId) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("agencies")
      .select("id, clerk_user_id, email, name, plan")
      .eq("clerk_user_id", userId)
      .single();
    agency = data;
  }

  return NextResponse.json({
    clerk: { userId, sessionId, hasSession: !!sessionId },
    supabase: { agency },
    diagnosis: !userId ? "NO_CLERK_SESSION"
      : !agency ? "NO_AGENCY_RECORD"
      : "OK",
  });
}
```

Add to public routes in `proxy.ts`:
```typescript
const isPublicRoute = createRouteMatcher([
  // ... other routes
  '/api/debug-auth(.*)',  // Temporary debug endpoint
]);
```

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `ERR_NAME_NOT_RESOLVED` for `clerk.*` | Missing DNS record | Add CNAME for `clerk.yourdomain` |
| 422 on sign-in | User doesn't exist in Production | Sign up instead |
| Login loop with production keys | Missing agency record in Supabase | Update `clerk_user_id` in agencies table |
| "development keys" warning | Wrong env vars | Update to `pk_live_`/`sk_live_` |

---

**Time Investment**: Initial setup takes 1-2 hours including DNS propagation. Worth doing correctly from the start.

**Prevention**: Budget for a custom domain from day 1 if you plan to deploy beyond localhost.

---

### 2026-01-16: isomorphic-dompurify Fails on Vercel Serverless

**Problem**: /tours page returns 500 error on Vercel production, works on localhost

**Error**:
```
Error [ERR_REQUIRE_ESM]: require() of ES Module .../node_modules/@exodus/bytes/encoding-lite.js
from .../node_modules/html-encoding-sniffer/lib/html-encoding-sniffer.js not supported.
```

**Root Cause**: `isomorphic-dompurify` uses `jsdom` on the server. jsdom's dependency chain (html-encoding-sniffer → @exodus/bytes) has ESM/CommonJS compatibility issues when bundled for Vercel's serverless runtime. Works locally because full Node.js handles module interop differently than Vercel's bundler.

**Solution**: Replace `isomorphic-dompurify` with `sanitize-html`:

```bash
pnpm remove isomorphic-dompurify dompurify @types/dompurify
pnpm add sanitize-html @types/sanitize-html
```

Update imports:
```typescript
// Before
import DOMPurify from 'isomorphic-dompurify';
const clean = DOMPurify.sanitize(dirty, config);

// After
import sanitizeHtml from 'sanitize-html';
const clean = sanitizeHtml(dirty, config);
```

**Why This Happens**: Same Next.js code, different runtime environments:
- Localhost: Full Node.js process with native module resolution
- Vercel: Bundled serverless function where ESM/CJS interop fails

**Prevention**: For Vercel serverless deployments, prefer pure JavaScript libraries over those requiring DOM implementations:
- HTML sanitization: Use `sanitize-html` (not `isomorphic-dompurify`)
- Avoid libraries that depend on `jsdom` for server-side code

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
