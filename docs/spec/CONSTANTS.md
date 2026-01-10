# Agency Toolkit - Constants & Reference Data

> Static data, GHL menu items, and configuration constants

---

## GHL Menu Items

Complete list of GoHighLevel menu items that can be hidden/renamed:

```typescript
// lib/constants.ts

export const GHL_MENU_ITEMS = [
  { id: 'launchpad', label: 'Launchpad', icon: 'Rocket' },
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'conversations', label: 'Conversations', icon: 'MessageSquare' },
  { id: 'calendars', label: 'Calendars', icon: 'Calendar' },
  { id: 'contacts', label: 'Contacts', icon: 'Users' },
  { id: 'opportunities', label: 'Opportunities', icon: 'Target' },
  { id: 'payments', label: 'Payments', icon: 'CreditCard' },
  { id: 'email-marketing', label: 'Email Marketing', icon: 'Mail' },
  { id: 'marketing', label: 'Marketing', icon: 'Megaphone' },
  { id: 'automation', label: 'Automation', icon: 'Zap' },
  { id: 'sites', label: 'Sites', icon: 'Globe' },
  { id: 'memberships', label: 'Memberships', icon: 'UserPlus' },
  { id: 'media-storage', label: 'Media Storage', icon: 'FolderOpen' },
  { id: 'reputation', label: 'Reputation', icon: 'Star' },
  { id: 'reporting', label: 'Reporting', icon: 'BarChart3' },
  { id: 'app-marketplace', label: 'App Marketplace', icon: 'Store' },
  { id: 'settings', label: 'Settings', icon: 'Settings' },
] as const;

export type GHLMenuItemId = typeof GHL_MENU_ITEMS[number]['id'];
```

---

## GHL Banner Types

Banners that can be hidden in the GHL interface:

```typescript
export const GHL_BANNERS = [
  { id: 'trial-banner', label: 'Trial Expiration Banner', selector: '[data-banner="trial"]' },
  { id: 'upgrade-banner', label: 'Upgrade Prompt', selector: '[data-banner="upgrade"]' },
  { id: 'connection-prompt', label: 'Connection Prompts', selector: '.connection-prompt' },
  { id: 'promo-banner', label: 'Promotional Banners', selector: '[data-banner="promo"]' },
  { id: 'feature-announcement', label: 'Feature Announcements', selector: '.feature-announcement' },
] as const;
```

---

## GHL Page Routes

Pages where tours can be applied:

```typescript
export const GHL_PAGES = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { id: 'conversations', label: 'Conversations', path: '/conversations' },
  { id: 'contacts', label: 'Contacts', path: '/contacts' },
  { id: 'calendars', label: 'Calendars', path: '/calendars' },
  { id: 'opportunities', label: 'Opportunities', path: '/opportunities' },
  { id: 'reputation', label: 'Reputation', path: '/reputation' },
  { id: 'reporting', label: 'Reporting', path: '/reporting' },
  { id: 'settings', label: 'Settings', path: '/settings' },
] as const;
```

---

## Loading Animations

Pre-built loading animation IDs:

```typescript
export const LOADING_ANIMATIONS = [
  { id: 'pulse-dot', label: 'Pulse Dot', description: 'Simple pulsing circle' },
  { id: 'spinning-ring', label: 'Spinning Ring', description: 'Rotating ring border' },
  { id: 'bouncing-dots', label: 'Bouncing Dots', description: 'Three bouncing dots' },
  { id: 'progress-bar', label: 'Progress Bar', description: 'Animated progress bar' },
  { id: 'morphing-square', label: 'Morphing Square', description: 'Shape-shifting square' },
  { id: 'rotating-squares', label: 'Rotating Squares', description: 'Two rotating squares' },
  { id: 'gradient-spinner', label: 'Gradient Spinner', description: 'Gradient colored spinner' },
  { id: 'heartbeat', label: 'Heartbeat', description: 'Pulsing heart animation' },
  { id: 'wave-bars', label: 'Wave Bars', description: 'Equalizer-style bars' },
  { id: 'orbiting-dots', label: 'Orbiting Dots', description: 'Dots orbiting center' },
] as const;
```

---

## Color Presets

Pre-defined color schemes:

```typescript
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
  {
    id: 'purple',
    label: 'Purple Theme',
    colors: {
      primary: '#7c3aed',
      accent: '#f59e0b',
      sidebar_bg: '#1e1b4b',
      sidebar_text: '#e9d5ff',
    },
  },
] as const;
```

