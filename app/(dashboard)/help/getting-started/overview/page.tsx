'use client';

import { ArticleLayout } from '../../_components/article-layout';
import { Callout } from '../../_components/callout';
import { CodeBlock } from '../../_components/code-block';
import { Screenshot } from '../../_components/screenshot';

export default function OverviewPage() {
  return (
    <ArticleLayout
      title="What is Agency Toolkit?"
      description="Introduction to the platform and its features"
      breadcrumbs={[
        { label: 'Getting Started', href: '/help/getting-started' },
        { label: 'Overview' },
      ]}
      relatedArticles={[
        { title: 'Adding your first customer', href: '/help/getting-started/first-customer' },
        { title: 'Understanding plans', href: '/help/getting-started/plans' },
      ]}
    >
      <p>
        Agency Toolkit is a customization platform for GoHighLevel (GHL) agencies.
        It lets you personalize your white-label sub-accounts with custom menus,
        login pages, colors, onboarding tours, and more — all without touching code.
      </p>

      <Screenshot
        src="/help/getting-started/dashboard.png"
        alt="Agency Toolkit dashboard showing stat cards for Customers, Menu Presets, Tours, and Images, plus a Getting Started checklist with 4 setup steps"
        caption="The dashboard — your starting point with quick stats and setup guide"
        size="lg"
      />

      <h2>Key Features</h2>

      <h3>Theme Builder (Free)</h3>
      <ul>
        <li><strong>Menu Customizer</strong> — Hide, rename, and reorder sidebar menu items</li>
        <li><strong>Login Designer</strong> — Customize the login page with your branding</li>
        <li><strong>Brand Colors</strong> — Apply your color theme across the dashboard</li>
        <li><strong>Loading Animations</strong> — Choose from 13 loading animations</li>
      </ul>

      <h3>Guidely (Pro)</h3>
      <ul>
        <li><strong>Tours</strong> — Create step-by-step onboarding tours</li>
        <li><strong>Checklists</strong> — Guide users with interactive task lists</li>
        <li><strong>Smart Tips</strong> — Add contextual tooltips throughout GHL</li>
        <li><strong>Banners</strong> — Display announcements and alerts</li>
      </ul>

      <h3>Images (Pro)</h3>
      <ul>
        <li><strong>Personalized Images</strong> — Generate images with customer names</li>
        <li><strong>Template Editor</strong> — Position text and style visually</li>
        <li><strong>GHL Integration</strong> — Use with workflows and emails</li>
      </ul>

      <h3>TrustSignal (Free)</h3>
      <ul>
        <li><strong>Social Proof Widget</strong> — Show recent signups and activity</li>
        <li><strong>Agency Website</strong> — Build credibility with visitors</li>
      </ul>

      <Callout type="tip" title="Getting Started">
        The fastest way to get started is to add a customer, customize your menu,
        and install the embed script. Most agencies are up and running in under 10 minutes.
      </Callout>

      <h2>How It Works</h2>

      <ol>
        <li><strong>Add customers</strong> — Each customer represents a GHL sub-account</li>
        <li><strong>Customize</strong> — Use the Theme Builder to set up your branding</li>
        <li><strong>Install</strong> — Copy the embed script to your GHL account</li>
        <li><strong>Done!</strong> — Your customizations appear in all sub-accounts</li>
      </ol>

      <h2>The Embed Script</h2>

      <p>
        Agency Toolkit works through a single JavaScript snippet that you add to GHL.
        This script loads your customizations automatically.
      </p>

      <CodeBlock label="Embed Script" copyable>
{`<script src="https://app.agencytoolkit.com/embed.js?key=YOUR_KEY"></script>`}
      </CodeBlock>

      <p>
        You'll find your personalized embed code in <strong>Settings → Embed Code</strong>.
      </p>

      <Callout type="info">
        The embed script is lightweight (~5KB) and loads asynchronously,
        so it won't slow down your GHL pages.
      </Callout>
    </ArticleLayout>
  );
}
