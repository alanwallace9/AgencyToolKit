-- Agency Toolkit Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- Execute in order: Extensions -> Tables -> Indexes -> RLS -> Policies -> Functions -> Triggers

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Agencies: Agency Toolkit customers (the agencies themselves)
CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'toolkit', 'pro')),

  -- Customization settings (stored as JSONB for flexibility)
  settings JSONB NOT NULL DEFAULT '{
    "menu": null,
    "login": null,
    "loading": null,
    "colors": null,
    "whitelisted_locations": []
  }'::jsonb,

  -- Metadata
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customers: Agency's GHL sub-accounts
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,

  -- GHL Integration
  ghl_location_id TEXT,

  -- GBP Integration
  gbp_place_id TEXT,
  gbp_connected_at TIMESTAMPTZ,

  -- Customer-specific settings (overrides agency defaults)
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Menu Presets: Saved menu customization configurations
CREATE TABLE menu_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,

  -- Menu configuration
  config JSONB NOT NULL DEFAULT '{
    "hidden_items": [],
    "renamed_items": {},
    "items_order": [],
    "hidden_banners": []
  }'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tours: Onboarding tour configurations
CREATE TABLE tours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,

  -- Tour settings
  page TEXT NOT NULL DEFAULT 'dashboard',
  trigger TEXT NOT NULL DEFAULT 'first_visit' CHECK (trigger IN ('first_visit', 'manual', 'button')),
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Tour steps (array of step objects)
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Step structure: { selector: string, title: string, description: string, position: string }

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Image Templates: Personalized image configurations
CREATE TABLE image_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,

  -- Image source
  base_image_url TEXT NOT NULL,
  base_image_width INTEGER NOT NULL,
  base_image_height INTEGER NOT NULL,

  -- Text configuration
  text_config JSONB NOT NULL DEFAULT '{
    "x": 50,
    "y": 50,
    "font": "Poppins",
    "size": 32,
    "color": "#FFFFFF",
    "background_color": null,
    "fallback": "Friend"
  }'::jsonb,

  -- Usage stats
  render_count INTEGER NOT NULL DEFAULT 0,
  last_rendered_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Social Proof Events: Events for social proof widget
CREATE TABLE social_proof_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,

  event_type TEXT NOT NULL CHECK (event_type IN ('signup', 'subscription', 'milestone', 'connected')),
  business_name TEXT NOT NULL,
  location TEXT,

  -- Event-specific details
  details JSONB DEFAULT '{}'::jsonb,

  -- Display settings
  is_visible BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Analytics Events: Track tour completions, image renders, etc.
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,

  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Agencies indexes
CREATE INDEX idx_agencies_clerk_user_id ON agencies(clerk_user_id);
CREATE INDEX idx_agencies_token ON agencies(token);
CREATE INDEX idx_agencies_plan ON agencies(plan);

-- Customers indexes
CREATE INDEX idx_customers_agency_id ON customers(agency_id);
CREATE INDEX idx_customers_token ON customers(token);
CREATE INDEX idx_customers_ghl_location_id ON customers(ghl_location_id);
CREATE INDEX idx_customers_is_active ON customers(is_active);

-- Menu presets indexes
CREATE INDEX idx_menu_presets_agency_id ON menu_presets(agency_id);

-- Tours indexes
CREATE INDEX idx_tours_agency_id ON tours(agency_id);
CREATE INDEX idx_tours_is_active ON tours(is_active);

-- Image templates indexes
CREATE INDEX idx_image_templates_agency_id ON image_templates(agency_id);

-- Social proof events indexes
CREATE INDEX idx_social_proof_events_agency_id ON social_proof_events(agency_id);
CREATE INDEX idx_social_proof_events_created_at ON social_proof_events(created_at DESC);

-- Analytics events indexes
CREATE INDEX idx_analytics_events_agency_id ON analytics_events(agency_id);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_proof_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - AUTHENTICATED ACCESS
-- ============================================

-- Agencies policies
CREATE POLICY "Agencies can view own data" ON agencies
  FOR SELECT
  USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Agencies can update own data" ON agencies
  FOR UPDATE
  USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Service role can insert agencies" ON agencies
  FOR INSERT
  WITH CHECK (true);

-- Customers policies
CREATE POLICY "Agencies can view own customers" ON customers
  FOR SELECT
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Agencies can insert own customers" ON customers
  FOR INSERT
  WITH CHECK (
    agency_id IN (
      SELECT id FROM agencies WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Agencies can update own customers" ON customers
  FOR UPDATE
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Agencies can delete own customers" ON customers
  FOR DELETE
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Menu presets policies
CREATE POLICY "Agencies can manage own menu presets" ON menu_presets
  FOR ALL
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Tours policies
CREATE POLICY "Agencies can manage own tours" ON tours
  FOR ALL
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Image templates policies
CREATE POLICY "Agencies can manage own image templates" ON image_templates
  FOR ALL
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Social proof events policies
CREATE POLICY "Agencies can manage own social proof events" ON social_proof_events
  FOR ALL
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Analytics events policies
CREATE POLICY "Agencies can view own analytics" ON analytics_events
  FOR SELECT
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- ============================================
-- RLS POLICIES - PUBLIC ACCESS (for embed script)
-- ============================================

CREATE POLICY "Public can read agency config by token" ON agencies
  FOR SELECT
  USING (true);

CREATE POLICY "Public can read customer by token" ON customers
  FOR SELECT
  USING (true);

CREATE POLICY "Public can read active tours" ON tours
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can read image templates" ON image_templates
  FOR SELECT
  USING (true);

CREATE POLICY "Public can read visible social proof" ON social_proof_events
  FOR SELECT
  USING (is_visible = true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure only one default menu preset per agency
CREATE OR REPLACE FUNCTION ensure_single_default_preset()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE menu_presets
    SET is_default = false
    WHERE agency_id = NEW.agency_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Increment image render count
CREATE OR REPLACE FUNCTION increment_render_count(template_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE image_templates
  SET
    render_count = render_count + 1,
    last_rendered_at = NOW()
  WHERE id = template_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER agencies_updated_at
  BEFORE UPDATE ON agencies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER menu_presets_updated_at
  BEFORE UPDATE ON menu_presets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tours_updated_at
  BEFORE UPDATE ON tours
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER image_templates_updated_at
  BEFORE UPDATE ON image_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER menu_presets_single_default
  AFTER INSERT OR UPDATE OF is_default ON menu_presets
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_preset();
