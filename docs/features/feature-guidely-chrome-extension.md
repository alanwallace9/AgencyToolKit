# Feature: Guidely Chrome Extension

**Status:** Backlog (Phase 6+)
**Priority:** Medium (enhances existing functionality)
**Estimated Development:** 1 week
**Chrome Web Store Approval:** 1-3 weeks (unpredictable)
**Dependencies:** Core Guidely features complete, Showcases feature (optional)
**Replaces:** Builder Mode in embed script (can be deprecated after rollout)

---

## Executive Summary

A Chrome extension that allows agency owners to **capture tour steps from any website** - not just sites with the embed script installed. The extension captures screenshots, element selectors, and click coordinates, then sends them to Guidely for editing.

### Why Build This?

| Current (Builder Mode) | With Extension |
|------------------------|----------------|
| Only works on GHL (where embed script exists) | Works on **any website** |
| No screenshots captured | Screenshots captured automatically |
| Manual hotspot positioning | Auto-positioned where you clicked |
| ~800 lines of code in embed.js | Cleaner separation of concerns |

### Launch Strategy

| Phase | Timeline | What Ships |
|-------|----------|------------|
| **Phase 1: Now** | Already done | Builder Mode (current) |
| **Phase 2: Build** | +1 week | Extension development |
| **Phase 3: Submit** | Same week | Submit to Chrome Web Store |
| **Phase 4: Wait** | +1-3 weeks | Builder Mode still works |
| **Phase 5: Approved** | When ready | Promote extension, deprecate Builder Mode |

**Users are never blocked.** Builder Mode works throughout.

---

## User Stories

1. **As an agency owner**, I want to capture tour steps from any website so I can create tours for platforms beyond GHL.
2. **As an agency owner**, I want screenshots captured automatically so I have visual references for each step.
3. **As an agency owner**, I want hotspots auto-positioned where I clicked so I don't have to manually place them.
4. **As an agency owner**, I want to create Showcases (static demos) for sites I don't control.
5. **As an agency owner**, I want a simple "Start Recording → Click → Done" workflow.
6. **As an agency owner**, I want my captured steps to appear in Guidely ready to edit.

---

## User Flow

### Recording a Tour/Showcase

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: Start Recording                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  User navigates to any website (GHL, competitor, their own SaaS, etc.)      │
│                                                                             │
│  User clicks Guidely extension icon in Chrome toolbar                       │
│                                                                             │
│  ┌─────────────────────────────────────┐                                    │
│  │  🎯 Guidely Capture                 │                                    │
│  │  ─────────────────────────────────  │                                    │
│  │                                     │                                    │
│  │  Ready to record tour steps.        │                                    │
│  │                                     │                                    │
│  │  [ Start Recording ]                │                                    │
│  │                                     │                                    │
│  │  ─────────────────────────────────  │                                    │
│  │  Connected: alan@agency.com         │                                    │
│  └─────────────────────────────────────┘                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 2: Recording Mode Active                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Extension injects floating toolbar (similar to current Builder Mode)       │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  🔴 Recording   Step 0 captured   [ Capture Step ]  [ Done ]        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  User navigates the site normally                                           │
│                                                                             │
│  When user clicks "Capture Step" OR clicks an element:                      │
│  - Screenshot captured                                                      │
│  - Element selector captured                                                │
│  - Click coordinates captured                                               │
│  - Counter increments ("Step 1 captured")                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 3: Finish Recording                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  User clicks "Done"                                                         │
│                                                                             │
│  ┌─────────────────────────────────────┐                                    │
│  │  🎯 Guidely Capture                 │                                    │
│  │  ─────────────────────────────────  │                                    │
│  │                                     │                                    │
│  │  ✅ 5 steps captured!               │                                    │
│  │                                     │                                    │
│  │  Save as:                           │                                    │
│  │  ○ Tour (live playback)             │                                    │
│  │  ● Showcase (screenshot demo)       │                                    │
│  │                                     │                                    │
│  │  Name: [GHL Pipeline Walkthrough ]  │                                    │
│  │                                     │                                    │
│  │  [ Upload & Edit in Guidely ]       │                                    │
│  │                                     │                                    │
│  └─────────────────────────────────────┘                                    │
│                                                                             │
│  Extension uploads screenshots to Vercel Blob                               │
│  Extension creates Tour/Showcase via API                                    │
│  Browser redirects to Guidely builder with new item open                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 4: Edit in Guidely                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  User lands in Guidely builder with all steps pre-populated:                │
│  - Screenshots visible as reference                                         │
│  - Hotspots pre-positioned where they clicked                               │
│  - Element selectors pre-filled (for Tours)                                 │
│                                                                             │
│  User adds:                                                                  │
│  - Titles and descriptions                                                  │
│  - Adjusts tooltip positions if needed                                      │
│  - Chooses tooltip vs modal                                                 │
│  - Applies theme                                                            │
│  - Sets targeting rules                                                     │
│                                                                             │
│  User publishes when ready                                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## What Gets Captured Per Step

