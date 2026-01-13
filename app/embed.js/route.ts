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
