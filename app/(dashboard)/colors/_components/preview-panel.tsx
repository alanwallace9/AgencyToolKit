'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  Target,
  Star,
  Search,
  MessageSquare,
  Calendar,
  Users,
  Zap,
  Bell,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ColorConfig, ExtendedColorOption } from '@/types/database';

interface PreviewPanelProps {
  colors: ColorConfig;
}

type PreviewTab = 'pipeline' | 'dashboard' | 'reviews';

// Helper to resolve extended color to actual hex value
function resolveExtendedColor(
  option: ExtendedColorOption | undefined,
  colors: ColorConfig
): string | undefined {
  if (!option || !option.enabled) return undefined;
  if (option.type === 'fixed' && option.color) return option.color;
  if (option.type === 'variation' && option.baseColor && option.percentage) {
    const baseColor = colors[option.baseColor];
    if (option.percentage === 100) return baseColor;
    // Mix with white to create lighter tint
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    const whiteFactor = (100 - option.percentage) / 100;
    const newR = Math.round(r + (255 - r) * whiteFactor);
    const newG = Math.round(g + (255 - g) * whiteFactor);
    const newB = Math.round(b + (255 - b) * whiteFactor);
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }
  return undefined;
}

export function PreviewPanel({ colors }: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<PreviewTab>('pipeline');

  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      {/* Sample Badge */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2">
        <p className="text-xs text-amber-600 text-center font-medium">
          Sample Preview - Colors will apply across your entire GHL dashboard
        </p>
      </div>

      {/* Tab Selector */}
      <div className="border-b bg-card/50 p-2">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PreviewTab)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pipeline" className="text-xs">
              <Target className="h-3 w-3 mr-1" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="text-xs">
              <LayoutDashboard className="h-3 w-3 mr-1" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="reviews" className="text-xs">
              <Star className="h-3 w-3 mr-1" />
              Reviews
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Preview Content */}
      <div className="flex h-[450px]">
        {/* Sidebar */}
        <Sidebar colors={colors} activeTab={activeTab} />

        {/* Main Content */}
        <div
          className="flex-1 overflow-hidden"
          style={{
            backgroundColor: resolveExtendedColor(colors.extended?.main_area_bg, colors) || '#f9fafb',
          }}
        >
          {/* Header */}
          <Header colors={colors} activeTab={activeTab} />

          {/* Content Area */}
          <div className="p-4 overflow-auto h-[calc(100%-48px)]">
            {activeTab === 'pipeline' && <PipelineView colors={colors} />}
            {activeTab === 'dashboard' && <DashboardView colors={colors} />}
            {activeTab === 'reviews' && <ReviewsView colors={colors} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Sidebar Component
// ============================================
function Sidebar({ colors, activeTab }: { colors: ColorConfig; activeTab: PreviewTab }) {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: activeTab === 'dashboard' },
    { icon: MessageSquare, label: 'Inbox', active: false },
    { icon: Calendar, label: 'Calendars', active: false },
    { icon: Users, label: 'Contacts', active: false },
    { icon: Target, label: 'Opportunities', active: activeTab === 'pipeline' },
    { icon: Star, label: 'Reviews', active: activeTab === 'reviews' },
    { icon: Zap, label: 'Automation', active: false },
  ];

  return (
    <div
      className="w-[180px] flex-shrink-0 flex flex-col"
      style={{ backgroundColor: colors.sidebar_bg }}
    >
      {/* Logo Area */}
      <div className="p-3 border-b border-white/10">
        <div
          className="text-sm font-bold"
          style={{ color: colors.sidebar_text }}
        >
          Your Brand
        </div>
        <div
          className="text-xs opacity-70 mt-0.5"
          style={{ color: colors.sidebar_text }}
        >
          Agency Name
        </div>
      </div>

      {/* Search */}
      <div className="p-2">
        <div
          className="flex items-center gap-2 px-2 py-1.5 rounded text-xs opacity-70"
          style={{
            backgroundColor: `${colors.sidebar_text}10`,
            color: colors.sidebar_text
          }}
        >
          <Search className="h-3 w-3" />
          <span>Search</span>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 px-2 space-y-0.5">
        {menuItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors"
            style={{
              backgroundColor: item.active ? `${colors.primary}20` : 'transparent',
              color: item.active ? colors.primary : colors.sidebar_text,
            }}
          >
            <item.icon className="h-3.5 w-3.5" />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Header Component
// ============================================
function Header({ colors, activeTab }: { colors: ColorConfig; activeTab: PreviewTab }) {
  const titles: Record<PreviewTab, string> = {
    pipeline: 'Opportunities',
    dashboard: 'Dashboard',
    reviews: 'Reputation',
  };

  const tabs: Record<PreviewTab, string[]> = {
    pipeline: ['Opportunities', 'Pipelines', 'Bulk Actions'],
    dashboard: ['Overview'],
    reviews: ['Overview', 'Requests', 'Reviews', 'Widgets'],
  };

  // Get extended colors
  const topNavBg = resolveExtendedColor(colors.extended?.top_nav_bg, colors);
  const topNavText = resolveExtendedColor(colors.extended?.top_nav_text, colors);
  const buttonBg = resolveExtendedColor(colors.extended?.button_primary_bg, colors);
  const buttonText = resolveExtendedColor(colors.extended?.button_primary_text, colors);

  return (
    <div
      className="h-12 border-b flex items-center justify-between px-4"
      style={{ backgroundColor: topNavBg || '#ffffff' }}
    >
      <div className="flex items-center gap-4">
        <span
          className="font-semibold text-sm"
          style={{ color: topNavText || undefined }}
        >
          {titles[activeTab]}
        </span>
        <div className="flex items-center gap-1">
          {tabs[activeTab].map((tab, i) => (
            <span
              key={tab}
              className="px-2 py-1 text-xs rounded"
              style={{
                color: i === 0 ? colors.primary : (topNavText || '#666'),
                borderBottom: i === 0 ? `2px solid ${colors.primary}` : 'none',
              }}
            >
              {tab}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1.5 rounded text-xs"
          style={{
            backgroundColor: buttonBg || colors.primary,
            color: buttonText || '#ffffff',
          }}
        >
          + Add New
        </button>
        <div
          className="flex items-center gap-1"
          style={{ color: topNavText || '#6b7280' }}
        >
          <Bell className="h-4 w-4" />
          <HelpCircle className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Pipeline View
// ============================================
function PipelineView({ colors }: { colors: ColorConfig }) {
  const stages = [
    { name: 'New Lead', count: 3, value: '$1,500' },
    { name: 'Engaged', count: 5, value: '$4,200' },
    { name: 'Free Trial', count: 2, value: '$800' },
    { name: 'Customer', count: 8, value: '$12,400' },
  ];

  const cardBg = resolveExtendedColor(colors.extended?.card_bg, colors);

  return (
    <div className="space-y-4">
      {/* Pipeline Header */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Client Pipeline</span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
        <span style={{ color: colors.accent }} className="text-sm">
          18 opportunities
        </span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1.5 text-xs rounded-full border"
          style={{ borderColor: colors.primary, color: colors.primary }}
        >
          Advanced Filters
        </button>
        <button
          className="px-3 py-1.5 text-xs rounded-full border"
          style={{ borderColor: colors.primary, color: colors.primary }}
        >
          Sort (1)
        </button>
      </div>

      {/* Stage Columns */}
      <div className="flex gap-3">
        {stages.map((stage) => (
          <div key={stage.name} className="flex-1">
            <div
              className="rounded-lg border p-3"
              style={{ backgroundColor: cardBg || '#ffffff' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium">{stage.name}</span>
                <span className="text-xs text-gray-500">{stage.count}</span>
              </div>
              <div className="text-xs text-gray-500">{stage.value}</div>

              {/* Sample Card */}
              <div className="mt-3 p-2 bg-gray-50 rounded border-l-2" style={{ borderColor: colors.primary }}>
                <div className="text-xs font-medium">John Smith</div>
                <div className="text-xs text-gray-500">Lead Source: Website</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Dashboard View
// ============================================
function DashboardView({ colors }: { colors: ColorConfig }) {
  const stats = [
    { label: 'Review Requests Sent', value: '24' },
    { label: 'Pending Reviewers', value: '12' },
    { label: 'Review Link Clicks', value: '89' },
    { label: 'Non-Reviewers', value: '7' },
  ];

  const cardBg = resolveExtendedColor(colors.extended?.card_bg, colors);

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border p-4"
            style={{ backgroundColor: cardBg || '#ffffff' }}
          >
            <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
            <div className="text-2xl font-bold" style={{ color: colors.primary }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Chart Area */}
      <div
        className="rounded-lg border p-4"
        style={{ backgroundColor: cardBg || '#ffffff' }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">Funnel</span>
          <select className="text-xs border rounded px-2 py-1">
            <option>Review Pipeline</option>
          </select>
        </div>
        <div className="text-3xl font-bold mb-1">$0</div>
        <div className="flex items-center gap-2 text-xs">
          <span style={{ color: colors.accent }}>0%</span>
          <span className="text-gray-500">vs Last 31 Days</span>
        </div>

        {/* Mock Chart */}
        <div className="mt-4 h-24 flex items-end gap-1">
          {[40, 65, 45, 80, 55, 70, 50, 85, 60, 75].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t"
              style={{
                height: `${h}%`,
                backgroundColor: i === 9 ? colors.primary : `${colors.primary}40`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Reviews View
// ============================================
function ReviewsView({ colors }: { colors: ColorConfig }) {
  const cardBg = resolveExtendedColor(colors.extended?.card_bg, colors);

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div
          className="rounded-lg border p-4"
          style={{ backgroundColor: cardBg || '#ffffff' }}
        >
          <div className="text-xs text-gray-500 mb-2">Invites Goal</div>
          <div className="flex items-center gap-3">
            {/* Progress Ring */}
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#e5e7eb"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke={colors.primary}
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${0.65 * 176} 176`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                65%
              </span>
            </div>
            <div className="text-xs text-gray-500">13 of 20</div>
          </div>
        </div>

        <div
          className="rounded-lg border p-4"
          style={{ backgroundColor: cardBg || '#ffffff' }}
        >
          <div className="text-xs text-gray-500 mb-2">Reviews Received</div>
          <div className="text-3xl font-bold" style={{ color: colors.primary }}>8</div>
          <div className="flex items-center gap-1 text-xs mt-1">
            <span style={{ color: colors.accent }}>+12%</span>
            <span className="text-gray-500">vs Previous</span>
          </div>
        </div>

        <div
          className="rounded-lg border p-4"
          style={{ backgroundColor: cardBg || '#ffffff' }}
        >
          <div className="text-xs text-gray-500 mb-2">Sentiment</div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-500">7</div>
              <div className="text-xs text-gray-500">Positive</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-500">1</div>
              <div className="text-xs text-gray-500">Negative</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Breakdown */}
      <div
        className="rounded-lg border p-4"
        style={{ backgroundColor: cardBg || '#ffffff' }}
      >
        <div className="text-sm font-medium mb-3">Average Rating</div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="h-5 w-5"
                fill={star <= 4 ? colors.accent : 'none'}
                stroke={colors.accent}
              />
            ))}
          </div>
          <span className="text-2xl font-bold">4.2</span>
        </div>

        {/* Rating Bars */}
        <div className="mt-4 space-y-2">
          {[
            { stars: 5, count: 4, percent: 50 },
            { stars: 4, count: 2, percent: 25 },
            { stars: 3, count: 1, percent: 12.5 },
            { stars: 2, count: 0, percent: 0 },
            { stars: 1, count: 1, percent: 12.5 },
          ].map((row) => (
            <div key={row.stars} className="flex items-center gap-2 text-xs">
              <span className="w-12">{row.stars} Stars</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${row.percent}%`,
                    backgroundColor: colors.primary,
                  }}
                />
              </div>
              <span className="w-8 text-right text-gray-500">{row.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
