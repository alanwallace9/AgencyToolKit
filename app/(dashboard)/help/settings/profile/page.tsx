'use client';

import { ArticleLayout } from '../../_components/article-layout';
import { Callout } from '../../_components/callout';
import { Screenshot } from '../../_components/screenshot';

export default function ProfilePage() {
  return (
    <ArticleLayout
      title="Profile Settings"
      description="Manage your agency name, token, and account details"
      breadcrumbs={[
        { label: 'Settings', href: '/help/settings' },
        { label: 'Profile' },
      ]}
      relatedArticles={[
        { title: 'Excluded locations', href: '/help/settings/excluded' },
        { title: 'Understanding plans', href: '/help/getting-started/plans' },
        { title: 'Deleting your account', href: '/help/settings/delete' },
      ]}
    >
      <p>
        The Profile page shows your agency details and provides access to your agency
        token. Navigate to <strong>Settings → General</strong> to view and manage these settings.
      </p>

      <hr />

      <Screenshot
        src="/help/settings/profile-page.png"
        alt="Profile settings page showing Agency Details card with Agency Name (editable), Email, Pro plan badge, and Agency Token with copy button, alongside the settings sidebar"
        caption="The Profile page — agency name, email, plan, and token"
        size="lg"
      />

      <h2>Agency Details</h2>

      <h3>Agency Name</h3>
      <p>
        Your agency name is shown at the top of the settings card. Click the pencil
        icon to edit it inline. Press <strong>Enter</strong> or click the checkmark to
        save, or <strong>Escape</strong> to cancel.
      </p>

      <h3>Email</h3>
      <p>
        Your email address from your login provider (Clerk). This is read-only in
        Agency Toolkit — to change your email, update it through your account provider.
      </p>

      <h3>Plan</h3>
      <p>
        Shows your current plan as a badge: <strong>Toolkit</strong> (free) or{' '}
        <strong>Pro</strong> ($49/month). To change your plan, visit{' '}
        <strong>Settings → Billing</strong>.
      </p>

      <hr />

      <h2>Agency Token</h2>

      <p>
        Your agency token (e.g., <code>rp_abc123</code>) is the unique identifier used
        in your embed script. It&apos;s displayed in a monospace code field with a copy button.
      </p>

      <Callout type="info">
        The agency token is auto-generated when your account is created and can&apos;t be
        changed. It&apos;s used in the embed script URL to load your customizations:
        <br />
        <code>{'<script src="https://app.agencytoolkit.com/embed.js?key=YOUR_TOKEN"></script>'}</code>
      </Callout>

      <Callout type="warning" title="Keep your token private">
        Your agency token identifies your account. Don&apos;t share it publicly or
        commit it to public repositories.
      </Callout>
    </ArticleLayout>
  );
}
