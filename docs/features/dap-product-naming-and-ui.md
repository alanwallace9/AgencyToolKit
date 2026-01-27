# Digital Adoption Platform: Naming & UI Direction

**Date:** 2026-01-26
**Status:** Decision Made - Product name is **Guidely**
**Left Nav:** Separate implementation session in progress

---

## Background

Agency Toolkit includes a Digital Adoption Platform (DAP) module that currently lives under `/tours`. As the feature set has expanded beyond just tours (now including checklists, smart tips, banners), we need:

1. **A product name** for the DAP that can work as a sub-brand now and standalone later
2. **A UI restructure** to accommodate multiple feature types with consistent UX

### Origin Story

When Usetiful was acquired, we needed a replacement for Rapid Reviews (GHL review management). Agency Toolkit was born to provide:
- Visual customization (menu, login, loading, colors)
- Digital adoption (tours, checklists, tips, banners)
- Image personalization (like Nifty Images)

All delivered via a single embed script for GoHighLevel agencies.

### Future Vision

- **Now:** Sub-brand within Agency Toolkit ("X by Agency Toolkit")
- **Later:** Standalone SaaS product that can be sold separately
- **Eventually:** Expand beyond GHL to any SaaS platform

---

## Competitive Landscape

### Enterprise Tier ($50K+/year)

| Platform | Focus | Pricing | Notes |
|----------|-------|---------|-------|
| **WalkMe** | Employee training, enterprise digital transformation | Custom (high) | Acquired by SAP. 6+ month implementation. Best for ERP/CRM/HCM. |
| **Pendo** | Product analytics + in-app guidance | $16K-$142K/yr (median $48K) | Started as analytics, added guidance. Popular with product-led SaaS. |
| **Whatfix** | Enterprise onboarding with dedicated support | Custom | Robust flows, hands-on assistance. Enterprise scale. |

### Mid-Market ($3K-$30K/year)

| Platform | Focus | Pricing | Notes |
|----------|-------|---------|-------|
| **Userpilot** | Analytics-focused product growth | $249/mo+ | Strong analytics, session replay. Steeper learning curve. |
| **Chameleon** | Deep customization, native-looking UX | $279/mo+ (~$31K/yr median) | Best for design-conscious teams. Requires some dev work. |
| **Appcues** | Quick deployment, mobile support | $375/mo+ | Fastest to go live. Chrome extension builder. Mobile-native. |

### SMB/Startup Tier (Under $3K/year)

| Platform | Focus | Pricing | Notes |
|----------|-------|---------|-------|
| **UserGuiding** | Budget-friendly, non-technical teams | $174/mo | Best low-cost option. No-code builder. |
| **Usetiful** | Affordable, beginner-friendly | Free / €29-€69/mo | Simple, affordable. Limited customization. Recently acquired. |
| **Apty** | Business users, goal-based workflows | Custom | Built-in analytics, independent content creation. |

### Our Positioning

**Agency Toolkit DAP** fits in the SMB/Startup tier with unique advantages:

| Differentiator | Us | Others |
|----------------|-----|--------|
| GHL-native (no extension) | ✅ | ❌ Most require extensions |
| Single embed script | ✅ | ❌ Multiple integrations |
| Built for agencies | ✅ | ❌ Generic SaaS focus |
| Review management integration | ✅ | ❌ Not their focus |
| Affordable | ✅ (included in AT) | Varies |

---

## Naming Options

### Evaluation Criteria

- Works as sub-brand: "X by Agency Toolkit"
- Works standalone later: Just "X"
- Not GHL-specific (can expand)
- Memorable and brandable
- Conveys guidance/adoption/journey
- Available domains (ideally)

### Top Candidates

| Name | Sub-Brand | Standalone | Vibe | Domain Ideas |
|------|-----------|------------|------|--------------|
| **Embark** | "Embark by Agency Toolkit" | "Embark" | Beginning a journey, fresh start | getembark.io, embarkapp.com |
| **Pathways** | "Pathways by Agency Toolkit" | "Pathways" | Multiple routes to success | usepathways.com, pathways.app |
| **Compass** | "Compass by Agency Toolkit" | "Compass" | Direction, navigation | compassdap.com, getcompass.io |
| **Stride** | "Stride by Agency Toolkit" | "Stride" | Progress, forward motion | usestride.com, stride.app |
| **Waypoint** | "Waypoint by Agency Toolkit" | "Waypoint" | Markers on a journey | waypointapp.com, usewaypoint.io |
| **Pilot** | "Pilot by Agency Toolkit" | "Pilot" | Co-pilot assistance | pilotdap.com, getpilot.io |

### Naming Analysis

**Embark** ⭐ Top Pick
- Strong verb (action-oriented)
- Implies beginning a journey (perfect for onboarding)
- Not overused in the space
- Works well: "Help your customers embark on their journey"
- Clean URL: `/embark/tours`, `/embark/checklists`

**Pathways**
- Implies multiple routes (tours, checklists, tips are different "paths")
- Professional, enterprise-friendly
- Slightly generic

