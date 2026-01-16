// Builder Mode Toolbar Styles
// These are injected into the embed script for the visual element selector

export const builderToolbarCSS = `
  /* Import distinctive font */
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&display=swap');

  /* ============================
     BUILDER TOOLBAR
     ============================ */
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
    --at-teal-400: #2dd4bf;
    --at-teal-500: #14b8a6;

    position: fixed;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 2px;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.95),
      rgba(248, 250, 252, 0.95)
    );
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(226, 232, 240, 0.8);
    border-radius: 16px;
    padding: 6px;
    box-shadow:
      0 0 0 1px rgba(0, 0, 0, 0.03),
      0 2px 4px rgba(0, 0, 0, 0.02),
      0 8px 16px rgba(0, 0, 0, 0.04),
      0 24px 48px rgba(0, 0, 0, 0.06);
    z-index: 2147483647;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 13px;
    user-select: none;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    animation: at-toolbar-appear 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes at-toolbar-appear {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-12px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0) scale(1);
    }
  }

  #at-builder-toolbar.at-dragging {
    transform: translateX(0) !important;
    left: auto !important;
    cursor: grabbing;
    box-shadow:
      0 0 0 1px rgba(0, 0, 0, 0.03),
      0 4px 8px rgba(0, 0, 0, 0.04),
      0 16px 32px rgba(0, 0, 0, 0.08),
      0 32px 64px rgba(0, 0, 0, 0.12);
  }

  /* Active state - Builder Mode ON */
  #at-builder-toolbar.at-active {
    background: linear-gradient(
      135deg,
      rgba(224, 247, 250, 0.97) 0%,
      rgba(207, 250, 254, 0.97) 50%,
      rgba(236, 254, 255, 0.97) 100%
    );
    border-color: rgba(6, 182, 212, 0.3);
    box-shadow:
      0 0 0 1px rgba(6, 182, 212, 0.1),
      0 2px 4px rgba(6, 182, 212, 0.05),
      0 8px 16px rgba(6, 182, 212, 0.08),
      0 24px 48px rgba(6, 182, 212, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);
  }

  /* ============================
     DRAG HANDLE
     ============================ */
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

  .at-toolbar-drag:hover {
    color: var(--at-slate-400);
    background: rgba(148, 163, 184, 0.1);
  }

  .at-toolbar-drag:active {
    cursor: grabbing;
    color: var(--at-slate-500);
  }

  .at-toolbar-drag svg {
    width: 10px;
    height: 18px;
  }

  /* ============================
     BRAND SECTION
     ============================ */
  .at-toolbar-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 12px 0 4px;
    height: 36px;
    border-radius: 10px;
    transition: background 0.2s ease;
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
    box-shadow:
      0 1px 2px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
  }

  #at-builder-toolbar.at-active .at-toolbar-icon {
    background: linear-gradient(135deg, var(--at-cyan-500), var(--at-teal-500));
    box-shadow:
      0 2px 8px rgba(6, 182, 212, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .at-toolbar-icon svg {
    width: 16px;
    height: 16px;
  }

  .at-icon-target {
    display: none;
  }

  #at-builder-toolbar.at-active .at-icon-gear { display: none; }
  #at-builder-toolbar.at-active .at-icon-target { display: block; }

  .at-toolbar-label {
    font-weight: 600;
    font-size: 13px;
    color: var(--at-slate-700);
    letter-spacing: -0.01em;
    white-space: nowrap;
  }

  #at-builder-toolbar.at-active .at-toolbar-label {
    color: var(--at-cyan-600);
  }

  /* Status text that appears when active */
  .at-toolbar-status {
    display: none;
    align-items: center;
    gap: 6px;
    padding-left: 10px;
    border-left: 1px solid rgba(6, 182, 212, 0.2);
    margin-left: 2px;
  }

  #at-builder-toolbar.at-active .at-toolbar-status {
    display: flex;
  }

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

  /* ============================
     DIVIDER
     ============================ */
  .at-toolbar-divider {
    width: 1px;
    height: 24px;
    background: var(--at-slate-200);
    margin: 0 4px;
    flex-shrink: 0;
  }

  #at-builder-toolbar.at-active .at-toolbar-divider {
    background: rgba(6, 182, 212, 0.2);
  }

  /* ============================
     TOGGLE SWITCH
     ============================ */
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
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.06);
  }

  .at-toggle-btn[aria-checked="true"] .at-toggle-track {
    background: linear-gradient(135deg, var(--at-cyan-400), var(--at-cyan-500));
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      0 2px 8px rgba(6, 182, 212, 0.3);
  }

  .at-toggle-thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 22px;
    height: 22px;
    background: white;
    border-radius: 11px;
    box-shadow:
      0 1px 2px rgba(0, 0, 0, 0.08),
      0 2px 4px rgba(0, 0, 0, 0.06);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .at-toggle-btn[aria-checked="true"] .at-toggle-thumb {
    transform: translateX(20px);
    box-shadow:
      0 1px 2px rgba(0, 0, 0, 0.1),
      0 4px 8px rgba(6, 182, 212, 0.2);
  }

  .at-toggle-btn:hover .at-toggle-thumb {
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.1),
      0 4px 8px rgba(0, 0, 0, 0.08);
  }

  .at-toggle-btn:focus-visible {
    outline: none;
  }

  .at-toggle-btn:focus-visible .at-toggle-track {
    box-shadow:
      inset 0 1px 2px rgba(0, 0, 0, 0.06),
      0 0 0 3px rgba(6, 182, 212, 0.2);
  }

  /* ============================
     CLOSE BUTTON
     ============================ */
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

  .at-toolbar-close:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.08);
  }

  .at-toolbar-close svg {
    width: 14px;
    height: 14px;
    stroke-width: 2.5px;
  }

  /* ============================
     ELEMENT HIGHLIGHTING
     ============================ */
  .at-highlight-element {
    outline: 2px solid var(--at-cyan-500, #06b6d4) !important;
    outline-offset: 2px !important;
    background-color: rgba(6, 182, 212, 0.05) !important;
    transition: outline-color 0.15s ease, background-color 0.15s ease !important;
  }

  /* ============================
     SELECTION POPUP
     ============================ */
  #at-selection-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.95);
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.98),
      rgba(248, 250, 252, 0.98)
    );
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--at-slate-200);
    padding: 28px;
    border-radius: 20px;
    box-shadow:
      0 0 0 1px rgba(0, 0, 0, 0.03),
      0 4px 8px rgba(0, 0, 0, 0.04),
      0 16px 32px rgba(0, 0, 0, 0.08),
      0 32px 64px rgba(0, 0, 0, 0.12);
    z-index: 2147483647;
    max-width: 440px;
    width: 90%;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    opacity: 0;
    animation: at-popup-appear 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes at-popup-appear {
    from {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
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
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  #at-selection-popup h3 {
    margin: 0;
    color: var(--at-slate-900);
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  #at-selection-popup .at-element-preview {
    background: linear-gradient(135deg, var(--at-slate-50), var(--at-slate-100));
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
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  #at-selection-popup .at-fragile-warning {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.2);
    border-radius: 8px;
    margin-bottom: 16px;
    color: #b45309;
    font-size: 12px;
    font-weight: 500;
  }

  #at-selection-popup .at-fragile-warning svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  #at-selection-popup p {
    color: var(--at-slate-500);
    font-size: 13px;
    line-height: 1.5;
    margin: 0 0 20px;
  }

  #at-selection-popup .at-popup-actions {
    display: flex;
    gap: 10px;
  }

  #at-selection-popup button {
    flex: 1;
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
    box-shadow:
      0 1px 2px rgba(0, 0, 0, 0.1),
      0 2px 4px rgba(0, 0, 0, 0.1);
  }

  #at-selection-popup button:hover {
    transform: translateY(-1px);
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.1),
      0 4px 8px rgba(0, 0, 0, 0.15);
  }

  #at-selection-popup button:active {
    transform: translateY(0);
  }

  #at-selection-popup button svg {
    width: 16px;
    height: 16px;
  }

  /* ============================
     KEYBOARD HINT
     ============================ */
  .at-keyboard-hint {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(15, 23, 42, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 10px;
    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
    font-size: 12px;
    color: var(--at-slate-300);
    z-index: 2147483646;
    opacity: 0;
    animation: at-hint-appear 0.5s 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes at-hint-appear {
    from { opacity: 0; transform: translateX(-50%) translateY(10px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  .at-keyboard-hint kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 22px;
    padding: 0 6px;
    background: var(--at-slate-700);
    border: 1px solid var(--at-slate-600);
    border-radius: 5px;
    font-family: inherit;
    font-size: 11px;
    font-weight: 600;
    color: var(--at-slate-200);
  }
`;

