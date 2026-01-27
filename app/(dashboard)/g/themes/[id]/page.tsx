import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getCurrentAgency } from '@/lib/auth';
import { getGuidelyTheme, getThemeUsage } from '../_actions/guidely-theme-actions';
import { GuidelyThemeEditor } from './_components/guidely-theme-editor';
import { Skeleton } from '@/components/ui/skeleton';

interface ThemeEditorPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ThemeEditorPageProps) {
  const { id } = await params;
  const theme = await getGuidelyTheme(id);

  return {
    title: theme ? `${theme.name} | Theme Editor` : 'Theme Editor',
    description: 'Customize theme colors, typography, and styling',
  };
}

async function ThemeEditorContent({ id }: { id: string }) {
  const agency = await getCurrentAgency();

  if (!agency) {
    notFound();
  }

  const [theme, usage] = await Promise.all([
    getGuidelyTheme(id),
    getThemeUsage(id),
  ]);

  if (!theme) {
    notFound();
  }

  // Check if agency can edit this theme (either owns it or it's a system template they're copying)
  const canEdit = !theme.is_system && theme.agency_id === agency.id;

  // If it's a system template, we shouldn't be here - they should use "+ Use" to create a copy
  if (theme.is_system) {
    notFound();
  }

  return (
    <GuidelyThemeEditor
      theme={theme}
      usage={usage}
      canEdit={canEdit}
    />
  );
}

function ThemeEditorSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header skeleton */}
      <div className="border-b bg-background">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 flex">
        {/* Left panel */}
        <div className="w-96 border-r p-6 space-y-6">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </div>

        {/* Right panel - preview */}
        <div className="flex-1 p-8">
          <div className="flex justify-center gap-2 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>
          <div className="flex justify-center">
            <Skeleton className="h-96 w-96 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function GuidelyThemeEditorPage({ params }: ThemeEditorPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<ThemeEditorSkeleton />}>
      <ThemeEditorContent id={id} />
    </Suspense>
  );
}
