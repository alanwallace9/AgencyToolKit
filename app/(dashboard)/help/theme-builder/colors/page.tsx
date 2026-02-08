'use client';

import { ArticleLayout } from '../../_components/article-layout';
import { Callout } from '../../_components/callout';
import { Screenshot } from '../../_components/screenshot';
import { StepSection } from '../../_components/step-section';

export default function ColorsPage() {
  return (
    <ArticleLayout
      title="Brand Colors"
      description="Apply your agency's color palette across the GHL dashboard"
      breadcrumbs={[
        { label: 'Theme Builder', href: '/help/theme-builder' },
        { label: 'Brand Colors' },
      ]}
      relatedArticles={[
        { title: 'Menu Customizer', href: '/help/theme-builder/menu' },
        { title: 'Login Designer', href: '/help/theme-builder/login' },
        { title: 'Loading Animations', href: '/help/theme-builder/loading' },
      ]}
    >
      <p>
        Brand Colors lets you replace the default GHL color scheme with your agency&apos;s
        palette. Choose from 8 built-in themes, create custom presets, or extract colors
        directly from your logo or website.
      </p>

      <hr />

      <h2>The Color Editor</h2>

      <p>
        The Colors page uses a 3-panel layout:
      </p>

      <ul>
        <li><strong>Left Panel</strong> — Theme Gallery with built-in and custom presets</li>
        <li><strong>Center Panel</strong> — Live preview showing how colors look in a GHL mockup</li>
        <li><strong>Right Panel</strong> — Color Studio where you edit individual colors</li>
      </ul>

      <p>All three panels are resizable and collapsible.</p>

      <Screenshot
        src="/help/theme-builder/colors-editor.png"
        alt="Brand Colors editor with theme gallery on the left, GHL pipeline preview in the center, and Color Studio on the right"
        caption="The 3-panel color editor — theme gallery, live preview, and Color Studio"
        size="lg"
      />

      <hr />

      <h2>Core Colors</h2>

      <p>Every theme is built from 4 core color settings:</p>

      <ol>
        <li><strong>Primary Color</strong> — Buttons, links, and active states</li>
        <li><strong>Accent Color</strong> — Secondary highlights and link accents</li>
        <li><strong>Sidebar Background</strong> — Background color of the GHL left sidebar</li>
        <li><strong>Sidebar Text</strong> — Text and icon colors in the sidebar</li>
      </ol>

      <Callout type="info" title="Contrast checker">
        A WCAG AA compliance badge appears when editing sidebar colors, showing whether
        your text is readable against the background. Aim for a passing score.
      </Callout>

      <hr />

      <h2>Built-in Presets</h2>

      <p>8 professionally designed color themes to get started:</p>

      <ul>
        <li><strong>Midnight Blue</strong> — Professional dark theme with cool blue tones</li>
        <li><strong>Ocean Breeze</strong> — Clean light theme with ocean-inspired colors</li>
        <li><strong>Forest Night</strong> — Deep forest tones for a natural feel</li>
        <li><strong>Fresh Mint</strong> — Light and fresh with mint accents</li>
        <li><strong>Sunset Ember</strong> — Warm dark theme with fiery accents</li>
        <li><strong>Coral Sunrise</strong> — Bright and energetic coral tones</li>
        <li><strong>Executive Gold</strong> — Premium dark theme with gold accents</li>
        <li><strong>Clean Slate</strong> — Minimal light theme with purple accents</li>
      </ul>

      <Screenshot
        src="/help/theme-builder/colors-presets.png"
        alt="Theme Gallery showing 8 built-in presets with color swatches: Midnight Blue, Ocean Breeze, Forest Night, Fresh Mint, Sunset Ember, Coral Sunrise, Executive Gold, and Clean Slate"
        caption="8 built-in theme presets plus your saved custom themes"
        size="sm"
      />

      <Callout type="tip" title="Hover to preview">
        Hover over any preset in the gallery to temporarily preview it in the center
        panel — without saving. Click to apply it.
      </Callout>

      <hr />

      <StepSection number={1} title="Choose or Create a Theme">
        <p>
          Pick a built-in preset from the Theme Gallery, or start editing colors directly
          in the Color Studio panel on the right. You can also save your current colors
          as a custom preset with a name of your choice.
        </p>
      </StepSection>

      <hr />

      <StepSection number={2} title="Customize Colors">
        <Screenshot
          src="/help/theme-builder/colors-studio.png"
          alt="Color Studio panel showing Primary Color, Accent Suggestions, Accent Color, Sidebar Background, Sidebar Text, color variations, and WCAG contrast checker"
          caption="The Color Studio with 4 core colors, harmony suggestions, and contrast checker"
          size="sm"
        />

        <p>
          Click any color field in the Color Studio to open the picker. You can:
        </p>
        <ul>
          <li>Use the color wheel for visual selection</li>
          <li>Enter a hex code directly</li>
          <li>Adjust opacity with the slider</li>
        </ul>

        <h3>Color Harmony Suggestions</h3>
        <p>
          When you pick a primary color, 4 complementary accent color suggestions
          appear automatically. Click any suggestion to apply it.
        </p>

        <h3>Color Variations</h3>
        <p>
          Below each color, you&apos;ll see 5 intensity levels (10%–100%) for reference.
          These help you find lighter or darker variations of your chosen colors.
        </p>
      </StepSection>

      <hr />

      <StepSection number={3} title="Extract Colors from Your Brand">
        <p>
          Two ways to pull colors from your existing brand:
        </p>
        <ul>
          <li><strong>Logo upload</strong> — Drag and drop your logo to extract its color palette automatically</li>
          <li><strong>Website URL</strong> — Enter your agency website URL to analyze and extract brand colors</li>
        </ul>
        <p>
          After extraction, map the detected colors to your 4 color fields with one click.
        </p>
      </StepSection>

      <hr />

      <h2>Extended Elements (Advanced)</h2>

      <p>
        Expand the <strong>Extended Elements</strong> section to fine-tune 9 additional
        GHL interface elements beyond the 4 core colors:
      </p>

      <ul>
        <li>Top navigation background and text</li>
        <li>Main content area background</li>
        <li>Card backgrounds</li>
        <li>Primary button background and text</li>
        <li>Input field backgrounds and borders</li>
        <li>Link colors</li>
      </ul>

      <p>
        Each element can use a fixed color or a percentage variation (10%–100%) of one
        of your core colors.
      </p>

      <hr />

      <h2>Saving &amp; Presets</h2>

      <ul>
        <li><strong>Auto-save</strong> — Color changes save automatically as you edit</li>
        <li><strong>Custom presets</strong> — Save your current palette with a name for reuse</li>
        <li><strong>Set as default</strong> — Mark any custom preset as the default theme</li>
        <li><strong>Delete presets</strong> — Remove custom presets you no longer need</li>
      </ul>

      <hr />

      <h2>Live Preview</h2>

      <p>
        The center panel shows a GHL dashboard mockup that updates in real-time as you
        change colors. It includes sample elements like sidebar menus, stat cards, charts,
        and review widgets so you can see exactly how your theme will look in context.
        Multiple preview tabs let you see colors applied to different GHL page types
        (Pipeline, Dashboard, Reviews).
      </p>
    </ArticleLayout>
  );
}
