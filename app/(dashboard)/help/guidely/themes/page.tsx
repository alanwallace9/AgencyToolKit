'use client';

import { ArticleLayout } from '../../_components/article-layout';
import { Callout } from '../../_components/callout';
import { Screenshot } from '../../_components/screenshot';
import { StepSection } from '../../_components/step-section';

export default function ThemesPage() {
  return (
    <ArticleLayout
      title="Themes & Styling"
      description="Create consistent visual themes across all Guidely features"
      breadcrumbs={[
        { label: 'Guidely', href: '/help/guidely' },
        { label: 'Themes' },
      ]}
      relatedArticles={[
        { title: 'Creating your first tour', href: '/help/guidely/first-tour' },
        { title: 'Banners & announcements', href: '/help/guidely/banners' },
      ]}
    >
      <Callout type="info" title="Pro Feature">
        Themes are part of the Guidely suite and require the <strong>Pro plan</strong> ($49/month).
      </Callout>

      <p>
        Guidely themes let you customize colors, typography, and styling across all your
        tours, checklists, tips, and banners. Create themes that match your brand and
        apply them consistently — or use different themes for different purposes.
      </p>

      <hr />

      <h2>Theme Types</h2>

      <h3>System Templates</h3>
      <p>
        5 professionally designed system templates are available to all agencies. These
        are read-only, but you can duplicate any system template to create your own
        customizable version.
      </p>

      <h3>Agency Themes</h3>
      <p>
        Your custom themes. Create them from scratch or by duplicating a system template.
        You can set one as the default for each Guidely feature type.
      </p>

      <hr />

      <h2>Creating a Theme</h2>

      <StepSection number={1} title="Start a New Theme">
        <p>
          Go to <strong>Guidely → Themes</strong>. Either click <strong>Create Theme</strong>
          to start from scratch, or click <strong>Create from Template</strong> on any
          system template to customize a copy.
        </p>

        <Screenshot
          src="/help/guidely/themes-page.png"
          alt="Themes page with 5 Starter Templates (Bold, Colorful, Corporate, Friendly, Minimal), My Themes section with Default and Bold Custom themes, and Feature Defaults settings"
          caption="The Themes page — starter templates, custom themes, and feature defaults"
          size="lg"
        />
      </StepSection>

      <hr />

      <StepSection number={2} title="Customize Colors">
        <p>
          The theme editor lets you configure core colors that apply across all features:
        </p>
        <ul>
          <li><strong>Primary color</strong> + hover state — Main action color</li>
          <li><strong>Primary text color</strong> — Text on primary backgrounds</li>
          <li><strong>Secondary color</strong> + hover state — Secondary actions</li>
          <li><strong>Secondary text color</strong> — Text on secondary backgrounds</li>
          <li><strong>Background color</strong> — Content area background</li>
          <li><strong>Text color</strong> — Primary body text</li>
          <li><strong>Secondary text color</strong> — Muted/secondary text</li>
          <li><strong>Border color</strong> — Borders and dividers</li>
        </ul>
      </StepSection>

      <hr />

      <StepSection number={3} title="Configure Typography">
        <ul>
          <li><strong>Font family</strong> — Choose from available web fonts</li>
          <li><strong>Title size</strong> — Heading font size in pixels</li>
          <li><strong>Body size</strong> — Body text font size in pixels</li>
          <li><strong>Line height</strong> — Spacing between lines</li>
        </ul>
      </StepSection>

      <hr />

      <StepSection number={4} title="Style Borders, Shadows &amp; Buttons">

        <h3>Borders &amp; Shadows</h3>
        <ul>
          <li>Border radius, width, and style</li>
          <li>Tooltip shadow and modal shadow</li>
        </ul>

        <h3>Buttons</h3>
        <ul>
          <li><strong>Button style</strong> — Filled, Outline, or Ghost</li>
          <li><strong>Primary button</strong> — Background, text, border, and hover colors</li>
          <li><strong>Secondary button</strong> — Background, text, border, and hover colors</li>
          <li>Padding and border radius per button</li>
        </ul>

        <h3>Avatar (Optional)</h3>
        <ul>
          <li>Enable/disable avatar display</li>
          <li>Shape: Circle, Rounded, or Square</li>
          <li>Size in pixels</li>
          <li>Default image URL</li>
        </ul>
      </StepSection>

      <hr />

      <h2>Feature-Specific Overrides</h2>

      <p>
        Each theme can include overrides for specific Guidely features, allowing
        fine-tuned control:
      </p>

      <h3>Tour Overrides</h3>
      <ul>
        <li>Progress indicator color and inactive color</li>
        <li>Close icon color</li>
        <li>Backdrop (overlay) color</li>
        <li>Progress style: Dots, Numbers, or Bar</li>
      </ul>

      <h3>Smart Tip Overrides</h3>
      <ul>
        <li>Tooltip background color</li>
        <li>Beacon color</li>
        <li>Arrow color</li>
      </ul>

      <h3>Banner Overrides</h3>
      <ul>
        <li>Banner background and text colors</li>
        <li>Dismiss icon color</li>
      </ul>

      <h3>Checklist Overrides</h3>
      <ul>
        <li>Header background and text colors</li>
        <li>Completion color</li>
        <li>Item text and link colors</li>
      </ul>

      <Callout type="tip" title="Custom CSS">
        For advanced customization, each theme includes a <strong>Custom CSS</strong> field
        where you can add additional styles. This is useful for edge cases that the
        standard settings don&apos;t cover.
      </Callout>

      <hr />

      <h2>Applying Themes</h2>

      <p>
        Themes can be applied in two ways:
      </p>

      <ul>
        <li><strong>Per item</strong> — Select a theme in the Theme tab when building a tour, checklist, tip, or banner</li>
        <li><strong>As default</strong> — Set a theme as the default for each feature type. New items will use the default theme automatically.</li>
      </ul>

      <hr />

      <h2>Managing Themes</h2>

      <p>From the themes page, you can:</p>

      <ul>
        <li><strong>Set as Default</strong> — Make a theme the default for new items</li>
        <li><strong>Duplicate</strong> — Copy a theme (including system templates) to customize</li>
        <li><strong>Delete</strong> — Remove custom themes you no longer need</li>
        <li><strong>Search</strong> — Filter themes by name</li>
      </ul>
    </ArticleLayout>
  );
}
