# UI Style Guide - Agency Toolkit

This document captures UI element specifications from GHL for consistent styling in Agency Toolkit.

---

## Toast / Sonner Notifications

**GHL Success Toast:**
| Property | Value |
|----------|-------|
| Background | White (`#ffffff`) |
| Border | Light gray (`#e5e7eb`) |
| Border radius | ~8px |
| Shadow | Subtle drop shadow |
| Icon | Green checkmark in circle |
| Icon color | Green (`#22c55e` or `#16a34a`) |
| Text | Dark gray (`#1f2937`) |
| Text size | ~14px |
| Close button | X icon, gray |
| Position | Top right |

**Note:** User wants option to customize GHL toast colors in Theme Builder (see Backlog).

---

## Badges

**Status Badge (e.g., "Closed (Won)"):**
| Property | Value |
|----------|-------|
| Background | Light gray/blue tint (`#f1f5f9` or `#e0e7ff`) |
| Border | 1px solid light blue/gray (`#c7d2fe` or `#cbd5e1`) |
| Border radius | Full rounded (pill shape, ~9999px) |
| Text color | Gray/blue (`#64748b` or `#6366f1`) |
| Text size | ~12px |
| Padding | ~4px 12px |
| Font weight | Medium (500) |

**Pro Badge (Agency Toolkit):**
- Use same style as GHL status badge
- Colors: Match the "Closed (Won)" badge styling
- Border: Outlined style

---

## Buttons

### Primary Button (Blue filled)
**Examples:** "Create Sub-Account", "Sign Out Everywhere", "Update Password"

| Property | Value |
|----------|-------|
| Background | Blue (`#3b82f6` or `#2563eb`) |
| Background hover | Darker blue (`#2563eb` or `#1d4ed8`) |
| Text color | White (`#ffffff`) |
| Border radius | ~6-8px |
| Padding | ~8px 16px |
| Font weight | Medium (500) |
| Font size | ~14px |

**Variations observed:**
- "Update Password" - Lighter blue (`#818cf8` / indigo-400)
- "Sign Out Everywhere" - Standard blue (`#3b82f6`)
- "Create Sub-Account" - Standard blue with icon (`#3b82f6`)

### Secondary Button (White/Outline)
**Example:** "View Scheduled Reports"

| Property | Value |
|----------|-------|
| Background | White (`#ffffff`) |
| Border | 1px solid gray (`#d1d5db` or `#e5e7eb`) |
| Text color | Dark gray (`#374151`) |
| Border radius | ~6-8px |
| Padding | ~8px 16px |
| Font weight | Medium (500) |
| Hover | Light gray background (`#f9fafb`) |

### Button with Icon
- Icon positioned left of text
- Icon size: ~16px (h-4 w-4)
- Gap between icon and text: ~8px

---

## Color Reference (from screenshots)

### Blues
| Name | Hex | Usage |
|------|-----|-------|
| Primary Blue | `#3b82f6` | Primary buttons, links |
| Dark Blue | `#2563eb` | Button hover, emphasis |
| Indigo | `#818cf8` | Secondary actions (Update Password) |
| Light Blue | `#dbeafe` | Backgrounds, highlights |

### Greens
| Name | Hex | Usage |
|------|-----|-------|
| Success Green | `#22c55e` | Toast icons, success states |
| Dark Green | `#16a34a` | Success hover |

### Grays
| Name | Hex | Usage |
|------|-----|-------|
| Gray 900 | `#111827` | Dark backgrounds |
| Gray 700 | `#374151` | Primary text |
| Gray 500 | `#6b7280` | Secondary text, icons |
| Gray 300 | `#d1d5db` | Borders |
| Gray 100 | `#f3f4f6` | Light backgrounds |

---

## Header Icons (Top Right)

From screenshot showing colored circular icons:
| Icon | Background Color | Approx Hex |
|------|------------------|------------|
| Purple/Blue | Indigo | `#6366f1` |
| Green | Green | `#22c55e` |
| Red/Orange | Red | `#ef4444` |
| Orange | Orange | `#f97316` |
| Teal/Cyan | Cyan | `#06b6d4` |
| Avatar | Gray | `#9ca3af` |

---

*Document created: January 17, 2026*
*Last updated: January 17, 2026*
