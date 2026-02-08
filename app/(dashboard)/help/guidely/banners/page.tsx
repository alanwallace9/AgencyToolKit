'use client';

import { ArticleLayout } from '../../_components/article-layout';
import { Callout } from '../../_components/callout';
import { Screenshot } from '../../_components/screenshot';
import { StepSection } from '../../_components/step-section';

export default function BannersPage() {
  return (
    <ArticleLayout
      title="Banners & Announcements"
      description="Display promotional messages, alerts, and announcements in GHL"
      breadcrumbs={[
        { label: 'Guidely', href: '/help/guidely' },
        { label: 'Banners' },
      ]}
      relatedArticles={[
        { title: 'Smart Tips', href: '/help/guidely/smart-tips' },
        { title: 'Creating your first tour', href: '/help/guidely/first-tour' },
        { title: 'Themes & styling', href: '/help/guidely/themes' },
      ]}
    >
      <Callout type="info" title="Pro Feature">
        Banners are part of the Guidely suite and require the <strong>Pro plan</strong> ($49/month).
      </Callout>

      <p>
        Banners let you display announcements, promotions, alerts, and important messages
        at the top or bottom of GHL pages. Use them to announce new features, warn about
        upcoming changes, or promote upgrades — all without touching GHL&apos;s code.
      </p>

      <hr />

      <h2>Creating a Banner</h2>

      <StepSection number={1} title="Create a New Banner">
        <p>
          Navigate to <strong>Guidely → Banners</strong> and click <strong>+ New Banner</strong>.
        </p>
        <ul>
          <li><strong>Name</strong> (required) — A descriptive name for your reference</li>
          <li><strong>From Template</strong> (optional) — Start from a pre-built template</li>
        </ul>
      </StepSection>

      <hr />

      <StepSection number={2} title="Configure Content &amp; Type">
        <Screenshot
          src="/help/guidely/banner-editor.png"
          alt="Banner editor with content settings, action button configuration, appearance options, and a live blue banner preview showing Get Started CTA"
          caption="The banner editor with live preview showing your announcement inline"
          size="lg"
        />

        <p>
          In the builder&apos;s left panel, set up the banner content:
        </p>
        <ul>
          <li><strong>Banner Type</strong>:
            <ul>
              <li><strong>Standard</strong> — General announcements and promotions</li>
              <li><strong>Trial Expiration</strong> — Automatically shows when a trial is nearing its end (configure the days-remaining threshold)</li>
            </ul>
          </li>
          <li><strong>Content</strong> — The message to display</li>
          <li><strong>Action Button</strong>:
            <ul>
              <li>Button label text</li>
              <li>Action type: Open URL, Start a Tour, Open a Checklist, or Dismiss</li>
              <li>Toggle for opening in a new tab</li>
              <li>Option to make the whole banner clickable</li>
            </ul>
          </li>
        </ul>
      </StepSection>

      <hr />

      <StepSection number={3} title="Style &amp; Position">
        <p>
          In the center panel, configure the banner&apos;s appearance:
        </p>

        <h3>Position &amp; Display</h3>
        <ul>
          <li><strong>Position</strong> — Top or Bottom of the page</li>
          <li><strong>Display Mode</strong>:
            <ul>
              <li><strong>Inline</strong> — Takes space in the page flow, pushing content down</li>
              <li><strong>Float</strong> — Fixed positioning, overlays content</li>
            </ul>
          </li>
        </ul>

        <h3>Style Presets</h3>
        <ul>
          <li><strong>Info</strong> — Blue/neutral styling for informational messages</li>
          <li><strong>Success</strong> — Green styling for positive announcements</li>
          <li><strong>Warning</strong> — Yellow/amber for caution messages</li>
          <li><strong>Error</strong> — Red for urgent alerts</li>
          <li><strong>Custom</strong> — Pick your own background, text, and button colors</li>
        </ul>

        <h3>Dismissal Settings</h3>
        <ul>
          <li><strong>Dismissible</strong> — Whether users can close the banner</li>
          <li><strong>Dismiss Duration</strong>:
            <ul>
              <li><strong>Session</strong> — Re-shows on the next visit</li>
              <li><strong>Permanent</strong> — Once dismissed, never shows again for that user</li>
            </ul>
          </li>
        </ul>

        <h3>Priority</h3>
        <ul>
          <li><strong>High / Normal / Low</strong> — Controls display order when multiple banners are active</li>
          <li><strong>Exclusive</strong> — When enabled, only this banner shows if multiple high-priority banners exist</li>
        </ul>
      </StepSection>

      <hr />

      <StepSection number={4} title="Schedule (Optional)">
        <p>
          Click the <strong>Schedule</strong> button to control when the banner appears:
        </p>
        <ul>
          <li><strong>Always</strong> — Shows whenever conditions are met</li>
          <li><strong>Date/Time Range</strong> — Set a start and end date with timezone support. Perfect for time-limited promotions or planned announcements.</li>
        </ul>
      </StepSection>

      <hr />

      <StepSection number={5} title="Target &amp; Publish">
        <p>
          Open the settings to configure targeting:
        </p>
        <ul>
          <li><strong>URL Targeting</strong> — All pages, specific URL patterns, or exclude certain pages</li>
          <li><strong>Customer Targeting</strong> — All customers or specific ones</li>
        </ul>
        <p>
          Click <strong>Publish</strong> to make the banner live. The right panel
          shows a live preview as you build.
        </p>
      </StepSection>

      <hr />

      <h2>Banner Analytics</h2>

      <p>Track engagement from the banners list:</p>

      <ul>
        <li><strong>Views</strong> — Times the banner was shown</li>
        <li><strong>Clicks</strong> — CTA button clicks</li>
        <li><strong>CTR</strong> — Click-through rate (clicks / views)</li>
        <li><strong>Dismissals</strong> — Times users closed the banner</li>
      </ul>

      <Callout type="tip" title="A/B test your messaging">
        Create two banners with different messages or styles, then compare their CTR
        to see which resonates better with your users.
      </Callout>
    </ArticleLayout>
  );
}
