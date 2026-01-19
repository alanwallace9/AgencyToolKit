# Tour Preview & Runtime Testing Guide

**Session Date:** 2026-01-19
**Features:** 21 (Tour Preview) & 22 (Apply Tours in Embed Script)

---

## What Was Built

| Feature | Description | Files |
|---------|-------------|-------|
| **Preview Dropdown** | 3 preview options in one menu (Quick, Live, Test Elements) | `preview-dropdown.tsx` |
| **Live Preview Mode** | Opens GHL with draggable toolbar + Driver.js tour rendering | `embed.js/route.ts` |
| **Test All Elements** | Validates selectors exist on real GHL page, shows results | `element-validator.tsx` |
| **Validation Badges** | Shows found/not found icons next to steps in list | `step-list.tsx` |
| **Production Runtime** | Auto-runs published tours on GHL pages via embed script | `embed.js/route.ts` |
| **Analytics Tracking** | Tracks tour_started, tour_completed, tour_dismissed, step_viewed | `api/tours/analytics/route.ts` |
| **Publish Dialog** | Confirmation dialog before going live | `tour-editor.tsx` |
| **Clickable Tour Cards** | Cards now navigate to editor on click | `tour-card.tsx` |

---

## Prerequisites

1. **GHL Domain** must be set in Settings (required for Live Preview and Element Testing)
2. Have at least one tour with a few steps
3. Embed script installed on your GHL pages

---

## Testing Checklist

### 1. Tour Editor Basics
- [ ] Go to `/tours` page
- [ ] Click "New Tour" to create a tour
- [ ] Click on a tour card to open the editor (cards are now clickable!)
- [ ] Add 2-3 steps (try both **Modal** and **Tooltip** types)
- [ ] For Tooltip steps, click "Select Element" to pick an element from your GHL page
- [ ] Verify auto-save works (status shows "Saved" after changes)

### 2. Preview Dropdown (click "Preview" button in tour editor)

#### Quick Preview
- [ ] Opens a modal simulator showing your tour steps
- [ ] Can navigate through steps with Next/Previous buttons

#### Live Preview (requires GHL domain set)
- [ ] Opens your GHL page in a new tab
- [ ] Orange floating toolbar appears at bottom-right
- [ ] Tour auto-starts with Driver.js popover/tooltips
- [ ] Toolbar shows step count and navigation arrows
- [ ] Toolbar is draggable (grab the 6 dots on the left)
- [ ] "X" button closes the preview mode

#### Test All Elements (requires GHL domain set)
- [ ] Opens a dialog listing all steps with selectors
- [ ] Click "Test All Elements" button → opens GHL page in new tab
- [ ] Each selector is tested against the real page
- [ ] Results show green checkmark (found) or red X (not found)
- [ ] An overlay appears on GHL tab showing summary (X found, Y not found)
- [ ] Validation badges appear in step list next to step titles

### 3. Publishing a Tour
- [ ] Click "Publish" on a tour with steps
- [ ] Confirmation dialog appears showing:
  - Step count
  - URL targeting patterns (if set)
  - Validation results (if tested)
- [ ] Click "Publish Tour" to confirm
- [ ] Status changes to "Live" with success toast
- [ ] Tour card on `/tours` page shows "Live" badge

### 4. Production Runtime (Live Tours on GHL)
After publishing a tour:
- [ ] Visit your GHL page (with embed script installed)
- [ ] Tour should auto-start after ~2 seconds (if targeting matches)
- [ ] Complete the tour by clicking through all steps
- [ ] Refresh page - tour should NOT show again (tracked in localStorage)
- [ ] Check browser console for `[AgencyToolkit]` logs showing:
  - `PREVIEW MODE ACTIVATED` (for preview)
  - `Starting tour: [name]` (for production)
  - `Tour completed: [name]` (when finished)

### 5. Targeting (Optional Advanced Testing)
In the Targeting tab of a tour:
- [ ] Set URL patterns to limit where tour shows
- [ ] Set device targeting (desktop/mobile)
- [ ] Test that the tour only shows on matching pages/devices

---

## Key Files Modified/Created

### New Files
- `app/(dashboard)/tours/[id]/_components/preview-dropdown.tsx`
- `app/(dashboard)/tours/[id]/_components/element-validator.tsx`
- `app/api/tours/analytics/route.ts`
- `lib/tour-engine/theme-presets.ts`
- `lib/tour-engine/state.ts`
- `lib/tour-engine/targeting.ts`
- `lib/tour-engine/index.ts`
- `docs/features/feature-21-tour-preview.md`
- `docs/features/feature-22-apply-tours-embed.md`

### Modified Files
- `app/(dashboard)/tours/[id]/_components/tour-editor.tsx` - Added preview dropdown, validator, publish dialog
- `app/(dashboard)/tours/[id]/_components/step-list.tsx` - Added validation badges
- `app/(dashboard)/tours/_components/tour-card.tsx` - Made cards clickable
- `app/api/config/route.ts` - Added tours and tour_themes to config response
- `app/embed.js/route.ts` - Added ~500 lines for preview mode, validation mode, production runtime, analytics

---

## Troubleshooting

**Live Preview doesn't open:**
- Check that GHL domain is set in Settings
- Ensure the URL is valid (https://app.gohighlevel.com or similar)

**Tour doesn't show on GHL:**
- Check browser console for `[AgencyToolkit]` logs
- Verify tour is published (status = "live")
- Check targeting rules match current page/device
- Clear localStorage if tour was already completed: `localStorage.removeItem('at_tour_[tourId]')`

**Elements not found in validation:**
- Selectors may be dynamically generated - try more stable selectors
- Element might not exist on the page you're testing
- Try testing on the specific GHL page where the element exists
