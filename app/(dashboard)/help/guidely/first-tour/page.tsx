'use client';

import { ArticleLayout } from '../../_components/article-layout';
import { Callout } from '../../_components/callout';
import { Screenshot } from '../../_components/screenshot';
import { StepSection } from '../../_components/step-section';

export default function FirstTourPage() {
  return (
    <ArticleLayout
      title="Creating Your First Tour"
      description="Build a step-by-step onboarding tour for your GHL sub-accounts"
      breadcrumbs={[
        { label: 'Guidely', href: '/help/guidely' },
        { label: 'First Tour' },
      ]}
      relatedArticles={[
        { title: 'Building checklists', href: '/help/guidely/checklists' },
        { title: 'Themes & styling', href: '/help/guidely/themes' },
        { title: 'Smart Tips', href: '/help/guidely/smart-tips' },
      ]}
    >
      <Callout type="info" title="Pro Feature">
        Tours are part of the Guidely suite and require the <strong>Pro plan</strong> ($49/month).
        You can build and preview tours on the free plan, but publishing requires Pro.
      </Callout>

      <p>
        Tours guide users through your GHL interface step-by-step. They&apos;re perfect
        for onboarding new clients, introducing new features, or walking users through
        complex workflows. Each tour consists of sequential steps that highlight specific
        elements on the page.
      </p>

      <hr />

      <h2>Creating a Tour</h2>

      <StepSection number={1} title="Open Tours">
        <p>
          Navigate to <strong>Guidely → Tours</strong> from the sidebar. You&apos;ll see
          your tours list with options to search, filter by status, and switch between
          grid and table views.
        </p>

        <Screenshot
          src="/help/guidely/tours-list.png"
          alt="Tours list page with Guidely sidebar, search bar, grid/table view toggle, and New Tour button"
          caption="The Tours list with search, filters, and view options"
          size="lg"
        />
      </StepSection>

      <hr />

      <StepSection number={2} title="Create a New Tour">
        <p>
          Click <strong>+ New Tour</strong> to open the create dialog:
        </p>
        <ul>
          <li><strong>Name</strong> (required) — Give your tour a descriptive name</li>
          <li><strong>Description</strong> (optional) — Add context for your reference</li>
          <li><strong>From Template</strong> (optional) — Start from a system or custom template to save time</li>
        </ul>
        <Screenshot
          src="/help/guidely/tour-create-dialog.png"
          alt="Create New Tour dialog with fields for Tour Name, Description, Target Subaccount, and Start With options"
          caption="The Create New Tour dialog"
          size="md"
        />

        <Callout type="tip" title="Templates save time">
          If you&apos;ve created tours before, you can save any tour as a template
          from the builder&apos;s More menu. Templates include all steps and settings.
        </Callout>
      </StepSection>

      <hr />

      <StepSection number={3} title="Add Steps in the Builder">
        <Screenshot
          src="/help/guidely/tour-step-editor.png"
          alt="Tour builder with step list on left, step settings in center showing Type, Title, Content editor, Target Element selector, and live tooltip preview on right"
          caption="The tour builder — step list, step editor, and live preview"
          size="lg"
        />

        <p>
          The tour builder opens with a 3-panel layout:
        </p>
        <ul>
          <li><strong>Left Panel</strong> — Step list with drag-to-reorder</li>
          <li><strong>Center Panel</strong> — Step editor for the selected step</li>
          <li><strong>Right Panel</strong> — Live preview</li>
        </ul>

        <p>Click <strong>Add Step</strong> in the left panel to create a new step. For each step, configure:</p>

        <h3>Step Type</h3>
        <ul>
          <li><strong>Modal</strong> — Center-focused dialog box (positions: Center, Top, Bottom)</li>
          <li><strong>Tooltip</strong> — Positioned near a target element (positions: Top, Right, Bottom, Left)</li>
          <li><strong>Banner</strong> — Full-width bar at the top or bottom of the page</li>
          <li><strong>Hotspot</strong> — Clickable beacon that reveals content on interaction</li>
          <li><strong>Slideout</strong> — Panel sliding from Bottom Right or Bottom Left</li>
        </ul>

        <h3>Step Content</h3>
        <ul>
          <li><strong>Title</strong> — Step heading</li>
          <li><strong>Content</strong> — Rich text description or instructions</li>
          <li><strong>Element Selector</strong> — CSS selector for the target element on the page</li>
          <li><strong>Media</strong> — Optionally attach an image, video, or GIF</li>
        </ul>

        <h3>Step Settings</h3>
        <ul>
          <li><strong>Show Overlay</strong> — Dim the background to focus attention</li>
          <li><strong>Highlight Element</strong> — Visually highlight the target element</li>
          <li><strong>Allow Interaction</strong> — Let users interact with the highlighted element</li>
          <li><strong>Buttons</strong> — Configure primary and secondary button text and actions (Next, Previous, Custom URL, etc.)</li>
        </ul>
      </StepSection>

      <hr />

      <StepSection number={4} title="Configure Targeting">
        <p>
          Switch to the <strong>Targeting</strong> tab to control when and where the tour appears:
        </p>
        <ul>
          <li><strong>URL patterns</strong> — Show on specific pages or all pages</li>
          <li><strong>Element conditions</strong> — Only show when certain elements exist</li>
          <li><strong>User targeting</strong> — Target new users, returning users, or specific segments</li>
          <li><strong>Device targeting</strong> — Desktop, tablet, or mobile</li>
        </ul>
      </StepSection>

      <hr />

      <StepSection number={5} title="Apply a Theme">
        <p>
          Switch to the <strong>Theme</strong> tab to select a visual theme for your tour.
          Themes control colors, typography, button styles, and more. Use a system theme
          or create your own in <strong>Guidely → Themes</strong>.
        </p>
      </StepSection>

      <hr />

      <StepSection number={6} title="Publish">
        <p>
          When you&apos;re ready, click the <strong>Publish</strong> button in the top-right
          corner. This changes the tour status from Draft to Live, making it visible
          to users in your GHL sub-accounts.
        </p>

        <Callout type="info">
          You can unpublish a tour at any time to take it offline without deleting it.
          Archived tours are hidden from the list but can be restored.
        </Callout>
      </StepSection>

      <hr />

      <h2>Managing Tours</h2>

      <p>From the tours list, use the actions menu on any tour to:</p>

      <ul>
        <li><strong>Rename</strong> — Edit the tour name inline</li>
        <li><strong>Change Tag</strong> — Assign a color-coded tag for organization</li>
        <li><strong>Duplicate</strong> — Create a copy of the tour with all steps</li>
        <li><strong>Save as Template</strong> — Save for reuse as a starting point</li>
        <li><strong>Archive</strong> — Hide without deleting</li>
        <li><strong>Delete</strong> — Permanently remove (with confirmation)</li>
      </ul>

      <hr />

      <h2>Tour Analytics</h2>

      <p>
        Each tour tracks engagement metrics visible in the list view:
      </p>

      <ul>
        <li><strong>Views</strong> — Total times the tour was shown to users</li>
        <li><strong>Completions</strong> — Times users finished all steps</li>
        <li><strong>Completion Rate</strong> — Percentage of viewers who completed the tour</li>
      </ul>

      <hr />

      <h2>Builder Shortcuts</h2>

      <ul>
        <li><strong>Undo / Redo</strong> — Full history support (up to 50 states)</li>
        <li><strong>Auto-save</strong> — Changes save automatically as you work</li>
        <li><strong>Drag-to-reorder</strong> — Rearrange steps by dragging in the left panel</li>
        <li><strong>Duplicate step</strong> — Copy a step to quickly create similar ones</li>
      </ul>
    </ArticleLayout>
  );
}
