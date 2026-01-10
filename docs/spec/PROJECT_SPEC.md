# Agency Toolkit - Technical Specification

> **Version:** 1.0  
> **Created:** January 2026  
> **Purpose:** Automaker-ready specification for autonomous development

---

## Executive Summary

**Agency Toolkit** is a SaaS product for GoHighLevel (GHL) agencies to customize their white-label sub-accounts. It provides visual customization, onboarding tours, personalized images, and embedded dashboards—all injected via a single JavaScript snippet.

**Primary Value:** 10% of competitor pricing ($19-39/mo vs $97-299/mo) while including features like image personalization that competitors charge $25/mo extra for.

**Target Market:** Review management agencies in Clay's ReviewHarvest community (800+ agencies).

---

## Tech Stack (Current Stable Versions - January 2026)

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | Next.js | 15.5.x | App Router, Server Actions, Turbopack |
| React | React | 19.x | UI library |
| Language | TypeScript | 5.x | Type safety |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| Components | shadcn/ui | CLI 3.0 | Copy-paste components |
| Auth | Clerk | @clerk/nextjs v6 | Multi-tenant auth with async auth() |
| Database | Supabase | @supabase/ssr | Postgres + RLS + Storage |
| Image Processing | @vercel/og + Sharp | Latest | Dynamic image generation |
| Image Storage | Cloudflare R2 | - | S3-compatible object storage |
| Onboarding Tours | Driver.js | 1.x | Lightweight tour library |
| Hosting | Vercel | - | Serverless deployment |
| Package Manager | pnpm | 9.x | Fast, disk-efficient |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AGENCY TOOLKIT                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────┐       ┌────────────────────────────────────┐  │
│  │   ADMIN DASHBOARD    │       │   INJECTED FEATURES (via snippet)  │  │
│  │   (app.agencytoolkit.com)│       │   (GHL sub-accounts receive)       │  │
│  ├──────────────────────┤       ├────────────────────────────────────┤  │
│  │ • Agency signup/login│       │ • Menu customization CSS           │  │
│  │ • Customer CRUD      │       │ • Login page branding              │  │
│  │ • Menu customizer    │       │ • Loading animations               │  │
│  │ • Tour builder       │       │ • Dashboard color theming          │  │
│  │ • Image editor       │       │ • Onboarding tours (Driver.js)     │  │
│  │ • Embed code display │       │ • Agency whitelist detection       │  │
│  └──────────────────────┘       └────────────────────────────────────┘  │
│            │                                   ↑                         │
│            │         ┌─────────────────────────┘                         │
│            ↓         ↓                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  EMBED SNIPPET (Single JS per Agency)                               ││
│  │  <script src="https://app.agencytoolkit.com/embed.js?key=xxx"></script> ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  STANDALONE SERVICES                                                ││
│  ├─────────────────────────────────────────────────────────────────────┤│
│  │ • Image API: img.agencytoolkit.com/t/{id}?name={value}                  ││
│  │ • GBP Dashboard: dashboard.agencytoolkit.com/?token={customer_token}    ││
│  │ • Social Proof Widget: widget.agencytoolkit.com/sp.js?key={agency_key}  ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Iframe Compatibility (Critical for GHL)

All user-facing modules MUST work inside GHL's iframe embedding:

### Requirements for GHL Iframe Embedding

1. **X-Frame-Options:** Must NOT be set, or set to `ALLOWALL`
2. **Content-Security-Policy:** Must include `frame-ancestors *` or specific GHL domains
3. **No localStorage for auth:** Use URL tokens instead (GHL passes `{{location.id}}`)
4. **Responsive design:** GHL iframes vary in size
5. **Dark/Light mode detection:** Match GHL's current theme if possible

### Next.js Headers Configuration

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/embed/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Content-Security-Policy', value: "frame-ancestors *" },
        ],
      },
      {
        source: '/dashboard/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Content-Security-Policy', value: "frame-ancestors *" },
        ],
      },
    ];
  },
};
```

### GHL Custom Menu Link URL Patterns

Agencies will create Custom Menu Links in GHL pointing to Agency Toolkit:

```
# GBP Dashboard (per customer)
https://dashboard.agencytoolkit.com/?token={{custom_values.agency_token}}

