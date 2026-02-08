# Help Articles - Session Notes & Next Session Prompt

## What Was Done (Session: Feb 7, 2026)

### Articles Completed (all 22 articles now have full content)

**Getting Started (4) — All were already done, 1 updated:**
- `overview/page.tsx` — What is Agency Toolkit? (was complete)
- `first-customer/page.tsx` — **UPDATED**: Added 4 screenshots from Playwright tests, fixed form to show all 3 fields (Customer Name, GHL Location ID, Google Business Place ID), added Step 4 for customer detail view
- `embed-script/page.tsx` — Installing the embed script (was complete)
- `plans/page.tsx` — Understanding plans (was complete)

**Theme Builder (4) — 1 was done, 3 written from scratch:**
- `menu/page.tsx` — Menu Customizer (was complete)
- `login/page.tsx` — **NEW**: Login Designer — deep article covering canvas editor, 6 presets, 6 element types, keyboard shortcuts, layer controls, background settings (solid/image/gradient), form styling, grid system
- `colors/page.tsx` — **NEW**: Brand Colors — 8 built-in presets, 4 core colors, color harmony suggestions, logo/URL extraction, extended elements, WCAG contrast checker, live preview
- `loading/page.tsx` — **NEW**: Loading Animations — 12 animations across 4 categories (Minimal, Professional, Playful, Creative), customization controls, Compare mode, Try it Live, Favorites system

**Guidely (5) — All written from scratch, each has Pro Feature callout at top:**
- `first-tour/page.tsx` — **NEW**: Creating Your First Tour — full builder walkthrough, 5 step types (Modal, Tooltip, Banner, Hotspot, Slideout), targeting, theme selection, analytics (views/completions/rate)
- `checklists/page.tsx` — **NEW**: Building Checklists — items with 5 completion triggers (Manual, Tour Complete, URL Visited, Element Clicked, JS Event), item actions, widget settings (position, state, CTA), completion actions (confetti/redirect)
- `smart-tips/page.tsx` — **NEW**: Smart Tips — 4 trigger types (Hover, Click, Focus, Delay), beacon configuration (3 styles, positioning, size), display settings, targeting
- `banners/page.tsx` — **NEW**: Banners & Announcements — 2 banner types (Standard, Trial Expiration), 5 style presets, scheduling with timezone, priority/exclusivity, dismissal settings, analytics (views/clicks/CTR/dismissals)
- `themes/page.tsx` — **NEW**: Themes & Styling — system templates vs agency themes, color/typography/button config, feature-specific overrides (tour/tip/banner/checklist), custom CSS, default theme management

**Images (3) — All written from scratch, each has Pro Feature callout:**
- `templates/page.tsx` — **NEW**: Creating Image Templates — upload (drag-drop, URL paste), 3MB/JPG/PNG/WebP limits, auto-naming, customer association, render count tracking
- `editor/page.tsx` — **NEW**: Using the Image Editor — canvas positioning with 9-point grid, 8 Google Fonts, text styling (bold/italic/underline), box background with radius/padding, image controls (fit/fill/flip/zoom), device preview modal, auto-save with undo
- `urls/page.tsx` — **NEW**: Generating Personalized URLs — 3 URL types (test/workflow/HTML), 6 GHL merge tags, usage guides for email/SMS/workflows, trigger link tracking for opens

**TrustSignal (2) — Both written from scratch:**
- `events/page.tsx` — **NEW**: Setting Up Events — 4 verified sources (auto-capture/Google/webhook/Stripe), event data fields, visibility management, bulk actions (show/hide/delete)
- `widget/page.tsx` — **NEW**: Installing the Widget — 4 built-in themes + custom, color customization with presets, timing controls (display/gap/delay), content toggles, URL targeting with wildcards, form capture with custom selectors, active/paused states

**Settings (3) — 1 was done, 2 expanded:**
- `profile/page.tsx` — **NEW**: Profile Settings — agency name (inline edit), email (read-only), plan badge, agency token with copy button
- `excluded/page.tsx` — **EXPANDED**: Excluded Locations — full step-by-step with add/remove workflow, Copy All, troubleshooting tip
- `delete/page.tsx` — Deleting your account (was complete)

### Screenshots Added
- Copied 5 Playwright test screenshots to `public/help/customers/`:
  - `empty-state.png` — Customers page before any customers
  - `add-customer-form.png` — Add Customer dialog with 3 fields
  - `customer-list.png` — Customer list with token, status, actions
  - `customer-detail.png` — Customer detail page with all settings
  - `dashboard.png` — Dashboard overview (not used in articles yet)

### Architecture Notes
- All articles in `app/(dashboard)/help/{category}/{article}/page.tsx`
- Shared components in `app/(dashboard)/help/_components/`:
  - `ArticleLayout` — wrapper with breadcrumbs, related articles, feedback
  - `Callout` — info (blue), tip (amber), warning (red), success (green)
  - `StepSection` — numbered step with circle badge and indented content
  - `Screenshot` — Next.js Image with border, caption, blur placeholder
  - `CodeBlock` — syntax-highlighted code with copy button
- Help page index in `app/(dashboard)/help/page.tsx` with `helpCategories` array
- Article feedback system in `_actions/feedback-actions.ts`
- Recently viewed tracking via localStorage in `_components/recently-viewed.tsx`