| Data | Type | Example | Used For |
|------|------|---------|----------|
| `screenshot` | PNG blob | (binary image data) | Showcase playback, visual reference |
| `selector` | String | `#submit-btn` | Tour playback (Driver.js) |
| `selectorType` | Enum | `id` / `class` / `data-attr` / `path` | Selector reliability indicator |
| `clickX` | Number (%) | `45.2` | Hotspot X position |
| `clickY` | Number (%) | `32.8` | Hotspot Y position |
| `pageUrl` | String | `https://app.ghl.com/dashboard` | URL targeting |
| `pageTitle` | String | `Dashboard - GHL` | Auto-fill step title |
| `elementText` | String | `"Submit"` | Auto-fill step title |
| `viewportWidth` | Number | `1920` | Responsive calculations |
| `viewportHeight` | Number | `1080` | Responsive calculations |
| `timestamp` | ISO string | `2026-02-01T10:30:00Z` | Ordering |

---

## Technical Architecture

### Extension Structure (Manifest V3)

```
guidely-extension/
├── manifest.json           # Extension configuration
├── background.js           # Service worker (handles auth, API calls)
├── content.js              # Injected into pages (capture UI)
├── popup/
│   ├── popup.html          # Extension popup UI
│   ├── popup.css
│   └── popup.js
├── assets/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
└── lib/
    ├── selector-generator.js   # CSS selector logic (from Builder Mode)
    └── screenshot.js           # Screenshot capture utilities
```

### Manifest.json

```json
{
  "manifest_version": 3,
  "name": "Guidely Capture",
  "version": "1.0.0",
  "description": "Capture interactive tours and demos from any website",

  "permissions": [
    "activeTab",
    "storage",
    "tabs"
  ],

  "host_permissions": [
    "<all_urls>"
  ],

  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "assets/icon-16.png",
      "48": "assets/icon-48.png",
      "128": "assets/icon-128.png"
    }
  },

  "background": {
    "service_worker": "background.js"
  },

  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["content.css"],
      "run_at": "document_idle"
    }
  ],

  "icons": {
    "16": "assets/icon-16.png",
    "48": "assets/icon-48.png",
    "128": "assets/icon-128.png"
  }
}
```

### Content Script (content.js)

The content script handles the recording UI and element capture:

