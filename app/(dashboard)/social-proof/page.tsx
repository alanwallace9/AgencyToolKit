import { redirect } from 'next/navigation';
import { getCurrentAgency } from '@/lib/auth';
import { PageHeader } from '@/components/shared/page-header';
import { SocialProofClient } from './_components/social-proof-client';
import { getWidgets } from './_actions/social-proof-actions';
import { SOCIAL_PROOF_WIDGET_LIMITS } from '@/types/database';

export default async function SocialProofPage() {
  const agency = await getCurrentAgency();

  if (!agency) {
    redirect('/sign-in');
  }

  const widgets = await getWidgets();
  const widgetLimit = SOCIAL_PROOF_WIDGET_LIMITS[agency.plan] || 0;

  // Check if feature is available for plan
  if (widgetLimit === 0) {
    return (
      <div className="py-8 px-8 lg:px-14 max-w-[1800px] mx-auto w-full">
        <PageHeader
          title="TrustSignal"
          description="Display real-time notifications to build trust and increase conversions"
        />
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="rounded-full bg-violet-100 p-4 mb-4">
            <svg
              className="h-8 w-8 text-violet-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-lg mb-2">Upgrade Required</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
            TrustSignal widgets are available on the Toolkit plan and above.
            Upgrade to start displaying trust-building notifications on your site.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-8 lg:px-14 max-w-[1800px] mx-auto w-full">
      <PageHeader
        title="TrustSignal"
        description="Display real-time notifications to build trust and increase conversions"
      />
      <SocialProofClient
        widgets={widgets}
        widgetLimit={widgetLimit}
        plan={agency.plan}
      />
    </div>
  );
}
