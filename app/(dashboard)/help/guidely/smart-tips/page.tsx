'use client';

import { ArticleLayout } from '../../_components/article-layout';
import { Callout } from '../../_components/callout';
import { Screenshot } from '../../_components/screenshot';
import { StepSection } from '../../_components/step-section';

export default function SmartTipsPage() {
  return (
    <ArticleLayout
      title="Smart Tips"
      description="Add contextual tooltips to any element in GHL"
      breadcrumbs={[
        { label: 'Guidely', href: '/help/guidely' },
        { label: 'Smart Tips' },
      ]}
      relatedArticles={[
        { title: 'Creating your first tour', href: '/help/guidely/first-tour' },
        { title: 'Banners & announcements', href: '/help/guidely/banners' },
        { title: 'Themes & styling', href: '/help/guidely/themes' },
      ]}
    >
      <Callout type="info" title="Pro Feature">
        Smart Tips are part of the Guidely suite and require the <strong>Pro plan</strong> ($49/month).
      </Callout>

      <p>
        Smart Tips add helpful context to any element in GHL. Attach a tooltip to a button,
        menu item, or form field to explain what it does — without interrupting the user&apos;s
        workflow. Tips can appear on hover, click, focus, or after a delay.
      </p>

      <hr />

      <h2>Creating a Smart Tip</h2>

      <StepSection number={1} title="Create a New Tip">
        <p>
          Navigate to <strong>Guidely → Smart Tips</strong> and click <strong>+ New Tip</strong>.
          Enter a name and click Create.
        </p>
      </StepSection>

      <hr />

      <StepSection number={2} title="Configure the Tip">
        <Screenshot
          src="/help/guidely/tip-editor.png"
          alt="Smart Tip editor with beacon settings, style options, position controls, target element selector, and live tooltip preview with question mark beacon"
          caption="The tip editor — beacon configuration, content, trigger settings, and live preview"
          size="lg"
        />

        <p>
          The tip builder lets you configure everything in a single settings panel:
        </p>

        <h3>Content</h3>
        <ul>
          <li><strong>Name</strong> — Internal reference name</li>
          <li><strong>Content</strong> — The tooltip message your users will see</li>
        </ul>

        <h3>Element &amp; Trigger</h3>
        <ul>
          <li><strong>Element Selector</strong> — CSS selector for the target element (use the visual selector tool for help)</li>
          <li><strong>Trigger Type</strong>:
            <ul>
              <li><strong>Hover</strong> — Shows when the mouse hovers over the element</li>
              <li><strong>Click</strong> — Shows when the element is clicked</li>
              <li><strong>Focus</strong> — Shows when the element receives focus (useful for form fields)</li>
              <li><strong>Delay</strong> — Shows automatically after a set number of seconds (0–30s)</li>
            </ul>
          </li>
        </ul>

        <h3>Display Settings</h3>
        <ul>
          <li><strong>Position</strong> — Auto (recommended), Top, Right, Bottom, or Left relative to the element</li>
          <li><strong>Size</strong> — Small (200px), Medium (280px), or Large (360px)</li>
        </ul>
      </StepSection>

      <hr />

      <StepSection number={3} title="Configure the Beacon (Optional)">
        <p>
          Beacons are visual indicators that draw attention to the tip&apos;s location.
          Enable the beacon toggle to configure:
        </p>
        <ul>
          <li><strong>Beacon Style</strong> — Pulsing Dot, Question Mark, or Info Icon</li>
          <li><strong>Position</strong> — Top, Right, Bottom, or Left relative to the element</li>
          <li><strong>Offset</strong> — Fine-tune X and Y positioning in pixels</li>
          <li><strong>Size</strong> — 12px to 40px</li>
          <li><strong>Beacon Target</strong>:
            <ul>
              <li><strong>Automatic</strong> — Uses the beacon as the trigger if enabled</li>
              <li><strong>Element</strong> — The element itself triggers the tip</li>
              <li><strong>Beacon</strong> — Only the beacon triggers the tip</li>
            </ul>
          </li>
        </ul>

        <Callout type="tip" title="When to use beacons">
          Beacons are great for drawing attention to features users might miss. A pulsing
          dot next to a button or menu item signals &quot;there&apos;s something to learn here&quot;
          without being intrusive.
        </Callout>
      </StepSection>

      <hr />

      <StepSection number={4} title="Set Targeting &amp; Publish">
        <p>
          Configure where and for whom the tip appears:
        </p>
        <ul>
          <li><strong>URL Targeting</strong> — All URLs, specific patterns, or exclude patterns</li>
          <li><strong>User Targeting</strong> — All users, new users, returning users, or custom segments</li>
          <li><strong>Device Targeting</strong> — Desktop, tablet, and/or mobile</li>
        </ul>
        <p>
          When ready, click <strong>Publish</strong> to make the tip live.
        </p>
      </StepSection>

      <hr />

      <h2>Managing Tips</h2>

      <p>
        The tips list view shows each tip with its trigger type and element selector.
        Use the actions menu to rename, tag, duplicate, archive, or delete tips.
      </p>

      <p>
        Tips auto-save as you edit. Use the <strong>Theme</strong> tab to apply
        consistent styling across all your tips.
      </p>
    </ArticleLayout>
  );
}
