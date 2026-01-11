// lib/css-generator.ts
// Generates CSS for GoHighLevel menu customization

import { GHL_MENU_ITEMS } from './constants';
import type { MenuItemType } from './constants';

export interface MenuItemConfig {
  id: string;
  label: string;
  visible: boolean;
  rename: string;
  type?: MenuItemType;
  dividerText?: string;
}

export interface CSSGeneratorConfig {
  items: MenuItemConfig[];
  hiddenBanners: string[];
}

/**
 * Generates CSS for GHL menu customization
 * This CSS can be copied and pasted into GHL's custom CSS field
 */
export function generateMenuCSS(config: CSSGeneratorConfig): string {
  const { items, hiddenBanners } = config;

  const sections: string[] = [];

  // Header comment
  sections.push(`/* =============================================
   Agency Toolkit - Menu Customization CSS
   Generated: ${new Date().toLocaleDateString()}
   ============================================= */`);

  // Section 1: Hide menu items
  const hiddenItems = items.filter(
    (item) => !item.visible && (item.type === 'menu_item' || !item.type)
  );

  if (hiddenItems.length > 0) {
    const hiddenCSS = hiddenItems
      .map((item) => `[data-sidebar-item="${item.id}"]`)
      .join(',\n');

    sections.push(`
/* ── Hidden Menu Items ── */
${hiddenCSS} {
  display: none !important;
}`);
  }

  // Section 2: Renamed menu items
  const renamedItems = items.filter(
    (item) => item.rename && (item.type === 'menu_item' || !item.type)
  );

  if (renamedItems.length > 0) {
    const renameCSS = renamedItems
      .map(
        (item) => `/* ${getOriginalLabel(item.id)} → ${item.rename} */
[data-sidebar-item="${item.id}"] span.hl-text-md {
  font-size: 0 !important;
}
[data-sidebar-item="${item.id}"] span.hl-text-md::after {
  content: "${item.rename}";
  font-size: 14px;
}`
      )
      .join('\n\n');

    sections.push(`
/* ── Renamed Menu Items ── */
${renameCSS}`);
  }

  // Section 3: Dividers
  const dividers = items.filter(
    (item) => item.type === 'divider_plain' || item.type === 'divider_labeled'
  );

  if (dividers.length > 0) {
    // For dividers, we generate CSS that can be manually positioned
    // Since we can't actually inject elements via CSS alone, we document placement
    const dividerCSS = dividers
      .filter((d) => d.visible)
      .map((divider, index) => {
        if (divider.type === 'divider_plain') {
          return `/* Divider ${index + 1}: Plain divider */
/* Place after: ${getPreviousItemLabel(items, divider.id)} */
.custom-divider-${index + 1} {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 8px 16px;
}`;
        } else {
          return `/* Divider ${index + 1}: Labeled divider "${divider.dividerText || 'SECTION'}" */
/* Place after: ${getPreviousItemLabel(items, divider.id)} */
.custom-divider-${index + 1} {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  padding: 12px 16px 4px;
}
.custom-divider-${index + 1}::before {
  content: "${divider.dividerText || 'SECTION'}";
}`;
        }
      })
      .join('\n\n');

    if (dividerCSS) {
      sections.push(`
/* ── Custom Dividers ── */
/* Note: Dividers require custom HTML or GHL's custom menu feature */
${dividerCSS}`);
    }
  }

  // Section 4: Hide banners
  if (hiddenBanners.includes('hide_promos')) {
    sections.push(`
/* ── Hide Promotional Banners ── */
[class*="promo-banner"],
[class*="wordpress-promo"],
[class*="upgrade-prompt"],
[class*="feature-announcement"],
.hl-banner-promo {
  display: none !important;
}`);
  }

  if (hiddenBanners.includes('hide_warnings')) {
    sections.push(`
/* ── Hide Warning Banners ── */
[class*="warning-banner"],
[class*="twilio-warning"],
[class*="reintegration-alert"],
.hl-banner-warning {
  display: none !important;
}`);
  }

  if (hiddenBanners.includes('hide_connects')) {
    sections.push(`
/* ── Hide Connect Prompts ── */
[class*="connect-prompt"],
[class*="facebook-connect"],
[class*="whatsapp-connect"],
[class*="invite-user"],
.launchpad-connect-card {
  display: none !important;
}`);
  }

  // Footer
  sections.push(`
/* =============================================
   End of Agency Toolkit CSS
   ============================================= */`);

  return sections.join('\n');
}

/**
 * Gets the original label for a menu item ID
 */
function getOriginalLabel(id: string): string {
  const item = GHL_MENU_ITEMS.find((i) => i.id === id);
  return item?.label || id;
}

/**
 * Gets the label of the item before the given divider
 */
function getPreviousItemLabel(items: MenuItemConfig[], dividerId: string): string {
  const index = items.findIndex((i) => i.id === dividerId);
  if (index <= 0) return '(top of menu)';

  const prevItem = items[index - 1];
  if (prevItem.type === 'divider_plain' || prevItem.type === 'divider_labeled') {
    return 'previous divider';
  }

  return prevItem.rename || getOriginalLabel(prevItem.id);
}

/**
 * Generates a compact version of the CSS (single line)
 */
export function generateCompactCSS(config: CSSGeneratorConfig): string {
  const css = generateMenuCSS(config);
  // Remove comments and extra whitespace for a more compact version
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/\s*{\s*/g, '{') // Remove space around braces
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*,\s*/g, ',')
    .trim();
}
