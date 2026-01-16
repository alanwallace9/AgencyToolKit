'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, Globe, Settings2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { updateGhlSettings } from '../_actions/settings-actions';

interface GhlIntegrationSettingsProps {
  ghlDomain: string | null;
  builderAutoClose: boolean;
}

export function GhlIntegrationSettings({
  ghlDomain: initialDomain,
  builderAutoClose: initialAutoClose,
}: GhlIntegrationSettingsProps) {
  const [ghlDomain, setGhlDomain] = useState(initialDomain || '');
  const [builderAutoClose, setBuilderAutoClose] = useState(initialAutoClose);
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges =
    ghlDomain !== (initialDomain || '') || builderAutoClose !== initialAutoClose;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateGhlSettings({
        ghl_domain: ghlDomain || null,
        builder_auto_close: builderAutoClose,
      });
      toast.success('Settings saved');
    } catch (error) {
      toast.error('Failed to save settings', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          GHL Integration
        </CardTitle>
        <CardDescription>
          Configure your GoHighLevel white-label domain for the tour builder
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* GHL Domain */}
        <div className="space-y-2">
          <Label htmlFor="ghl-domain">White-Label Domain</Label>
          <div className="flex gap-2">
            <Input
              id="ghl-domain"
              type="url"
              placeholder="https://app.youragency.com"
              value={ghlDomain}
              onChange={(e) => setGhlDomain(e.target.value)}
              className="flex-1"
            />
            {ghlDomain && (
              <Button
                variant="outline"
                size="icon"
                asChild
              >
                <a href={ghlDomain} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Your GHL white-label domain. Used when selecting elements for tour steps.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t" />

        {/* Builder Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Builder Settings</Label>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="auto-close" className="text-sm font-medium">
                Auto-close tab after selection
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically close the GHL tab after selecting an element.
                Disable if building multi-step tours to select multiple elements.
              </p>
            </div>
            <Switch
              id="auto-close"
              checked={builderAutoClose}
              onCheckedChange={setBuilderAutoClose}
            />
          </div>
        </div>

        {/* Save Button */}
        {hasChanges && (
          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