**Compass**
- Strong metaphor (direction)
- Memorable
- Overused in tech (Compass by Atlassian, etc.)

**Stride**
- Fresh, modern
- Implies progress
- Less common in the space

**Waypoint**
- Technical/gaming crossover appeal
- Markers along a journey
- Might be too niche

### Names to Avoid

| Name | Reason |
|------|--------|
| Guide/GuideX | Too generic, many competitors use it |
| Walk/WalkX | WalkMe association |
| Flow/FlowX | Overused in SaaS |
| Adopt/AdoptX | Too literal, sounds clinical |
| Launch | GHL uses "Launch Pad" |

---

## UI/UX Direction

### Current State

```
┌─────────────────────────────────────────────────────────────────┐
│  Logo   Dashboard  Customers  Customize▼  Pro▼  Settings       │ ← Top nav
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Tours                                           [+ New Tour]   │ ← Page header
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Tour Card 1 │  │ Tour Card 2 │  │ Tour Card 3 │             │ ← Cards layout
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Checklists Card                          ││ ← Nested card
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Problems:**
- Top nav + cards wastes vertical space
- Tours, Checklists, Tips, Banners all crammed into one page
- Inconsistent with the 3-column builder pattern we love

### Proposed State (Usetiful-inspired)

```
┌────┬──────────────────────────────────────────────────────────────────────┐
│    │  Logo   Dashboard  Customers  Customize▼  [Embark]  Settings        │
│ 🏠 ├──────────────────────────────────────────────────────────────────────┤
│    │                                                                      │
│ ═══│  Embark                                                              │
│    │  ├── Tours (active)                                                  │
│ 📍 │  ├── Checklists                                                      │
│    │  ├── Smart Tips                                                      │
│ ✓  │  ├── Banners                                                         │
│    │  └── Themes                                                          │
│ 💡 │                                                                      │
│    ├─────────────────┬──────────────────────────────────────┬────────────┤
│ 📢 │  Tours          │  Tour Settings                       │            │
│    │  ───────────    │  ───────────────                     │  PREVIEW   │
│ 🎨 │                 │                                      │            │
│    │  ○ Welcome Tour │  Title: _______________              │  ┌──────┐  │
│ ⚙️ │    3 steps      │                                      │  │      │  │
│    │                 │  Description: _________              │  │ Tour │  │
│    │  ● Dashboard    │                                      │  │ Step │  │
│    │    (selected)   │  Steps:                              │  │      │  │
│    │    5 steps      │  1. Click here                       │  └──────┘  │
│    │                 │  2. Then this                        │            │
│    │  + New Tour     │  3. Finally...                       │            │
│    │                 │                                      │            │
└────┴─────────────────┴──────────────────────────────────────┴────────────┘

Legend:
🏠 = Dashboard (AT home)
📍 = Embark (DAP home) - expands to show Tours, Checklists, etc.
✓  = Checklists (quick access)
💡 = Smart Tips
📢 = Banners
🎨 = Themes
⚙️ = Settings
```

### Key UI Changes

#### 1. Collapsible Icon Sidebar (Products)

```
┌──────┐      ┌────────────────────┐
│  🏠  │      │  🏠  Dashboard     │
│  📍  │  ←→  │  📍  Embark        │
│  🖼️  │      │  🖼️  Images        │
│  ⭐  │      │  ⭐  Social Proof  │
│  ⚙️  │      │  ⚙️  Settings      │
└──────┘      └────────────────────┘
Collapsed      Expanded
```

- Icons only when collapsed (saves space)
- Hover or click to expand
- Shows product names when expanded
- Currently selected product is highlighted

#### 2. Secondary Nav (Feature Types)

When "Embark" (or chosen name) is selected, secondary nav appears:

```
Embark
├── Tours        ← Guided walkthroughs
├── Checklists   ← Task lists
├── Smart Tips   ← Hover tooltips
├── Banners      ← Announcements
└── Themes       ← Shared styling
```

#### 3. Three-Column Builder (Consistent Pattern)

All builders follow the same layout (like current Checklists):

| Left Panel | Center Panel | Right Panel |
|------------|--------------|-------------|
| Items list (sortable) | Item settings | Live preview |
| Add/delete items | Properties, actions | Interactive mockup |
| Search/filter | Completion triggers | Theme applied |

This applies to:
- Tour Builder (steps list → step settings → tour preview)
- Checklist Builder (items list → item settings → widget preview) ✅ Already done
- Smart Tips Builder (tips list → tip settings → tooltip preview)
- Banners Builder (banners list → banner settings → banner preview)

---

## URL Structure

### Current

```
/tours                    → Tours list (with checklists card embedded)
/tours/[id]               → Tour builder
/tours/checklists/[id]    → Checklist builder
/tours/themes             → Themes list
/tours/themes/[id]        → Theme builder
```

### Proposed (with "Embark" as example)

```
# Product Level
/embark                   → Embark dashboard (overview, stats, quick actions)

