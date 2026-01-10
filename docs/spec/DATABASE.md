# Agency Toolkit - Database Schema

> Complete Supabase schema with Row Level Security (RLS) policies

---

## Overview

Agency Toolkit uses Supabase (PostgreSQL) with:
- **Row Level Security (RLS)** for multi-tenant data isolation
- **Clerk webhook sync** for user management
- **JSONB columns** for flexible configuration storage

---

## Schema

### Core Tables

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- AGENCIES TABLE
-- Agency Toolkit customers (the agencies themselves)
-- ============================================
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

-- Indexes for common queries
CREATE INDEX idx_agencies_clerk_user_id ON agencies(clerk_user_id);
CREATE INDEX idx_agencies_token ON agencies(token);
CREATE INDEX idx_agencies_plan ON agencies(plan);

-- ============================================
-- CUSTOMERS TABLE
-- Agency's GHL sub-accounts
-- ============================================
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

-- Indexes
CREATE INDEX idx_customers_agency_id ON customers(agency_id);
CREATE INDEX idx_customers_token ON customers(token);
CREATE INDEX idx_customers_ghl_location_id ON customers(ghl_location_id);
CREATE INDEX idx_customers_is_active ON customers(is_active);

-- ============================================
-- MENU_PRESETS TABLE
-- Saved menu customization configurations
-- ============================================
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

CREATE INDEX idx_menu_presets_agency_id ON menu_presets(agency_id);

-- ============================================
-- TOURS TABLE
-- Onboarding tour configurations
-- ============================================
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

CREATE INDEX idx_tours_agency_id ON tours(agency_id);
CREATE INDEX idx_tours_is_active ON tours(is_active);

-- ============================================
-- IMAGE_TEMPLATES TABLE
-- Personalized image configurations
-- ============================================
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

CREATE INDEX idx_image_templates_agency_id ON image_templates(agency_id);

-- ============================================
-- SOCIAL_PROOF_EVENTS TABLE
-- Events for social proof widget
-- ============================================
CREATE TABLE social_proof_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  
  event_type TEXT NOT NULL CHECK (event_type IN ('signup', 'subscription', 'milestone', 'connected')),
  business_name TEXT NOT NULL,
  location TEXT,
  
  -- Event-specific details
  details JSONB DEFAULT '{}'::jsonb,
  -- For milestone: { review_count: 200, platform: "google" }
  -- For subscription: { plan: "Pro" }
  
  -- Display settings
  is_visible BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_social_proof_events_agency_id ON social_proof_events(agency_id);
CREATE INDEX idx_social_proof_events_created_at ON social_proof_events(created_at DESC);

-- ============================================
-- ANALYTICS TABLE (Optional, for Pro tier)
-- Track tour completions, image renders, etc.
-- ============================================
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_agency_id ON analytics_events(agency_id);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
```

---

## Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_proof_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- AGENCIES POLICIES
-- ============================================

-- Agencies can only see their own data
CREATE POLICY "Agencies can view own data" ON agencies
  FOR SELECT
  USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Agencies can update their own data
CREATE POLICY "Agencies can update own data" ON agencies
  FOR UPDATE
  USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Insert handled by service role (Clerk webhook)
CREATE POLICY "Service role can insert agencies" ON agencies
  FOR INSERT
  WITH CHECK (true);
  -- Note: Actual insert uses service role key, not user JWT

-- ============================================
-- CUSTOMERS POLICIES
-- ============================================

-- Agencies can only see their own customers
CREATE POLICY "Agencies can view own customers" ON customers
  FOR SELECT
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Agencies can insert customers under their account
CREATE POLICY "Agencies can insert own customers" ON customers
  FOR INSERT
  WITH CHECK (
    agency_id IN (
      SELECT id FROM agencies WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Agencies can update their own customers
CREATE POLICY "Agencies can update own customers" ON customers
  FOR UPDATE
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Agencies can delete their own customers
CREATE POLICY "Agencies can delete own customers" ON customers
  FOR DELETE
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- ============================================
-- MENU_PRESETS POLICIES
-- ============================================

CREATE POLICY "Agencies can manage own menu presets" ON menu_presets
  FOR ALL
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- ============================================
-- TOURS POLICIES
-- ============================================

CREATE POLICY "Agencies can manage own tours" ON tours
  FOR ALL
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- ============================================
-- IMAGE_TEMPLATES POLICIES
-- ============================================

CREATE POLICY "Agencies can manage own image templates" ON image_templates
  FOR ALL
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- ============================================
-- SOCIAL_PROOF_EVENTS POLICIES
-- ============================================

CREATE POLICY "Agencies can manage own social proof events" ON social_proof_events
  FOR ALL
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- ============================================
-- ANALYTICS_EVENTS POLICIES
-- ============================================

CREATE POLICY "Agencies can view own analytics" ON analytics_events
  FOR SELECT
  USING (
    agency_id IN (
      SELECT id FROM agencies WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Insert via service role for public API endpoints
```