# Or using location ID directly
https://dashboard.agencytoolkit.com/?location={{location.id}}&agency=rp_abc123
```

---

## Two-Level Token Architecture

```
AGENCY LEVEL (signs up for Agency Toolkit)
├── agency_id: UUID (primary key)
├── clerk_user_id: string (from Clerk)
├── token: "rp_abc123" (used in embed snippet)
│
└── CUSTOMER LEVEL (agency's GHL sub-accounts)
    ├── Bill's Plumbing
    │   ├── customer_id: UUID
    │   ├── token: "bp_xyz789" (used in GBP dashboard URL)
    │   └── ghl_location_id: "abc123" (GHL's sub-account ID)
    │
    ├── Precision Roofing
    │   └── token: "pr_def456"
    │
    └── Mike's HVAC
        └── token: "mh_ghi012"
```

### Token Generation Logic

```typescript
// lib/tokens.ts
import { randomBytes } from 'crypto';

export function generateAgencyToken(agencyName: string): string {
  const prefix = agencyName.toLowerCase().replace(/[^a-z]/g, '').slice(0, 2) || 'ag';
  const random = randomBytes(8).toString('hex');
  return `${prefix}_${random}`;
}

export function generateCustomerToken(customerName: string): string {
  const prefix = customerName.toLowerCase().replace(/[^a-z]/g, '').slice(0, 2) || 'cu';
  const random = randomBytes(8).toString('hex');
  return `${prefix}_${random}`;
}
```

---

## Folder Structure

```
agency-toolkit/
├── .env.local                    # Environment variables (gitignored)
├── .env.example                  # Template for env vars
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── components.json               # shadcn/ui configuration
├── middleware.ts                 # Clerk auth middleware
│
├── app/
│   ├── layout.tsx                # Root layout with ClerkProvider
│   ├── page.tsx                  # Landing page (public)
│   ├── globals.css               # Global styles + Tailwind
│   │
│   ├── (auth)/                   # Auth routes (grouped)
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   │
│   ├── (dashboard)/              # Protected admin routes
│   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   ├── dashboard/page.tsx    # Overview stats
│   │   ├── customers/
│   │   │   ├── page.tsx          # Customer list
│   │   │   └── [id]/page.tsx     # Customer detail/edit
│   │   ├── menu/page.tsx         # Menu customizer
│   │   ├── login/page.tsx        # Login customizer
│   │   ├── loading/page.tsx      # Loading animations
│   │   ├── colors/page.tsx       # Dashboard colors
│   │   ├── tours/
│   │   │   ├── page.tsx          # Tour list
│   │   │   └── [id]/page.tsx     # Tour builder
│   │   ├── images/
│   │   │   ├── page.tsx          # Image template list
│   │   │   └── [id]/page.tsx     # Image editor
│   │   └── settings/page.tsx     # Agency settings
│   │
│   ├── (embed)/                  # Iframe-embeddable routes
│   │   ├── dashboard/page.tsx    # GBP Dashboard (customer-facing)
│   │   └── layout.tsx            # Minimal layout for embeds
│   │
│   ├── api/
│   │   ├── config/route.ts       # GET config for embed script
│   │   ├── customers/route.ts    # CRUD for customers
│   │   ├── tours/route.ts        # Tour configurations
│   │   ├── webhooks/
│   │   │   └── clerk/route.ts    # Clerk webhook handler
│   │   └── og/
│   │       └── [templateId]/route.ts  # Dynamic image generation
│   │
│   └── embed.js/route.ts         # Dynamic JS embed script
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── dashboard/                # Dashboard-specific components
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── customer-card.tsx
│   ├── editors/                  # Visual editors
│   │   ├── menu-customizer.tsx
│   │   ├── tour-builder.tsx
│   │   └── image-editor.tsx
│   └── embed/                    # Components for embed views
│       └── gbp-dashboard.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── admin.ts              # Service role client
│   ├── tokens.ts                 # Token generation
│   ├── utils.ts                  # General utilities
│   └── constants.ts              # App constants
│
├── types/
│   └── database.ts               # Supabase generated types
│
└── public/
    ├── animations/               # CSS animation files
    └── fonts/                    # Self-hosted fonts for images
```

---

## Environment Variables

```bash
# .env.example

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Agency Toolkit"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# Cloudflare R2 (for image storage)
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=agency-toolkit-images
R2_PUBLIC_URL=https://images.agencytoolkit.com

# Optional: Analytics
NEXT_PUBLIC_POSTHOG_KEY=xxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## User Experience Principles

### For Agency Owners (Admin Dashboard)

1. **Progressive disclosure:** Don't overwhelm with all options at once
2. **Helpful defaults:** Pre-configure sensible starting points
3. **Inline help:** Every complex field has a tooltip or help link
4. **Copy-paste ready:** Embed codes, URLs, etc. have one-click copy
5. **Visual feedback:** Show previews of customizations in real-time
6. **Error prevention:** Validate inputs before save, confirm destructive actions

### For End Users (GHL Sub-account Users)

1. **Invisible when working:** Customizations should feel native to GHL
2. **Non-intrusive tours:** Only show once, easy to dismiss, remember completion
3. **Fast loading:** Embed script must not slow down GHL
4. **Graceful degradation:** If something fails, GHL works normally

### API Key/Credential Input Pattern

When agencies need to enter API keys or credentials (e.g., GBP Place ID):

```tsx
// Example: GBP Place ID input with helpful guidance
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      Google Business Profile
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <p>Connect your customer's GBP to display review stats in their dashboard.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <div>
        <Label htmlFor="placeId">Place ID</Label>
        <Input 
          id="placeId" 
          placeholder="ChIJ..." 
          value={placeId}
          onChange={(e) => setPlaceId(e.target.value)}
        />
        <p className="text-sm text-muted-foreground mt-1">
          Don't know your Place ID?{' '}
          <a 
            href="https://developers.google.com/maps/documentation/places/web-service/place-id" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            Find it here →
          </a>
        </p>
      </div>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          You can find the Place ID by searching for the business on Google Maps, 
          clicking "Share", and copying the ID from the URL.
        </AlertDescription>
      </Alert>
    </div>
  </CardContent>
</Card>
```

---

## Module Priority & Dependencies

```
Week 1: Foundation
└── Module 2: Admin Dashboard (Shell) ← CRITICAL PATH
    ├── Clerk auth setup
    ├── Supabase schema
    ├── Basic CRUD
    └── Embed code display

Week 2: Quick Wins (MVP)
├── Module 3: Login Customizer
├── Module 4: Loading Animations  
└── Module 5: Dashboard Colors

Week 3: Tours
└── Module 6: Onboarding Tours

Week 4: Images
└── Module 7: Image Personalization

Week 5: Integrations
├── Module 8: GBP Dashboard
└── Module 9: Social Proof Widget
```

---

## Pricing Tiers

| Feature | Toolkit ($19/mo) | Pro ($39/mo) |
|---------|------------------|--------------|
| Menu Customizer | ✅ | ✅ |
| Login Customizer | ✅ | ✅ |
| Loading Animations | ✅ | ✅ |
| Dashboard Colors | ✅ | ✅ |
| Onboarding Tours | ❌ | ✅ |
| Image Personalization | ❌ | ✅ |
| GBP Dashboard | ❌ | ✅ |
| Social Proof Widget | ❌ | ✅ |
| Customers Limit | 25 | Unlimited |

Implement feature gating via `agency.plan` field in database.

---

## Development Commands

```bash
# Initial setup
pnpm create next-app@latest agency-toolkit --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd agency-toolkit

# Install dependencies
pnpm add @clerk/nextjs@latest
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add sharp
pnpm add driver.js

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

---

## Next Steps

See the following context files for detailed specifications:

1. **DATABASE.md** - Complete Supabase schema with RLS policies
2. **API.md** - All API routes with request/response types
3. **COMPONENTS.md** - React component specifications
4. **FEATURES.md** - Kanban-ready feature cards for Automaker
