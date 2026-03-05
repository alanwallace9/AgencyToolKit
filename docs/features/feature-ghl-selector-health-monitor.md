# GHL Selector Health Monitor

**Status:** Backlog
**Priority:** Medium — prevents silent breakage when GHL updates their frontend
**Effort:** Medium (2 sessions)

---

## Executive Plan

### What We're Building
A passive monitoring system that detects when GHL updates their frontend and breaks our CSS selectors — before customers notice. The embed script silently reports health data on every GHL page load (from any user — you or your customers). When something new or broken is detected, an immediate SMS/email alert fires via your GHL workflow, and the admin panel shows a "Copy Fix Prompt" box with a ready-to-paste Claude Code prompt to get it fixed fast.

---

### UI/UX Placement
- New section in `/settings/admin` (existing Admin Panel — super admin only)
- "GHL Webhook URL" field in admin settings for pasting the GHL inbound webhook URL
- Health status table showing all tracked selectors
- Unknown items section (new menu items, new banners GHL added)
- **"Copy Fix Prompt" box** — prominently displayed when issues exist; this is the same content sent in the SMS so you can grab it and paste directly into Claude Code

---

### Key Deliverables

| Component | Description |
|-----------|-------------|
| `/api/selector-health` POST endpoint | Receives passive reports from embed script, stores to DB, fires immediate alert on new issues |
| Embed script health reporter | After applying customizations, silently POSTs what matched vs. didn't, plus any unknown items |
| GHL webhook URL field | Input in admin settings — paste your GHL inbound webhook URL here |
| Admin panel health section | Selector status table, unknown items list, "Acknowledge" button per item |
| "Copy Fix Prompt" box | Visible in admin panel when issues exist — pre-formatted Claude Code prompt with file paths |
| Immediate GHL webhook alert | Fires the moment a new issue is detected — short message only: "GHL selector issue detected. Check Agency Toolkit admin panel." |
| Vercel Cron (5am) | Daily digest only — sends same short message if unacknowledged issues remain |

---

### How Timing Works

**Real-time detection:**
- Customer logs in at noon → embed script runs → unknown `#sb_new_item` detected → `/api/selector-health` receives it → immediately fires GHL webhook → you get SMS/email at noon with the fix prompt

**5am cron:**
- Just a daily digest — "You still have 2 unacknowledged issues from yesterday" — useful if you missed the noon alert or want a morning summary

**Result:** You know the moment anything breaks, regardless of when it's first detected.

---

### Order of Operations
1. **Admin settings** — add GHL webhook URL field (needed before alerts can fire)
2. **DB tables** — `selector_health_events` + `selector_unknown_items`
3. **`/api/selector-health` POST endpoint** — receives reports, stores them, fires webhook on new issues (must be added to public routes in `proxy.ts`)
4. **Embed script reporter** — fire-and-forget POST after customizations apply
5. **Admin panel health view** — selector table, unknown items, acknowledge button, last-checked timestamp
6. **"Copy Fix Prompt" generator** — formats issues into a structured Claude Code prompt with file paths
7. **Vercel Cron** — 5am daily digest for unacknowledged issues

---

### Database Changes

**New table: `selector_health_events`**
```
agency_id, selector, matched (bool), match_count, page_url, location_id, created_at
```

**New table: `selector_unknown_items`**
```
agency_id, item_type ('menu_item' | 'banner'), identifier, first_seen, last_seen, seen_count, acknowledged (bool)
```

---

### Key Decisions

| Decision | Choice |
|----------|--------|
| Notification channel | GHL inbound webhook → your existing GHL SMS/email workflow. No Twilio/Resend. |
| Alert timing | **Immediate** — fires the moment a new issue is first detected, not on a schedule |
| 5am cron | Daily digest only — not the primary alert mechanism |
| Unknown item threshold | Alert on **first detection** — no N-times buffer |
| Nav badge | Skip — SMS directs you to admin panel; no need for extra UI noise |
| Admin visibility | Super admin only — already enforced on existing Admin Panel |
| GitHub Actions proactive scan | **Backlog** — passive collection sufficient for now |

---

### Scope Boundaries

| In Scope | Out of Scope |
|----------|--------------|
| Passive embed script reporting | GitHub Actions proactive scan |
| Known selector match/fail tracking | Auto-fixing selectors |
| Unknown `#sb_*` menu item detection | Per-customer health reporting |
| Unknown banner class detection | Historical trend graphs / charts |
| Admin panel health view | Slack/other notification channels |
| "Copy Fix Prompt" box with file paths | |
| Immediate GHL webhook alert | |
| Vercel Cron 5am daily digest | |
| GHL webhook URL field in admin settings | |
| "Acknowledge" button per unknown item | |
| Last-checked timestamp on admin panel | |

---

### Quick Wins (All Approved)

| Suggestion | Why It Helps | Effort |
|------------|--------------|--------|
| "Acknowledge" button on unknown items | Mark known-harmless items so they stop alerting | Low |
| Last-checked timestamp on admin panel | Confirms the system is actually running | Low |
| Copy prompt includes file paths | Claude Code knows exactly what to open — no hunting | Low |

---

### How to Find Your GHL Inbound Webhook URL

In your GHL agency account:
1. Go to **Automation → Workflows**
2. Create a new workflow (or open existing)
3. Set trigger to **Inbound Webhook**
4. GHL generates a unique webhook URL — copy it
5. Set the workflow action to **Send SMS** or **Send Email** to yourself
6. Use `{{contact.custom_field}}` or the webhook payload body as the message content
7. Paste the webhook URL into Agency Toolkit → Settings → Admin → GHL Webhook URL

Agency Toolkit will POST to this URL with a JSON body containing the alert message and fix prompt text.

---

### Notification Split

- **SMS/GHL alert** — short message only: *"GHL selector issue detected. Check your Agency Toolkit admin panel."* The GHL workflow message body is written by you inside GHL — Agency Toolkit just triggers the webhook.
- **"Copy Fix Prompt" box** — lives in the Agency Toolkit admin panel only. This is where you grab the detailed prompt to paste into Claude Code.

### "Copy Fix Prompt" Format

When issues are detected, the admin panel shows this box:

```
GHL Health Alert — [Date] [Time]

BROKEN SELECTORS (matched 0 elements):
- `.hl_nav-header` — fix in: app/embed.js/route.ts, css-export-card.tsx

NEW UNKNOWN SIDEBAR ITEMS:
- `#sb_ai_tools` — add to: lib/constants.ts → GHL_MENU_ITEMS

NEW UNKNOWN BANNERS:
- `.promo-banner-v2` — add to: app/embed.js/route.ts → applyMenuConfig()

FILES TO UPDATE:
- lib/constants.ts
- app/embed.js/route.ts
- app/(dashboard)/settings/_components/css-export-card.tsx
- docs/GHL_SELECTORS.md
```

---

## Implementation Notes
*(To be filled in when built)*
