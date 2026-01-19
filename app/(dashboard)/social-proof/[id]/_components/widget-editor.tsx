'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Settings, List, Code, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { SettingsTab } from './settings-tab';
import { EventsTab } from './events-tab';
import { EmbedCodeTab } from './embed-code-tab';
import { NotificationPreview } from './notification-preview';
import { updateWidget } from '../../_actions/social-proof-actions';
import type { SocialProofWidget, SocialProofEvent, Agency } from '@/types/database';

interface WidgetEditorProps {
  widget: SocialProofWidget;
  events: SocialProofEvent[];
  totalEvents: number;
  agency: Agency;
  initialTab: string;
}

export function WidgetEditor({
  widget: initialWidget,
  events: initialEvents,
  totalEvents,
  agency,
  initialTab,
}: WidgetEditorProps) {
  const router = useRouter();
  const [widget, setWidget] = useState(initialWidget);
  const [events] = useState(initialEvents);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Update widget state locally
  const handleWidgetChange = useCallback(
    (updates: Partial<SocialProofWidget>) => {
      setWidget((prev) => ({ ...prev, ...updates }));
      setHasChanges(true);
    },
    []
  );

  // Save changes to database
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateWidget(widget.id, {
        name: widget.name,
        is_active: widget.is_active,
        theme: widget.theme,
        position: widget.position,
        custom_colors: widget.custom_colors,
        custom_css: widget.custom_css,
        display_duration: widget.display_duration,
        gap_between: widget.gap_between,
        initial_delay: widget.initial_delay,
        show_first_name: widget.show_first_name,
        show_city: widget.show_city,
        show_business_name: widget.show_business_name,
        show_time_ago: widget.show_time_ago,
        time_ago_text: widget.time_ago_text,
        url_mode: widget.url_mode,
        url_patterns: widget.url_patterns,
        form_selector: widget.form_selector,
        capture_email: widget.capture_email,
        capture_phone: widget.capture_phone,
        capture_business_name: widget.capture_business_name,
        max_events_in_rotation: widget.max_events_in_rotation,
        randomize_order: widget.randomize_order,
      });
      setHasChanges(false);
      toast.success('Widget saved');
    } catch (error) {
      console.error('Error saving widget:', error);
      toast.error('Failed to save widget');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async () => {
    const newStatus = !widget.is_active;
    setWidget((prev) => ({ ...prev, is_active: newStatus }));
    try {
      await updateWidget(widget.id, { is_active: newStatus });
      toast.success(newStatus ? 'Widget activated' : 'Widget paused');
    } catch {
      // Revert on error
      setWidget((prev) => ({ ...prev, is_active: !newStatus }));
      toast.error('Failed to update status');
    }
  };

  // Generate preview event for display
  const previewEvent = events[0] || {
    first_name: 'John',
    business_name: 'Acme Inc',
    city: 'Austin',
    event_type: 'signup',
    custom_text: null,
    display_time_override: null,
    created_at: new Date().toISOString(),
  };

  return (
    <div className="py-8 px-8 lg:px-14 max-w-[1800px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/social-proof">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{widget.name}</h1>
              <Badge
                variant={widget.is_active ? 'default' : 'secondary'}
                className={
                  widget.is_active
                    ? 'bg-green-100 text-green-700 hover:bg-green-100'
                    : ''
                }
              >
                {widget.is_active ? 'Active' : 'Paused'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {totalEvents} events captured
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Active</span>
            <Switch
              checked={widget.is_active}
              onCheckedChange={handleToggleActive}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tabs and Settings */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Events
                {totalEvents > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {totalEvents}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="embed" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Embed Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="mt-0">
              <SettingsTab
                widget={widget}
                onChange={handleWidgetChange}
                savedThemes={agency.settings?.saved_widget_themes || []}
              />
            </TabsContent>

            <TabsContent value="events" className="mt-0">
              <EventsTab
                widgetId={widget.id}
                events={events}
                totalEvents={totalEvents}
                onEventsChange={() => router.refresh()}
              />
            </TabsContent>

            <TabsContent value="embed" className="mt-0">
              <EmbedCodeTab widget={widget} agency={agency} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Live Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <NotificationPreview
              widget={widget}
              event={previewEvent}
              showTestButton
            />
          </div>
        </div>
      </div>
    </div>
  );
}
