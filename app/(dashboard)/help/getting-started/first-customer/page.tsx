'use client';

import { ArticleLayout } from '../../_components/article-layout';
import { Callout } from '../../_components/callout';
import { Screenshot } from '../../_components/screenshot';
import { StepSection } from '../../_components/step-section';

export default function FirstCustomerPage() {
  return (
    <ArticleLayout
      title="Adding Your First Customer"
      description="Set up your first sub-account in minutes"
      breadcrumbs={[
        { label: 'Getting Started', href: '/help/getting-started' },
        { label: 'First Customer' },
      ]}
      relatedArticles={[
        { title: 'Installing the embed script', href: '/help/getting-started/embed-script' },
        { title: 'Understanding plans', href: '/help/getting-started/plans' },
      ]}
    >
      <p>
        Customers in Agency Toolkit represent your GHL sub-accounts. Adding a customer
        lets you track which sub-accounts are using your customizations and manage
        their settings.
      </p>

      <hr />

      <StepSection number={1} title="Navigate to Customers">
        <p>
          Click <strong>Customers</strong> in the main navigation to open the customers list.
          If you haven&apos;t added any customers yet, you&apos;ll see the empty state
          with a prompt to add your first one.
        </p>

        <Screenshot
          src="/help/customers/empty-state.png"
          alt="Customers page empty state showing Add Your First Customer button"
          caption="The Customers page before adding any customers"
          size="lg"
        />
      </StepSection>

      <hr />

      <StepSection number={2} title="Add a Customer">
        <ol>
          <li>Click the <strong>Add Your First Customer</strong> button (or <strong>+ Add Customer</strong> if you already have customers)</li>
          <li>Enter the customer&apos;s <strong>Customer Name</strong> (e.g., &quot;Acme Corp&quot;)</li>
          <li>Optionally add the <strong>GHL Location ID</strong> — found in GHL Settings → Business Info → Location ID</li>
          <li>Optionally add the <strong>Google Business Place ID</strong> — use the <a href="https://developers.google.com/maps/documentation/places/web-service/place-id" target="_blank" rel="noopener noreferrer">Place ID Finder</a> to look it up</li>
          <li>Click <strong>Add Customer</strong></li>
        </ol>

        <Screenshot
          src="/help/customers/add-customer-form.png"
          alt="Add Customer dialog with fields for Customer Name, GHL Location ID, and Google Business Place ID"
          caption="The Add Customer dialog with all three fields"
          size="md"
        />

        <Callout type="tip" title="Finding the GHL Location ID">
          In GHL, go to the sub-account&apos;s Settings → Business Info. The Location ID
          is shown in the account details. You can also find it in the URL when viewing
          a sub-account.
        </Callout>
      </StepSection>

      <hr />

      <StepSection number={3} title="View Your Customer">
        <p>
          After creating a customer, they appear in the customers list with their
          name, token, GHL location, status, and creation date.
        </p>

        <Screenshot
          src="/help/customers/customer-list.png"
          alt="Customers list showing a customer with token, GHL location, active status, and creation date"
          caption="Your customer list with Export CSV and Add Customer options"
          size="lg"
        />
      </StepSection>

      <hr />

      <StepSection number={4} title="Customer Details">
        <p>
          Click on any customer to view their detail page. From here you can:
        </p>

        <ul>
          <li>Edit the <strong>Customer Name</strong> or <strong>GHL Location ID</strong></li>
          <li>Add a <strong>Google Business Place ID</strong> to enable the GBP Dashboard URL</li>
          <li>Toggle <strong>Active Status</strong> — inactive customers won&apos;t load customizations</li>
          <li>Copy the <strong>Customer Token</strong> for integration use</li>
        </ul>

        <Screenshot
          src="/help/customers/customer-detail.png"
          alt="Customer detail page showing editable fields, active status toggle, and integration details"
          caption="The customer detail page with all settings and integration details"
          size="lg"
        />

        <Callout type="info">
          The customer token (e.g., <code>te_cca73e1b9924abb7</code>) is auto-generated
          and can&apos;t be changed. Use it to identify this customer in analytics and
          for customer-specific features.
        </Callout>
      </StepSection>

      <hr />

      <h2>Managing Customers</h2>

      <p>From the customers list, you can:</p>

      <ul>
        <li><strong>Edit</strong> — Update customer name, GHL Location ID, or Google Business Place ID</li>
        <li><strong>Toggle Active</strong> — Deactivate customers without deleting them</li>
        <li><strong>Delete</strong> — Permanently remove a customer via the actions menu</li>
        <li><strong>Export CSV</strong> — Download all customers as a spreadsheet</li>
      </ul>

      <hr />

      <h2>Customer Limits</h2>

      <p>
        Both Toolkit and Pro plans include <strong>unlimited customers</strong>.
        There&apos;s no limit to how many sub-accounts you can manage.
      </p>
    </ArticleLayout>
  );
}
