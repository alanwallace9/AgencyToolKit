// Banner default values and templates

import type {
  BannerAction,
  BannerTargeting,
  BannerSchedule,
  BannerTrialTriggers,
} from '@/types/database';

export const DEFAULT_ACTION: BannerAction = {
  enabled: false,
  label: 'Learn More',
  type: 'dismiss',
  url: null,
  tour_id: null,
  checklist_id: null,
  new_tab: false,
  whole_banner_clickable: false,
};

export const DEFAULT_TARGETING: BannerTargeting = {
  url_mode: 'all',
  url_patterns: [],
  customer_mode: 'all',
  customer_ids: [],
};

export const DEFAULT_SCHEDULE: BannerSchedule = {
  mode: 'always',
  start_date: null,
  end_date: null,
  start_time: null,
  end_time: null,
  timezone: 'user',
};

export const DEFAULT_TRIAL_TRIGGERS: BannerTrialTriggers = {
  days_remaining: 7,
};

// Style preset colors for reference
export const STYLE_PRESET_COLORS = {
  info: { bg: '#3B82F6', text: '#FFFFFF' },
  success: { bg: '#10B981', text: '#FFFFFF' },
  warning: { bg: '#F59E0B', text: '#1F2937' },
  error: { bg: '#EF4444', text: '#FFFFFF' },
};

// Banner templates
export interface BannerTemplate {
  id: string;
  name: string;
  description: string;
  banner_type: 'standard' | 'trial_expiration';
  content: string;
  style_preset: 'info' | 'success' | 'warning' | 'error' | 'custom';
  action: BannerAction;
}

export const BANNER_TEMPLATES: BannerTemplate[] = [
  {
    id: 'announcement',
    name: 'Feature Announcement',
    description: 'Announce a new feature or update',
    banner_type: 'standard',
    content: 'New feature available! Check out our latest update.',
    style_preset: 'info',
    action: {
      enabled: true,
      label: 'Learn More',
      type: 'url',
      url: '/features',
      tour_id: null,
      checklist_id: null,
      new_tab: false,
      whole_banner_clickable: false,
    },
  },
  {
    id: 'promotion',
    name: 'Holiday Promotion',
    description: 'Promote a sale or special offer',
    banner_type: 'standard',
    content: 'Holiday Sale - Get 20% off all services through the end of the month!',
    style_preset: 'success',
    action: {
      enabled: true,
      label: 'Shop Now',
      type: 'url',
      url: '/sale',
      tour_id: null,
      checklist_id: null,
      new_tab: false,
      whole_banner_clickable: false,
    },
  },
  {
    id: 'maintenance',
    name: 'Maintenance Notice',
    description: 'Warn users about scheduled maintenance',
    banner_type: 'standard',
    content: 'Scheduled maintenance on Saturday, 2am-6am. Some features may be unavailable.',
    style_preset: 'warning',
    action: {
      enabled: false,
      label: '',
      type: 'dismiss',
      url: null,
      tour_id: null,
      checklist_id: null,
      new_tab: false,
      whole_banner_clickable: false,
    },
  },
  {
    id: 'trial-expiration',
    name: 'Trial Expiration Warning',
    description: 'Notify users when their trial is ending soon',
    banner_type: 'trial_expiration',
    content: 'Your trial ends in {{days}} days. Upgrade now to keep access!',
    style_preset: 'warning',
    action: {
      enabled: true,
      label: 'Upgrade Now',
      type: 'url',
      url: '/settings/billing',
      tour_id: null,
      checklist_id: null,
      new_tab: false,
      whole_banner_clickable: false,
    },
  },
  {
    id: 'onboarding',
    name: 'Onboarding Prompt',
    description: 'Encourage users to complete their onboarding',
    banner_type: 'standard',
    content: 'Complete your setup to unlock all features!',
    style_preset: 'info',
    action: {
      enabled: true,
      label: 'Get Started',
      type: 'checklist',
      url: null,
      tour_id: null,
      checklist_id: null, // Will be selected by user
      new_tab: false,
      whole_banner_clickable: false,
    },
  },
];