```javascript
// Simplified structure - actual implementation would be more detailed

class GuidelyCapture {
  constructor() {
    this.isRecording = false;
    this.steps = [];
    this.toolbar = null;
    this.highlightOverlay = null;
  }

  // Start recording mode
  startRecording() {
    this.isRecording = true;
    this.steps = [];
    this.injectToolbar();
    this.attachListeners();
  }

  // Stop recording mode
  stopRecording() {
    this.isRecording = false;
    this.removeToolbar();
    this.detachListeners();
    return this.steps;
  }

  // Inject floating toolbar
  injectToolbar() {
    this.toolbar = document.createElement('div');
    this.toolbar.id = 'guidely-capture-toolbar';
    this.toolbar.innerHTML = `
      <div class="guidely-toolbar-inner">
        <span class="guidely-status">🔴 Recording</span>
        <span class="guidely-count">Step ${this.steps.length} captured</span>
        <button id="guidely-capture-btn">Capture Step</button>
        <button id="guidely-done-btn">Done</button>
      </div>
    `;
    document.body.appendChild(this.toolbar);

    // Button handlers
    document.getElementById('guidely-capture-btn')
      .addEventListener('click', () => this.captureStep());
    document.getElementById('guidely-done-btn')
      .addEventListener('click', () => this.finishRecording());
  }

  // Attach hover/click listeners
  attachListeners() {
    document.addEventListener('mouseover', this.handleHover, true);
    document.addEventListener('click', this.handleClick, true);
  }

  // Handle hover - show highlight
  handleHover = (e) => {
    if (!this.isRecording) return;
    if (this.isToolbarElement(e.target)) return;

    this.showHighlight(e.target);
  }

  // Handle click - capture step
  handleClick = (e) => {
    if (!this.isRecording) return;
    if (this.isToolbarElement(e.target)) return;

    e.preventDefault();
    e.stopPropagation();

    this.captureStep(e.target, e.clientX, e.clientY);
  }

  // Capture a step
  async captureStep(element = null, clickX = null, clickY = null) {
    // Request screenshot from background script
    const screenshot = await chrome.runtime.sendMessage({
      action: 'captureScreenshot'
    });

    // Generate selector
    const selector = element ? this.generateSelector(element) : null;

    // Calculate click position as percentage
    const xPercent = clickX ? (clickX / window.innerWidth) * 100 : 50;
    const yPercent = clickY ? (clickY / window.innerHeight) * 100 : 50;

    // Create step data
    const step = {
      id: `step-${Date.now()}`,
      screenshot: screenshot,
      selector: selector?.selector || null,
      selectorType: selector?.type || null,
      clickX: xPercent,
      clickY: yPercent,
      pageUrl: window.location.href,
      pageTitle: document.title,
      elementText: element?.textContent?.trim().substring(0, 50) || null,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      timestamp: new Date().toISOString()
    };

    this.steps.push(step);
    this.updateToolbarCount();
    this.showCaptureConfirmation();
  }

  // Generate CSS selector for element (reuse logic from Builder Mode)
  generateSelector(element) {
    // Priority: ID > data-attributes > unique class > path

    // 1. ID selector
    if (element.id) {
      return { selector: `#${CSS.escape(element.id)}`, type: 'id' };
    }

    // 2. Data attribute selector
    for (const attr of element.attributes) {
      if (attr.name.startsWith('data-') && attr.value) {
        return {
          selector: `[${attr.name}="${CSS.escape(attr.value)}"]`,
          type: 'data-attr'
        };
      }
    }

    // 3. Unique class selector
    if (element.classList.length > 0) {
      for (const cls of element.classList) {
        const selector = `.${CSS.escape(cls)}`;
        if (document.querySelectorAll(selector).length === 1) {
          return { selector, type: 'class' };
        }
      }
    }

    // 4. Path-based selector (fragile)
    return {
      selector: this.generatePathSelector(element),
      type: 'path'
    };
  }

  // Generate path-based selector
  generatePathSelector(element) {
    const path = [];
    let current = element;

    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();

      if (current.id) {
        selector = `#${CSS.escape(current.id)}`;
        path.unshift(selector);
        break;
      }

      const siblings = current.parentElement?.children || [];
      if (siblings.length > 1) {
        const index = Array.from(siblings).indexOf(current) + 1;
        selector += `:nth-child(${index})`;
      }

      path.unshift(selector);
      current = current.parentElement;
    }

    return path.join(' > ');
  }

  // Finish recording
  async finishRecording() {
    const steps = this.stopRecording();

    // Send to background script for upload
    chrome.runtime.sendMessage({
      action: 'finishRecording',
      steps: steps
    });
  }
}

