-- ============================================
-- GUIDELY THEMES MIGRATION
-- Expands tour_themes to guidely_themes with:
-- - System templates support (is_system, agency_id nullable)
-- - Avatar settings
-- - Component-specific overrides (Smart Tips, Banners, Checklists)
-- - Description field
-- ============================================

-- 1. Add new columns to tour_themes
ALTER TABLE tour_themes
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS is_system BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS avatar JSONB NOT NULL DEFAULT '{
    "enabled": false,
    "shape": "circle",
    "size": "48px",
    "default_image_url": null
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS smart_tip_overrides JSONB NOT NULL DEFAULT '{
    "tooltip_background": null,
    "beacon_color": null,
    "arrow_color": null
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS banner_overrides JSONB NOT NULL DEFAULT '{
    "banner_background": null,
    "banner_text": null,
    "dismiss_icon_color": null
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS checklist_overrides JSONB NOT NULL DEFAULT '{
    "header_background": null,
    "header_text": null,
    "completion_color": null,
    "item_text_color": null,
    "link_color": null
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS tour_overrides JSONB NOT NULL DEFAULT '{
    "progress_color": null,
    "progress_inactive": null,
    "close_icon_color": null,
    "backdrop_color": "rgba(0,0,0,0.5)",
    "progress_style": "dots"
  }'::jsonb;

-- 2. Make agency_id nullable for system templates
ALTER TABLE tour_themes ALTER COLUMN agency_id DROP NOT NULL;

-- 3. Rename table to guidely_themes
ALTER TABLE tour_themes RENAME TO guidely_themes;

-- 4. Rename related objects
ALTER INDEX IF EXISTS idx_tour_themes_agency_id RENAME TO idx_guidely_themes_agency_id;
ALTER INDEX IF EXISTS tour_themes_pkey RENAME TO guidely_themes_pkey;

-- 5. Add new index for system themes
CREATE INDEX IF NOT EXISTS idx_guidely_themes_system ON guidely_themes(is_system) WHERE is_system = true;

-- 6. Update foreign key references in other tables
-- Tours
ALTER TABLE tours DROP CONSTRAINT IF EXISTS fk_tours_theme;
ALTER TABLE tours ADD CONSTRAINT fk_tours_theme
  FOREIGN KEY (theme_id) REFERENCES guidely_themes(id) ON DELETE SET NULL;

-- Checklists
ALTER TABLE checklists DROP CONSTRAINT IF EXISTS checklists_theme_id_fkey;
ALTER TABLE checklists ADD CONSTRAINT checklists_theme_id_fkey
  FOREIGN KEY (theme_id) REFERENCES guidely_themes(id) ON DELETE SET NULL;

-- Smart tips
ALTER TABLE smart_tips DROP CONSTRAINT IF EXISTS smart_tips_theme_id_fkey;
ALTER TABLE smart_tips ADD CONSTRAINT smart_tips_theme_id_fkey
  FOREIGN KEY (theme_id) REFERENCES guidely_themes(id) ON DELETE SET NULL;

-- Banners
ALTER TABLE banners DROP CONSTRAINT IF EXISTS banners_theme_id_fkey;
ALTER TABLE banners ADD CONSTRAINT banners_theme_id_fkey
  FOREIGN KEY (theme_id) REFERENCES guidely_themes(id) ON DELETE SET NULL;

-- Resource centers
ALTER TABLE resource_centers DROP CONSTRAINT IF EXISTS resource_centers_theme_id_fkey;
ALTER TABLE resource_centers ADD CONSTRAINT resource_centers_theme_id_fkey
  FOREIGN KEY (theme_id) REFERENCES guidely_themes(id) ON DELETE SET NULL;

-- 7. Rename trigger
DROP TRIGGER IF EXISTS tour_themes_updated_at ON guidely_themes;
CREATE TRIGGER guidely_themes_updated_at
  BEFORE UPDATE ON guidely_themes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 8. Update single default trigger
DROP TRIGGER IF EXISTS tour_themes_single_default ON guidely_themes;

CREATE OR REPLACE FUNCTION ensure_single_default_guidely_theme()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true AND NEW.agency_id IS NOT NULL THEN
    UPDATE guidely_themes
    SET is_default = false
    WHERE agency_id = NEW.agency_id AND id != NEW.id AND is_system = false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER guidely_themes_single_default
  AFTER INSERT OR UPDATE OF is_default ON guidely_themes
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_guidely_theme();

