'use client';

import { ArticleLayout } from '../../_components/article-layout';
import { Callout } from '../../_components/callout';
import { CodeBlock } from '../../_components/code-block';
import { Screenshot } from '../../_components/screenshot';
import { StepSection } from '../../_components/step-section';

export default function UrlsPage() {
  return (
    <ArticleLayout
      title="Generating Personalized URLs"
      description="Use personalized images in GHL workflows, emails, and SMS"
      breadcrumbs={[
        { label: 'Images', href: '/help/images' },
        { label: 'URLs' },
      ]}
      relatedArticles={[
        { title: 'Creating image templates', href: '/help/images/templates' },
        { title: 'Using the image editor', href: '/help/images/editor' },
      ]}
    >
      <Callout type="info" title="Pro Feature">
        Image Personalization requires the <strong>Pro plan</strong> ($49/month).
      </Callout>

      <p>
        Once your template is styled in the editor, switch to the <strong>URLs</strong> tab
        to get links you can use in GHL workflows, emails, and SMS messages. Each URL
        includes a merge tag that dynamically inserts the recipient&apos;s name.
      </p>

      <hr />

      <Screenshot
        src="/help/images/urls-tab.png"
        alt="URLs tab showing Test Link, GHL Workflow URL with merge tag, and HTML Image Tag with copy buttons, plus a live preview with the personalized image on the right"
        caption="The URLs tab — ready-to-use links with copy buttons and live preview"
        size="lg"
      />

      <h2>URL Types</h2>

      <h3>Test URL</h3>
      <p>Preview your image with a sample name to verify it looks right.</p>
      <CodeBlock label="Test URL" copyable>
{`https://app.agencytoolkit.com/api/images/YOUR_TEMPLATE_ID?name=Sarah`}
      </CodeBlock>

      <h3>GHL Workflow URL</h3>
      <p>
        The main URL for use in GHL. The merge tag <code>{'{{contact.first_name}}'}</code> is
        replaced with the actual contact name when GHL sends the email or SMS.
      </p>
      <CodeBlock label="GHL Workflow URL" copyable>
{`https://app.agencytoolkit.com/api/images/YOUR_TEMPLATE_ID?name={{contact.first_name}}`}
      </CodeBlock>

      <h3>HTML Image Tag</h3>
      <p>For email builders that need complete HTML:</p>
      <CodeBlock label="HTML Image Tag" copyable>
{`<img src="https://app.agencytoolkit.com/api/images/YOUR_TEMPLATE_ID?name={{contact.first_name}}" alt="Personalized image" />`}
      </CodeBlock>

      <hr />

      <h2>Available Merge Tags</h2>

      <ul>
        <li><code>{'{{contact.first_name}}'}</code> — First name (most common)</li>
        <li><code>{'{{contact.last_name}}'}</code> — Last name</li>
        <li><code>{'{{contact.full_name}}'}</code> — Full name</li>
        <li><code>{'{{contact.company_name}}'}</code> — Company name</li>
        <li><code>{'{{contact.city}}'}</code> — City</li>
        <li><code>{'{{custom_values.xxx}}'}</code> — Any custom field</li>
      </ul>

      <hr />

      <h2>Using in GHL</h2>

      <StepSection number={1} title="In Emails">
        <p>
          In the GHL email builder, add an <strong>Image</strong> block and paste the
          workflow URL as the image source. The merge tag resolves when the email is sent,
          so each recipient sees their personalized image.
        </p>
      </StepSection>

      <hr />

      <StepSection number={2} title="In SMS">
        <p>
          Paste the workflow URL directly into your SMS message. Most carriers
          will show an image preview when the recipient opens the message.
        </p>
      </StepSection>

      <hr />

      <StepSection number={3} title="In Workflows">
        <p>
          Add the image URL to any GHL workflow step. Common triggers:
        </p>
        <ul>
          <li><strong>Contact Created</strong> — Welcome message with personalized image</li>
          <li><strong>Appointment Completed</strong> — Follow-up with review request</li>
        </ul>

        <Callout type="tip" title="Add a delay">
          When using in automated workflows, add a 10–15 minute delay between the trigger
          and the email/SMS step. This makes the message feel more personal and less automated.
        </Callout>
      </StepSection>

      <hr />

      <h2>Tracking Image Opens</h2>

      <p>
        Wrap your image URL in a <strong>GHL Trigger Link</strong> to track when
        recipients open the image:
      </p>

      <ol>
        <li>Go to <strong>Marketing → Trigger Links</strong> in GHL</li>
        <li>Click <strong>Create</strong></li>
        <li>Paste your personalized image URL</li>
        <li>Use the generated trigger link URL in your workflow instead</li>
      </ol>

      <p>
        This lets you track opens and determine whether contacts are engaging with
        your emails vs SMS.
      </p>
    </ArticleLayout>
  );
}
