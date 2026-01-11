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

    // Custom loading animation logic would go here
    // This depends on the specific animations available
    if (loadingConfig.custom_css) {
      var style = document.createElement('style');
      style.id = 'agency-toolkit-loading';
      style.textContent = loadingConfig.custom_css;
      document.head.appendChild(style);
    }
  }

  // Apply login page customizations
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

  // Main initialization
  function init() {
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
            applyLoginConfig(config.login);
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
