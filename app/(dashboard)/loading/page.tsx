import { PageHeader } from '@/components/shared/page-header';
import { LoadingClient } from './_components/loading-client';
import { getLoadingSettings } from './_actions/loading-actions';

export default async function LoadingAnimationsPage() {
  const { loading, colors } = await getLoadingSettings();

  return (
    <>
      <PageHeader
        title="Loading Animations"
        description="Choose a loading animation for your GHL dashboard"
      />

      <LoadingClient initialConfig={loading} brandColors={colors} />
    </>
  );
}
