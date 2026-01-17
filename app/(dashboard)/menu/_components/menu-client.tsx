'use client';

import { useState } from 'react';
import { Save, Plus, Trash2, Minus, Type, ChevronDown, RotateCcw, Star, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { MenuPreset } from '@/types/database';
import { BUILT_IN_PRESETS, GHL_MENU_ITEMS, GHL_HIDE_OPTIONS, DIVIDER_TYPES } from '@/lib/constants';
import type { MenuItemType } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
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
  const [searchQuery, setSearchQuery] = useState('');

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

  // Reset to GHL defaults
  const handleResetToDefaults = () => {
    const defaultItems: MenuItemConfig[] = GHL_MENU_ITEMS.map((item) => ({
      id: item.id,
      label: item.label,
      visible: true,
      rename: '',
      type: 'menu_item' as const,
    }));
    setItems(defaultItems);
    setHiddenBanners([]);
    setActivePresetId(null);
    toast.success('Reset to GHL defaults');
  };

  return (
    <div className="space-y-4">
      {/* 3-Column Layout */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Panel - Presets (~25%) */}
        <div className="col-span-12 lg:col-span-3">
          <Card className="h-[600px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Presets
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleResetToDefaults}
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-[520px] pr-2">
                <div className="space-y-4">
                  {/* Built-in Templates */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 px-2">Templates</p>
                    <div className="space-y-1">
                      {Object.entries(BUILT_IN_PRESETS).map(([key, preset]) => (
                        <button
                          key={key}
                          className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors"
                          onClick={() => loadBuiltInTemplate(key)}
                        >
                          <p className="text-sm font-medium">{preset.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {preset.visible_items.length} items visible
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Presets */}
                  {presets.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 px-2">Your Presets</p>
                      <div className="space-y-1">
                        {presets.map((preset) => (
                          <button
                            key={preset.id}
                            className={`w-full text-left p-2 rounded-md transition-colors group relative ${
                              activePresetId === preset.id
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-accent'
                            }`}
                            onClick={() => loadPreset(preset)}
                          >
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium flex-1">{preset.name}</p>
                              {preset.is_default && (
                                <Star className="h-3 w-3 fill-current" />
                              )}
                            </div>
                            <button
                              className={`absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${
                                activePresetId === preset.id
                                  ? 'text-primary-foreground hover:text-red-200'
                                  : 'text-muted-foreground hover:text-destructive'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setPresetToDelete(preset);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowAddDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Save as Preset
                    </Button>
                    {activePresetId && !presets.find((p) => p.id === activePresetId)?.is_default && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full"
                        onClick={() => handleSetDefault(activePresetId)}
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Set as Default
                      </Button>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Center Panel - Preview (~30%, narrower for menu) */}
        <div className="col-span-12 lg:col-span-3">
          <Card className="h-[600px] sticky top-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-2 h-[calc(100%-48px)]">
              <ScrollArea className="h-full">
                <MenuPreview items={items.filter((i) => i.visible)} />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Editor (~45%, wider for menu per spec) */}
        <div className="col-span-12 lg:col-span-6">
          <Card className="h-[600px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Menu Items</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {visibleCount} visible, {renamedCount} renamed
                  {dividerCount > 0 && `, ${dividerCount} divider${dividerCount > 1 ? 's' : ''}`}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 h-[calc(100%-48px)]">
              <ScrollArea className="h-full pr-2">
                <div className="space-y-4">
                  {/* Search Filter */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search menu items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-8 h-9"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <MenuSortableList
                    items={searchQuery
                      ? items.filter(item =>
                          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.rename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.dividerText?.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                      : items
                    }
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

                  {/* Banner Options */}
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Banner Options</p>
                    <BannerOptions
                      options={GHL_HIDE_OPTIONS}
                      selected={hiddenBanners}
                      onToggle={handleToggleBanner}
                    />
                  </div>

                  {/* Custom Menu Links */}
                  <div className="pt-4 border-t">
                    <CustomLinksSection />
                  </div>

                  {/* Save Button */}
                  <Button onClick={handleSave} disabled={isSaving} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : activePresetId ? 'Save Changes' : 'Save as New Preset'}
                  </Button>

                  {/* CSS Preview Panel (collapsed by default) */}
                  <CSSPreviewPanel
                    config={{
                      items,
                      hiddenBanners,
                    }}
                  />
                </div>
              </ScrollArea>
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
