import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  const version = searchParams.get('v'); // Version parameter for cache busting

  // Get the base URL for API calls
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.agencytoolkit.com';

  // Generate the embed script
  const script = generateEmbedScript(key, baseUrl, version);

  // Cache for 5 minutes, but version parameter will bust cache on config changes
  // When user saves Theme Builder, we increment the version in the embed URL
  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
      'Access-Control-Allow-Origin': '*',
      // Include version in response for debugging
      'X-AT-Version': version || 'none',
    },
  });
}

function generateEmbedScript(key: string | null, baseUrl: string, configVersion?: string | null): string {
  // In production, this would be minified
  const isDev = process.env.NODE_ENV === 'development';
  // Config version is used to track when settings were last updated
  const version = configVersion || 'default';

  const script = `
(function() {
  'use strict';

  // Agency Toolkit Embed Script
  // https://agencytoolkit.com
  // Version: 2.0.0 (2026-01-18)

  var CONFIG_KEY = ${JSON.stringify(key)};
  var API_BASE = ${JSON.stringify(baseUrl)};
  var DEBUG = ${isDev};
  var SCRIPT_VERSION = '2.0.0';
  var CONFIG_VERSION = ${JSON.stringify(version)}; // Changes when agency saves settings

  // ============================================
  // KILL SWITCH - Check FIRST before anything else
  // ============================================
  (function checkKillSwitch() {
    try {
      var urlParams = new URLSearchParams(window.location.search);

      // Our kill switch: ?at_disable=true
      if (urlParams.get('at_disable') === 'true') {
        console.log('[AgencyToolkit] ⛔ Disabled via ?at_disable=true parameter');
        window.__AGENCY_TOOLKIT_DISABLED__ = true;
        return;
      }

      // Also respect GHL's native disable: ?customCode=false
      if (urlParams.get('customCode') === 'false') {
        console.log('[AgencyToolkit] ⛔ Disabled via ?customCode=false (GHL native)');
        window.__AGENCY_TOOLKIT_DISABLED__ = true;
        return;
      }
    } catch (e) {
      // Continue if URL parsing fails
    }
  })();

  // Exit immediately if kill switch is active
  if (window.__AGENCY_TOOLKIT_DISABLED__) {
    return;
  }

  // ============================================
  // LOGGING SYSTEM
  // ============================================
  // Always log: initialization, errors, key events
  // Debug mode: verbose details (set window.AGENCY_TOOLKIT_DEBUG = true)

  function logInfo(message, data) {
    // Always log important events (minimal)
    console.log('[AgencyToolkit]', message, data !== undefined ? data : '');
  }

  function log(message, data) {
    // Verbose logging - only in debug mode
    if (DEBUG || window.AGENCY_TOOLKIT_DEBUG) {
      console.log('[AgencyToolkit]', message, data !== undefined ? data : '');
    }
  }

  function logError(message, error) {
    // Always log errors
    console.error('[AgencyToolkit] ❌', message, error || '');
  }

  function logWarn(message, data) {
    // Always log warnings
    console.warn('[AgencyToolkit] ⚠️', message, data !== undefined ? data : '');
  }

  // Log script initialization
  logInfo('Script loaded', {
    version: SCRIPT_VERSION,
    config: CONFIG_VERSION,
    key: CONFIG_KEY ? CONFIG_KEY.substring(0, 8) + '...' : 'none'
  });

  // ============================================
  // BUILDER MODE PARAM CAPTURE
  // ============================================
  // CRITICAL: Capture builder mode params IMMEDIATELY before SPA router can strip them
  // We now use HASH FRAGMENT (#key=value) instead of query params (?key=value)
  // because GHL strips unknown query params but can't touch hash fragments
  var BUILDER_SESSION_KEY = 'at_builder_session';
  (function captureBuilderParams() {
    try {
      // PRIMARY: Check hash fragment (recommended - survives all redirects)
      var hashParams = new URLSearchParams(window.location.hash.substring(1));
      var builderMode = hashParams.get('at_builder_mode');
      var sessionId = hashParams.get('at_session');
      var autoClose = hashParams.get('at_auto_close');

      // FALLBACK: Check query params (legacy support)
      if (!builderMode || !sessionId) {
        var urlParams = new URLSearchParams(window.location.search);
        builderMode = builderMode || urlParams.get('at_builder_mode');
        sessionId = sessionId || urlParams.get('at_session');
        autoClose = autoClose || urlParams.get('at_auto_close');
      }

      // Log immediately (before any redirect) - always visible in console
      if (builderMode || sessionId) {
        console.log('[AgencyToolkit] Builder params detected:', {
          at_builder_mode: builderMode,
          at_session: sessionId ? sessionId.substring(0, 10) + '...' : null,
          source: window.location.hash.includes('at_') ? 'hash' : 'query',
          url: window.location.href.substring(0, 100)
        });
      }

      if (builderMode === 'true' && sessionId) {
        // Store in sessionStorage so we survive any subsequent navigation
        sessionStorage.setItem(BUILDER_SESSION_KEY, JSON.stringify({
          builderMode: builderMode,
          sessionId: sessionId,
          autoClose: autoClose,
          timestamp: Date.now()
        }));
        console.log('[AgencyToolkit] ✅ Builder mode params saved to sessionStorage');
      }
    } catch (e) {
      console.error('[AgencyToolkit] ❌ Failed to capture builder params:', e);
    }
  })();

  // ============================================
  // SIDEBAR SCAN MODE PARAM CAPTURE
  // ============================================
  var SCAN_SESSION_KEY = 'at_scan_session';
  (function captureScanParams() {
    try {
      var hashParams = new URLSearchParams(window.location.hash.substring(1));
      var scanMode = hashParams.get('at_scan_mode');
      var sessionId = hashParams.get('at_session');

      if (scanMode && sessionId) {
        sessionStorage.setItem(SCAN_SESSION_KEY, JSON.stringify({
          scanMode: scanMode,
          sessionId: sessionId,
          timestamp: Date.now()
        }));
        console.log('[AgencyToolkit] Scan mode params saved:', { scanMode: scanMode });
      }
    } catch (e) {
      console.error('[AgencyToolkit] Failed to capture scan params:', e);
    }
  })();

  // RELIABLE BACKUP: Listen for builder/scan params via postMessage from opener
  // This is more reliable than hash params because it doesn't depend on URL timing
  var __builderParamsReceived = false;
  var __scanParamsReceived = false;
  (function listenForBuilderParams() {
    window.addEventListener('message', function(event) {
      // Check if this is a builder params message
      if (event.data?.type === 'at_builder_params' && event.data?.payload) {
        // IMPORTANT: Only process ONCE to prevent reload loops from retry messages
        if (__builderParamsReceived) {
          return;
        }
        __builderParamsReceived = true;

        var payload = event.data.payload;
        console.log('[AgencyToolkit] Builder params received via postMessage');

        // Store in sessionStorage (same as the hash param capture does)
        if (payload.builderMode === 'true' && payload.sessionId) {
          try {
            // Check if we already have params stored (from hash capture or previous message)
            var existing = sessionStorage.getItem(BUILDER_SESSION_KEY);
            if (!existing) {
              sessionStorage.setItem(BUILDER_SESSION_KEY, JSON.stringify({
                builderMode: payload.builderMode,
                sessionId: payload.sessionId,
                autoClose: payload.autoClose,
                timestamp: payload.timestamp || Date.now()
              }));
              console.log('[AgencyToolkit] Builder params saved via postMessage');

              // Always try to initialize builder mode after storing params
              // Use a small delay to ensure initBuilderMode function is defined
              function tryInitBuilder(attempts) {
                if (attempts > 20) return; // Give up after 2 seconds
                if (typeof window.__AT_INIT_BUILDER_MODE__ === 'function') {
                  console.log('[AgencyToolkit] Initializing builder mode from postMessage');
                  window.__AT_INIT_BUILDER_MODE__();
                } else {
                  // Function not ready yet, retry
                  setTimeout(function() { tryInitBuilder(attempts + 1); }, 100);
                }
              }
              tryInitBuilder(0);
            }
          } catch (e) {
            console.error('[AgencyToolkit] Failed to store builder params:', e);
          }
        }
      }

      // Check if this is a scan params message
      if (event.data?.type === 'at_scan_params' && event.data?.payload) {
        if (__scanParamsReceived) return;
        __scanParamsReceived = true;

        var scanPayload = event.data.payload;
        if (scanPayload.scanMode && scanPayload.sessionId) {
          try {
            var existingScan = sessionStorage.getItem(SCAN_SESSION_KEY);
            if (!existingScan) {
              sessionStorage.setItem(SCAN_SESSION_KEY, JSON.stringify({
                scanMode: scanPayload.scanMode,
                sessionId: scanPayload.sessionId,
                timestamp: scanPayload.timestamp || Date.now()
              }));
              console.log('[AgencyToolkit] Scan params saved via postMessage');

              function tryInitScan(attempts) {
                if (attempts > 20) return;
                if (typeof window.__AT_INIT_SIDEBAR_SCAN__ === 'function') {
                  window.__AT_INIT_SIDEBAR_SCAN__();
                } else {
                  setTimeout(function() { tryInitScan(attempts + 1); }, 100);
                }
              }
              tryInitScan(0);
            }
          } catch (e) {
            console.error('[AgencyToolkit] Failed to store scan params:', e);
          }
        }
      }
    });
  })();

  // Check if we should skip customizations for excluded locations
  function shouldSkipCustomizations(config) {
    var excluded = config.whitelisted_locations || [];
    if (excluded.length > 0) {
      // GHL URLs contain the location ID in the path: /v2/location/{locationId}/...
      var currentUrl = window.location.href;
      var isExcluded = excluded.some(function(locationId) {
        return currentUrl.indexOf(locationId) !== -1;
      });
      if (isExcluded) {
        log('Location is excluded, skipping customizations');
        return true;
      }
    }
    return false;
  }

  // Apply menu customizations via CSS injection
  // Updated 2026-01-18: Using correct GHL selectors from discovery
  function applyMenuConfig(menuConfig) {
    if (!menuConfig) return;
    log('Applying menu config', menuConfig);

    // Remove existing menu styles if any
    var existingStyle = document.getElementById('agency-toolkit-menu');
    if (existingStyle) existingStyle.remove();

    var css = '';

    // Hide menu items using GHL sidebar item selectors
    // GHL uses ID selectors like #sb_calendars, #sb_opportunities (NOT data-sidebar-item)
    // NOTE: Some IDs have spaces (e.g., "sb_AI Agents") - must escape for CSS
    if (menuConfig.hidden_items && menuConfig.hidden_items.length > 0) {
      var hiddenSelectors = menuConfig.hidden_items.map(function(item) {
        // GHL uses ID attribute on sidebar items: id="sb_calendars"
        // CSS.escape handles special chars like spaces: "sb_AI Agents" -> "sb_AI\\ Agents"
        return '#' + CSS.escape(item);
      }).join(',\\n');

      css += '/* Hidden Menu Items */\\n';
      css += hiddenSelectors + ' { display: none !important; }\\n';
    }

    // Rename menu items using CSS ::after trick
    // PROVEN PATTERN from user's working CSS - uses visibility + position absolute
    // NOTE: Some IDs have spaces - must escape for CSS
    if (menuConfig.renamed_items && Object.keys(menuConfig.renamed_items).length > 0) {
      css += '/* Renamed Menu Items */\\n';
      Object.keys(menuConfig.renamed_items).forEach(function(itemId) {
        var newName = menuConfig.renamed_items[itemId];
        var escapedId = CSS.escape(itemId);
        // Hide original text using visibility:hidden + position:relative
        // Target all spans inside the menu item (simpler, more reliable)
        css += '#' + escapedId + ' span {\\n';
        css += '  visibility: hidden !important;\\n';
        css += '  position: relative !important;\\n';
        css += '  overflow: visible !important;\\n';
        css += '}\\n';
        // Also target the parent menu item to prevent clipping
        css += '#' + escapedId + ' {\\n';
        css += '  overflow: visible !important;\\n';
        css += '}\\n';
        // Show new text via ::after with position:absolute
        css += '#' + escapedId + ' span::after {\\n';
        css += '  content: "' + newName + '";\\n';
        css += '  visibility: visible !important;\\n';
        css += '  position: absolute !important;\\n';
        css += '  top: 0 !important;\\n';
        css += '  left: 0 !important;\\n';
        css += '  white-space: nowrap !important;\\n';
        css += '  overflow: visible !important;\\n';
        css += '  color: var(--at-sidebar-text, #374151) !important;\\n';
        css += '  -webkit-text-fill-color: var(--at-sidebar-text, #374151) !important;\\n';
        css += '}\\n';
      });
    }

    // Hide promotional banners
    if (menuConfig.hidden_banners && menuConfig.hidden_banners.indexOf('hide_promos') !== -1) {
      css += '/* Hidden Promotional Banners */\\n';
      css += '[class*="promo-banner"], [class*="wordpress-promo"], [class*="upgrade-prompt"], ';
      css += '[class*="feature-announcement"], .hl-banner-promo, .branded-banner, ';
      css += '.notification-banner-wrapper, [class*="notification-banner"] { display: none !important; }\\n';
    }

    // Hide warning banners
    if (menuConfig.hidden_banners && menuConfig.hidden_banners.indexOf('hide_warnings') !== -1) {
      css += '/* Hidden Warning Banners */\\n';
      css += '[class*="warning-banner"], [class*="twilio-warning"], ';
      css += '[class*="reintegration-alert"], .hl-banner-warning { display: none !important; }\\n';
    }

    // Hide connect prompts
    // NOTE: DO NOT use [class*="lead-connector"] - that's the entire sidebar container!
    if (menuConfig.hidden_banners && menuConfig.hidden_banners.indexOf('hide_connects') !== -1) {
      css += '/* Hidden Connect Prompts */\\n';
      css += '[class*="connect-prompt"], [class*="facebook-connect"], [class*="whatsapp-connect"], ';
      css += '[class*="invite-user"], .launchpad-connect-card { display: none !important; }\\n';
    }

    // Hide custom menu links (detected via sidebar scan)
    if (menuConfig.hidden_custom_links && menuConfig.hidden_custom_links.length > 0) {
      var customLinks = menuConfig.custom_links || [];
      css += '/* Hidden Custom Menu Links */\\n';
      menuConfig.hidden_custom_links.forEach(function(linkId) {
        var link = customLinks.find(function(l) { return l.id === linkId; });
        if (link && link.selector) {
          css += link.selector + ' { display: none !important; }\\n';
        }
      });
    }

    // Rename custom menu links
    if (menuConfig.renamed_custom_links && Object.keys(menuConfig.renamed_custom_links).length > 0) {
      var customLinksForRename = menuConfig.custom_links || [];
      css += '/* Renamed Custom Menu Links */\\n';
      Object.keys(menuConfig.renamed_custom_links).forEach(function(linkId) {
        var newName = menuConfig.renamed_custom_links[linkId];
        var link = customLinksForRename.find(function(l) { return l.id === linkId; });
        if (link && link.selector) {
          css += link.selector + ' span {\\n';
          css += '  visibility: hidden !important;\\n';
          css += '  position: relative !important;\\n';
          css += '  overflow: visible !important;\\n';
          css += '}\\n';
          css += link.selector + ' {\\n';
          css += '  overflow: visible !important;\\n';
          css += '}\\n';
          css += link.selector + ' span::after {\\n';
          css += '  content: "' + newName + '";\\n';
          css += '  visibility: visible !important;\\n';
          css += '  position: absolute !important;\\n';
          css += '  top: 0 !important;\\n';
          css += '  left: 0 !important;\\n';
          css += '  white-space: nowrap !important;\\n';
          css += '  overflow: visible !important;\\n';
          css += '  color: var(--at-sidebar-text, #374151) !important;\\n';
          css += '  -webkit-text-fill-color: var(--at-sidebar-text, #374151) !important;\\n';
          css += '}\\n';
        }
      });
    }

    // Inject styles
    if (css) {
      var style = document.createElement('style');
      style.id = 'agency-toolkit-menu';
      style.textContent = css;
      document.head.appendChild(style);
      log('Menu CSS injected');

      // Debug: Log the full CSS for troubleshooting
      if (DEBUG || window.AGENCY_TOOLKIT_DEBUG) {
        console.log('[AgencyToolkit] Full Menu CSS:\\n', css);
      }
    }
  }

  // Apply color customizations
  // Updated 2026-01-18: Using correct GHL selectors from discovery + extended elements
  function applyColorConfig(colorConfig) {
    if (!colorConfig) return;
    log('Applying color config', colorConfig);

    // Remove existing color styles if any
    var existingStyle = document.getElementById('agency-toolkit-colors');
    if (existingStyle) existingStyle.remove();

    var style = document.createElement('style');
    style.id = 'agency-toolkit-colors';

    var css = '/* Agency Toolkit Color Customizations */\\n';

    // CSS Custom Properties for theming
    css += ':root {\\n';
    if (colorConfig.primary) css += '  --at-primary: ' + colorConfig.primary + ';\\n';
    if (colorConfig.accent) css += '  --at-accent: ' + colorConfig.accent + ';\\n';
    if (colorConfig.sidebar_bg) css += '  --at-sidebar-bg: ' + colorConfig.sidebar_bg + ';\\n';
    if (colorConfig.sidebar_text) css += '  --at-sidebar-text: ' + colorConfig.sidebar_text + ';\\n';
    css += '}\\n';

    // ============================================
    // SIDEBAR COLORS
    // CRITICAL: Only use #sidebar-v2 - the most specific selector
    // .lead-connector and other classes can match parent containers
    // that include the main content area, causing color bleed
    // ============================================
    if (colorConfig.sidebar_bg) {
      css += '/* Sidebar Background - #sidebar-v2 only (most specific) */\\n';
      css += '#sidebar-v2 { background-color: ' + colorConfig.sidebar_bg + ' !important; }\\n';
    }
    if (colorConfig.sidebar_text) {
      css += '/* Sidebar Text - menu items and custom links */\\n';
      css += '[id^="sb_"],\\n';
      css += '[id^="sb_"] span,\\n';
      css += '#sidebar-v2 .hl_nav-settings a,\\n';
      css += '#sidebar-v2 nav a,\\n';
      css += '#sidebar-v2 nav a span { color: ' + colorConfig.sidebar_text + ' !important; -webkit-text-fill-color: ' + colorConfig.sidebar_text + ' !important; }\\n';
    }

    // NOTE: Removed defensive CSS that was interfering with GHL rendering
    // The sidebar-only selectors (#sidebar-v2) should prevent bleed without
    // needing defensive rules that could break GHL's Vue rendering

    // ============================================
    // EXTENDED ELEMENTS (from Theme Builder)
    // ============================================
    var ext = colorConfig.extended_elements || {};

    // Top Navigation / Header
    // IMPORTANT: .hl-header (hyphen) is NOT a header - it's a tiny box around just the page title text
    // Only use .hl_header (underscore) and .hl-header-container for actual header bars
    if (ext.top_nav_bg) {
      css += '/* Top Navigation Background */\\n';
      css += '.hl_header,\\n';
      css += '.hl-header-container,\\n';
      css += '.location-header,\\n';
      css += 'header.flex.items-center { background-color: ' + ext.top_nav_bg + ' !important; }\\n';
    }
    if (ext.top_nav_text) {
      css += '/* Top Navigation Text */\\n';
      css += '.hl_header,\\n';
      css += '.hl_header a,\\n';
      css += '.hl_header span,\\n';
      css += '.hl-header-container,\\n';
      css += '.location-header { color: ' + ext.top_nav_text + ' !important; }\\n';
    }

    // Main Area Background
    // NOTE: Using GHL-specific selectors only - avoid broad selectors like 'main' or wildcards
    // that could accidentally color unintended elements
    if (ext.main_area_bg) {
      css += '/* Main Content Area Background */\\n';
      css += '.hl_main-content,\\n';
      css += '.hl-main-content,\\n';
      css += '.hl-right-pane,\\n';
      css += '.location-layout__content { background-color: ' + ext.main_area_bg + ' !important; }\\n';
    }

    // Cards
    // GHL uses: .hl-card, .ui-card, .card
    if (ext.card_bg) {
      css += '/* Card Backgrounds */\\n';
      css += '.hl-card,\\n';
      css += '.ui-card,\\n';
      css += '.card,\\n';
      css += '.n-card,\\n';
      css += '[class*="card-body"] { background-color: ' + ext.card_bg + ' !important; }\\n';
    }

    // Primary Buttons
    // GHL uses: .btn-primary, .hr-button--primary-type, .n-button--primary-type
    if (ext.button_primary_bg) {
      css += '/* Primary Button Background */\\n';
      css += '.btn-primary,\\n';
      css += '.hr-button--primary-type,\\n';
      css += '.n-button--primary-type,\\n';
      css += 'button.primary,\\n';
      css += '[class*="btn-primary"] {\\n';
      css += '  background-color: ' + ext.button_primary_bg + ' !important;\\n';
      css += '  border-color: ' + ext.button_primary_bg + ' !important;\\n';
      css += '}\\n';
    }
    if (ext.button_primary_text) {
      css += '/* Primary Button Text */\\n';
      css += '.btn-primary,\\n';
      css += '.hr-button--primary-type,\\n';
      css += '.n-button--primary-type,\\n';
      css += 'button.primary,\\n';
      css += '[class*="btn-primary"] { color: ' + ext.button_primary_text + ' !important; }\\n';
    }

    // Also apply primary color to buttons if set (backward compatibility)
    if (colorConfig.primary && !ext.button_primary_bg) {
      css += '/* Primary Color on Buttons (fallback) */\\n';
      css += '.btn-primary,\\n';
      css += '.hr-button--primary-type,\\n';
      css += '.n-button--primary-type {\\n';
      css += '  background-color: ' + colorConfig.primary + ' !important;\\n';
      css += '  border-color: ' + colorConfig.primary + ' !important;\\n';
      css += '}\\n';
    }

    // Input Fields
    // GHL uses: .hl-text-input, .hr-input__input-el, .n-input__input-el
    if (ext.input_bg) {
      css += '/* Input Field Background */\\n';
      css += '.hl-text-input,\\n';
      css += '.hr-input__input-el,\\n';
      css += '.n-input__input-el,\\n';
      css += '.hl-text-area-input,\\n';
      css += '.form-control,\\n';
      css += 'input[type="text"],\\n';
      css += 'input[type="email"],\\n';
      css += 'input[type="password"],\\n';
      css += 'input[type="number"],\\n';
      css += 'input[type="tel"],\\n';
      css += 'textarea,\\n';
      css += '.hr-select,\\n';
      css += '.n-select { background-color: ' + ext.input_bg + ' !important; }\\n';
    }
    if (ext.input_border) {
      css += '/* Input Field Border */\\n';
      css += '.hl-text-input,\\n';
      css += '.hr-input__input-el,\\n';
      css += '.n-input__input-el,\\n';
      css += '.hl-text-area-input,\\n';
      css += '.form-control,\\n';
      css += 'input[type="text"],\\n';
      css += 'input[type="email"],\\n';
      css += 'input[type="password"],\\n';
      css += 'input[type="number"],\\n';
      css += 'input[type="tel"],\\n';
      css += 'textarea,\\n';
      css += '.hr-select,\\n';
      css += '.n-select { border-color: ' + ext.input_border + ' !important; }\\n';
    }

    // Link Color
    if (ext.link_color) {
      css += '/* Link Colors */\\n';
      css += 'a:not(.btn):not([class*="button"]),\\n';
      css += '.hl-text-btn,\\n';
      css += '.hr-button--text,\\n';
      css += '.text-link { color: ' + ext.link_color + ' !important; }\\n';
    }

    style.textContent = css;
    document.head.appendChild(style);
    log('Color CSS injected with extended elements');

    // Debug: Log the full CSS for troubleshooting
    // Enable by setting window.AGENCY_TOOLKIT_DEBUG = true in console
    if (DEBUG || window.AGENCY_TOOLKIT_DEBUG) {
      console.log('[AgencyToolkit] Full Color CSS:\\n', css);
    }
  }

  // Apply loading animation
  function applyLoadingConfig(loadingConfig) {
    if (!loadingConfig) return;
    log('Applying loading config', loadingConfig);

    // Remove existing loading styles/elements
    var existingStyle = document.getElementById('agency-toolkit-loading');
    if (existingStyle) existingStyle.remove();
    var existingHideStyle = document.getElementById('agency-toolkit-hide-ghl-loader');
    if (existingHideStyle) existingHideStyle.remove();
    var existingLoader = document.getElementById('agency-toolkit-loader');
    if (existingLoader) existingLoader.remove();

    // Inject animation CSS if available
    if (loadingConfig.css) {
      var style = document.createElement('style');
      style.id = 'agency-toolkit-loading';

      var css = loadingConfig.css;

      // Apply speed modifier (adjust animation durations)
      // Speed > 1 = faster = shorter duration
      if (loadingConfig.speed && loadingConfig.speed !== 1) {
        var speedMultiplier = 1 / loadingConfig.speed;
        css = css.replace(/(\\d+\\.?\\d*)s/g, function(match, duration) {
          return (parseFloat(duration) * speedMultiplier).toFixed(2) + 's';
        });
      }

      // Apply size modifier via transform scale on loader children
      if (loadingConfig.size && loadingConfig.size !== 1) {
        css += '\\n.at-loader > * { transform: scale(' + loadingConfig.size + '); transform-origin: center; }';
      }

      style.textContent = css;
      document.head.appendChild(style);
      log('Loading animation CSS injected');
    }

    // Hide GHL's default loading spinners
    // Updated 2026-01-18: Using correct GHL selectors from discovery
    // GHL uses: .v-spinner, .app-loader, .hl-loader-container
    var hideGHLLoader = document.createElement('style');
    hideGHLLoader.id = 'agency-toolkit-hide-ghl-loader';
    hideGHLLoader.textContent = [
      '/* Hide GHL default loaders when our loader is active */',
      '/* Primary GHL spinner selectors (from discovery 2026-01-18) */',
      '.v-spinner,',
      '.app-loader,',
      '.hl-loader-container > *:not(.agency-toolkit-loader-instance),',
      '/* Secondary/legacy spinner selectors */',
      '.hl-loader, .hl-loading, [class*="hl-spinner"],',
      '.loading-spinner, .page-loader, .hl-page-loader,',
      '[class*="loading-indicator"], .spinner-border,',
      '.hr-skeleton, .n-skeleton,',
      '.hl-loading-overlay .hl-loading-spinner { display: none !important; }',
      '/* Ensure ALL loader containers have transparent background */',
      '/* This removes any dark/colored square behind the animation */',
      '.hl-loading-overlay,',
      '.hl-loader-container,',
      '.app-loader-container,',
      '.agency-toolkit-loader-instance,',
      '#agency-toolkit-loader { background: transparent !important; }'
    ].join('\\n');
    document.head.appendChild(hideGHLLoader);

    // Inject our custom loader HTML
    if (loadingConfig.html) {
      // Find GHL loading containers and inject our loader
      // Updated 2026-01-18: Added more GHL container selectors
      function injectLoader() {
        var loader = document.createElement('div');
        loader.id = 'agency-toolkit-loader';
        loader.innerHTML = loadingConfig.html;

        // Look for GHL loading overlay containers (expanded selector list)
        var loaderContainers = document.querySelectorAll([
          '.hl-loading-overlay',
          '.hl-loader-container',
          '.app-loader',
          '.v-spinner',
          '.loading-container',
          '[class*="loader-wrapper"]'
        ].join(', '));

        if (loaderContainers.length > 0) {
          loaderContainers.forEach(function(container) {
            // Check if we haven't already added our loader
            if (!container.querySelector('.agency-toolkit-loader-instance')) {
              var clone = loader.cloneNode(true);
              clone.removeAttribute('id');
              clone.classList.add('agency-toolkit-loader-instance');
              container.appendChild(clone);
            }
          });
          log('Custom loader injected into ' + loaderContainers.length + ' container(s)');
        }
      }

      // Inject immediately and also watch for dynamically added loaders
      injectLoader();

      // Watch for new loading containers being added (GHL SPA behavior)
      var loaderObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) {
              var isLoaderContainer = node.classList && (
                node.classList.contains('hl-loading-overlay') ||
                node.classList.contains('hl-loader-container') ||
                node.classList.contains('app-loader') ||
                node.classList.contains('v-spinner')
              );
              if (isLoaderContainer) {
                injectLoader();
              }
            }
          });
        });
      });

      loaderObserver.observe(document.body, { childList: true, subtree: true });
    }

    // Expose global helper functions
    window.AgencyToolkit = window.AgencyToolkit || {};
    window.AgencyToolkit.showLoader = function() {
      var loaders = document.querySelectorAll('.agency-toolkit-loader-instance, #agency-toolkit-loader');
      loaders.forEach(function(l) { l.style.display = 'flex'; });
    };
    window.AgencyToolkit.hideLoader = function() {
      var loaders = document.querySelectorAll('.agency-toolkit-loader-instance, #agency-toolkit-loader');
      loaders.forEach(function(l) { l.style.display = 'none'; });
    };
  }

  // ============================================
  // BUILDER MODE - Visual Element Selector
  // ============================================

  function initBuilderMode() {
    // Prevent multiple toolbars from being created
    if (document.getElementById('at-builder-toolbar')) {
      log('Builder toolbar already exists, skipping');
      return true; // Return true since builder mode IS active
    }

    // PRIMARY: Check hash fragment (recommended - survives all redirects)
    var hashParams = new URLSearchParams(window.location.hash.substring(1));
    var isBuilderMode = hashParams.get('at_builder_mode') === 'true';
    var sessionId = hashParams.get('at_session');
    var autoClose = hashParams.get('at_auto_close') !== 'false';

    // FALLBACK 1: Check query params (legacy support)
    if (!isBuilderMode || !sessionId) {
      var urlParams = new URLSearchParams(window.location.search);
      isBuilderMode = isBuilderMode || urlParams.get('at_builder_mode') === 'true';
      sessionId = sessionId || urlParams.get('at_session');
      if (urlParams.get('at_auto_close')) {
        autoClose = urlParams.get('at_auto_close') !== 'false';
      }
    }

    // Debug: Log what we found
    log('Builder mode check - URL', {
      hash: window.location.hash.substring(0, 50),
      search: window.location.search.substring(0, 50),
      foundInHash: hashParams.get('at_builder_mode') === 'true',
      foundInQuery: new URLSearchParams(window.location.search).get('at_builder_mode') === 'true'
    });

    // FALLBACK 2: Check sessionStorage (in case hash was also stripped somehow)
    if (!isBuilderMode || !sessionId) {
      try {
        var stored = sessionStorage.getItem(BUILDER_SESSION_KEY);
        log('Builder mode check - sessionStorage', { stored: stored ? 'found' : 'empty' });
        if (stored) {
          var data = JSON.parse(stored);
          // Only use if stored within the last 5 minutes (session is fresh)
          if (data.timestamp && Date.now() - data.timestamp < 5 * 60 * 1000) {
            isBuilderMode = data.builderMode === 'true';
            sessionId = data.sessionId;
            autoClose = data.autoClose !== 'false';
            logInfo('Builder mode restored from sessionStorage', { sessionId: sessionId });
          } else {
            log('Builder mode session expired', { age: Date.now() - data.timestamp });
          }
        }
      } catch (e) {
        logWarn('Builder mode sessionStorage error', e);
      }
    }

    if (!isBuilderMode || !sessionId) {
      log('Builder mode not active', { isBuilderMode: isBuilderMode, hasSessionId: !!sessionId });
      return false;
    }

    // Clear the stored session to prevent re-triggering on subsequent page loads
    try {
      sessionStorage.removeItem(BUILDER_SESSION_KEY);
    } catch (e) {}

    // IMPORTANT: Log always (not just debug) so user can confirm builder mode is activating
    console.log('[AgencyToolkit] 🎯 BUILDER MODE ACTIVATED', { sessionId: sessionId, autoClose: autoClose });

    // Add a temporary visual indicator to confirm script is running
    // (useful for debugging if toolbar doesn't appear)
    var debugIndicator = document.createElement('div');
    debugIndicator.id = 'at-builder-debug';
    debugIndicator.style.cssText = 'position:fixed;bottom:10px;right:10px;background:#10b981;color:white;padding:8px 12px;border-radius:6px;font-family:sans-serif;font-size:12px;z-index:2147483646;box-shadow:0 2px 8px rgba(0,0,0,0.2);';
    debugIndicator.textContent = '✓ Agency Toolkit: Builder mode active';
    document.body.appendChild(debugIndicator);
    // Remove after 5 seconds (once toolbar should be visible)
    setTimeout(function() {
      if (debugIndicator.parentNode) debugIndicator.remove();
    }, 5000);

    var builderModeOn = false;
    var currentHighlight = null;
    var toolbarPosition = { x: 20, y: 15 };

    // Try to restore toolbar position
    try {
      var saved = localStorage.getItem('at_toolbar_position');
      if (saved) {
        toolbarPosition = JSON.parse(saved);
      }
    } catch (e) {}

    // Create toolbar
    var toolbar = document.createElement('div');
    toolbar.id = 'at-builder-toolbar';
    toolbar.innerHTML = \`
      <div class="at-toolbar-drag" title="Drag to reposition">
        <svg viewBox="0 0 10 18" fill="currentColor">
          <circle cx="2" cy="2" r="1.5"/>
          <circle cx="8" cy="2" r="1.5"/>
          <circle cx="2" cy="9" r="1.5"/>
          <circle cx="8" cy="9" r="1.5"/>
          <circle cx="2" cy="16" r="1.5"/>
          <circle cx="8" cy="16" r="1.5"/>
        </svg>
      </div>

      <div class="at-toolbar-brand">
        <div class="at-toolbar-icon">
          <svg class="at-icon-gear" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/>
            <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
            <path d="M12 2v2"/><path d="M12 20v2"/>
            <path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/>
            <path d="M2 12h2"/><path d="M20 12h2"/>
            <path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
          </svg>
          <svg class="at-icon-target" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
        </div>
        <span class="at-toolbar-label">Agency Toolkit</span>
        <div class="at-toolbar-status at-status-inactive">
          <span class="at-status-text">Navigate to subaccount → Toggle ON</span>
        </div>
        <div class="at-toolbar-status at-status-active">
          <span class="at-status-dot"></span>
          <span class="at-status-text">Select an element</span>
        </div>
      </div>

      <div class="at-toolbar-divider"></div>

      <div class="at-toolbar-toggle">
        <span class="at-toggle-label">Builder Mode</span>
        <button class="at-toggle-btn" role="switch" aria-checked="false" aria-label="Toggle Builder Mode">
          <span class="at-toggle-track"></span>
          <span class="at-toggle-thumb"></span>
        </button>
      </div>

      <div class="at-toolbar-divider"></div>

      <button class="at-toolbar-close" title="Close builder (Esc)" aria-label="Close builder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6 6 18"/>
          <path d="m6 6 12 12"/>
        </svg>
      </button>
    \`;

    // Toolbar styles - polished SaaS design
    var toolbarStyles = document.createElement('style');
    toolbarStyles.id = 'at-builder-styles';
    toolbarStyles.textContent = \`
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&display=swap');

      #at-builder-toolbar {
        --at-slate-50: #f8fafc;
        --at-slate-100: #f1f5f9;
        --at-slate-200: #e2e8f0;
        --at-slate-300: #cbd5e1;
        --at-slate-400: #94a3b8;
        --at-slate-500: #64748b;
        --at-slate-600: #475569;
        --at-slate-700: #334155;
        --at-slate-800: #1e293b;
        --at-slate-900: #0f172a;
        --at-cyan-400: #22d3ee;
        --at-cyan-500: #06b6d4;
        --at-cyan-600: #0891b2;
        --at-teal-500: #14b8a6;

        position: fixed;
        top: 16px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        gap: 2px;
        background: linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(248,250,252,0.95));
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(226,232,240,0.8);
        border-radius: 16px;
        padding: 6px;
        box-shadow: 0 0 0 1px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.02), 0 8px 16px rgba(0,0,0,0.04), 0 24px 48px rgba(0,0,0,0.06);
        z-index: 2147483647;
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 13px;
        user-select: none;
        transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
        animation: at-toolbar-appear 0.5s cubic-bezier(0.16,1,0.3,1);
      }

      @keyframes at-toolbar-appear {
        from { opacity: 0; transform: translateX(-50%) translateY(-12px) scale(0.96); }
        to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
      }

      #at-builder-toolbar.at-dragging {
        transform: translateX(0) !important;
        left: auto !important;
        cursor: grabbing;
        box-shadow: 0 0 0 1px rgba(0,0,0,0.03), 0 4px 8px rgba(0,0,0,0.04), 0 16px 32px rgba(0,0,0,0.08), 0 32px 64px rgba(0,0,0,0.12);
      }

      #at-builder-toolbar.at-active {
        background: linear-gradient(135deg, rgba(224,247,250,0.97) 0%, rgba(207,250,254,0.97) 50%, rgba(236,254,255,0.97) 100%);
        border-color: rgba(6,182,212,0.3);
        box-shadow: 0 0 0 1px rgba(6,182,212,0.1), 0 2px 4px rgba(6,182,212,0.05), 0 8px 16px rgba(6,182,212,0.08), 0 24px 48px rgba(6,182,212,0.12), inset 0 1px 0 rgba(255,255,255,0.8);
      }

      .at-toolbar-drag {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 36px;
        cursor: grab;
        color: var(--at-slate-300);
        border-radius: 10px;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }
      .at-toolbar-drag:hover { color: var(--at-slate-400); background: rgba(148,163,184,0.1); }
      .at-toolbar-drag:active { cursor: grabbing; color: var(--at-slate-500); }
      .at-toolbar-drag svg { width: 10px; height: 18px; }

      .at-toolbar-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 0 12px 0 4px;
        height: 36px;
        border-radius: 10px;
      }

      .at-toolbar-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        background: linear-gradient(135deg, var(--at-slate-700), var(--at-slate-800));
        border-radius: 8px;
        color: white;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1);
        transition: all 0.3s ease;
      }
      #at-builder-toolbar.at-active .at-toolbar-icon {
        background: linear-gradient(135deg, var(--at-cyan-500), var(--at-teal-500));
        box-shadow: 0 2px 8px rgba(6,182,212,0.4), inset 0 1px 0 rgba(255,255,255,0.2);
      }
      .at-toolbar-icon svg { width: 16px; height: 16px; }
      .at-icon-target { display: none; }
      #at-builder-toolbar.at-active .at-icon-gear { display: none; }
      #at-builder-toolbar.at-active .at-icon-target { display: block; }

      .at-toolbar-label {
        font-weight: 600;
        font-size: 13px;
        color: var(--at-slate-700);
        letter-spacing: -0.01em;
        white-space: nowrap;
      }
      #at-builder-toolbar.at-active .at-toolbar-label { color: var(--at-cyan-600); }

      .at-toolbar-status {
        display: none;
        align-items: center;
        gap: 6px;
        padding-left: 10px;
        border-left: 1px solid var(--at-slate-200);
        margin-left: 2px;
      }
      /* Show inactive status (navigate) when toggle is OFF */
      .at-status-inactive { display: flex; }
      .at-status-inactive .at-status-text { color: var(--at-slate-500); }
      /* When active, hide inactive and show active status */
      #at-builder-toolbar.at-active .at-status-inactive { display: none; }
      #at-builder-toolbar.at-active .at-status-active { display: flex; }
      #at-builder-toolbar.at-active .at-toolbar-status { border-left-color: rgba(6,182,212,0.2); }

      .at-status-dot {
        width: 8px;
        height: 8px;
        background: var(--at-cyan-500);
        border-radius: 50%;
        animation: at-pulse 2s ease-in-out infinite;
      }
      @keyframes at-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(0.9); }
      }

      .at-status-text {
        font-size: 12px;
        font-weight: 500;
        color: var(--at-cyan-600);
      }

      .at-toolbar-divider {
        width: 1px;
        height: 24px;
        background: var(--at-slate-200);
        margin: 0 4px;
        flex-shrink: 0;
      }
      #at-builder-toolbar.at-active .at-toolbar-divider { background: rgba(6,182,212,0.2); }

      .at-toolbar-toggle {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 0 8px;
        height: 36px;
      }

      .at-toggle-label {
        font-size: 12px;
        font-weight: 500;
        color: var(--at-slate-500);
        white-space: nowrap;
      }

      .at-toggle-btn {
        position: relative;
        width: 48px;
        height: 28px;
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        flex-shrink: 0;
      }

      .at-toggle-track {
        position: absolute;
        inset: 0;
        background: var(--at-slate-200);
        border-radius: 14px;
        transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
        box-shadow: inset 0 1px 2px rgba(0,0,0,0.06);
      }
      .at-toggle-btn[aria-checked="true"] .at-toggle-track {
        background: linear-gradient(135deg, var(--at-cyan-400), var(--at-cyan-500));
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 8px rgba(6,182,212,0.3);
      }

      .at-toggle-thumb {
        position: absolute;
        top: 3px;
        left: 3px;
        width: 22px;
        height: 22px;
        background: white;
        border-radius: 11px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.06);
        transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
      }
      .at-toggle-btn[aria-checked="true"] .at-toggle-thumb {
        transform: translateX(20px);
        box-shadow: 0 1px 2px rgba(0,0,0,0.1), 0 4px 8px rgba(6,182,212,0.2);
      }
      .at-toggle-btn:hover .at-toggle-thumb {
        box-shadow: 0 2px 4px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.08);
      }

      .at-toolbar-close {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 36px;
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        color: var(--at-slate-400);
        border-radius: 10px;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }
      .at-toolbar-close:hover { color: #ef4444; background: rgba(239,68,68,0.08); }
      .at-toolbar-close svg { width: 14px; height: 14px; stroke-width: 2.5px; }

      .at-highlight-element {
        outline: 2px solid var(--at-cyan-500, #06b6d4) !important;
        outline-offset: 2px !important;
        background-color: rgba(6,182,212,0.05) !important;
        transition: outline-color 0.15s ease, background-color 0.15s ease !important;
      }

      #at-selection-popup {
        --at-slate-200: #e2e8f0;
        --at-slate-500: #64748b;
        --at-slate-800: #1e293b;
        --at-slate-900: #0f172a;
        --at-cyan-400: #22d3ee;

        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.95);
        background: linear-gradient(to bottom, rgba(255,255,255,0.98), rgba(248,250,252,0.98));
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid var(--at-slate-200);
        padding: 28px;
        border-radius: 20px;
        box-shadow: 0 0 0 1px rgba(0,0,0,0.03), 0 4px 8px rgba(0,0,0,0.04), 0 16px 32px rgba(0,0,0,0.08), 0 32px 64px rgba(0,0,0,0.12);
        z-index: 2147483647;
        max-width: 440px;
        width: 90%;
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        opacity: 0;
        animation: at-popup-appear 0.4s cubic-bezier(0.16,1,0.3,1) forwards;
      }

      @keyframes at-popup-appear {
        from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }

      #at-selection-popup .at-popup-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
      }

      #at-selection-popup .at-popup-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        background: linear-gradient(135deg, #10b981, #14b8a6);
        border-radius: 12px;
        color: white;
        font-size: 22px;
        box-shadow: 0 4px 12px rgba(16,185,129,0.3);
      }

      #at-selection-popup h3 {
        margin: 0;
        color: var(--at-slate-900);
        font-size: 18px;
        font-weight: 700;
        letter-spacing: -0.02em;
      }

      #at-selection-popup .at-element-preview {
        background: linear-gradient(135deg, #f8fafc, #f1f5f9);
        border: 1px solid var(--at-slate-200);
        padding: 16px;
        border-radius: 12px;
        margin-bottom: 16px;
      }

      #at-selection-popup .at-element-name {
        font-weight: 600;
        font-size: 15px;
        color: var(--at-slate-800);
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      #at-selection-popup .at-element-tag {
        font-size: 11px;
        font-weight: 600;
        color: var(--at-slate-500);
        background: var(--at-slate-200);
        padding: 2px 8px;
        border-radius: 4px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      #at-selection-popup .at-selector-preview {
        background: var(--at-slate-800);
        color: var(--at-cyan-400);
        padding: 12px 14px;
        border-radius: 8px;
        font-family: 'SF Mono', 'Fira Code', monospace;
        font-size: 12px;
        word-break: break-all;
        line-height: 1.5;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
      }

      #at-selection-popup .at-fragile-warning {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        background: rgba(245,158,11,0.1);
        border: 1px solid rgba(245,158,11,0.2);
        border-radius: 8px;
        margin-bottom: 16px;
        color: #b45309;
        font-size: 12px;
        font-weight: 500;
      }

      #at-selection-popup p {
        color: var(--at-slate-500);
        font-size: 13px;
        line-height: 1.5;
        margin: 0 0 20px;
      }

      #at-selection-popup button {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: linear-gradient(135deg, var(--at-slate-800), var(--at-slate-900));
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 10px;
        cursor: pointer;
        font-family: inherit;
        font-size: 14px;
        font-weight: 600;
        letter-spacing: -0.01em;
        transition: all 0.2s ease;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.1);
      }
      #at-selection-popup button:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.15);
      }
    \`;

    document.head.appendChild(toolbarStyles);
    document.body.appendChild(toolbar);

    // Ensure toolbar stays attached (GHL might replace DOM content during navigation)
    function ensureToolbarAttached() {
      if (!document.body.contains(toolbar)) {
        log('Toolbar was removed, re-attaching...');
        document.body.appendChild(toolbar);
      }
      if (!document.head.contains(toolbarStyles)) {
        document.head.appendChild(toolbarStyles);
      }
    }

    // Check periodically for the first 30 seconds (GHL navigation window)
    var attachmentChecks = 0;
    var attachmentInterval = setInterval(function() {
      ensureToolbarAttached();
      attachmentChecks++;
      if (attachmentChecks > 60) { // 30 seconds at 500ms intervals
        clearInterval(attachmentInterval);
      }
    }, 500);

    // Also use MutationObserver as backup
    var observer = new MutationObserver(function(mutations) {
      ensureToolbarAttached();
    });
    observer.observe(document.body, { childList: true });

    // Drag functionality
    var isDragging = false;
    var dragStartX, dragStartY, toolbarStartX, toolbarStartY;
    var dragHandle = toolbar.querySelector('.at-toolbar-drag');

    dragHandle.addEventListener('mousedown', function(e) {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      toolbarStartX = toolbar.offsetLeft;
      toolbarStartY = toolbar.offsetTop;
      e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      var newX = toolbarStartX + (e.clientX - dragStartX);
      var newY = toolbarStartY + (e.clientY - dragStartY);
      // Keep within viewport
      newX = Math.max(10, Math.min(window.innerWidth - toolbar.offsetWidth - 10, newX));
      newY = Math.max(10, Math.min(window.innerHeight - toolbar.offsetHeight - 10, newY));
      toolbar.style.left = newX + 'px';
      toolbar.style.top = newY + 'px';
    });

    document.addEventListener('mouseup', function() {
      if (isDragging) {
        isDragging = false;
        try {
          localStorage.setItem('at_toolbar_position', JSON.stringify({
            x: toolbar.offsetLeft,
            y: toolbar.offsetTop
          }));
        } catch (e) {}
      }
    });

    // Toggle functionality
    var toggleBtn = toolbar.querySelector('.at-toggle-btn');

    function setBuilderModeOn(on) {
      builderModeOn = on;
      toggleBtn.setAttribute('aria-checked', on ? 'true' : 'false');
      toolbar.classList.toggle('at-active', on);

      if (!on && currentHighlight) {
        currentHighlight.classList.remove('at-highlight-element');
        currentHighlight = null;
      }

      log('Builder mode ' + (on ? 'ON' : 'OFF'));
    }

    toggleBtn.addEventListener('click', function() {
      setBuilderModeOn(!builderModeOn);
    });

    // Keyboard shortcut (Ctrl+Shift+B)
    document.addEventListener('keydown', function(e) {
      if (e.ctrlKey && e.shiftKey && e.key === 'B') {
        setBuilderModeOn(!builderModeOn);
        e.preventDefault();
      }
    });

    // Close button
    toolbar.querySelector('.at-toolbar-close').addEventListener('click', function() {
      sendSelection({ cancelled: true, sessionId: sessionId });
      window.close();
    });

    // Hover highlighting
    document.addEventListener('mouseover', function(e) {
      if (!builderModeOn) return;
      if (e.target.closest('#at-builder-toolbar')) return;
      if (e.target.closest('#at-selection-popup')) return;

      if (currentHighlight) {
        currentHighlight.classList.remove('at-highlight-element');
      }
      e.target.classList.add('at-highlight-element');
      currentHighlight = e.target;
    }, true);

    // Click handling
    document.addEventListener('click', function(e) {
      if (!builderModeOn) return;
      if (e.target.closest('#at-builder-toolbar')) return;
      if (e.target.closest('#at-selection-popup')) return;

      e.preventDefault();
      e.stopPropagation();

      var element = e.target;
      var selector = generateSelector(element);
      var displayName = getDisplayName(element);
      var isFragile = selector.includes(':nth');

      var elementData = {
        selector: selector,
        displayName: displayName,
        tagName: element.tagName.toLowerCase(),
        pageUrl: window.location.href,
        pageTitle: document.title,
        isFragile: isFragile,
        attributes: getElementAttributes(element),
        rect: {
          top: element.getBoundingClientRect().top,
          left: element.getBoundingClientRect().left,
          width: element.offsetWidth,
          height: element.offsetHeight
        },
        sessionId: sessionId,
        timestamp: Date.now()
      };

      // Show confirmation
      showSelectionConfirmation(elementData);
    }, true);

    // Generate CSS selector
    function generateSelector(element) {
      try {
        // Try ID first (safest)
        if (element.id && !element.id.match(/^\\d/) && !element.id.includes(':')) {
          return '#' + CSS.escape(element.id);
        }

        // Try data attributes (common in GHL)
        for (var i = 0; i < element.attributes.length; i++) {
          var attr = element.attributes[i];
          if (attr.name.startsWith('data-') && attr.value && !attr.value.includes('"')) {
            var sel = '[' + attr.name + '="' + attr.value + '"]';
            try {
              if (document.querySelectorAll(sel).length === 1) {
                return sel;
              }
            } catch (e) {
              // Invalid selector, continue trying
            }
          }
        }

      // Try unique class combination
      if (element.classList.length > 0) {
        var classes = Array.from(element.classList)
          .filter(function(c) {
            // Filter out:
            // - Our own classes (at-)
            // - Tailwind responsive/state classes with colons (sm:, md:, lg:, hover:, etc.)
            // - Classes with special characters that break CSS selectors
            return !c.startsWith('at-') &&
                   !c.includes(':') &&
                   !c.includes('[') &&
                   !c.includes(']');
          })
          .join('.');
        if (classes) {
          var sel = element.tagName.toLowerCase() + '.' + classes;
          try {
            // Verify the selector is valid before returning
            if (document.querySelectorAll(sel).length === 1) {
              return sel;
            }
          } catch (e) {
            // Invalid selector, fall through to path-based
            log('Invalid selector generated, using path fallback', sel);
          }
        }
      }

      // Fall back to path-based selector
      return generatePathSelector(element);
      } catch (e) {
        // If all else fails, use path-based selector
        logError('Selector generation error', e);
        return generatePathSelector(element);
      }
    }

    function generatePathSelector(element) {
      var path = [];
      var current = element;

      try {
        while (current && current !== document.body && path.length < 10) {
          var selector = current.tagName.toLowerCase();

          // Check for valid ID (no special chars)
          if (current.id && !current.id.match(/^\\d/) && !current.id.includes(':')) {
            selector = '#' + CSS.escape(current.id);
            path.unshift(selector);
            break;
          }

          var siblings = current.parentElement ? current.parentElement.children : [];
          var sameTagSiblings = Array.from(siblings).filter(function(s) {
            return s.tagName === current.tagName;
          });

          if (sameTagSiblings.length > 1) {
            var index = sameTagSiblings.indexOf(current) + 1;
            selector += ':nth-of-type(' + index + ')';
          }

          path.unshift(selector);
          current = current.parentElement;
        }
      } catch (e) {
        logError('Path selector generation error', e);
        return 'body'; // Fallback to body
      }

      return path.join(' > ');
    }

    function getDisplayName(element) {
      // PRIORITY 1: Check if this element is a sidebar menu item with a custom rename
      // This ensures we show the agency's custom name (e.g., "Connect Google")
      // instead of GHL's original name (e.g., "Launchpad")
      var config = window.__AGENCY_TOOLKIT_CONFIG__;
      if (config && config.menu && config.menu.renamed_items) {
        // Check if element or its ancestor has data-sidebar-item attribute
        var sidebarItem = element.closest('[data-sidebar-item]');
        if (sidebarItem) {
          var itemId = sidebarItem.getAttribute('data-sidebar-item');
          if (itemId && config.menu.renamed_items[itemId]) {
            return config.menu.renamed_items[itemId]; // Return custom name
          }
        }
        // Also check if element itself has an ID matching sidebar pattern (sb_*)
        if (element.id && element.id.startsWith('sb_') && config.menu.renamed_items[element.id]) {
          return config.menu.renamed_items[element.id];
        }
      }

      // PRIORITY 2: Try aria-label
      if (element.getAttribute('aria-label')) {
        return element.getAttribute('aria-label');
      }
      // PRIORITY 3: Try title
      if (element.title) {
        return element.title;
      }
      // PRIORITY 4: Try text content
      var text = element.textContent || '';
      text = text.trim().slice(0, 50);
      if (text && text.length > 0) {
        return text + (element.textContent.length > 50 ? '...' : '');
      }
      // Fall back to tag name
      return '<' + element.tagName.toLowerCase() + '>';
    }

    function getElementAttributes(element) {
      var attrs = {};
      for (var i = 0; i < element.attributes.length; i++) {
        var attr = element.attributes[i];
        if (!attr.name.startsWith('on')) {
          attrs[attr.name] = attr.value;
        }
      }
      return attrs;
    }

    function showSelectionConfirmation(data) {
      // Remove existing popup
      var existing = document.getElementById('at-selection-popup');
      if (existing) existing.remove();

      var fragileWarning = data.isFragile ? \`
        <div class="at-fragile-warning">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>
            <path d="M12 9v4"/><path d="M12 17h.01"/>
          </svg>
          <span>This selector uses element position and may be fragile</span>
        </div>
      \` : '';

      var popup = document.createElement('div');
      popup.id = 'at-selection-popup';
      popup.innerHTML = \`
        <div class="at-popup-header">
          <div class="at-popup-icon">✓</div>
          <h3>Element Captured!</h3>
        </div>
        <div class="at-element-preview">
          <div class="at-element-name">
            \${escapeHtml(data.displayName)}
            <span class="at-element-tag">\${data.tagName}</span>
          </div>
          <div class="at-selector-preview">\${escapeHtml(data.selector)}</div>
        </div>
        \${fragileWarning}
        <p>Taking you back to Agency Toolkit now...</p>
        <button onclick="document.getElementById('at-selection-popup').remove(); window.close();">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Close & Return
        </button>
      \`;
      document.body.appendChild(popup);

      function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
      }

      // Send data
      sendSelection(data);

      // Auto-close if enabled (3 second delay to let user see confirmation)
      if (autoClose) {
        setTimeout(function() { window.close(); }, 3000);
      }
    }

    function sendSelection(data) {
      // Debug: Log opener status
      console.log('[AgencyToolkit DEBUG] sendSelection called');
      console.log('[AgencyToolkit DEBUG] window.opener exists:', !!window.opener);
      console.log('[AgencyToolkit DEBUG] window.opener.closed:', window.opener ? window.opener.closed : 'N/A');
      console.log('[AgencyToolkit DEBUG] data to send:', JSON.stringify(data, null, 2));

      // Primary method: window.opener.postMessage (works cross-origin)
      if (window.opener && !window.opener.closed) {
        try {
          var message = {
            type: 'at_element_selection',
            payload: data
          };
          console.log('[AgencyToolkit DEBUG] Attempting postMessage with:', message);
          window.opener.postMessage(message, '*');
          console.log('[AgencyToolkit DEBUG] postMessage SUCCESS - message sent to opener');
        } catch (e) {
          console.error('[AgencyToolkit DEBUG] postMessage FAILED:', e);
        }
      } else {
        console.warn('[AgencyToolkit DEBUG] No opener window available - cannot use postMessage');
        console.log('[AgencyToolkit DEBUG] This may happen if:');
        console.log('  - The tab was opened via link instead of window.open()');
        console.log('  - The opener window was closed');
        console.log('  - Browser security blocked the reference');
      }

      // Fallback: BroadcastChannel (same-origin only)
      try {
        var channel = new BroadcastChannel('at_element_selection');
        channel.postMessage(data);
        channel.close();
        console.log('[AgencyToolkit DEBUG] BroadcastChannel fallback sent');
      } catch (e) {
        console.log('[AgencyToolkit DEBUG] BroadcastChannel not available (expected for cross-origin)');
      }

      // Fallback: localStorage (same-origin only)
      try {
        localStorage.setItem('at_selected_element', JSON.stringify(data));
        console.log('[AgencyToolkit DEBUG] localStorage fallback set');
      } catch (e) {
        console.log('[AgencyToolkit DEBUG] localStorage not available');
      }

      log('Selection sent', data);
    }

    return true; // Builder mode is active
  }

  // ============================================
  // PREVIEW MODE - Tour Preview from Dashboard
  // ============================================

  var PREVIEW_SESSION_KEY_PREFIX = 'at_preview_';

  function initPreviewMode() {
    // Check hash fragment for preview mode
    var hashParams = new URLSearchParams(window.location.hash.substring(1));
    var isPreviewMode = hashParams.get('at_preview_mode') === 'true';
    var sessionId = hashParams.get('at_preview_session');

    if (!isPreviewMode || !sessionId) {
      return false;
    }

    // Try to get preview data from sessionStorage
    var previewDataStr = null;
    try {
      previewDataStr = sessionStorage.getItem(PREVIEW_SESSION_KEY_PREFIX + sessionId);
      // Clear after reading
      sessionStorage.removeItem(PREVIEW_SESSION_KEY_PREFIX + sessionId);
    } catch (e) {
      logError('Failed to read preview data from sessionStorage', e);
    }

    if (!previewDataStr) {
      logWarn('Preview session not found:', sessionId);
      return false;
    }

    var previewData;
    try {
      previewData = JSON.parse(previewDataStr);
    } catch (e) {
      logError('Failed to parse preview data', e);
      return false;
    }

    // Verify timestamp (expire after 1 hour)
    if (previewData.timestamp && Date.now() - previewData.timestamp > 60 * 60 * 1000) {
      logWarn('Preview session expired');
      return false;
    }

    console.log('[AgencyToolkit] 🔍 PREVIEW MODE ACTIVATED', {
      tourName: previewData.tour?.name,
      stepCount: previewData.tour?.steps?.length || 0
    });

    // Create preview toolbar
    createPreviewToolbar(previewData);

    // Load Driver.js and render the tour
    loadDriverJSAndRenderTour(previewData);

    return true;
  }

  function createPreviewToolbar(previewData) {
    var tour = previewData.tour || {};
    var steps = tour.steps || [];
    var currentStepIndex = 0;

    var toolbar = document.createElement('div');
    toolbar.id = 'at-preview-toolbar';
    toolbar.innerHTML = \`
      <div class="at-preview-drag" title="Drag to reposition">
        <svg viewBox="0 0 10 18" fill="currentColor">
          <circle cx="2" cy="2" r="1.5"/>
          <circle cx="8" cy="2" r="1.5"/>
          <circle cx="2" cy="9" r="1.5"/>
          <circle cx="8" cy="9" r="1.5"/>
          <circle cx="2" cy="16" r="1.5"/>
          <circle cx="8" cy="16" r="1.5"/>
        </svg>
      </div>

      <div class="at-preview-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.3-4.3"/>
        </svg>
      </div>

      <span class="at-preview-label">PREVIEW MODE</span>

      <div class="at-preview-divider"></div>

      <span class="at-preview-tour-name">\${escapeHtmlPreview(tour.name || 'Untitled Tour')}</span>

      <div class="at-preview-divider"></div>

      <div class="at-preview-nav">
        <button class="at-preview-nav-btn at-prev" title="Previous step" disabled>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <span class="at-preview-step-counter">Step <span class="at-current-step">1</span> of <span class="at-total-steps">\${steps.length}</span></span>
        <button class="at-preview-nav-btn at-next" title="Next step">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
      </div>

      <div class="at-preview-divider"></div>

      <button class="at-preview-restart" title="Restart tour">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
          <path d="M21 3v5h-5"/>
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
          <path d="M8 16H3v5"/>
        </svg>
      </button>

      <button class="at-preview-exit" title="Exit preview">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M18 6 6 18"/>
          <path d="m6 6 12 12"/>
        </svg>
      </button>
    \`;

    function escapeHtmlPreview(str) {
      var div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    // Preview toolbar styles - amber/orange theme
    var styles = document.createElement('style');
    styles.id = 'at-preview-styles';
    styles.textContent = \`
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&display=swap');

      #at-preview-toolbar {
        --at-amber-50: #fffbeb;
        --at-amber-100: #fef3c7;
        --at-amber-200: #fde68a;
        --at-amber-500: #f59e0b;
        --at-amber-600: #d97706;
        --at-amber-700: #b45309;
        --at-slate-600: #475569;
        --at-slate-700: #334155;
        --at-slate-800: #1e293b;

        position: fixed;
        top: 16px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        gap: 4px;
        background: linear-gradient(135deg, rgba(254,243,199,0.97) 0%, rgba(253,230,138,0.97) 50%, rgba(254,249,195,0.97) 100%);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(245,158,11,0.3);
        border-radius: 14px;
        padding: 6px 8px;
        box-shadow: 0 0 0 1px rgba(245,158,11,0.1), 0 2px 4px rgba(245,158,11,0.05), 0 8px 16px rgba(245,158,11,0.1), 0 24px 48px rgba(245,158,11,0.15);
        z-index: 2147483647;
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 13px;
        user-select: none;
        animation: at-preview-appear 0.4s cubic-bezier(0.16,1,0.3,1);
      }

      @keyframes at-preview-appear {
        from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
      }

      #at-preview-toolbar.at-dragging {
        transform: translateX(0) !important;
        left: auto !important;
        cursor: grabbing;
      }

      .at-preview-drag {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 32px;
        cursor: grab;
        color: var(--at-amber-500);
        border-radius: 8px;
        transition: all 0.2s ease;
      }
      .at-preview-drag:hover { color: var(--at-amber-600); background: rgba(245,158,11,0.1); }
      .at-preview-drag svg { width: 10px; height: 18px; }

      .at-preview-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        background: linear-gradient(135deg, var(--at-amber-500), var(--at-amber-600));
        border-radius: 8px;
        color: white;
        box-shadow: 0 2px 8px rgba(245,158,11,0.4);
      }
      .at-preview-icon svg { width: 16px; height: 16px; }

      .at-preview-label {
        font-weight: 700;
        font-size: 11px;
        color: var(--at-amber-700);
        letter-spacing: 0.05em;
        text-transform: uppercase;
        padding: 0 8px;
      }

      .at-preview-tour-name {
        font-weight: 600;
        font-size: 13px;
        color: var(--at-slate-700);
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 0 8px;
      }

      .at-preview-divider {
        width: 1px;
        height: 20px;
        background: rgba(245,158,11,0.3);
        margin: 0 2px;
      }

      .at-preview-nav {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 0 4px;
      }

      .at-preview-nav-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        background: white;
        border: 1px solid rgba(245,158,11,0.3);
        border-radius: 6px;
        cursor: pointer;
        color: var(--at-amber-600);
        transition: all 0.2s ease;
      }
      .at-preview-nav-btn:hover:not(:disabled) {
        background: var(--at-amber-50);
        border-color: var(--at-amber-500);
      }
      .at-preview-nav-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      .at-preview-nav-btn svg { width: 16px; height: 16px; }

      .at-preview-step-counter {
        font-size: 12px;
        font-weight: 500;
        color: var(--at-slate-600);
        white-space: nowrap;
      }

      .at-preview-restart,
      .at-preview-exit {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.2s ease;
      }

      .at-preview-restart {
        color: var(--at-amber-600);
      }
      .at-preview-restart:hover {
        color: var(--at-amber-700);
        background: rgba(245,158,11,0.1);
      }
      .at-preview-restart svg { width: 18px; height: 18px; }

      .at-preview-exit {
        color: var(--at-slate-600);
      }
      .at-preview-exit:hover {
        color: #ef4444;
        background: rgba(239,68,68,0.08);
      }
      .at-preview-exit svg { width: 16px; height: 16px; }
    \`;

    document.head.appendChild(styles);
    document.body.appendChild(toolbar);

    // Drag functionality
    var isDragging = false;
    var dragStartX, dragStartY, toolbarStartX, toolbarStartY;
    var dragHandle = toolbar.querySelector('.at-preview-drag');

    dragHandle.addEventListener('mousedown', function(e) {
      isDragging = true;
      toolbar.classList.add('at-dragging');
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      toolbarStartX = toolbar.offsetLeft;
      toolbarStartY = toolbar.offsetTop;
      e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      var newX = toolbarStartX + (e.clientX - dragStartX);
      var newY = toolbarStartY + (e.clientY - dragStartY);
      newX = Math.max(10, Math.min(window.innerWidth - toolbar.offsetWidth - 10, newX));
      newY = Math.max(10, Math.min(window.innerHeight - toolbar.offsetHeight - 10, newY));
      toolbar.style.left = newX + 'px';
      toolbar.style.top = newY + 'px';
    });

    document.addEventListener('mouseup', function() {
      if (isDragging) {
        isDragging = false;
        toolbar.classList.remove('at-dragging');
      }
    });

    // Exit button
    toolbar.querySelector('.at-preview-exit').addEventListener('click', function() {
      // Clean up and close
      window.close();
    });

    // Store reference for Driver.js integration
    window.__AT_PREVIEW_TOOLBAR__ = toolbar;
  }

  function loadDriverJSAndRenderTour(previewData) {
    var tour = previewData.tour || {};
    var theme = previewData.theme || null;
    var steps = tour.steps || [];

    if (steps.length === 0) {
      logWarn('No steps in tour to preview');
      return;
    }

    // Load Driver.js CSS
    var cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://cdn.jsdelivr.net/npm/driver.js@1.3.1/dist/driver.css';
    document.head.appendChild(cssLink);

    // Load Driver.js script
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/driver.js@1.3.1/dist/driver.js.iife.js';
    script.onload = function() {
      log('Driver.js loaded for preview');
      renderTourWithDriverJS(steps, tour.settings || {}, theme);
    };
    script.onerror = function() {
      logError('Failed to load Driver.js');
    };
    document.head.appendChild(script);
  }

  function renderTourWithDriverJS(steps, settings, theme) {
    if (!window.driver) {
      logError('Driver.js not available');
      return;
    }

    // Apply theme CSS
    if (theme) {
      injectTourThemeStyles(theme);
    }

    // Map steps to Driver.js format
    var previewShowClose = settings.show_close !== false;
    var driverSteps = steps.map(function(step, index) {
      var buttons = ['next', 'previous'];
      if (previewShowClose) buttons.push('close');
      var driverStep = {
        popover: {
          title: step.title || 'Step ' + (index + 1),
          description: step.content || '',
          showButtons: buttons,
          nextBtnText: index === steps.length - 1 ? 'Finish' : (step.buttons?.primary?.text || 'Next'),
          prevBtnText: step.buttons?.secondary?.text || 'Previous',
          doneBtnText: 'Finish',
        }
      };

      // Handle element targeting
      if (step.element?.selector && step.type !== 'modal') {
        driverStep.element = step.element.selector;
        if (step.position) {
          driverStep.popover.side = mapPositionToDriverJS(step.position);
        }
      }

      // Allow interaction with highlighted element when enabled
      if (step.settings?.allow_interaction) {
        driverStep.disableActiveInteraction = false;
        log('Step ' + (index + 1) + ': allow_interaction enabled');
      }

      return driverStep;
    });

    // Create Driver instance
    // Driver.js IIFE exposes: window.driver = { js: { driver: fn, ... } }
    // Debug: Log what's available
    log('Driver.js loaded, window.driver:', typeof window.driver, window.driver);
    if (window.driver && window.driver.js && typeof window.driver.js.driver === 'function') {
      log('Using window.driver.js.driver()');
    } else {
      logError('Driver.js not loaded correctly. window.driver:', window.driver);
      return;
    }

    var driverFn = window.driver.js.driver;
    var showClose = settings.show_close !== false;
    var closeOnOutsideClick = settings.close_on_outside_click === true;

    var driverInstance = driverFn({
      showProgress: settings.show_progress !== false,
      showButtons: true,
      animate: true,
      allowClose: showClose || closeOnOutsideClick,
      overlayOpacity: 0.5,
      stagePadding: 10,
      stageRadius: 8,
      popoverClass: 'at-tour-popover',
      steps: driverSteps,
      onHighlightStarted: function(element, step, options) {
        updatePreviewToolbarStep(options.state.activeIndex + 1, steps.length);
      },
      onDestroyStarted: function() {
        log('Preview tour ended');
      }
    });

    // Store instance for toolbar controls
    window.__AT_DRIVER_INSTANCE__ = driverInstance;

    // Wire up toolbar navigation
    var toolbar = window.__AT_PREVIEW_TOOLBAR__;
    if (toolbar) {
      var prevBtn = toolbar.querySelector('.at-prev');
      var nextBtn = toolbar.querySelector('.at-next');
      var restartBtn = toolbar.querySelector('.at-preview-restart');

      prevBtn.addEventListener('click', function() {
        if (driverInstance.hasNextStep()) {
          driverInstance.movePrevious();
        }
      });

      nextBtn.addEventListener('click', function() {
        if (driverInstance.hasNextStep()) {
          driverInstance.moveNext();
        }
      });

      restartBtn.addEventListener('click', function() {
        driverInstance.drive(0);
      });
    }

    // Start the tour after a short delay to let page settle
    setTimeout(function() {
      driverInstance.drive();
    }, 500);
  }

  function mapPositionToDriverJS(position) {
    var positionMap = {
      'top': 'top',
      'bottom': 'bottom',
      'left': 'left',
      'right': 'right',
      'center': 'over',
      'top-left': 'top-start',
      'top-right': 'top-end',
      'bottom-left': 'bottom-start',
      'bottom-right': 'bottom-end',
    };
    return positionMap[position] || 'bottom';
  }

  function updatePreviewToolbarStep(current, total) {
    var toolbar = window.__AT_PREVIEW_TOOLBAR__;
    if (!toolbar) return;

    var currentSpan = toolbar.querySelector('.at-current-step');
    var prevBtn = toolbar.querySelector('.at-prev');
    var nextBtn = toolbar.querySelector('.at-next');

    if (currentSpan) currentSpan.textContent = current;
    if (prevBtn) prevBtn.disabled = current === 1;
    if (nextBtn) nextBtn.disabled = current === total;
  }

  function injectTourThemeStyles(theme) {
    var existing = document.getElementById('at-tour-theme-styles');
    if (existing) existing.remove();

    // Default theme values - matches the nice preview styling
    var defaultColors = {
      primary: '#3b82f6',
      secondary: '#64748b',
      background: '#ffffff',
      text: '#1f2937',
      text_secondary: '#6b7280',
      border: '#e5e7eb',
      overlay: 'rgba(0,0,0,0.5)'
    };

    var defaultTypography = {
      font_family: 'system-ui, -apple-system, sans-serif',
      title_size: '18px',
      body_size: '14px'
    };

    var defaultBorders = {
      radius: '12px'
    };

    // Use theme values or fall back to defaults
    var colors = theme && theme.colors ? theme.colors : defaultColors;
    var typography = theme && theme.typography ? theme.typography : defaultTypography;
    var borders = theme && theme.borders ? theme.borders : defaultBorders;

    // Ensure all values have fallbacks
    var bg = colors.background || defaultColors.background;
    var text = colors.text || defaultColors.text;
    var textSec = colors.text_secondary || defaultColors.text_secondary;
    var primary = colors.primary || defaultColors.primary;
    var secondary = colors.secondary || defaultColors.secondary;
    var border = colors.border || defaultColors.border;
    var fontFamily = typography.font_family || defaultTypography.font_family;
    var titleSize = typography.title_size || defaultTypography.title_size;
    var bodySize = typography.body_size || defaultTypography.body_size;
    var radius = borders.radius || defaultBorders.radius;

    // Parse radius to ensure it's a valid number
    var radiusNum = parseInt(radius) || 12;

    var css = \`
      .at-tour-popover .driver-popover {
        background-color: \${bg} !important;
        color: \${text} !important;
        -webkit-text-fill-color: \${text} !important;
        text-shadow: none !important;
        border: 1px solid \${border} !important;
        border-radius: \${radiusNum}px !important;
        font-family: \${fontFamily} !important;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1), 0 20px 25px -5px rgba(0,0,0,0.1) !important;
        max-width: 340px !important;
        padding: 16px !important;
      }

      .at-tour-popover .driver-popover *,
      .at-tour-popover .driver-popover *::before,
      .at-tour-popover .driver-popover *::after {
        -webkit-text-fill-color: inherit !important;
        text-shadow: none !important;
      }

      .at-tour-popover .driver-popover-title {
        color: \${text} !important;
        -webkit-text-fill-color: \${text} !important;
        text-shadow: none !important;
        font-size: \${titleSize} !important;
        font-weight: 600 !important;
        margin-bottom: 8px !important;
      }

      .at-tour-popover .driver-popover-description {
        color: \${textSec} !important;
        -webkit-text-fill-color: \${textSec} !important;
        text-shadow: none !important;
        font-size: \${bodySize} !important;
        line-height: 1.5 !important;
        margin-bottom: 16px !important;
      }

      .at-tour-popover .driver-popover-footer {
        margin-top: 12px !important;
      }

      .at-tour-popover .driver-popover-next-btn,
      .at-tour-popover .driver-popover-done-btn {
        background-color: \${primary} !important;
        color: white !important;
        -webkit-text-fill-color: white !important;
        text-shadow: none !important;
        border: none !important;
        border-radius: 8px !important;
        padding: 10px 20px !important;
        font-weight: 600 !important;
        font-size: 14px !important;
        transition: all 0.2s ease !important;
        cursor: pointer !important;
      }

      .at-tour-popover .driver-popover-next-btn:hover,
      .at-tour-popover .driver-popover-done-btn:hover {
        filter: brightness(1.1) !important;
      }

      .at-tour-popover .driver-popover-prev-btn {
        background-color: transparent !important;
        color: \${secondary} !important;
        -webkit-text-fill-color: \${secondary} !important;
        text-shadow: none !important;
        border: 1px solid \${border} !important;
        border-radius: 8px !important;
        padding: 10px 20px !important;
        font-weight: 500 !important;
        font-size: 14px !important;
        cursor: pointer !important;
      }

      .at-tour-popover .driver-popover-prev-btn:hover {
        background-color: rgba(0,0,0,0.05) !important;
      }

      .at-tour-popover .driver-popover-close-btn {
        color: \${textSec} !important;
        opacity: 0.7 !important;
        transition: opacity 0.2s ease !important;
      }

      .at-tour-popover .driver-popover-close-btn:hover {
        opacity: 1 !important;
      }

      .at-tour-popover .driver-popover-progress-text {
        color: \${textSec} !important;
        -webkit-text-fill-color: \${textSec} !important;
        text-shadow: none !important;
        font-size: 13px !important;
        font-weight: 500 !important;
      }

      .at-tour-popover .driver-popover-arrow {
        border-color: \${bg} !important;
      }

      .at-tour-popover .driver-popover-arrow-side-left {
        border-left-color: \${bg} !important;
      }

      .at-tour-popover .driver-popover-arrow-side-right {
        border-right-color: \${bg} !important;
      }

      .at-tour-popover .driver-popover-arrow-side-top {
        border-top-color: \${bg} !important;
      }

      .at-tour-popover .driver-popover-arrow-side-bottom {
        border-bottom-color: \${bg} !important;
      }

      .driver-active-element {
        box-shadow: 0 0 0 4px \${primary}40 !important;
      }

      /* Auto-advance click feedback */
      .at-clicked {
        animation: at-pulse 0.3s ease-out !important;
      }

      @keyframes at-pulse {
        0% { box-shadow: 0 0 0 0 \${primary}80; }
        100% { box-shadow: 0 0 0 20px \${primary}00; }
      }

      /* Upload Photo button in tour popover */
      .at-upload-photo-btn {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 8px 20px !important;
        border: 1px solid \${border} !important;
        border-radius: \${radius} !important;
        background: transparent !important;
        color: \${text} !important;
        -webkit-text-fill-color: \${text} !important;
        font-size: 14px !important;
        font-weight: 500 !important;
        cursor: pointer !important;
        transition: all 0.15s ease !important;
      }
      .at-upload-photo-btn--block {
        display: flex !important;
        margin: 12px auto 8px auto !important;
      }
      .at-upload-photo-btn:hover {
        background: \${primary}15 !important;
        border-color: \${primary} !important;
        color: \${primary} !important;
        -webkit-text-fill-color: \${primary} !important;
      }
      .at-upload-photo-btn svg {
        flex-shrink: 0 !important;
      }
    \`;

    var style = document.createElement('style');
    style.id = 'at-tour-theme-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ============================================
  // PRODUCTION TOUR RUNTIME - Live Tours
  // ============================================

  var TOUR_STATE_KEY_PREFIX = 'at_tour_';

  // Extract GHL location ID from URL path
  // URL format: /v2/location/LOCATION_ID/...
  function getGHLLocationId() {
    var path = window.location.pathname;
    var match = path.match(/\\/v2\\/location\\/([^\\/]+)/);
    if (match && match[1]) {
      return match[1];
    }
    // Fallback: use hostname to differentiate at minimum
    return window.location.hostname;
  }

  // Resolve a URL relative to the current GHL sub-account
  // e.g. "/media-storage" becomes "/v2/location/{id}/media-storage"
  // Full URLs (http/https) are returned as-is
  function resolveGHLUrl(url) {
    if (!url) return url;
    // Already a full URL - return as-is
    if (url.match(/^https?:\\/\\//)) return url;
    // Strip leading slash for consistency
    var page = url.replace(/^\\//, '');
    var locationId = getGHLLocationId();
    if (locationId && locationId !== window.location.hostname) {
      return '/v2/location/' + locationId + '/' + page;
    }
    // Fallback if we can't detect location ID
    return url;
  }

  // Build storage key that's unique per tour AND per subaccount
  function getTourStorageKey(tourId) {
    var locationId = getGHLLocationId();
    return TOUR_STATE_KEY_PREFIX + tourId + '_' + locationId;
  }

  // Get tour state from localStorage (per subaccount)
  function getTourState(tourId) {
    try {
      var key = getTourStorageKey(tourId);
      var stateStr = localStorage.getItem(key);
      if (stateStr) {
        return JSON.parse(stateStr);
      }
    } catch (e) {
      // Ignore parse errors
    }
    return null;
  }

  // Save tour state to localStorage (per subaccount)
  function saveTourState(tourId, state) {
    try {
      var key = getTourStorageKey(tourId);
      localStorage.setItem(key, JSON.stringify(state));
      log('Tour state saved for location:', getGHLLocationId());
    } catch (e) {
      logWarn('Failed to save tour state', e);
    }
  }

  // Track tour analytics event
  function trackTourEvent(event, tourId, extra) {
    if (!CONFIG_KEY) return;

    var payload = {
      event: event,
      tour_id: tourId,
      agency_token: CONFIG_KEY,
      url: window.location.href,
      timestamp: Date.now()
    };

    // Merge extra data
    if (extra) {
      for (var key in extra) {
        if (extra.hasOwnProperty(key)) {
          payload[key] = extra[key];
        }
      }
    }

    // Send analytics (fire and forget)
    fetch(API_BASE + '/api/tours/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(function(e) {
      // Silently fail - analytics shouldn't break the tour
      log('Analytics tracking failed', e);
    });
  }

  // Track customer-level tour progress (for Feature 25)
  function trackCustomerProgress(eventType, tourId, stepData) {
    if (!CONFIG_KEY) return;

    var locationId = getGHLLocationId();
    if (!locationId) {
      log('No GHL location ID - skipping customer progress tracking');
      return;
    }

    var payload = {
      agency_token: CONFIG_KEY,
      ghl_location_id: locationId,
      tour_id: tourId,
      event_type: eventType,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    // Add step data if provided
    if (stepData) {
      if (stepData.step_id) payload.step_id = stepData.step_id;
      if (stepData.step_order !== undefined) payload.step_order = stepData.step_order;
      if (stepData.step_title) payload.step_title = stepData.step_title;
      if (stepData.metadata) payload.metadata = stepData.metadata;
    }

    // Send to progress tracking API (fire and forget)
    fetch(API_BASE + '/api/track/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(function(e) {
      // Silently fail - progress tracking shouldn't break the tour
      log('Customer progress tracking failed', e);
    });
  }

  // Check if tour should be shown based on targeting rules
  function shouldShowTour(tour) {
    var targeting = tour.targeting || {};
    var settings = tour.settings || {};

    // Check if tour was completed
    var state = getTourState(tour.id);
    if (state && state.completed) {
      var repeatAfter = settings.repeat_after_days;
      if (!repeatAfter) {
        log('Tour already completed, not repeating:', tour.name);
        return false;
      }
      // Check if enough days have passed
      var daysSinceCompletion = (Date.now() - state.completedAt) / (1000 * 60 * 60 * 24);
      if (daysSinceCompletion < repeatAfter) {
        log('Tour completed recently, waiting ' + Math.ceil(repeatAfter - daysSinceCompletion) + ' more days:', tour.name);
        return false;
      }
    }

    // Check if tour was dismissed
    if (state && state.dismissed && !settings.can_restart) {
      log('Tour dismissed by user:', tour.name);
      return false;
    }

    // Check URL targeting
    if (targeting.url_patterns && targeting.url_patterns.length > 0) {
      var currentUrl = window.location.href;
      var currentPath = window.location.pathname;
      var matchesUrl = targeting.url_patterns.some(function(pattern) {
        // Support wildcards: * matches any sequence
        var regex = new RegExp('^' + pattern.replace(/\\*/g, '.*') + '$');
        return regex.test(currentUrl) || regex.test(currentPath);
      });
      if (!matchesUrl) {
        log('URL does not match targeting:', tour.name, targeting.url_patterns);
        return false;
      }
    }

    // Check device targeting
    if (targeting.devices && targeting.devices.length > 0) {
      var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      var deviceType = isMobile ? 'mobile' : 'desktop';
      if (!targeting.devices.includes(deviceType)) {
        log('Device does not match targeting:', tour.name, targeting.devices);
        return false;
      }
    }

    // Check element targeting (if specified)
    if (targeting.element_selector) {
      try {
        var element = document.querySelector(targeting.element_selector);
        if (!element) {
          log('Target element not found:', tour.name, targeting.element_selector);
          return false;
        }
      } catch (e) {
        log('Invalid element selector:', targeting.element_selector);
        return false;
      }
    }

    // All checks passed
    return true;
  }

  // Find the best tour to show based on priority and targeting
  function selectTourToShow(tours, themes) {
    // Sort by priority (higher first)
    var sortedTours = tours.slice().sort(function(a, b) {
      return (b.priority || 0) - (a.priority || 0);
    });

    // Find first matching tour
    for (var i = 0; i < sortedTours.length; i++) {
      var tour = sortedTours[i];
      if (shouldShowTour(tour)) {
        var theme = themes.find(function(t) { return t.id === tour.theme_id; });
        return { tour: tour, theme: theme };
      }
    }

    return null;
  }

  // Run a production tour
  function runProductionTour(tourData, themeData) {
    var tour = tourData;
    var steps = tour.steps || [];
    var settings = tour.settings || {};

    if (steps.length === 0) {
      log('Tour has no steps:', tour.name);
      return;
    }

    console.log('[AgencyToolkit] 🚀 Starting tour:', tour.name);

    // Load Driver.js if not already loaded
    if (!window.driver) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/driver.js@1.3.1/dist/driver.js.iife.js';
      script.onload = function() {
        runProductionTourWithDriver(tour, steps, settings, themeData);
      };
      script.onerror = function() {
        logError('Failed to load Driver.js for tour');
      };
      document.head.appendChild(script);

      // Also add Driver.js CSS
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/driver.js@1.3.1/dist/driver.css';
      document.head.appendChild(link);
    } else {
      runProductionTourWithDriver(tour, steps, settings, themeData);
    }
  }

  function runProductionTourWithDriver(tour, steps, settings, theme) {
    // Always inject theme styles - use provided theme or default baseline
    // This ensures tours always look good even without an explicit theme
    injectTourThemeStyles(theme || null);

    // Reference to driver instance for use in step callbacks
    // (callbacks execute after driverRef is assigned)
    var driverRef = null;

    // Convert steps to Driver.js format
    var canClose = settings.show_close !== false;
    var driverSteps = steps.map(function(step, index) {
      var stepButtons = ['next', 'previous'];
      if (canClose) stepButtons.push('close');

      var driverStep = {
        popover: {
          title: step.title || '',
          description: step.content || '',
          showButtons: stepButtons,
          showProgress: settings.show_progress !== false,
        }
      };

      // Add element targeting for tooltips/hotspots
      if (step.type !== 'modal' && step.element && step.element.selector) {
        driverStep.element = step.element.selector;
        driverStep.popover.side = mapPositionToDriverJS(step.position);
      }

      // Customize buttons
      if (step.buttons) {
        if (step.buttons.primary) {
          driverStep.popover.nextBtnText = step.buttons.primary.text || 'Next';

          // Handle button actions
          var primaryAction = step.buttons.primary.action;
          if (primaryAction === 'complete' || primaryAction === 'dismiss') {
            driverStep.popover.onNextClick = function() {
              log('Button action: ' + primaryAction + ' - closing tour');
              if (driverRef) {
                driverRef.destroy();
              }
            };
          } else if (primaryAction === 'upload') {
            driverStep.popover.onNextClick = function(element) {
              log('Button action: upload - opening upload modal');
              // Store reference to the button for genie animation
              var btn = document.querySelector('.driver-popover-next-btn');
              if (window.__AT_OPEN_UPLOAD_MODAL__) {
                window.__AT_OPEN_UPLOAD_MODAL__(btn);
              }
              // Don't advance - modal will handle it after upload
              return false;
            };
          }
        }
        if (step.buttons.secondary) {
          driverStep.popover.prevBtnText = step.buttons.secondary.text || 'Previous';
        }
      }

      // First step hides previous button
      if (index === 0) {
        var firstButtons = ['next'];
        if (canClose) firstButtons.push('close');
        driverStep.popover.showButtons = firstButtons;
      }

      // Last step - keep all buttons, Driver.js shows doneBtnText automatically
      if (index === steps.length - 1) {
        var lastButtons = ['previous', 'next'];
        if (canClose) lastButtons.push('close');
        driverStep.popover.showButtons = lastButtons;
      }

      // Allow interaction with highlighted element when enabled
      if (step.settings?.allow_interaction) {
        driverStep.disableActiveInteraction = false;
        log('Step ' + (index + 1) + ': allow_interaction enabled');
      }

      // Inject Upload Photo button via onPopoverRender (works for all step types including modal)
      if (step.settings?.show_upload_button) {
        log('Step ' + (index + 1) + ': configuring upload button via onPopoverRender');
        driverStep.popover.onPopoverRender = function(popover) {
          log('Upload button: onPopoverRender fired for step ' + (index + 1));
          var desc = popover.description;
          if (desc && !desc.parentElement.querySelector('.at-upload-photo-btn')) {
            var uploadBtn = document.createElement('button');
            uploadBtn.className = 'at-upload-photo-btn at-upload-photo-btn--block';
            uploadBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;vertical-align:middle"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>Upload Photo';
            uploadBtn.onclick = function() {
              log('Upload photo button clicked on step ' + (index + 1));
              if (window.__AT_OPEN_UPLOAD_MODAL__) {
                window.__AT_OPEN_UPLOAD_MODAL__(uploadBtn);
              }
            };
            desc.insertAdjacentElement('afterend', uploadBtn);
            log('Upload button injected via onPopoverRender');
          }
        };
      }

      return driverStep;
    });

    // Create Driver instance
    // Driver.js IIFE exposes: window.driver = { js: { driver: fn, ... } }
    // Debug: Log what's available
    log('Driver.js loaded, window.driver:', typeof window.driver, window.driver);
    if (window.driver && window.driver.js && typeof window.driver.js.driver === 'function') {
      log('Using window.driver.js.driver()');
    } else {
      logError('Driver.js not loaded correctly. window.driver:', window.driver);
      return;
    }

    // Get the last step's primary button text for the Done button
    var lastStep = steps[steps.length - 1];
    var doneBtnText = lastStep?.buttons?.primary?.text || 'Done';

    var driverFn = window.driver.js.driver;
    var prodShowClose = settings.show_close !== false;
    var prodCloseOnOutside = settings.close_on_outside_click === true;
    var prodButtons = ['next', 'previous'];
    if (prodShowClose) prodButtons.push('close');

    var driverInstance = driverFn({
      showProgress: settings.show_progress !== false,
      showButtons: prodButtons,
      animate: true,
      allowClose: prodShowClose || prodCloseOnOutside,
      overlayOpacity: 0.5,
      stagePadding: 10,
      stageRadius: 8,
      popoverClass: 'at-tour-popover at-production-tour',
      doneBtnText: doneBtnText,
      steps: driverSteps,
      onHighlightStarted: function(element, step, options) {
        var stepIndex = options.state.activeIndex;
        var stepConfig = steps[stepIndex];
        var prevStepIndex = options.state.previousIndex;

        // Track tour started on first step
        if (stepIndex === 0) {
          trackTourEvent('tour_started', tour.id, {
            total_steps: steps.length
          });
          // Customer-level progress tracking
          trackCustomerProgress('tour_start', tour.id, null);
        }

        // Track previous step as completed (if moving forward)
        if (prevStepIndex !== undefined && prevStepIndex < stepIndex) {
          var prevStepConfig = steps[prevStepIndex];
          trackCustomerProgress('step_complete', tour.id, {
            step_id: prevStepConfig.id,
            step_order: prevStepIndex,
            step_title: prevStepConfig.title
          });
        }

        // Track step viewed
        trackTourEvent('step_viewed', tour.id, {
          step_index: stepIndex,
          total_steps: steps.length
        });
        // Customer-level progress tracking
        trackCustomerProgress('step_view', tour.id, {
          step_id: stepConfig.id,
          step_order: stepIndex,
          step_title: stepConfig.title
        });

        // Save progress
        saveTourState(tour.id, {
          inProgress: true,
          currentStep: stepIndex,
          startedAt: getTourState(tour.id)?.startedAt || Date.now()
        });

        // Auto-advance: when element is clicked, advance to next step
        if (stepConfig.auto_advance && element) {
          // Remove any existing auto-advance listener
          if (window.__atAutoAdvanceListener) {
            document.removeEventListener('click', window.__atAutoAdvanceListener, true);
          }

          window.__atAutoAdvanceListener = function(e) {
            // Check if click was on the highlighted element or its children
            if (!element.contains(e.target)) {
              return;
            }

            // Debounce - prevent rapid double-clicks
            if (window.__atLastAdvance && Date.now() - window.__atLastAdvance < 500) {
              return;
            }
            window.__atLastAdvance = Date.now();

            log('Auto-advance triggered on element click');

            // Visual feedback - pulse animation
            element.classList.add('at-clicked');
            setTimeout(function() {
              element.classList.remove('at-clicked');
            }, 300);

            // Advance to next step (or complete if last step)
            setTimeout(function() {
              if (stepIndex === steps.length - 1) {
                driverRef.destroy();
              } else {
                driverRef.moveNext();
              }
            }, 100);
          };

          // Use capture phase to catch the click before other handlers
          document.addEventListener('click', window.__atAutoAdvanceListener, true);
          log('Auto-advance listener attached for step ' + (stepIndex + 1));
        }
      },
      onDestroyStarted: function() {
        // Clean up auto-advance listener
        if (window.__atAutoAdvanceListener) {
          document.removeEventListener('click', window.__atAutoAdvanceListener, true);
          window.__atAutoAdvanceListener = null;
        }
        log('Tour ended:', tour.name);
      },
      onDestroyed: function(element, step, options) {
        // Check if tour was completed (reached last step)
        var wasCompleted = options.state.activeIndex === steps.length - 1;

        if (wasCompleted) {
          saveTourState(tour.id, {
            completed: true,
            completedAt: Date.now(),
            stepCount: steps.length
          });
          trackTourEvent('tour_completed', tour.id, {
            total_steps: steps.length
          });
          // Customer-level progress tracking
          trackCustomerProgress('tour_complete', tour.id, {
            step_order: steps.length - 1
          });
          console.log('[AgencyToolkit] ✅ Tour completed:', tour.name);
        } else {
          // User dismissed the tour
          saveTourState(tour.id, {
            dismissed: true,
            dismissedAt: Date.now(),
            dismissedAtStep: options.state.activeIndex
          });
          trackTourEvent('tour_dismissed', tour.id, {
            step_index: options.state.activeIndex,
            total_steps: steps.length
          });
          // Customer-level progress tracking
          trackCustomerProgress('tour_dismiss', tour.id, {
            step_order: options.state.activeIndex
          });
          log('Tour dismissed at step', options.state.activeIndex + 1);
        }
      }
    });

    // Store reference for use in step callbacks (e.g., onNextClick for "complete" action)
    driverRef = driverInstance;
    // Also store on window for upload modal to call moveNext after photo upload
    window.__atDriverInstance = driverInstance;

    // Start the tour after page settles
    setTimeout(function() {
      driverInstance.drive();
    }, settings.delay_ms || 1000);
  }

  // Initialize production tours from config
  function initProductionTours(config) {
    var tours = config.tours || [];
    var themes = config.guidely_themes || [];

    if (tours.length === 0) {
      log('No live tours configured');
      return;
    }

    log('Checking ' + tours.length + ' live tour(s)');

    // Wait for page to be ready, then check tours
    function checkAndRunTour() {
      // Skip if builder toolbar is present (agency owner editing tours)
      if (document.getElementById('at-builder-toolbar')) {
        log('Builder toolbar detected, skipping production tour');
        return;
      }

      var selected = selectTourToShow(tours, themes);
      if (selected) {
        runProductionTour(selected.tour, selected.theme);
      } else {
        log('No tours matched targeting conditions');
      }
    }

    // Delay tour check to let page content load
    setTimeout(checkAndRunTour, 2000);
  }

  // ============================================
  // CHECKLIST WIDGET SYSTEM
  // ============================================

  var CHECKLIST_STATE_KEY_PREFIX = 'at_checklist_';
  var CHECKLIST_DISMISS_KEY_PREFIX = 'at_checklist_dismissed_';

  // Get checklist state from localStorage
  function getChecklistState(checklistId) {
    try {
      var locationId = getGHLLocationId();
      var key = CHECKLIST_STATE_KEY_PREFIX + checklistId + '_' + locationId;
      var stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      logWarn('Failed to get checklist state', e);
    }
    return { completedItems: [], status: 'not_started' };
  }

  // Save checklist state to localStorage
  function saveChecklistState(checklistId, state) {
    try {
      var locationId = getGHLLocationId();
      var key = CHECKLIST_STATE_KEY_PREFIX + checklistId + '_' + locationId;
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      logWarn('Failed to save checklist state', e);
    }
  }

  // Check if checklist was dismissed
  function isChecklistDismissed(checklistId) {
    try {
      var locationId = getGHLLocationId();
      var key = CHECKLIST_DISMISS_KEY_PREFIX + checklistId + '_' + locationId;
      return localStorage.getItem(key) === 'true';
    } catch (e) {
      return false;
    }
  }

  // Dismiss checklist
  function dismissChecklist(checklistId) {
    try {
      var locationId = getGHLLocationId();
      var key = CHECKLIST_DISMISS_KEY_PREFIX + checklistId + '_' + locationId;
      localStorage.setItem(key, 'true');
    } catch (e) {
      logWarn('Failed to dismiss checklist', e);
    }
  }

  // Track checklist progress to server
  function trackChecklistProgress(checklistId, completedItems, status) {
    var locationId = getGHLLocationId();
    if (!locationId || !CONFIG_KEY) return;

    var payload = {
      agency_token: CONFIG_KEY,
      ghl_location_id: locationId,
      checklist_id: checklistId,
      completed_items: completedItems,
      status: status
    };

    fetch(API_BASE + '/api/track/checklist-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(function(e) {
      // Silently fail
    });
  }

  // Show confetti animation
  function showConfetti() {
    // Load canvas-confetti if not already loaded
    if (!window.confetti) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
      script.onload = function() {
        if (window.confetti) {
          window.confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      };
      document.head.appendChild(script);
    } else {
      window.confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }

  // Render checklist widget
  function renderChecklistWidget(checklist, theme) {
    var state = getChecklistState(checklist.id);
    var completedItems = state.completedItems || [];
    var items = checklist.items || [];
    var widget = checklist.widget || {};
    var position = widget.position || 'bottom-right';
    var defaultState = widget.default_state || 'minimized';

    var totalCount = items.length;
    var completedCount = completedItems.length;
    var percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Theme colors
    var primaryColor = theme?.colors?.primary || '#3b82f6';
    var backgroundColor = theme?.colors?.background || '#ffffff';
    var textColor = theme?.colors?.text || '#1f2937';
    var textSecondary = theme?.colors?.text_secondary || '#6b7280';
    var borderRadius = theme?.borders?.radius || '12px';

    // Remove existing widget
    var existing = document.getElementById('at-checklist-' + checklist.id);
    if (existing) existing.remove();

    // Create widget container
    var container = document.createElement('div');
    container.id = 'at-checklist-' + checklist.id;
    container.className = 'at-checklist-widget at-checklist-' + position;
    container.setAttribute('data-checklist-id', checklist.id);

    // Apply position styles
    container.style.cssText = 'position:fixed;bottom:0;' + (position === 'bottom-right' ? 'right:20px;' : 'left:20px;') + 'z-index:10000;font-family:system-ui,-apple-system,sans-serif;';

    // Build HTML
    var itemsHtml = items.map(function(item) {
      var isCompleted = completedItems.includes(item.id);
      return '<div class="at-checklist-item' + (isCompleted ? ' completed' : '') + '" data-item-id="' + item.id + '" style="display:flex;align-items:flex-start;gap:8px;padding:8px;margin:0 -8px;border-radius:8px;cursor:pointer;transition:background 0.15s;">' +
        '<span style="flex-shrink:0;width:20px;height:20px;display:flex;align-items:center;justify-content:center;border-radius:50%;' + (isCompleted ? 'background:' + primaryColor + ';color:white;' : 'border:2px solid ' + textSecondary + ';') + '">' +
        (isCompleted ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>' : '') +
        '</span>' +
        '<div style="flex:1;min-width:0;">' +
        '<span style="display:block;font-size:14px;font-weight:500;' + (isCompleted ? 'text-decoration:line-through;opacity:0.6;' : '') + 'color:' + textColor + ';">' + escapeHtml(item.title) + '</span>' +
        (item.description ? '<span style="display:block;font-size:12px;color:' + textSecondary + ';margin-top:2px;">' + escapeHtml(item.description) + '</span>' : '') +
        '</div>' +
        '</div>';
    }).join('');

    container.innerHTML =
      '<!-- Minimized Tab -->' +
      '<div class="at-checklist-tab" style="display:' + (defaultState === 'minimized' ? 'flex' : 'none') + ';align-items:center;gap:8px;padding:8px 16px;background:' + primaryColor + ';color:white;border-radius:' + borderRadius + ' ' + borderRadius + ' 0 0;cursor:pointer;font-weight:500;font-size:14px;box-shadow:0 -2px 8px rgba(0,0,0,0.1);transition:transform 0.15s;">' +
      '<span>' + escapeHtml(widget.minimized_text || 'Get started') + '</span>' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>' +
      '</div>' +
      '<!-- Expanded Widget -->' +
      '<div class="at-checklist-expanded" style="display:' + (defaultState === 'expanded' ? 'block' : 'none') + ';width:300px;background:' + backgroundColor + ';border-radius:' + borderRadius + ';box-shadow:0 4px 24px rgba(0,0,0,0.15);overflow:hidden;">' +
      '<div class="at-checklist-header" style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:' + primaryColor + ';color:white;">' +
      '<span style="font-weight:600;font-size:14px;">' + escapeHtml(checklist.title) + '</span>' +
      '<button class="at-checklist-close" style="background:none;border:none;color:white;cursor:pointer;padding:4px;border-radius:4px;display:flex;transition:background 0.15s;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>' +
      '</div>' +
      '<div class="at-checklist-progress" style="padding:12px 16px 0;">' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><span style="font-size:12px;font-weight:600;color:' + textColor + ';">' + percent + '%</span></div>' +
      '<div style="height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden;"><div style="width:' + percent + '%;height:100%;background:' + primaryColor + ';border-radius:3px;transition:width 0.3s;"></div></div>' +
      '</div>' +
      '<div class="at-checklist-items" style="padding:12px 16px;max-height:240px;overflow-y:auto;">' + itemsHtml + '</div>' +
      '<div class="at-checklist-footer" style="padding:12px 16px;border-top:1px solid #e5e7eb;text-align:center;">' +
      '<a class="at-dismiss-link" style="display:block;font-size:12px;color:' + textSecondary + ';cursor:pointer;margin-bottom:8px;">Dismiss onboarding</a>' +
      '<button class="at-checklist-cta" style="width:100%;padding:10px 16px;background:' + primaryColor + ';color:white;border:none;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;transition:opacity 0.15s;">' + escapeHtml(widget.cta_text || 'Get Started') + '</button>' +
      '</div>' +
      '</div>';

    document.body.appendChild(container);

    // Event handlers
    var tab = container.querySelector('.at-checklist-tab');
    var expanded = container.querySelector('.at-checklist-expanded');
    var closeBtn = container.querySelector('.at-checklist-close');
    var dismissLink = container.querySelector('.at-dismiss-link');
    var ctaBtn = container.querySelector('.at-checklist-cta');
    var itemElements = container.querySelectorAll('.at-checklist-item');

    // Expand
    tab.addEventListener('click', function() {
      tab.style.display = 'none';
      expanded.style.display = 'block';
    });

    // Minimize
    closeBtn.addEventListener('click', function() {
      expanded.style.display = 'none';
      tab.style.display = 'flex';
    });

    // Hover effects
    tab.addEventListener('mouseenter', function() { tab.style.transform = 'translateY(-2px)'; });
    tab.addEventListener('mouseleave', function() { tab.style.transform = 'translateY(0)'; });
    closeBtn.addEventListener('mouseenter', function() { closeBtn.style.background = 'rgba(255,255,255,0.2)'; });
    closeBtn.addEventListener('mouseleave', function() { closeBtn.style.background = 'none'; });

    // Dismiss
    dismissLink.addEventListener('click', function() {
      dismissChecklist(checklist.id);
      container.remove();
    });

    // CTA - click first incomplete item
    ctaBtn.addEventListener('click', function() {
      var firstIncomplete = items.find(function(item) {
        return !completedItems.includes(item.id);
      });
      if (firstIncomplete) {
        handleChecklistItemClick(checklist, firstIncomplete, theme);
      }
    });

    // Item clicks
    itemElements.forEach(function(el) {
      el.addEventListener('mouseenter', function() { el.style.background = '#f3f4f6'; });
      el.addEventListener('mouseleave', function() { el.style.background = 'none'; });
      el.addEventListener('click', function() {
        var itemId = el.getAttribute('data-item-id');
        var item = items.find(function(i) { return i.id === itemId; });
        if (item) {
          handleChecklistItemClick(checklist, item, theme);
        }
      });
    });
  }

  // Handle checklist item click
  function handleChecklistItemClick(checklist, item, theme) {
    var state = getChecklistState(checklist.id);
    var completedItems = state.completedItems || [];
    var action = item.action || {};
    var trigger = item.completion_trigger || {};

    // Execute action
    if (action.type === 'tour' && action.tour_id) {
      // TODO: Launch specific tour
      log('Launching tour:', action.tour_id);
    } else if (action.type === 'url' && action.url) {
      var resolvedUrl = resolveGHLUrl(action.url);
      if (action.new_tab) {
        window.open(resolvedUrl, '_blank');
      } else {
        window.location.href = resolvedUrl;
      }
    }

    // Handle manual completion trigger (toggle on/off)
    if (trigger.type === 'manual') {
      var itemIndex = completedItems.indexOf(item.id);
      if (itemIndex === -1) {
        // Check it
        completedItems.push(item.id);
      } else {
        // Uncheck it
        completedItems.splice(itemIndex, 1);
      }
      var newStatus = completedItems.length === 0 ? 'not_started'
        : completedItems.length === checklist.items.length ? 'completed'
        : 'in_progress';
      saveChecklistState(checklist.id, { completedItems: completedItems, status: newStatus });
      trackChecklistProgress(checklist.id, completedItems, newStatus);

      // Re-render widget
      renderChecklistWidget(checklist, theme);

      // Check if all items complete
      if (newStatus === 'completed') {
        handleChecklistComplete(checklist);
      }
    }
  }

  // Handle checklist completion
  function handleChecklistComplete(checklist) {
    var widget = checklist.widget || {};
    var onComplete = checklist.on_complete || {};

    // Show confetti if enabled
    if (widget.show_confetti) {
      showConfetti();
    }

    // Handle completion action
    if (onComplete.type === 'celebration') {
      log('Checklist completed! Showing celebration');
    } else if (onComplete.type === 'redirect' && onComplete.url) {
      setTimeout(function() {
        window.location.href = onComplete.url;
      }, 1500);
    }

    // Hide widget if configured
    if (widget.hide_when_complete) {
      setTimeout(function() {
        var widgetEl = document.getElementById('at-checklist-' + checklist.id);
        if (widgetEl) widgetEl.remove();
      }, 2000);
    }
  }

  // HTML escape helper
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Check if checklist should be shown based on targeting
  function shouldShowChecklist(checklist) {
    var targeting = checklist.targeting || {};

    // Check if dismissed
    if (isChecklistDismissed(checklist.id)) {
      log('Checklist dismissed:', checklist.name);
      return false;
    }

    // Check URL targeting
    if (targeting.url_mode === 'specific' && targeting.url_patterns?.length > 0) {
      var currentUrl = window.location.href;
      var matched = targeting.url_patterns.some(function(pattern) {
        return matchUrlPattern(currentUrl, pattern);
      });
      if (!matched) {
        log('URL does not match checklist targeting:', checklist.name);
        return false;
      }
    }

    return true;
  }

  // Initialize production checklists
  function initProductionChecklists(config) {
    var checklists = config.checklists || [];
    var themes = config.guidely_themes || [];

    if (checklists.length === 0) {
      log('No live checklists configured');
      return;
    }

    log('Checking ' + checklists.length + ' live checklist(s)');

    // Wait for page to be ready
    function renderChecklists() {
      checklists.forEach(function(checklist) {
        if (shouldShowChecklist(checklist)) {
          var theme = themes.find(function(t) { return t.id === checklist.theme_id; });
          renderChecklistWidget(checklist, theme);
          log('Rendered checklist widget:', checklist.name);
        }
      });
    }

    // Delay to let page load
    setTimeout(renderChecklists, 2500);
  }

  // ============================================
  // BANNERS - In-app Announcements
  // ============================================

  var BANNER_STYLE_COLORS = {
    info: { bg: '#3B82F6', text: '#ffffff' },
    success: { bg: '#10B981', text: '#ffffff' },
    warning: { bg: '#F59E0B', text: '#1F2937' },
    error: { bg: '#EF4444', text: '#ffffff' }
  };

  // Parse time string like "9:00 AM" to hours and minutes
  function parseTimeString(timeStr) {
    if (!timeStr) return null;
    var match = timeStr.match(/(\\d+):(\\d+)\\s*(AM|PM)/i);
    if (!match) return null;
    var hours = parseInt(match[1]);
    var minutes = parseInt(match[2]);
    var period = match[3].toUpperCase();

    if (period === 'AM' && hours === 12) hours = 0;
    else if (period === 'PM' && hours !== 12) hours += 12;

    return { hours: hours, minutes: minutes };
  }

  // Get current time in a specific timezone
  function getNowInTimezone(timezone) {
    if (!timezone || timezone === 'user') {
      return new Date();
    }
    try {
      // Get current time formatted in the target timezone
      var options = {
        timeZone: timezone,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
      };
      var formatter = new Intl.DateTimeFormat('en-US', options);
      var parts = formatter.formatToParts(new Date());
      var values = {};
      parts.forEach(function(p) { values[p.type] = p.value; });

      // Build a date object representing "now" in the target timezone
      // This creates a Date where getHours() etc return the timezone's local values
      return new Date(
        parseInt(values.year),
        parseInt(values.month) - 1,
        parseInt(values.day),
        parseInt(values.hour),
        parseInt(values.minute),
        parseInt(values.second)
      );
    } catch (e) {
      log('Timezone error, falling back to local:', e);
      return new Date();
    }
  }

  function shouldShowBanner(banner) {
    // Check schedule
    if (banner.schedule && banner.schedule.mode === 'range') {
      // Get current time in the configured timezone
      var timezone = banner.schedule.timezone;
      var now = getNowInTimezone(timezone);

      // Build start datetime
      if (banner.schedule.start_date) {
        var start = new Date(banner.schedule.start_date);
        // Apply start time if set
        if (banner.schedule.start_time) {
          var startTime = parseTimeString(banner.schedule.start_time);
          if (startTime) {
            start.setHours(startTime.hours, startTime.minutes, 0, 0);
          }
        }
        if (now < start) return false;
      }

      // Build end datetime
      if (banner.schedule.end_date) {
        var end = new Date(banner.schedule.end_date);
        // Apply end time if set
        if (banner.schedule.end_time) {
          var endTime = parseTimeString(banner.schedule.end_time);
          if (endTime) {
            end.setHours(endTime.hours, endTime.minutes, 59, 999);
          }
        } else {
          // Default to end of day if no time specified
          end.setHours(23, 59, 59, 999);
        }
        if (now > end) return false;
      }
    }

    // Check URL targeting
    if (banner.targeting && banner.targeting.url_mode !== 'all') {
      var currentUrl = window.location.href;
      var patterns = banner.targeting.url_patterns || [];

      if (patterns.length > 0) {
        var matchesPattern = patterns.some(function(pattern) {
          // Convert wildcard pattern to regex
          var regex = new RegExp(pattern.replace(/\\*/g, '.*'), 'i');
          return regex.test(currentUrl);
        });

        if (banner.targeting.url_mode === 'specific' && !matchesPattern) return false;
        if (banner.targeting.url_mode === 'except' && matchesPattern) return false;
      }
    }

    // Check dismissal
    if (banner.dismissible) {
      var storageKey = 'at_banner_dismissed_' + banner.id;
      if (banner.dismiss_duration === 'permanent') {
        var dismissed = localStorage.getItem(storageKey);
        if (dismissed) {
          // Check if 30 days have passed
          var dismissedTime = parseInt(dismissed, 10);
          var thirtyDays = 30 * 24 * 60 * 60 * 1000;
          if (Date.now() - dismissedTime < thirtyDays) return false;
        }
      } else {
        if (sessionStorage.getItem(storageKey)) return false;
      }
    }

    return true;
  }

  function getBannerColors(banner, themes) {
    if (banner.style_preset === 'custom' && banner.theme_id) {
      var theme = themes.find(function(t) { return t.id === banner.theme_id; });
      if (theme && theme.colors) {
        return {
          bg: theme.colors.primary || '#3B82F6',
          text: theme.colors.text || '#ffffff'
        };
      }
    }
    return BANNER_STYLE_COLORS[banner.style_preset] || BANNER_STYLE_COLORS.info;
  }

  function renderBanner(banner, themes) {
    var colors = getBannerColors(banner, themes);

    // Replace dynamic variables in content
    var content = banner.content
      .replace(/\\{\\{days\\}\\}/g, '3') // TODO: Get actual trial days
      .replace(/\\{\\{customer_name\\}\\}/g, 'Customer')
      .replace(/\\{\\{agency_name\\}\\}/g, 'Agency');

    var el = document.createElement('div');
    el.id = 'at-banner-' + banner.id;
    el.className = 'at-banner at-banner-' + banner.position + ' at-banner-' + banner.display_mode;

    // Base styles
    el.style.cssText = [
      'display: flex',
      'align-items: center',
      'justify-content: center',
      'padding: 12px 16px',
      'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      'font-size: 14px',
      'z-index: 99999',
      'position: fixed',
      'left: 0',
      'right: 0',
      'background-color: ' + colors.bg,
      'color: ' + colors.text
    ].join(';');

    // Position styles
    if (banner.position === 'top') {
      el.style.top = banner.display_mode === 'float' ? '10px' : '0';
    } else {
      el.style.bottom = banner.display_mode === 'float' ? '10px' : '0';
    }

    // Float mode styles
    if (banner.display_mode === 'float') {
      el.style.left = '10px';
      el.style.right = '10px';
      el.style.borderRadius = '8px';
      el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    }

    // Build inner HTML
    var innerHtml = '<div style="display:flex;align-items:center;gap:12px;flex:1;justify-content:center;">';
    innerHtml += '<span style="flex:1;text-align:center;">' + escapeHtml(content) + '</span>';

    // Action button
    if (banner.action && banner.action.enabled) {
      innerHtml += '<button class="at-banner-action" style="' + [
        'background: rgba(255,255,255,0.2)',
        'border: 1px solid rgba(255,255,255,0.3)',
        'border-radius: 4px',
        'padding: 6px 12px',
        'color: inherit',
        'cursor: pointer',
        'font-weight: 500',
        'white-space: nowrap'
      ].join(';') + '">' + escapeHtml(banner.action.label || 'Learn More') + '</button>';
    }

    innerHtml += '</div>';

    // Dismiss button
    if (banner.dismissible) {
      innerHtml += '<button class="at-banner-dismiss" style="' + [
        'background: none',
        'border: none',
        'color: inherit',
        'cursor: pointer',
        'padding: 4px 8px',
        'margin-left: 8px',
        'opacity: 0.7',
        'font-size: 16px'
      ].join(';') + '" aria-label="Dismiss">×</button>';
    }

    el.innerHTML = innerHtml;

    // Insert into DOM
    if (banner.position === 'top') {
      document.body.prepend(el);
      // Add padding to body for inline mode
      if (banner.display_mode === 'inline') {
        document.body.style.paddingTop = el.offsetHeight + 'px';
      }
    } else {
      document.body.appendChild(el);
      if (banner.display_mode === 'inline') {
        document.body.style.paddingBottom = el.offsetHeight + 'px';
      }
    }

    // Track view
    trackBannerEvent(banner.id, 'view');

    // Handle action click
    if (banner.action && banner.action.enabled) {
      var actionEl = banner.action.whole_banner_clickable ? el : el.querySelector('.at-banner-action');
      if (actionEl) {
        actionEl.addEventListener('click', function(e) {
          e.stopPropagation();
          trackBannerEvent(banner.id, 'click');
          handleBannerAction(banner.action);
        });
        if (banner.action.whole_banner_clickable) {
          el.style.cursor = 'pointer';
        }
      }
    }

    // Handle dismiss
    if (banner.dismissible) {
      var dismissEl = el.querySelector('.at-banner-dismiss');
      if (dismissEl) {
        dismissEl.addEventListener('click', function(e) {
          e.stopPropagation();
          var storageKey = 'at_banner_dismissed_' + banner.id;
          if (banner.dismiss_duration === 'permanent') {
            localStorage.setItem(storageKey, Date.now().toString());
          } else {
            sessionStorage.setItem(storageKey, 'true');
          }
          trackBannerEvent(banner.id, 'dismiss');
          el.remove();
          // Reset padding
          if (banner.display_mode === 'inline') {
            if (banner.position === 'top') {
              document.body.style.paddingTop = '';
            } else {
              document.body.style.paddingBottom = '';
            }
          }
        });
      }
    }
  }

  function handleBannerAction(action) {
    if (!action) return;

    switch (action.type) {
      case 'url':
        if (action.url) {
          var bannerUrl = resolveGHLUrl(action.url);
          if (action.new_tab) {
            window.open(bannerUrl, '_blank');
          } else {
            window.location.href = bannerUrl;
          }
        }
        break;
      case 'tour':
        if (action.tour_id && window.__AGENCY_TOOLKIT__) {
          window.__AGENCY_TOOLKIT__.startTour(action.tour_id);
        }
        break;
      case 'checklist':
        if (action.checklist_id && window.__AGENCY_TOOLKIT__) {
          window.__AGENCY_TOOLKIT__.openChecklist(action.checklist_id);
        }
        break;
      case 'dismiss':
        // Handled by dismiss logic
        break;
    }
  }

  function trackBannerEvent(bannerId, eventType) {
    fetch(API_BASE + '/api/track/banner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ banner_id: bannerId, event_type: eventType })
    }).catch(function(err) {
      log('Failed to track banner event:', err);
    });
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize production banners
  function initProductionBanners(config) {
    var banners = config.banners || [];
    var themes = config.guidely_themes || [];

    if (banners.length === 0) {
      log('No active banners configured');
      return;
    }

    log('Checking ' + banners.length + ' active banner(s)');

    // Filter to banners that should show
    var bannersToShow = banners.filter(shouldShowBanner);

    if (bannersToShow.length === 0) {
      log('No banners match current conditions');
      return;
    }

    // Sort by priority
    var priorityOrder = { high: 0, normal: 1, low: 2 };
    bannersToShow.sort(function(a, b) {
      return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
    });

    // Check for exclusive banner
    var exclusiveBanner = bannersToShow.find(function(b) { return b.exclusive; });
    if (exclusiveBanner) {
      bannersToShow = [exclusiveBanner];
    }

    // Render banners after page load
    function renderBanners() {
      bannersToShow.forEach(function(banner) {
        renderBanner(banner, themes);
        log('Rendered banner:', banner.name);
      });
    }

    // Delay to let page load
    setTimeout(renderBanners, 1500);
  }

  // ============================================
  // SMART TIPS - Contextual Tooltips
  // ============================================

  var activeSmartTips = [];
  var smartTipContainer = null;

  function initSmartTips(config) {
    var tips = config.smart_tips || [];
    var themes = config.guidely_themes || [];

    if (tips.length === 0) {
      log('No active smart tips configured');
      return;
    }

    log('Initializing ' + tips.length + ' smart tip(s)');

    // Create style element for smart tips
    injectSmartTipStyles();

    // Filter tips that match current URL
    var matchingTips = tips.filter(function(tip) {
      return shouldShowSmartTip(tip);
    });

    if (matchingTips.length === 0) {
      log('No smart tips match current page');
      return;
    }

    log('Setting up ' + matchingTips.length + ' matching smart tip(s)');

    // Set up event listeners for each tip after page load
    function setupTips() {
      matchingTips.forEach(function(tip) {
        setupSmartTip(tip, themes);
      });
    }

    // Delay to let page elements load
    setTimeout(setupTips, 2000);
  }

  function shouldShowSmartTip(tip) {
    var targeting = tip.targeting || {};
    var urlTargeting = targeting.url_targeting || { mode: 'all' };

    if (urlTargeting.mode === 'all') {
      return true;
    }

    if (urlTargeting.mode === 'specific' && urlTargeting.patterns) {
      var currentPath = window.location.pathname;
      return urlTargeting.patterns.some(function(pattern) {
        var patternValue = pattern.value || '';
        if (!patternValue) return false;
        // Simple wildcard matching
        var regex = new RegExp('^' + patternValue.replace(/\\*/g, '.*') + '$');
        return regex.test(currentPath);
      });
    }

    return true;
  }

  function setupSmartTip(tip, themes) {
    var selector = tip.element && tip.element.selector;
    if (!selector) {
      log('Smart tip has no selector:', tip.name);
      return;
    }

    var element = document.querySelector(selector);
    if (!element) {
      log('Smart tip element not found:', selector);
      return;
    }

    log('Smart tip bound to element:', { name: tip.name, selector: selector });

    var theme = themes.find(function(t) { return t.id === tip.theme_id; }) || null;
    var tooltip = null;
    var beacon = null;
    var isVisible = false;

    function showTooltip() {
      if (isVisible) return;
      isVisible = true;
      tooltip = createSmartTipTooltip(tip, element, theme, beacon);
      document.body.appendChild(tooltip);
      log('Smart tip shown:', tip.name);
    }

    function hideTooltip() {
      if (!isVisible) return;
      isVisible = false;
      if (tooltip && tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
      }
      tooltip = null;
    }

    // Create beacon if enabled
    var beaconConfig = tip.beacon || {};
    if (beaconConfig.enabled) {
      beacon = createSmartTipBeacon(tip, element, theme, function() {
        if (isVisible) {
          hideTooltip();
        } else {
          showTooltip();
        }
      });
      document.body.appendChild(beacon);
      log('Smart tip beacon created:', tip.name);
    }

    // Determine trigger target (element or beacon)
    // 'automatic' means use beacon if enabled, else element
    var isBeaconTarget = beaconConfig.enabled && (beaconConfig.target === 'beacon' || beaconConfig.target === 'automatic');
    var triggerTarget = isBeaconTarget && beacon ? beacon : element;

    // Set up trigger handlers based on trigger type
    if (tip.trigger === 'hover') {
      if (isBeaconTarget && beacon) {
        // Only beacon triggers tooltip
        beacon.addEventListener('mouseenter', showTooltip);
        beacon.addEventListener('mouseleave', hideTooltip);
      } else {
        // Element triggers tooltip
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
        // Also trigger on beacon hover if beacon exists
        if (beacon) {
          beacon.addEventListener('mouseenter', showTooltip);
          beacon.addEventListener('mouseleave', hideTooltip);
        }
      }
    } else if (tip.trigger === 'click') {
      if (isBeaconTarget && beacon) {
        // Beacon click already set up above, element click does nothing
      } else {
        // Element triggers tooltip
        element.addEventListener('click', function(e) {
          e.stopPropagation();
          if (isVisible) {
            hideTooltip();
          } else {
            showTooltip();
          }
        });
      }
      // Click outside to dismiss (but not on beacon)
      document.addEventListener('click', function(e) {
        if (isVisible && tooltip && !tooltip.contains(e.target) && !element.contains(e.target) && (!beacon || !beacon.contains(e.target))) {
          hideTooltip();
        }
      });
    } else if (tip.trigger === 'focus') {
      element.addEventListener('focus', showTooltip);
      element.addEventListener('blur', hideTooltip);
    } else if (tip.trigger === 'delay') {
      // Time delay trigger - show tooltip after specified seconds
      var delaySeconds = tip.delay_seconds || 3;
      setTimeout(function() {
        showTooltip();
        // Auto-dismiss after 10 seconds for delay triggers
        setTimeout(function() {
          hideTooltip();
        }, 10000);
      }, delaySeconds * 1000);
      log('Smart tip delay scheduled:', { name: tip.name, delay: delaySeconds + 's' });
    }

    // Track for cleanup
    activeSmartTips.push({
      tip: tip,
      element: element,
      beacon: beacon,
      showTooltip: showTooltip,
      hideTooltip: hideTooltip
    });
  }

  function createSmartTipBeacon(tip, targetElement, theme, onClick) {
    var beaconConfig = tip.beacon || {};
    var beaconEl = document.createElement('div');
    beaconEl.className = 'at-smart-tip-beacon';

    var primaryColor = (theme && theme.colors && theme.colors.primary) || '#3b82f6';
    var style = beaconConfig.style || 'pulse';
    var position = beaconConfig.position || 'right';
    var offsetX = beaconConfig.offset_x || 0;
    var offsetY = beaconConfig.offset_y || 0;
    var beaconSize = beaconConfig.size || 20; // Configurable size (12-40px)
    var fontSize = Math.max(10, beaconSize * 0.6);

    // Beacon content based on style
    var content = '';
    if (style === 'pulse') {
      content = '';
    } else if (style === 'question') {
      content = '?';
    } else if (style === 'info') {
      content = '!';
    }

    beaconEl.innerHTML = content;
    beaconEl.style.cssText = [
      'position: fixed',
      'z-index: 999998',
      'width: ' + beaconSize + 'px',
      'height: ' + beaconSize + 'px',
      'border-radius: 50%',
      'background: ' + primaryColor,
      'color: white',
      'font-size: ' + fontSize + 'px',
      'font-weight: bold',
      'display: flex',
      'align-items: center',
      'justify-content: center',
      'cursor: pointer',
      'box-shadow: 0 2px 8px rgba(0,0,0,0.2)',
      style === 'pulse' ? 'animation: at-beacon-pulse 2s infinite' : ''
    ].join(';');

    // Position the beacon relative to element
    function positionBeacon() {
      var rect = targetElement.getBoundingClientRect();
      var x, y;

      switch (position) {
        case 'top':
          x = rect.left + rect.width / 2 - beaconSize / 2;
          y = rect.top - beaconSize - 4;
          break;
        case 'bottom':
          x = rect.left + rect.width / 2 - beaconSize / 2;
          y = rect.bottom + 4;
          break;
        case 'left':
          x = rect.left - beaconSize - 4;
          y = rect.top + rect.height / 2 - beaconSize / 2;
          break;
        case 'right':
        default:
          x = rect.right + 4;
          y = rect.top + rect.height / 2 - beaconSize / 2;
          break;
      }

      // Apply offsets
      x += offsetX;
      y -= offsetY; // Negative because positive should move up

      beaconEl.style.left = x + 'px';
      beaconEl.style.top = y + 'px';
    }

    positionBeacon();

    // Reposition on scroll/resize
    window.addEventListener('scroll', positionBeacon, true);
    window.addEventListener('resize', positionBeacon);

    // Click handler
    beaconEl.addEventListener('click', function(e) {
      e.stopPropagation();
      if (onClick) onClick();
    });

    return beaconEl;
  }

  function createSmartTipTooltip(tip, targetElement, theme, beaconElement) {
    var tooltip = document.createElement('div');
    tooltip.className = 'at-smart-tip';

    // Get theme colors or defaults
    var bgColor = (theme && theme.colors && theme.colors.background) || '#1a1a1a';
    var textColor = (theme && theme.colors && theme.colors.text) || '#ffffff';
    var primaryColor = (theme && theme.colors && theme.colors.primary) || '#3b82f6';
    var borderRadius = (theme && theme.borders && theme.borders.radius) || '8px';

    // Get width based on size setting
    var sizeWidths = { small: '200px', medium: '280px', large: '360px' };
    var tooltipWidth = sizeWidths[tip.size] || '280px';

    tooltip.style.cssText = [
      'position: fixed',
      'z-index: 999999',
      'width: ' + tooltipWidth,
      'max-width: 90vw',
      'padding: 12px 16px',
      'font-size: 14px',
      'line-height: 1.5',
      'background: ' + bgColor,
      'color: ' + textColor,
      'border-radius: ' + borderRadius,
      'box-shadow: 0 4px 20px rgba(0,0,0,0.25)',
      'animation: at-smart-tip-fade-in 0.15s ease-out'
    ].join(';');

    // Parse content for links
    var content = tip.content || '';
    var parsedContent = content.replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, function(match, text, url) {
      return '<a href="' + url + '" target="_blank" rel="noopener noreferrer" style="color: ' + primaryColor + '; text-decoration: underline;">' + text + '</a>';
    });
    tooltip.innerHTML = parsedContent;

    // Determine positioning target (beacon or element based on target setting)
    // 'automatic' means use beacon if enabled, else element
    var beaconConfig = tip.beacon || {};
    var isBeaconTarget = beaconConfig.enabled && (beaconConfig.target === 'beacon' || beaconConfig.target === 'automatic') && beaconElement;
    var positionTarget = isBeaconTarget ? beaconElement : targetElement;

    // Position the tooltip
    positionSmartTip(tooltip, positionTarget, tip.position);

    // Create arrow
    var arrow = document.createElement('div');
    arrow.className = 'at-smart-tip-arrow';
    arrow.style.cssText = [
      'position: absolute',
      'width: 10px',
      'height: 10px',
      'background: ' + bgColor,
      'transform: rotate(45deg)'
    ].join(';');
    tooltip.appendChild(arrow);

    // Position arrow based on tooltip position
    positionSmartTipArrow(arrow, tip.position, tooltip);

    return tooltip;
  }

  function positionSmartTip(tooltip, element, preferredPosition) {
    var rect = element.getBoundingClientRect();
    var position = preferredPosition || 'auto';

    // Calculate best position if auto
    if (position === 'auto') {
      var spaceBelow = window.innerHeight - rect.bottom;
      var spaceAbove = rect.top;
      var spaceRight = window.innerWidth - rect.right;
      var spaceLeft = rect.left;

      if (spaceBelow >= 100) position = 'bottom';
      else if (spaceAbove >= 100) position = 'top';
      else if (spaceRight >= 200) position = 'right';
      else if (spaceLeft >= 200) position = 'left';
      else position = 'bottom';
    }

    // Position based on calculated position
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    switch (position) {
      case 'top':
        tooltip.style.left = (rect.left + rect.width / 2 + scrollLeft) + 'px';
        tooltip.style.transform = 'translateX(-50%)';
        // Set after DOM attachment
        setTimeout(function() {
          tooltip.style.top = (rect.top + scrollTop - tooltip.offsetHeight - 12) + 'px';
        }, 0);
        break;
      case 'right':
        tooltip.style.left = (rect.right + scrollLeft + 12) + 'px';
        tooltip.style.top = (rect.top + rect.height / 2 + scrollTop) + 'px';
        tooltip.style.transform = 'translateY(-50%)';
        break;
      case 'bottom':
        tooltip.style.left = (rect.left + rect.width / 2 + scrollLeft) + 'px';
        tooltip.style.top = (rect.bottom + scrollTop + 12) + 'px';
        tooltip.style.transform = 'translateX(-50%)';
        break;
      case 'left':
        tooltip.style.top = (rect.top + rect.height / 2 + scrollTop) + 'px';
        tooltip.style.transform = 'translateY(-50%)';
        setTimeout(function() {
          tooltip.style.left = (rect.left + scrollLeft - tooltip.offsetWidth - 12) + 'px';
        }, 0);
        break;
    }

    tooltip.dataset.position = position;
  }

  function positionSmartTipArrow(arrow, position, tooltip) {
    var pos = tooltip.dataset.position || position || 'bottom';

    switch (pos) {
      case 'top':
        arrow.style.bottom = '-5px';
        arrow.style.left = '50%';
        arrow.style.marginLeft = '-5px';
        break;
      case 'right':
        arrow.style.left = '-5px';
        arrow.style.top = '50%';
        arrow.style.marginTop = '-5px';
        break;
      case 'bottom':
        arrow.style.top = '-5px';
        arrow.style.left = '50%';
        arrow.style.marginLeft = '-5px';
        break;
      case 'left':
        arrow.style.right = '-5px';
        arrow.style.top = '50%';
        arrow.style.marginTop = '-5px';
        break;
    }
  }

  function injectSmartTipStyles() {
    if (document.getElementById('at-smart-tip-styles')) return;

    var style = document.createElement('style');
    style.id = 'at-smart-tip-styles';
    style.textContent = \`
      @keyframes at-smart-tip-fade-in {
        from { opacity: 0; transform: translateX(-50%) translateY(4px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
      @keyframes at-beacon-pulse {
        0% { transform: scale(1); box-shadow: 0 0 0 0 currentColor; }
        50% { transform: scale(1.1); box-shadow: 0 0 0 8px transparent; }
        100% { transform: scale(1); box-shadow: 0 0 0 0 transparent; }
      }
      .at-smart-tip a {
        color: inherit;
      }
      .at-smart-tip a:hover {
        opacity: 0.8;
      }
      .at-smart-tip-beacon {
        transition: transform 0.15s ease;
      }
      .at-smart-tip-beacon:hover {
        transform: scale(1.2);
      }
    \`;
    document.head.appendChild(style);
  }

  // ============================================
  // VALIDATION MODE - Test Element Selectors
  // ============================================

  var VALIDATE_SESSION_KEY_PREFIX = 'at_validate_';

  function initValidationMode() {
    // Check hash fragment for validation mode
    var hashParams = new URLSearchParams(window.location.hash.substring(1));
    var isValidateMode = hashParams.get('at_validate_mode') === 'true';
    var sessionId = hashParams.get('at_validate_session');

    if (!isValidateMode || !sessionId) {
      return false;
    }

    // Try to get validation data from sessionStorage
    var validateDataStr = null;
    try {
      validateDataStr = sessionStorage.getItem(VALIDATE_SESSION_KEY_PREFIX + sessionId);
      // Clear after reading
      sessionStorage.removeItem(VALIDATE_SESSION_KEY_PREFIX + sessionId);
    } catch (e) {
      logError('Failed to read validation data from sessionStorage', e);
    }

    if (!validateDataStr) {
      logWarn('Validation session not found:', sessionId);
      return false;
    }

    var validateData;
    try {
      validateData = JSON.parse(validateDataStr);
    } catch (e) {
      logError('Failed to parse validation data', e);
      return false;
    }

    // Verify timestamp (expire after 5 minutes)
    if (validateData.timestamp && Date.now() - validateData.timestamp > 5 * 60 * 1000) {
      logWarn('Validation session expired');
      return false;
    }

    console.log('[AgencyToolkit] 🧪 VALIDATION MODE ACTIVATED', {
      selectorCount: validateData.selectors?.length || 0
    });

    // Run validation after page is ready
    function runValidation() {
      var selectors = validateData.selectors || [];
      var results = [];

      selectors.forEach(function(item) {
        var found = false;
        try {
          var element = document.querySelector(item.selector);
          found = !!element;
        } catch (e) {
          logWarn('Invalid selector:', item.selector, e.message);
        }

        results.push({
          stepId: item.stepId,
          selector: item.selector,
          found: found,
          url: window.location.href
        });

        // Post each result back to opener
        if (window.opener) {
          window.opener.postMessage({
            type: 'at_element_validation_result',
            payload: {
              stepId: item.stepId,
              selector: item.selector,
              found: found,
              url: window.location.href
            }
          }, '*');
        }

        console.log('[AgencyToolkit] Element check:', {
          selector: item.selector.substring(0, 50),
          found: found
        });
      });

      // Send completion message
      if (window.opener) {
        window.opener.postMessage({
          type: 'at_element_validation_complete',
          payload: {
            results: results,
            url: window.location.href,
            timestamp: Date.now()
          }
        }, '*');
      }

      // Show validation result overlay
      showValidationOverlay(results);
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runValidation);
    } else {
      // Add small delay to let dynamic content load
      setTimeout(runValidation, 1000);
    }

    return true;
  }

  function showValidationOverlay(results) {
    var foundCount = results.filter(function(r) { return r.found; }).length;
    var notFoundCount = results.filter(function(r) { return !r.found; }).length;

    var overlay = document.createElement('div');
    overlay.id = 'at-validation-overlay';
    overlay.innerHTML = \`
      <div class="at-validation-card">
        <div class="at-validation-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="at-validation-icon">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
          <span>Validation Complete</span>
        </div>
        <div class="at-validation-results">
          <div class="at-validation-stat at-stat-found">
            <span class="at-stat-number">\${foundCount}</span>
            <span class="at-stat-label">Found</span>
          </div>
          <div class="at-validation-stat at-stat-not-found">
            <span class="at-stat-number">\${notFoundCount}</span>
            <span class="at-stat-label">Not Found</span>
          </div>
        </div>
        <p class="at-validation-note">Results sent to Agency Toolkit</p>
        <button class="at-validation-close" onclick="window.close()">Close Window</button>
      </div>
    \`;

    var style = document.createElement('style');
    style.textContent = \`
      #at-validation-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        font-family: system-ui, -apple-system, sans-serif;
      }
      .at-validation-card {
        background: white;
        border-radius: 16px;
        padding: 32px;
        text-align: center;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
        min-width: 300px;
      }
      .at-validation-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 24px;
      }
      .at-validation-icon {
        width: 24px;
        height: 24px;
        color: #22c55e;
      }
      .at-validation-results {
        display: flex;
        gap: 24px;
        justify-content: center;
        margin-bottom: 20px;
      }
      .at-validation-stat {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .at-stat-number {
        font-size: 36px;
        font-weight: 700;
        line-height: 1;
      }
      .at-stat-label {
        font-size: 14px;
        color: #6b7280;
        margin-top: 4px;
      }
      .at-stat-found .at-stat-number {
        color: #22c55e;
      }
      .at-stat-not-found .at-stat-number {
        color: #ef4444;
      }
      .at-validation-note {
        font-size: 13px;
        color: #9ca3af;
        margin-bottom: 20px;
      }
      .at-validation-close {
        background: #1f2937;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 24px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
      }
      .at-validation-close:hover {
        background: #374151;
      }
    \`;

    document.head.appendChild(style);
    document.body.appendChild(overlay);
  }

  // Expose initBuilderMode for late postMessage arrivals
  window.__AT_INIT_BUILDER_MODE__ = initBuilderMode;

  // ============================================
  // SIDEBAR SCAN MODE
  // ============================================

  function initSidebarScan() {
    // Check hash fragment for scan mode
    var hashParams = new URLSearchParams(window.location.hash.substring(1));
    var scanMode = hashParams.get('at_scan_mode');
    var sessionId = hashParams.get('at_session');

    // Fallback: sessionStorage
    if (!scanMode || !sessionId) {
      try {
        var stored = sessionStorage.getItem(SCAN_SESSION_KEY);
        if (stored) {
          var data = JSON.parse(stored);
          if (data.timestamp && Date.now() - data.timestamp < 5 * 60 * 1000) {
            scanMode = data.scanMode;
            sessionId = data.sessionId;
          }
        }
      } catch (e) {}
    }

    if (scanMode !== 'sidebar' || !sessionId) {
      return false;
    }

    // Clear stored session
    try { sessionStorage.removeItem(SCAN_SESSION_KEY); } catch (e) {}

    console.log('[AgencyToolkit] SIDEBAR SCAN MODE ACTIVATED', { sessionId: sessionId });

    // Show scanning indicator
    var indicator = document.createElement('div');
    indicator.id = 'at-scan-indicator';
    indicator.innerHTML = '<div style="display:flex;align-items:center;gap:8px;padding:12px 20px;background:#1e40af;color:white;border-radius:8px;font-family:system-ui,sans-serif;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.3);"><div style="width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:at-spin 0.8s linear infinite;"></div>Scanning sidebar...</div>';
    indicator.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:999999;';
    var scanStyle = document.createElement('style');
    scanStyle.textContent = '@keyframes at-spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(scanStyle);
    document.body.appendChild(indicator);

    // Wait for sidebar to be available
    var scanAttempts = 0;
    var maxScanAttempts = 30; // 15 seconds
    var scanInterval = setInterval(function() {
      scanAttempts++;
      var sidebar = document.getElementById('sidebar-v2');

      if (sidebar) {
        clearInterval(scanInterval);
        performSidebarScan(sidebar, sessionId);
      } else if (scanAttempts >= maxScanAttempts) {
        clearInterval(scanInterval);
        sendScanResults(sessionId, [], 'Sidebar not found. Make sure you are on a GHL page.');
        setTimeout(function() { window.close(); }, 3000);
      }
    }, 500);

    return true;
  }

  function performSidebarScan(sidebar, sessionId) {
    var items = [];

    // Query all clickable items in the sidebar
    var sidebarElements = sidebar.querySelectorAll('[id^="sb_"], a[href], [role="menuitem"]');

    sidebarElements.forEach(function(el) {
      var id = el.id || '';
      var label = (el.textContent || '').trim();
      var href = el.getAttribute('href') || el.querySelector('a')?.getAttribute('href') || '';

      if (!label) return; // Skip empty items

      // Determine if this is a built-in item (starts with sb_)
      var isBuiltIn = id.startsWith('sb_');

      // Generate a unique ID for custom items
      var itemId = id || ('custom_' + hashString(label + '_' + href));

      // Build a reliable CSS selector
      var selector = '';
      if (id) {
        selector = '#' + CSS.escape(id);
      } else {
        // Build selector from parent context
        selector = buildSelectorForElement(el, sidebar);
      }

      items.push({
        id: itemId,
        selector: selector,
        label: label,
        href: href || undefined,
        isBuiltIn: isBuiltIn
      });
    });

    // Also scan for custom links that might not have sb_ IDs
    // GHL custom menu links are often in specific containers
    var customLinkContainers = sidebar.querySelectorAll('[class*="custom-menu"], [class*="custom-link"], [data-custom-link]');
    customLinkContainers.forEach(function(el) {
      var label = (el.textContent || '').trim();
      var href = el.getAttribute('href') || el.querySelector('a')?.getAttribute('href') || '';
      if (!label) return;

      var itemId = 'custom_' + hashString(label + '_' + href);
      // Skip if already collected
      if (items.some(function(i) { return i.id === itemId; })) return;

      items.push({
        id: itemId,
        selector: buildSelectorForElement(el, sidebar),
        label: label,
        href: href || undefined,
        isBuiltIn: false
      });
    });

    // Deduplicate items by label+href (GHL renders expanded + collapsed sidebar variants)
    var seen = {};
    items = items.filter(function(item) {
      var key = item.label + '||' + (item.href || '');
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });

    console.log('[AgencyToolkit] Sidebar scan complete:', items.length, 'items found');

    // Update indicator
    var indicator = document.getElementById('at-scan-indicator');
    if (indicator) {
      var customCount = items.filter(function(i) { return !i.isBuiltIn; }).length;
      indicator.innerHTML = '<div style="display:flex;align-items:center;gap:8px;padding:12px 20px;background:#059669;color:white;border-radius:8px;font-family:system-ui,sans-serif;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.3);">Found ' + items.length + ' items (' + customCount + ' custom). Sending results...</div>';
    }

    sendScanResults(sessionId, items);

    // Auto-close after sending
    setTimeout(function() { window.close(); }, 2000);
  }

  function buildSelectorForElement(el, container) {
    // Try to build a stable selector
    if (el.id) return '#' + CSS.escape(el.id);

    // Try data attributes
    var dataAttrs = Array.from(el.attributes).filter(function(a) { return a.name.startsWith('data-'); });
    if (dataAttrs.length > 0) {
      return '[' + dataAttrs[0].name + '="' + CSS.escape(dataAttrs[0].value) + '"]';
    }

    // Use nth-child as fallback
    var parent = el.parentElement;
    if (parent) {
      var siblings = Array.from(parent.children);
      var index = siblings.indexOf(el) + 1;
      var parentSelector = parent.id ? '#' + CSS.escape(parent.id) : '';
      if (parentSelector) {
        return parentSelector + ' > :nth-child(' + index + ')';
      }
    }

    // Last resort: use text content as identifier
    var text = (el.textContent || '').trim().substring(0, 30);
    return '#sidebar-v2 [title="' + CSS.escape(text) + '"]';
  }

  function hashString(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  function sendScanResults(sessionId, items, error) {
    var data = {
      sessionId: sessionId,
      items: items,
      error: error || undefined
    };

    // Primary: postMessage to opener
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage({
          type: 'at_sidebar_scan_result',
          payload: data
        }, '*');
        console.log('[AgencyToolkit] Scan results sent via postMessage');
      } catch (e) {
        console.error('[AgencyToolkit] postMessage failed:', e);
      }
    }

    // Fallback: BroadcastChannel
    try {
      var channel = new BroadcastChannel('at_sidebar_scan');
      channel.postMessage(data);
      channel.close();
    } catch (e) {}

    // Fallback: localStorage
    try {
      localStorage.setItem('at_sidebar_scan_result', JSON.stringify(data));
    } catch (e) {}
  }

  // Expose for late postMessage arrivals
  window.__AT_INIT_SIDEBAR_SCAN__ = initSidebarScan;

  // ============================================
  // PHOTO UPLOAD MODAL
  // ============================================

  var uploadState = {
    photos: [],  // { file: File, preview: string, name: string }
    maxPhotos: 5,
    businessName: '',
    isUploading: false,
    triggerElement: null,
    preventDragHandler: null  // Store reference for cleanup
  };

  function getLocationId() {
    // Extract location ID from GHL URL pattern: /v2/location/XXXXX/
    var match = window.location.pathname.match(/\\/v2\\/location\\/([^\\/]+)/);
    return match ? match[1] : null;
  }

  function openUploadModal(triggerEl) {
    uploadState.triggerElement = triggerEl || null;
    uploadState.photos = [];
    uploadState.businessName = '';
    uploadState.isUploading = false;

    var locationId = getLocationId();
    if (!locationId) {
      logError('Could not detect location ID from URL');
      alert('Unable to determine your location. Please try again.');
      return;
    }

    // Hide Driver.js overlay and popover while modal is open
    var driverOverlay = document.querySelector('.driver-overlay');
    var driverPopover = document.querySelector('.driver-popover');
    if (driverOverlay) driverOverlay.style.display = 'none';
    if (driverPopover) driverPopover.style.display = 'none';
    log('Hid driver.js elements for upload modal');

    // Inject modal HTML
    var overlay = document.createElement('div');
    overlay.id = 'at-upload-overlay';
    overlay.className = 'at-upload-overlay';
    overlay.innerHTML = \`
      <div id="at-upload-modal" class="at-upload-modal">
        <div class="at-upload-header">
          <h2>Upload Your Photos</h2>
          <button id="at-upload-close" class="at-upload-close">&times;</button>
        </div>
        <div class="at-upload-body">
          <div class="at-upload-field">
            <label for="at-business-name">Business Name *</label>
            <input type="text" id="at-business-name" placeholder="e.g., Big Mike's Plumbing" autofocus />
          </div>
          <div id="at-dropzone" class="at-dropzone">
            <div class="at-dropzone-content">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <p>Drop photos here or <span class="at-dropzone-link">browse</span></p>
              <p class="at-dropzone-hint">JPEG, PNG, or WebP up to 5MB each</p>
            </div>
            <input type="file" id="at-file-input" accept="image/jpeg,image/png,image/webp" multiple hidden />
          </div>
          <div id="at-photo-list" class="at-photo-list"></div>
          <button id="at-add-more" class="at-add-more" style="display: none;">+ Add Another Photo</button>
          <div class="at-suggestions">
            <span class="at-suggestions-label">Suggestions:</span>
            <button class="at-suggestion" data-name="Team Photo">Team Photo</button>
            <button class="at-suggestion" data-name="Crew with Vans">Crew with Vans</button>
            <button class="at-suggestion" data-name="Office Front">Office Front</button>
          </div>
          <div id="at-upload-error" class="at-upload-error" style="display: none;"></div>
        </div>
        <div class="at-upload-footer">
          <button id="at-upload-submit" class="at-upload-submit" disabled>Upload & Finish</button>
        </div>
        <div id="at-upload-success" class="at-upload-success" style="display: none;">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <h3>You're all set!</h3>
          <p>Your photos have been uploaded.</p>
        </div>
      </div>
    \`;

    // Inject styles
    var style = document.createElement('style');
    style.id = 'at-upload-styles';
    style.textContent = \`
      .at-upload-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2147483647;
        opacity: 0;
        transition: opacity 0.2s ease;
        pointer-events: auto !important;
      }
      .at-upload-overlay.at-visible {
        opacity: 1;
      }
      .at-upload-modal {
        background: white;
        border-radius: 12px;
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        transform: scale(0.9);
        transition: transform 0.2s ease;
        position: relative;
        pointer-events: auto !important;
      }
      .at-upload-modal * {
        pointer-events: auto !important;
      }
      .at-upload-modal input[type="file"] {
        pointer-events: none !important;
      }
      .at-upload-overlay.at-visible .at-upload-modal {
        transform: scale(1);
      }
      .at-upload-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid #e5e7eb;
      }
      .at-upload-header h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #111827;
      }
      .at-upload-close {
        background: none;
        border: none;
        font-size: 24px;
        color: #6b7280;
        cursor: pointer;
        padding: 0;
        line-height: 1;
      }
      .at-upload-close:hover {
        color: #111827;
      }
      .at-upload-body {
        padding: 20px;
        overflow-y: auto;
        flex: 1;
      }
      .at-upload-field {
        margin-bottom: 16px;
      }
      .at-upload-field label {
        display: block;
        font-size: 14px;
        font-weight: 500;
        color: #374151;
        margin-bottom: 6px;
      }
      .at-upload-field input {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 14px;
        box-sizing: border-box;
        background: white !important;
        color: #111827 !important;
        cursor: text !important;
        -webkit-appearance: none !important;
        appearance: none !important;
        -webkit-user-select: text !important;
        user-select: text !important;
      }
      .at-upload-field input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      .at-dropzone {
        border: 2px dashed #d1d5db;
        border-radius: 8px;
        padding: 40px 20px;
        text-align: center;
        cursor: pointer !important;
        position: relative;
        transition: border-color 0.2s, background 0.2s;
        margin-bottom: 16px;
      }
      .at-dropzone:hover {
        border-color: #9ca3af;
      }
      .at-dropzone.at-dragover {
        border-color: #3b82f6;
        background: #eff6ff;
      }
      .at-dropzone-content svg {
        color: #9ca3af;
        margin-bottom: 12px;
      }
      .at-dropzone-content p {
        margin: 0 0 4px 0;
        color: #6b7280;
        font-size: 14px;
      }
      .at-dropzone-link {
        color: #3b82f6;
        cursor: pointer;
      }
      .at-dropzone-link:hover {
        text-decoration: underline;
      }
      .at-dropzone-hint {
        font-size: 12px !important;
        color: #9ca3af !important;
      }
      .at-photo-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 16px;
      }
      .at-photo-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px;
        background: #f9fafb;
        border-radius: 8px;
      }
      .at-photo-thumb {
        width: 48px;
        height: 48px;
        object-fit: cover;
        border-radius: 4px;
        flex-shrink: 0;
      }
      .at-photo-name {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        font-size: 14px;
        min-width: 0;
      }
      .at-photo-name:focus {
        outline: none;
        border-color: #3b82f6;
      }
      .at-photo-remove {
        background: none;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        font-size: 20px;
        padding: 4px;
        line-height: 1;
        flex-shrink: 0;
      }
      .at-photo-remove:hover {
        color: #ef4444;
      }
      .at-add-more {
        width: 100%;
        padding: 10px;
        background: #f3f4f6;
        border: 1px dashed #d1d5db;
        border-radius: 8px;
        color: #6b7280;
        font-size: 14px;
        cursor: pointer;
        margin-bottom: 16px;
      }
      .at-add-more:hover {
        background: #e5e7eb;
        color: #374151;
      }
      .at-suggestions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
      }
      .at-suggestions-label {
        font-size: 12px;
        color: #9ca3af;
      }
      .at-suggestion {
        padding: 4px 10px;
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
        border-radius: 16px;
        font-size: 12px;
        color: #6b7280;
        cursor: pointer;
      }
      .at-suggestion:hover {
        background: #e5e7eb;
        color: #374151;
      }
      .at-upload-error {
        padding: 12px;
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 8px;
        color: #dc2626;
        font-size: 14px;
        margin-bottom: 16px;
      }
      .at-upload-footer {
        padding: 16px 20px;
        border-top: 1px solid #e5e7eb;
      }
      .at-upload-submit {
        width: 100%;
        padding: 12px;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
      }
      .at-upload-submit:hover:not(:disabled) {
        background: #2563eb;
      }
      .at-upload-submit:disabled {
        background: #9ca3af;
        cursor: not-allowed;
      }
      .at-upload-success {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        text-align: center;
        padding: 40px;
      }
      .at-upload-success svg {
        color: #22c55e;
        margin-bottom: 16px;
      }
      .at-upload-success h3 {
        margin: 0 0 8px 0;
        font-size: 24px;
        color: #111827;
      }
      .at-upload-success p {
        margin: 0;
        color: #6b7280;
      }
      .at-upload-modal.at-genie {
        animation: at-genie-out 0.5s ease-in forwards;
      }
      @keyframes at-genie-out {
        0% {
          transform: scale(1) translate(0, 0);
          opacity: 1;
        }
        100% {
          transform: scale(0.1) translate(var(--at-genie-x, 0), var(--at-genie-y, 200px));
          opacity: 0;
        }
      }
    \`;

    document.head.appendChild(style);
    document.body.appendChild(overlay);

    // Trigger show animation
    requestAnimationFrame(function() {
      overlay.classList.add('at-visible');
    });

    // Focus business name input
    setTimeout(function() {
      var input = document.getElementById('at-business-name');
      if (input) input.focus();
    }, 100);

    // Setup event listeners
    setupUploadEventListeners(locationId);
  }

  function setupUploadEventListeners(locationId) {
    var overlay = document.getElementById('at-upload-overlay');
    var modal = document.getElementById('at-upload-modal');
    var closeBtn = document.getElementById('at-upload-close');
    var dropzone = document.getElementById('at-dropzone');
    var fileInput = document.getElementById('at-file-input');
    var businessNameInput = document.getElementById('at-business-name');
    var addMoreBtn = document.getElementById('at-add-more');
    var submitBtn = document.getElementById('at-upload-submit');
    var suggestions = document.querySelectorAll('.at-suggestion');

    // Close modal and restore Driver.js
    function closeModal() {
      overlay.classList.remove('at-visible');

      // Restore Driver.js elements
      var driverOverlay = document.querySelector('.driver-overlay');
      var driverPopover = document.querySelector('.driver-popover');
      if (driverOverlay) driverOverlay.style.display = '';
      if (driverPopover) driverPopover.style.display = '';

      // Remove document-level drag prevention
      document.removeEventListener('dragover', preventDragDefault, true);
      document.removeEventListener('drop', preventDragDefault, true);

      setTimeout(function() {
        overlay.remove();
        var style = document.getElementById('at-upload-styles');
        if (style) style.remove();
      }, 200);
    }

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeModal();
    });

    // Document-level drag prevention - only preventDefault, not stopPropagation
    // stopPropagation would kill the event before dropzone handlers fire
    function preventDragDefault(e) {
      if (document.getElementById('at-upload-overlay')) {
        e.preventDefault();
        // Don't stopPropagation - let the event reach the dropzone
      }
    }
    // Store reference for cleanup in startGenieAnimation
    uploadState.preventDragHandler = preventDragDefault;
    document.addEventListener('dragover', preventDragDefault, true);
    document.addEventListener('drop', preventDragDefault, true);

    // Prevent defaults for drag events on dropzone
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function(event) {
      dropzone.addEventListener(event, function(e) {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    // Highlight on drag
    ['dragenter', 'dragover'].forEach(function(event) {
      dropzone.addEventListener(event, function() {
        dropzone.classList.add('at-dragover');
      });
    });

    ['dragleave', 'drop'].forEach(function(event) {
      dropzone.addEventListener(event, function() {
        dropzone.classList.remove('at-dragover');
      });
    });

    // Handle drop
    dropzone.addEventListener('drop', function(e) {
      handleFiles(e.dataTransfer.files);
    });

    // Handle click to browse
    dropzone.addEventListener('click', function() {
      fileInput.click();
    });

    fileInput.addEventListener('change', function() {
      handleFiles(this.files);
      this.value = ''; // Reset for re-selecting same file
    });

    // Add more button
    addMoreBtn.addEventListener('click', function() {
      fileInput.click();
    });

    // Business name input
    businessNameInput.addEventListener('input', function() {
      uploadState.businessName = this.value;
      updatePhotoNames();
      updateSubmitButton();
    });

    // Debug: Log clicks on modal to verify events are received
    modal.addEventListener('click', function(e) {
      log('Modal click received on:', e.target.tagName, e.target.className);
    }, true);

    // Explicitly handle focus for business name input
    businessNameInput.addEventListener('click', function(e) {
      log('Business name input clicked');
      e.stopPropagation();
      this.focus();
    });

    // Suggestions
    suggestions.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var name = this.getAttribute('data-name');
        // Apply to first photo without custom name
        var photoList = document.querySelectorAll('.at-photo-name');
        for (var i = 0; i < photoList.length; i++) {
          var input = photoList[i];
          var defaultName = uploadState.businessName
            ? uploadState.businessName + ' - Photo ' + (i + 1)
            : 'Photo ' + (i + 1);
          if (input.value === defaultName || input.value === '') {
            input.value = name;
            uploadState.photos[i].name = name;
            break;
          }
        }
      });
    });

    // Submit
    submitBtn.addEventListener('click', function() {
      submitPhotos(locationId);
    });
  }

  function handleFiles(files) {
    var remaining = uploadState.maxPhotos - uploadState.photos.length;
    var filesToAdd = Array.from(files).slice(0, remaining);
    var errorEl = document.getElementById('at-upload-error');

    filesToAdd.forEach(function(file) {
      // Validate type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        showUploadError('Only JPEG, PNG, and WebP files are allowed');
        return;
      }

      // Validate size
      if (file.size > 5 * 1024 * 1024) {
        showUploadError('File must be under 5MB');
        return;
      }

      // Resize before storing
      resizeImage(file, 2000).then(function(resizedFile) {
        // Create preview
        var reader = new FileReader();
        reader.onload = function(e) {
          var photoIndex = uploadState.photos.length + 1;
          var defaultName = uploadState.businessName
            ? uploadState.businessName + ' - Photo ' + photoIndex
            : 'Photo ' + photoIndex;

          uploadState.photos.push({
            file: resizedFile,
            preview: e.target.result,
            name: defaultName
          });

          renderPhotoList();
          updateSubmitButton();
          hideUploadError();
        };
        reader.readAsDataURL(resizedFile);
      });
    });
  }

  function resizeImage(file, maxDimension) {
    return new Promise(function(resolve) {
      var img = new Image();
      img.onload = function() {
        // Check if resize needed
        if (img.width <= maxDimension && img.height <= maxDimension) {
          resolve(file);
          return;
        }

        // Calculate new dimensions
        var ratio = Math.min(maxDimension / img.width, maxDimension / img.height);
        var newWidth = Math.round(img.width * ratio);
        var newHeight = Math.round(img.height * ratio);

        // Draw to canvas
        var canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Convert to blob
        canvas.toBlob(function(blob) {
          resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.9);
      };
      img.src = URL.createObjectURL(file);
    });
  }

  function renderPhotoList() {
    var dropzone = document.getElementById('at-dropzone');
    var photoList = document.getElementById('at-photo-list');
    var addMoreBtn = document.getElementById('at-add-more');

    if (uploadState.photos.length === 0) {
      dropzone.style.display = 'block';
      photoList.innerHTML = '';
      addMoreBtn.style.display = 'none';
      return;
    }

    dropzone.style.display = 'none';
    addMoreBtn.style.display = uploadState.photos.length < uploadState.maxPhotos ? 'block' : 'none';

    photoList.innerHTML = uploadState.photos.map(function(photo, index) {
      return \`
        <div class="at-photo-item" data-index="\${index}">
          <img src="\${photo.preview}" class="at-photo-thumb" />
          <input type="text" class="at-photo-name" value="\${photo.name}" placeholder="Photo name" />
          <button class="at-photo-remove" data-index="\${index}">&times;</button>
        </div>
      \`;
    }).join('');

    // Add event listeners to name inputs
    photoList.querySelectorAll('.at-photo-name').forEach(function(input, index) {
      input.addEventListener('input', function() {
        uploadState.photos[index].name = this.value;
      });
    });

    // Add event listeners to remove buttons
    photoList.querySelectorAll('.at-photo-remove').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var index = parseInt(this.getAttribute('data-index'));
        uploadState.photos.splice(index, 1);
        renderPhotoList();
        updateSubmitButton();
      });
    });
  }

  function updatePhotoNames() {
    uploadState.photos.forEach(function(photo, index) {
      // Only update if name follows the default pattern
      var prevDefault = 'Photo ' + (index + 1);
      var prevDefaultWithBiz = '.*? - Photo ' + (index + 1);
      if (photo.name === prevDefault || new RegExp('^' + prevDefaultWithBiz + '$').test(photo.name)) {
        photo.name = uploadState.businessName
          ? uploadState.businessName + ' - Photo ' + (index + 1)
          : 'Photo ' + (index + 1);
      }
    });
    renderPhotoList();
  }

  function updateSubmitButton() {
    var submitBtn = document.getElementById('at-upload-submit');
    var businessName = uploadState.businessName.trim();
    var hasPhotos = uploadState.photos.length > 0;
    submitBtn.disabled = !businessName || !hasPhotos || uploadState.isUploading;

    if (uploadState.isUploading) {
      submitBtn.textContent = 'Uploading...';
    } else {
      submitBtn.textContent = 'Upload & Finish';
    }
  }

  function showUploadError(message) {
    var errorEl = document.getElementById('at-upload-error');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }

  function hideUploadError() {
    var errorEl = document.getElementById('at-upload-error');
    errorEl.style.display = 'none';
  }

  function submitPhotos(locationId) {
    if (uploadState.isUploading) return;
    uploadState.isUploading = true;
    updateSubmitButton();

    var formData = new FormData();
    formData.append('key', CONFIG_KEY);
    formData.append('location_id', locationId);
    formData.append('business_name', uploadState.businessName.trim());
    formData.append('photo_names', JSON.stringify(uploadState.photos.map(function(p) { return p.name; })));

    uploadState.photos.forEach(function(photo) {
      formData.append('photos', photo.file);
    });

    fetch(API_BASE + '/api/photos/upload', {
      method: 'POST',
      body: formData
    })
    .then(function(response) {
      return response.json().then(function(data) {
        if (!response.ok) {
          throw new Error(data.error || 'Upload failed');
        }
        return data;
      });
    })
    .then(function(data) {
      log('Upload successful:', data);
      showUploadSuccess();
    })
    .catch(function(error) {
      logError('Upload failed:', error);
      showUploadError(error.message || 'Upload failed. Please try again.');
      uploadState.isUploading = false;
      updateSubmitButton();
    });
  }

  function showUploadSuccess() {
    var successEl = document.getElementById('at-upload-success');
    successEl.style.display = 'flex';

    // Start genie animation after 1.5 seconds
    setTimeout(function() {
      startGenieAnimation();
    }, 1500);
  }

  function startGenieAnimation() {
    var modal = document.getElementById('at-upload-modal');
    var overlay = document.getElementById('at-upload-overlay');

    // Calculate genie target
    var targetX = 0;
    var targetY = 200; // Default: animate downward

    if (uploadState.triggerElement) {
      try {
        var rect = uploadState.triggerElement.getBoundingClientRect();
        var modalRect = modal.getBoundingClientRect();
        targetX = (rect.left + rect.width / 2) - (modalRect.left + modalRect.width / 2);
        targetY = (rect.top + rect.height / 2) - (modalRect.top + modalRect.height / 2);
      } catch (e) {
        // Use defaults
      }
    }

    // Set CSS variables
    modal.style.setProperty('--at-genie-x', targetX + 'px');
    modal.style.setProperty('--at-genie-y', targetY + 'px');

    // Start animation
    modal.classList.add('at-genie');
    overlay.style.opacity = '0';

    // Restore Driver.js elements immediately so page is interactive
    var driverOverlay = document.querySelector('.driver-overlay');
    var driverPopover = document.querySelector('.driver-popover');
    if (driverOverlay) driverOverlay.style.display = '';
    if (driverPopover) driverPopover.style.display = '';

    // Remove document-level drag prevention using stored reference
    if (uploadState.preventDragHandler) {
      document.removeEventListener('dragover', uploadState.preventDragHandler, true);
      document.removeEventListener('drop', uploadState.preventDragHandler, true);
      uploadState.preventDragHandler = null;
    }

    // Cleanup and advance tour
    setTimeout(function() {
      overlay.remove();
      var style = document.getElementById('at-upload-styles');
      if (style) style.remove();

      // Advance tour if active
      if (window.__atDriverInstance) {
        window.__atDriverInstance.moveNext();
      }
    }, 500);
  }

  // Expose for tour integration
  window.__AT_OPEN_UPLOAD_MODAL__ = openUploadModal;

  // Main initialization
  function init() {
    // Mark init as started
    window.__AT_INIT_STARTED__ = true;

    // Check for preview mode first (takes priority)
    if (initPreviewMode()) {
      logInfo('Preview mode active - showing tour preview');
      window.__AT_INIT_COMPLETE__ = true;
      return; // Don't apply customizations in preview mode
    }

    // Check for validation mode (element selector testing)
    if (initValidationMode()) {
      logInfo('Validation mode active - testing selectors');
      window.__AT_INIT_COMPLETE__ = true;
      return; // Don't apply customizations in validation mode
    }

    // Check for sidebar scan mode
    if (initSidebarScan()) {
      logInfo('Sidebar scan mode active - scanning and closing');
      window.__AT_INIT_COMPLETE__ = true;
      return; // Don't apply customizations in scan mode
    }

    // Check for builder mode (bar shows, but customizations still apply)
    var isBuilderMode = initBuilderMode();
    if (isBuilderMode) {
      logInfo('Builder mode active - customizations will still apply');
      // Don't return - let customizations apply so renamed elements are visible
    }

    if (!CONFIG_KEY) {
      logError('No API key provided. Check your embed snippet.');
      return;
    }

    log('Fetching config...');

    // Fetch configuration
    fetch(API_BASE + '/api/config?key=' + encodeURIComponent(CONFIG_KEY))
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Config fetch failed: ' + response.status);
        }
        return response.json();
      })
      .then(function(config) {
        log('Config loaded', config);

        // Check if we should skip
        if (shouldSkipCustomizations(config)) {
          logInfo('Skipping customizations (whitelisted location)');
          return;
        }

        // Store config globally for debugging
        window.__AGENCY_TOOLKIT_CONFIG__ = config;

        // Track what we're applying for summary
        var applied = [];

        // Apply customizations when DOM is ready
        function applyCustomizations() {
          try {
            if (config.menu) {
              applyMenuConfig(config.menu);
              var hiddenCount = (config.menu.hidden_items || []).length;
              var renamedCount = Object.keys(config.menu.renamed_items || {}).length;
              if (hiddenCount || renamedCount) {
                applied.push('menu (' + hiddenCount + ' hidden, ' + renamedCount + ' renamed)');
              }
            }
            if (config.colors) {
              applyColorConfig(config.colors);
              applied.push('colors');
            }
            // Loading animation removed from embed — now managed via CSS export only
            // The applyLoadingConfig function is preserved in codebase for potential future use
            // Login page customization is delivered via CSS export only
            // (Custom JS doesn't run on the GHL login page)

            // Summary log (always shown)
            if (applied.length > 0) {
              logInfo('✅ Customizations applied: ' + applied.join(', '));
            } else {
              logInfo('No customizations configured');
            }
          } catch (e) {
            logError('Error applying customizations', e);
          }
        }

        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', applyCustomizations);
        } else {
          applyCustomizations();
        }

        // Re-apply on dynamic content changes (for SPAs)
        var reapplyCount = 0;
        var observer = new MutationObserver(function(mutations) {
          var shouldReapply = mutations.some(function(m) {
            return m.addedNodes.length > 0;
          });
          if (shouldReapply) {
            applyMenuConfig(config.menu);
            reapplyCount++;
            // Only log first few re-applications to avoid spam
            if (reapplyCount <= 3) {
              log('Re-applied menu config (SPA navigation #' + reapplyCount + ')');
            }
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true
        });

        // Initialize production tours (only if not in special modes)
        initProductionTours(config);

        // Initialize production checklists
        initProductionChecklists(config);

        // Initialize production banners
        initProductionBanners(config);

        // Initialize smart tips (contextual tooltips)
        initSmartTips(config);

        // Mark init as complete
        window.__AT_INIT_COMPLETE__ = true;
      })
      .catch(function(error) {
        logError('Failed to load config', error);
        window.__AT_INIT_COMPLETE__ = true;
        // Fail silently - don't break GHL
      });
  }

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
`.trim();

  return script;
}
