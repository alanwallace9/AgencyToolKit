'use client';

import { ArticleLayout } from '../../_components/article-layout';
import { Callout } from '../../_components/callout';
import { Screenshot } from '../../_components/screenshot';

export default function DeletePage() {
  return (
    <ArticleLayout
      title="Deleting Your Account"
      description="How to remove your data"
      breadcrumbs={[
        { label: 'Settings', href: '/help/settings' },
        { label: 'Delete Account' },
      ]}
      relatedArticles={[]}
    >
      <p>
        You can delete your Agency Toolkit account at any time. This will remove
        all your data including customers, customizations, and settings.
      </p>

      <Callout type="warning" title="This action is permanent">
        Account deletion cannot be undone. Make sure to export any data you want
        to keep before deleting your account.
      </Callout>

      <Screenshot
        src="/help/settings/danger-zone.png"
        alt="Danger Zone settings page with red warning banner, list of what gets deleted (customers, tours, presets, templates, subscriptions), and red Delete Account button"
        caption="The Danger Zone — warning, deletion details, and confirmation button"
        size="lg"
      />

      <h2>How to Delete</h2>

      <ol>
        <li>Go to <strong>Settings → Danger Zone</strong></li>
        <li>Click <strong>Delete Account</strong></li>
        <li>Type <strong>DELETE</strong> to confirm</li>
        <li>Click <strong>Delete My Account</strong></li>
      </ol>

      <h2>What Gets Deleted</h2>

      <ul>
        <li>Your agency profile</li>
        <li>All customers</li>
        <li>Menu presets</li>
        <li>Login designs</li>
        <li>Tours, checklists, tips, and banners</li>
        <li>Image templates</li>
        <li>TrustSignal events</li>
        <li>Analytics data</li>
      </ul>

      <Callout type="info">
        The embed script will stop working immediately after deletion.
        GHL will return to its default appearance.
      </Callout>
    </ArticleLayout>
  );
}
