-- ============================================================================
-- Tables opérationnelles du back-office CMS — comblement de la dérive de schéma
-- Date : 2026-10-11
-- ============================================================================
-- Contexte
-- --------
-- Le job CI « Zones et tables CMS » (npm run check:cms-drift) échoue sur
-- 9 tables référencées par le code mais absentes de la base :
--   cms_accommodations, cms_api_tokens, cms_audit_log, cms_post_revisions,
--   cms_releases, cms_webhooks, cms_webhook_deliveries, cms_zone_variants,
--   photo_blocks
--
-- Vérification faite : aucune de ces tables n'existe sous un autre nom dans le
-- dépôt — ce ne sont pas des renommages, elles n'ont jamais été migrées.
--
-- La forme de chaque table est déduite des écritures réelles du code :
--   lib/cms-hospitality.ts, lib/cms-tokens.ts, lib/cms-audit.ts,
--   lib/cms-revisions.ts, lib/cms-releases.ts, lib/cms-webhooks.ts,
--   lib/cms-targeting.ts, app/api/cms/photos/upload/route.ts
-- Les colonnes listées sont exactement celles que le code insère ou met à jour.
--
-- Idempotent : rejouable sans effet de bord (IF NOT EXISTS / DROP POLICY IF
-- EXISTS). Aucune donnée n'est lue, réécrite ni supprimée. Aucun seed.
--
-- ⚠️ Sécurité — la base est partagée avec une autre application (voir
-- docs/CMS_FOUNDATION_PHASE_0_INVENTAIRE.md §2). Cette migration ne nomme que
-- ses propres tables et ne touche à aucune policy existante. Voir la section
-- RLS en fin de fichier pour le choix de moindre privilège : lecture publique
-- uniquement pour le contenu déjà lu avec le client anon ; secrets et données
-- personnelles réservés au service_role.
-- ============================================================================

-- ─── 1. cms_accommodations — hébergements testés (volet B2B / slow travel) ───
-- Consommé par lib/cms-hospitality.ts (Accommodation) et lib/cms-releases.ts.
CREATE TABLE IF NOT EXISTS public.cms_accommodations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  destination_slug text,
  type text NOT NULL,                    -- chambre_hotes | gite_charme | hotel_independant | cabane_insolite
  capacity integer NOT NULL,
  surface_m2 numeric,
  price_per_night numeric,
  direct_booking_url text,
  description text NOT NULL,
  amenities jsonb NOT NULL DEFAULT '[]'::jsonb,
  photos jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft',  -- draft | waiting_review | approved | published
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.cms_accommodations IS
  'Hébergements éthiques testés sur le terrain (slow travel). Workflow : draft -> waiting_review -> approved -> published.';

CREATE INDEX IF NOT EXISTS idx_cms_accommodations_status ON public.cms_accommodations(status);
CREATE INDEX IF NOT EXISTS idx_cms_accommodations_destination ON public.cms_accommodations(destination_slug);

-- ─── 2. cms_api_tokens — jetons d'accès à l'API CMS ─────────────────────────
-- Consommé par lib/cms-tokens.ts (CmsApiToken). On ne stocke que le hash.
CREATE TABLE IF NOT EXISTS public.cms_api_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  token_hash text UNIQUE NOT NULL,
  token_prefix text NOT NULL,
  scopes jsonb NOT NULL DEFAULT '[]'::jsonb,  -- read:content | write:draft | publish:content | admin:*
  created_by text,
  last_used_at timestamptz,
  expires_at timestamptz,
  is_revoked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.cms_api_tokens IS
  'Jetons Bearer de l''API CMS. Seul le hash SHA-256 est stocké ; le jeton en clair n''est affiché qu''une fois à la création.';

CREATE INDEX IF NOT EXISTS idx_cms_api_tokens_revoked ON public.cms_api_tokens(is_revoked);

-- ─── 3. cms_audit_log — journal d'audit du CMS ──────────────────────────────
-- Consommé par lib/cms-audit.ts (logCmsAudit / getRecentAuditLogs).
CREATE TABLE IF NOT EXISTS public.cms_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  user_email text,
  user_role text,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  diff jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.cms_audit_log IS
  'Traçabilité des modifications CMS : qui, quoi, quand, avec le diff JSONB. Écrit par cms-hospitality, cms-revisions et cms-releases.';

CREATE INDEX IF NOT EXISTS idx_cms_audit_log_created_at ON public.cms_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cms_audit_log_entity ON public.cms_audit_log(entity);

