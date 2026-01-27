import { notFound } from 'next/navigation';
import { getCurrentAgency } from '@/lib/auth';
import { getSmartTip, getSmartTips } from '@/app/(dashboard)/tours/_actions/smart-tip-actions';
import { getThemes } from '@/app/(dashboard)/tours/_actions/theme-actions';
import { SmartTipsBuilder } from './_components/smart-tips-builder';

interface SmartTipPageProps {
  params: Promise<{ id: string }>;
}

export default async function GuidelySmartTipPage({ params }: SmartTipPageProps) {
  const { id } = await params;
  const agency = await getCurrentAgency();
  if (!agency) notFound();

  const [tip, allTips, themes] = await Promise.all([
    getSmartTip(id),
    getSmartTips(),
    getThemes(),
  ]);

  if (!tip) notFound();

  return (
    <SmartTipsBuilder
      tip={tip}
      allTips={allTips}
      themes={themes}
      ghlDomain={agency.ghl_domain}
      builderAutoClose={agency.builder_auto_close ?? true}
      backHref="/g/tips"
    />
  );
}
