'use client';

import { useState } from 'react';
import { Save, Plus, Trash2, Minus, Type, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { MenuPreset } from '@/types/database';
import { BUILT_IN_PRESETS, GHL_MENU_ITEMS, GHL_HIDE_OPTIONS, DIVIDER_TYPES } from '@/lib/constants';
import type { MenuItemType } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MenuSortableList } from '../[id]/_components/menu-sortable-list';
import { BannerOptions } from '../[id]/_components/banner-options';
import { MenuPreview } from '../[id]/_components/menu-preview';
import { AddPresetDialog } from './add-preset-dialog';
import { DeletePresetDialog } from './delete-preset-dialog';
import { CSSPreviewPanel } from './css-preview-panel';
import { CustomLinksSection } from './custom-links-section';
import {
  setDefaultPreset,
  createMenuPresetFromTemplate,
  updatePresetConfig,
} from '../_actions/menu-actions';

interface MenuClientProps {
  presets: MenuPreset[];
}

interface MenuItemConfig {
  id: string;
  label: string;
  visible: boolean;
  rename: string;
  type?: MenuItemType;
  dividerText?: string;
}

export function MenuClient({ presets }: MenuClientProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [presetToDelete, setPresetToDelete] = useState<MenuPreset | null>(null);
  const [activePresetId, setActivePresetId] = useState<string | null>(
    presets.find((p) => p.is_default)?.id || presets[0]?.id || null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [dividerCounter, setDividerCounter] = useState(1);

  // Initialize menu items
  const getInitialItems = (preset?: MenuPreset | null): MenuItemConfig[] => {
    const order = preset?.config?.item_order || GHL_MENU_ITEMS.map((i) => i.id);
    const hidden = preset?.config?.hidden_items || [];
    const renamed = preset?.config?.renamed_items || {};
    const dividers = preset?.config?.dividers || [];

    // Build items array including dividers
    const itemsArray: MenuItemConfig[] = [];

    order.forEach((id) => {
      // Check if it's a divider
      const divider = dividers.find((d: { id: string }) => d.id === id);
      if (divider) {
        itemsArray.push({
          id: divider.id,
          label: divider.type === 'divider_labeled' ? 'Section Label' : '── Divider ──',
          visible: divider.visible !== false,
          rename: '',
          type: divider.type as MenuItemType,
          dividerText: divider.text || '',
        });
      } else {
        // It's a menu item
        const item = GHL_MENU_ITEMS.find((i) => i.id === id);
        if (item) {
          itemsArray.push({
            id,
            label: item.label,
            visible: !hidden.includes(id),
            rename: renamed[id] || '',
            type: 'menu_item',
          });
        }
      }
    });

    // Add any menu items not in the order
    GHL_MENU_ITEMS.forEach((item) => {
      if (!itemsArray.find((i) => i.id === item.id)) {
        itemsArray.push({
          id: item.id,
          label: item.label,
          visible: !hidden.includes(item.id),
          rename: renamed[item.id] || '',
          type: 'menu_item',
        });
      }
    });

    return itemsArray;
  };

  const activePreset = presets.find((p) => p.id === activePresetId);
  const [items, setItems] = useState<MenuItemConfig[]>(getInitialItems(activePreset));
  const [hiddenBanners, setHiddenBanners] = useState<string[]>(
    activePreset?.config?.hidden_banners || ['hide_promos', 'hide_warnings', 'hide_connects']
  );

  // Load preset configuration
  const loadPreset = (preset: MenuPreset) => {
    setActivePresetId(preset.id);
    setItems(getInitialItems(preset));
    setHiddenBanners(preset.config?.hidden_banners || ['hide_promos', 'hide_warnings', 'hide_connects']);
  };

  // Load built-in template
  const loadBuiltInTemplate = (templateKey: string) => {
    const template = BUILT_IN_PRESETS[templateKey];
    if (!template) return;

    setActivePresetId(null);

    const allItemIds = GHL_MENU_ITEMS.map((item) => item.id);
    const newItems: MenuItemConfig[] = allItemIds.map((id) => {
      const item = GHL_MENU_ITEMS.find((i) => i.id === id);
      return {
        id,
        label: item?.label || id,
        visible: template.visible_items.includes(id),
        rename: template.renamed_items[id] || '',
        type: 'menu_item' as const,
      };
    });

    setItems(newItems);
    setHiddenBanners(['hide_promos', 'hide_warnings', 'hide_connects']);
  };

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

  // Divider handlers
  const handleAddDivider = (type: 'divider_plain' | 'divider_labeled') => {
    const newId = `divider_${Date.now()}_${dividerCounter}`;
    setDividerCounter((prev) => prev + 1);

    const newDivider: MenuItemConfig = {
      id: newId,
      label: type === 'divider_labeled' ? 'Section Label' : '── Divider ──',
      visible: true,
      rename: '',
      type,
      dividerText: type === 'divider_labeled' ? DIVIDER_TYPES.labeled.defaultText : '',
    };

    setItems((prev) => [...prev, newDivider]);
    toast.success(`${type === 'divider_labeled' ? 'Labeled divider' : 'Divider'} added`);
  };

  const handleUpdateDividerText = (id: string, text: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, dividerText: text } : item
      )
    );
  };

  const handleDeleteDivider = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.success('Divider removed');
  };

  const handleSave = async () => {
    if (!activePresetId) {
      setShowAddDialog(true);
      return;
    }

    setIsSaving(true);
    try {
      // Separate menu items from dividers
      const menuItems = items.filter((i) => i.type === 'menu_item' || !i.type);
      const dividers = items.filter((i) => i.type === 'divider_plain' || i.type === 'divider_labeled');

      const config = {
        hidden_items: menuItems.filter((i) => !i.visible).map((i) => i.id),
        renamed_items: menuItems.reduce(
          (acc, item) => {
            if (item.rename) acc[item.id] = item.rename;
            return acc;
          },
          {} as Record<string, string>
        ),
        item_order: items.map((i) => i.id),
        hidden_banners: hiddenBanners,
        dividers: dividers.map((d) => ({
          id: d.id,
          type: d.type,
          text: d.dividerText || '',
          visible: d.visible,
        })),
      };

      const result = await updatePresetConfig(activePresetId, config);

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

  const handleSetDefault = async (id: string) => {
    const result = await setDefaultPreset(id);
    if (result.success) {
      toast.success('Default preset updated');
    } else {
      toast.error(result.error || 'Failed to update default preset');
    }
  };

  const handleSaveAsNewPreset = async (name: string) => {
    const menuItems = items.filter((i) => i.type === 'menu_item' || !i.type);
    const dividers = items.filter((i) => i.type === 'divider_plain' || i.type === 'divider_labeled');

    const config = {
      hidden_items: menuItems.filter((i) => !i.visible).map((i) => i.id),
      renamed_items: menuItems.reduce(
        (acc, item) => {
          if (item.rename) acc[item.id] = item.rename;
          return acc;
        },
        {} as Record<string, string>
      ),
      item_order: items.map((i) => i.id),
      hidden_banners: hiddenBanners,
      dividers: dividers.map((d) => ({
        id: d.id,
        type: d.type,
        text: d.dividerText || '',
        visible: d.visible,
      })),
    };

    const result = await createMenuPresetFromTemplate({
      name,
      is_default: false,
      config,
    });

    if (result.success && result.data) {
      const preset = result.data as MenuPreset;
      setActivePresetId(preset.id);
      toast.success('Preset created successfully');
    } else {
      toast.error(result.error || 'Failed to create preset');
    }
  };

  const menuItemsOnly = items.filter((i) => i.type === 'menu_item' || !i.type);
  const visibleCount = menuItemsOnly.filter((i) => i.visible).length;
  const renamedCount = menuItemsOnly.filter((i) => i.rename).length;
  const dividerCount = items.filter((i) => i.type === 'divider_plain' || i.type === 'divider_labeled').length;

  return (
    <div className="space-y-6">
      {/* Presets Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Presets</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Built-in Templates */}
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(BUILT_IN_PRESETS).map(([key, preset]) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                className="flex flex-col items-start h-auto py-2 px-3"
                onClick={() => loadBuiltInTemplate(key)}
              >
                <span className="font-medium">{preset.name}</span>
                <span className="text-xs text-muted-foreground">
                  {preset.visible_items.length} items
                </span>
              </Button>
            ))}
          </div>

          {/* Custom Presets */}
          {presets.length > 0 && (
            <>
              <div className="text-xs text-muted-foreground mb-2">Your Presets</div>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <Button
                    key={preset.id}
                    variant={activePresetId === preset.id ? 'default' : 'outline'}
                    size="sm"
                    className="flex items-center gap-2 h-auto py-2 px-3 group"
                    onClick={() => loadPreset(preset)}
                  >
                    <span className="font-medium">{preset.name}</span>
                    {preset.is_default && (
                      <Badge variant="secondary" className="text-xs">
                        Default
                      </Badge>
                    )}
                    <button
                      className="opacity-0 group-hover:opacity-100 hover:text-destructive ml-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPresetToDelete(preset);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Button>
                ))}
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-4 pt-4 border-t">
            <Button size="sm" variant="outline" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Save as New Preset
            </Button>
            {activePresetId && !presets.find((p) => p.id === activePresetId)?.is_default && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSetDefault(activePresetId)}
              >
                Set as Default
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Menu Items Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Menu Items</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {visibleCount} visible, {renamedCount} renamed
                  {dividerCount > 0 && `, ${dividerCount} divider${dividerCount > 1 ? 's' : ''}`}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MenuSortableList
                items={items}
                onToggleVisibility={handleToggleVisibility}
                onRename={handleRename}
                onReorder={handleReorder}
                onUpdateDividerText={handleUpdateDividerText}
                onDeleteDivider={handleDeleteDivider}
              />

              {/* Add Divider Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full border-dashed">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Divider
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-56">
                  <DropdownMenuItem onClick={() => handleAddDivider('divider_plain')}>
                    <Minus className="h-4 w-4 mr-2" />
                    <div>
                      <div className="font-medium">Plain Divider</div>
                      <div className="text-xs text-muted-foreground">A simple horizontal line</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddDivider('divider_labeled')}>
                    <Type className="h-4 w-4 mr-2" />
                    <div>
                      <div className="font-medium">Labeled Divider</div>
                      <div className="text-xs text-muted-foreground">Line with custom text label</div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Banner Options</CardTitle>
            </CardHeader>
            <CardContent>
              <BannerOptions
                options={GHL_HIDE_OPTIONS}
                selected={hiddenBanners}
                onToggle={handleToggleBanner}
              />
            </CardContent>
          </Card>

          {/* Custom Menu Links Section */}
          <CustomLinksSection />

          {/* Save Button */}
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : activePresetId ? 'Save Changes' : 'Save as New Preset'}
          </Button>

          {/* CSS Preview Panel */}
          <CSSPreviewPanel
            config={{
              items,
              hiddenBanners,
            }}
          />
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <MenuPreview items={items.filter((i) => i.visible)} />
            </CardContent>
          </Card>
        </div>
      </div>

      <AddPresetDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={handleSaveAsNewPreset}
      />

      <DeletePresetDialog
        preset={presetToDelete}
        onClose={() => setPresetToDelete(null)}
      />
    </div>
  );
}
