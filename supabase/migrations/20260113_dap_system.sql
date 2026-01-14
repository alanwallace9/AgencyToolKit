-- Digital Adoption Platform (DAP) System Migration
-- Feature 18: Tours List + Full DAP Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- ADD GHL URL TO CUSTOMERS (for builder mode)
-- ============================================

ALTER TABLE customers ADD COLUMN IF NOT EXISTS ghl_url TEXT;
-- Optional override for custom GHL domains. If null, construct from ghl_location_id

-- ============================================
-- ENHANCE TOURS TABLE
-- ============================================

-- Add new columns to existing tours table
ALTER TABLE tours ADD COLUMN IF NOT EXISTS subaccount_id UUID REFERENCES customers(id) ON DELETE SET NULL;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'archived'));
ALTER TABLE tours ADD COLUMN IF NOT EXISTS priority INTEGER NOT NULL DEFAULT 10;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{
  "autoplay": true,
  "remember_progress": true,
  "show_progress": true,
  "progress_style": "dots",
  "allow_skip": false,
  "show_close": true,
  "close_on_outside_click": false,
  "frequency": {"type": "once"}
}'::jsonb;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS targeting JSONB NOT NULL DEFAULT '{
  "url_targeting": {"mode": "all", "patterns": []},
  "element_condition": null,
  "user_targeting": {"type": "all"},
  "devices": ["desktop", "tablet", "mobile"]
}'::jsonb;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS theme_id UUID;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS created_by TEXT;

-- Update is_active to derive from status (for backwards compatibility)
-- Existing is_active=true tours become status='live'
UPDATE tours SET status = 'live' WHERE is_active = true AND status = 'draft';
UPDATE tours SET status = 'archived' WHERE is_active = false;

-- ============================================
-- TOUR THEMES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS tour_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,

  -- Color scheme
  colors JSONB NOT NULL DEFAULT '{
    "primary": "#3b82f6",
    "secondary": "#64748b",
    "background": "#ffffff",
    "text": "#1f2937",
    "text_secondary": "#6b7280",
    "border": "#e5e7eb",
    "overlay": "rgba(0,0,0,0.5)"
  }'::jsonb,

  -- Typography
  typography JSONB NOT NULL DEFAULT '{
    "font_family": "system-ui, -apple-system, sans-serif",
    "title_size": "18px",
    "body_size": "14px",
    "line_height": "1.5"
  }'::jsonb,

  -- Borders
  borders JSONB NOT NULL DEFAULT '{
    "radius": "8px",
    "width": "1px",
    "style": "solid"
  }'::jsonb,

  -- Shadows
  shadows JSONB NOT NULL DEFAULT '{
    "tooltip": "0 4px 12px rgba(0,0,0,0.15)",
    "modal": "0 20px 60px rgba(0,0,0,0.3)"
  }'::jsonb,

  -- Button styles
  buttons JSONB NOT NULL DEFAULT '{
    "primary": {
      "background": "#3b82f6",
      "text": "#ffffff",
      "border": "transparent",
      "hover_background": "#2563eb",
      "hover_text": "#ffffff",
      "padding": "8px 16px",
      "border_radius": "6px"
    },
    "secondary": {
      "background": "transparent",
      "text": "#6b7280",
      "border": "#e5e7eb",
      "hover_background": "#f3f4f6",
      "hover_text": "#1f2937",
      "padding": "8px 16px",
      "border_radius": "6px"
    }
  }'::jsonb,

  -- Advanced customization
  custom_css TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key to tours
ALTER TABLE tours ADD CONSTRAINT fk_tours_theme
  FOREIGN KEY (theme_id) REFERENCES tour_themes(id) ON DELETE SET NULL;

