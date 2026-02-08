'use client';

import { ArticleLayout } from '../../_components/article-layout';
import { Callout } from '../../_components/callout';
import { Screenshot } from '../../_components/screenshot';

export default function MenuPage() {
  return (
    <ArticleLayout
      title="Menu Customizer"
      description="Hide, rename, and reorder sidebar menu items"
      breadcrumbs={[
        { label: 'Theme Builder', href: '/help/theme-builder' },
        { label: 'Menu Customizer' },
      ]}
      relatedArticles={[
        { title: 'Brand Colors', href: '/help/theme-builder/colors' },
        { title: 'Installing the embed script', href: '/help/getting-started/embed-script' },
      ]}
    >
      <p>
        The Menu Customizer lets you control which sidebar items appear in your GHL
        sub-accounts. Hide features you don't use, rename items to match your
        terminology, and reorder them for better organization.
      </p>

      <Screenshot
        src="/help/theme-builder/menu-editor.png"
        alt="Menu Customizer with templates panel, GHL sidebar preview, and toggle list for hiding and renaming items"
        caption="The Menu Customizer — templates, live preview, and item controls"
        size="lg"
      />

      <h2>Accessing the Menu Customizer</h2>

      <p>
        Navigate to <strong>Theme Builder → Menu</strong> or click <strong>Menu</strong> in
        the sidebar under the Customize dropdown.
      </p>

      <h2>Hiding Menu Items</h2>

      <p>
        Toggle the switch next to any menu item to hide it from your sub-accounts.
        Hidden items are grayed out in the editor but won't appear in GHL.
      </p>

      <Callout type="tip" title="Start minimal">
        Most agencies hide 50-70% of menu items. Focus on what your clients actually use
        and hide the rest to reduce confusion.
      </Callout>

      <h2>Renaming Items</h2>

      <p>
        Click on any menu item label to edit it. For example, you might rename:
      </p>

      <ul>
        <li>"Reputation" → "Reviews"</li>
        <li>"Conversations" → "Inbox"</li>
        <li>"Marketing" → "Campaigns"</li>
      </ul>

      <h2>Reordering Items</h2>

      <p>
        Drag and drop menu items to reorder them. Items you use most frequently
        should be near the top.
      </p>

      <h2>Banner Options</h2>

      <p>
        At the bottom of the menu editor, you can hide:
      </p>

      <ul>
        <li><strong>Promotional banners</strong> — GHL upsell messages</li>
        <li><strong>Warning banners</strong> — Connection warnings, trial notices</li>
        <li><strong>Connect prompts</strong> — Setup prompts for integrations</li>
      </ul>

      <Screenshot
        src="/help/theme-builder/menu-banner-options.png"
        alt="Banner and Notification Options with toggles for promotional banners, warning banners, and connect prompts"
        caption="Toggle off GHL banners and notifications you don't want clients to see"
        size="md"
      />

      <h2>Saving & Applying</h2>

      <p>
        Changes are auto-saved as you make them. They apply to all sub-accounts
        the next time the embed script loads (usually on page refresh).
      </p>

      <Callout type="info">
        Menu customizations use CSS to hide and rename items. This is fast and doesn't
        affect GHL functionality — hidden features are still accessible via direct URL.
      </Callout>
    </ArticleLayout>
  );
}
