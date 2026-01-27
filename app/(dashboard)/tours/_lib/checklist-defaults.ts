import type { ChecklistItem, ChecklistWidget, ChecklistOnComplete, ChecklistTargeting } from '@/types/database';

// Default values for new checklists
export const DEFAULT_WIDGET: ChecklistWidget = {
  position: 'bottom-right',
  default_state: 'minimized',
  minimized_text: 'Get started',
  cta_text: 'Get Started',
  hide_when_complete: false,
  show_confetti: true,
};

export const DEFAULT_ON_COMPLETE: ChecklistOnComplete = {
  type: 'celebration',
};

export const DEFAULT_TARGETING: ChecklistTargeting = {
  url_mode: 'all',
  url_patterns: [],
  customer_mode: 'all',
  customer_ids: [],
};

// Default checklist item
export function createDefaultItem(order: number): ChecklistItem {
  return {
    id: crypto.randomUUID(),
    order,
    title: 'New item',
    description: '',
    action: { type: 'none' },
    completion_trigger: { type: 'manual' },
  };
}

// System templates
export const CHECKLIST_TEMPLATES = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'A 4-step onboarding checklist for new users',
    title: "Let's get started!",
    items: [
      {
        id: 'welcome',
        order: 0,
        title: 'Welcome to the platform',
        description: 'Take a quick tour of the main features',
        action: { type: 'none' as const },
        completion_trigger: { type: 'manual' as const },
      },
      {
        id: 'profile',
        order: 1,
        title: 'Complete your profile',
        description: 'Add your business information and logo',
        action: { type: 'url' as const, url: '/settings/profile' },
        completion_trigger: { type: 'manual' as const },
      },
      {
        id: 'integrations',
        order: 2,
        title: 'Connect your integrations',
        description: 'Link your calendar, email, and other tools',
        action: { type: 'url' as const, url: '/settings/integrations' },
        completion_trigger: { type: 'manual' as const },
      },
      {
        id: 'first-contact',
        order: 3,
        title: 'Add your first contact',
        description: 'Import contacts or add them manually',
        action: { type: 'url' as const, url: '/contacts' },
        completion_trigger: { type: 'manual' as const },
      },
    ],
    widget: DEFAULT_WIDGET,
    on_complete: DEFAULT_ON_COMPLETE,
    targeting: DEFAULT_TARGETING,
  },
];
