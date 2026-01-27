import { Lightbulb } from 'lucide-react';
import { getCurrentAgency } from '@/lib/auth';
import { getSmartTipsWithStats } from '@/app/(dashboard)/tours/_actions/smart-tip-actions';
import { getThemes } from '@/app/(dashboard)/tours/_actions/theme-actions';
import { TipsListClient } from './_components/tips-list-client';

export default async function GuidelyTipsPage() {
  const agency = await getCurrentAgency();
  if (!agency) return null;

  const [tips, themes] = await Promise.all([
    getSmartTipsWithStats(),
    getThemes(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Smart Tips</h1>
        <p className="text-muted-foreground">
          Contextual tooltips that help your customers understand your interface
        </p>
      </div>

      {/* Tips list */}
      <TipsListClient
        tips={tips}
        themes={themes}
      />
    </div>
  );
}
