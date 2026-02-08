'use client';

import { ArticleLayout } from '../../_components/article-layout';
import { Callout } from '../../_components/callout';

export default function PlansPage() {
  return (
    <ArticleLayout
      title="Understanding Plans"
      description="Compare Toolkit vs Pro features"
      breadcrumbs={[
        { label: 'Getting Started', href: '/help/getting-started' },
        { label: 'Plans' },
      ]}
      relatedArticles={[
        { title: 'What is Agency Toolkit?', href: '/help/getting-started/overview' },
      ]}
    >
      <p>
        Agency Toolkit offers two plans: <strong>Toolkit</strong> (free) and <strong>Pro</strong> ($49/month).
        Our philosophy is simple: if it scales for free, we give it for free.
      </p>

      <h2>Toolkit (Free)</h2>

      <p>The free Toolkit plan includes everything you need to customize GHL:</p>

      <ul>
        <li><strong>Menu Customizer</strong> — Hide, rename, and reorder menu items</li>
        <li><strong>Login Designer</strong> — Customize the login page</li>
        <li><strong>Brand Colors</strong> — Apply your color theme</li>
        <li><strong>Loading Animations</strong> — Choose from 13 animations</li>
        <li><strong>TrustSignal</strong> — Social proof widget for your agency site</li>
        <li><strong>Unlimited Customers</strong> — No limit on sub-accounts</li>
      </ul>

      <Callout type="success" title="Free forever">
        The Toolkit plan is completely free with no hidden limits or trial periods.
        Use it as long as you want.
      </Callout>

      <h2>Pro ($49/month)</h2>

      <p>Pro adds powerful onboarding and personalization features:</p>

      <ul>
        <li><strong>Everything in Toolkit</strong></li>
        <li><strong>Guidely Tours</strong> — Step-by-step onboarding tours</li>
        <li><strong>Guidely Checklists</strong> — Interactive task lists</li>
        <li><strong>Guidely Smart Tips</strong> — Contextual tooltips</li>
        <li><strong>Guidely Banners</strong> — Announcements and alerts</li>
        <li><strong>Image Personalization</strong> — Generate personalized images</li>
        <li><strong>Priority Support</strong></li>
      </ul>

      <h2>TrustSignal for Customers</h2>

      <p>
        Want to add TrustSignal to your customer's websites? This is available as
        an add-on for <strong>$5/customer/month</strong> on the Pro plan.
      </p>

      <h2>Upgrading</h2>

      <p>
        You can upgrade to Pro at any time from <strong>Settings → Billing</strong>.
        Your customizations and customers are preserved when you upgrade.
      </p>

      <Callout type="tip" title="Try before you buy">
        With our "soft gate" approach, you can explore all Pro features before upgrading.
        Build your tours and checklists, then upgrade when you're ready to publish.
      </Callout>
    </ArticleLayout>
  );
}
