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

  // RELIABLE BACKUP: Listen for builder params via postMessage from opener
  // This is more reliable than hash params because it doesn't depend on URL timing
  var __builderParamsReceived = false;
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
        console.log('[AgencyToolkit] 📩 Builder params received via postMessage');

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
              console.log('[AgencyToolkit] ✅ Builder params saved via postMessage');

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
    });
  })();

  // Check if we should skip customizations
  function shouldSkipCustomizations(config) {
    // Check whitelisted locations
    var whitelisted = config.whitelisted_locations || [];
    if (whitelisted.length > 0) {
      var currentLocation = window.location.hostname;
      var isWhitelisted = whitelisted.some(function(loc) {
        return currentLocation.indexOf(loc) !== -1;
      });
      if (isWhitelisted) {
        log('Location is whitelisted, skipping customizations');
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
      css += '/* Sidebar Text - menu items only */\\n';
      css += '[id^="sb_"],\\n';
      css += '[id^="sb_"] span,\\n';
      css += '#sidebar-v2 .hl_nav-settings a { color: ' + colorConfig.sidebar_text + ' !important; }\\n';
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

  // Apply login page customizations (legacy simple config)
  // Updated 2026-01-18: Enhanced GHL login page selectors
  function applyLoginConfig(loginConfig) {
    if (!loginConfig) return;

    // Only apply on login pages
    var isLoginPage = window.location.pathname.includes('/login') ||
                      window.location.pathname.includes('/signin') ||
                      window.location.pathname.includes('/oauth') ||
                      document.querySelector('[class*="login"]') ||
                      document.querySelector('[class*="sign-in"]');

    if (!isLoginPage) return;
    log('Applying login config', loginConfig);

    // Remove existing login styles
    var existingStyle = document.getElementById('agency-toolkit-login');
    if (existingStyle) existingStyle.remove();

    var style = document.createElement('style');
    style.id = 'agency-toolkit-login';
    var css = '/* Agency Toolkit Login Customizations */\\n';

    // Background selectors for GHL login pages
    var bgSelectors = [
      'body',
      '.login-container',
      '.login-page',
      '.sign-in-page',
      '.hl-login-page',
      '[class*="login-wrapper"]',
      '[class*="auth-wrapper"]'
    ].join(',\\n');

    if (loginConfig.background_color) {
      css += bgSelectors + ' { background-color: ' + loginConfig.background_color + ' !important; }\\n';
    }
    if (loginConfig.background_image_url) {
      css += bgSelectors + ' {\\n';
      css += '  background-image: url(' + loginConfig.background_image_url + ') !important;\\n';
      css += '  background-size: cover !important;\\n';
      css += '  background-position: center !important;\\n';
      css += '  background-repeat: no-repeat !important;\\n';
      css += '}\\n';
    }

    // Button selectors for GHL login pages
    var buttonSelectors = [
      '.login-btn',
      '.signin-btn',
      '.sign-in-btn',
      '[type="submit"]',
      'button[type="submit"]',
      '.btn-primary',
      '.hr-button--primary-type',
      '.n-button--primary-type',
      '.hl-login-btn'
    ].join(',\\n');

    if (loginConfig.button_color) {
      css += buttonSelectors + ' {\\n';
      css += '  background-color: ' + loginConfig.button_color + ' !important;\\n';
      css += '  border-color: ' + loginConfig.button_color + ' !important;\\n';
      css += '}\\n';
    }
    if (loginConfig.button_text_color) {
      css += buttonSelectors + ' { color: ' + loginConfig.button_text_color + ' !important; }\\n';
    }

    if (css !== '/* Agency Toolkit Login Customizations */\\n') {
      style.textContent = css;
      document.head.appendChild(style);
      log('Login CSS injected');
    }

    // Replace logo if specified
    if (loginConfig.logo_url) {
      var logos = document.querySelectorAll([
        '.logo img',
        '[class*="logo"] img',
        'header img',
        '.brand-logo img',
        '.company-logo img',
        '.hl-logo img'
      ].join(', '));
      logos.forEach(function(logo) {
        logo.src = loginConfig.logo_url;
      });
    }
  }

  // Apply advanced login design (canvas-based)
  // Updated 2026-01-18: Comprehensive GHL login page selectors + all form_style properties
  function applyLoginDesign(loginDesign) {
    if (!loginDesign) return;

    // Only apply on login pages
    var isLoginPage = window.location.pathname.includes('/login') ||
                      window.location.pathname.includes('/signin') ||
                      window.location.pathname.includes('/oauth') ||
                      document.querySelector('[class*="login"]') ||
                      document.querySelector('[class*="sign-in"]');

    if (!isLoginPage) return;
    log('Applying login design', loginDesign);

    // Remove existing styles
    var existing = document.getElementById('agency-toolkit-login-design');
    if (existing) existing.remove();

    var style = document.createElement('style');
    style.id = 'agency-toolkit-login-design';
    var css = '/* Agency Toolkit Advanced Login Design */\\n';

    // Background selectors
    var bgSelectors = [
      'body',
      '.login-page',
      '.login-container',
      '.sign-in-page',
      '.hl-login-page',
      '[class*="login-wrapper"]',
      '[class*="auth-wrapper"]'
    ].join(',\\n');

    // Apply background
    var canvas = loginDesign.canvas;
    if (canvas && canvas.background) {
      var bg = canvas.background;
      css += bgSelectors + ' {\\n';

      if (bg.type === 'solid' && bg.color) {
        css += '  background-color: ' + bg.color + ' !important;\\n';
      } else if (bg.type === 'gradient' && bg.gradient) {
        css += '  background: linear-gradient(' + bg.gradient.angle + 'deg, ' + bg.gradient.from + ', ' + bg.gradient.to + ') !important;\\n';
      } else if (bg.type === 'image' && bg.image_url) {
        css += '  background-image: url(' + bg.image_url + ') !important;\\n';
        css += '  background-size: cover !important;\\n';
        css += '  background-position: center !important;\\n';
        css += '  background-repeat: no-repeat !important;\\n';
        if (bg.image_blur) {
          css += '  backdrop-filter: blur(' + bg.image_blur + 'px) !important;\\n';
        }
      }
      css += '  min-height: 100vh !important;\\n';
      css += '}\\n';

      // Image overlay
      if (bg.type === 'image' && bg.image_overlay) {
        css += 'body::before, .login-page::before, .sign-in-page::before {\\n';
        css += '  content: "";\\n';
        css += '  position: fixed;\\n';
        css += '  inset: 0;\\n';
        css += '  background-color: ' + bg.image_overlay + ';\\n';
        css += '  pointer-events: none;\\n';
        css += '  z-index: 0;\\n';
        css += '}\\n';
      }
    }

    // Apply form styling
    var formStyle = loginDesign.form_style;
    if (formStyle) {
      // Form container selectors
      var formSelectors = [
        '.login-form',
        '.signin-form',
        '.sign-in-form',
        '.auth-form',
        '[class*="login-card"]',
        '[class*="auth-card"]',
        '.hl-login-form',
        '.card.login',
        'form[class*="login"]'
      ].join(',\\n');

      // Form container background and border
      css += formSelectors + ' {\\n';
      if (formStyle.form_bg) {
        css += '  background-color: ' + formStyle.form_bg + ' !important;\\n';
        css += '  backdrop-filter: blur(8px) !important;\\n';
      }
      if (formStyle.form_border) {
        css += '  border-color: ' + formStyle.form_border + ' !important;\\n';
        css += '  border-style: solid !important;\\n';
      }
      if (formStyle.form_border_width) {
        css += '  border-width: ' + formStyle.form_border_width + 'px !important;\\n';
      }
      if (formStyle.form_border_radius) {
        css += '  border-radius: ' + formStyle.form_border_radius + 'px !important;\\n';
      }
      css += '}\\n';

      // Form heading styles
      if (formStyle.form_heading_color) {
        css += '/* Form Headings */\\n';
        var headingSelectors = [
          '.login-form h1',
          '.login-form h2',
          '.login-form h3',
          '.signin-form h1',
          '.signin-form h2',
          '.auth-form h1',
          '[class*="login-card"] h1',
          '[class*="login-card"] h2',
          '.login-title',
          '.sign-in-title',
          '.auth-title'
        ].join(',\\n');
        css += headingSelectors + ' { color: ' + formStyle.form_heading_color + ' !important; }\\n';
      }

      // Label styles
      if (formStyle.label_color) {
        css += '/* Form Labels */\\n';
        var labelSelectors = [
          '.login-form label',
          '.signin-form label',
          '.auth-form label',
          '[class*="login-card"] label',
          'form[class*="login"] label',
          '.form-label',
          '.input-label'
        ].join(',\\n');
        css += labelSelectors + ' { color: ' + formStyle.label_color + ' !important; }\\n';
      }

      // Button selectors
      var buttonSelectors = [
        '.login-btn',
        '.signin-btn',
        '.sign-in-btn',
        '[type="submit"]',
        'button[type="submit"]',
        '.submit-btn',
        '.btn-primary',
        '.hr-button--primary-type',
        '.n-button--primary-type',
        '.hl-login-btn'
      ].join(',\\n');

      // Button styles
      if (formStyle.button_bg || formStyle.button_text) {
        css += '/* Login Buttons */\\n';
        css += buttonSelectors + ' {\\n';
        if (formStyle.button_bg) {
          css += '  background-color: ' + formStyle.button_bg + ' !important;\\n';
          css += '  border-color: ' + formStyle.button_bg + ' !important;\\n';
        }
        if (formStyle.button_text) {
          css += '  color: ' + formStyle.button_text + ' !important;\\n';
        }
        css += '}\\n';
      }

      // Input selectors
      var inputSelectors = [
        'input[type="email"]',
        'input[type="password"]',
        'input[type="text"]',
        '.login-input',
        '.signin-input',
        '.hl-text-input',
        '.hr-input__input-el',
        '.n-input__input-el',
        '.form-control'
      ].join(',\\n');

      // Input styles
      css += '/* Login Inputs */\\n';
      css += inputSelectors + ' {\\n';
      if (formStyle.input_bg) {
        css += '  background-color: ' + formStyle.input_bg + ' !important;\\n';
      }
      if (formStyle.input_border) {
        css += '  border-color: ' + formStyle.input_border + ' !important;\\n';
      }
      if (formStyle.input_text) {
        css += '  color: ' + formStyle.input_text + ' !important;\\n';
      }
      css += '}\\n';

      // Input placeholder text
      if (formStyle.input_text) {
        css += inputSelectors.split(',\\n').map(function(sel) {
          return sel + '::placeholder';
        }).join(',\\n') + ' { color: ' + formStyle.input_text + '; opacity: 0.6 !important; }\\n';
      }

      // Link styles
      if (formStyle.link_color) {
        css += '/* Login Links */\\n';
        var linkSelectors = [
          '.login-link',
          '.forgot-password',
          '.forgot-password-link',
          'a[href*="forgot"]',
          'a[href*="reset"]',
          'a[href*="signup"]',
          'a[href*="register"]',
          '.login-form a',
          '.signin-form a',
          '.auth-form a'
        ].join(',\\n');
        css += linkSelectors + ' { color: ' + formStyle.link_color + ' !important; }\\n';
      }

      // Logo replacement
      if (formStyle.logo_url) {
        // Will be handled via DOM manipulation below
      }
    }

    // Inject elements as overlays
    var elements = loginDesign.elements || [];
    elements.forEach(function(element, index) {
      if (element.type === 'login-form') return; // Form is handled by GHL

      var elementId = 'at-element-' + index;

      // Create element styles
      css += '#' + elementId + ' {\\n';
      css += '  position: fixed !important;\\n';
      css += '  left: ' + element.x + '% !important;\\n';
      css += '  top: ' + element.y + '% !important;\\n';
      css += '  z-index: ' + (element.zIndex + 10) + ' !important;\\n';
      css += '  pointer-events: none !important;\\n';
      css += '}\\n';
    });

    style.textContent = css;
    document.head.appendChild(style);

    // Inject HTML elements for images, text, etc.
    elements.forEach(function(element, index) {
      if (element.type === 'login-form') return;

      var elementId = 'at-element-' + index;
      var el = document.createElement('div');
      el.id = elementId;

      if (element.type === 'image' && element.props.url) {
        el.innerHTML = '<img src="' + element.props.url + '" style="' +
          'width: ' + element.width + 'px; ' +
          'height: ' + element.height + 'px; ' +
          'opacity: ' + (element.props.opacity / 100) + '; ' +
          'border-radius: ' + element.props.borderRadius + 'px; ' +
          'object-fit: ' + element.props.objectFit + ';" />';
      } else if (element.type === 'text') {
        el.innerHTML = '<div style="' +
          'font-size: ' + element.props.fontSize + 'px; ' +
          'font-weight: ' + element.props.fontWeight + '; ' +
          'color: ' + element.props.color + '; ' +
          'text-align: ' + element.props.textAlign + '; ' +
          'width: ' + element.width + 'px;">' + element.props.text + '</div>';
      } else if (element.type === 'gif' && element.props.url) {
        el.innerHTML = '<img src="' + element.props.url + '" style="' +
          'width: ' + element.width + 'px; ' +
          'height: ' + element.height + 'px; ' +
          'opacity: ' + (element.props.opacity / 100) + '; ' +
          'border-radius: ' + element.props.borderRadius + 'px;" />';
      }

      if (el.innerHTML) {
        document.body.appendChild(el);
      }
    });

    // Replace logo if specified in form_style
    if (formStyle && formStyle.logo_url) {
      var logoSelectors = [
        '.logo img',
        '[class*="logo"] img',
        'header img',
        '.brand-logo img',
        '.company-logo img',
        '.hl-logo img',
        '.login-logo img',
        '.signin-logo img'
      ];
      var logos = document.querySelectorAll(logoSelectors.join(', '));
      logos.forEach(function(logo) {
        logo.src = formStyle.logo_url;
      });
      log('Login logo replaced');
    }

    log('Login design applied');
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
    var driverSteps = steps.map(function(step, index) {
      var driverStep = {
        popover: {
          title: step.title || 'Step ' + (index + 1),
          description: step.content || '',
          showButtons: ['next', 'previous', 'close'],
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
    var driverInstance = driverFn({
      showProgress: settings.show_progress !== false,
      showButtons: true,
      animate: true,
      allowClose: settings.allow_skip !== false,
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

    var colors = theme.colors || {};
    var typography = theme.typography || {};
    var borders = theme.borders || {};

    var css = \`
      .at-tour-popover .driver-popover {
        background-color: \${colors.background || '#ffffff'} !important;
        color: \${colors.text || '#1f2937'} !important;
        border: 1px solid \${colors.border || '#e5e7eb'} !important;
        border-radius: \${borders.radius || '12'}px !important;
        font-family: \${typography.font_family || 'system-ui, sans-serif'} !important;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1), 0 20px 25px -5px rgba(0,0,0,0.1) !important;
      }

      .at-tour-popover .driver-popover-title {
        color: \${colors.text || '#1f2937'} !important;
        font-size: \${typography.title_size || '18'}px !important;
        font-weight: 600 !important;
      }

      .at-tour-popover .driver-popover-description {
        color: \${colors.text_secondary || '#6b7280'} !important;
        font-size: \${typography.body_size || '14'}px !important;
        line-height: 1.5 !important;
      }

      .at-tour-popover .driver-popover-next-btn,
      .at-tour-popover .driver-popover-done-btn {
        background-color: \${colors.primary || '#3b82f6'} !important;
        color: white !important;
        border: none !important;
        border-radius: 8px !important;
        padding: 10px 20px !important;
        font-weight: 600 !important;
        transition: all 0.2s ease !important;
      }

      .at-tour-popover .driver-popover-next-btn:hover,
      .at-tour-popover .driver-popover-done-btn:hover {
        filter: brightness(1.1) !important;
      }

      .at-tour-popover .driver-popover-prev-btn {
        background-color: transparent !important;
        color: \${colors.secondary || '#64748b'} !important;
        border: 1px solid \${colors.border || '#e5e7eb'} !important;
        border-radius: 8px !important;
        padding: 10px 20px !important;
        font-weight: 500 !important;
      }

      .at-tour-popover .driver-popover-close-btn {
        color: \${colors.text_secondary || '#6b7280'} !important;
      }

      .at-tour-popover .driver-popover-progress-text {
        color: \${colors.text_secondary || '#6b7280'} !important;
        font-size: 12px !important;
      }

      .driver-active-element {
        box-shadow: 0 0 0 4px \${colors.primary || '#3b82f6'}40 !important;
      }

      /* Auto-advance click feedback */
      .at-clicked {
        animation: at-pulse 0.3s ease-out !important;
      }

      @keyframes at-pulse {
        0% { box-shadow: 0 0 0 0 \${colors.primary || '#3b82f6'}80; }
        100% { box-shadow: 0 0 0 20px \${colors.primary || '#3b82f6'}00; }
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
    // Inject theme styles if theme provided
    if (theme) {
      injectTourThemeStyles(theme);
    }

    // Reference to driver instance for use in step callbacks
    // (callbacks execute after driverRef is assigned)
    var driverRef = null;

    // Convert steps to Driver.js format
    var driverSteps = steps.map(function(step, index) {
      var driverStep = {
        popover: {
          title: step.title || '',
          description: step.content || '',
          showButtons: ['next', 'previous', 'close'],
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
        driverStep.popover.showButtons = ['next', 'close'];
      }

      // Last step - keep all buttons, Driver.js shows doneBtnText automatically
      if (index === steps.length - 1) {
        driverStep.popover.showButtons = ['previous', 'next', 'close'];
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

    // Get the last step's primary button text for the Done button
    var lastStep = steps[steps.length - 1];
    var doneBtnText = lastStep?.buttons?.primary?.text || 'Done';

    var driverFn = window.driver.js.driver;
    var driverInstance = driverFn({
      showProgress: settings.show_progress !== false,
      showButtons: ['next', 'previous', 'close'],
      animate: true,
      allowClose: settings.allow_skip !== false,
      overlayOpacity: 0.5,
      stagePadding: 10,
      stageRadius: 8,
      popoverClass: 'at-tour-popover at-production-tour',
      doneBtnText: doneBtnText,
      steps: driverSteps,
      onHighlightStarted: function(element, step, options) {
        var stepIndex = options.state.activeIndex;
        var stepConfig = steps[stepIndex];

        // Track tour started on first step
        if (stepIndex === 0) {
          trackTourEvent('tour_started', tour.id, {
            total_steps: steps.length
          });
        }

        // Track step viewed
        trackTourEvent('step_viewed', tour.id, {
          step_index: stepIndex,
          total_steps: steps.length
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
          log('Tour dismissed at step', options.state.activeIndex + 1);
        }
      }
    });

    // Store reference for use in step callbacks (e.g., onNextClick for "complete" action)
    driverRef = driverInstance;

    // Start the tour after page settles
    setTimeout(function() {
      driverInstance.drive();
    }, settings.delay_ms || 1000);
  }

  // Initialize production tours from config
  function initProductionTours(config) {
    var tours = config.tours || [];
    var themes = config.tour_themes || [];

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
  // PHOTO UPLOAD MODAL
  // ============================================

  var uploadState = {
    photos: [],  // { file: File, preview: string, name: string }
    maxPhotos: 5,
    businessName: '',
    isUploading: false,
    triggerElement: null
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

    // Document-level drag prevention (captures events before they reach GHL)
    function preventDragDefault(e) {
      if (document.getElementById('at-upload-overlay')) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
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
            if (config.loading) {
              applyLoadingConfig(config.loading);
              applied.push('loading');
            }
            // Use new login design if available, fall back to legacy config
            if (config.login_design) {
              applyLoginDesign(config.login_design);
              applied.push('login (advanced)');
            } else if (config.login) {
              applyLoginConfig(config.login);
              applied.push('login');
            }

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
