import { Suspense } from 'react';
import { getCurrentAgency } from '@/lib/auth';
import {
  getGuidelyThemes,
  getSystemTemplates,
  getGuidelyDefaults,
} from './_actions/guidely-theme-actions';
import { ThemesListClient } from './_components/themes-list-client';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'Themes | Guidely',
  description: 'Manage visual themes for Tours, Smart Tips, Banners, and Checklists',
};

async function ThemesContent() {
  const agency = await getCurrentAgency();
  if (!agency) return null;

  const [themes, templates, defaults] = await Promise.all([
    getGuidelyThemes(),
    getSystemTemplates(),
    getGuidelyDefaults(),
  ]);

  // Separate agency themes from system templates
  const agencyThemes = themes.filter(t => !t.is_system);

  return (
    <ThemesListClient
      agencyThemes={agencyThemes}
      systemTemplates={templates}
      defaults={defaults}
    />
  );
}

function ThemesLoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Templates skeleton */}
      <div>
        <Skeleton className="h-5 w-40 mb-4" />
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Themes skeleton */}
      <div>
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function GuidelyThemesPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<ThemesLoadingSkeleton />}>
        <ThemesContent />
      </Suspense>
    </div>
  );
}