-- ─── 4. cms_post_revisions — instantanés d'articles ─────────────────────────
-- Consommé par lib/cms-revisions.ts (savePostRevision / getPostRevisions) et
-- app/api/cms/articles/[id]/revisions/route.ts.
CREATE TABLE IF NOT EXISTS public.cms_post_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id text NOT NULL,               -- identifiant d'article, conservé en texte (String(post.id))
  title text NOT NULL,
  slug text NOT NULL,
  excerpt text,
  content text NOT NULL,
  featured_image text,
  author text,
  saved_by text,
  saved_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.cms_post_revisions IS
  'Historique des versions d''un article. Lue jusqu''à 20 entrées par article, les plus récentes d''abord.';

CREATE INDEX IF NOT EXISTS idx_cms_post_revisions_post_id ON public.cms_post_revisions(post_id, saved_at DESC);

-- ─── 5. cms_releases — publications groupées ────────────────────────────────
-- Consommé par lib/cms-releases.ts (CmsRelease).
CREATE TABLE IF NOT EXISTS public.cms_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft',  -- draft | scheduled | publishing | published | cancelled
  items jsonb NOT NULL DEFAULT '[]'::jsonb,  -- [{ entity: post|accommodation|destination, id, title? }]
  scheduled_at timestamptz,
  published_at timestamptz,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.cms_releases IS
  'Lots de publication groupée (articles, hébergements, destinations). items = [{entity, id, title?}].';

CREATE INDEX IF NOT EXISTS idx_cms_releases_status ON public.cms_releases(status);
CREATE INDEX IF NOT EXISTS idx_cms_releases_created_at ON public.cms_releases(created_at DESC);

-- ─── 6. cms_webhooks — abonnements sortants ─────────────────────────────────
-- Consommé par lib/cms-webhooks.ts (CmsWebhook).
CREATE TABLE IF NOT EXISTS public.cms_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  events jsonb NOT NULL DEFAULT '[]'::jsonb,  -- CmsWebhookEvent[]
  secret text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.cms_webhooks IS
  'Webhooks CMS sortants : URL, événements souscrits et secret de signature.';

-- ─── 7. cms_webhook_deliveries — journal des livraisons de webhooks ─────────
-- Consommé par lib/cms-webhooks.ts (triggerCmsWebhooks).
CREATE TABLE IF NOT EXISTS public.cms_webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id uuid REFERENCES public.cms_webhooks(id) ON DELETE CASCADE,
  event text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status_code integer,
  response_body text,                   -- tronqué à 1000 caractères par le code
  success boolean NOT NULL DEFAULT false,
  delivered_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.cms_webhook_deliveries IS
  'Journal des tentatives d''envoi de webhooks (code HTTP, corps de réponse tronqué, succès).';

CREATE INDEX IF NOT EXISTS idx_cms_webhook_deliveries_webhook ON public.cms_webhook_deliveries(webhook_id, delivered_at DESC);

-- ─── 8. cms_zone_variants — variantes ciblées de zones éditables ────────────
-- Consommé par lib/cms-targeting.ts (getTargetedZoneVariants) et lib/cms-zones.ts,
-- lu sur la quasi-totalité des pages publiques (surcharge des zones CMS).
CREATE TABLE IF NOT EXISTS public.cms_zone_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  zone_key text NOT NULL,
  variant_name text NOT NULL,
  value text NOT NULL,
  rules jsonb NOT NULL DEFAULT '{}'::jsonb,  -- { season?, audience?, utm_source?, utm_campaign?, device? }
  priority integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.cms_zone_variants IS
  'Variantes ciblées d''une zone éditable selon des règles (saison, audience, UTM, appareil). Priorité = la plus haute gagne.';

CREATE INDEX IF NOT EXISTS idx_cms_zone_variants_page_active ON public.cms_zone_variants(page, is_active);
CREATE INDEX IF NOT EXISTS idx_cms_zone_variants_zone_key ON public.cms_zone_variants(zone_key);

