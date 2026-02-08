'use client';

import { ArticleLayout } from '../../_components/article-layout';
import { Callout } from '../../_components/callout';
import { Screenshot } from '../../_components/screenshot';
import { StepSection } from '../../_components/step-section';

export default function LoginPage() {
  return (
    <ArticleLayout
      title="Login Designer"
      description="Customize the GHL login page with a visual drag-and-drop editor"
      breadcrumbs={[
        { label: 'Theme Builder', href: '/help/theme-builder' },
        { label: 'Login Designer' },
      ]}
      relatedArticles={[
        { title: 'Brand Colors', href: '/help/theme-builder/colors' },
        { title: 'Installing the embed script', href: '/help/getting-started/embed-script' },
      ]}
    >
      <p>
        The Login Designer is a full visual editor for creating custom GHL login pages.
        Add images, text, testimonials, buttons, and shapes — then arrange them on a
        canvas alongside the login form. Your clients see a branded, professional login
        page instead of the default GHL screen.
      </p>

      <hr />

      <h2>Getting Started</h2>

      <StepSection number={1} title="Open the Login Designer">
        <p>
          Navigate to <strong>Theme Builder → Login</strong> from the sidebar, or click
          the Login card on the Theme Builder overview page.
        </p>

        <Screenshot
          src="/help/theme-builder/login-canvas.png"
          alt="Login Designer with canvas editor showing login form, elements panel, and properties panel"
          caption="The Login Designer — drag-and-drop canvas with elements and properties panels"
          size="lg"
        />
      </StepSection>

      <hr />

      <StepSection number={2} title="Choose a Preset (or Start Blank)">
        <p>
          The <strong>Quick Start</strong> section in the left panel offers 6 layout presets:
        </p>
        <ul>
          <li><strong>Centered Classic</strong> — Clean, professional layout with a centered &quot;Welcome Back&quot; headline</li>
          <li><strong>Split - Image Left</strong> — Hero image on the left, login form on the right</li>
          <li><strong>Split - Image Right</strong> — Login form on the left, image on the right</li>
          <li><strong>Gradient Overlay</strong> — Background image with gradient overlay and welcome text</li>
          <li><strong>Minimal Dark</strong> — Clean dark background, form only</li>
          <li><strong>Blank Canvas</strong> — Empty canvas for full customization</li>
        </ul>
        <Screenshot
          src="/help/theme-builder/login-presets.png"
          alt="Choose a Starting Point dialog with 6 layout presets: Centered Classic, Split Image Left, Split Image Right, Gradient Overlay, Minimal Dark, and Blank Canvas"
          caption="6 layout presets to get started quickly"
          size="md"
        />

        <Callout type="tip" title="Presets are starting points">
          Selecting a preset replaces your current design. Customize it freely after
          applying — presets are just a head start.
        </Callout>
      </StepSection>

      <hr />

      <StepSection number={3} title="Add Elements">
        <p>
          Switch to the <strong>Elements</strong> tab in the left panel to add content to
          your canvas. Available element types:
        </p>
        <ul>
          <li><strong>Image</strong> — Upload or link hero images, logos, or decorative graphics</li>
          <li><strong>Text Block</strong> — Add headlines, subtitles, or descriptions</li>
          <li><strong>GIF / Animation</strong> — Add animated GIFs for dynamic backgrounds</li>
          <li><strong>Testimonial</strong> — Display a customer quote with author name (card, minimal, or quote-only styles)</li>
          <li><strong>Shape / Divider</strong> — Add lines, rectangles, or circles for visual structure</li>
          <li><strong>Button</strong> — Create call-to-action buttons with custom links</li>
        </ul>

        <Screenshot
          src="/help/theme-builder/login-elements.png"
          alt="Elements panel showing 6 element types: Image, Text Block, GIF/Animation, Testimonial, Shape/Divider, and Button, plus the required Login Form"
          caption="Available element types — click to add to the canvas"
          size="sm"
        />

        <Callout type="info">
          The <strong>Login Form</strong> element is always present and can&apos;t be removed.
          You can reposition and resize it, but every design needs the form.
        </Callout>
      </StepSection>

      <hr />

      <StepSection number={4} title="Arrange on the Canvas">
        <p>
          Click and drag elements to position them. Use the corner handles to resize.
          The canvas uses a 16:9 aspect ratio (1600x900px base) with percentage-based
          positioning so your design adapts to different screen sizes.
        </p>

        <h3>Keyboard Shortcuts</h3>
        <ul>
          <li><strong>Arrow Keys</strong> — Move selected element by 1px</li>
          <li><strong>Shift + Arrow Keys</strong> — Move by 10px</li>
          <li><strong>Delete / Backspace</strong> — Delete selected element</li>
          <li><strong>Cmd+Z / Ctrl+Z</strong> — Undo</li>
          <li><strong>Cmd+Shift+Z / Ctrl+Shift+Z</strong> — Redo</li>
          <li><strong>Escape</strong> — Deselect element</li>
        </ul>

        <h3>Layer Control</h3>
        <p>
          When elements overlap, use the layer controls in the properties panel to
          adjust stacking order: <strong>Bring to Front</strong>, <strong>Bring Forward</strong>,
          <strong>Send Backward</strong>, or <strong>Send to Back</strong>.
        </p>
      </StepSection>

      <hr />

      <StepSection number={5} title="Customize Properties">
        <p>
          Select any element to edit its properties in the right panel:
        </p>

        <h3>Text Elements</h3>
        <ul>
          <li>Text content, font size, font weight (100–900)</li>
          <li>Color and text alignment (left, center, right)</li>
        </ul>

        <h3>Image &amp; GIF Elements</h3>
        <ul>
          <li>Image/GIF URL, opacity (0–100%)</li>
          <li>Border radius (0–50px), object fit (cover, contain, fill)</li>
        </ul>

        <h3>Testimonial Elements</h3>
        <ul>
          <li>Quote text, author name</li>
          <li>Variant style: card, minimal, or quote-only</li>
          <li>Background and text colors</li>
        </ul>

        <h3>Shape Elements</h3>
        <ul>
          <li>Shape type: line, rectangle, or circle</li>
          <li>Color, opacity, border width, orientation</li>
        </ul>

        <h3>Button Elements</h3>
        <ul>
          <li>Button text, link URL</li>
          <li>Background color, text color, border radius</li>
        </ul>
      </StepSection>

      <hr />

      <h2>Background Settings</h2>

      <p>
        Switch to the <strong>Background</strong> tab to set the canvas background:
      </p>

      <h3>Solid Color</h3>
      <p>
        Choose any color from the picker. If you have Brand Colors configured,
        they appear as quick-access swatches.
      </p>

      <h3>Image Background</h3>
      <ul>
        <li>Set an image URL for a photo background</li>
        <li>Adjust <strong>blur</strong> (0–20px) to soften the image</li>
        <li>Add a color <strong>overlay</strong> with adjustable opacity for text readability</li>
      </ul>

      <Screenshot
        src="/help/theme-builder/login-background.png"
        alt="Background tab with color picker and 8 gradient presets"
        caption="Background settings with solid color and gradient preset options"
        size="sm"
      />

      <h3>Gradient Presets</h3>
      <p>8 quick gradient options:</p>
      <ul>
        <li>Purple Dream, Pink Sunset, Ocean Blue, Fresh Mint</li>
        <li>Warm Glow, Soft Pastel, Deep Night, Midnight</li>
      </ul>

      <hr />

      <h2>Form Styling</h2>

      <p>
        The <strong>Form</strong> tab lets you customize the login form appearance:
      </p>

      <ul>
        <li><strong>Logo</strong> — Add your agency logo above the form</li>
        <li><strong>Heading</strong> — Custom heading text and color (e.g., &quot;Welcome Back&quot;)</li>
        <li><strong>Form background</strong> — Container background and border</li>
        <li><strong>Input fields</strong> — Background, border, and text colors</li>
        <li><strong>Submit button</strong> — Background and text colors</li>
        <li><strong>Links</strong> — Color for &quot;Forgot password?&quot; and other links</li>
        <li><strong>Labels</strong> — Color for field labels</li>
      </ul>

      <p>
        Quick style presets are also available: Default Blue, Dark Mode, Green, and Purple.
      </p>

      <Screenshot
        src="/help/theme-builder/login-form-styling.png"
        alt="Form styling tab with controls for logo, container, heading, labels, button, inputs, and links colors plus quick style presets"
        caption="Customize every aspect of the login form appearance"
        size="sm"
      />

      <hr />

      <h2>Grid &amp; Alignment</h2>

      <p>
        Toggle the grid overlay from the toolbar to help align elements precisely.
        Choose between a <strong>16px fine grid</strong> or <strong>32px coarse grid</strong>.
        Grid preferences persist between sessions.
      </p>

      <hr />

      <h2>Preview &amp; Save</h2>

      <p>
        Click the <strong>Preview</strong> button (eye icon) in the toolbar to see a
        full-screen preview of your design. When you&apos;re happy with it, click <strong>Save</strong>.
        Changes apply the next time the embed script loads on GHL.
      </p>

      <Callout type="tip" title="Undo mistakes">
        Made a change you don&apos;t like? Use <strong>Cmd+Z</strong> (Mac)
        or <strong>Ctrl+Z</strong> (Windows) to undo. The full undo/redo history
        is available during your editing session.
      </Callout>
    </ArticleLayout>
  );
}
