import { GhlIntegrationSettings } from './ghl-integration-settings';

interface GhlSectionProps {
  ghlDomain: string | null;
  builderAutoClose: boolean;
}

export function GhlSection({ ghlDomain, builderAutoClose }: GhlSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">GHL Setup</h2>
        <p className="text-sm text-muted-foreground">
          Configure your GoHighLevel integration
        </p>
      </div>

      <GhlIntegrationSettings
        ghlDomain={ghlDomain}
        builderAutoClose={builderAutoClose}
      />
    </div>
  );
}
