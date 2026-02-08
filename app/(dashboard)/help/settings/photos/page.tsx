'use client';

import { ArticleLayout } from '../../_components/article-layout';
import { Callout } from '../../_components/callout';
import { Screenshot } from '../../_components/screenshot';

export default function PhotosPage() {
  return (
    <ArticleLayout
      title="Photo Uploads"
      description="Configure customer photo uploads during onboarding"
      breadcrumbs={[
        { label: 'Settings', href: '/help/settings' },
        { label: 'Photo Uploads' },
      ]}
      relatedArticles={[
        { title: 'Creating your first tour', href: '/help/guidely/first-tour' },
        { title: 'Profile settings', href: '/help/settings/profile' },
      ]}
    >
      <p>
        Photo Uploads let your customers upload photos during onboarding tours.
        When enabled, customers can submit images that you can use for
        personalized content. All settings auto-save as you change them.
      </p>

      <Screenshot
        src="/help/settings/photo-uploads.png"
        alt="Photo Uploads settings card with toggle for allowing customer photo uploads, a disabled text positioning option marked Coming Soon, and notification settings with method selector"
        caption="The Photo Uploads card — upload toggle, text positioning (coming soon), and notifications"
        size="lg"
      />

      <hr />

      <h2>Allow Photo Uploads</h2>

      <p>
        Toggle <strong>Allow customers to upload photos</strong> to enable or
        disable the photo upload feature during onboarding tours. When enabled,
        customers see a photo upload step in their onboarding flow.
      </p>

      <hr />

      <h2>Text Positioning</h2>

      <p>
        The <strong>Let customers position the text box</strong> option will allow
        customers to drag and reposition text overlays on their uploaded photos.
        This is an advanced feature that&apos;s currently marked as{' '}
        <strong>Coming Soon</strong>.
      </p>

      <hr />

      <h2>Upload Notifications</h2>

      <p>
        Enable <strong>Notify me when a photo is uploaded</strong> to get alerted
        whenever a customer submits a photo. You can choose between two
        notification methods:
      </p>

      <ul>
        <li>
          <strong>In-App Notification</strong> — Receive notifications directly in
          Agency Toolkit
        </li>
        <li>
          <strong>Webhook to GHL</strong> — Send a webhook to GoHighLevel so you
          can trigger automations when photos are uploaded
        </li>
      </ul>

      <h3>Setting Up Webhooks</h3>

      <p>
        If you choose the webhook method:
      </p>

      <ol>
        <li>In GHL, go to <strong>Automation → Workflows</strong></li>
        <li>Create a new workflow with an <strong>Inbound Webhook</strong> trigger</li>
        <li>Copy the webhook URL from GHL</li>
        <li>Paste it into the <strong>Webhook URL</strong> field in Agency Toolkit</li>
      </ol>

      <Callout type="tip" title="Use webhooks for automation">
        Webhooks let you build GHL automations around photo uploads — like
        notifying your team in Slack, sending a follow-up email, or creating a
        task in your CRM pipeline.
      </Callout>

      <Callout type="info">
        All changes to photo upload settings are saved automatically. You&apos;ll see
        a brief &quot;Saving...&quot; indicator when a change is being saved.
      </Callout>
    </ArticleLayout>
  );
}
