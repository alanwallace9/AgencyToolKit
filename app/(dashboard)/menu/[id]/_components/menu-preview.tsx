'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  Users,
  Target,
  CreditCard,
  Bot,
  Mail,
  Zap,
  Globe,
  UserPlus,
  FolderOpen,
  Star,
  BarChart3,
  Store,
  Rocket,
  Palette,
  ArrowRight,
  ChevronDown,
  Building2,
  Settings,
  RotateCcw,
  Check,
  Sun,
  Moon,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { COLOR_PRESETS } from '@/lib/constants';
import type { MenuItemType } from '@/lib/constants';
import type { CustomMenuLink } from '@/types/database';
import { cn } from '@/lib/utils';

interface MenuItemConfig {
  id: string;
  label: string;
  visible: boolean;
  rename: string;
  type?: MenuItemType;
  dividerText?: string;
}

interface ColorConfig {
  sidebar_bg?: string;
  sidebar_text?: string;
  primary?: string;
  accent?: string;
}

interface MenuPreviewProps {
  items: MenuItemConfig[];
  colors?: ColorConfig | null;
  /** Controlled theme selection - if provided, component is controlled */
  selectedTheme?: string | null;
  /** Callback when theme changes - required for controlled mode */
  onThemeChange?: (theme: string | null) => void;
  /** Custom menu links detected via sidebar scan */
  customLinks?: CustomMenuLink[];
  hiddenCustomLinks?: string[];
  renamedCustomLinks?: Record<string, string>;
}

const iconMap: Record<string, React.ReactNode> = {
  sb_launchpad: <Rocket className="h-4 w-4" />,
  sb_dashboard: <LayoutDashboard className="h-4 w-4" />,
  sb_conversations: <MessageSquare className="h-4 w-4" />,
  sb_calendars: <Calendar className="h-4 w-4" />,
  sb_contacts: <Users className="h-4 w-4" />,
  sb_opportunities: <Target className="h-4 w-4" />,
  sb_payments: <CreditCard className="h-4 w-4" />,
  'sb_ai-employee-promo': <Bot className="h-4 w-4" />,
  'sb_email-marketing': <Mail className="h-4 w-4" />,
  sb_automation: <Zap className="h-4 w-4" />,
  sb_sites: <Globe className="h-4 w-4" />,
  sb_memberships: <UserPlus className="h-4 w-4" />,
  'sb_media-storage': <FolderOpen className="h-4 w-4" />,
  sb_reputation: <Star className="h-4 w-4" />,
  sb_reporting: <BarChart3 className="h-4 w-4" />,
  'sb_app-marketplace': <Store className="h-4 w-4" />,
};

// Default sidebar colors (GHL-like dark theme)
const defaultDarkColors = {
  sidebar_bg: '#111827', // gray-900 (GHL uses darker)
  sidebar_text: '#9ca3af', // gray-400
  sidebar_text_active: '#ffffff',
  sidebar_hover_bg: '#1f2937', // gray-800
  sidebar_active_bg: '#374151', // gray-700
};

// GHL Light theme colors
const defaultLightColors = {
  sidebar_bg: '#ffffff',
  sidebar_text: '#374151', // gray-700
  sidebar_text_active: '#1f2937', // gray-800
  sidebar_hover_bg: '#f9fafb', // gray-50
  sidebar_active_bg: '#f3f4f6', // gray-100
};

