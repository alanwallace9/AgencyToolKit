import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCurrentAgency } from '@/lib/auth';
import { Settings } from 'lucide-react';
import { EmbedCodeDisplay } from './_components/embed-code-display';
import { CssExportCard } from './_components/css-export-card';
import { GhlIntegrationSettings } from './_components/ghl-integration-settings';
import { PhotoUploadSettings } from './_components/photo-upload-settings';

export default async function SettingsPage() {
  const agency = await getCurrentAgency();

  if (!agency) {
    redirect('/sign-in');
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://toolkit.getrapidreviews.com';

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your agency settings and embed code"
      />

      <div className="grid gap-6">
        {/* Agency Details */}
        <Card>
          <CardHeader>
            <CardTitle>Agency Details</CardTitle>
            <CardDescription>Your agency information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Agency Name</label>
                <p className="text-sm text-muted-foreground mt-1">
                  {agency.name || 'Not set'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="text-sm text-muted-foreground mt-1">{agency.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Plan</label>
                <div className="mt-1">
                  <Badge variant={agency.plan === 'pro' ? 'default' : 'secondary'}>
                    {agency.plan === 'pro' ? 'Pro' : 'Toolkit'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Agency Token</label>
                <p className="text-sm font-mono text-muted-foreground mt-1">
                  {agency.token}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Code Export Cards - Side by Side */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Generated CSS (Left) */}
          <CssExportCard settings={agency.settings} />

          {/* Embed Code (Right) */}
          <EmbedCodeDisplay token={agency.token} baseUrl={baseUrl} />
        </div>

        {/* GHL Integration Settings */}
        <GhlIntegrationSettings
          ghlDomain={agency.ghl_domain}
          builderAutoClose={agency.builder_auto_close ?? true}
        />

        {/* Photo Upload Settings */}
        <PhotoUploadSettings
          initialSettings={agency.settings?.photo_uploads}
          agencyId={agency.id}
        />

        {/* Additional Settings Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Additional Settings
            </CardTitle>
            <CardDescription>More settings options coming soon</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Whitelist management, data export, and account settings will be available
              in a future update.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