// Initialize
const capture = new GuidelyCapture();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startRecording') {
    capture.startRecording();
    sendResponse({ success: true });
  }
});
```

### Background Script (background.js)

Handles authentication, screenshot capture, and API communication:

```javascript
// Configuration
const GUIDELY_API_BASE = 'https://agencytoolkit.com/api';
// const GUIDELY_API_BASE = 'http://localhost:3000/api'; // Dev

// Store auth token
let authToken = null;

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'captureScreenshot':
      captureScreenshot(sender.tab.id).then(sendResponse);
      return true; // Will respond asynchronously

    case 'finishRecording':
      handleFinishRecording(message.steps, sender.tab).then(sendResponse);
      return true;

    case 'authenticate':
      authenticateUser(message.token).then(sendResponse);
      return true;

    case 'getAuthStatus':
      sendResponse({ authenticated: !!authToken });
      return false;
  }
});

// Capture screenshot of current tab
async function captureScreenshot(tabId) {
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(null, {
      format: 'png',
      quality: 90
    });
    return { success: true, data: dataUrl };
  } catch (error) {
    console.error('Screenshot failed:', error);
    return { success: false, error: error.message };
  }
}

// Handle finish recording - upload to Guidely
async function handleFinishRecording(steps, tab) {
  try {
    // Upload screenshots to Vercel Blob
    const uploadedSteps = await Promise.all(
      steps.map(async (step, index) => {
        if (step.screenshot?.data) {
          const blob = dataURLtoBlob(step.screenshot.data);
          const uploadResult = await uploadScreenshot(blob, `step-${index}`);
          return {
            ...step,
            screenshot_url: uploadResult.url,
            screenshot: undefined // Remove base64 data
          };
        }
        return step;
      })
    );

    // Create tour/showcase in Guidely
    const response = await fetch(`${GUIDELY_API_BASE}/extension/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        steps: uploadedSteps,
        source_url: tab.url,
        source_title: tab.title
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();

    // Open Guidely builder with new item
    chrome.tabs.create({
      url: `${GUIDELY_API_BASE.replace('/api', '')}/g/tours/${result.id}`
    });

    return { success: true, id: result.id };
  } catch (error) {
    console.error('Upload failed:', error);
    return { success: false, error: error.message };
  }
}

// Upload screenshot to Vercel Blob
async function uploadScreenshot(blob, filename) {
  const formData = new FormData();
  formData.append('file', blob, `${filename}.png`);

  const response = await fetch(`${GUIDELY_API_BASE}/extension/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }

  return response.json();
}

// Convert data URL to Blob
function dataURLtoBlob(dataURL) {
  const parts = dataURL.split(',');
  const mime = parts[0].match(/:(.*?);/)[1];
  const binary = atob(parts[1]);
  const array = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }

  return new Blob([array], { type: mime });
}

