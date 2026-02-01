import { getCurrentAgency } from '@/lib/auth';
import { getChecklistsWithStats } from '@/app/(dashboard)/tours/_actions/checklist-actions';
import { getThemes } from '@/app/(dashboard)/tours/_actions/theme-actions';
import { getTags } from '@/app/(dashboard)/tours/_actions/tag-actions';
import { ChecklistsListClient } from './_components/checklists-list-client';

export default async function GuidelyChecklistsPage() {
  const agency = await getCurrentAgency();
  if (!agency) return null;

  const [checklists, themes, tags] = await Promise.all([
    getChecklistsWithStats(),
    getThemes(),
    getTags(),
  ]);

  return (
    <div className="h-full overflow-auto py-8 px-8 lg:px-14">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Checklists</h1>
          <p className="text-muted-foreground">
            Task lists with progress tracking for your customers
          </p>
        </div>

        {/* Checklists list */}
        <ChecklistsListClient
          checklists={checklists}
          themes={themes}
          tags={tags}
        />
      </div>
    </div>
  );
}