# Feature Types
/embark/tours             → Tours list
/embark/tours/[id]        → Tour builder (3-column)
/embark/tours/new         → Create tour

/embark/checklists        → Checklists list
/embark/checklists/[id]   → Checklist builder (3-column)
/embark/checklists/new    → Create checklist

/embark/tips              → Smart Tips list
/embark/tips/[id]         → Tip builder (3-column)
/embark/tips/new          → Create tip

/embark/banners           → Banners list
/embark/banners/[id]      → Banner builder (3-column)
/embark/banners/new       → Create banner

/embark/themes            → Themes list (shared across all types)
/embark/themes/[id]       → Theme builder
/embark/themes/new        → Create theme

/embark/analytics         → Analytics dashboard (all types combined)
```

### Alternative URL Patterns

If "Embark" feels too long in URLs:

```
Option A: /embark/tours/[id]      ← Full name
Option B: /e/tours/[id]           ← Abbreviated
Option C: /dap/tours/[id]         ← Generic "DAP"
Option D: /guides/tours/[id]      ← Descriptive
```

Recommendation: Use full name (`/embark/`) - it's readable and establishes the brand.

---

## Embark Dashboard (Product Home)

When user clicks "Embark" in sidebar, they see a dashboard:

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Embark                                                    [+ Quick Create]│
│                                                                            │
│  "Help your customers succeed with guided experiences"                     │
│                                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │  📍 Tours       │  │  ✓ Checklists   │  │  💡 Smart Tips  │            │
│  │  ───────────    │  │  ─────────────  │  │  ─────────────  │            │
│  │  5 Live         │  │  3 Live         │  │  Coming Soon    │            │
│  │  2 Draft        │  │  1 Draft        │  │                 │            │
│  │                 │  │                 │  │  [Notify Me]    │            │
│  │  1,234 views    │  │  89% started    │  │                 │            │
│  │  78% completion │  │  45% completed  │  │                 │            │
│  │                 │  │                 │  │                 │            │
│  │  [View All →]   │  │  [View All →]   │  │                 │            │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│                                                                            │
│  ┌─────────────────┐  ┌─────────────────┐                                 │
│  │  📢 Banners     │  │  🎨 Themes      │                                 │
│  │  ───────────    │  │  ───────────    │                                 │
│  │  Coming Soon    │  │  4 themes       │                                 │
│  │                 │  │                 │                                 │
│  │  [Notify Me]    │  │  [View All →]   │                                 │
│  └─────────────────┘  └─────────────────┘                                 │
│                                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│  Recent Activity                                                           │
│  ─────────────────                                                         │
│  • "Welcome Tour" completed by Acme Plumbing - 2 min ago                  │
│  • "Getting Started" checklist started by Joe's HVAC - 15 min ago         │
│  • New tour "Feature Highlight" created - 1 hour ago                      │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Foundation (This Session?)
1. ✅ Document naming options and UI direction (this file)
2. Decide on product name
3. Create sidebar component with collapsible icons
4. Set up route structure (`/[product-name]/...`)

### Phase 2: UI Restructure
1. Move Tours from `/tours` to `/[product-name]/tours`
2. Move Checklists from `/tours/checklists` to `/[product-name]/checklists`
3. Create product dashboard page
4. Update navigation components

### Phase 3: Builder Consistency
1. Update Tour Builder to match Checklist Builder's 3-column layout
2. Implement Smart Tips Builder (3-column)
3. Implement Banners Builder (3-column)

### Phase 4: Polish
1. Add analytics dashboard
2. Refine sidebar interactions (hover states, tooltips)
3. Mobile responsive sidebar (sheet on mobile)

---

## Decisions Made (2026-01-26)

### 1. Product Name

**Decision: Guidely**

- [x] **Guidely** ← Selected
- [ ] Embark
- [ ] Pathways
- [ ] Compass
- [ ] Stride
- [ ] Waypoint
- [ ] Pilot

### 2. URL Structure

TBD - Left Nav implementation session will define routes.

### 3. Implementation Priority

- [x] Build Left Nav structure first (separate session)
- [x] Then build Smart Tips (Features 28-29) using new structure
- [x] Individual tips (not grouped into sets)

---

## Sources

- [Whatfix: 13 Best Digital Adoption Platforms in 2026](https://whatfix.com/blog/best-digital-adoption-platforms/)
- [G2: Best Digital Adoption Platforms](https://learn.g2.com/best-digital-adoption-platform)
- [Gartner Peer Insights: Digital Adoption Platforms](https://www.gartner.com/reviews/market/digital-adoption-platforms)
- [UserGuiding: Usetiful Alternatives](https://userguiding.com/blog/usetiful-alternatives-competitors)
- [Chameleon: Appcues vs Userpilot vs Chameleon](https://www.chameleon.io/alternative/appcues-vs-userpilot-vs-chameleon)
- [Userpilot: Pendo vs WalkMe](https://userpilot.com/blog/pendo-vs-walkme/)