-- 9. Update RLS policies
DROP POLICY IF EXISTS "Agencies can manage own tour themes" ON guidely_themes;

-- Policy for agency themes (agency_id IS NOT NULL)
CREATE POLICY "Agencies can manage own guidely themes" ON guidely_themes
  FOR ALL
  USING (
    -- System themes are readable by all authenticated users
    is_system = true
    OR
    -- Agency themes are managed by their owner
    agency_id IN (
      SELECT id FROM agencies WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  )
  WITH CHECK (
    -- Can only create/modify non-system themes for own agency
    is_system = false
    AND agency_id IN (
      SELECT id FROM agencies WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- 10. Insert 5 system templates
INSERT INTO guidely_themes (
  id,
  agency_id,
  name,
  description,
  is_system,
  is_default,
  colors,
  typography,
  borders,
  shadows,
  buttons,
  avatar,
  tour_overrides,
  smart_tip_overrides,
  banner_overrides,
  checklist_overrides
) VALUES
-- Friendly Theme (with avatar)
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  NULL,
  'Friendly',
  'Warm and approachable with avatar support. Great for SaaS and consumer apps.',
  true,
  false,
  '{
    "primary": "#3B82F6",
    "primary_hover": "#2563EB",
    "primary_text": "#FFFFFF",
    "secondary": "#64748B",
    "secondary_hover": "#475569",
    "secondary_text": "#FFFFFF",
    "background": "#FFFFFF",
    "text": "#1F2937",
    "text_secondary": "#6B7280",
    "border": "#E5E7EB"
  }'::jsonb,
  '{
    "font_family": "system-ui, -apple-system, sans-serif",
    "title_size": "18px",
    "body_size": "14px",
    "line_height": "1.5"
  }'::jsonb,
  '{"radius": "16px", "width": "1px", "style": "solid"}'::jsonb,
  '{"tooltip": "0 4px 12px rgba(0,0,0,0.15)", "modal": "0 20px 40px rgba(0,0,0,0.2)"}'::jsonb,
  '{
    "style": "filled",
    "border_radius": "8px",
    "primary": {"background": "#3B82F6", "text": "#FFFFFF", "border": "transparent", "hover_background": "#2563EB", "hover_text": "#FFFFFF"},
    "secondary": {"background": "transparent", "text": "#64748B", "border": "#E5E7EB", "hover_background": "#F3F4F6", "hover_text": "#1F2937"}
  }'::jsonb,
  '{"enabled": true, "shape": "circle", "size": "56px", "default_image_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=friendly"}'::jsonb,
  '{"progress_color": "#3B82F6", "progress_inactive": "#E5E7EB", "close_icon_color": "#6B7280", "backdrop_color": "rgba(0,0,0,0.5)", "progress_style": "dots"}'::jsonb,
  '{"tooltip_background": null, "beacon_color": "#3B82F6", "arrow_color": null}'::jsonb,
  '{"banner_background": null, "banner_text": null, "dismiss_icon_color": null}'::jsonb,
  '{"header_background": "#3B82F6", "header_text": "#FFFFFF", "completion_color": "#10B981", "item_text_color": null, "link_color": "#3B82F6"}'::jsonb
),
-- Corporate Theme (no avatar)
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  NULL,
  'Corporate',
  'Professional and clean for B2B and enterprise applications.',
  true,
  false,
  '{
    "primary": "#1E3A5F",
    "primary_hover": "#152C4A",
    "primary_text": "#FFFFFF",
    "secondary": "#64748B",
    "secondary_hover": "#475569",
    "secondary_text": "#FFFFFF",
    "background": "#FFFFFF",
    "text": "#1E293B",
    "text_secondary": "#64748B",
    "border": "#E2E8F0"
  }'::jsonb,
  '{
    "font_family": "system-ui, -apple-system, sans-serif",
    "title_size": "18px",
    "body_size": "14px",
    "line_height": "1.6"
  }'::jsonb,
  '{"radius": "8px", "width": "1px", "style": "solid"}'::jsonb,
  '{"tooltip": "0 2px 8px rgba(0,0,0,0.1)", "modal": "0 10px 30px rgba(0,0,0,0.15)"}'::jsonb,
  '{
    "style": "filled",
    "border_radius": "6px",
    "primary": {"background": "#1E3A5F", "text": "#FFFFFF", "border": "transparent", "hover_background": "#152C4A", "hover_text": "#FFFFFF"},
    "secondary": {"background": "transparent", "text": "#64748B", "border": "#E2E8F0", "hover_background": "#F8FAFC", "hover_text": "#1E293B"}
  }'::jsonb,
  '{"enabled": false, "shape": "circle", "size": "48px", "default_image_url": null}'::jsonb,
  '{"progress_color": "#1E3A5F", "progress_inactive": "#E2E8F0", "close_icon_color": "#64748B", "backdrop_color": "rgba(0,0,0,0.4)", "progress_style": "numbers"}'::jsonb,
  '{"tooltip_background": "#1E3A5F", "beacon_color": "#1E3A5F", "arrow_color": null}'::jsonb,
  '{"banner_background": "#1E3A5F", "banner_text": "#FFFFFF", "dismiss_icon_color": "#94A3B8"}'::jsonb,
  '{"header_background": "#1E3A5F", "header_text": "#FFFFFF", "completion_color": "#059669", "item_text_color": null, "link_color": "#1E3A5F"}'::jsonb
),
-- Bold Theme (bright accent)
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d481',
  NULL,
  'Bold',
  'Modern and energetic with high contrast. Perfect for startups and creative brands.',
  true,
  false,
  '{
    "primary": "#7C3AED",
    "primary_hover": "#6D28D9",
    "primary_text": "#FFFFFF",
    "secondary": "#64748B",
    "secondary_hover": "#475569",
    "secondary_text": "#FFFFFF",
    "background": "#FFFFFF",
    "text": "#0F172A",
    "text_secondary": "#475569",
    "border": "#E2E8F0"
  }'::jsonb,
  '{
    "font_family": "system-ui, -apple-system, sans-serif",
    "title_size": "20px",
    "body_size": "15px",
    "line_height": "1.5"
  }'::jsonb,
  '{"radius": "24px", "width": "0px", "style": "none"}'::jsonb,
  '{"tooltip": "0 8px 24px rgba(124,58,237,0.2)", "modal": "0 24px 48px rgba(124,58,237,0.25)"}'::jsonb,
  '{
    "style": "filled",
    "border_radius": "12px",
    "primary": {"background": "#7C3AED", "text": "#FFFFFF", "border": "transparent", "hover_background": "#6D28D9", "hover_text": "#FFFFFF"},
    "secondary": {"background": "#F5F3FF", "text": "#7C3AED", "border": "transparent", "hover_background": "#EDE9FE", "hover_text": "#6D28D9"}
  }'::jsonb,
  '{"enabled": false, "shape": "rounded", "size": "52px", "default_image_url": null}'::jsonb,
  '{"progress_color": "#7C3AED", "progress_inactive": "#E9D5FF", "close_icon_color": "#A78BFA", "backdrop_color": "rgba(124,58,237,0.3)", "progress_style": "bar"}'::jsonb,
  '{"tooltip_background": "#7C3AED", "beacon_color": "#7C3AED", "arrow_color": null}'::jsonb,
  '{"banner_background": "#7C3AED", "banner_text": "#FFFFFF", "dismiss_icon_color": "#C4B5FD"}'::jsonb,
  '{"header_background": "#7C3AED", "header_text": "#FFFFFF", "completion_color": "#10B981", "item_text_color": null, "link_color": "#7C3AED"}'::jsonb
),
-- Minimal Theme (sharp corners)
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d482',
  NULL,
  'Minimal',
  'Clean and understated. Ideal for productivity and developer tools.',
  true,
  false,
  '{
    "primary": "#18181B",
    "primary_hover": "#27272A",
    "primary_text": "#FFFFFF",
    "secondary": "#71717A",
    "secondary_hover": "#52525B",
    "secondary_text": "#FFFFFF",
    "background": "#FFFFFF",
    "text": "#18181B",
    "text_secondary": "#71717A",
    "border": "#E4E4E7"
  }'::jsonb,
  '{
    "font_family": "system-ui, -apple-system, sans-serif",
    "title_size": "16px",
    "body_size": "14px",
    "line_height": "1.5"
  }'::jsonb,
  '{"radius": "4px", "width": "1px", "style": "solid"}'::jsonb,
  '{"tooltip": "0 1px 3px rgba(0,0,0,0.1)", "modal": "0 4px 12px rgba(0,0,0,0.1)"}'::jsonb,
  '{
    "style": "outline",
    "border_radius": "4px",
    "primary": {"background": "#18181B", "text": "#FFFFFF", "border": "transparent", "hover_background": "#27272A", "hover_text": "#FFFFFF"},
    "secondary": {"background": "transparent", "text": "#71717A", "border": "#E4E4E7", "hover_background": "#FAFAFA", "hover_text": "#18181B"}
  }'::jsonb,
  '{"enabled": false, "shape": "square", "size": "40px", "default_image_url": null}'::jsonb,
  '{"progress_color": "#18181B", "progress_inactive": "#E4E4E7", "close_icon_color": "#A1A1AA", "backdrop_color": "rgba(0,0,0,0.3)", "progress_style": "numbers"}'::jsonb,
  '{"tooltip_background": "#18181B", "beacon_color": "#18181B", "arrow_color": null}'::jsonb,
  '{"banner_background": "#FAFAFA", "banner_text": "#18181B", "dismiss_icon_color": "#71717A"}'::jsonb,
  '{"header_background": "#FAFAFA", "header_text": "#18181B", "completion_color": "#18181B", "item_text_color": null, "link_color": "#18181B"}'::jsonb
),
-- Colorful Theme (fun, with avatar)
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d483',
  NULL,
  'Colorful',
  'Fun and engaging with bright accents. Great for marketing and education.',
  true,
  false,
  '{
    "primary": "#F97316",
    "primary_hover": "#EA580C",
    "primary_text": "#FFFFFF",
    "secondary": "#64748B",
    "secondary_hover": "#475569",
    "secondary_text": "#FFFFFF",
    "background": "#FFFFFF",
    "text": "#1E293B",
    "text_secondary": "#64748B",
    "border": "#FED7AA"
  }'::jsonb,
  '{
    "font_family": "system-ui, -apple-system, sans-serif",
    "title_size": "20px",
    "body_size": "15px",
    "line_height": "1.5"
  }'::jsonb,
  '{"radius": "20px", "width": "2px", "style": "solid"}'::jsonb,
  '{"tooltip": "0 6px 20px rgba(249,115,22,0.2)", "modal": "0 20px 40px rgba(249,115,22,0.2)"}'::jsonb,
  '{
    "style": "filled",
    "border_radius": "999px",
    "primary": {"background": "#F97316", "text": "#FFFFFF", "border": "transparent", "hover_background": "#EA580C", "hover_text": "#FFFFFF"},
    "secondary": {"background": "#FFF7ED", "text": "#F97316", "border": "transparent", "hover_background": "#FFEDD5", "hover_text": "#EA580C"}
  }'::jsonb,
  '{"enabled": true, "shape": "circle", "size": "60px", "default_image_url": "https://api.dicebear.com/7.x/fun-emoji/svg?seed=colorful"}'::jsonb,
  '{"progress_color": "#F97316", "progress_inactive": "#FED7AA", "close_icon_color": "#FB923C", "backdrop_color": "rgba(249,115,22,0.2)", "progress_style": "dots"}'::jsonb,
  '{"tooltip_background": null, "beacon_color": "#F97316", "arrow_color": null}'::jsonb,
  '{"banner_background": "#FFF7ED", "banner_text": "#9A3412", "dismiss_icon_color": "#FB923C"}'::jsonb,
  '{"header_background": "#F97316", "header_text": "#FFFFFF", "completion_color": "#22C55E", "item_text_color": null, "link_color": "#F97316"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 11. Add guidely_defaults to agencies settings (handled in app code via JSONB merge)
-- This will store: { "tour_theme_id", "smart_tip_theme_id", "banner_theme_id", "checklist_theme_id" }

COMMENT ON TABLE guidely_themes IS 'Unified themes for all Guidely features: Tours, Smart Tips, Banners, Checklists';
COMMENT ON COLUMN guidely_themes.is_system IS 'System templates cannot be deleted and are available to all agencies';
COMMENT ON COLUMN guidely_themes.avatar IS 'Avatar settings for modals: enabled, shape, size, default_image_url';
COMMENT ON COLUMN guidely_themes.tour_overrides IS 'Tour-specific color overrides';
COMMENT ON COLUMN guidely_themes.smart_tip_overrides IS 'Smart Tip-specific color overrides';
COMMENT ON COLUMN guidely_themes.banner_overrides IS 'Banner-specific color overrides';
COMMENT ON COLUMN guidely_themes.checklist_overrides IS 'Checklist-specific color overrides';
