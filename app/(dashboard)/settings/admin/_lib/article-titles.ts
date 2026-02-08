export const ARTICLE_TITLES: Record<string, string> = {
  'help-getting-started-overview': 'What is Agency Toolkit?',
  'help-getting-started-first-customer': 'Adding Your First Customer',
  'help-getting-started-embed-script': 'Installing the Embed Script',
  'help-getting-started-plans': 'Understanding Plans',
  'help-theme-builder-menu': 'Menu Customizer',
  'help-theme-builder-login': 'Login Designer',
  'help-theme-builder-colors': 'Brand Colors',
  'help-theme-builder-loading': 'Loading Animations',
  'help-images-templates': 'Creating Image Templates',
  'help-images-editor': 'Using the Image Editor',
  'help-images-urls': 'Generating Personalized URLs',
  'help-guidely-first-tour': 'Creating Your First Tour',
  'help-guidely-checklists': 'Building Checklists',
  'help-guidely-banners': 'Banners & Announcements',
  'help-guidely-smart-tips': 'Smart Tips',
  'help-guidely-themes': 'Themes & Styling',
  'help-trustsignal-events': 'Setting Up Events',
  'help-trustsignal-widget': 'Installing the Widget',
  'help-settings-profile': 'Profile Settings',
  'help-settings-excluded': 'Excluded Locations',
  'help-settings-delete': 'Deleting Your Account',
};

export function getArticleTitle(articleId: string): string {
  return ARTICLE_TITLES[articleId] || articleId.replace(/^help-/, '').replace(/-/g, ' ');
}

export function getArticleHref(articleId: string): string {
  return '/' + articleId.replace(/-/g, '/');
}
