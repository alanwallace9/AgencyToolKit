'use client';

import { ArticleLayout } from '../../_components/article-layout';
import { Callout } from '../../_components/callout';
import { Screenshot } from '../../_components/screenshot';
import { StepSection } from '../../_components/step-section';

export default function LoadingPage() {
  return (
    <ArticleLayout
      title="Loading Animations"
      description="Replace the default GHL loader with a branded animation"
      breadcrumbs={[
        { label: 'Theme Builder', href: '/help/theme-builder' },
        { label: 'Loading Animations' },
      ]}
      relatedArticles={[
        { title: 'Brand Colors', href: '/help/theme-builder/colors' },
        { title: 'Installing the embed script', href: '/help/getting-started/embed-script' },
      ]}
    >
      <p>
        Replace the default GHL loading spinner with a custom animation that matches
        your brand. Choose from 12 animations across 4 categories, then customize the
        color, speed, size, and background.
      </p>

      <hr />

      <h2>Available Animations</h2>

      <h3>Minimal</h3>
      <ul>
        <li><strong>Pulse Dot</strong> — Simple pulsing circle</li>
        <li><strong>Typing Dots</strong> — iPhone-style typing indicator</li>
      </ul>

      <h3>Professional</h3>
      <ul>
        <li><strong>Spinning Ring</strong> — Rotating ring border</li>
        <li><strong>Progress Bar</strong> — Animated progress bar</li>
        <li><strong>Orbiting Dots</strong> — Dots orbiting a center point</li>
      </ul>

      <h3>Playful</h3>
      <ul>
        <li><strong>Bouncing Dots</strong> — Three bouncing dots</li>
        <li><strong>Heartbeat</strong> — Pulsing heart animation</li>
        <li><strong>Wave Bars</strong> — Audio visualization-style bars</li>
      </ul>

      <h3>Creative</h3>
      <ul>
        <li><strong>Morphing Square</strong> — Shape-shifting square</li>
        <li><strong>Rotating Squares</strong> — Two rotating squares</li>
        <li><strong>Gradient Spinner</strong> — Gradient-colored spinner</li>
        <li><strong>Grid Slide / Grid Rotate / Grid Fold</strong> — 3x3 grid-based animations</li>
      </ul>

      <hr />

      <Screenshot
        src="/help/theme-builder/loading-picker.png"
        alt="Loading Animations page with category tabs, animation grid showing Pulse Dot, Spinning Ring, Bouncing Dots and more, large preview of Grid Rotate, and Animation Settings panel"
        caption="Browse animations by category, preview them live, and customize settings"
        size="lg"
      />

      <StepSection number={1} title="Browse Animations">
        <p>
          The left panel shows all animations in a scrollable grid. Use the category
          tabs at the top to filter:
        </p>
        <ul>
          <li><strong>All</strong> — Every animation</li>
          <li><strong>Favorites</strong> — Your starred animations (with count badge)</li>
          <li><strong>Minimal</strong>, <strong>Playful</strong>, <strong>Professional</strong>, <strong>Creative</strong> — By category</li>
        </ul>
        <p>
          Hover over any animation card to see it play in the large center preview.
        </p>
      </StepSection>

      <hr />

      <StepSection number={2} title="Select &amp; Customize">
        <p>
          Click an animation to select it. Then use the right panel to adjust:
        </p>
        <ul>
          <li><strong>Animation Color</strong> — Pick any color, or toggle <strong>Use Brand Color</strong> to pull your primary color from Brand Colors automatically</li>
          <li><strong>Background Color</strong> — The color behind the animation overlay</li>
          <li><strong>Animation Speed</strong> — 0.5x (slow) to 2x (fast)</li>
          <li><strong>Animation Size</strong> — 0.5x (small) to 2x (large)</li>
        </ul>
        <p>
          Changes preview instantly in the center panel.
        </p>

        <Screenshot
          src="/help/theme-builder/loading-settings.png"
          alt="Animation Settings panel with speed slider, size slider, Use Brand Color toggle, color picker with presets, and background color options"
          caption="Fine-tune speed, size, color, and background for your animation"
          size="sm"
        />

        <Callout type="tip" title="Match your brand">
          Toggle <strong>Use Brand Color</strong> to automatically sync the animation color
          with your primary color from the Brand Colors page. If you change your brand color
          later, the loading animation updates too.
        </Callout>
      </StepSection>

      <hr />

      <StepSection number={3} title="Try It Live">
        <p>
          Click the <strong>Try it Live</strong> button to see a full-screen simulation
          of your loading animation over a GHL dashboard skeleton. The animation plays
          for about 6 seconds, then fades out to reveal the mock dashboard. Press
          <strong> Escape</strong> or click anywhere to close early.
        </p>
      </StepSection>

      <hr />

      <h2>Compare Mode</h2>

      <p>
        Can&apos;t decide between animations? Click the <strong>Compare</strong> button
        to enter compare mode, where you can select up to 3 animations and view them
        side-by-side in the center panel.
      </p>

      <Callout type="info">
        Compare mode disables the &quot;Try it Live&quot; button since it shows
        multiple animations at once. Exit compare mode to use the live preview.
      </Callout>

      <hr />

      <h2>Favorites</h2>

      <p>
        Click the star icon on any animation card to add it to your favorites. Favorites
        persist across sessions and appear in the <strong>Favorites</strong> filter tab
        for quick access.
      </p>

      <hr />

      <h2>Saving</h2>

      <p>
        Your selection and customization settings save automatically. The right panel
        shows a <strong>Currently Active</strong> indicator confirming which animation
        is saved. Changes apply the next time the embed script loads on GHL.
      </p>
    </ArticleLayout>
  );
}
