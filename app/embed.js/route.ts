import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  // Get the base URL for API calls
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.agencytoolkit.com';

  // Generate the embed script
  const script = generateEmbedScript(key, baseUrl);

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

function generateEmbedScript(key: string | null, baseUrl: string): string {
  // In production, this would be minified
  const isDev = process.env.NODE_ENV === 'development';

  const script = `
(function() {
  'use strict';

  // Agency Toolkit Embed Script
  // https://agencytoolkit.com

  var CONFIG_KEY = ${JSON.stringify(key)};
  var API_BASE = ${JSON.stringify(baseUrl)};
  var DEBUG = ${isDev};

  // CRITICAL: Capture builder mode params IMMEDIATELY before SPA router can strip them
  // GHL's router strips URL params on redirect, so we need to persist them in sessionStorage
  var BUILDER_SESSION_KEY = 'at_builder_session';
  (function captureBuilderParams() {
    try {
      var urlParams = new URLSearchParams(window.location.search);
      var builderMode = urlParams.get('at_builder_mode');
      var sessionId = urlParams.get('at_session');
      var autoClose = urlParams.get('at_auto_close');

      if (builderMode === 'true' && sessionId) {
        // Store in sessionStorage so we survive the redirect
        sessionStorage.setItem(BUILDER_SESSION_KEY, JSON.stringify({
          builderMode: builderMode,
          sessionId: sessionId,
          autoClose: autoClose,
          timestamp: Date.now()
        }));
      }
    } catch (e) {
      // sessionStorage might not be available
    }
  })();

  // Logging helper
  function log(message, data) {
    if (DEBUG || window.AGENCY_TOOLKIT_DEBUG) {
      console.log('[AgencyToolkit]', message, data || '');
    }
  }

  function logError(message, error) {
    console.error('[AgencyToolkit]', message, error || '');
  }

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
  function applyMenuConfig(menuConfig) {
    if (!menuConfig) return;
    log('Applying menu config', menuConfig);

    // Remove existing menu styles if any
    var existingStyle = document.getElementById('agency-toolkit-menu');
    if (existingStyle) existingStyle.remove();

    var css = '';

    // Hide menu items using GHL sidebar item selectors
    if (menuConfig.hidden_items && menuConfig.hidden_items.length > 0) {
      var hiddenSelectors = menuConfig.hidden_items.map(function(item) {
        // GHL uses data-sidebar-item attribute on sidebar items
        return '[data-sidebar-item="' + item + '"]';
      }).join(',\\n');

      css += '/* Hidden Menu Items */\\n';
      css += hiddenSelectors + ' { display: none !important; }\\n';
    }

    // Rename menu items using CSS ::after trick
    if (menuConfig.renamed_items && Object.keys(menuConfig.renamed_items).length > 0) {
      css += '/* Renamed Menu Items */\\n';
      Object.keys(menuConfig.renamed_items).forEach(function(itemId) {
        var newName = menuConfig.renamed_items[itemId];
        // Hide original text, show new text via ::after
        css += '[data-sidebar-item="' + itemId + '"] span.hl-text-md { font-size: 0 !important; }\\n';
        css += '[data-sidebar-item="' + itemId + '"] span.hl-text-md::after { content: "' + newName + '"; font-size: 14px; }\\n';
      });
    }

    // Hide promotional banners
    if (menuConfig.hidden_banners && menuConfig.hidden_banners.indexOf('hide_promos') !== -1) {
      css += '/* Hidden Promotional Banners */\\n';
      css += '[class*="promo-banner"], [class*="wordpress-promo"], [class*="upgrade-prompt"], ';
      css += '[class*="feature-announcement"], .hl-banner-promo { display: none !important; }\\n';
    }

    // Hide warning banners
    if (menuConfig.hidden_banners && menuConfig.hidden_banners.indexOf('hide_warnings') !== -1) {
      css += '/* Hidden Warning Banners */\\n';
      css += '[class*="warning-banner"], [class*="twilio-warning"], ';
      css += '[class*="reintegration-alert"], .hl-banner-warning { display: none !important; }\\n';
    }

    // Hide connect prompts
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
    }
  }

  // Apply color customizations
  function applyColorConfig(colorConfig) {
    if (!colorConfig) return;
    log('Applying color config', colorConfig);

    var style = document.createElement('style');
    style.id = 'agency-toolkit-colors';

    var css = ':root {';
    if (colorConfig.primary) css += '--at-primary: ' + colorConfig.primary + ';';
    if (colorConfig.accent) css += '--at-accent: ' + colorConfig.accent + ';';
    if (colorConfig.sidebar_bg) css += '--at-sidebar-bg: ' + colorConfig.sidebar_bg + ';';
    if (colorConfig.sidebar_text) css += '--at-sidebar-text: ' + colorConfig.sidebar_text + ';';
    css += '}';

    // Apply colors to common GHL elements
    if (colorConfig.primary) {
      css += '.hl-primary, .btn-primary { background-color: ' + colorConfig.primary + ' !important; }';
    }
    if (colorConfig.sidebar_bg) {
      css += '.sidebar, .nav-sidebar, [class*="sidebar"] { background-color: ' + colorConfig.sidebar_bg + ' !important; }';
    }
    if (colorConfig.sidebar_text) {
      css += '.sidebar a, .nav-sidebar a, [class*="sidebar"] a { color: ' + colorConfig.sidebar_text + ' !important; }';
    }

    style.textContent = css;
    document.head.appendChild(style);
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
    var hideGHLLoader = document.createElement('style');
    hideGHLLoader.id = 'agency-toolkit-hide-ghl-loader';
    hideGHLLoader.textContent = [
      '/* Hide GHL default loaders when our loader is active */',
      '.hl-loader, .hl-loading, [class*="hl-spinner"],',
      '.loading-spinner, .page-loader, .hl-page-loader,',
      '[class*="loading-indicator"], .spinner-border,',
      '.hl-loading-overlay .hl-loading-spinner { display: none !important; }',
      '/* Ensure our loader container shows */',
      '.hl-loading-overlay { background: var(--loading-bg, transparent) !important; }'
    ].join('\\n');
    document.head.appendChild(hideGHLLoader);

    // Inject our custom loader HTML
    if (loadingConfig.html) {
      // Find GHL loading containers and inject our loader
      function injectLoader() {
        var loader = document.createElement('div');
        loader.id = 'agency-toolkit-loader';
        loader.innerHTML = loadingConfig.html;

        // Look for GHL loading overlay containers
        var loaderContainers = document.querySelectorAll('.hl-loading-overlay, .hl-loader-container, .loading-container, [class*="loader-wrapper"]');

        if (loaderContainers.length > 0) {
          loaderContainers.forEach(function(container) {
            // Check if we haven't already added our loader
            if (!container.querySelector('#agency-toolkit-loader')) {
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
                node.classList.contains('hl-loader-container')
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
  function applyLoginConfig(loginConfig) {
    if (!loginConfig) return;

    // Only apply on login pages
    var isLoginPage = window.location.pathname.includes('/login') ||
                      window.location.pathname.includes('/signin') ||
                      document.querySelector('[class*="login"]');

    if (!isLoginPage) return;
    log('Applying login config', loginConfig);

    var style = document.createElement('style');
    style.id = 'agency-toolkit-login';
    var css = '';

    if (loginConfig.background_color) {
      css += 'body, .login-container { background-color: ' + loginConfig.background_color + ' !important; }';
    }
    if (loginConfig.background_image_url) {
      css += 'body, .login-container { background-image: url(' + loginConfig.background_image_url + ') !important; background-size: cover; }';
    }
    if (loginConfig.button_color) {
      css += '.login-btn, .signin-btn, [type="submit"] { background-color: ' + loginConfig.button_color + ' !important; }';
    }
    if (loginConfig.button_text_color) {
      css += '.login-btn, .signin-btn, [type="submit"] { color: ' + loginConfig.button_text_color + ' !important; }';
    }

    if (css) {
      style.textContent = css;
      document.head.appendChild(style);
    }

    // Replace logo if specified
    if (loginConfig.logo_url) {
      var logos = document.querySelectorAll('.logo img, [class*="logo"] img, header img');
      logos.forEach(function(logo) {
        logo.src = loginConfig.logo_url;
      });
    }
  }

  // Apply advanced login design (canvas-based)
  function applyLoginDesign(loginDesign) {
    if (!loginDesign) return;

    // Only apply on login pages
    var isLoginPage = window.location.pathname.includes('/login') ||
                      window.location.pathname.includes('/signin') ||
                      document.querySelector('[class*="login"]');

    if (!isLoginPage) return;
    log('Applying login design', loginDesign);

    // Remove existing styles
    var existing = document.getElementById('agency-toolkit-login-design');
    if (existing) existing.remove();

    var style = document.createElement('style');
    style.id = 'agency-toolkit-login-design';
    var css = '';

    // Apply background
    var canvas = loginDesign.canvas;
    if (canvas && canvas.background) {
      var bg = canvas.background;
      css += 'body, .login-page, .login-container, [class*="login-wrapper"] {\\n';

      if (bg.type === 'solid' && bg.color) {
        css += '  background-color: ' + bg.color + ' !important;\\n';
      } else if (bg.type === 'gradient' && bg.gradient) {
        css += '  background: linear-gradient(' + bg.gradient.angle + 'deg, ' + bg.gradient.from + ', ' + bg.gradient.to + ') !important;\\n';
      } else if (bg.type === 'image' && bg.image_url) {
        css += '  background-image: url(' + bg.image_url + ') !important;\\n';
        css += '  background-size: cover !important;\\n';
        css += '  background-position: center !important;\\n';
        if (bg.image_blur) {
          css += '  backdrop-filter: blur(' + bg.image_blur + 'px) !important;\\n';
        }
      }
      css += '  min-height: 100vh !important;\\n';
      css += '}\\n';

      // Image overlay
      if (bg.type === 'image' && bg.image_overlay) {
        css += 'body::before, .login-page::before {\\n';
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
      // Form container background
      if (formStyle.form_bg) {
        css += '.login-form, .signin-form, .auth-form, [class*="login-card"], [class*="auth-card"] {\\n';
        css += '  background-color: ' + formStyle.form_bg + ' !important;\\n';
        css += '  backdrop-filter: blur(8px) !important;\\n';
        css += '}\\n';
      }

      // Button styles
      css += '.login-btn, .signin-btn, [type="submit"], .submit-btn, button[type="submit"] {\\n';
      css += '  background-color: ' + formStyle.button_bg + ' !important;\\n';
      css += '  color: ' + formStyle.button_text + ' !important;\\n';
      css += '  border: none !important;\\n';
      css += '}\\n';

      // Input styles
      css += 'input[type="email"], input[type="password"], input[type="text"], .login-input {\\n';
      css += '  background-color: ' + formStyle.input_bg + ' !important;\\n';
      css += '  border-color: ' + formStyle.input_border + ' !important;\\n';
      css += '  color: ' + formStyle.input_text + ' !important;\\n';
      css += '}\\n';

      // Link styles
      css += '.login-link, .forgot-password, a[href*="forgot"], a[href*="reset"] {\\n';
      css += '  color: ' + formStyle.link_color + ' !important;\\n';
      css += '}\\n';
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

    log('Login design applied');
  }

  // ============================================
  // BUILDER MODE - Visual Element Selector
  // ============================================

  function initBuilderMode() {
    var urlParams = new URLSearchParams(window.location.search);
    var isBuilderMode = urlParams.get('at_builder_mode') === 'true';
    var sessionId = urlParams.get('at_session');
    var autoClose = urlParams.get('at_auto_close') !== 'false';

    // If URL params are gone (SPA stripped them), check sessionStorage
    if (!isBuilderMode || !sessionId) {
      try {
        var stored = sessionStorage.getItem(BUILDER_SESSION_KEY);
        if (stored) {
          var data = JSON.parse(stored);
          // Only use if stored within the last 5 minutes (session is fresh)
          if (data.timestamp && Date.now() - data.timestamp < 5 * 60 * 1000) {
            isBuilderMode = data.builderMode === 'true';
            sessionId = data.sessionId;
            autoClose = data.autoClose !== 'false';
            log('Builder mode restored from sessionStorage', { sessionId: sessionId });
          }
        }
      } catch (e) {
        // Ignore storage errors
      }
    }

    if (!isBuilderMode || !sessionId) return false;

    // Clear the stored session to prevent re-triggering on subsequent page loads
    try {
      sessionStorage.removeItem(BUILDER_SESSION_KEY);
    } catch (e) {}

    log('Builder mode activated', { sessionId: sessionId, autoClose: autoClose });

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
        <div class="at-toolbar-status">
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
        border-left: 1px solid rgba(6,182,212,0.2);
        margin-left: 2px;
      }
      #at-builder-toolbar.at-active .at-toolbar-status { display: flex; }

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
      // Try ID first
      if (element.id && !element.id.match(/^\\d/)) {
        return '#' + element.id;
      }

      // Try data attributes (common in GHL)
      for (var i = 0; i < element.attributes.length; i++) {
        var attr = element.attributes[i];
        if (attr.name.startsWith('data-') && attr.value) {
          var sel = '[' + attr.name + '="' + attr.value + '"]';
          if (document.querySelectorAll(sel).length === 1) {
            return sel;
          }
        }
      }

      // Try unique class combination
      if (element.classList.length > 0) {
        var classes = Array.from(element.classList)
          .filter(function(c) { return !c.startsWith('at-'); })
          .join('.');
        if (classes) {
          var sel = element.tagName.toLowerCase() + '.' + classes;
          if (document.querySelectorAll(sel).length === 1) {
            return sel;
          }
        }
      }

      // Fall back to path-based selector
      return generatePathSelector(element);
    }

    function generatePathSelector(element) {
      var path = [];
      var current = element;

      while (current && current !== document.body && path.length < 10) {
        var selector = current.tagName.toLowerCase();

        if (current.id && !current.id.match(/^\\d/)) {
          selector = '#' + current.id;
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

      return path.join(' > ');
    }

    function getDisplayName(element) {
      // Try aria-label
      if (element.getAttribute('aria-label')) {
        return element.getAttribute('aria-label');
      }
      // Try title
      if (element.title) {
        return element.title;
      }
      // Try text content
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
          <h3>Element Selected</h3>
        </div>
        <div class="at-element-preview">
          <div class="at-element-name">
            \${escapeHtml(data.displayName)}
            <span class="at-element-tag">\${data.tagName}</span>
          </div>
          <div class="at-selector-preview">\${escapeHtml(data.selector)}</div>
        </div>
        \${fragileWarning}
        <p>The selector has been sent to your tour builder. This tab will close automatically.</p>
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

      // Auto-close if enabled
      if (autoClose) {
        setTimeout(function() { window.close(); }, 2500);
      }
    }

    function sendSelection(data) {
      // Send via BroadcastChannel
      try {
        var channel = new BroadcastChannel('at_element_selection');
        channel.postMessage(data);
        channel.close();
      } catch (e) {
        log('BroadcastChannel not supported');
      }

      // Also store in localStorage as fallback
      try {
        localStorage.setItem('at_selected_element', JSON.stringify(data));
      } catch (e) {}

      log('Selection sent', data);
    }

    return true; // Builder mode is active
  }

  // Main initialization
  function init() {
    // Check for builder mode first
    if (initBuilderMode()) {
      return; // Don't apply customizations in builder mode
    }

    if (!CONFIG_KEY) {
      logError('No API key provided');
      return;
    }

    log('Initializing with key:', CONFIG_KEY.substring(0, 8) + '...');

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
          return;
        }

        // Store config globally for debugging
        window.__AGENCY_TOOLKIT_CONFIG__ = config;

        // Apply customizations when DOM is ready
        function applyCustomizations() {
          try {
            applyMenuConfig(config.menu);
            applyColorConfig(config.colors);
            applyLoadingConfig(config.loading);
            // Use new login design if available, fall back to legacy config
            if (config.login_design) {
              applyLoginDesign(config.login_design);
            } else {
              applyLoginConfig(config.login);
            }
            log('All customizations applied');
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
        var observer = new MutationObserver(function(mutations) {
          var shouldReapply = mutations.some(function(m) {
            return m.addedNodes.length > 0;
          });
          if (shouldReapply) {
            applyMenuConfig(config.menu);
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      })
      .catch(function(error) {
        logError('Failed to load config', error);
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