---

## Font Options

Google Fonts available for image personalization:

```typescript
export const FONT_OPTIONS = [
  { id: 'inter', label: 'Inter', family: 'Inter' },
  { id: 'poppins', label: 'Poppins', family: 'Poppins' },
  { id: 'roboto', label: 'Roboto', family: 'Roboto' },
  { id: 'open-sans', label: 'Open Sans', family: 'Open Sans' },
  { id: 'lato', label: 'Lato', family: 'Lato' },
  { id: 'montserrat', label: 'Montserrat', family: 'Montserrat' },
  { id: 'oswald', label: 'Oswald', family: 'Oswald' },
  { id: 'playfair', label: 'Playfair Display', family: 'Playfair Display' },
] as const;
```

---

## Plan Definitions

Feature access by plan:

```typescript
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

export const FEATURE_NAMES: Record<string, string> = {
  menu: 'Menu Customizer',
  login: 'Login Customizer',
  loading: 'Loading Animations',
  colors: 'Dashboard Colors',
  tours: 'Onboarding Tours',
  images: 'Image Personalization',
  gbp: 'GBP Dashboard',
  'social-proof': 'Social Proof Widget',
};
```

---

## Social Proof Event Types

```typescript
export const SOCIAL_PROOF_EVENT_TYPES = [
  { 
    id: 'signup', 
    label: 'New Signup',
    template: '{business} just started a free trial',
    icon: 'UserPlus',
  },
  { 
    id: 'subscription', 
    label: 'New Subscription',
    template: '{business} just subscribed to {plan}',
    icon: 'CreditCard',
  },
  { 
    id: 'milestone', 
    label: 'Review Milestone',
    template: '{business} just hit {count} five-star reviews!',
    icon: 'Trophy',
  },
  { 
    id: 'connected', 
    label: 'GBP Connected',
    template: '{business} just connected their Google Business Profile',
    icon: 'Link',
  },
] as const;
```

---

## API Error Codes

```typescript
export const API_ERRORS = {
  UNAUTHORIZED: { status: 401, message: 'Authentication required' },
  FORBIDDEN: { status: 403, message: 'Access denied' },
  NOT_FOUND: { status: 404, message: 'Resource not found' },
  PLAN_LIMIT: { status: 403, message: 'Plan limit reached' },
  FEATURE_LOCKED: { status: 403, message: 'This feature requires a higher plan' },
  VALIDATION_ERROR: { status: 400, message: 'Invalid request data' },
  SERVER_ERROR: { status: 500, message: 'Internal server error' },
} as const;
```

---

## CSS Selectors for GHL

Common CSS selectors used in the embed script:

```typescript
// These may need updating as GHL changes their UI
export const GHL_SELECTORS = {
  // Navigation
  sidebar: '[data-sidebar="main"]',
  menuItem: (id: string) => `[data-menu-id="${id}"]`,
  
  // Login page
  loginContainer: '.login-container',
  loginLogo: '.login-logo img',
  loginButton: '.login-btn, [type="submit"]',
  
  // Dashboard
  dashboardHeader: '.dashboard-header',
  mainContent: '.main-content',
  
  // Loading
  loadingSpinner: '.loading-spinner, .loader',
  
  // Common elements
  banner: '[data-banner]',
  modal: '[role="dialog"]',
} as const;
```

---

## Driver.js Configuration Defaults

```typescript
export const TOUR_DEFAULTS = {
  showProgress: true,
  showButtons: ['next', 'previous', 'close'],
  overlayColor: 'rgba(0, 0, 0, 0.7)',
  popoverClass: 'agency-toolkit-popover',
  animate: true,
  smoothScroll: true,
  allowClose: true,
  stagePadding: 10,
  stageRadius: 5,
} as const;

export const TOUR_POSITION_OPTIONS = [
  { id: 'top', label: 'Top' },
  { id: 'bottom', label: 'Bottom' },
  { id: 'left', label: 'Left' },
  { id: 'right', label: 'Right' },
] as const;

export const TOUR_TRIGGER_OPTIONS = [
  { id: 'first_visit', label: 'First Visit', description: 'Shows once when user first visits the page' },
  { id: 'manual', label: 'Manual', description: 'Triggered via JavaScript function' },
  { id: 'button', label: 'Button Click', description: 'Triggered when user clicks a help button' },
] as const;
```
