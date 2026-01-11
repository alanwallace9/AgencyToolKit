'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { MenuPreset } from '@/types/database';
import { GHL_MENU_ITEMS, GHL_HIDE_OPTIONS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MenuSortableList } from './menu-sortable-list';
import { BannerOptions } from './banner-options';
import { MenuPreview } from './menu-preview';
import { updatePresetConfig } from '../../_actions/menu-actions';

interface MenuEditorProps {
  preset: MenuPreset;
}

interface MenuItemConfig {
  id: string;
  label: string;
  visible: boolean;
  rename: string;
}

export function MenuEditor({ preset }: MenuEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Initialize menu items from preset config
  const initialItems = (): MenuItemConfig[] => {
    const order = preset.config?.item_order || GHL_MENU_ITEMS.map((i) => i.id);
    const hidden = preset.config?.hidden_items || [];
    const renamed = preset.config?.renamed_items || {};

    return order.map((id) => {
      const item = GHL_MENU_ITEMS.find((i) => i.id === id);
      return {
        id,
        label: item?.label || id,
        visible: !hidden.includes(id),
        rename: renamed[id] || '',
      };
    });
  };

  const [items, setItems] = useState<MenuItemConfig[]>(initialItems);
  const [hiddenBanners, setHiddenBanners] = useState<string[]>(
    preset.config?.hidden_banners || ['hide_promos', 'hide_warnings', 'hide_connects']
  );

  const handleToggleVisibility = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, visible: !item.visible } : item
      )
    );
  };

  const handleRename = (id: string, rename: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, rename } : item))
    );
  };

  const handleReorder = (newItems: MenuItemConfig[]) => {
    setItems(newItems);
  };

  const handleToggleBanner = (bannerId: string) => {
    setHiddenBanners((prev) =>
      prev.includes(bannerId)
        ? prev.filter((b) => b !== bannerId)
        : [...prev, bannerId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const config = {
        hidden_items: items.filter((i) => !i.visible).map((i) => i.id),
        renamed_items: items.reduce(
          (acc, item) => {
            if (item.rename) acc[item.id] = item.rename;
            return acc;
          },
          {} as Record<string, string>
        ),
        item_order: items.map((i) => i.id),
        hidden_banners: hiddenBanners,
      };

      const result = await updatePresetConfig(preset.id, config);

      if (result.success) {
        toast.success('Preset saved successfully');
      } else {
        toast.error(result.error || 'Failed to save preset');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const visibleCount = items.filter((i) => i.visible).length;
  const renamedCount = items.filter((i) => i.rename).length;

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push('/menu')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Presets
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Menu Items Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Menu Items</CardTitle>
              <CardDescription>
                Toggle visibility, rename items, and drag to reorder.{' '}
                {visibleCount} visible, {renamedCount} renamed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MenuSortableList
                items={items}
                onToggleVisibility={handleToggleVisibility}
                onRename={handleRename}
                onReorder={handleReorder}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Banner Options</CardTitle>
              <CardDescription>
                Hide promotional banners and prompts in GHL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BannerOptions
                options={GHL_HIDE_OPTIONS}
                selected={hiddenBanners}
                onToggle={handleToggleBanner}
              />
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>How the sidebar will appear</CardDescription>
            </CardHeader>
            <CardContent>
              <MenuPreview items={items.filter((i) => i.visible)} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
