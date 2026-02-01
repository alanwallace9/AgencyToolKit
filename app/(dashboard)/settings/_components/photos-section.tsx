import { PhotoUploadSettings } from './photo-upload-settings';
import type { PhotoUploadSettings as PhotoUploadSettingsType } from '@/types/database';

interface PhotosSectionProps {
  initialSettings: PhotoUploadSettingsType | undefined;
  agencyId: string;
}

export function PhotosSection({ initialSettings, agencyId }: PhotosSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Photos</h2>
        <p className="text-sm text-muted-foreground">
          Configure customer photo upload settings
        </p>
      </div>

      <PhotoUploadSettings
        initialSettings={initialSettings}
        agencyId={agencyId}
      />
    </div>
  );
}
