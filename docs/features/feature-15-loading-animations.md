# Feature 15: Loading Animations Page

## Executive Summary

Loading spinners appear **every time** a GHL sub-account user navigates between pages or waits for data. The default GHL spinner is bland and unmemorable. This is a **branding opportunity** that competitors barely address.

**Our approach:** A gallery of 10 beautiful, pre-built CSS animations that users can preview and select with one click. No code, no CSS knowledge - just pick the one that fits your brand and save.

**Why this matters:**
- Builds brand consistency across the entire GHL experience
- Loading states are seen dozens of times per session
- Subtle polish that separates professional agencies from amateurs
- Easy win - simple to implement, high perceived value

---

## Competitor Analysis

| Feature | HL Pro Tools | Marketer's Toolkit | Extendly | **Agency Toolkit** |
|---------|-------------|-------------------|----------|-------------------|
| Custom loading animation | Limited | Requires CSS | No | **10 pre-built** |
| Live preview | No | No | No | **Yes** |
| One-click selection | No | No | No | **Yes** |
| Color matching | Manual CSS | Manual CSS | No | **Auto-match** |
| No code required | No | No | N/A | **Yes** |

---

## UI Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  Loading Animations                                                 │
│  Choose a loading animation for your sub-accounts                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│  │             │  │             │  │             │  │             ││
│  │  ●  ●  ●    │  │    ◯       │  │   ▮▮▮▮▮    │  │   ◇ → □     ││
│  │ Bouncing    │  │  Spinning   │  │  Progress   │  │  Morphing   ││
│  │   Dots      │  │    Ring     │  │    Bar      │  │   Square    ││
│  │             │  │             │  │             │  │             ││
│  │   [Select]  │  │  ✓ Active   │  │   [Select]  │  │   [Select]  ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘│
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│  │             │  │             │  │             │  │             ││
│  │   □  □      │  │  ═══════   │  │   ♥         │  │   ||||      ││
│  │ Rotating    │  │  Gradient   │  │  Heartbeat  │  │  Wave       ││
│  │  Squares    │  │   Spinner   │  │             │  │   Bars      ││
│  │             │  │             │  │             │  │             ││
│  │   [Select]  │  │   [Select]  │  │   [Select]  │  │   [Select]  ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘│
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐                                  │
│  │             │  │             │   COLOR SETTINGS                 │
│  │    •        │  │  ○ ○ ○     │   ┌────────────────────────────┐ │
│  │  Pulse      │  │  Orbiting   │   │ Animation Color: [■ #3b82f6]│ │
│  │   Dot       │  │    Dots     │   │                            │ │
│  │             │  │             │   │ ☐ Use primary brand color  │ │
│  │   [Select]  │  │   [Select]  │   │   (from Dashboard Colors)  │ │
│  └─────────────┘  └─────────────┘   └────────────────────────────┘ │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ PREVIEW                                            [Full Page]│  │
│  │                                                               │  │
│  │                       ◯                                       │  │
│  │                   (Live animation plays)                      │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│                                           [Save Changes]            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Animation Gallery

| Animation | Description | Visual Style |
|-----------|-------------|--------------|
| **Pulse Dot** | Simple pulsing circle | Minimal, clean |
| **Spinning Ring** | Rotating ring border | Classic, professional |
| **Bouncing Dots** | Three bouncing dots | Playful, modern |
| **Progress Bar** | Animated progress bar | Technical, loading feel |
| **Morphing Square** | Shape-shifting square | Dynamic, creative |
| **Rotating Squares** | Two rotating squares | Geometric, modern |
| **Gradient Spinner** | Gradient colored spinner | Colorful, eye-catching |
| **Heartbeat** | Pulsing heart animation | Friendly, personal |
| **Wave Bars** | Equalizer-style bars | Music/media feel |
| **Orbiting Dots** | Dots orbiting center | Tech, futuristic |

---

## Data Model

```typescript
// In agency.settings (existing)
interface LoadingConfig {
  animation_id: string;      // One of the 10 animation IDs
  custom_color?: string;     // Override color (hex)
  use_brand_color?: boolean; // Use primary from ColorConfig
}

// Animation definition
interface LoadingAnimation {
  id: string;
  label: string;
  description: string;
  css: string;              // The CSS animation code
  html: string;             // The HTML structure needed
}
```

---

## User Flow

```
1. User navigates to /loading
   ↓
2. Sees gallery of 10 animations (cards playing live)
   ↓
3. Hovers over card → Animation plays in larger preview below
   ↓
4. Clicks "Select" on desired animation → Card shows ✓ Active
   ↓
5. Optionally sets custom color or checks "Use brand color"
   ↓
6. Clicks "Save Changes" → Toast: "Loading animation saved!"
   ↓
   Done - Embed script will now inject this animation
```

---

## Technical Implementation

### CSS Animations
- Pure CSS animations (no JavaScript dependencies)
- Each animation is self-contained CSS + minimal HTML
- Stored as constants in `lib/constants.ts`
- CSS uses CSS variables for color customization: `var(--loading-color, #3b82f6)`

### Animation Injection (Embed Script)
```javascript
// In embed.js
function applyLoadingAnimation(config) {
  // Hide default GHL spinner
  const defaultSpinner = document.querySelector('.loading-spinner, .loader');
  if (defaultSpinner) defaultSpinner.style.display = 'none';

  // Inject custom animation CSS
  const style = document.createElement('style');
  style.id = 'agency-toolkit-loading';
  style.textContent = config.loading.css.replace(
    'var(--loading-color)',
    config.loading.custom_color || config.colors?.primary || '#3b82f6'
  );
  document.head.appendChild(style);

  // Replace HTML structure
  // ... inject the animation HTML
}
```

### Preview Component
- Cards show live animations using the actual CSS
- Large preview area below shows selected animation at full size
- "Full Page" button opens modal with full-screen preview
- Animations play on loop

---

## Files to Create

| File | Purpose |
|------|---------|
| `loading/page.tsx` | Server component, fetches current setting |
| `loading/_components/loading-client.tsx` | Main client component |
| `loading/_components/animation-card.tsx` | Individual animation preview card |
| `loading/_components/animation-preview.tsx` | Large preview area |
| `loading/_components/color-settings.tsx` | Color picker + brand toggle |
| `loading/_actions/loading-actions.ts` | Server actions to save |
| `lib/loading-animations.ts` | All 10 animation definitions (CSS + HTML) |

---

## Database

No new tables needed. Uses existing `agencies.settings.loading`:

```typescript
// Already defined in types/database.ts
interface LoadingConfig {
  animation_id: string;
  custom_css: string | null;  // We'll also use this for custom colors
}

// Extend to:
interface LoadingConfig {
  animation_id: string;
  custom_color?: string;
  use_brand_color?: boolean;
}
```

---

## Success Metrics

- User can select animation in **under 30 seconds**
- All 10 animations render correctly
- Live preview works on hover/selection
- Color customization applies correctly
- Embed script successfully replaces GHL default spinner

---

## Implementation Order

1. **Add animation definitions** to `lib/loading-animations.ts` (CSS + HTML for each)
2. **Create page shell** with server data fetching
3. **Build animation cards** with live preview
4. **Add large preview area** with animation player
5. **Add color settings** component
6. **Create server actions** for saving
7. **Update embed script** to inject animation CSS
8. **Test** in GHL iframe environment

---

## Design Notes

- Cards should have subtle hover states (scale up slightly)
- Active card should have clear visual indicator (checkmark, border)
- Animations should be smooth and professional - avoid janky or cheap-looking ones
- Color picker should support transparency for overlays
- Preview should accurately represent what users will see in GHL

---

## Polish Items - Remaining (Jan 11, 2026)

### Slider Alignment
- Both Speed and Size sliders should have 1x visually centered
- **Fix**: Adjust ranges so 1x is in the middle of both (e.g., 0.5-2x for both)

### Wave Bars Animation
- At 1x speed, still too fast
- **Fix**: Slow down base animation durations further (double or more)

### Grid Slide Animation - SPECIFIC REQUIREMENTS
Grid positions: `1 2 3 / 4 5 6 / 7 8 9`

**Sequence (continuous loop, NO reappearing):**
1. Start: Position 5 (center) is EMPTY
2. Position 4 (center-left) slides RIGHT into 5 → now 4 is empty
3. Position 7 (bottom-left) slides UP into 4 → now 7 is empty
4. Position 8 (bottom-middle) slides LEFT into 7 → now 8 is empty
5. Continue around the grid clockwise
6. When pattern completes and center is empty again, keep looping seamlessly
7. **KEY**: No reappearing, no resetting - continuous sliding motion

### Grid Fold Animation - SPECIFIC REQUIREMENTS
Grid positions: `1 2 3 / 4 5 6 / 7 8 9`

**Fold Phase:**
1. Start: All 9 squares visible
2. Position 7 (bottom-left) folds UP onto position 4 (should look like folding ON TOP)
3. Continue folding around clockwise into the center
4. All outer squares fold into center area

**Unfold Phase:**
1. Center square (5) APPEARS
2. Unfolds DOWN to position 8 (bottom-middle)
3. Unfolds to position 9 (bottom-right)
4. Unfolds UP the right side
5. Continues around back to starting state
6. **KEY**: Should unfold in reverse order, not just reappear

**Speed**: Too fast at 1x - slow down base animation

### Notes
- CSS-only animations (no JavaScript randomization needed for now)
- User is okay with deterministic patterns

---

## Open Questions

1. Should we allow users to upload custom animations (CSS)?
2. Do we need different animations for different contexts (page load vs. data fetch)?
3. Should we include branded animations (with logo) as a Pro feature?

---

## Sources

- [Loading.io](https://loading.io/css/) - CSS animation inspiration
- [SpinKit](https://tobiasahlin.com/spinkit/) - Simple CSS spinners
- [CSS-Tricks: Spinners](https://css-tricks.com/snippets/css/css-only-loading-spinner/)
