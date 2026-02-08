'use client';

import { useState, useMemo } from 'react';
import { Copy, Check, FileCode, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';
import type { AgencySettings, LoginDesign } from '@/types/database';

interface CssExportCardProps {
  settings: AgencySettings | null;
  loginDesign?: LoginDesign | null;
}

/**
 * Generates login page CSS from a LoginDesign using GHL's .hl_login selectors.
 * GHL Custom CSS loads on ALL pages including the login page (unlike Custom JS).
 */
function generateLoginCss(design: LoginDesign): string {
  const lines: string[] = [];
  const canvas = design.canvas;
  const bg = canvas.background;
  const formStyle = design.form_style;

  // Find image elements (for split layouts)
  const imageElement = design.elements.find(el => el.type === 'image');

  // Determine if this is a split layout based on image position
  const isSplitRight = imageElement && imageElement.x >= 40; // Image on right half
  const isSplitLeft = imageElement && imageElement.x < 10;   // Image on left half

  // --- Background & Layout ---
  lines.push('/* -----------------------------------------');
  lines.push('   LOGIN PAGE - Background & Layout');
  if (bg.type === 'solid' && bg.color) {
    lines.push(`   Background: ${bg.color}`);
  } else if (bg.type === 'gradient' && bg.gradient) {
    lines.push(`   Background: Gradient ${bg.gradient.from} → ${bg.gradient.to}`);
  } else if (bg.type === 'image' && bg.image_url) {
    lines.push('   Background: Image');
  }
  if (imageElement && isSplitRight) {
    lines.push('   Layout: Image right, form left');
  } else if (imageElement && isSplitLeft) {
    lines.push('   Layout: Image left, form right');
  }
  lines.push('   ----------------------------------------- */');

  const bgRules: string[] = [];

  // Background color or gradient
  if (bg.type === 'solid' && bg.color) {
    bgRules.push(`  background-color: ${bg.color} !important;`);
  } else if (bg.type === 'gradient' && bg.gradient) {
    bgRules.push(`  background: linear-gradient(${bg.gradient.angle}deg, ${bg.gradient.from}, ${bg.gradient.to}) !important;`);
  } else if (bg.type === 'image' && bg.image_url) {
    bgRules.push(`  background-image: url(${bg.image_url}) !important;`);
    bgRules.push('  background-size: cover !important;');
    bgRules.push('  background-position: center !important;');
    bgRules.push('  background-repeat: no-repeat !important;');
    if (bg.image_blur && bg.image_blur > 0) {
      // Note: blur on background needs a pseudo-element approach
      bgRules.push(`  /* Blur: ${bg.image_blur}px (applied via backdrop) */`);
    }
  }

  // If there's a split image element, overlay it as the background image on the appropriate side
  if (imageElement && 'url' in imageElement.props) {
    const imgProps = imageElement.props as { url: string; opacity?: number };
    if (isSplitRight) {
      bgRules.push(`  background-image: url(${imgProps.url}) !important;`);
      bgRules.push('  background-size: 50% 100% !important;');
      bgRules.push('  background-position: right center !important;');
      bgRules.push('  background-repeat: no-repeat !important;');
    } else if (isSplitLeft) {
      bgRules.push(`  background-image: url(${imgProps.url}) !important;`);
      bgRules.push('  background-size: 50% 100% !important;');
      bgRules.push('  background-position: left center !important;');
      bgRules.push('  background-repeat: no-repeat !important;');
    }
  }

  bgRules.push('  min-height: 100vh !important;');

  lines.push('.hl_login {');
  lines.push(...bgRules);
  lines.push('}');
  lines.push('');

  // If background image with overlay
  if (bg.type === 'image' && bg.image_overlay) {
    lines.push('.hl_login::before {');
    lines.push('  content: "" !important;');
    lines.push('  position: absolute !important;');
    lines.push('  inset: 0 !important;');
    lines.push(`  background: ${bg.image_overlay} !important;`);
    lines.push('  z-index: 0 !important;');
    lines.push('}');
    lines.push('');
  }

  // --- Form Container ---
  lines.push('/* -----------------------------------------');
  lines.push('   LOGIN PAGE - Form Container');
  if (formStyle.form_bg) {
    lines.push(`   Background: ${formStyle.form_bg}`);
  }
  if (isSplitRight) {
    lines.push('   Position: Left side');
  } else if (isSplitLeft) {
    lines.push('   Position: Right side');
  }
  lines.push('   ----------------------------------------- */');

  const formRules: string[] = [];

  if (formStyle.form_bg) {
    formRules.push(`  background: ${formStyle.form_bg} !important;`);
  }
  if (formStyle.form_border) {
    const borderWidth = formStyle.form_border_width || 1;
    formRules.push(`  border: ${borderWidth}px solid ${formStyle.form_border} !important;`);
  }
  if (formStyle.form_border_radius !== undefined) {
    formRules.push(`  border-radius: ${formStyle.form_border_radius}px !important;`);
  } else {
    formRules.push('  border-radius: 12px !important;');
  }

  // Position the form based on layout
  if (isSplitRight) {
    formRules.push('  max-width: 420px !important;');
    formRules.push('  margin-left: 8% !important;');
    formRules.push('  margin-right: auto !important;');
  } else if (isSplitLeft) {
    formRules.push('  max-width: 420px !important;');
    formRules.push('  margin-left: auto !important;');
    formRules.push('  margin-right: 8% !important;');
  }

  // Backdrop blur for glass effect
  if (formStyle.form_bg && formStyle.form_bg.includes('rgba')) {
    formRules.push('  backdrop-filter: blur(4px) !important;');
  }

  lines.push('div.hl_login--body {');
  lines.push(...formRules);
  lines.push('}');
  lines.push('');

  // --- Heading ---
  const headingColor = formStyle.form_heading_color || formStyle.label_color;
  if (headingColor) {
    lines.push('/* -----------------------------------------');
    lines.push('   LOGIN PAGE - Heading');
    lines.push(`   Color: ${headingColor}`);
    lines.push('   ----------------------------------------- */');
    lines.push('.hl_login--body .heading2,');
    lines.push('.hl_login--body h2,');
    lines.push('.hl_login--header {');
    lines.push(`  color: ${headingColor} !important;`);
    lines.push('}');
    lines.push('');
  }

  // --- Input Fields ---
  lines.push('/* -----------------------------------------');
  lines.push('   LOGIN PAGE - Input Fields');
  lines.push(`   Background: ${formStyle.input_bg}`);
  lines.push(`   Text: ${formStyle.input_text}`);
  lines.push(`   Border: ${formStyle.input_border}`);
  lines.push('   ----------------------------------------- */');
  lines.push('.hl_login .form-control,');
  lines.push('.hl_login input[type="email"],');
  lines.push('.hl_login input[type="password"],');
  lines.push('.hl_login input[type="text"] {');
  lines.push(`  background-color: ${formStyle.input_bg} !important;`);
  lines.push(`  color: ${formStyle.input_text} !important;`);
  lines.push(`  border: 1px solid ${formStyle.input_border} !important;`);
  lines.push('  border-radius: 6px !important;');
  lines.push('}');
  lines.push('');

  // --- Labels ---
  if (formStyle.label_color) {
    lines.push('/* -----------------------------------------');
    lines.push('   LOGIN PAGE - Labels');
    lines.push(`   Color: ${formStyle.label_color}`);
    lines.push('   ----------------------------------------- */');
    lines.push('.hl_login label,');
    lines.push('.hl_login .form-label {');
    lines.push(`  color: ${formStyle.label_color} !important;`);
    lines.push('}');
    lines.push('');
  }

  // --- Sign In Button ---
  lines.push('/* -----------------------------------------');
  lines.push('   LOGIN PAGE - Sign In Button');
  lines.push(`   Background: ${formStyle.button_bg}`);
  lines.push(`   Text: ${formStyle.button_text}`);
  lines.push('   ----------------------------------------- */');
  lines.push('.hl_login .btn.btn-blue,');
  lines.push('.hl_login button[type="submit"],');
  lines.push('.hl_login .btn-primary {');
  lines.push(`  background-color: ${formStyle.button_bg} !important;`);
  lines.push(`  border-color: ${formStyle.button_bg} !important;`);
  lines.push(`  color: ${formStyle.button_text} !important;`);
  lines.push('  border-radius: 6px !important;');
  lines.push('}');
  lines.push('');

  // --- Links ---
  lines.push('/* -----------------------------------------');
  lines.push('   LOGIN PAGE - Links');
  lines.push(`   Color: ${formStyle.link_color}`);
  lines.push('   "Forgot password?", "Terms and Conditions"');
  lines.push('   ----------------------------------------- */');
  lines.push('.hl_login a,');
  lines.push('.hl_login .text-link {');
  lines.push(`  color: ${formStyle.link_color} !important;`);
  lines.push('}');
  lines.push('');

  // --- Logo ---
  if (formStyle.logo_url) {
    lines.push('/* -----------------------------------------');
    lines.push('   LOGIN PAGE - Custom Logo');
    lines.push('   ----------------------------------------- */');
    lines.push('.hl_login--header img {');
    lines.push(`  content: url(${formStyle.logo_url}) !important;`);
    lines.push('  max-height: 48px !important;');
    lines.push('}');
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generates CSS code from agency settings and login design.
 * Mirrors the CSS generation logic in embed.js for colors/menu,
 * and adds login page CSS using GHL's .hl_login selectors.
 */
function generateCss(settings: AgencySettings | null, loginDesign?: LoginDesign | null): string {
  const lines: string[] = [];
  const timestamp = new Date().toISOString().split('T')[0];

  // Header
  lines.push('/* ==========================================');
  lines.push('   Agency Toolkit - Generated CSS');
  lines.push(`   Generated: ${timestamp}`);
  lines.push('   ========================================== */');
  lines.push('');

  const hasColors = settings?.colors && Object.keys(settings.colors).length > 0;
  const hasHiddenItems = settings?.menu?.hidden_items && settings.menu.hidden_items.length > 0;
  const hasRenamedItems = settings?.menu?.renamed_items && Object.keys(settings.menu.renamed_items).length > 0;
  const hasLoginDesign = !!loginDesign;

  if (!hasColors && !hasHiddenItems && !hasRenamedItems && !hasLoginDesign) {
    lines.push('/* No customizations configured yet */');
    return lines.join('\n');
  }

  // Colors Section
  if (hasColors && settings?.colors) {
    const colors = settings.colors;
    lines.push('/* -----------------------------------------');
    lines.push('   COLORS - Sidebar & Buttons');
    lines.push('   ----------------------------------------- */');
    lines.push('');

    if (colors.sidebar_bg) {
      lines.push('.lead-connector,');
      lines.push('#sidebar-v2,');
      lines.push('.sidebar-v2-location,');
      lines.push(`.hl_nav-location { background-color: ${colors.sidebar_bg} !important; }`);
      lines.push('');
    }

    if (colors.sidebar_text) {
      lines.push('.lead-connector a,');
      lines.push('#sidebar-v2 a,');
      lines.push('[id^="sb_"],');
      lines.push('[id^="sb_"] span.nav-title,');
      lines.push('[id^="sb_"] span.hl_text-overflow,');
      lines.push(`.hl_nav-settings a { color: ${colors.sidebar_text} !important; }`);
      lines.push('');
    }

    if (colors.primary) {
      lines.push('/* Primary Buttons */');
      lines.push('.btn-primary,');
      lines.push('.hr-button--primary-type,');
      lines.push('.n-button--primary-type {');
      lines.push(`  background-color: ${colors.primary} !important;`);
      lines.push(`  border-color: ${colors.primary} !important;`);
      lines.push('}');
      lines.push('');
    }

    if (colors.accent) {
      lines.push('/* Accent/Links */');
      lines.push('a:not(.btn):not([class*="button"]),');
      lines.push('.text-link,');
      lines.push(`.hl-text-link { color: ${colors.accent} !important; }`);
      lines.push('');
    }
  }

  // Hidden Menu Items Section
  if (hasHiddenItems && settings?.menu?.hidden_items) {
    lines.push('/* -----------------------------------------');
    lines.push('   MENU - Hidden Items');
    lines.push('   ----------------------------------------- */');
    lines.push('');

    const hiddenSelectors = settings.menu.hidden_items.map(id => `#${id}`).join(',\n');
    lines.push(hiddenSelectors + ' { display: none !important; }');
    lines.push('');
  }

  // Renamed Menu Items Section
  if (hasRenamedItems && settings?.menu?.renamed_items) {
    lines.push('/* -----------------------------------------');
    lines.push('   MENU - Renamed Items');
    lines.push('   ----------------------------------------- */');
    lines.push('');

    Object.entries(settings.menu.renamed_items).forEach(([itemId, newName]) => {
      lines.push(`/* ${itemId} -> "${newName}" */`);
      lines.push(`#${itemId} span.nav-title,`);
      lines.push(`#${itemId} span.hl_text-overflow,`);
      lines.push(`#${itemId} > span:not(.sr-only) {`);
      lines.push('  font-size: 0 !important;');
      lines.push('  color: transparent !important;');
      lines.push('  letter-spacing: -9999px !important;');
      lines.push('}');
      lines.push(`#${itemId} span.nav-title::after,`);
      lines.push(`#${itemId} span.hl_text-overflow::after,`);
      lines.push(`#${itemId} > span:not(.sr-only)::after {`);
      lines.push(`  content: "${newName}";`);
      lines.push('  font-size: 14px !important;');
      lines.push('  color: inherit !important;');
      lines.push('  letter-spacing: normal !important;');
      lines.push('  visibility: visible !important;');
      lines.push('}');
      lines.push('');
    });
  }

  // Login Page Section
  if (hasLoginDesign && loginDesign) {
    lines.push(generateLoginCss(loginDesign));
  }

  return lines.join('\n');
}

export function CssExportCard({ settings, loginDesign }: CssExportCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const css = useMemo(() => generateCss(settings, loginDesign), [settings, loginDesign]);
  const cssLines = css.split('\n');
  const previewLines = cssLines.slice(0, 8).join('\n');
  const hasMoreContent = cssLines.length > 8;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(css);
    setCopied(true);
    toast.success('CSS copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate stats for description
  const colorCount = settings?.colors ? Object.keys(settings.colors).filter(k => settings.colors?.[k as keyof typeof settings.colors]).length : 0;
  const hiddenCount = settings?.menu?.hidden_items?.length || 0;
  const renamedCount = settings?.menu?.renamed_items ? Object.keys(settings.menu.renamed_items).length : 0;
  const hasLogin = !!loginDesign;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCode className="h-5 w-5" />
          Generated CSS
        </CardTitle>
        <CardDescription>
          {colorCount + hiddenCount + renamedCount > 0 || hasLogin ? (
            <>
              {colorCount > 0 && `${colorCount} color${colorCount > 1 ? 's' : ''}`}
              {colorCount > 0 && (hiddenCount > 0 || renamedCount > 0 || hasLogin) && ', '}
              {hiddenCount > 0 && `${hiddenCount} hidden item${hiddenCount > 1 ? 's' : ''}`}
              {hiddenCount > 0 && (renamedCount > 0 || hasLogin) && ', '}
              {renamedCount > 0 && `${renamedCount} renamed item${renamedCount > 1 ? 's' : ''}`}
              {renamedCount > 0 && hasLogin && ', '}
              {hasLogin && 'login page'}
            </>
          ) : (
            'Configure customizations in Theme Builder to generate CSS'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Code Block */}
        <div className="relative">
          <pre className={`bg-muted p-4 rounded-lg text-xs overflow-x-auto font-mono ${expanded ? 'max-h-96 overflow-y-auto' : 'max-h-40 overflow-hidden'}`}>
            <code>{expanded ? css : previewLines}</code>
            {!expanded && hasMoreContent && (
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-muted to-transparent pointer-events-none" />
            )}
          </pre>
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1 text-green-500" />
                  <span className="text-green-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Expand/Collapse Button */}
        {hasMoreContent && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show full CSS ({cssLines.length} lines)
              </>
            )}
          </Button>
        )}

        {/* Instructions Accordion */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="where-to-paste">
            <AccordionTrigger>Where to paste in GHL</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <ol className="list-decimal list-inside space-y-2">
                <li>Log into your GoHighLevel agency account</li>
                <li>Go to <strong>Settings</strong> → <strong>Company</strong></li>
                <li>Click the <strong>White Label</strong> tab</li>
                <li>Scroll down to the <strong>Custom CSS</strong> section</li>
                <li>Paste the CSS code above</li>
                <li>Click <strong>Save Changes</strong></li>
              </ol>
              <p className="mt-2 text-xs">
                <strong>Tip:</strong> The CSS applies to all pages including the login page.
                Use both the JavaScript embed (for tours, loading animations) and this CSS together.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="what-it-does">
            <AccordionTrigger>What this CSS does</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <p>This CSS applies your Agency Toolkit customizations:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                {colorCount > 0 && (
                  <li><strong>Colors</strong> — Sidebar background, text, buttons</li>
                )}
                {hiddenCount > 0 && (
                  <li><strong>Hidden Items</strong> — Menu items you&apos;ve hidden</li>
                )}
                {renamedCount > 0 && (
                  <li><strong>Renamed Items</strong> — Custom menu labels</li>
                )}
                {hasLogin && (
                  <li><strong>Login Page</strong> — Custom background, form styling, buttons, and colors on the sign-in page</li>
                )}
              </ul>
              <p className="mt-2 text-xs">
                <strong>Note:</strong> Loading animations and onboarding tours require the
                JavaScript embed. The login page design requires this CSS (GHL only loads
                Custom CSS on the login page, not Custom JS).
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="troubleshooting">
            <AccordionTrigger>Troubleshooting</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <p><strong>Styles not applying?</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Clear your browser cache (Ctrl+Shift+R / Cmd+Shift+R)</li>
                <li>Make sure the CSS is in Custom CSS, not Custom JS</li>
                <li>Check that you saved after pasting</li>
                <li>Some GHL UI updates may require selector updates</li>
              </ul>
              <p className="mt-3"><strong>CSS + JavaScript embed?</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li><strong>CSS</strong> — Colors, menu, and login page styling</li>
                <li><strong>JS Embed</strong> — Loading animations, onboarding tours, Guidely features</li>
                <li>Use both together for the full experience</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
