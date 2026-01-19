import { NextResponse } from 'next/server';

/**
 * GET /sp.js
 * Social Proof embed script
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (!key) {
    return new NextResponse('// Missing widget key', {
      headers: { 'Content-Type': 'application/javascript' },
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://toolkit.getrapidreviews.com';

  const script = `
(function() {
  'use strict';

  // Configuration
  var WIDGET_KEY = '${key}';
  var API_URL = '${baseUrl}';
  var DEBUG = false;

  function log() {
    if (DEBUG) console.log('[SocialProof]', ...arguments);
  }

  // State
  var config = null;
  var events = [];
  var eventQueue = [];
  var currentIndex = 0;
  var isVisible = false;
  var isDismissed = false;
  var notificationEl = null;

  // Check if dismissed this session
  isDismissed = sessionStorage.getItem('sp_dismissed_' + WIDGET_KEY) === 'true';
  if (isDismissed) {
    log('Widget dismissed for this session');
    return;
  }

  // Fetch config and events
  function fetchConfig() {
    return fetch(API_URL + '/api/social-proof/config?key=' + WIDGET_KEY)
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (!data.active) {
          log('Widget is paused');
          return null;
        }
        config = data.widget;
        events = data.events || [];
        log('Config loaded', config);
        log('Events loaded:', events.length);
        return data;
      })
      .catch(function(err) {
        log('Failed to fetch config:', err);
        return null;
      });
  }

  // Check URL targeting
  function matchesUrlRules() {
    if (!config || config.url_mode === 'all') return true;

    var path = window.location.pathname;
    var patterns = config.url_patterns || [];

    function matchPattern(pattern) {
      if (pattern.indexOf('*') !== -1) {
        var regex = new RegExp('^' + pattern.replace(/\\*/g, '.*') + '$');
        return regex.test(path);
      }
      return path === pattern || path.startsWith(pattern);
    }

    if (config.url_mode === 'include') {
      return patterns.some(matchPattern);
    } else if (config.url_mode === 'exclude') {
      return !patterns.some(matchPattern);
    }

    return true;
  }

  // Detect lead forms
  function detectLeadForms() {
    var forms = document.querySelectorAll('form');
    var leadForms = [];

    forms.forEach(function(form) {
      var fields = {
        email: null,
        phone: null,
        name: null,
        firstName: null,
        businessName: null
      };

      // Find email
      fields.email = form.querySelector(
        'input[type="email"], ' +
        'input[name*="email" i], ' +
        'input[id*="email" i], ' +
        'input[placeholder*="email" i]'
      );

      // Find phone
      fields.phone = form.querySelector(
        'input[type="tel"], ' +
        'input[name*="phone" i], ' +
        'input[id*="phone" i], ' +
        'input[placeholder*="phone" i]'
      );

      // Find name
      fields.name = form.querySelector(
        'input[name="name" i], ' +
        'input[id="name" i], ' +
        'input[placeholder*="your name" i]'
      );

      // Find first name
      fields.firstName = form.querySelector(
        'input[name*="first" i], ' +
        'input[id*="first" i], ' +
        'input[placeholder*="first" i]'
      );

      // Find business name
      fields.businessName = form.querySelector(
        'input[name*="company" i], ' +
        'input[name*="business" i], ' +
        'input[id*="company" i], ' +
        'input[id*="business" i], ' +
        'input[placeholder*="company" i], ' +
        'input[placeholder*="business" i]'
      );

      var hasContact = fields.email || fields.phone;
      var hasName = fields.name || fields.firstName;
      var hasPassword = form.querySelector('input[type="password"]');
      var inputCount = form.querySelectorAll('input:not([type="hidden"]):not([type="submit"])').length;
      var isSearchForm = inputCount === 1;

      if (hasContact && hasName && !hasPassword && !isSearchForm) {
        leadForms.push({ form: form, fields: fields });
      }
    });

    return leadForms;
  }

  // Attach form listeners
  function attachFormListeners(leadForms) {
    leadForms.forEach(function(item) {
      var form = item.form;
      var fields = item.fields;

      if (form.dataset.spAttached) return;
      form.dataset.spAttached = 'true';

      form.addEventListener('submit', function() {
        var firstName = null;
        if (fields.firstName && fields.firstName.value) {
          firstName = fields.firstName.value.trim();
        } else if (fields.name && fields.name.value) {
          firstName = fields.name.value.trim().split(' ')[0];
        }

        var data = {
          token: WIDGET_KEY,
          first_name: firstName,
          email: fields.email ? fields.email.value : null,
          phone: fields.phone ? fields.phone.value : null,
          business_name: fields.businessName ? fields.businessName.value.trim() : null
        };

        if (data.first_name || data.business_name) {
          sendCapture(data);
        }
      });
    });
  }

  // Send capture to server
  function sendCapture(data) {
    fetch(API_URL + '/api/social-proof/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function() {
      log('Event captured');
    }).catch(function(err) {
      log('Capture failed:', err);
    });
  }

  // Create notification element
  function createNotification() {
    var el = document.createElement('div');
    el.id = 'sp-notification';
    el.style.cssText = getPositionStyles() + getBaseStyles();
    el.innerHTML = '<div class="sp-content"></div><button class="sp-close">&times;</button>';

    var style = document.createElement('style');
    style.textContent = getThemeStyles();
    document.head.appendChild(style);

    document.body.appendChild(el);

    el.querySelector('.sp-close').addEventListener('click', function(e) {
      e.stopPropagation();
      dismissWidget();
    });

    return el;
  }

  // Get position styles
  function getPositionStyles() {
    var pos = config.position || 'bottom-left';
    var base = 'position:fixed;z-index:999999;';
    switch (pos) {
      case 'bottom-right': return base + 'bottom:20px;right:20px;';
      case 'top-left': return base + 'top:20px;left:20px;';
      case 'top-right': return base + 'top:20px;right:20px;';
      default: return base + 'bottom:20px;left:20px;';
    }
  }

  // Get base styles
  function getBaseStyles() {
    return 'opacity:0;transform:translateY(20px);transition:all 0.3s ease;pointer-events:auto;max-width:320px;';
  }

  // Get theme styles
  function getThemeStyles() {
    var theme = config.theme || 'minimal';
    var colors = config.custom_colors || {};

    var baseStyles = \`
      #sp-notification {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        padding: 12px 16px;
        border-radius: 8px;
        display: flex;
        align-items: flex-start;
        gap: 8px;
      }
      #sp-notification .sp-content {
        flex: 1;
        min-width: 0;
      }
      #sp-notification .sp-name {
        font-weight: 600;
        font-size: 14px;
        line-height: 1.3;
      }
      #sp-notification .sp-action {
        font-size: 13px;
        margin-top: 2px;
      }
      #sp-notification .sp-time {
        font-size: 11px;
        margin-top: 4px;
        opacity: 0.7;
      }
      #sp-notification .sp-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
        opacity: 0.5;
        transition: opacity 0.2s;
      }
      #sp-notification .sp-close:hover {
        opacity: 1;
      }
      #sp-notification.sp-visible {
        opacity: 1;
        transform: translateY(0);
      }
    \`;

    if (theme === 'glass') {
      return baseStyles + \`
        #sp-notification {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 2px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5);
        }
        #sp-notification .sp-name { color: #111827; }
        #sp-notification .sp-action { color: #374151; }
        #sp-notification .sp-time { color: #4b5563; }
        #sp-notification .sp-close { color: #4b5563; }
      \`;
    } else if (theme === 'dark') {
      return baseStyles + \`
        #sp-notification {
          background: #111827;
          border: 1px solid #374151;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        #sp-notification .sp-name { color: #f9fafb; }
        #sp-notification .sp-action { color: #d1d5db; }
        #sp-notification .sp-time { color: #6b7280; }
        #sp-notification .sp-close { color: #6b7280; }
      \`;
    } else if (theme === 'rounded') {
      return baseStyles + \`
        #sp-notification {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
        }
        #sp-notification .sp-name { color: #1f2937; }
        #sp-notification .sp-action { color: #6b7280; }
        #sp-notification .sp-time { color: #9ca3af; }
        #sp-notification .sp-close { color: #9ca3af; }
      \`;
    } else if (theme === 'custom') {
      return baseStyles + \`
        #sp-notification {
          background: \${colors.background || '#ffffff'};
          border: 1px solid \${colors.border || '#e5e7eb'};
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        #sp-notification .sp-name { color: \${colors.text || '#1f2937'}; }
        #sp-notification .sp-action { color: \${colors.accent || '#3b82f6'}; }
        #sp-notification .sp-time { color: \${colors.text || '#1f2937'}; }
        #sp-notification .sp-close { color: \${colors.text || '#1f2937'}; }
      \`;
    } else {
      // Minimal theme (default)
      return baseStyles + \`
        #sp-notification {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        #sp-notification .sp-name { color: #1f2937; }
        #sp-notification .sp-action { color: #6b7280; }
        #sp-notification .sp-time { color: #9ca3af; }
        #sp-notification .sp-close { color: #9ca3af; }
      \`;
    }
  }

  // Show notification
  function showNotification(event) {
    if (!notificationEl || isDismissed) return;

    var name = '';
    if (config.show_business_name && event.business_name) {
      name = event.business_name;
    } else if (config.show_first_name && event.first_name) {
      name = event.first_name;
    } else {
      name = 'Someone';
    }

    var location = config.show_city && event.city ? ' from ' + event.city : '';
    var action = event.action_text || 'just signed up';
    var time = config.show_time_ago ? event.time_ago : '';

    var html = '<div class="sp-name">' + name + location + '</div>';
    html += '<div class="sp-action">' + action + '</div>';
    if (time) {
      html += '<div class="sp-time">' + time + (config.time_ago_text ? ' ' + config.time_ago_text : '') + '</div>';
    }

    notificationEl.querySelector('.sp-content').innerHTML = html;
    notificationEl.classList.add('sp-visible');
    isVisible = true;

    setTimeout(function() {
      hideNotification();
    }, (config.display_duration || 5) * 1000);
  }

  // Hide notification
  function hideNotification() {
    if (!notificationEl) return;
    notificationEl.classList.remove('sp-visible');
    isVisible = false;
  }

  // Dismiss widget
  function dismissWidget() {
    isDismissed = true;
    sessionStorage.setItem('sp_dismissed_' + WIDGET_KEY, 'true');
    hideNotification();
    log('Widget dismissed');
  }

  // Shuffle array
  function shuffleArray(array) {
    var shuffled = array.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    return shuffled;
  }

  // Start rotation
  function startRotation() {
    if (events.length === 0) {
      log('No events to display');
      return;
    }

    eventQueue = config.randomize_order ? shuffleArray(events) : events.slice();
    currentIndex = 0;

    function showNext() {
      if (isDismissed) return;

      if (currentIndex >= eventQueue.length) {
        eventQueue = config.randomize_order ? shuffleArray(events) : events.slice();
        currentIndex = 0;
      }

      var event = eventQueue[currentIndex++];
      showNotification(event);

      var nextDelay = ((config.display_duration || 5) + (config.gap_between || 3)) * 1000;
      setTimeout(showNext, nextDelay);
    }

    showNext();
  }

  // Initialize
  function init() {
    fetchConfig().then(function(data) {
      if (!data) return;

      if (!matchesUrlRules()) {
        log('URL does not match targeting rules');
        return;
      }

      // Setup form capture
      if (config.form_selector) {
        var customForms = document.querySelectorAll(config.form_selector);
        customForms.forEach(function(form) {
          attachFormListeners([{ form: form, fields: detectLeadForms().find(function(f) { return f.form === form; })?.fields || {} }]);
        });
      } else {
        var leadForms = detectLeadForms();
        log('Detected', leadForms.length, 'lead forms');
        attachFormListeners(leadForms);
      }

      // Create notification element
      notificationEl = createNotification();

      // Start rotation after initial delay
      var initialDelay = (config.initial_delay || 3) * 1000;
      setTimeout(startRotation, initialDelay);
    });
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
`;

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      'Access-Control-Allow-Origin': '*',
    },
  });
}
