// GHL Menu Items - matches sidebar IDs
// Updated 2026-01-18: IDs verified against actual GHL DOM via discovery script
// See docs/GHL_SELECTORS.md for reference
export const GHL_MENU_ITEMS = [
  { id: 'sb_launchpad', label: 'Launchpad', icon: 'Rocket' },
  { id: 'sb_dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'sb_conversations', label: 'Conversations', icon: 'MessageSquare' },
  { id: 'sb_calendars', label: 'Calendars', icon: 'Calendar' },
  { id: 'sb_contacts', label: 'Contacts', icon: 'Users' },
  { id: 'sb_opportunities', label: 'Opportunities', icon: 'Target' },
  { id: 'sb_payments', label: 'Payments', icon: 'CreditCard' },
  { id: 'sb_AI Agents', label: 'AI Agents', icon: 'Bot' }, // Note: GHL uses space in ID
  { id: 'sb_email-marketing', label: 'Marketing', icon: 'Mail' },
  { id: 'sb_automation', label: 'Automation', icon: 'Zap' },
  { id: 'sb_sites', label: 'Sites', icon: 'Globe' },
  { id: 'sb_memberships', label: 'Memberships', icon: 'UserPlus' },
  { id: 'sb_app-media', label: 'Media Storage', icon: 'FolderOpen' }, // Was sb_media-storage
  { id: 'sb_reputation', label: 'Reputation', icon: 'Star' },
  { id: 'sb_reporting', label: 'Reporting', icon: 'BarChart3' },
  { id: 'sb_app-marketplace', label: 'App Marketplace', icon: 'Store' },
  { id: 'sb_settings', label: 'Settings', icon: 'Settings' },
] as const;

export type GHLMenuItemId = (typeof GHL_MENU_ITEMS)[number]['id'];

// Built-in presets that come with every agency
export const BUILT_IN_PRESETS: Record<
  string,
  {
    name: string;
    description: string;
    visible_items: string[];
    renamed_items: Record<string, string>;
  }
> = {
  reputation_management: {
    name: 'Reputation Management',
    description: 'Clean interface for review management clients',
    visible_items: [
      'sb_launchpad',
      'sb_dashboard',
      'sb_conversations',
      'sb_contacts',
      'sb_email-marketing',
      'sb_reputation',
    ],
    renamed_items: {
      sb_launchpad: 'Connect Google',
      sb_conversations: 'Inbox',
      'sb_email-marketing': 'Social Planner',
      sb_reputation: 'Reviews',
    },
  },
  voice_ai: {
    name: 'Voice AI Package',
    description: 'RM features plus AI voice agents',
    visible_items: [
      'sb_launchpad',
      'sb_dashboard',
      'sb_conversations',
      'sb_contacts',
      'sb_email-marketing',
      'sb_reputation',
      'sb_AI Agents',
      'sb_automation',
    ],
    renamed_items: {
      sb_launchpad: 'Connect Google',
      sb_conversations: 'Inbox',
      'sb_email-marketing': 'Social Planner',
      sb_reputation: 'Reviews',
    },
  },
};

// Banner/warning options
export const GHL_HIDE_OPTIONS = [
  {
    id: 'hide_promos',
    label: 'Hide promotional banners',
    description: 'WordPress promos, upgrade prompts, feature announcements',
  },
  {
    id: 'hide_warnings',
    label: 'Hide warning banners',
    description: 'Twilio warnings, Social Planner/Facebook re-integration alerts',
  },
  {
    id: 'hide_connects',
    label: 'Hide connect prompts',
    description: 'Facebook, WhatsApp, invite user prompts in Launchpad',
  },
] as const;

// Divider types for menu customization
export const DIVIDER_TYPES = {
  plain: {
    id: 'divider_plain',
    type: 'divider_plain' as const,
    label: '── Divider ──',
  },
  labeled: {
    id: 'divider_labeled',
    type: 'divider_labeled' as const,
    label: 'Section Label',
    defaultText: 'OTHER SETTINGS',
  },
};

export type DividerType = 'divider_plain' | 'divider_labeled';
export type MenuItemType = 'menu_item' | DividerType;

// Loading animations
export const LOADING_ANIMATIONS = [
  { id: 'pulse-dot', label: 'Pulse Dot', description: 'Simple pulsing circle' },
  { id: 'spinning-ring', label: 'Spinning Ring', description: 'Rotating ring border' },
  { id: 'bouncing-dots', label: 'Bouncing Dots', description: 'Three bouncing dots' },
  { id: 'progress-bar', label: 'Progress Bar', description: 'Animated progress bar' },
  { id: 'gradient-spinner', label: 'Gradient Spinner', description: 'Gradient colored spinner' },
] as const;

// Color presets - 8 built-in themes
// Design philosophy: Like customizing a Jeep - neutral base with accent colors
export const COLOR_PRESETS = [
  // Blue variants - trust, professional
  {
    id: 'blue-dark',
    label: 'Midnight Blue',
    description: 'Professional dark theme with cool blue tones',
    colors: {
      primary: '#2563eb',
      accent: '#06b6d4',
      sidebar_bg: '#0f172a',
      sidebar_text: '#e2e8f0',
    },
  },
  {
    id: 'blue-light',
    label: 'Ocean Breeze',
    description: 'Clean light theme with ocean-inspired colors',
    colors: {
      primary: '#1d4ed8',
      accent: '#0891b2',
      sidebar_bg: '#f0f9ff',
      sidebar_text: '#0c4a6e',
    },
  },
  // Green variants - growth, eco, health
  {
    id: 'green-dark',
    label: 'Forest Night',
    description: 'Deep forest tones for a natural feel',
    colors: {
      primary: '#16a34a',
      accent: '#84cc16',
      sidebar_bg: '#14532d',
      sidebar_text: '#dcfce7',
    },
  },
  {
    id: 'green-light',
    label: 'Fresh Mint',
    description: 'Light and fresh with mint accents',
    colors: {
      primary: '#059669',
      accent: '#10b981',
      sidebar_bg: '#ecfdf5',
      sidebar_text: '#064e3b',
    },
  },
  // Orange variants - energy, creative, bold
  {
    id: 'orange-dark',
    label: 'Sunset Ember',
    description: 'Warm dark theme with fiery accents',
    colors: {
      primary: '#ea580c',
      accent: '#f59e0b',
      sidebar_bg: '#431407',
      sidebar_text: '#fed7aa',
    },
  },
  {
    id: 'orange-light',
    label: 'Coral Sunrise',
    description: 'Bright and energetic coral tones',
    colors: {
      primary: '#f97316',
      accent: '#fbbf24',
      sidebar_bg: '#fff7ed',
      sidebar_text: '#7c2d12',
    },
  },
  // Luxury/Finance - gold on black
  {
    id: 'gold-black',
    label: 'Executive Gold',
    description: 'Premium dark theme with gold accents',
    colors: {
      primary: '#d97706',
      accent: '#fbbf24',
      sidebar_bg: '#0a0a0a',
      sidebar_text: '#fef3c7',
    },
  },
  // Neutral/Elegant - versatile base
  {
    id: 'neutral-light',
    label: 'Clean Slate',
    description: 'Minimal light theme with purple accents',
    colors: {
      primary: '#6366f1',
      accent: '#8b5cf6',
      sidebar_bg: '#f8fafc',
      sidebar_text: '#334155',
    },
  },
] as const;

export type ColorPresetId = (typeof COLOR_PRESETS)[number]['id'];

// Plan definitions
export const PLANS = {
  free: {
    label: 'Free',
    price: 0,
    features: ['menu'],
    customer_limit: 5,
  },
  toolkit: {
    label: 'Toolkit',
    price: 19,
    features: ['menu', 'login', 'loading', 'colors'],
    customer_limit: 25,
  },
  pro: {
    label: 'Pro',
    price: 39,
    features: ['menu', 'login', 'loading', 'colors', 'tours', 'images', 'gbp', 'trustsignal'],
    customer_limit: Infinity,
  },
} as const;

export type PlanId = keyof typeof PLANS;
