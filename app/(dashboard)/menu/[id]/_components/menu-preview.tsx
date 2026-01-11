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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { MenuItemType } from '@/lib/constants';

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
}

interface MenuPreviewProps {
  items: MenuItemConfig[];
  colors?: ColorConfig | null;
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
const defaultColors = {
  sidebar_bg: '#1e293b', // slate-800
  sidebar_text: '#cbd5e1', // slate-300
};

export function MenuPreview({ items, colors }: MenuPreviewProps) {
  const [useCustomColors, setUseCustomColors] = useState(false);

  const hasCustomColors = colors?.sidebar_bg || colors?.sidebar_text;

  // Determine active colors
  const activeColors = useCustomColors && hasCustomColors
    ? {
        sidebar_bg: colors?.sidebar_bg || defaultColors.sidebar_bg,
        sidebar_text: colors?.sidebar_text || defaultColors.sidebar_text,
      }
    : defaultColors;

  const isDivider = (item: MenuItemConfig) =>
    item.type === 'divider_plain' || item.type === 'divider_labeled';

  return (
    <div className="space-y-3">
      {/* Color Controls Header */}
      <div className="flex items-center justify-between gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={useCustomColors ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-7"
                onClick={() => setUseCustomColors(!useCustomColors)}
                disabled={!hasCustomColors}
              >
                <Palette className="h-3 w-3 mr-1" />
                {useCustomColors ? 'Using colors' : 'Apply colors'}
              </Button>
            </TooltipTrigger>
            {!hasCustomColors && (
              <TooltipContent>
                <p>Set your colors first</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        <Link
          href="/colors"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          Set custom colors
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Preview Panel */}
      <div
        className="rounded-lg p-3 min-h-[400px] transition-colors"
        style={{ backgroundColor: activeColors.sidebar_bg }}
      >
        <div className="space-y-1">
          {items.map((item) => {
            // Render dividers
            if (isDivider(item)) {
              if (item.type === 'divider_plain') {
                return (
                  <div
                    key={item.id}
                    className="my-2 mx-3 h-px opacity-20"
                    style={{ backgroundColor: activeColors.sidebar_text }}
                  />
                );
              }
              // Labeled divider
              return (
                <div
                  key={item.id}
                  className="px-3 pt-4 pb-1"
                >
                  <span
                    className="text-[10px] font-semibold tracking-widest uppercase opacity-50"
                    style={{ color: activeColors.sidebar_text }}
                  >
                    {item.dividerText || 'SECTION'}
                  </span>
                </div>
              );
            }

            // Render menu item
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:opacity-80"
                style={{
                  color: activeColors.sidebar_text,
                }}
              >
                <span className="opacity-60">
                  {iconMap[item.id] || <LayoutDashboard className="h-4 w-4" />}
                </span>
                <span className="text-sm font-medium">
                  {item.rename || item.label}
                </span>
              </div>
            );
          })}
          {items.length === 0 && (
            <p
              className="text-sm text-center py-8 opacity-50"
              style={{ color: activeColors.sidebar_text }}
            >
              No visible items
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