// Authenticate user
async function authenticateUser(token) {
  try {
    // Verify token with Guidely API
    const response = await fetch(`${GUIDELY_API_BASE}/extension/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });

    if (response.ok) {
      authToken = token;
      await chrome.storage.local.set({ authToken: token });
      return { success: true };
    }

    return { success: false, error: 'Invalid token' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Load stored auth token on startup
chrome.storage.local.get(['authToken'], (result) => {
  if (result.authToken) {
    authToken = result.authToken;
  }
});
```

### Popup UI (popup/popup.html)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      width: 320px;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      color: #1a1a1a;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }

    .header img {
      width: 24px;
      height: 24px;
    }

    .header h1 {
      font-size: 16px;
      font-weight: 600;
    }

    .status {
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .status.connected {
      background: #ecfdf5;
      color: #047857;
    }

    .status.disconnected {
      background: #fef2f2;
      color: #dc2626;
    }

    .btn {
      width: 100%;
      padding: 12px 16px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-primary {
      background: #2563eb;
      color: white;
    }

    .btn-primary:hover {
      background: #1d4ed8;
    }

    .btn-primary:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
      margin-top: 8px;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    .auth-section {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }

    .auth-section input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .help-text {
      font-size: 12px;
      color: #6b7280;
      margin-top: 12px;
    }

    .help-text a {
      color: #2563eb;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="../assets/icon-48.png" alt="Guidely">
    <h1>Guidely Capture</h1>
  </div>

  <div id="connected-view" style="display: none;">
    <div class="status connected">
      ✓ Connected as <span id="user-email"></span>
    </div>

    <button id="start-btn" class="btn btn-primary">
      Start Recording
    </button>

    <button id="open-guidely-btn" class="btn btn-secondary">
      Open Guidely Dashboard
    </button>

    <p class="help-text">
      Click "Start Recording" then navigate and click on elements you want to capture.
    </p>
  </div>

  <div id="disconnected-view" style="display: none;">
    <div class="status disconnected">
      Not connected to Guidely
    </div>

    <div class="auth-section">
      <p style="margin-bottom: 12px;">Enter your API token to connect:</p>
      <input type="text" id="token-input" placeholder="Paste your API token">
      <button id="connect-btn" class="btn btn-primary">
        Connect
      </button>
    </div>

    <p class="help-text">
      Get your API token from <a href="https://agencytoolkit.com/settings" target="_blank">Guidely Settings</a>
    </p>
  </div>

  <div id="recording-view" style="display: none;">
    <div class="status" style="background: #fef3c7; color: #92400e;">
      🔴 Recording in progress...
    </div>

    <p style="margin: 16px 0;">
      <strong id="step-count">0</strong> steps captured
    </p>

    <button id="stop-btn" class="btn btn-primary" style="background: #dc2626;">
      Stop Recording
    </button>

    <p class="help-text">
      Click on elements in the page to capture them as tour steps.
    </p>
  </div>

  <script src="popup.js"></script>
</body>
</html>
```

### Popup Script (popup/popup.js)

```javascript
// DOM elements
const connectedView = document.getElementById('connected-view');
const disconnectedView = document.getElementById('disconnected-view');
const recordingView = document.getElementById('recording-view');
const userEmail = document.getElementById('user-email');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const connectBtn = document.getElementById('connect-btn');
const tokenInput = document.getElementById('token-input');
const openGuidelyBtn = document.getElementById('open-guidely-btn');
const stepCount = document.getElementById('step-count');

// State
let isRecording = false;

// Initialize
async function init() {
  const authStatus = await chrome.runtime.sendMessage({ action: 'getAuthStatus' });

  if (authStatus.authenticated) {
    showConnectedView();
  } else {
    showDisconnectedView();
  }
}

function showConnectedView() {
  connectedView.style.display = 'block';
  disconnectedView.style.display = 'none';
  recordingView.style.display = 'none';
}

function showDisconnectedView() {
  connectedView.style.display = 'none';
  disconnectedView.style.display = 'block';
  recordingView.style.display = 'none';
}

function showRecordingView() {
  connectedView.style.display = 'none';
  disconnectedView.style.display = 'none';
  recordingView.style.display = 'block';
}

// Connect button
connectBtn.addEventListener('click', async () => {
  const token = tokenInput.value.trim();
  if (!token) return;

  connectBtn.disabled = true;
  connectBtn.textContent = 'Connecting...';

  const result = await chrome.runtime.sendMessage({
    action: 'authenticate',
    token
  });

  if (result.success) {
    showConnectedView();
  } else {
    alert('Connection failed: ' + result.error);
    connectBtn.disabled = false;
    connectBtn.textContent = 'Connect';
  }
});

// Start recording button
startBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  await chrome.tabs.sendMessage(tab.id, { action: 'startRecording' });

  isRecording = true;
  showRecordingView();
});

// Stop recording button
stopBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  await chrome.tabs.sendMessage(tab.id, { action: 'stopRecording' });

  isRecording = false;
  showConnectedView();
});

// Open Guidely button
openGuidelyBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://agencytoolkit.com/g/tours' });
});

// Listen for step count updates
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'stepCaptured') {
    stepCount.textContent = message.count;
  }
});