---

## Prompt for Next Session

```
I'm building out the knowledge base for Agency Toolkit (a GHL customization SaaS). All 22 help articles have been written with full content — no more "Coming Soon" stubs.

Here's what I'd like to do next to make the knowledge base more comprehensive and professional:

### Context
- Help articles are at `app/(dashboard)/help/{category}/{article}/page.tsx`
- Shared components: `ArticleLayout`, `Callout` (info/tip/warning/success), `StepSection` (numbered steps), `Screenshot` (Next.js Image), `CodeBlock` (with copy button)
- All in `app/(dashboard)/help/_components/`
- Screenshots go in `public/help/{category}/`
- Pro features use `<Callout type="info" title="Pro Feature">` at top
- See `docs/features/feature-help-articles-session-notes.md` for full details of what was built

### What I Want
1. **Screenshots for all articles** — I need to take screenshots of each feature and add them to the articles using the `Screenshot` component. The pattern is: save images to `public/help/{category}/`, then use `<Screenshot src="/help/category/filename.png" alt="description" caption="caption text" />`. The First Customer article already has 4 screenshots as examples. Can you help me identify which screenshots I need for each article and where in the article they should go?

2. **Search functionality** — The search bar on the help index page (`/help`) is currently disabled with a "Search coming soon" tooltip. I'd like to implement client-side search across all articles. The `helpCategories` array in `page.tsx` already has all article titles and URLs. Consider adding descriptions/keywords to make search more useful.

3. **Category landing pages** — Each category has a landing page (e.g., `/help/getting-started/page.tsx`, `/help/theme-builder/page.tsx`) but I haven't checked if they have content or are just stubs. Review these and make them useful overviews of their category with links to all articles.

4. **FAQ sections** — Consider adding FAQ sections to the more complex articles (Login Designer, Tours, TrustSignal Widget) addressing common questions users might have.

5. **Cross-linking improvements** — Review `relatedArticles` on each article and make sure the cross-references make sense and cover the most useful paths between articles.

6. **Help sidebar** — Review `_components/help-sidebar.tsx` and `help-mobile-nav.tsx` to make sure they work well with all the content.

Pick whichever of these you think adds the most value and let me know your plan before starting.
```

---

## File Inventory

### Help Article Files (22 total)
```
app/(dashboard)/help/
├── page.tsx                              # Help index with categories grid
├── layout.tsx                            # Help layout with sidebar
├── _components/
│   ├── article-layout.tsx                # Article wrapper
│   ├── article-feedback.tsx              # Thumbs up/down feedback
│   ├── callout.tsx                       # Info/tip/warning/success boxes
│   ├── code-block.tsx                    # Code with copy button
│   ├── help-breadcrumb.tsx               # Breadcrumb nav
│   ├── help-category.tsx                 # Category component
│   ├── help-layout-client.tsx            # Client layout wrapper
│   ├── help-mobile-nav.tsx               # Mobile navigation
│   ├── help-search.tsx                   # Search component
│   ├── help-sidebar.tsx                  # Desktop sidebar
│   ├── recently-viewed.tsx               # Recently viewed tracking
│   ├── related-articles.tsx              # Related articles section
│   ├── screenshot.tsx                    # Image with caption
│   └── step-section.tsx                  # Numbered step component
├── _actions/
│   └── feedback-actions.ts              # Server action for feedback
├── getting-started/
│   ├── page.tsx                         # Category landing
│   ├── overview/page.tsx                # What is Agency Toolkit?
│   ├── first-customer/page.tsx          # Adding first customer (with screenshots)
│   ├── embed-script/page.tsx            # Installing embed script
│   └── plans/page.tsx                   # Understanding plans
├── theme-builder/
│   ├── page.tsx                         # Category landing
│   ├── menu/page.tsx                    # Menu Customizer
│   ├── login/page.tsx                   # Login Designer
│   ├── colors/page.tsx                  # Brand Colors
│   └── loading/page.tsx                 # Loading Animations
├── guidely/
│   ├── page.tsx                         # Category landing
│   ├── first-tour/page.tsx              # Creating your first tour
│   ├── checklists/page.tsx              # Building checklists
│   ├── smart-tips/page.tsx              # Smart Tips
│   ├── banners/page.tsx                 # Banners & announcements
│   └── themes/page.tsx                  # Themes & styling
├── images/
│   ├── page.tsx                         # Category landing
│   ├── templates/page.tsx               # Creating image templates
│   ├── editor/page.tsx                  # Using the image editor
│   └── urls/page.tsx                    # Generating personalized URLs
├── trustsignal/
│   ├── page.tsx                         # Category landing
│   ├── events/page.tsx                  # Setting up events
│   └── widget/page.tsx                  # Installing the widget
└── settings/
    ├── page.tsx                         # Category landing
    ├── profile/page.tsx                 # Profile settings
    ├── excluded/page.tsx                # Excluded locations
    └── delete/page.tsx                  # Deleting your account
```

### Screenshots (in public/help/)
```
public/help/
└── customers/
    ├── empty-state.png
    ├── add-customer-form.png
    ├── customer-list.png
    ├── customer-detail.png
    └── dashboard.png
```
