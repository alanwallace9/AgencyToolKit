# Agency Toolkit - Feature Backlog

Features and enhancements for future implementation.

---

## Theme Builder Enhancements

### Save Login Page Template
**Priority:** Medium
**Added:** 2026-01-17

**Description:**
Similar to "My Themes" on the Brand Colors tab, users should be able to save their complete Login Page design as a reusable template.

**Requirements:**
- Save button/option after user finishes customizing login page
- Saves: background settings, form colors, element positions, images/animations
- "My Login Templates" section (like "My Themes")
- Ability to name, select, and delete saved templates
- Thumbnail preview of saved template

**Reference:** Brand Colors tab has "My Themes" with "Create New Theme" dialog - use similar pattern.

---

### GHL Toast/Sonner Customization
**Priority:** Low
**Added:** 2026-01-17

**Description:**
Allow users to customize GHL's toast notification (Sonner) appearance through Theme Builder.

**Customizable properties:**
- Background color
- Border color
- Icon color (success green, error red, etc.)
- Text color
- Border radius
- Position (if GHL allows)

**Reference:** See `docs/UI_STYLE_GUIDE.md` for current GHL toast styling.

**Note:** Need to verify what GHL allows to be customized via CSS injection.

---

## UI Polish

### Pro Badge Styling
**Priority:** Low
**Added:** 2026-01-17

**Description:**
Update Agency Toolkit's "Pro" badge to match GHL's badge styling.

**Specs:**
- Pill shape (full rounded)
- Light background with border
- Use colors from `docs/UI_STYLE_GUIDE.md` badge section

---

### Draggable Gradient Background
**Priority:** Medium
**Added:** 2026-01-17

**Description:**
Allow users to click and drag the background gradient to position it within the canvas (like Canva).

**Problem:**
When a gradient is applied to a preset with a partial background (e.g., left side only), the gradient covers the whole canvas area. Users need to position the gradient within the visible background zone.

**Solution:**
- Click on the background area to select it
- Drag to reposition the gradient origin/offset
- The gradient moves relative to where the user drags
- Works for both solid colors and gradients

**Reference:** Canva background positioning behavior.

---

## Infrastructure & Maintenance

### Automated GHL Selector Monitoring
**Priority:** Medium
**Added:** 2026-01-18

**Description:**
Build an admin panel that automatically monitors GHL's DOM structure for selector changes. When GHL updates their UI (2-3 times per year), this system would detect and alert us to broken selectors.

**Options to explore:**

1. **Admin Health Check Page**
   - Admin-only page in Agency Toolkit dashboard
   - Loads GHL in a sandboxed iframe
   - Runs the discovery script automatically
   - Compares results against `docs/GHL_SELECTORS.md` reference
   - Alerts when selectors have changed

2. **Scheduled Cron Job**
   - Vercel cron or external service (e.g., Checkly, Playwright Cloud)
   - Runs weekly/monthly
   - Uses headless browser to load GHL and extract selectors
   - Sends email/Slack alert when changes detected

3. **User-Reported Monitoring**
   - "Report broken customization" button in dashboard
   - Collects selector data from user's GHL instance
   - Aggregates reports to detect patterns

**Benefits:**
- Proactive detection of GHL UI changes
- Faster response time to fix broken customizations
- Better user experience (no waiting for user reports)

**Reference:** Discovery script at `scripts/ghl-selector-discovery.js`

---

## Future Considerations

### Gradient Presets for Login
- Keep gradient presets since "From Theme" doesn't cover gradients
- Consider adding more gradient options

### Custom Animation Upload (Pro)
- Allow Pro users to upload custom GIF animations for loading screen
- Major differentiator feature

---

*Document created: January 17, 2026*
*Last updated: January 17, 2026*
