'use client';

import { useState } from 'react';
import { Camera, Loader2, Webhook } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { PhotoUploadSettings as PhotoUploadSettingsType } from '@/types/database';
import { DEFAULT_PHOTO_UPLOAD_SETTINGS } from '@/types/database';

interface PhotoUploadSettingsProps {
  initialSettings: PhotoUploadSettingsType | undefined;
  agencyId: string;
}

export function PhotoUploadSettings({ initialSettings, agencyId }: PhotoUploadSettingsProps) {
  const [settings, setSettings] = useState<PhotoUploadSettingsType>({
    ...DEFAULT_PHOTO_UPLOAD_SETTINGS,
    ...initialSettings,
  });
  const [isSaving, setIsSaving] = useState(false);

  const saveSettings = async (newSettings: PhotoUploadSettingsType) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings/photo-uploads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      toast.success('Settings saved');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key: keyof PhotoUploadSettingsType, value: boolean | string) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Photo Uploads
        </CardTitle>
        <CardDescription>
          Configure how customers can upload photos during onboarding
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable photo uploads */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="photo-enabled">Allow customers to upload photos</Label>
            <p className="text-sm text-muted-foreground">
              Customers can upload photos during onboarding tours
            </p>
          </div>
          <Switch
            id="photo-enabled"
            checked={settings.enabled}
            onCheckedChange={(checked) => handleChange('enabled', checked)}
            disabled={isSaving}
          />
        </div>

        {/* Text positioning (coming soon) */}
        <div className="flex items-center justify-between opacity-60">
          <div className="space-y-0.5">
            <Label htmlFor="text-positioning" className="flex items-center gap-2">
              Let customers position the text box
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded">Coming Soon</span>
            </Label>
            <p className="text-sm text-muted-foreground">
              Advanced: customers can drag the text overlay position
            </p>
          </div>
          <Switch
            id="text-positioning"
            checked={settings.allow_text_positioning}
            disabled={true}
          />
        </div>

        {/* Notification settings */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notify-upload">Notify me when a photo is uploaded</Label>
              <p className="text-sm text-muted-foreground">
                Receive a notification when customers upload photos
              </p>
            </div>
            <Switch
              id="notify-upload"
              checked={settings.notify_on_upload}
              onCheckedChange={(checked) => handleChange('notify_on_upload', checked)}
              disabled={isSaving}
            />
          </div>

          {settings.notify_on_upload && (
            <div className="ml-4 space-y-4 border-l-2 pl-4">
              {/* Notification method */}
              <div className="space-y-2">
                <Label htmlFor="notification-method">Notification method</Label>
                <Select
                  value={settings.notification_method}
                  onValueChange={(value) => handleChange('notification_method', value)}
                  disabled={isSaving}
                >
                  <SelectTrigger id="notification-method" className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_app">In-App Notification</SelectItem>
                    <SelectItem value="webhook">Webhook to GHL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Webhook URL */}
              {settings.notification_method === 'webhook' && (
                <div className="space-y-2">
                  <Label htmlFor="webhook-url" className="flex items-center gap-2">
                    <Webhook className="h-4 w-4" />
                    Webhook URL
                  </Label>
                  <Input
                    id="webhook-url"
                    type="url"
                    placeholder="https://services.leadconnectorhq.com/hooks/..."
                    value={settings.webhook_url || ''}
                    onChange={(e) => handleChange('webhook_url', e.target.value)}
                    disabled={isSaving}
                  />
                  <p className="text-xs text-muted-foreground">
                    Create an inbound webhook in GHL and paste the URL here
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Saving indicator */}
        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
