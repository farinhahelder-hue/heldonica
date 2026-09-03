-- Trois tables écrites par du code déployé, mais absentes de la base.
-- Chaque appel échouait ; le contrôle check:cms-drift les signalait comme
-- dérives connues.

-- ── Formules tarifaires ─────────────────────────────────────────────────────
--
-- /api/cms/pricing a deux consommateurs réels : la page d'administration
-- /admin/pricing, et la page publique /travel-planning. Faute de table,
-- l'endpoint renvoyait 500 à chaque chargement de la page publique et
-- divulguait le nom de la table manquante. Les visiteurs voyaient malgré tout
-- des prix : le composant retombe sur la constante PRICING_PLANS codée en dur.
--
-- Cette table déplace donc les prix du code vers le CMS — c'est l'objectif
-- « pilotable depuis Supabase sans redéploiement ». Elle est créée VIDE : tant
-- qu'aucune formule n'y est saisie, la page publique continue d'afficher les
-- prix actuels. Les y recopier serait une décision commerciale, pas technique.

CREATE TABLE IF NOT EXISTS cms_pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  description TEXT,
  features TEXT[] NOT NULL DEFAULT '{}',
  is_popular BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- La lecture se fait par display_order croissant.
CREATE INDEX IF NOT EXISTS idx_pricing_ordre ON cms_pricing_plans (display_order);

-- ── Journal des sessions Jules ──────────────────────────────────────────────
--
-- /api/jules pilote l'API Jules de Google, qui écrit du code dans ce dépôt. Les
-- deux tables ne sont qu'un miroir local : ce qui a été demandé, quand, et par
-- quelle session. Les insertions étaient `await`ées sans lecture d'erreur, donc
-- perdues en silence.
--
-- `id` est l'identifiant renvoyé par Google, pas un UUID généré ici : le code
-- fait un upsert dessus (onConflict: 'id') pour rafraîchir l'état des sessions.

CREATE TABLE IF NOT EXISTS jules_sessions (
  id TEXT PRIMARY KEY,
  title TEXT,
  prompt TEXT,
  state TEXT,
  source TEXT,
  url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS jules_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  description TEXT,
  session_id TEXT REFERENCES jules_sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jules_memory_session ON jules_memory (session_id);

-- ── Sécurité ────────────────────────────────────────────────────────────────
--
-- RLS activée sans aucune politique, sur les trois tables : les routes passent
-- par la clé service, qui l'ignore. La clé publique du site n'a donc aucun
-- accès — ni lecture ni écriture. Même choix que pour instagram_scheduled_posts.
--
-- Y compris pour les tarifs : /travel-planning est une page publique, mais elle
-- lit à travers /api/cms/pricing, qui utilise lui aussi la clé service. Une
-- politique de lecture publique n'ajouterait rien, sinon une surface exposée.

ALTER TABLE cms_pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE jules_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE jules_memory ENABLE ROW LEVEL SECURITY;
