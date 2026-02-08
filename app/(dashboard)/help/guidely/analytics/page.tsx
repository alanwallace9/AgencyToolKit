'use client';

import { ArticleLayout } from '../../_components/article-layout';
import { Callout } from '../../_components/callout';
import { Screenshot } from '../../_components/screenshot';

export default function AnalyticsPage() {
  return (
    <ArticleLayout
      title="Analytics Dashboard"
      description="Track performance across tours, checklists, banners, and tips"
      breadcrumbs={[
        { label: 'Guidely', href: '/help/guidely' },
        { label: 'Analytics' },
      ]}
      relatedArticles={[
        { title: 'Creating your first tour', href: '/help/guidely/first-tour' },
        { title: 'Building checklists', href: '/help/guidely/checklists' },
        { title: 'Banners & announcements', href: '/help/guidely/banners' },
      ]}
    >
      <Callout type="info" title="Pro Feature">
        The Analytics Dashboard is available on the Pro plan. Upgrade to access
        performance metrics for all your Guidely features.
      </Callout>

      <p>
        The Analytics Dashboard gives you a single view of how your onboarding
        content is performing. See what&apos;s working, identify what needs
        improvement, and track engagement across all Guidely features.
      </p>

      <Screenshot
        src="/help/guidely/analytics-dashboard.png"
        alt="Guidely Analytics Dashboard showing time period tabs, 4 overview stat cards (Total Views, Tour Completions, Checklist Progress, Banner CTR), feature breakdown cards, and top performers tables"
        caption="The Analytics Dashboard — overview stats, feature breakdown, and top performers"
        size="lg"
      />

      <hr />

      <h2>Overview Stats</h2>

      <p>
        Four stat cards at the top provide a quick summary of your Guidely performance:
      </p>

      <ul>
        <li><strong>Total Views</strong> — Combined views across all features</li>
        <li><strong>Tour Completions</strong> — Number of users who finished a tour, with completion rate percentage</li>
        <li><strong>Checklist Progress</strong> — Users who completed checklists, plus how many are still in progress</li>
        <li><strong>Banner CTR</strong> — Click-through rate for banners, with total clicks and views</li>
      </ul>

      <hr />

      <h2>Needs Improvement</h2>

      <p>
        When any content is underperforming, a highlighted section appears
        automatically below the overview stats. It flags:
      </p>

      <ul>
        <li><strong>Tours with low completion</strong> — Tours where less than 30% of viewers finish the entire tour</li>
        <li><strong>Banners with low CTR</strong> — Banners with a click-through rate below 2%</li>
      </ul>

      <p>
        Click any item in the Needs Improvement section to go directly to its
        editor and make adjustments.
      </p>

      <Callout type="tip" title="Improve low-performing tours">
        If a tour has low completion, try reducing the number of steps, adding
        clearer instructions, or breaking it into multiple shorter tours. Users
        are more likely to complete 3-5 step tours than 10+ step ones.
      </Callout>

      <hr />

      <h2>Feature Breakdown</h2>

      <p>
        Four cards show detailed metrics for each Guidely feature:
      </p>

      <ul>
        <li><strong>Tours</strong> — Views, completions, and completion rate with a progress bar</li>
        <li><strong>Checklists</strong> — Total users, completed count, and completion rate</li>
        <li><strong>Banners</strong> — Views, clicks, and click-through rate</li>
        <li><strong>Smart Tips</strong> — Total displays and user interactions</li>
      </ul>

      <p>
        Each card also shows how many items are currently live.
      </p>

      <hr />

      <h2>Top Performers</h2>

      <p>
        Three tables rank your best-performing content:
      </p>

      <ul>
        <li><strong>Tours</strong> — Ranked by total completions</li>
        <li><strong>Checklists</strong> — Ranked by completions</li>
        <li><strong>Banners</strong> — Ranked by total clicks</li>
      </ul>

      <p>
        Each table shows up to 5 items with a <strong>View All</strong> link to
        see the full list. Click any item to jump to its editor.
      </p>

      <hr />

      <h2>Time Period & Export</h2>

      <p>
        Use the time period tabs at the top to filter analytics by date range.
        The <strong>Export</strong> button lets you download your analytics data
        for external reporting.
      </p>

      <hr />

      <h2>Coming Soon</h2>

      <p>
        <strong>Customer Progress Tracking</strong> — A future feature that will
        let you track individual customer progress through tours and checklists,
        helping you identify customers who are stuck and need follow-up.
      </p>
    </ArticleLayout>
  );
}