// Check if a color is light (luminance > 0.5)
function isLightColor(hex: string): boolean {
  if (!hex || !hex.startsWith('#')) return false;
  const num = parseInt(hex.slice(1), 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

export function MenuPreview({
  items,
  colors,
  selectedTheme: controlledTheme,
  onThemeChange,
  customLinks = [],
  hiddenCustomLinks = [],
  renamedCustomLinks = {},
}: MenuPreviewProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<string>('sb_dashboard');
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  // Support both controlled and uncontrolled modes
  const [internalTheme, setInternalTheme] = useState<string | null>(null);

  // Use controlled theme if provided, otherwise use internal state
  const isControlled = controlledTheme !== undefined;
  const selectedTheme = isControlled ? controlledTheme : internalTheme;

  const setSelectedTheme = (theme: string | null) => {
    if (isControlled && onThemeChange) {
      onThemeChange(theme);
    } else {
      setInternalTheme(theme);
    }
  };

  const hasCustomColors = colors?.sidebar_bg || colors?.sidebar_text || colors?.primary;

  // Get colors for a theme (built-in or from props)
  const getThemeColors = (themeId: string | null) => {
    // GHL Default themes - null = GHL Light (most common)
    if (themeId === null) return defaultLightColors;
    if (themeId === 'ghl-dark') return defaultDarkColors;
    if (themeId === 'ghl-light') return defaultLightColors;
    if (themeId === 'brand' && hasCustomColors) {
      // Use user's brand colors
      const sidebarBg = colors?.sidebar_bg || defaultDarkColors.sidebar_bg;
      const isLight = isLightColor(sidebarBg);
      if (isLight) {
        return {
          sidebar_bg: sidebarBg,
          sidebar_text: colors?.sidebar_text || defaultLightColors.sidebar_text,
          sidebar_text_active: '#1f2937',
          sidebar_hover_bg: adjustBrightness(sidebarBg, -5),
          sidebar_active_bg: adjustBrightness(sidebarBg, -10),
        };
      } else {
        return {
          sidebar_bg: sidebarBg,
          sidebar_text: colors?.sidebar_text || defaultDarkColors.sidebar_text,
          sidebar_text_active: '#ffffff',
          sidebar_hover_bg: adjustBrightness(sidebarBg, 15),
          sidebar_active_bg: adjustBrightness(sidebarBg, 25),
        };
      }
    }

    // Built-in theme from COLOR_PRESETS
    const preset = COLOR_PRESETS.find((p) => p.id === themeId);
    if (preset) {
      const sidebarBg = preset.colors.sidebar_bg;
      const isLight = isLightColor(sidebarBg);
      if (isLight) {
        return {
          sidebar_bg: sidebarBg,
          sidebar_text: preset.colors.sidebar_text || defaultLightColors.sidebar_text,
          sidebar_text_active: '#1f2937',
          sidebar_hover_bg: adjustBrightness(sidebarBg, -5),
          sidebar_active_bg: adjustBrightness(sidebarBg, -10),
        };
      } else {
        return {
          sidebar_bg: sidebarBg,
          sidebar_text: preset.colors.sidebar_text || defaultDarkColors.sidebar_text,
          sidebar_text_active: '#ffffff',
          sidebar_hover_bg: adjustBrightness(sidebarBg, 15),
          sidebar_active_bg: adjustBrightness(sidebarBg, 25),
        };
      }
    }

    return defaultDarkColors;
  };

  const activeColors = getThemeColors(selectedTheme);

  const isDivider = (item: MenuItemConfig) =>
    item.type === 'divider_plain' || item.type === 'divider_labeled';

  // Get the display name for current theme
  const getThemeName = () => {
    if (selectedTheme === null) return 'GHL Light';
    if (selectedTheme === 'ghl-dark') return 'GHL Dark';
    if (selectedTheme === 'ghl-light') return 'GHL Light';
    if (selectedTheme === 'brand') return 'My Brand Colors';
    const preset = COLOR_PRESETS.find((p) => p.id === selectedTheme);
    return preset?.label || 'Custom';
  };

  return (
    <div className="space-y-3">
      {/* Theme Selector Header */}
      <div className="flex items-center justify-between gap-2">
        <Popover open={themeDropdownOpen} onOpenChange={setThemeDropdownOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs h-7 gap-1">
              <Palette className="h-3 w-3" />
              {getThemeName()}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start">
            <div className="space-y-1">
              {/* GHL Default Themes */}
              <div className="px-2 py-1">
                <p className="text-xs font-medium text-muted-foreground">
                  GHL Defaults
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedTheme(null);
                  setThemeDropdownOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors text-sm',
                  selectedTheme === null ? 'bg-primary/10 text-primary' : 'hover:bg-accent/50'
                )}
              >
                <Moon className="h-4 w-4" />
                <span className="flex-1">Dark Theme</span>
                {selectedTheme === null && <Check className="h-4 w-4" />}
              </button>
              <button
                onClick={() => {
                  setSelectedTheme('ghl-light');
                  setThemeDropdownOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors text-sm',
                  selectedTheme === 'ghl-light' ? 'bg-primary/10 text-primary' : 'hover:bg-accent/50'
                )}
              >
                <Sun className="h-4 w-4" />
                <span className="flex-1">Light Theme</span>
                {selectedTheme === 'ghl-light' && <Check className="h-4 w-4" />}
              </button>

              {/* User's Brand Colors */}
              {hasCustomColors && (
                <>
                  <div className="border-t my-2" />
                  <div className="px-2 py-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      My Colors
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTheme('brand');
                      setThemeDropdownOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors text-sm',
                      selectedTheme === 'brand' ? 'bg-primary/10 text-primary' : 'hover:bg-accent/50'
                    )}
                  >
                    <div className="flex -space-x-1">
                      <div
                        className="w-4 h-4 rounded-full border border-background"
                        style={{ backgroundColor: colors?.primary || '#3b82f6' }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-background"
                        style={{ backgroundColor: colors?.sidebar_bg || '#111827' }}
                      />
                    </div>
                    <span className="flex-1">Brand Colors</span>
                    {selectedTheme === 'brand' && <Check className="h-4 w-4" />}
                  </button>
                </>
              )}

              {/* Built-in Themes */}
              <div className="border-t my-2" />
              <div className="px-2 py-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Built-in Themes
                </p>
              </div>
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedTheme(preset.id);
                    setThemeDropdownOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors text-sm',
                    selectedTheme === preset.id ? 'bg-primary/10 text-primary' : 'hover:bg-accent/50'
                  )}
                >
                  <div className="flex -space-x-1">
                    <div
                      className="w-4 h-4 rounded-full border border-background"
                      style={{ backgroundColor: preset.colors.primary }}
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-background"
                      style={{ backgroundColor: preset.colors.sidebar_bg }}
                    />
                  </div>
                  <span className="flex-1">{preset.label}</span>
                  {selectedTheme === preset.id && <Check className="h-4 w-4" />}
                </button>
              ))}

              {/* Reset Option */}
              <div className="border-t my-2" />
              <button
                onClick={() => {
                  setSelectedTheme(null);
                  setThemeDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset to Default</span>
              </button>
            </div>
          </PopoverContent>
        </Popover>

        <Link
          href="/theme/colors"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          Set brand colors
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* GHL-Accurate Preview Panel */}
      <div
        className="relative rounded-lg overflow-hidden transition-colors border border-gray-800 max-w-[240px] mx-auto"
        style={{ backgroundColor: activeColors.sidebar_bg }}
      >
        {/* Logo/Company Header Area */}
        <div
          className="px-3 py-3 border-b"
          style={{ borderColor: `${activeColors.sidebar_text}20` }}
        >
          {/* Company Logo Placeholder */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold"
              style={{
                backgroundColor: activeColors.sidebar_active_bg,
                color: activeColors.sidebar_text_active,
              }}
            >
              <Building2 className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-semibold truncate"
                style={{ color: activeColors.sidebar_text_active }}
              >
                Your Agency
              </p>
            </div>
          </div>

          {/* Location Dropdown (GHL-style) */}
          <button
            className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded text-xs transition-colors"
            style={{
              backgroundColor: activeColors.sidebar_hover_bg,
              color: activeColors.sidebar_text,
            }}
          >
            <span className="truncate">Demo Sub-Account</span>
            <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="py-2 px-1.5">
          {items.map((item, index) => {
            // GHL native divider: always appears between "core" group and "tools" group
            const GHL_TOP_GROUP = new Set(['sb_launchpad', 'sb_dashboard', 'sb_conversations', 'sb_contacts', 'sb_calendars', 'sb_opportunities', 'sb_payments']);
            let showGhlDivider = false;
            if (!isDivider(item) && GHL_TOP_GROUP.has(item.id)) {
              // Check if the next visible non-divider item is outside the top group
              const nextVisible = items.slice(index + 1).find((i) => !isDivider(i));
              if (nextVisible && !GHL_TOP_GROUP.has(nextVisible.id)) {
                showGhlDivider = true;
              }
            }

            // Render dividers
            if (isDivider(item)) {
              if (item.type === 'divider_plain') {
                return (
                  <div
                    key={item.id}
                    className="my-2 mx-2 h-px"
                    style={{ backgroundColor: `${activeColors.sidebar_text}20` }}
                  />
                );
              }
              // Labeled divider
              return (
                <div key={item.id} className="px-3 pt-4 pb-1">
                  <span
                    className="text-[10px] font-semibold tracking-widest uppercase"
                    style={{ color: `${activeColors.sidebar_text}80` }}
                  >
                    {item.dividerText || 'SECTION'}
                  </span>
                </div>
              );
            }

            const isActive = item.id === activeItem;
            const isHovered = item.id === hoveredItem;

            // Render menu item with GHL-accurate styling
            return (
              <div key={item.id}>
                <button
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-all duration-150 text-left"
                  style={{
                    backgroundColor: isActive
                      ? activeColors.sidebar_active_bg
                      : isHovered
                      ? activeColors.sidebar_hover_bg
                      : 'transparent',
                    color: isActive
                      ? activeColors.sidebar_text_active
                      : activeColors.sidebar_text,
                  }}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => setActiveItem(item.id)}
                >
                  <span
                    className="shrink-0 transition-colors"
                    style={{
                      opacity: isActive ? 1 : 0.7,
                    }}
                  >
                    {iconMap[item.id] || <LayoutDashboard className="h-4 w-4" />}
                  </span>
                  <span
                    className="text-[13px] font-medium truncate"
                    style={{
                      fontWeight: isActive ? 600 : 500,
                    }}
                  >
                    {item.rename || item.label}
                  </span>
                </button>
                {showGhlDivider && (
                  <div
                    className="my-2 mx-2 h-px"
                    style={{ backgroundColor: `${activeColors.sidebar_text}20` }}
                  />
                )}
              </div>
            );
          })}
          {/* Custom Links */}
          {customLinks.filter((l) => !hiddenCustomLinks.includes(l.id)).length > 0 && (
            <>
              {/* Divider before custom links */}
              <div
                className="my-2 mx-2 h-px"
                style={{ backgroundColor: `${activeColors.sidebar_text}20` }}
              />
              {customLinks
                .filter((link) => !hiddenCustomLinks.includes(link.id))
                .map((link) => {
                  const displayName = renamedCustomLinks[link.id] || link.original_label;
                  const isHovered = link.id === hoveredItem;

                  return (
                    <button
                      key={link.id}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-all duration-150 text-left"
                      style={{
                        backgroundColor: isHovered
                          ? activeColors.sidebar_hover_bg
                          : 'transparent',
                        color: activeColors.sidebar_text,
                      }}
                      onMouseEnter={() => setHoveredItem(link.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <span className="shrink-0 opacity-70">
                        <ExternalLink className="h-4 w-4" />
                      </span>
                      <span className="text-[13px] font-medium truncate">
                        {displayName}
                      </span>
                    </button>
                  );
                })}
            </>
          )}

          {items.length === 0 && customLinks.filter((l) => !hiddenCustomLinks.includes(l.id)).length === 0 && (
            <p
              className="text-sm text-center py-8"
              style={{ color: `${activeColors.sidebar_text}60` }}
            >
              No visible items
            </p>
          )}
        </div>

        {/* Bottom Section (mimics GHL's help/settings area) */}
        <div
          className="px-3 py-2 mt-4 border-t"
          style={{
            borderColor: `${activeColors.sidebar_text}20`,
          }}
        >
          {/* Settings icon row - like GHL has */}
          <div className="flex items-center justify-between mb-2">
            <button
              className="flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors hover:opacity-80"
              style={{ color: activeColors.sidebar_text }}
            >
              <Settings className="h-3.5 w-3.5 opacity-70" />
              <span className="opacity-70">Settings</span>
            </button>
          </div>
          <p
            className="text-[10px] text-center"
            style={{ color: `${activeColors.sidebar_text}50` }}
          >
            Preview Only
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper function to adjust color brightness
function adjustBrightness(hex: string, percent: number): string {
  // Handle invalid colors
  if (!hex || !hex.startsWith('#')) return hex;

  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent));

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
