-- ===========================================================================
-- Heldonica — Enrichissement Google Maps / Photos (Création + Enrichissement)
-- Niveau 1+2 : création auto drafts + enrichissement POIs via Places API
--
-- Règle AGENTS.md : on n'invente rien -> tout INSERT en published=false
-- Idempotente.
-- ===========================================================================

-- 1. article_map_pois : ajout metadata google + source traçabilité
ALTER TABLE public.article_map_pois
  ADD COLUMN IF NOT EXISTS google_place_id text,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual' CHECK (source IN ('manual','gmaps_saved','gphotos_exif','takeout','places_api','nominatim')),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Index pour deduplication Place ID
CREATE INDEX IF NOT EXISTS idx_pois_google_place_id ON public.article_map_pois(google_place_id) WHERE google_place_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pois_source ON public.article_map_pois(source);

-- 2. article_map_routes : source + metadata (pour Timeline/KML imports)
ALTER TABLE public.article_map_routes
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual' CHECK (source IN ('manual','gmaps_timeline','takeout','gpx','kml')),
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 3. cms_media : traçabilité import + géoloc + alt auto
ALTER TABLE public.cms_media
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'upload' CHECK (source IN ('upload','gphotos','takeout','places_api')),
  ADD COLUMN IF NOT EXISTS google_photo_id text,
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS taken_at timestamptz,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_media_source ON public.cms_media(source);
CREATE INDEX IF NOT EXISTS idx_media_geoloc ON public.cms_media(latitude, longitude) WHERE latitude IS NOT NULL;

-- 4. cms_blog_posts : flag pour distinguer drafts auto-générés
ALTER TABLE public.cms_blog_posts
  ADD COLUMN IF NOT EXISTS auto_generated boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual' CHECK (source IN ('manual','gmaps_import','takeout','ai_draft')),
  ADD COLUMN IF NOT EXISTS source_metadata jsonb DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_posts_auto_generated ON public.cms_blog_posts(auto_generated) WHERE auto_generated = true;

-- 5. map_markers : google_place_id pour enrichissement futur (optionnel)
ALTER TABLE public.map_markers
  ADD COLUMN IF NOT EXISTS google_place_id text,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- 6. Table de log d'import (audit "on n'invente rien")
CREATE TABLE IF NOT EXISTS public.import_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_type text NOT NULL CHECK (import_type IN ('takeout','gmaps_saved','gphotos','places_enrich','timeline')),
  filename text,
  total_items integer DEFAULT 0,
  created_items integer DEFAULT 0,
  enriched_items integer DEFAULT 0,
  skipped_items integer DEFAULT 0,
  errors jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.import_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "import_logs service_role only" ON public.import_logs;
CREATE POLICY "import_logs service_role only"
  ON public.import_logs FOR ALL
  USING (false) WITH CHECK (false); -- seul service_role via API

-- 7. Trigger updated_at pour pois/routes
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_pois_updated_at ON public.article_map_pois;
CREATE TRIGGER trg_pois_updated_at
  BEFORE UPDATE ON public.article_map_pois
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_routes_updated_at ON public.article_map_routes;
CREATE TRIGGER trg_routes_updated_at
  BEFORE UPDATE ON public.article_map_routes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_markers_updated_at ON public.map_markers;
CREATE TRIGGER trg_markers_updated_at
  BEFORE UPDATE ON public.map_markers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
