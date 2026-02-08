'use client';

import { ArticleLayout } from '../../_components/article-layout';
import { Callout } from '../../_components/callout';
import { Screenshot } from '../../_components/screenshot';
import { StepSection } from '../../_components/step-section';

export default function ChecklistsPage() {
  return (
    <ArticleLayout
      title="Building Checklists"
      description="Guide users through setup tasks with interactive progress tracking"
      breadcrumbs={[
        { label: 'Guidely', href: '/help/guidely' },
        { label: 'Checklists' },
      ]}
      relatedArticles={[
        { title: 'Creating your first tour', href: '/help/guidely/first-tour' },
        { title: 'Themes & styling', href: '/help/guidely/themes' },
      ]}
    >
      <Callout type="info" title="Pro Feature">
        Checklists are part of the Guidely suite and require the <strong>Pro plan</strong> ($49/month).
      </Callout>

      <p>
        Checklists help users complete setup tasks and track their progress. They appear
        as a floating widget that users can expand to see remaining tasks, check off
        completed items, and follow a guided path through your platform.
      </p>

      <hr />

      <h2>Creating a Checklist</h2>

      <StepSection number={1} title="Create a New Checklist">
        <p>
          Navigate to <strong>Guidely → Checklists</strong> and click <strong>+ New Checklist</strong>.
        </p>
        <ul>
          <li><strong>Name</strong> (required) — A name for your reference</li>
          <li><strong>From Template</strong> (optional) — Start from a pre-built template</li>
        </ul>
      </StepSection>

      <hr />

      <StepSection number={2} title="Add Checklist Items">
        <Screenshot
          src="/help/guidely/checklist-builder.png"
          alt="Checklist builder showing 4 items on the left and a live preview widget on the right with progress tracking and Get Started button"
          caption="The checklist builder with item list and live widget preview"
          size="lg"
        />

        <p>
          In the builder, the left panel shows your item list. Click <strong>Add Item</strong>
          to create tasks. For each item, configure:
        </p>
        <ul>
          <li><strong>Title</strong> (required) — The task name users will see</li>
          <li><strong>Description</strong> (optional) — Additional instructions or context</li>
        </ul>

        <h3>Completion Triggers</h3>
        <p>Choose how items get checked off:</p>
        <ul>
          <li><strong>Manual</strong> — User clicks to mark complete</li>
          <li><strong>Tour Complete</strong> — Auto-completes when a linked tour finishes</li>
          <li><strong>URL Visited</strong> — Auto-completes when user visits a specific page</li>
          <li><strong>Element Clicked</strong> — Auto-completes when user clicks a specific element</li>
          <li><strong>JS Event</strong> — Auto-completes when a custom JavaScript event fires</li>
        </ul>

        <h3>Item Actions</h3>
        <p>Optionally trigger an action when the user clicks an item:</p>
        <ul>
          <li><strong>Launch Tour</strong> — Start a specific tour</li>
          <li><strong>Open URL</strong> — Navigate to a page (optionally in a new tab)</li>
          <li><strong>JS Event</strong> — Fire a custom event</li>
          <li><strong>None</strong> — No action, just a checkbox</li>
        </ul>

        <Callout type="tip" title="Link tours to checklists">
          The most powerful pattern is linking tours to checklist items. When a user clicks
          a checklist task, the associated tour starts. When they complete the tour, the
          checklist item checks itself off automatically.
        </Callout>
      </StepSection>

      <hr />

      <StepSection number={3} title="Configure Widget Settings">
        <p>
          Switch to the <strong>Settings</strong> tab to customize the widget:
        </p>
        <ul>
          <li><strong>Title &amp; Description</strong> — What users see at the top of the checklist</li>
          <li><strong>Widget Position</strong> — Bottom Left or Bottom Right of the screen</li>
          <li><strong>Default State</strong> — Start Expanded or Minimized</li>
          <li><strong>Minimized Text</strong> — Label shown when the widget is collapsed</li>
          <li><strong>CTA Text</strong> — Call-to-action button text</li>
        </ul>

        <h3>Completion Action</h3>
        <p>What happens when all items are checked off:</p>
        <ul>
          <li><strong>None</strong> — Nothing special happens</li>
          <li><strong>Celebration</strong> — Confetti animation on completion</li>
          <li><strong>Redirect</strong> — Navigate to a specific URL</li>
        </ul>

        <h3>Targeting</h3>
        <p>
          Control which pages and customers see the checklist using URL patterns
          and customer targeting rules.
        </p>
      </StepSection>

      <hr />

      <StepSection number={4} title="Apply a Theme &amp; Publish">
        <p>
          Use the <strong>Theme</strong> tab to select a visual theme, then click
          <strong> Publish</strong> when ready. The checklist widget will appear for
          matching users in your GHL sub-accounts.
        </p>
      </StepSection>

      <hr />

      <h2>Checklist Analytics</h2>

      <p>Track engagement from the checklists list view:</p>

      <ul>
        <li><strong>Items</strong> — Total number of tasks in the checklist</li>
        <li><strong>In Progress</strong> — Customers actively working through tasks</li>
        <li><strong>Completed</strong> — Customers who finished all tasks</li>
      </ul>

      <hr />

      <h2>Managing Checklists</h2>

      <p>From the list view, use the actions menu to:</p>

      <ul>
        <li><strong>Rename</strong>, <strong>Change Tag</strong>, <strong>Duplicate</strong>, <strong>Archive</strong>, or <strong>Delete</strong></li>
      </ul>

      <p>
        Items within a checklist can be reordered by dragging in the left panel of the builder.
        Changes auto-save as you work.
      </p>
    </ArticleLayout>
  );
}