-- ============================================
-- TOUR ANALYTICS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS tour_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,

  -- Event type
  event_type TEXT NOT NULL CHECK (event_type IN (
    'view',        -- Tour started
    'step_view',   -- Step viewed
    'complete',    -- Tour completed
    'dismiss',     -- Tour dismissed (X clicked)
    'skip',        -- Step or tour skipped
    'click'        -- Button/link clicked
  )),

  -- Event context
  step_id TEXT,
  step_order INTEGER,

  -- User identification (anonymous)
  session_id TEXT NOT NULL,
  user_identifier TEXT,  -- Optional: agency can pass user ID

  -- Context
  url TEXT,
  device_type TEXT CHECK (device_type IN ('desktop', 'tablet', 'mobile')),

  -- Additional metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- CHECKLISTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  subaccount_id UUID REFERENCES customers(id) ON DELETE SET NULL,

  -- Basic info
  name TEXT NOT NULL,
  title TEXT NOT NULL,  -- Displayed to users
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'archived')),

  -- Items (array of checklist items)
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Item structure: {
  --   id: string,
  --   order: number,
  --   title: string,
  --   description?: string,
  --   action: { type: 'tour'|'url'|'js_event'|'none', tour_id?, url?, event_name? },
  --   completion_trigger: { type: 'tour_complete'|'url_visited'|'element_clicked'|'manual'|'js_event', ... }
  -- }

  -- Targeting (reuses tour targeting structure)
  targeting JSONB NOT NULL DEFAULT '{
    "url_targeting": {"mode": "all", "patterns": []},
    "user_targeting": {"type": "all"},
    "devices": ["desktop", "tablet", "mobile"]
  }'::jsonb,

  -- Widget settings
  widget JSONB NOT NULL DEFAULT '{
    "position": "bottom-right",
    "collapsed_by_default": false,
    "show_progress": true,
    "hide_when_complete": true
  }'::jsonb,

  -- Completion action
  on_complete JSONB DEFAULT '{"type": "confetti"}'::jsonb,

  theme_id UUID REFERENCES tour_themes(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- SMART TIPS (TOOLTIPS) TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS smart_tips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  subaccount_id UUID REFERENCES customers(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'archived')),

  -- Target element
  element JSONB NOT NULL,
  -- Structure: { selector: string, metadata?: { tagName, text, attributes, parentSelector } }

  -- Content
  content TEXT NOT NULL,

  -- Trigger behavior
  trigger TEXT NOT NULL DEFAULT 'hover' CHECK (trigger IN ('hover', 'click', 'focus')),

  -- Positioning
  position TEXT NOT NULL DEFAULT 'auto' CHECK (position IN ('top', 'right', 'bottom', 'left', 'auto')),

  -- Targeting
  targeting JSONB NOT NULL DEFAULT '{
    "url_targeting": {"mode": "all", "patterns": []},
    "user_targeting": {"type": "all"},
    "devices": ["desktop", "tablet", "mobile"]
  }'::jsonb,

  theme_id UUID REFERENCES tour_themes(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- BANNERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  subaccount_id UUID REFERENCES customers(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'archived')),

  -- Content
  content TEXT NOT NULL,

  -- Visual settings
  position TEXT NOT NULL DEFAULT 'top' CHECK (position IN ('top', 'bottom')),
  style TEXT NOT NULL DEFAULT 'info' CHECK (style IN ('info', 'success', 'warning', 'error', 'custom')),
  dismissible BOOLEAN NOT NULL DEFAULT true,

  -- Action button (optional)
  action JSONB,
  -- Structure: { label: string, type: 'url'|'tour'|'dismiss', url?, tour_id? }

  -- Targeting
  targeting JSONB NOT NULL DEFAULT '{
    "url_targeting": {"mode": "all", "patterns": []},
    "user_targeting": {"type": "all"},
    "devices": ["desktop", "tablet", "mobile"]
  }'::jsonb,

  -- Scheduling
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,

  theme_id UUID REFERENCES tour_themes(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- RESOURCE CENTERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS resource_centers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  subaccount_id UUID REFERENCES customers(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'archived')),

  -- Widget settings
  widget JSONB NOT NULL DEFAULT '{
    "position": "bottom-right",
    "icon": "help",
    "custom_icon_url": null,
    "label": null
  }'::jsonb,

  -- Sections
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Section structure: {
  --   id: string,
  --   order: number,
  --   title: string,
  --   type: 'tours'|'links'|'checklist',
  --   tour_ids?: string[],
  --   links?: { id, label, url, icon?, new_tab }[],
  --   checklist_id?: string
  -- }

  -- Search
  search_enabled BOOLEAN NOT NULL DEFAULT true,

  -- Targeting
  targeting JSONB NOT NULL DEFAULT '{
    "url_targeting": {"mode": "all", "patterns": []},
    "user_targeting": {"type": "all"},
    "devices": ["desktop", "tablet", "mobile"]
  }'::jsonb,

  theme_id UUID REFERENCES tour_themes(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TOUR TEMPLATES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS tour_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,  -- NULL = system template

  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'custom' CHECK (category IN ('system', 'custom')),

  -- Template content (same structure as tour)
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Preview image
  preview_image_url TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- USER TOUR STATE TABLE (for progress tracking)
-- ============================================

CREATE TABLE IF NOT EXISTS user_tour_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,

  -- User identification
  user_identifier TEXT NOT NULL,  -- Could be session_id or user-provided ID

  -- Progress state
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'dismissed')),
  current_step INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,

  -- Step history
  step_history JSONB DEFAULT '[]'::jsonb,
  -- Structure: [{ step_id, viewed_at, completed_at? }]

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: one state per user per tour
  UNIQUE(tour_id, user_identifier)
);

-- ============================================
-- INDEXES
-- ============================================

