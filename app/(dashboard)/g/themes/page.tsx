import { Palette } from 'lucide-react';
import { getCurrentAgency } from '@/lib/auth';
import { getThemes } from '@/app/(dashboard)/tours/_actions/theme-actions';
import { ThemesListClient } from './_components/themes-list-client';

export default async function GuidelyThemesPage() {
  const agency = await getCurrentAgency();
  if (!agency) return null;

  const themes = await getThemes();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Themes</h1>
        <p className="text-muted-foreground">
          Customize the look and feel of your tours, checklists, and banners
        </p>
      </div>

      {/* Themes list */}
      <ThemesListClient themes={themes} />
    </div>
  );
}
