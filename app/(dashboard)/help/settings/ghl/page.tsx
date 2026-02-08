'use client';

import { ArticleLayout } from '../../_components/article-layout';
import { Callout } from '../../_components/callout';
import { Screenshot } from '../../_components/screenshot';
import { StepSection } from '../../_components/step-section';

export default function GhlSetupPage() {
  return (
    <ArticleLayout
      title="GHL Setup"
      description="Configure your GoHighLevel white-label domain and builder settings"
      breadcrumbs={[
        { label: 'Settings', href: '/help/settings' },
        { label: 'GHL Setup' },
      ]}
      relatedArticles={[
        { title: 'Creating your first tour', href: '/help/guidely/first-tour' },
        { title: 'Installing the embed script', href: '/help/getting-started/embed-script' },
        { title: 'Profile settings', href: '/help/settings/profile' },
      ]}
    >
      <p>
        The GHL Integration settings connect Agency Toolkit to your GoHighLevel
        white-label domain. This is required for the tour builder to open your
        GHL instance when selecting elements for tour steps.
      </p>

      <Screenshot
        src="/help/settings/ghl-setup.png"
        alt="GHL Integration settings card with White-Label Domain URL input field, external link button, and Builder Settings section with auto-close tab toggle"
        caption="The GHL Integration card — domain URL and builder settings"
        size="lg"
      />

      <hr />

      <h2>White-Label Domain</h2>

      <StepSection number={1} title="Find your GHL domain">
        <p>
          Your white-label domain is the custom URL your agency uses to access
          GoHighLevel. It looks like{' '}
          <code>https://app.youragency.com</code>. You can find it in your GHL
          agency settings under <strong>Company → White Label Domain</strong>.
        </p>
      </StepSection>

      <hr />

      <StepSection number={2} title="Enter the domain">
        <p>
          Go to <strong>Settings → GHL Setup</strong> and paste your full domain
          URL (including <code>https://</code>) into the{' '}
          <strong>White-Label Domain</strong> field. An external link button
          appears next to the field so you can verify the URL opens correctly.
        </p>
      </StepSection>

      <hr />

      <StepSection number={3} title="Save changes">
        <p>
          Click <strong>Save Changes</strong> when you&apos;re done. The button only
          appears when you&apos;ve made changes.
        </p>
      </StepSection>

      <Callout type="info">
        The white-label domain is used when building tours. The tour builder opens
        your GHL instance in a new tab so you can click on elements to target them
        as tour steps.
      </Callout>

      <hr />

      <h2>Builder Settings</h2>

      <h3>Auto-close tab after selection</h3>
      <p>
        When enabled, the GHL tab automatically closes after you select an
        element for a tour step. This keeps your workflow focused — select an
        element, and you&apos;re immediately back in the tour editor.
      </p>

      <p>
        <strong>When to disable:</strong> If you&apos;re building multi-step tours
        and want to select multiple elements in one session, turn this off so the
        GHL tab stays open between selections.
      </p>

      <Callout type="tip" title="Recommended">
        Keep auto-close enabled for most workflows. It saves time when adding
        individual tour steps. Disable it temporarily when you need to select
        several elements in a row.
      </Callout>
    </ArticleLayout>
  );
}