-- Tour themes indexes
CREATE INDEX IF NOT EXISTS idx_tour_themes_agency_id ON tour_themes(agency_id);

-- Tour analytics indexes
CREATE INDEX IF NOT EXISTS idx_tour_analytics_agency_id ON tour_analytics(agency_id);
CREATE INDEX IF NOT EXISTS idx_tour_analytics_tour_id ON tour_analytics(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_analytics_event_type ON tour_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_tour_analytics_created_at ON tour_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tour_analytics_session_id ON tour_analytics(session_id);

-- Checklists indexes
CREATE INDEX IF NOT EXISTS idx_checklists_agency_id ON checklists(agency_id);
CREATE INDEX IF NOT EXISTS idx_checklists_status ON checklists(status);

-- Smart tips indexes
CREATE INDEX IF NOT EXISTS idx_smart_tips_agency_id ON smart_tips(agency_id);
CREATE INDEX IF NOT EXISTS idx_smart_tips_status ON smart_tips(status);

-- Banners indexes
CREATE INDEX IF NOT EXISTS idx_banners_agency_id ON banners(agency_id);
CREATE INDEX IF NOT EXISTS idx_banners_status ON banners(status);
CREATE INDEX IF NOT EXISTS idx_banners_dates ON banners(start_date, end_date);

-- Resource centers indexes
CREATE INDEX IF NOT EXISTS idx_resource_centers_agency_id ON resource_centers(agency_id);
CREATE INDEX IF NOT EXISTS idx_resource_centers_status ON resource_centers(status);

-- Tour templates indexes
CREATE INDEX IF NOT EXISTS idx_tour_templates_agency_id ON tour_templates(agency_id);
CREATE INDEX IF NOT EXISTS idx_tour_templates_category ON tour_templates(category);

-- User tour state indexes
CREATE INDEX IF NOT EXISTS idx_user_tour_state_tour_id ON user_tour_state(tour_id);
CREATE INDEX IF NOT EXISTS idx_user_tour_state_user ON user_tour_state(user_identifier);

-- Tours new column indexes
CREATE INDEX IF NOT EXISTS idx_tours_status ON tours(status);
CREATE INDEX IF NOT EXISTS idx_tours_subaccount_id ON tours(subaccount_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE tour_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tour_state ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - AUTHENTICATED ACCESS
-- ============================================

-- Tour themes policies
CREATE POLICY "Agencies can manage own tour themes" ON tour_themes
  FOR ALL
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Tour analytics policies (insert allowed for embed script via service role)
CREATE POLICY "Agencies can view own tour analytics" ON tour_analytics
  FOR SELECT
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Checklists policies
CREATE POLICY "Agencies can manage own checklists" ON checklists
  FOR ALL
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Smart tips policies
CREATE POLICY "Agencies can manage own smart tips" ON smart_tips
  FOR ALL
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Banners policies
CREATE POLICY "Agencies can manage own banners" ON banners
  FOR ALL
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Resource centers policies
CREATE POLICY "Agencies can manage own resource centers" ON resource_centers
  FOR ALL
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Tour templates policies
CREATE POLICY "Agencies can view system templates" ON tour_templates
  FOR SELECT
  USING (category = 'system' OR agency_id IN (
    SELECT id FROM agencies WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Agencies can manage own templates" ON tour_templates
  FOR ALL
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- User tour state policies
CREATE POLICY "Agencies can view own user states" ON user_tour_state
  FOR SELECT
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- ============================================
-- RLS POLICIES - PUBLIC ACCESS (for embed script)
-- ============================================

CREATE POLICY "Public can read live checklists" ON checklists
  FOR SELECT
  USING (status = 'live');

CREATE POLICY "Public can read live smart tips" ON smart_tips
  FOR SELECT
  USING (status = 'live');

CREATE POLICY "Public can read live banners" ON banners
  FOR SELECT
  USING (status = 'live');

CREATE POLICY "Public can read live resource centers" ON resource_centers
  FOR SELECT
  USING (status = 'live');

CREATE POLICY "Public can read system tour templates" ON tour_templates
  FOR SELECT
  USING (category = 'system');

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update timestamps
CREATE TRIGGER tour_themes_updated_at
  BEFORE UPDATE ON tour_themes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER checklists_updated_at
  BEFORE UPDATE ON checklists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER smart_tips_updated_at
  BEFORE UPDATE ON smart_tips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER banners_updated_at
  BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER resource_centers_updated_at
  BEFORE UPDATE ON resource_centers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tour_templates_updated_at
  BEFORE UPDATE ON tour_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_tour_state_updated_at
  BEFORE UPDATE ON user_tour_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Ensure only one default theme per agency
CREATE OR REPLACE FUNCTION ensure_single_default_theme()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE tour_themes
    SET is_default = false
    WHERE agency_id = NEW.agency_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tour_themes_single_default
  AFTER INSERT OR UPDATE OF is_default ON tour_themes
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_theme();

-- ============================================
-- INSERT SYSTEM TEMPLATES
-- ============================================

INSERT INTO tour_templates (id, agency_id, name, description, category, steps, settings, preview_image_url)
VALUES
  (
    uuid_generate_v4(),
    NULL,
    'Welcome Tour',
    'A friendly introduction to your platform with 3 steps: welcome modal, key feature pointer, and completion celebration.',
    'system',
    '[
      {
        "id": "welcome",
        "order": 1,
        "type": "modal",
        "title": "Welcome! 👋",
        "content": "<p>We''re excited to have you here! Let us show you around so you can get the most out of your new platform.</p>",
        "buttons": [
          {"id": "start", "label": "Let''s Go!", "action": "next", "style": "primary", "position": "right"}
        ],
        "progress_trigger": {"type": "button"},
        "backdrop": true
      },
      {
        "id": "dashboard",
        "order": 2,
        "type": "pointer",
        "title": "Your Dashboard",
        "content": "<p>This is your command center. Here you can see all your important metrics at a glance.</p>",
        "element": {"selector": "[data-sidebar-item=\"sb_dashboard\"]"},
        "position": "right",
        "highlight": true,
        "backdrop": true,
        "buttons": [
          {"id": "prev", "label": "Back", "action": "prev", "style": "secondary", "position": "left"},
          {"id": "next", "label": "Next", "action": "next", "style": "primary", "position": "right"}
        ],
        "progress_trigger": {"type": "button"}
      },
      {
        "id": "complete",
        "order": 3,
        "type": "modal",
        "title": "You''re All Set! 🎉",
        "content": "<p>That''s the basics! Feel free to explore and don''t hesitate to reach out if you need help.</p>",
        "buttons": [
          {"id": "finish", "label": "Start Exploring", "action": "close", "style": "primary", "position": "right"}
        ],
        "progress_trigger": {"type": "button"},
        "backdrop": true
      }
    ]'::jsonb,
    '{
      "autoplay": true,
      "remember_progress": true,
      "show_progress": true,
      "progress_style": "dots",
      "frequency": {"type": "once"}
    }'::jsonb,
    NULL
  ),
  (
    uuid_generate_v4(),
    NULL,
    'Feature Highlight',
    'Draw attention to a new feature with a single spotlight tooltip.',
    'system',
    '[
      {
        "id": "feature",
        "order": 1,
        "type": "pointer",
        "title": "✨ New Feature",
        "content": "<p>Check out this new feature we just launched! Click to learn more.</p>",
        "element": {"selector": ".new-feature"},
        "position": "bottom",
        "highlight": true,
        "backdrop": true,
        "buttons": [
          {"id": "dismiss", "label": "Got It", "action": "close", "style": "primary", "position": "right"}
        ],
        "progress_trigger": {"type": "button"}
      }
    ]'::jsonb,
    '{
      "autoplay": true,
      "show_progress": false,
      "frequency": {"type": "once"}
    }'::jsonb,
    NULL
  ),
  (
    uuid_generate_v4(),
    NULL,
    'Getting Started Checklist',
    'An onboarding checklist template with common setup tasks.',
    'system',
    '[
      {
        "id": "profile",
        "order": 1,
        "type": "modal",
        "title": "Complete Your Profile",
        "content": "<p>Add your company details and logo to personalize your account.</p>",
        "buttons": [
          {"id": "skip", "label": "Skip", "action": "next", "style": "secondary", "position": "left"},
          {"id": "go", "label": "Set Up Profile", "action": "url", "url": "/settings", "style": "primary", "position": "right"}
        ],
        "progress_trigger": {"type": "button"}
      }
    ]'::jsonb,
    '{
      "autoplay": false,
      "show_progress": true,
      "progress_style": "numbers"
    }'::jsonb,
    NULL
  ),
  (
    uuid_generate_v4(),
    NULL,
    'Announcement Banner',
    'A simple announcement tour with just a banner step.',
    'system',
    '[
      {
        "id": "announce",
        "order": 1,
        "type": "banner",
        "content": "<strong>📢 Important Update:</strong> We''ve made some exciting improvements. <a href=\"#\">Learn more</a>",
        "position": "top",
        "buttons": [
          {"id": "dismiss", "label": "Dismiss", "action": "close", "style": "ghost", "position": "right"}
        ],
        "progress_trigger": {"type": "button"}
      }
    ]'::jsonb,
    '{
      "autoplay": true,
      "show_progress": false,
      "frequency": {"type": "once"}
    }'::jsonb,
    NULL
  )
ON CONFLICT DO NOTHING;
