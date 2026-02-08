'use client';

import { ArticleLayout } from '../../_components/article-layout';
import { Callout } from '../../_components/callout';
import { Screenshot } from '../../_components/screenshot';
import { StepSection } from '../../_components/step-section';

export default function EventsPage() {
  return (
    <ArticleLayout
      title="Setting Up Events"
      description="Understand how social proof events are captured and managed"
      breadcrumbs={[
        { label: 'TrustSignal', href: '/help/trustsignal' },
        { label: 'Events' },
      ]}
      relatedArticles={[
        { title: 'Installing the widget', href: '/help/trustsignal/widget' },
      ]}
    >
      <p>
        TrustSignal events are the social proof notifications that appear on your
        website. Events are captured automatically from verified sources — no manual
        data entry needed. Each event becomes a notification that rotates in your
        TrustSignal widget.
      </p>

      <hr />

      <h2>Event Sources</h2>

      <p>Events come from 4 verified sources:</p>

      <ul>
        <li><strong>Auto-captured</strong> — Form submissions detected on your website (shown with a green badge)</li>
        <li><strong>Google Reviews</strong> — Imported from Google Business Profile (blue badge)</li>
        <li><strong>Webhook</strong> — External integrations like Zapier or Make (orange badge)</li>
        <li><strong>Stripe</strong> — Payment events like purchases and subscriptions (pink badge)</li>
      </ul>

      <Callout type="info" title="Verified data only">
        TrustSignal only displays events from verified sources. There&apos;s no option to
        manually create fake events — this ensures your social proof is authentic and
        builds real trust with visitors.
      </Callout>

      <hr />

      <h2>Event Data</h2>

      <p>Each event captures:</p>

      <ul>
        <li><strong>First Name</strong> — The person&apos;s name</li>
        <li><strong>Business Name</strong> — Company or business (if available)</li>
        <li><strong>City</strong> — Location from IP geolocation or Google data</li>
        <li><strong>Event Type</strong> — What happened (signup, purchase, review, etc.)</li>
        <li><strong>Source</strong> — How the event was captured</li>
        <li><strong>Timestamp</strong> — When it happened</li>
      </ul>

      <hr />

      <h2>Managing Events</h2>

      <StepSection number={1} title="View Events">
        <p>
          Open a widget and go to the <strong>Events</strong> tab. Events are listed in
          a table with columns for name, business, city, type, source, time, and visibility.
          Use the source filter dropdown to show events from a specific source.
        </p>

        <Screenshot
          src="/help/trustsignal/events-table.png"
          alt="Events tab showing 4 auto-captured events in a table with Name, Business, City, Type, Source badge, Time, and Visible columns, plus a live notification preview on the right"
          caption="The events table with source badges, visibility toggles, and live preview"
          size="lg"
        />
      </StepSection>

      <hr />

      <StepSection number={2} title="Toggle Visibility">
        <p>
          Each event has a visibility checkbox. Uncheck it to hide the event from your
          widget without deleting it. This is useful for filtering out irrelevant
          submissions or test entries.
        </p>
      </StepSection>

      <hr />

      <StepSection number={3} title="Bulk Actions">
        <p>
          Select multiple events with the checkboxes, then use the bulk action buttons:
        </p>
        <ul>
          <li><strong>Show</strong> — Make all selected events visible</li>
          <li><strong>Hide</strong> — Hide all selected events</li>
          <li><strong>Delete</strong> — Permanently remove selected events</li>
        </ul>
        <p>
          A counter badge shows how many events are selected.
        </p>
      </StepSection>

      <hr />

      <h2>Getting Events</h2>

      <p>
        Events start appearing automatically once the TrustSignal widget code is
        installed on your website. The widget detects form submissions and captures
        them as events.
      </p>

      <p>For additional event sources:</p>

      <ul>
        <li><strong>Google Reviews</strong> — Connect your Google Business Profile in the widget settings</li>
        <li><strong>Webhooks</strong> — Set up integrations with external tools to push events</li>
        <li><strong>Stripe</strong> — Connect your Stripe account for payment notifications</li>
      </ul>

      <Callout type="tip" title="Start with auto-capture">
        The simplest way to get started is to install the widget code and let it auto-capture
        form submissions. You can add Google Reviews and other sources later.
      </Callout>
    </ArticleLayout>
  );
}
