-- ============================================================
-- TABLE ai_context : fil conducteur permanent pour tous les agents
-- Lu automatiquement en début de chaque session IA
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_context (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section      text NOT NULL,        -- 'brand' | 'stack' | 'rules' | 'priorities' | 'forbidden' | 'glossary'
  key          text NOT NULL UNIQUE,
  value        text NOT NULL,
  updated_at   timestamptz DEFAULT now(),
  updated_by   text DEFAULT 'heldonica'
);

CREATE INDEX IF NOT EXISTS idx_ai_context_section ON ai_context(section);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_ai_context_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ai_context_updated_at ON ai_context;
CREATE TRIGGER ai_context_updated_at
  BEFORE UPDATE ON ai_context
  FOR EACH ROW EXECUTE FUNCTION update_ai_context_timestamp();

-- RLS : lecture publique (les agents lisent), écriture restreinte
ALTER TABLE ai_context ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_context_read" ON ai_context FOR SELECT USING (true);
CREATE POLICY "ai_context_write" ON ai_context FOR ALL USING (auth.role() = 'service_role');

COMMENT ON TABLE ai_context IS 'Fil conducteur IA - lu au début de chaque session Claude/Gemini/Jules. Contient brand, stack, règles, priorités, interdits, glossaire.';

-- ============================================================
-- SEED : contenu du fil conducteur Heldonica
-- ============================================================

INSERT INTO ai_context (section, key, value) VALUES

-- BRAND
('brand', 'brand_name', 'Heldonica'),
('brand', 'brand_url', 'https://www.heldonica.fr'),
('brand', 'brand_concept', 'Double archétype Sage + Explorateur. Concept : L Expert de l Aventure. Slogan : Vivre, découvrir, partager : embarquez dans notre histoire de slow travel en couple.'),
('brand', 'brand_b2c', 'Blog Slow Travel + Travel Planning sur mesure. Niche : voyages en couple, hors sentiers battus, écoresponsable.'),
('brand', 'brand_b2b', 'Consulting hôtelier indépendant : Revenue Management, SEO local, expérience client.'),
('brand', 'brand_tone_b2c', 'Tutoiement (tu), narratif, sensoriel, empathique. Lexique : pépites dénichées, joyaux cachés, plénitude, déconnexion, vrai goût. Utiliser le ON pour incarner le duo.'),
('brand', 'brand_tone_b2b', 'Vouvoiement (vous), analytique, orienté résultats, données chiffrées. Lexique : RevPAR, Revenue Management, mix canaux, ROI, E-E-A-T.'),
('brand', 'brand_colors', 'Cloud Dancer (blanc cassé), Eucalyptus Green #2D8B7A, Transformative Teal, Warm Mahogany #C4714A'),
('brand', 'brand_fonts', 'Display : Playfair Display. Body : Inter.'),
('brand', 'brand_avoid', 'Jamais : bons plans (→ pépites dénichées), organisation de séjour (→ conception sur mesure), vouvoiement B2C, tournures corporate, contenu générique sans ancrage terrain.'),

-- STACK
('stack', 'stack_frontend', 'Next.js 14+ sur Vercel. Repo GitHub heldonica/heldonica-btc. Branche prod : main.'),
('stack', 'stack_database', 'Supabase PostgreSQL projet smxnruefmrmfyfhuxygq. Tables principales : cms_blog_posts, cms_editable_zones, site_settings, destinations, cms_sub_destinations, cms_pillar_pages.'),
('stack', 'stack_cms', 'Panel manager : /panel-manager. Auth via CMS_PASSWORD (Vercel env chiffré). API : /api/cms/auth, /api/cms/mobile-publish.'),
('stack', 'stack_mobile', 'APK Android heldonica-mobile. Gradle 8.7/8.9. MainActivity.kt : Picker + ExifInterface + Nominatim + WorkManager.'),
('stack', 'stack_maintenance', 'maintenance_mode dans site_settings. Actuellement true. Bypass : x-maintenance-bypass header ou cookie heldonica_maintenance_bypass. Exclusions : /panel-manager, /api, /_next.'),
('stack', 'stack_migrations', 'Toujours via apply_migration (versionnée). Jamais de DDL direct. Convention nommage : YYYYMMDDXXXXXX_nom_snake_case.'),

-- RÈGLES
('rules', 'rules_governance', 'Toute session IA DOIT créer une ligne dans agent_tasks AVANT de commencer (status=in_progress) et la mettre à jour à la fin (status=done ou waiting_validation).'),
('rules', 'rules_validation', 'Tout changement schema ou security → risk_level high/critical → validated_by doit passer à heldonica avant mise en prod.'),
('rules', 'rules_publications', 'Aucun article ne doit passer published=true sans validation explicite de heldonica. Les 44 articles actuels sont tous en brouillon.'),
('rules', 'rules_migrations', 'Avant toute migration destructive (DROP, ALTER avec perte de données, TRUNCATE) : écrire le rollback_sql dans agent_tasks et attendre validation.'),
('rules', 'rules_eeat', 'Tout contenu doit valoriser le vécu terrain, les détails impossibles à inventer, la régularité vérifiée. Différenciation anti-IA obligatoire.'),

-- PRIORITÉS 2026
('priorities', 'priority_1', 'Sortir de maintenance : UPDATE site_settings SET value=false WHERE key=maintenance_mode. Décision heldonica uniquement.'),
('priorities', 'priority_2', 'Publier les 44 articles en brouillon après validation individuelle du contenu.'),
('priorities', 'priority_3', 'Connecter cms_media et article_revisions (tables vides, à alimenter via APK ou panel-manager).'),
('priorities', 'priority_4', 'Créer les redirections WordPress manquantes (table cms_redirects existe mais vide, 0 redirections actives).'),
('priorities', 'priority_5', 'Configurer google_analytics_id dans site_settings (actuellement vide).'),

-- INTERDIT
('forbidden', 'forbidden_ops', 'DROP TABLE, TRUNCATE, DELETE FROM cms_blog_posts, DELETE FROM site_settings, modifier maintenance_mode sans ordre explicite, publier des articles sans validation.'),
('forbidden', 'forbidden_content', 'Contenu générique sans ancrage terrain. Images Unsplash cassées (remplacées le 22 juillet). Doublons slugs (dédupliqués le 28 juillet).'),
('forbidden', 'forbidden_env', 'Ne jamais exposer CMS_PASSWORD, CRON_SECRET, les clés Supabase service_role dans les logs ou les réponses.'),

-- GLOSSAIRE
('glossary', 'glossary_pépites', 'Terme de marque Heldonica pour désigner les bonnes adresses / découvertes terrain. Ne jamais remplacer par bons plans.'),
('glossary', 'glossary_zones', 'cms_editable_zones : 2515 blocs de contenu éditables via /panel-manager. Chaque page a ses zones nommées (hero, cta, body...).'),
('glossary', 'glossary_pillar', 'cms_pillar_pages : 3 pages pilier SEO actuelles. Base des clusters thématiques.'),
('glossary', 'glossary_sub_destinations', 'cms_sub_destinations : 35 sous-destinations seedées le 13 août 2026. Granularité sous les 41 destinations principales.'),
('glossary', 'glossary_agent_tasks', 'Registre de gouvernance IA. Champ validated_by = heldonica pour valider une tâche. Vue v_agent_governance pour le dashboard.'),
('glossary', 'glossary_maintenance_bypass', 'Header x-maintenance-bypass: 8ed364... ou cookie heldonica_maintenance_bypass permettent de prévisualiser le site en maintenance.')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
