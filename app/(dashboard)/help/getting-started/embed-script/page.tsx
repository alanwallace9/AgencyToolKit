'use client';

import { ArticleLayout } from '../../_components/article-layout';
import { Callout } from '../../_components/callout';
import { CodeBlock } from '../../_components/code-block';
import { Screenshot } from '../../_components/screenshot';
import { StepSection } from '../../_components/step-section';

export default function EmbedScriptPage() {
  return (
    <ArticleLayout
      title="Installing the Embed Script"
      description="Add customizations to your GHL sub-accounts"
      breadcrumbs={[
        { label: 'Getting Started', href: '/help/getting-started' },
        { label: 'Embed Script' },
      ]}
      relatedArticles={[
        { title: 'Adding your first customer', href: '/help/getting-started/first-customer' },
        { title: 'Menu Customizer', href: '/help/theme-builder/menu' },
      ]}
    >
      <p>
        The embed script is how Agency Toolkit applies your customizations to GHL.
        It&apos;s a small JavaScript file that loads your settings and applies them automatically.
      </p>

      <Callout type="tip" title="One-time setup">
        You only need to install the embed script once. After that, any changes you make
        in Agency Toolkit are applied automatically.
      </Callout>

      <hr />

      <StepSection number={1} title="Copy Your Embed Code">
        <ol>
          <li>Go to <strong>Settings → Embed Code</strong></li>
          <li>Click the <strong>Copy</strong> button</li>
        </ol>

        <Screenshot
          src="/help/getting-started/embed-code-settings.png"
          alt="Settings Embed Code page showing the script tag with Copy button, Generated CSS panel, and expandable FAQ sections for GHL instructions and troubleshooting"
          caption="The Embed Code settings page — copy your script and generated CSS"
          size="lg"
        />

        <p>Your embed code looks like this:</p>

        <CodeBlock label="Your Embed Script" copyable>
{`<script src="https://app.agencytoolkit.com/embed.js?key=rp_YOUR_KEY"></script>`}
        </CodeBlock>

        <Callout type="warning" title="Keep your key private">
          Your embed key is unique to your agency. Don&apos;t share it publicly or commit it to version control.
        </Callout>
      </StepSection>

      <hr />

      <StepSection number={2} title="Add to GHL">
        <ol>
          <li>Log in to your GHL agency account</li>
          <li>Go to <strong>Settings → Company</strong></li>
          <li>Scroll to <strong>Custom Code</strong> section</li>
          <li>Paste your embed script in the <strong>Header Code</strong> field</li>
          <li>Click <strong>Save</strong></li>
        </ol>

        <Callout type="info">
          The embed script will now load on all sub-accounts under your agency.
          Sub-accounts inherit the header code from the agency level.
        </Callout>
      </StepSection>

      <hr />

      <StepSection number={3} title="Verify Installation">
        <p>To verify the script is working:</p>

        <ol>
          <li>Open any sub-account dashboard</li>
          <li>Open browser DevTools (F12 or Cmd+Option+I)</li>
          <li>Go to the <strong>Console</strong> tab</li>
          <li>Look for: <code>[Agency Toolkit] Config loaded</code></li>
        </ol>

        <p>
          If you see this message, the script is installed correctly and loading your config.
        </p>
      </StepSection>

      <hr />

      <h2>Troubleshooting</h2>

      <h3>Script not loading?</h3>
      <ul>
        <li>Make sure you pasted the code in the <strong>Header Code</strong> field (not Footer)</li>
        <li>Check that you copied the entire script tag, including the closing <code>&lt;/script&gt;</code></li>
        <li>Clear your browser cache and refresh</li>
      </ul>

      <h3>Customizations not appearing?</h3>
      <ul>
        <li>Verify you have at least one customization set up (menu, colors, etc.)</li>
        <li>Check if the sub-account is in your &quot;Excluded Locations&quot; list</li>
        <li>Some customizations only apply to specific pages (e.g., login page styling)</li>
      </ul>

      <h3>Still having issues?</h3>
      <p>
        Check the browser console for error messages. Common issues include:
      </p>
      <ul>
        <li><code>Invalid key</code> — Your embed key may have been regenerated</li>
        <li><code>CORS error</code> — Rare, usually a network issue</li>
        <li><code>Config not found</code> — No agency found for that key</li>
      </ul>
    </ArticleLayout>
  );
}
