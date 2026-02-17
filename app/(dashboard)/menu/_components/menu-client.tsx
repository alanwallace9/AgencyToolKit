'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Plus, Minus, Type, ChevronDown, RotateCcw, Search, X, Link2, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { BUILT_IN_PRESETS, GHL_MENU_ITEMS, GHL_HIDE_OPTIONS, DIVIDER_TYPES } from '@/lib/constants';
import type { MenuItemType } from '@/lib/constants';
import type { MenuConfig, ColorConfig, MenuPresetDivider, MenuPreset, CustomMenuLink } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useResizablePanels } from '@/hooks/use-resizable-panels';
import { ResizeHandle } from '@/components/shared/resize-handle';
import { MenuSortableList } from '../[id]/_components/menu-sortable-list';
import { BannerOptions } from '../[id]/_components/banner-options';
import { MenuPreview } from '../[id]/_components/menu-preview';
import { CustomLinksSection } from './custom-links-section';
import { useSidebarScanner } from '../_hooks/use-sidebar-scanner';
import { AddPresetDialog } from './add-preset-dialog';
import { DeletePresetDialog } from './delete-preset-dialog';
import { saveMenuSettings, getMenuPresets, createMenuPresetFromTemplate } from '../_actions/menu-actions';

interface MenuClientProps {
  initialConfig: MenuConfig | null;
  colors?: ColorConfig | null;
  ghlDomain?: string | null;
  sampleLocationId?: string | null;
  onSaveComplete?: () => void;
  onRegisterSaveHandler?: (handler: (() => Promise<boolean>) | null) => void;
  onUnsavedChangesChange?: (hasChanges: boolean) => void;
}

interface MenuItemConfig {
  id: string;
  label: string;
  visible: boolean;
  rename: string;
  type?: MenuItemType;
  dividerText?: string;
}

