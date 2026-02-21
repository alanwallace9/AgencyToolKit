# Personalized Images — Post-Ship Improvements

> Captured from testing session 2026-02-21. These are NOT shipping blockers — ship MVP first, then address methodically.

---

## P1: Add Customer to Existing Template (High)

**Problem:** Once a template is created without a customer/sub-account attached, there's no way to go back and add one. The customer association is only available during creation.

**Solution:** Add a customer selector in the editor (e.g., in the properties panel or a settings section), or add "Assign Customer" to the card actions menu on the list page.

---

## P2: Rename Template (High)

**Problem:** No rename UI anywhere — not on the card actions menu (only Edit, Open Preview, Duplicate), and not inside the editor. Users are stuck with whatever name they set at creation.

**Solution:** Add inline rename in the editor header (like Guidely builders have — click the title to edit). Also add "Rename" to the card actions dropdown on the list page.

---

## P3: Phone Mockup Previews (Medium)

**Problem:** The iPhone 15 / Samsung / Pixel preview options in the preview modal just render as small plain rectangles. They don't look like actual devices.

**Solution:** Either use proper device frame images (device bezels/mockups — e.g., SVG or PNG frames with the image composited inside) or remove the device selector entirely if the effort isn't worth it.

**Term:** "Device mockup" or "device bezel frame"

---

## P4: Undo Stack Too Shallow + Toast Blocking (Medium)

**Problem:** Undo only goes back ~3 steps. The "auto-saved" toast notification covers the undo button, so users can't keep clicking undo without using Cmd+Z keyboard shortcut.

**Solution:**
- Increase undo stack depth to 10+ states (currently appears to be ~3)
- Move the toast position so it doesn't overlap the undo button, OR use a non-blocking save indicator (inline text like "Saved" instead of a toast)

---

## P5: No Redo Button in Toolbar (Low)

**Problem:** Redo only works via Cmd+Shift+Z keyboard shortcut — there's no visible redo button in the toolbar alongside the undo button.

**Solution:** Add a redo button next to the undo button.

---

## P6: Table View + Stats for Image List (Low)

**Problem:** The `/images` list page only has card view. With many templates, a table view with sortable columns would be more efficient — similar to what Guidely pages have (Tours, Checklists, Tips, Banners).

**Solution:** Add ViewToggle (grid/table) and GuidelyDataTable (or similar) with columns: Name, Customer, Render Count, Last Rendered, Created, Updated. Default to table view like Guidely.

---

## Phase 5: GHL Integration Testing (Deferred)

**Status:** Cannot test yet — need GHL open and test contacts set up.

**When ready, test:**
1. Copy GHL Workflow URL (`?name={{contact.first_name}}`) into GHL email builder image block
2. Send test email to yourself — confirm your name renders in the image
3. Send to a second test contact — confirm their name appears
4. Test in SMS workflow — paste URL, confirm link preview renders
5. Test in a triggered workflow (form submission, tag added, etc.)
6. Bulk test with 3-5 different contacts if possible — confirm each gets unique personalized image
7. Check rendering across email clients: Gmail, Outlook, Apple Mail

**Known considerations:**
- Some email clients strip query params or block external images
- SMS image preview is carrier-dependent
- CDN cache is 24 hours — edits may not reflect immediately in previously cached URLs
