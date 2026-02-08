import { EmbedCodeDisplay } from './embed-code-display';
import { CssExportCard } from './css-export-card';
import type { AgencySettings, LoginDesign } from '@/types/database';

interface EmbedSectionProps {
  token: string;
  baseUrl: string;
  settings: AgencySettings;
  loginDesign?: LoginDesign | null;
}

export function EmbedSection({ token, baseUrl, settings, loginDesign }: EmbedSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Embed Code</h2>
        <p className="text-sm text-muted-foreground">
          Add customizations to your GHL white-label
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Embed Script */}
        <EmbedCodeDisplay token={token} baseUrl={baseUrl} />

        {/* Generated CSS */}
        <CssExportCard settings={settings} loginDesign={loginDesign} />
      </div>
    </div>
  );
}
