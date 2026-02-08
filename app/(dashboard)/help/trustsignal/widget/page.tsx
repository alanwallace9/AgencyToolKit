'use client';

import { ArticleLayout } from '../../_components/article-layout';
import { Callout } from '../../_components/callout';
import { CodeBlock } from '../../_components/code-block';
import { Screenshot } from '../../_components/screenshot';
import { StepSection } from '../../_components/step-section';

export default function WidgetPage() {
  return (
    <ArticleLayout
      title="Installing the Widget"
      description="Add TrustSignal social proof notifications to your website"
      breadcrumbs={[
        { label: 'TrustSignal', href: '/help/trustsignal' },
        { label: 'Widget' },
      ]}
      relatedArticles={[
        { title: 'Setting up events', href: '/help/trustsignal/events' },
      ]}
    >
      <p>
        The TrustSignal widget displays social proof notifications on your website —
        showing recent signups, reviews, and purchases to build trust with visitors.
        Create a widget, customize its appearance, then add the code to your site.
      </p>

      <hr />

      <h2>Creating a Widget</h2>

      <StepSection number={1} title="Create a New Widget">
        <p>
          Navigate to <strong>TrustSignal</strong> in the main navigation and click
          <strong> + New Widget</strong>. Enter a descriptive name (e.g., &quot;Landing Page&quot;
          or &quot;Dental Campaign&quot;).
        </p>

        <Screenshot
          src="/help/trustsignal/widgets-list.png"
          alt="TrustSignal widgets list showing two active widgets with theme badges, notification previews, event counts, and New Widget button"
          caption="The TrustSignal widgets list with status badges and notification previews"
          size="lg"
        />

        <Callout type="info" title="Widget limits">
          The number of widgets you can create depends on your plan.
          Upgrade to Pro for unlimited widgets.
        </Callout>
      </StepSection>

      <hr />

      <StepSection number={2} title="Customize Appearance">
        <Screenshot
          src="/help/trustsignal/widget-appearance.png"
          alt="Widget appearance settings with 4 theme presets (Minimal, Glass, Dark, Rounded), custom color pickers for Background, Text, Accent, and Border, saved color presets, Custom CSS editor, and position selector (Bottom Left, Bottom Right, Top Left, Top Right)"
          caption="Appearance settings — themes, colors, presets, custom CSS, and position"
          size="md"
        />

        <p>
          In the widget settings, configure the look and feel:
        </p>

        <h3>Theme</h3>
        <p>Choose from 4 built-in themes or create a custom one:</p>
        <ul>
          <li><strong>Minimal</strong> — Clean and simple</li>
          <li><strong>Glass</strong> — Frosted blur effect</li>
          <li><strong>Dark</strong> — Dark mode style</li>
          <li><strong>Rounded</strong> — Soft corners</li>
          <li><strong>Custom</strong> — Create your own from scratch</li>
        </ul>

        <h3>Colors</h3>
        <ul>
          <li><strong>Background</strong> — Notification background color</li>
          <li><strong>Text</strong> — Main text color</li>
          <li><strong>Accent</strong> — Highlight color</li>
          <li><strong>Border</strong> — Border color</li>
        </ul>
        <p>
          You can save color combinations as presets for reuse. Modifying any color
          automatically switches to the &quot;Custom&quot; theme.
        </p>

        <h3>Position</h3>
        <p>
          Choose where notifications appear: Bottom Left, Bottom Right, Top Left,
          or Top Right.
        </p>

        <h3>Custom CSS</h3>
        <p>
          For advanced styling, use the Custom CSS field with the <code>.sp-notification</code> selector.
        </p>
      </StepSection>

      <hr />

      <StepSection number={3} title="Configure Timing">
        <ul>
          <li><strong>Display Duration</strong> — How long each notification shows (3–10 seconds)</li>
          <li><strong>Gap Between</strong> — Pause between notifications (2–10 seconds)</li>
          <li><strong>Initial Delay</strong> — Wait before the first notification appears (0–30 seconds, 10s recommended)</li>
        </ul>
      </StepSection>

      <hr />

      <StepSection number={4} title="Content Settings">
        <p>Toggle what information appears in notifications:</p>
        <ul>
          <li><strong>Show First Name</strong> — Display the person&apos;s name</li>
          <li><strong>Show City</strong> — Show location from IP geolocation</li>
          <li><strong>Show Business Name</strong> — Show company instead of person</li>
          <li><strong>Show Time Ago</strong> — Display relative time (e.g., &quot;2 hours ago&quot;)</li>
          <li><strong>Randomize Order</strong> — Shuffle events each rotation instead of chronological</li>
        </ul>

        <h3>Event Rotation</h3>
        <p>
          Set the maximum events per rotation cycle (10, 20, 50, or 100). This controls
          how many unique events visitors see before the cycle repeats.
        </p>
      </StepSection>

      <hr />

      <StepSection number={5} title="URL Targeting">
        <p>Control which pages show notifications:</p>
        <ul>
          <li><strong>All pages</strong> — Show everywhere</li>
          <li><strong>Only specific pages</strong> — Whitelist with URL patterns</li>
          <li><strong>All except specific pages</strong> — Blacklist certain pages</li>
        </ul>
        <p>
          URL patterns support wildcards (e.g., <code>/pricing</code>, <code>/demo*</code>).
        </p>
      </StepSection>

      <hr />

      <StepSection number={6} title="Install the Code">
        <p>
          Copy the widget code and paste it before the closing <code>&lt;/body&gt;</code> tag
          on your website:
        </p>

        <CodeBlock label="TrustSignal Widget" copyable>
{`<script src="https://app.agencytoolkit.com/ts.js?key=YOUR_KEY"></script>`}
        </CodeBlock>

        <p>
          The widget will start auto-capturing form submissions as events. Notifications
          begin appearing once you have events and the widget is set to <strong>Active</strong>.
        </p>
      </StepSection>

      <hr />

      <h2>Active vs Paused</h2>

      <p>
        Each widget has an <strong>Active/Paused</strong> toggle. When paused, the
        widget code still captures events but doesn&apos;t display notifications.
        This is useful for collecting data before going live.
      </p>

      <hr />

      <h2>Form Capture</h2>

      <p>
        TrustSignal auto-detects form submissions on your website. If auto-detection
        doesn&apos;t work for your specific form, use the <strong>Custom Form Selector</strong>
        field to provide a CSS selector (e.g., <code>#my-form</code> or <code>.lead-form</code>).
      </p>
    </ArticleLayout>
  );
}
