-- Migration: Selector Health Monitor tables
-- Run in Supabase SQL editor: https://app.supabase.com/project/hldtxlzxneifdzvoobte/sql

-- selector_health_events: individual selector match/fail reports from the embed script
CREATE TABLE IF NOT EXISTS selector_health_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  selector text NOT NULL,
  matched boolean NOT NULL DEFAULT false,
  match_count integer NOT NULL DEFAULT 0,
  page_url text,
  location_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_selector_health_events_agency_id ON selector_health_events(agency_id);
CREATE INDEX IF NOT EXISTS idx_selector_health_events_created_at ON selector_health_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_selector_health_events_agency_selector ON selector_health_events(agency_id, selector);

-- selector_unknown_items: unknown sidebar items / banner classes detected in GHL DOM
CREATE TABLE IF NOT EXISTS selector_unknown_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  item_type text NOT NULL CHECK (item_type IN ('menu_item', 'banner')),
  identifier text NOT NULL,
  first_seen timestamptz NOT NULL DEFAULT now(),
  last_seen timestamptz NOT NULL DEFAULT now(),
  seen_count integer NOT NULL DEFAULT 1,
  acknowledged boolean NOT NULL DEFAULT false,
  UNIQUE(agency_id, item_type, identifier)
);

CREATE INDEX IF NOT EXISTS idx_selector_unknown_items_agency_id ON selector_unknown_items(agency_id);
CREATE INDEX IF NOT EXISTS idx_selector_unknown_items_unacked ON selector_unknown_items(agency_id, acknowledged) WHERE acknowledged = false;
