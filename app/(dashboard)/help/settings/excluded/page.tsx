'use client';

import { ArticleLayout } from '../../_components/article-layout';
import { Callout } from '../../_components/callout';
import { Screenshot } from '../../_components/screenshot';
import { StepSection } from '../../_components/step-section';

export default function ExcludedPage() {
  return (
    <ArticleLayout
      title="Excluded Locations"
      description="Skip customizations for specific GHL sub-accounts"
      breadcrumbs={[
        { label: 'Settings', href: '/help/settings' },
        { label: 'Excluded Locations' },
      ]}
      relatedArticles={[
        { title: 'Profile settings', href: '/help/settings/profile' },
        { title: 'Installing the embed script', href: '/help/getting-started/embed-script' },
      ]}
    >
      <p>
        Excluded locations let you skip Agency Toolkit customizations for specific
        GHL sub-accounts. The embed script will still load on excluded locations,
        but no customizations will be applied.
      </p>

      <hr />

      <h2>When to Use</h2>

      <ul>
        <li><strong>Test or demo accounts</strong> that need the default GHL styling</li>
        <li><strong>Specific clients</strong> who prefer the standard GHL interface</li>
        <li><strong>Troubleshooting</strong> — temporarily exclude a location to isolate issues without removing the embed script</li>
      </ul>

      <hr />

      <h2>Adding a Location</h2>

      <StepSection number={1} title="Add to Excluded List">
        <p>
          Go to <strong>Settings → Excluded Locations</strong> and paste any of the following
          into the input field:
        </p>

        <ul>
          <li><strong>A full GHL URL</strong> — e.g. <code>https://app.youragency.com/v2/location/abc123/dashboard</code></li>
          <li><strong>A Location ID</strong> — e.g. <code>abc123</code></li>
        </ul>

        <p>
          Click <strong>Add</strong> (or press Enter). If you pasted a URL, the Location ID
          is automatically extracted — you&apos;ll see a confirmation with the extracted ID.
        </p>

        <Screenshot
          src="/help/settings/excluded-locations.png"
          alt="Excluded Locations settings page showing input field that accepts Location IDs or full GHL URLs"
          caption="Paste a GHL URL or enter a Location ID — the ID is extracted automatically"
          size="lg"
        />

        <Callout type="info">
          Duplicate IDs are automatically prevented — you can&apos;t add the same
          location twice.
        </Callout>
      </StepSection>

      <hr />

      <StepSection number={2} title="Finding the Location ID in GHL">
        <p>
          The easiest way is to copy the URL from your browser while viewing the
          sub-account in GHL. The URL contains the Location ID:
        </p>
        <p>
          <code>https://app.youragency.com/v2/location/<strong>abc123</strong>/dashboard</code>
        </p>
        <p>
          You can also find it in the sub-account&apos;s <strong>Settings → Business Info</strong>.
        </p>
      </StepSection>

      <hr />

      <h2>Managing Excluded Locations</h2>

      <ul>
        <li><strong>View</strong> — All excluded Location IDs are listed in monospace code format</li>
        <li><strong>Remove</strong> — Click the X button next to any location to re-enable customizations for it</li>
        <li><strong>Copy All</strong> — Copy the entire list of excluded Location IDs to your clipboard</li>
      </ul>

      <p>
        The card header shows how many locations are currently excluded. When no
        locations are excluded, you&apos;ll see a message confirming the embed script
        runs on all GHL locations.
      </p>

      <Callout type="tip" title="Quick troubleshooting">
        If a sub-account is having issues with customizations, add its Location ID
        to the excluded list temporarily. If the issues stop, the problem is with your
        customization settings. If they continue, the issue is elsewhere.
      </Callout>
    </ArticleLayout>
  );
}
