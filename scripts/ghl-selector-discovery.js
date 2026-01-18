/**
 * GHL Selector Discovery Script
 *
 * USAGE:
 * 1. Open your GHL subaccount in Chrome
 * 2. Open DevTools (F12 or Cmd+Option+I)
 * 3. Go to Console tab
 * 4. Paste this entire script and press Enter
 * 5. Navigate to different pages (Dashboard, Contacts, Calendar, etc.)
 * 6. Run: GHLDiscovery.report() to see current findings
 * 7. Run: GHLDiscovery.export() to copy JSON to clipboard
 *
 * The script watches for DOM changes and continuously updates its findings.
 */

(function() {
  'use strict';

  const discovery = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    pagesVisited: new Set(),
    selectors: {
      sidebar: {
        container: new Set(),
        menuItems: new Set(),
        menuText: new Set(),
        menuIcons: new Set(),
        activeItem: new Set(),
        dividers: new Set(),
      },
      topNav: {
        container: new Set(),
        links: new Set(),
        userProfile: new Set(),
        searchBar: new Set(),
      },
      buttons: {
        primary: new Set(),
        secondary: new Set(),
        danger: new Set(),
        ghost: new Set(),
        allButtons: new Set(),
      },
      loading: {
        spinners: new Set(),
        overlays: new Set(),
        skeletons: new Set(),
      },
      forms: {
        inputs: new Set(),
        selects: new Set(),
        textareas: new Set(),
        labels: new Set(),
        checkboxes: new Set(),
      },
      text: {
        headings: new Set(),
        bodyText: new Set(),
        links: new Set(),
        labels: new Set(),
      },
      cards: {
        containers: new Set(),
        modals: new Set(),
        dropdowns: new Set(),
      },
      colors: {
        backgroundClasses: new Set(),
        textColorClasses: new Set(),
        borderClasses: new Set(),
      }
    },
    rawElements: {
      sidebar: [],
      buttons: [],
      inputs: [],
    }
  };

  // Helper: Get unique selector for an element
  function getSelector(el) {
    if (!el || el === document.body) return null;

    // Prefer ID
    if (el.id && !el.id.match(/^\d/)) {
      return `#${el.id}`;
    }

    // Check for data attributes (common in frameworks)
    for (const attr of el.attributes) {
      if (attr.name.startsWith('data-') && attr.value && !attr.name.includes('v-')) {
        const sel = `[${attr.name}="${attr.value}"]`;
        if (document.querySelectorAll(sel).length <= 5) {
          return sel;
        }
      }
    }

    // Use meaningful classes
    if (el.classList.length > 0) {
      const meaningfulClasses = Array.from(el.classList)
        .filter(c => !c.match(/^(flex|grid|p-|m-|w-|h-|text-|bg-|border-|rounded-|shadow-|hover:|focus:|sm:|md:|lg:|xl:)/))
        .filter(c => c.length > 2);

      if (meaningfulClasses.length > 0) {
        return '.' + meaningfulClasses.join('.');
      }
    }

    // Return tag + all classes for reference
    return el.tagName.toLowerCase() + (el.className ? '.' + el.className.split(' ').slice(0, 3).join('.') : '');
  }

  // Helper: Get class patterns
  function getClassPatterns(el) {
    if (!el.className || typeof el.className !== 'string') return [];
    return el.className.split(' ').filter(c => c.length > 0);
  }

  // Discover sidebar elements
  function discoverSidebar() {
    // Find sidebar container - look for common patterns
    const sidebarPatterns = [
      '[class*="sidebar"]',
      '[class*="lead-connector"]',
      '[class*="nav-"]',
      'aside',
      'nav[aria-label*="main"]',
      '[class*="menu"]'
    ];

    sidebarPatterns.forEach(pattern => {
      try {
        document.querySelectorAll(pattern).forEach(el => {
          const sel = getSelector(el);
          if (sel) discovery.selectors.sidebar.container.add(sel);
          getClassPatterns(el).forEach(c => {
            if (c.includes('sidebar') || c.includes('nav') || c.includes('menu') || c.includes('lead-connector')) {
              discovery.selectors.sidebar.container.add('.' + c);
            }
          });
        });
      } catch (e) {}
    });

    // Find menu items - elements with sb_ prefix in ID
    document.querySelectorAll('[id^="sb_"]').forEach(el => {
      discovery.selectors.sidebar.menuItems.add(`#${el.id}`);
      discovery.selectors.sidebar.menuItems.add('[id^="sb_"]');

      // Find text within menu items
      el.querySelectorAll('span').forEach(span => {
        getClassPatterns(span).forEach(c => {
          if (c.includes('text') || c.includes('title') || c.includes('label') || c.includes('nav')) {
            discovery.selectors.sidebar.menuText.add('.' + c);
          }
        });
      });

      // Find icons
      el.querySelectorAll('svg, img, [class*="icon"]').forEach(icon => {
        const sel = getSelector(icon);
        if (sel) discovery.selectors.sidebar.menuIcons.add(sel);
      });

      // Check if active
      if (el.classList.contains('active') || el.getAttribute('aria-current')) {
        getClassPatterns(el).forEach(c => {
          if (c.includes('active') || c.includes('selected') || c.includes('current')) {
            discovery.selectors.sidebar.activeItem.add('.' + c);
          }
        });
      }

      // Store raw element info for detailed analysis
      discovery.rawElements.sidebar.push({
        id: el.id,
        tag: el.tagName,
        classes: el.className,
        text: el.textContent?.trim().slice(0, 50),
        children: Array.from(el.children).map(c => ({
          tag: c.tagName,
          classes: c.className
        }))
      });
    });
  }

  // Discover top navigation
  function discoverTopNav() {
    const headerPatterns = [
      'header',
      '[class*="header"]',
      '[class*="topbar"]',
      '[class*="navbar"]',
      '[class*="app-bar"]',
      '[role="banner"]'
    ];

    headerPatterns.forEach(pattern => {
      try {
        document.querySelectorAll(pattern).forEach(el => {
          const sel = getSelector(el);
          if (sel) discovery.selectors.topNav.container.add(sel);
          getClassPatterns(el).forEach(c => {
            if (c.includes('header') || c.includes('nav') || c.includes('bar')) {
              discovery.selectors.topNav.container.add('.' + c);
            }
          });
        });
      } catch (e) {}
    });

    // User profile / avatar areas
    document.querySelectorAll('[class*="avatar"], [class*="profile"], [class*="user-"]').forEach(el => {
      const sel = getSelector(el);
      if (sel) discovery.selectors.topNav.userProfile.add(sel);
    });
  }

  // Discover buttons
  function discoverButtons() {
    const allButtons = document.querySelectorAll('button, [role="button"], .btn, [class*="button"], a[class*="btn"]');

    allButtons.forEach(btn => {
      const classes = getClassPatterns(btn);
      const sel = getSelector(btn);

      if (sel) discovery.selectors.buttons.allButtons.add(sel);

      classes.forEach(c => {
        if (c.includes('primary') || c.includes('main') || c.includes('submit')) {
          discovery.selectors.buttons.primary.add('.' + c);
        }
        if (c.includes('secondary') || c.includes('outline') || c.includes('ghost')) {
          discovery.selectors.buttons.secondary.add('.' + c);
        }
        if (c.includes('danger') || c.includes('delete') || c.includes('destructive') || c.includes('error')) {
          discovery.selectors.buttons.danger.add('.' + c);
        }
        if (c.includes('btn') || c.includes('button')) {
          discovery.selectors.buttons.allButtons.add('.' + c);
        }
      });

      // Check computed styles for primary-looking buttons
      const style = window.getComputedStyle(btn);
      if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        discovery.rawElements.buttons.push({
          text: btn.textContent?.trim().slice(0, 30),
          classes: btn.className,
          bgColor: style.backgroundColor,
          color: style.color
        });
      }
    });
  }

  // Discover loading elements
  function discoverLoading() {
    const loadingPatterns = [
      '[class*="loading"]',
      '[class*="spinner"]',
      '[class*="loader"]',
      '[class*="skeleton"]',
      '[class*="pulse"]',
      '[class*="animate-spin"]',
      '.hl-loader',
      '.hl-loading'
    ];

    loadingPatterns.forEach(pattern => {
      try {
        document.querySelectorAll(pattern).forEach(el => {
          const sel = getSelector(el);
          const classes = getClassPatterns(el);

          classes.forEach(c => {
            if (c.includes('spinner') || c.includes('loader')) {
              discovery.selectors.loading.spinners.add('.' + c);
            }
            if (c.includes('overlay') || c.includes('backdrop')) {
              discovery.selectors.loading.overlays.add('.' + c);
            }
            if (c.includes('skeleton') || c.includes('placeholder')) {
              discovery.selectors.loading.skeletons.add('.' + c);
            }
          });

          if (sel) {
            if (sel.includes('spinner') || sel.includes('loader')) {
              discovery.selectors.loading.spinners.add(sel);
            } else if (sel.includes('overlay')) {
              discovery.selectors.loading.overlays.add(sel);
            }
          }
        });
      } catch (e) {}
    });
  }

  // Discover form elements
  function discoverForms() {
    // Inputs
    document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="search"], input:not([type])').forEach(el => {
      getClassPatterns(el).forEach(c => {
        if (c.includes('input') || c.includes('field') || c.includes('form')) {
          discovery.selectors.forms.inputs.add('.' + c);
        }
      });
      discovery.rawElements.inputs.push({
        type: el.type,
        classes: el.className,
        placeholder: el.placeholder
      });
    });

    // Selects
    document.querySelectorAll('select, [class*="select"], [role="listbox"]').forEach(el => {
      getClassPatterns(el).forEach(c => {
        if (c.includes('select') || c.includes('dropdown')) {
          discovery.selectors.forms.selects.add('.' + c);
        }
      });
    });

    // Textareas
    document.querySelectorAll('textarea').forEach(el => {
      getClassPatterns(el).forEach(c => {
        discovery.selectors.forms.textareas.add('.' + c);
      });
    });

    // Labels
    document.querySelectorAll('label').forEach(el => {
      getClassPatterns(el).forEach(c => {
        if (c.includes('label')) {
          discovery.selectors.forms.labels.add('.' + c);
        }
      });
    });
  }

  // Discover text styles
  function discoverText() {
    // Headings
    document.querySelectorAll('h1, h2, h3, h4, h5, h6, [class*="heading"], [class*="title"]').forEach(el => {
      getClassPatterns(el).forEach(c => {
        if (c.includes('heading') || c.includes('title') || c.includes('header')) {
          discovery.selectors.text.headings.add('.' + c);
        }
      });
    });

    // Links
    document.querySelectorAll('a').forEach(el => {
      getClassPatterns(el).forEach(c => {
        if (c.includes('link')) {
          discovery.selectors.text.links.add('.' + c);
        }
      });
    });
  }

  // Discover cards and containers
  function discoverCards() {
    const cardPatterns = [
      '[class*="card"]',
      '[class*="panel"]',
      '[class*="modal"]',
      '[class*="dialog"]',
      '[class*="dropdown"]',
      '[class*="popover"]',
      '[role="dialog"]'
    ];

    cardPatterns.forEach(pattern => {
      try {
        document.querySelectorAll(pattern).forEach(el => {
          const classes = getClassPatterns(el);
          classes.forEach(c => {
            if (c.includes('card')) {
              discovery.selectors.cards.containers.add('.' + c);
            }
            if (c.includes('modal') || c.includes('dialog')) {
              discovery.selectors.cards.modals.add('.' + c);
            }
            if (c.includes('dropdown') || c.includes('popover')) {
              discovery.selectors.cards.dropdowns.add('.' + c);
            }
          });
        });
      } catch (e) {}
    });
  }

  // Run full discovery
  function runDiscovery() {
    discovery.pagesVisited.add(window.location.pathname);

    discoverSidebar();
    discoverTopNav();
    discoverButtons();
    discoverLoading();
    discoverForms();
    discoverText();
    discoverCards();

    discovery.timestamp = new Date().toISOString();
  }

  // Convert Sets to Arrays for export
  function serializeSelectors() {
    const result = {};
    for (const [category, items] of Object.entries(discovery.selectors)) {
      result[category] = {};
      for (const [key, set] of Object.entries(items)) {
        result[category][key] = Array.from(set).sort();
      }
    }
    return result;
  }

  // Generate report
  function generateReport() {
    runDiscovery();

    const report = {
      version: discovery.version,
      timestamp: discovery.timestamp,
      pagesVisited: Array.from(discovery.pagesVisited),
      selectors: serializeSelectors(),
      samples: {
        sidebarItems: discovery.rawElements.sidebar.slice(0, 10),
        buttons: discovery.rawElements.buttons.slice(0, 10),
        inputs: discovery.rawElements.inputs.slice(0, 5),
      }
    };

    return report;
  }

  // Watch for DOM changes
  const observer = new MutationObserver(() => {
    runDiscovery();
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial run
  runDiscovery();

  // Expose global API
  window.GHLDiscovery = {
    run: runDiscovery,

    report: function() {
      const report = generateReport();
      console.log('%c=== GHL Selector Discovery Report ===', 'color: #06b6d4; font-weight: bold; font-size: 14px;');
      console.log('%cPages visited:', 'color: #64748b;', Array.from(discovery.pagesVisited));
      console.log('%cTimestamp:', 'color: #64748b;', discovery.timestamp);
      console.log('');

      console.log('%c📁 SIDEBAR', 'color: #f59e0b; font-weight: bold;');
      console.table({
        'Container': Array.from(discovery.selectors.sidebar.container).join(', ') || 'Not found',
        'Menu Items': Array.from(discovery.selectors.sidebar.menuItems).join(', ') || 'Not found',
        'Menu Text': Array.from(discovery.selectors.sidebar.menuText).join(', ') || 'Not found',
        'Icons': Array.from(discovery.selectors.sidebar.menuIcons).slice(0, 5).join(', ') || 'Not found',
      });

      console.log('%c🔘 BUTTONS', 'color: #f59e0b; font-weight: bold;');
      console.table({
        'Primary': Array.from(discovery.selectors.buttons.primary).join(', ') || 'Not found',
        'Secondary': Array.from(discovery.selectors.buttons.secondary).join(', ') || 'Not found',
        'All Buttons': Array.from(discovery.selectors.buttons.allButtons).slice(0, 10).join(', ') || 'Not found',
      });

      console.log('%c⏳ LOADING', 'color: #f59e0b; font-weight: bold;');
      console.table({
        'Spinners': Array.from(discovery.selectors.loading.spinners).join(', ') || 'Not found',
        'Overlays': Array.from(discovery.selectors.loading.overlays).join(', ') || 'Not found',
      });

      console.log('%c📝 FORMS', 'color: #f59e0b; font-weight: bold;');
      console.table({
        'Inputs': Array.from(discovery.selectors.forms.inputs).join(', ') || 'Not found',
        'Selects': Array.from(discovery.selectors.forms.selects).join(', ') || 'Not found',
      });

      console.log('%c🎨 Raw Button Samples:', 'color: #64748b;');
      console.table(discovery.rawElements.buttons.slice(0, 5));

      console.log('%c📋 Raw Sidebar Items:', 'color: #64748b;');
      console.table(discovery.rawElements.sidebar.slice(0, 5));

      return report;
    },

    export: function() {
      const report = generateReport();
      const json = JSON.stringify(report, null, 2);

      // Copy to clipboard
      navigator.clipboard.writeText(json).then(() => {
        console.log('%c✅ Report copied to clipboard!', 'color: #10b981; font-weight: bold;');
        console.log('Paste it into a file or share it for analysis.');
      }).catch(() => {
        console.log('%c📋 Copy the JSON below:', 'color: #f59e0b;');
        console.log(json);
      });

      return report;
    },

    getSelector: function(category, type) {
      if (discovery.selectors[category] && discovery.selectors[category][type]) {
        return Array.from(discovery.selectors[category][type]);
      }
      return null;
    },

    help: function() {
      console.log('%c=== GHL Discovery Commands ===', 'color: #06b6d4; font-weight: bold;');
      console.log('');
      console.log('%cGHLDiscovery.report()', 'color: #10b981;', '- Show formatted report in console');
      console.log('%cGHLDiscovery.export()', 'color: #10b981;', '- Copy full JSON to clipboard');
      console.log('%cGHLDiscovery.run()', 'color: #10b981;', '- Manually re-run discovery');
      console.log('%cGHLDiscovery.help()', 'color: #10b981;', '- Show this help');
      console.log('');
      console.log('%cTip:', 'color: #f59e0b;', 'Navigate to different GHL pages to discover more selectors!');
    }
  };

  console.log('%c🔍 GHL Selector Discovery loaded!', 'color: #06b6d4; font-weight: bold; font-size: 16px;');
  console.log('%cType GHLDiscovery.help() for commands', 'color: #64748b;');
  console.log('%cNavigate to different pages, then run GHLDiscovery.report()', 'color: #64748b;');

})();
