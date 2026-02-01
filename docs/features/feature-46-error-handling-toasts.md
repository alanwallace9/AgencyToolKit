# Feature 46: Error Handling & Toasts

**Status:** Ready to Implement
**Priority:** Medium
**Estimate:** 3-4 hours

---

## Overview

Implement comprehensive error handling across the app with user-friendly error messages, loading states, error boundaries, and consistent toast patterns. This is a polish feature to improve UX resilience.

---

## Current State Analysis

### What Exists
- **Toasts**: Sonner is installed and used inconsistently (~50+ toast calls across app)
- **API Errors**: Basic error handling with generic messages like "Internal server error"
- **Loading States**: Inline loading spinners in some components (Loader2 icon)

### What's Missing
- **Error Boundaries**: No `error.tsx` files (Next.js catches but shows default error UI)
- **Loading UI**: No `loading.tsx` files (no skeleton/loading states during navigation)
- **Consistent Patterns**: Toast usage varies (some actions have toasts, some don't)
- **Retry Mechanisms**: No retry buttons on failed requests
- **Offline Handling**: No detection of network issues

---

## Implementation Plan

### 1. Error Boundaries (Next.js App Router)

Create `error.tsx` files at key route levels:

```
app/
├── error.tsx                    # Global fallback
├── (dashboard)/
│   ├── error.tsx               # Dashboard-level errors
│   ├── settings/error.tsx      # Settings errors
│   ├── customers/error.tsx     # Customers errors
│   └── g/error.tsx             # Guidely errors
```

**Error UI Features:**
- Friendly error message (not technical jargon)
- "Try Again" button (calls `reset()`)
- "Go Back" button (navigation fallback)
- Option to report issue (future: link to support)
- Different styling for different error types

### 2. Loading States (Next.js App Router)

Create `loading.tsx` files with skeleton UIs:

```
app/
├── (dashboard)/
│   ├── loading.tsx             # Dashboard loading skeleton
│   ├── settings/loading.tsx    # Settings loading
│   ├── customers/loading.tsx   # Customers list skeleton
│   └── g/loading.tsx           # Guidely loading
```

**Loading UI Features:**
- Skeleton cards matching actual layout
- Subtle pulse animation
- Consistent with page structure

### 3. Toast Standardization

#### Toast Types & When to Use

| Type | Use Case | Duration |
|------|----------|----------|
| `toast.success()` | Action completed (save, delete, copy) | 3s |
| `toast.error()` | Action failed (with description) | 5s |
| `toast.info()` | Informational (no action needed) | 3s |
| `toast.warning()` | Caution (action may have consequences) | 4s |
| `toast.loading()` | Long-running operation | Until dismissed |

#### Toast Message Guidelines
- **Success**: Past tense, specific ("Customer saved" not "Success")
- **Error**: What happened + what to do ("Failed to save. Please try again.")
- **Info**: Present tense, neutral ("Changes will take effect on reload")

#### Actions Requiring Toasts (Audit)

| Area | Action | Toast Type | Current |
|------|--------|------------|---------|
| Settings | Save profile | success | ✅ |
| Settings | Delete account | success | ✅ |
| Settings | Add excluded location | success | ✅ |
| Customers | Create customer | success | ❌ Missing |
| Customers | Delete customer | success | ❌ Missing |
| Customers | Export CSV | success | ✅ |
| Menu | Save preset | success | ✅ |
| Menu | Delete preset | success | ❌ Check |
| Tours | Create tour | success | ❌ Check |
| Tours | Publish tour | success | ❌ Check |
| Images | Save template | success | ❌ Check |
| All | Copy to clipboard | success | Mixed |
| All | API errors | error | Mixed |

### 4. API Error Messages

Transform technical errors into user-friendly messages:

| Technical Error | User Message |
|-----------------|--------------|
| `401 Unauthorized` | "Please sign in to continue" |
| `403 Forbidden` | "You don't have permission to do this" |
| `404 Not Found` | "[Resource] not found" |
| `409 Conflict` | "This [resource] already exists" |
| `422 Validation` | Specific field error |
| `429 Rate Limited` | "Too many requests. Please wait a moment." |
| `500 Server Error` | "Something went wrong. Please try again." |
| `Network Error` | "Unable to connect. Check your internet connection." |

### 5. Utility Functions

Create `lib/error-handling.ts`:

```typescript
// Transform API errors to user-friendly messages
export function getUserFriendlyError(error: unknown): string

// Wrapper for async operations with toast feedback
export async function withToast<T>(
  promise: Promise<T>,
  options: {
    loading?: string;
    success?: string;
    error?: string;
  }
): Promise<T>

// Check if error is network-related
export function isNetworkError(error: unknown): boolean
```

---

## Files to Create/Modify

### New Files

```
app/
├── error.tsx                           # Global error boundary
├── (dashboard)/
│   ├── error.tsx                       # Dashboard error boundary
│   ├── loading.tsx                     # Dashboard loading skeleton
│   ├── settings/
│   │   ├── error.tsx
│   │   └── loading.tsx
│   ├── customers/
│   │   ├── error.tsx
│   │   └── loading.tsx
│   └── g/
│       ├── error.tsx
│       └── loading.tsx

lib/
└── error-handling.ts                   # Error utilities

components/shared/
├── error-fallback.tsx                  # Reusable error UI component
└── loading-skeleton.tsx                # Reusable skeleton components
```

### Files to Audit & Update (Toast Consistency)

- `app/(dashboard)/customers/_components/customers-client.tsx`
- `app/(dashboard)/customers/_components/add-customer-dialog.tsx`
- `app/(dashboard)/customers/_components/delete-customer-dialog.tsx`
- `app/(dashboard)/menu/_components/*.tsx`
- `app/(dashboard)/g/tours/_components/*.tsx`
- `app/(dashboard)/g/checklists/_components/*.tsx`
- `app/(dashboard)/g/banners/_components/*.tsx`
- `app/(dashboard)/g/tips/_components/*.tsx`
- `app/(dashboard)/images/_components/*.tsx`

---

## Key Decisions (Confirmed)

| Decision | Choice |
|----------|--------|
| Error details | **Hidden** - Show error code only, no technical details exposed |
| Loading skeletons | **Match layout** - Skeletons should match actual page structure |
| Toast durations | **3s success, 5s error** |
| Error tracking | **Database** - Store in `error_logs` table with unique codes |

---

## Error Boundary UI Design

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              ⚠️  Something went wrong               │
│                                                     │
│     We couldn't load this page. This might be       │
│     a temporary issue.                              │
│                                                     │
│     ┌─────────────┐  ┌─────────────┐               │
│     │  Try Again  │  │   Go Back   │               │
│     └─────────────┘  └─────────────┘               │
│                                                     │
│     ─────────────────────────────────────          │
│     Error code: ERR-ABC123                          │
│     Please include this code if reporting.          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Loading Skeleton Design

### Dashboard Loading
```
┌──────────────────────────────────────────┐
│ ████████████  ░░░░░░░░░░░░░░░░░░░░░░░░░ │  <- Header skeleton
├──────────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐        │
│ │ ░░░░░░ │ │ ░░░░░░ │ │ ░░░░░░ │        │  <- Stat cards
│ │ ░░░░░░ │ │ ░░░░░░ │ │ ░░░░░░ │        │
│ └────────┘ └────────┘ └────────┘        │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  │  <- Table rows
│ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  │
│ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  │
│ └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

---

## Acceptance Criteria

- [ ] Global error boundary catches unhandled errors
- [ ] Dashboard routes have error.tsx files
- [ ] Dashboard routes have loading.tsx files with skeletons
- [ ] All CRUD operations show success/error toasts
- [ ] Copy actions show micro-feedback (like profile token)
- [ ] API errors display user-friendly messages
- [ ] Error boundaries have "Try Again" functionality
- [ ] Loading skeletons match actual page layouts
- [ ] Network errors detected and communicated

---

### 6. Error Tracking System

Store errors in database with unique codes for secure reporting.

**Error Code Format:** `ERR-XXXXXX` (6 random alphanumeric characters)

**Database Table: `error_logs`**
```sql
CREATE TABLE error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  error_code TEXT UNIQUE NOT NULL,        -- ERR-ABC123
  error_message TEXT NOT NULL,            -- Technical error message
  error_stack TEXT,                       -- Stack trace
  error_type TEXT,                        -- 'runtime' | 'api' | 'network'
  url TEXT,                               -- Where it occurred
  user_agent TEXT,                        -- Browser info
  agency_id UUID REFERENCES agencies(id), -- If logged in
  metadata JSONB,                         -- Additional context
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**User Experience:**
- User sees: "Something went wrong. Error code: ERR-ABC123"
- User reports code to support
- Developer looks up code in Supabase to see full details

**Developer View:**
- Query `error_logs` table in Supabase dashboard
- Or future: Admin page at `/admin/errors` (backlog)

---

## Out of Scope

- Offline mode / service worker
- External error service (Sentry, LogRocket, etc.)
- Toast customization UI for users
- Retry queuing for failed requests
- Admin UI for viewing errors (use Supabase dashboard for now)

---

## Dependencies

- Sonner (already installed)
- Next.js App Router error/loading conventions
- shadcn/ui Skeleton component (may need to add)

---

## Testing Checklist

1. **Error Boundaries**
   - Trigger error in each route group
   - Verify "Try Again" resets correctly
   - Verify "Go Back" navigates correctly

2. **Loading States**
   - Slow network simulation (throttle in DevTools)
   - Verify skeletons appear during navigation
   - Verify no layout shift when content loads

3. **Toasts**
   - Create/update/delete operations in each module
   - Copy actions throughout app
   - API failures (disconnect network, trigger 500s)

4. **Network Errors**
   - Go offline in DevTools
   - Verify appropriate error message
   - Reconnect and verify recovery
