-- Historique des generations du Copilote (/panel-manager/copilote).
--
-- Chaque texte produit — conseil de pilotage ou contenu (legende Instagram,
-- story, article, newsletter) — est garde avec le message de depart, le mode,
-- et le resultat du controle de voix (score des 7 garde-fous, mots bannis
-- trouves). Trois usages :
--   * revenir a une generation fermee par erreur (l'ecran n'en garde qu'une) ;
--   * compter ce qui sort du Copilote et ce qui finit publie ;
--   * relire les prompts qui produisent des textes hors voix, pour les ajuster.
--
-- Pas de user_id : le panneau a un mot de passe partage, pas d'auth.users.
-- Le duo est le seul utilisateur ; une colonne vide serait une fausse promesse.

CREATE TABLE IF NOT EXISTS public.copilot_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode TEXT NOT NULL
    CHECK (mode IN ('1', '2', '3', 'instagram', 'story', 'blog', 'newsletter')),
  prompt TEXT NOT NULL,
  result TEXT NOT NULL,
  provider TEXT,
  model TEXT,
  -- Controle de voix (lib/brand-voice.ts) : null pour les modes de pilotage,
  -- qui ne produisent pas de contenu public.
  score INTEGER CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
  forbidden_found TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Aucune politique : seule la route serveur ecrit et lit, avec la cle service.
-- La cle publique du site ne voit rien de cette table.
ALTER TABLE public.copilot_generations ENABLE ROW LEVEL SECURITY;

-- L'historique se lit du plus recent au plus ancien, par mode.
CREATE INDEX IF NOT EXISTS idx_copilot_generations_created
  ON public.copilot_generations (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_copilot_generations_mode
  ON public.copilot_generations (mode, created_at DESC);