// Initialize on load
init();
```

---

## API Endpoints (Guidely Backend)

New endpoints needed to support the extension:

### POST `/api/extension/verify`

Verify extension authentication token.

```typescript
// Request
{
  token: string; // API token from settings page
}

// Response
{
  valid: boolean;
  user: {
    email: string;
    agency_id: string;
  } | null;
}
```

### POST `/api/extension/upload`

Upload a screenshot to Vercel Blob.

```typescript
// Request: multipart/form-data
// - file: PNG blob

// Response
{
  url: string;      // Vercel Blob URL
  filename: string;
}
```

### POST `/api/extension/capture`

Create a new tour or showcase from captured steps.

```typescript
// Request
{
  steps: Array<{
    screenshot_url: string;
    selector: string | null;
    selectorType: 'id' | 'class' | 'data-attr' | 'path' | null;
    clickX: number;
    clickY: number;
    pageUrl: string;
    pageTitle: string;
    elementText: string | null;
    viewportWidth: number;
    viewportHeight: number;
    timestamp: string;
  }>;
  source_url: string;
  source_title: string;
  type?: 'tour' | 'showcase'; // Default: 'tour'
}

// Response
{
  id: string;       // Tour or Showcase ID
  type: 'tour' | 'showcase';
  redirect_url: string;
}
```

### GET `/api/extension/token`

Generate API token for extension authentication (called from Settings page).

```typescript
// Response
{
  token: string;    // JWT or random token
  expires_at: string | null;
}
```

---

## Settings Page Integration

Add extension token management to `/settings`:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  CHROME EXTENSION                                                            │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Capture tours from any website using our Chrome extension.                  │
│                                                                              │
│  [ Install Extension ]  (links to Chrome Web Store)                          │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  API Token (for extension authentication):                                   │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ gly_abc123xyz789...                                              [📋] │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  [ Regenerate Token ]                                                        │
│                                                                              │
│  ⚠️ Keep this token secret. It allows the extension to access your account. │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Builder Integration

When extension data arrives, populate the tour builder:

### Tour Steps with Extension Data

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 1                                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────┐   Title: [Click to add contact        ]       │
│  │                         │                                                │
│  │   [Screenshot from      │   Description:                                 │
│  │    extension with       │   ┌────────────────────────────────────┐      │
│  │    hotspot overlay]     │   │                                    │      │
│  │                         │   └────────────────────────────────────┘      │
│  │         ● ←hotspot      │                                                │
│  │                         │   Element: [data-btn="add-contact"] ✓         │
│  └─────────────────────────┘   Position: ○ Top ● Bottom ○ Left ○ Right     │
│                                                                             │
│  ⚡ Captured from: https://app.gohighlevel.com/contacts                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Visual Reference Toggle

Since we now have screenshots, add a toggle to show/hide them:

```
[ ] Show screenshot reference    (toggle in builder toolbar)
```

When enabled, each step shows the captured screenshot as context.

---

## Database Changes

### New column on `agencies` table

```sql
ALTER TABLE agencies
ADD COLUMN extension_token TEXT,
ADD COLUMN extension_token_created_at TIMESTAMPTZ;
```

### New column on `tours` table

```sql
ALTER TABLE tours
ADD COLUMN source TEXT DEFAULT 'builder'
  CHECK (source IN ('builder', 'extension'));
```

### Step schema enhancement

Add screenshot reference to tour steps:

```typescript
interface TourStep {
  // ... existing fields

