'use client';

import { ArticleLayout } from '../../_components/article-layout';
import { Callout } from '../../_components/callout';
import { Screenshot } from '../../_components/screenshot';
import { StepSection } from '../../_components/step-section';

export default function TemplatesPage() {
  return (
    <ArticleLayout
      title="Creating Image Templates"
      description="Upload a base image and set up personalized text overlays"
      breadcrumbs={[
        { label: 'Images', href: '/help/images' },
        { label: 'Templates' },
      ]}
      relatedArticles={[
        { title: 'Using the image editor', href: '/help/images/editor' },
        { title: 'Generating personalized URLs', href: '/help/images/urls' },
      ]}
    >
      <Callout type="info" title="Pro Feature">
        Image Personalization requires the <strong>Pro plan</strong> ($49/month).
      </Callout>

      <p>
        Image templates are the foundation for personalized images. Upload a team photo,
        marketing graphic, or review card — then use the editor to position where the
        customer&apos;s name will appear. The result is a unique image for each contact,
        generated on-the-fly via a URL with GHL merge tags.
      </p>

      <hr />

      <h2>Creating a Template</h2>

      <StepSection number={1} title="Navigate to Images">
        <p>
          Click <strong>Images</strong> in the main navigation. You&apos;ll see your
          existing templates with thumbnails, names, render counts, and creation dates.
        </p>

        <Screenshot
          src="/help/images/templates-list.png"
          alt="Image Personalization page showing two template cards with personalized name overlays, render counts, and New Template button"
          caption="The templates list with thumbnails, render counts, and actions"
          size="lg"
        />
      </StepSection>

      <hr />

      <StepSection number={2} title="Add a New Template">
        <p>
          Click <strong>+ New Template</strong> to open the creation dialog.
        </p>

        <h3>Upload Your Image</h3>
        <p>
          Drag and drop an image into the upload zone, or click to browse files. You can
          also paste a public image URL from GHL Media Storage, Google Drive, or any
          public source.
        </p>
        <ul>
          <li>Supported formats: <strong>JPG, PNG, WebP</strong></li>
          <li>Maximum size: <strong>3MB</strong></li>
        </ul>

        <h3>Name Your Template</h3>
        <p>
          The template name auto-populates from the filename. You can customize it to
          something descriptive like &quot;Bill&apos;s Team Photo&quot; or &quot;Christmas 2024 Card&quot;.
        </p>

        <h3>Assign a Customer (Optional)</h3>
        <p>
          Use the dropdown to associate the template with a specific customer. This
          helps organize templates when you have multiple sub-accounts.
        </p>
      </StepSection>

      <hr />

      <StepSection number={3} title="Open the Editor">
        <p>
          After creating the template, you&apos;re automatically taken to the image editor
          where you can position and style the text overlay. See{' '}
          <a href="/help/images/editor">Using the Image Editor</a> for details.
        </p>
      </StepSection>

      <hr />

      <h2>Managing Templates</h2>

      <p>From the templates list, you can:</p>

      <ul>
        <li><strong>Edit</strong> — Open the editor to adjust text positioning and styling</li>
        <li><strong>Duplicate</strong> — Create a copy to make variations</li>
        <li><strong>Delete</strong> — Permanently remove a template</li>
      </ul>

      <p>
        Each template shows its <strong>render count</strong> — the number of times
        personalized images have been generated from it.
      </p>

      <Callout type="tip" title="Use descriptive names">
        If you create templates for different campaigns or customers, use clear names
        so you can find them quickly. The customer association also helps with filtering.
      </Callout>
    </ArticleLayout>
  );
}
