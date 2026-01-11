// GHL Menu Items - matches sidebar IDs
export const GHL_MENU_ITEMS = [
  { id: 'sb_launchpad', label: 'Launchpad', icon: 'Rocket' },
  { id: 'sb_dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'sb_conversations', label: 'Conversations', icon: 'MessageSquare' },
  { id: 'sb_calendars', label: 'Calendars', icon: 'Calendar' },
  { id: 'sb_contacts', label: 'Contacts', icon: 'Users' },
  { id: 'sb_opportunities', label: 'Opportunities', icon: 'Target' },
  { id: 'sb_payments', label: 'Payments', icon: 'CreditCard' },
  { id: 'sb_ai-employee-promo', label: 'AI Agents', icon: 'Bot' },
  { id: 'sb_email-marketing', label: 'Email Marketing', icon: 'Mail' },
  { id: 'sb_automation', label: 'Automation', icon: 'Zap' },
  { id: 'sb_sites', label: 'Sites', icon: 'Globe' },
  { id: 'sb_memberships', label: 'Memberships', icon: 'UserPlus' },
  { id: 'sb_media-storage', label: 'Media Storage', icon: 'FolderOpen' },
  { id: 'sb_reputation', label: 'Reputation', icon: 'Star' },
  { id: 'sb_reporting', label: 'Reporting', icon: 'BarChart3' },
  { id: 'sb_app-marketplace', label: 'App Marketplace', icon: 'Store' },
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
      'sb_ai-employee-promo',
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

// Color presets
export const COLOR_PRESETS = [
  {
    id: 'default',
    label: 'Default',
    colors: {
      primary: '#2563eb',
      accent: '#10b981',
      sidebar_bg: '#1f2937',
      sidebar_text: '#f9fafb',
    },
  },
  {
    id: 'dark',
    label: 'Dark Mode',
    colors: {
      primary: '#3b82f6',
      accent: '#22c55e',
      sidebar_bg: '#0f172a',
      sidebar_text: '#e2e8f0',
    },
  },
  {
    id: 'light',
    label: 'Light Mode',
    colors: {
      primary: '#1d4ed8',
      accent: '#059669',
      sidebar_bg: '#f8fafc',
      sidebar_text: '#1e293b',
    },
  },
] as const;

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
    features: ['menu', 'login', 'loading', 'colors', 'tours', 'images', 'gbp', 'social-proof'],
    customer_limit: Infinity,
  },
} as const;

export type PlanId = keyof typeof PLANS;