---

## Public Access Policies (for Embed Script)

The embed script and image API need to read configuration WITHOUT user authentication:

```sql
-- ============================================
-- PUBLIC READ POLICIES (for embed script)
-- These use agency/customer tokens, not JWT auth
-- ============================================

-- Allow reading agency config by token (for embed script)
CREATE POLICY "Public can read agency config by token" ON agencies
  FOR SELECT
  USING (true);  -- Filtered by token in query

-- Allow reading customer config by token (for GBP dashboard)
CREATE POLICY "Public can read customer by token" ON customers
  FOR SELECT
  USING (true);  -- Filtered by token in query

-- Allow reading active tours by agency token
CREATE POLICY "Public can read active tours" ON tours
  FOR SELECT
  USING (is_active = true);

-- Allow reading image templates (for image API)
CREATE POLICY "Public can read image templates" ON image_templates
  FOR SELECT
  USING (true);

-- Allow reading visible social proof events
CREATE POLICY "Public can read visible social proof" ON social_proof_events
  FOR SELECT
  USING (is_visible = true);
```

**Important:** Public policies are intentionally permissive because:
1. Config data is not sensitive (menu items, colors)
2. Actual filtering happens via token lookup in API routes
3. Service role is used for writes

---

## Functions & Triggers

```sql
-- ============================================
-- AUTO-UPDATE TIMESTAMPS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- ============================================
-- ENSURE ONLY ONE DEFAULT MENU PRESET
-- ============================================

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

CREATE TRIGGER menu_presets_single_default
  AFTER INSERT OR UPDATE OF is_default ON menu_presets
  FOR EACH ROW 
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_preset();

-- ============================================
-- INCREMENT IMAGE RENDER COUNT
-- ============================================

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
```

---

## TypeScript Types

Generated types for use in the application:

```typescript
// types/database.ts

export interface Agency {
  id: string;
  clerk_user_id: string;
  email: string;
  name: string;
  token: string;
  plan: 'free' | 'toolkit' | 'pro';
  settings: AgencySettings;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgencySettings {
  menu: MenuConfig | null;
  login: LoginConfig | null;
  loading: LoadingConfig | null;
  colors: ColorConfig | null;
  whitelisted_locations: string[];
}

export interface MenuConfig {
  hidden_items: string[];
  renamed_items: Record<string, string>;
  hidden_banners: string[];
}

export interface LoginConfig {
  logo_url: string | null;
  background_color: string;
  background_image_url: string | null;
  button_color: string;
  button_text_color: string;
}

export interface LoadingConfig {
  animation_id: string;
  custom_css: string | null;
}

export interface ColorConfig {
  primary: string;
  accent: string;
  sidebar_bg: string;
  sidebar_text: string;
}

export interface Customer {
  id: string;
  agency_id: string;
  name: string;
  token: string;
  ghl_location_id: string | null;
  gbp_place_id: string | null;
  gbp_connected_at: string | null;
  settings: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuPreset {
  id: string;
  agency_id: string;
  name: string;
  is_default: boolean;
  config: {
    hidden_items: string[];
    renamed_items: Record<string, string>;
    item_order: string[];
    hidden_banners: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface Tour {
  id: string;
  agency_id: string;
  name: string;
  page: string;
  trigger: 'first_visit' | 'manual' | 'button';
  is_active: boolean;
  steps: TourStep[];
  created_at: string;
  updated_at: string;
}

export interface TourStep {
  selector: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export interface ImageTemplate {
  id: string;
  agency_id: string;
  name: string;
  base_image_url: string;
  base_image_width: number;
  base_image_height: number;
  text_config: {
    x: number;
    y: number;
    font: string;
    size: number;
    color: string;
    background_color: string | null;
    fallback: string;
  };
  render_count: number;
  last_rendered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SocialProofEvent {
  id: string;
  agency_id: string;
  event_type: 'signup' | 'subscription' | 'milestone' | 'connected';
  business_name: string;
  location: string | null;
  details: Record<string, unknown>;
  is_visible: boolean;
  created_at: string;
}
```

---

## Supabase Client Setup

### Browser Client (for client components)

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### Server Client (for server components & API routes)

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component - ignore
          }
        },
      },
    }
  );
}
```

### Admin Client (for webhooks & service operations)

```typescript
// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
```

---

## Migration Order

Run these in order when setting up:

1. Enable UUID extension
2. Create tables (agencies first, then dependent tables)
3. Create indexes
4. Enable RLS on all tables
5. Create RLS policies
6. Create functions and triggers

Use Supabase Dashboard SQL Editor or migrations folder.