  // New fields from extension
  screenshot_url?: string;      // Vercel Blob URL
  captured_selector?: string;   // Original captured selector
  captured_click_x?: number;    // Original click X %
  captured_click_y?: number;    // Original click Y %
  captured_url?: string;        // URL where captured
}
```

---

## Implementation Phases

### Phase 1: Core Extension (3-4 days)

- [ ] Extension manifest and structure
- [ ] Content script with recording UI
- [ ] Screenshot capture
- [ ] Element selector generation
- [ ] Click coordinate tracking
- [ ] Background script messaging

### Phase 2: Guidely Integration (2-3 days)

- [ ] `/api/extension/verify` endpoint
- [ ] `/api/extension/upload` endpoint (Vercel Blob)
- [ ] `/api/extension/capture` endpoint
- [ ] Settings page token management
- [ ] Tour builder screenshot display

### Phase 3: Polish (1-2 days)

- [ ] Popup UI refinement
- [ ] Error handling
- [ ] Edge cases (iframes, shadow DOM)
- [ ] Recording state persistence

### Phase 4: Submission (1-3 weeks wait)

- [ ] Chrome Web Store assets (screenshots, description)
- [ ] Privacy policy page
- [ ] Submit for review
- [ ] Address reviewer feedback if any

---

## Chrome Web Store Requirements

### Required Assets

| Asset | Size | Notes |
|-------|------|-------|
| Icon | 128x128 | PNG, used in store listing |
| Promo tile (small) | 440x280 | PNG, store listing |
| Screenshots | 1280x800 or 640x400 | 1-5 screenshots |
| Marquee promo tile | 1400x560 | Optional, featured listing |

### Required Pages

1. **Privacy Policy** - What data collected, how used
2. **Terms of Service** - Optional but recommended

### Store Listing Copy

**Name:** Guidely Capture

**Short Description (132 chars max):**
Capture interactive product tours and demos from any website. Works with Guidely.

**Detailed Description:**
```
Guidely Capture lets you create interactive product tours and demos by simply clicking through any website.

FEATURES:
• Capture from any website - not just sites you control
• Automatic screenshots at each step
• Smart element detection for interactive tours
• One-click upload to Guidely
• Works with Tours (live playback) and Showcases (static demos)

HOW IT WORKS:
1. Click the Guidely icon
2. Hit "Start Recording"
3. Click through the site as if you're giving a demo
4. Click "Done" - steps upload to Guidely automatically
5. Add titles and descriptions in the Guidely builder
6. Publish your tour or showcase

REQUIREMENTS:
• Guidely account (free or Pro)
• Guidely extension token (from Settings page)

Built by Agency Toolkit for GHL agencies and SaaS teams.
```

---

## Security Considerations

| Concern | Mitigation |
|---------|------------|
| Token exposure | Store in `chrome.storage.local` (encrypted by Chrome) |
| Screenshot of sensitive data | User controls what they capture; add warning in UI |
| Cross-origin requests | Use extension permissions, not CORS |
| Token theft | Tokens are per-agency, can be regenerated |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Extension installs | 50+ in first month |
| Tours created via extension | 30% of new tours |
| Time to first capture | < 2 minutes from install |
| Store rating | 4+ stars |

---

## Open Questions

1. **Keyboard shortcut?** - Global shortcut to start/stop recording?
2. **Firefox support?** - Same extension can support Firefox with minor changes
3. **Mobile capture?** - Not possible with extension; could add manual upload fallback
4. **Offline mode?** - Cache captures locally, upload when online?

---

## Appendix: Migrating from Builder Mode

Once extension is stable and adopted:

### Phase 1: Soft Deprecation
- Add banner in Builder Mode: "Try our Chrome extension for faster capture"
- Link to extension in element selector field

### Phase 2: Feature Parity Confirmation
- Ensure extension can do everything Builder Mode does
- Gather user feedback

### Phase 3: Hard Deprecation
- Remove Builder Mode code from embed.js (~800 lines)
- Redirect Builder Mode URLs to extension install page

### Code to Remove

```javascript
// In embed.js - all of this can go:
function detectBuilderMode() { ... }
function initBuilderMode() { ... }
function createBuilderToolbar() { ... }
function handleBuilderHover() { ... }
function handleBuilderClick() { ... }
function generateSelector() { ... }
function sendToParent() { ... }
// ~800 lines total
```

---

## Approval Checklist

- [ ] Feature scope confirmed
- [ ] Launch strategy approved (Builder Mode → Extension transition)
- [ ] Security review passed
- [ ] Chrome Web Store requirements understood
- [ ] API endpoints designed
- [ ] Database changes reviewed

**Ready for implementation when prioritized.**
