'use client';

import { ArticleLayout } from '../../_components/article-layout';
import { Callout } from '../../_components/callout';
import { Screenshot } from '../../_components/screenshot';
import { StepSection } from '../../_components/step-section';

export default function EditorPage() {
  return (
    <ArticleLayout
      title="Using the Image Editor"
      description="Position text overlays and style your personalized images"
      breadcrumbs={[
        { label: 'Images', href: '/help/images' },
        { label: 'Editor' },
      ]}
      relatedArticles={[
        { title: 'Creating image templates', href: '/help/images/templates' },
        { title: 'Generating personalized URLs', href: '/help/images/urls' },
      ]}
    >
      <Callout type="info" title="Pro Feature">
        Image Personalization requires the <strong>Pro plan</strong> ($49/month).
      </Callout>

      <p>
        The image editor lets you visually position and style the text overlay on your
        base image. Drag to position, choose fonts and colors, and preview with sample
        names — all in real time.
      </p>

      <hr />

      <h2>Editor Layout</h2>

      <Screenshot
        src="/help/images/image-editor.png"
        alt="Image editor with sample name selector on the left, canvas with draggable text overlay in the center, and text content and position controls on the right"
        caption="The image editor — sample names, canvas with text overlay, and styling controls"
        size="lg"
      />

      <p>The editor has two main areas:</p>

      <ul>
        <li><strong>Left Panel</strong> — Preview area with sample name selector and the canvas</li>
        <li><strong>Right Panel</strong> — Text and image toolbar controls</li>
      </ul>

      <p>
        Two tabs at the top: <strong>Editor</strong> (design your image) and{' '}
        <strong>URLs</strong> (get links for GHL). See{' '}
        <a href="/help/images/urls">Generating personalized URLs</a> for the URLs tab.
      </p>

      <hr />

      <h2>Positioning the Text</h2>

      <StepSection number={1} title="Choose a Sample Name">
        <p>
          At the top of the preview, select a sample name to see how your text looks.
          Use the dropdown to pick from common names, or type a custom name. Click
          the dice button for a random long name to test edge cases.
        </p>
      </StepSection>

      <hr />

      <StepSection number={2} title="Position the Text Box">
        <p>
          Drag the text box on the canvas to position it exactly where you want. For
          quick alignment, use the <strong>Box Position</strong> presets — a 9-point grid
          that snaps the text to common positions:
        </p>

        <ul>
          <li>Top Left, Top Center, Top Right</li>
          <li>Middle Left, Middle Center, Middle Right</li>
          <li>Bottom Left, Bottom Center, Bottom Right</li>
        </ul>
      </StepSection>

      <hr />

      <StepSection number={3} title="Style the Text">
        <Screenshot
          src="/help/images/editor-toolbar.png"
          alt="Text toolbar with Box position, font selector (Poppins), size controls, bold/italic/underline, color picker, corner radius, and image controls (Fit, Fill, Flip, Grid)"
          caption="The text and image toolbar — font, size, formatting, color, and image controls"
        />

        <p>
          Use the text toolbar to customize the overlay:
        </p>

        <h3>Font</h3>
        <p>Choose from 8 Google Fonts:</p>
        <ul>
          <li>Inter, Poppins, Roboto, Open Sans</li>
          <li>Lato, Montserrat, Playfair Display, Oswald</li>
        </ul>

        <h3>Size &amp; Formatting</h3>
        <ul>
          <li><strong>Font Size</strong> — 12px to 120px (use the +/- buttons)</li>
          <li><strong>Bold</strong>, <strong>Italic</strong>, <strong>Underline</strong> toggles</li>
          <li><strong>Text Color</strong> — Color picker with 8 quick presets (White, Black, Blue, Green, Orange, Red, Purple, Teal)</li>
        </ul>

        <h3>Text Box Background</h3>
        <ul>
          <li><strong>Box Color</strong> — Add a solid background behind the text for readability</li>
          <li><strong>Corner Radius &amp; Padding</strong> — Adjust rounding and spacing (0–24)</li>
        </ul>
      </StepSection>

      <hr />

      <StepSection number={4} title="Adjust the Image">
        <p>
          The image toolbar provides controls for the base image:
        </p>
        <ul>
          <li><strong>Fit / Fill</strong> — Control how the image fits the canvas</li>
          <li><strong>Flip Horizontal / Vertical</strong> — Mirror the image</li>
          <li><strong>Zoom</strong> — Slider to zoom in/out</li>
          <li><strong>Grid Toggle</strong> — Show alignment grid on the canvas</li>
          <li><strong>Revert</strong> — Reset to default image settings</li>
        </ul>
      </StepSection>

      <hr />

      <h2>Preview</h2>

      <p>
        Click the <strong>Preview</strong> button in the top bar to see your image
        at full size in a modal. The preview includes device presets so you can check
        how it looks on different screens:
      </p>

      <ul>
        <li>iPhone 15, Samsung Galaxy, Pixel 8, and more</li>
      </ul>

      <p>
        The dice button in preview mode shows random names to test how your design
        handles different name lengths.
      </p>

      <hr />

      <h2>Saving</h2>

      <p>
        Changes auto-save with a 2-second delay. The top bar shows a save status
        indicator. Use the <strong>Undo</strong> button to revert recent changes
        (supports up to 10 states).
      </p>

      <Callout type="tip" title="Test with long names">
        Always test your design with longer names like &quot;Christopher&quot; or &quot;Alexandria&quot;
        to make sure the text fits well. Use the dice button for random long names.
      </Callout>
    </ArticleLayout>
  );
}