-- ─── 9. photo_blocks — preuves photo de terrain ─────────────────────────────
-- Consommé par app/api/cms/photos/upload/route.ts (POST) après validation par
-- lib/photo-albums.ts (règle n°1 : on n'invente rien — lieu, date, anecdote requis).
CREATE TABLE IF NOT EXISTS public.photo_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  location text NOT NULL,
  latitude double precision,
  longitude double precision,
  taken_at date NOT NULL,               -- date ISO 8601 (AAAA-MM-JJ)
  anecdote text NOT NULL,               -- max 200 caractères (validé côté code)
  album_id text NOT NULL DEFAULT 'divers',
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.photo_blocks IS
  'Preuves photographiques de terrain : lieu, date de prise de vue, anecdote vécue. Adossent la voix Heldonica à du vécu vérifiable.';

CREATE INDEX IF NOT EXISTS idx_photo_blocks_album ON public.photo_blocks(album_id);
CREATE INDEX IF NOT EXISTS idx_photo_blocks_taken_at ON public.photo_blocks(taken_at DESC);

-- ============================================================================
-- RLS — moindre privilège. Idempotent.
-- ============================================================================
-- La clé anon/publishable est exposée au navigateur (NEXT_PUBLIC_*). Une policy
-- `TO public` équivaut donc à « lisible et modifiable par n'importe quel
-- visiteur ». On ne l'accorde qu'aux tables de contenu que l'app lit déjà avec
-- ce client (lib/supabase-client.ts). Les tables porteuses de secrets ou de
-- données personnelles sont réservées au service_role — elles sont de toute
-- façon inaccessibles aujourd'hui (tables absentes), il n'y a donc pas de
-- régression, et cela évite d'introduire une fuite.

-- Contenu consommé par le client anon côté serveur.
ALTER TABLE public.cms_accommodations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cms_accommodations_all" ON public.cms_accommodations;
CREATE POLICY "cms_accommodations_all" ON public.cms_accommodations
  FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.cms_post_revisions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cms_post_revisions_all" ON public.cms_post_revisions;
CREATE POLICY "cms_post_revisions_all" ON public.cms_post_revisions
  FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.cms_releases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cms_releases_all" ON public.cms_releases;
CREATE POLICY "cms_releases_all" ON public.cms_releases
  FOR ALL TO public USING (true) WITH CHECK (true);

ALTER TABLE public.photo_blocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "photo_blocks_all" ON public.photo_blocks;
CREATE POLICY "photo_blocks_all" ON public.photo_blocks
  FOR ALL TO public USING (true) WITH CHECK (true);

-- Variantes ciblées : lecture publique des variantes actives (pages publiques),
-- écriture réservée au service_role. Même forme que cms_editable_zones.
ALTER TABLE public.cms_zone_variants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cms_zone_variants_public_read" ON public.cms_zone_variants;
CREATE POLICY "cms_zone_variants_public_read" ON public.cms_zone_variants
  FOR SELECT TO public USING (is_active = true);
DROP POLICY IF EXISTS "cms_zone_variants_service_all" ON public.cms_zone_variants;
CREATE POLICY "cms_zone_variants_service_all" ON public.cms_zone_variants
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Secrets et données personnelles : service_role uniquement (aucune policy
-- permissive pour anon/authenticated = refus par défaut, RLS activée).
-- Conséquence assumée : les libs qui écrivent via le client anon
-- (cms-audit, cms-webhooks, cms-tokens) échouent proprement tant qu'elles
-- n'utilisent pas un client service_role — c'est déjà le cas aujourd'hui,
-- les tables étant absentes. Bascule à faire dans une tâche dédiée.
ALTER TABLE public.cms_api_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cms_api_tokens_service_all" ON public.cms_api_tokens;
CREATE POLICY "cms_api_tokens_service_all" ON public.cms_api_tokens
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.cms_webhooks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cms_webhooks_service_all" ON public.cms_webhooks;
CREATE POLICY "cms_webhooks_service_all" ON public.cms_webhooks
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.cms_webhook_deliveries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cms_webhook_deliveries_service_all" ON public.cms_webhook_deliveries;
CREATE POLICY "cms_webhook_deliveries_service_all" ON public.cms_webhook_deliveries
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.cms_audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cms_audit_log_service_all" ON public.cms_audit_log;
CREATE POLICY "cms_audit_log_service_all" ON public.cms_audit_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- Vérification (lecture seule) — les 9 tables doivent être présentes.
-- ============================================================================
SELECT table_name AS table_creee,
       (SELECT COUNT(*) FROM information_schema.columns c
         WHERE c.table_schema = 'public' AND c.table_name = t.table_name) AS nb_colonnes
FROM (VALUES
  ('cms_accommodations'), ('cms_api_tokens'), ('cms_audit_log'),
  ('cms_post_revisions'), ('cms_releases'), ('cms_webhooks'),
  ('cms_webhook_deliveries'), ('cms_zone_variants'), ('photo_blocks')
) AS t(table_name)
WHERE EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = t.table_name
)
ORDER BY table_name;
