# Next Session Prompt

Copy and paste this to resume testing Tour Preview & Runtime features:

---

## Session Prompt

```
I just finished implementing Features 21 (Tour Preview) and 22 (Apply Tours in Embed Script).

Please read the testing guide at docs/sessions/TOUR_PREVIEW_TESTING.md and help me test these features:

1. Tour Editor - creating tours, adding steps (modal + tooltip)
2. Preview Dropdown - Quick Preview, Live Preview, Test All Elements
3. Publishing - confirmation dialog, status change
4. Production Runtime - tours auto-running on GHL pages

My GHL domain is set in Settings. I have the embed script installed.

Walk me through testing each feature and help troubleshoot any issues.
```

---

## Quick Reference

**Key URLs:**
- Tours list: `/tours`
- Tour editor: `/tours/[id]`
- Settings (GHL domain): `/settings`

**What was built:**
- Preview dropdown with 3 options
- Live Preview with draggable toolbar
- Test All Elements validator
- Validation badges on steps
- Production tour runtime in embed.js
- Analytics tracking
- Publish confirmation dialog
- Clickable tour cards

**Testing doc location:** `docs/sessions/TOUR_PREVIEW_TESTING.md`

**Recent commit:** `feat: Tour Preview & Production Runtime (Features 21 & 22)`