// HTML template for the toolbar
export const builderToolbarHTML = `
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
        <path d="M12 2v2"/>
        <path d="M12 20v2"/>
        <path d="m4.93 4.93 1.41 1.41"/>
        <path d="m17.66 17.66 1.41 1.41"/>
        <path d="M2 12h2"/>
        <path d="M20 12h2"/>
        <path d="m6.34 17.66-1.41 1.41"/>
        <path d="m19.07 4.93-1.41 1.41"/>
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
`;

// HTML for keyboard hint
export const keyboardHintHTML = `
  <div class="at-keyboard-hint">
    <kbd>Ctrl</kbd><kbd>Shift</kbd><kbd>B</kbd>
    <span>to toggle builder mode</span>
  </div>
`;

// Selection popup HTML generator
export function generateSelectionPopupHTML(data: {
  displayName: string;
  selector: string;
  tagName: string;
  isFragile: boolean;
}): string {
  const fragileWarning = data.isFragile ? `
    <div class="at-fragile-warning">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>
        <path d="M12 9v4"/>
        <path d="M12 17h.01"/>
      </svg>
      <span>This selector uses element position and may be fragile</span>
    </div>
  ` : '';

  return `
    <div class="at-popup-header">
      <div class="at-popup-icon">✓</div>
      <h3>Element Selected</h3>
    </div>
    <div class="at-element-preview">
      <div class="at-element-name">
        ${escapeHtml(data.displayName)}
        <span class="at-element-tag">${escapeHtml(data.tagName)}</span>
      </div>
      <div class="at-selector-preview">${escapeHtml(data.selector)}</div>
    </div>
    ${fragileWarning}
    <p>The selector has been sent to your tour builder. This tab will close automatically.</p>
    <div class="at-popup-actions">
      <button onclick="document.getElementById('at-selection-popup').remove(); window.close();">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Close & Return
      </button>
    </div>
  `;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