export function MenuClient({ initialConfig, colors, ghlDomain, sampleLocationId, onSaveComplete, onRegisterSaveHandler, onUnsavedChangesChange }: MenuClientProps) {
  const [dividerCounter, setDividerCounter] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // User templates (presets)
  const [userTemplates, setUserTemplates] = useState<MenuPreset[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<MenuPreset | null>(null);

  // Resizable panels
  const {
    leftWidth,
    rightWidth,
    leftCollapsed,
    rightCollapsed,
    startDrag,
    toggleLeftCollapse,
    toggleRightCollapse,
  } = useResizablePanels({
    storageKey: 'menu-designer-panels',
    leftPanel: { minWidth: 200, maxWidth: 350, defaultWidth: 240 },
    rightPanel: { minWidth: 350, maxWidth: 600, defaultWidth: 450 },
  });

  // Initialize menu items from config or defaults
  const getInitialItems = (config: MenuConfig | null): MenuItemConfig[] => {
    const order = config?.item_order || GHL_MENU_ITEMS.map((i) => i.id);
    const hidden = config?.hidden_items || [];
    const renamed = config?.renamed_items || {};
    const dividers = config?.dividers || [];

    const itemsArray: MenuItemConfig[] = [];

    order.forEach((id) => {
      // Check if it's a divider
      const divider = dividers.find((d) => d.id === id);
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

  const [items, setItems] = useState<MenuItemConfig[]>(() => getInitialItems(initialConfig));
  const [hiddenBanners, setHiddenBanners] = useState<string[]>(
    initialConfig?.hidden_banners || ['hide_promos', 'hide_warnings', 'hide_connects']
  );
  // Default preview theme logic:
  // 1. If user explicitly saved a theme choice (non-null string), use it
  // 2. If user has brand colors set, default to 'brand'
  // 3. Otherwise, default to 'ghl-light' (not dark)
  const getDefaultPreviewTheme = (): string => {
    // Only use saved value if it's a non-null, non-undefined string
    if (initialConfig?.preview_theme) {
      return initialConfig.preview_theme;
    }
    // If user has any brand colors set, default to 'brand'
    if (colors?.sidebar_bg || colors?.sidebar_text || colors?.primary) {
      return 'brand';
    }
    // Default to GHL Light (not dark)
    return 'ghl-light';
  };
  const [previewTheme, setPreviewTheme] = useState<string | null>(getDefaultPreviewTheme);
  const [lastTemplate, setLastTemplate] = useState<string | null>(
    initialConfig?.last_template ?? null
  );

  // Custom menu links state
  const [customLinks, setCustomLinks] = useState<CustomMenuLink[]>(
    initialConfig?.custom_links || []
  );
  const [hiddenCustomLinks, setHiddenCustomLinks] = useState<string[]>(
    initialConfig?.hidden_custom_links || []
  );
  const [renamedCustomLinks, setRenamedCustomLinks] = useState<Record<string, string>>(
    initialConfig?.renamed_custom_links || {}
  );

  // Build current config from state
  const buildConfig = useCallback((): MenuConfig => {
    const menuItems = items.filter((i) => i.type === 'menu_item' || !i.type);
    const dividers = items.filter((i) => i.type === 'divider_plain' || i.type === 'divider_labeled');

    return {
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
        type: d.type || 'divider_plain',
        text: d.dividerText || '',
        visible: d.visible,
      })),
      preview_theme: previewTheme,
      last_template: lastTemplate,
      custom_links: customLinks.length > 0 ? customLinks : undefined,
      hidden_custom_links: hiddenCustomLinks.length > 0 ? hiddenCustomLinks : undefined,
      renamed_custom_links: Object.keys(renamedCustomLinks).length > 0 ? renamedCustomLinks : undefined,
    };
  }, [items, hiddenBanners, previewTheme, lastTemplate, customLinks, hiddenCustomLinks, renamedCustomLinks]);

  // Autosave with debounce
  const triggerAutosave = useCallback(() => {
    onUnsavedChangesChange?.(true);

    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce by 500ms to avoid too many saves
    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      const config = buildConfig();
      const result = await saveMenuSettings(config);

      if (!result.success) {
        toast.error('Failed to save changes');
      } else {
        onUnsavedChangesChange?.(false);
        onSaveComplete?.();
      }

      setIsSaving(false);
    }, 500);
  }, [buildConfig, onUnsavedChangesChange, onSaveComplete]);

  // On unmount: save immediately if there are pending changes
  // This fixes the bug where navigating away loses unsaved changes
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        // Save immediately instead of discarding
        const config = buildConfig();
        saveMenuSettings(config);
      }
    };
  }, [buildConfig]);

  // Register save handler with theme context (for Theme Builder header Save button)
  useEffect(() => {
    if (!onRegisterSaveHandler) return;

    const handler = async (): Promise<boolean> => {
      const config = buildConfig();
      const result = await saveMenuSettings(config);
      if (result.success) {
        onSaveComplete?.();
      }
      return result.success;
    };

    onRegisterSaveHandler(handler);
    return () => onRegisterSaveHandler(null);
  }, [buildConfig, onRegisterSaveHandler, onSaveComplete]);

  // Fetch user templates on mount
  useEffect(() => {
    async function loadUserTemplates() {
      const presets = await getMenuPresets();
      setUserTemplates(presets);
    }
    loadUserTemplates();
  }, []);

  // Refresh user templates after add/delete
  const refreshUserTemplates = async () => {
    const presets = await getMenuPresets();
    setUserTemplates(presets);
  };

  // Save current config as a new user template
  const handleSaveAsTemplate = async (name: string) => {
    const config = buildConfig();
    const result = await createMenuPresetFromTemplate({
      name,
      is_default: false,
      config: {
        hidden_items: config.hidden_items,
        renamed_items: config.renamed_items,
        item_order: config.item_order || [],
        hidden_banners: config.hidden_banners,
        dividers: config.dividers,
        preview_theme: config.preview_theme,
      },
    });

    if (result.success) {
      toast.success(`Template "${name}" saved`);
      await refreshUserTemplates();
    } else {
      toast.error(result.error || 'Failed to save template');
    }
  };

  // Load a user template
  const loadUserTemplate = (preset: MenuPreset) => {
    const config = preset.config;
    if (!config) return;

    const allItemIds = GHL_MENU_ITEMS.map((item) => item.id);
    const hidden = config.hidden_items || [];
    const renamed = config.renamed_items || {};
    const dividers = config.dividers || [];
    const order = config.item_order || allItemIds;

    const newItems: MenuItemConfig[] = [];

    order.forEach((id) => {
      // Check if it's a divider
      const divider = dividers.find((d) => d.id === id);
      if (divider) {
        newItems.push({
          id: divider.id,
          label: divider.type === 'divider_labeled' ? 'Section Label' : '── Divider ──',
          visible: divider.visible !== false,
          rename: '',
          type: divider.type as MenuItemType,
          dividerText: divider.text || '',
        });
      } else {
        const item = GHL_MENU_ITEMS.find((i) => i.id === id);
        if (item) {
          newItems.push({
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
      if (!newItems.find((i) => i.id === item.id)) {
        newItems.push({
          id: item.id,
          label: item.label,
          visible: !hidden.includes(item.id),
          rename: renamed[item.id] || '',
          type: 'menu_item',
        });
      }
    });

    setItems(newItems);
    setHiddenBanners(config.hidden_banners || []);
    setLastTemplate(`user_${preset.id}`);
    // User templates CAN include preview theme - apply if present
    if (config.preview_theme !== undefined) {
      setPreviewTheme(config.preview_theme);
    }

    toast.success(`Loaded "${preset.name}" template`);

    // Trigger autosave after template load
    setTimeout(triggerAutosave, 100);
  };

  // Handle template deletion
  const handleDeleteTemplate = () => {
    setTemplateToDelete(null);
    refreshUserTemplates();
  };

  // Load built-in template
  const loadBuiltInTemplate = (templateKey: string) => {
    const template = BUILT_IN_PRESETS[templateKey];
    if (!template) return;

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
    setLastTemplate(templateKey);
    // NOTE: Do NOT reset previewTheme - templates only affect menu items, not the preview color theme

    toast.success(`Loaded "${template.name}" template`);

    // Trigger autosave after template load
    setTimeout(triggerAutosave, 100);
  };

  const handleToggleVisibility = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, visible: !item.visible } : item
      )
    );
    triggerAutosave();
  };

  const handleRename = (id: string, rename: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, rename } : item))
    );
    triggerAutosave();
  };

  const handleReorder = (newItems: MenuItemConfig[]) => {
    setItems(newItems);
    triggerAutosave();
  };

  const handleToggleBanner = (bannerId: string) => {
    setHiddenBanners((prev) =>
      prev.includes(bannerId)
        ? prev.filter((b) => b !== bannerId)
        : [...prev, bannerId]
    );
    triggerAutosave();
  };

  const handlePreviewThemeChange = (theme: string | null) => {
    setPreviewTheme(theme);
    triggerAutosave();
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
    triggerAutosave();
  };

  const handleUpdateDividerText = (id: string, text: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, dividerText: text } : item
      )
    );
    triggerAutosave();
  };

  const handleDeleteDivider = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.success('Divider removed');
    triggerAutosave();
  };

  const menuItemsOnly = items.filter((i) => i.type === 'menu_item' || !i.type);
  const visibleCount = menuItemsOnly.filter((i) => i.visible).length;
  const renamedCount = menuItemsOnly.filter((i) => i.rename).length;
  const dividerCount = items.filter((i) => i.type === 'divider_plain' || i.type === 'divider_labeled').length;

  // Custom link handlers
  const handleScanComplete = useCallback(async (links: CustomMenuLink[]) => {
    // Update state
    setCustomLinks(links);

    // Clean up hidden/renamed entries for links that no longer exist
    const newLinkIds = new Set(links.map((l) => l.id));
    setHiddenCustomLinks((prev) => prev.filter((id) => newLinkIds.has(id)));
    setRenamedCustomLinks((prev) => {
      const cleaned: Record<string, string> = {};
      for (const [id, name] of Object.entries(prev)) {
        if (newLinkIds.has(id)) cleaned[id] = name;
      }
      return cleaned;
    });

    // Save directly with new links (bypasses stale closure in triggerAutosave)
    const config = buildConfig();
    config.custom_links = links.length > 0 ? links : undefined;
    onUnsavedChangesChange?.(true);
    const result = await saveMenuSettings(config);
    if (result.success) {
      onUnsavedChangesChange?.(false);
      onSaveComplete?.();
    } else {
      toast.error('Failed to save custom links');
    }
  }, [buildConfig, onUnsavedChangesChange, onSaveComplete]);

  const handleToggleCustomLink = useCallback((linkId: string) => {
    setHiddenCustomLinks((prev) =>
      prev.includes(linkId)
        ? prev.filter((id) => id !== linkId)
        : [...prev, linkId]
    );
    triggerAutosave();
  }, [triggerAutosave]);

  const handleRenameCustomLink = useCallback((linkId: string, newName: string) => {
    setRenamedCustomLinks((prev) => {
      if (!newName) {
        const next = { ...prev };
        delete next[linkId];
        return next;
      }
      return { ...prev, [linkId]: newName };
    });
    triggerAutosave();
  }, [triggerAutosave]);

  // Sidebar scanner hook
  const {
    isScanning,
    error: scanError,
    startScan,
    cancelScan,
  } = useSidebarScanner({
    ghlDomain: ghlDomain || null,
    sampleLocationId: sampleLocationId || null,
    existingLinks: customLinks,
    onScanComplete: handleScanComplete,
  });

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
    setLastTemplate(null);
    setPreviewTheme('ghl-light'); // Default to GHL Light on reset
    toast.success('Reset to GHL defaults');
    triggerAutosave();
  };

  return (
    <div className="space-y-4">
      {/* 3-Column Layout with Resizable Panels */}
      <div className="flex gap-0">
        {/* Left Panel - Templates */}
        <div
          className="flex-shrink-0 transition-all duration-200 ease-in-out overflow-hidden"
          style={{ width: leftCollapsed ? 0 : leftWidth }}
        >
          <div className="pr-2" style={{ width: leftWidth }}>
            <Card className="h-[600px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  Templates
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
                    {/* Quick Start Templates (Built-in) - AT TOP */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 px-2">Quick Start Templates</p>
                      <div className="space-y-1">
                        {Object.entries(BUILT_IN_PRESETS).map(([key, preset]) => (
                          <button
                            key={key}
                            className={`w-full text-left p-2 rounded-md transition-colors ${
                              lastTemplate === key
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-accent'
                            }`}
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

                    {/* Divider */}
                    <div className="border-t mx-2" />

                    {/* Your Templates (User-saved) - BELOW */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 px-2">Your Templates</p>
                      <div className="space-y-1">
                        {userTemplates.map((preset) => {
                          // Calculate visible items (total - hidden)
                          const totalItems = GHL_MENU_ITEMS.length;
                          const hiddenCount = preset.config?.hidden_items?.length || 0;
                          const visibleCount = totalItems - hiddenCount;

                          return (
                            <div
                              key={preset.id}
                              className={`group relative w-full text-left p-2 rounded-md transition-colors ${
                                lastTemplate === `user_${preset.id}`
                                  ? 'bg-primary text-primary-foreground'
                                  : 'hover:bg-accent'
                              }`}
                            >
                              <button
                                className="w-full text-left"
                                onClick={() => loadUserTemplate(preset)}
                              >
                                <p className="text-sm font-medium">{preset.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {visibleCount} items visible
                                </p>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTemplateToDelete(preset);
                                }}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 ${
                                  lastTemplate === `user_${preset.id}`
                                    ? 'text-primary-foreground hover:bg-primary-foreground/20'
                                    : 'text-destructive'
                                }`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          );
                        })}
                        {/* Save as Template Button - at bottom of Your Templates section */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-dashed mt-2"
                          onClick={() => setAddDialogOpen(true)}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save as Template
                        </Button>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Left Resize Handle */}
        {!leftCollapsed && (
          <ResizeHandle
            onDragStart={(clientX) => startDrag('left', clientX)}
            className="mx-1"
          />
        )}

        {/* Left Collapse Button */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-5 flex-shrink-0 hover:bg-muted/50"
                onClick={toggleLeftCollapse}
              >
                {leftCollapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {leftCollapsed ? 'Expand left panel' : 'Collapse left panel'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Center Panel - Preview */}
        <div className="flex-1 min-w-[200px] mx-2">
          <Card className="h-[600px] sticky top-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-2 h-[calc(100%-48px)]">
              <ScrollArea className="h-full">
                <MenuPreview
                  items={items.filter((i) => i.visible)}
                  colors={colors}
                  selectedTheme={previewTheme}
                  onThemeChange={handlePreviewThemeChange}
                  customLinks={customLinks}
                  hiddenCustomLinks={hiddenCustomLinks}
                  renamedCustomLinks={renamedCustomLinks}
                />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Collapse Button */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-5 flex-shrink-0 hover:bg-muted/50"
                onClick={toggleRightCollapse}
              >
                {rightCollapsed ? (
                  <PanelRightOpen className="h-4 w-4" />
                ) : (
                  <PanelRightClose className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              {rightCollapsed ? 'Expand right panel' : 'Collapse right panel'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Right Resize Handle */}
        {!rightCollapsed && (
          <ResizeHandle
            onDragStart={(clientX) => startDrag('right', clientX)}
            className="mx-1"
          />
        )}

        {/* Right Panel - Editor */}
        <div
          className="flex-shrink-0 transition-all duration-200 ease-in-out overflow-hidden"
          style={{ width: rightCollapsed ? 0 : rightWidth }}
        >
          <div className="pl-2" style={{ width: rightWidth }}>
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
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Full-width sections below the 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Banner Options */}
        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Banner & Notification Options</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Hide promotional banners, warnings, and other notifications from the GHL interface.
              </p>
              <BannerOptions
                options={GHL_HIDE_OPTIONS}
                selected={hiddenBanners}
                onToggle={handleToggleBanner}
              />
            </CardContent>
          </Card>
        </div>

        {/* Custom Menu Links */}
        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Custom Menu Links
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Add custom links to the sidebar menu
              </p>
            </CardHeader>
            <CardContent>
              <CustomLinksSection
                ghlDomain={ghlDomain || null}
                customLinks={customLinks}
                hiddenCustomLinks={hiddenCustomLinks}
                renamedCustomLinks={renamedCustomLinks}
                isScanning={isScanning}
                scanError={scanError}
                onStartScan={startScan}
                onCancelScan={cancelScan}
                onToggleLink={handleToggleCustomLink}
                onRenameLink={handleRenameCustomLink}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <AddPresetDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSave={handleSaveAsTemplate}
      />
      <DeletePresetDialog
        preset={templateToDelete}
        onClose={handleDeleteTemplate}
      />
    </div>
  );
}
