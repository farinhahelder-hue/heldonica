-- ============================================================================
-- Complétion cms_pillar_pages — aligne la prod sur la migration préparée
-- Date : 2026-07-30
--
-- CONTEXTE : le 2026-07-30, la table cms_pillar_pages a été créée en prod par
-- un CREATE TABLE ad hoc exécuté à la main, et non par
-- 20260730_cms_pillar_pages_idempotent.sql. Deux écarts en ont résulté :
--
--   1. Les colonnes JSONB (intro, info_table, itinerary, budget_breakdown,
--      faq, tested_by_heldonica, verdict) ont été seedées vides. Comme
--      fetchPillarData() ne bascule sur le fallback qu'en cas d'erreur ou
--      d'absence de ligne — pas de contenu vide — les 3 pages piliers ont
--      servi des intros, itinéraires et FAQ vides. Corrigé le jour même par
--      réinjection du contenu réel (identique à lib/pillar-data.ts).
--
--   2. RLS a été activée SANS policy. Aucun impact fonctionnel constaté :
--      lib/pillar-data.ts et /api/cms/pillar-pages utilisent tous deux la clé
--      service_role, qui contourne RLS. Mais toute lecture anon renvoyait 0
--      ligne. C'est ce que ce fichier corrige.
--
-- Ce fichier est idempotent : réexécutable sans effet de bord.
-- ============================================================================

-- ─── Policies (absentes du CREATE TABLE ad hoc) ──────────────────────────────
DROP POLICY IF EXISTS "public_read_pillar_pages" ON cms_pillar_pages;
CREATE POLICY "public_read_pillar_pages" ON cms_pillar_pages
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "service_write_pillar_pages" ON cms_pillar_pages;
CREATE POLICY "service_write_pillar_pages" ON cms_pillar_pages
  FOR ALL USING (auth.role() = 'service_role');

-- ─── Index ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_pillar_pages_slug ON cms_pillar_pages(slug);

-- ─── Trigger updated_at ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_cms_pillar_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cms_pillar_pages_updated_at ON cms_pillar_pages;
CREATE TRIGGER trg_cms_pillar_pages_updated_at
  BEFORE UPDATE ON cms_pillar_pages
  FOR EACH ROW EXECUTE FUNCTION set_cms_pillar_pages_updated_at();

-- ─── Vérification ────────────────────────────────────────────────────────────
-- Attendu : 2 policies, 3 lignes toutes avec du contenu JSONB non vide.
SELECT policyname, cmd FROM pg_policies
WHERE tablename = 'cms_pillar_pages' ORDER BY policyname;

SELECT
  slug,
  jsonb_array_length(intro)            AS intro_n,
  jsonb_array_length(info_table)       AS info_n,
  jsonb_array_length(itinerary)        AS itineraire_n,
  jsonb_array_length(budget_breakdown) AS budget_n,
  jsonb_array_length(faq)              AS faq_n,
  (verdict ? 'score')                  AS a_verdict,
  CASE
    WHEN jsonb_array_length(intro) > 0
     AND jsonb_array_length(itinerary) > 0
     AND jsonb_array_length(faq) > 0
     AND (verdict ? 'score')
    THEN 'OK' ELSE 'ECHEC'
  END AS verdict_test
FROM cms_pillar_pages
ORDER BY slug;
