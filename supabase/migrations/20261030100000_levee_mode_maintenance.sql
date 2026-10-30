-- Levée du mode maintenance — 2026-10-30
-- Décision du propriétaire : rouvrir le site public (consigne explicite du 2026-10-30).
--
-- Source de vérité : `site_settings.maintenance_mode`, lue par middleware.ts via
-- getMaintenanceMode() (lib/supabase-edge.ts). La variable Vercel MAINTENANCE_MODE
-- n'intervient qu'en secours si Supabase est injoignable.
--
-- Reprise de `supabase/archive/levee_mode_maintenance_2026-10-26.sql`, restée non
-- appliquée, ré-horodatée au 2026-10-30 pour passer APRÈS la dernière migration
-- appliquée (20261029150000) : une migration antérieure à une migration déjà
-- appliquée ferait échouer `supabase db push`.
--
-- Prérequis re-vérifiés le 2026-10-30 avant écriture :
--   · D (années d'expérience) — tranché le 28/10 : le chiffre des années est retiré
--     (migration 20261028140000_coherence_chiffres_accueil).
--   · E (nombre de pays) — tranché le 28/10 : 12 pays habités, 40 visités, libellés
--     distincts (même migration).
--   · F (« 8+ » carnets) — corrigé dans le code : plus de suffixe « + », plus de
--     repli silencieux `|| 25` (components/HomeClient.tsx).
--   · Conflit robots.txt (public/ vs app/) — résolu : seul app/robots.ts subsiste.
--   · Images de public/ bloquées pendant la maintenance — résolu : le matcher du
--     middleware exclut désormais les fichiers par extension (middleware.ts:333).
--   · 21/21 garde-fous au vert (dont cohérence éditoriale, emojis, vécu/photo).
--
-- Reste ouvert, non bloquant pour la mise en ligne : G (six articles publiés portent
-- la même date « 18 mai 2026 », import en bloc). Aucune date de publication réelle
-- n'est attestée ; la corriger supposerait d'inventer — règle n°1. Décision du
-- propriétaire attendue, sans effet sur l'ouverture du site.
--
-- Cette migration ne fait QUE basculer le drapeau. Elle ne touche à aucune autre
-- ligne de site_settings, ni à aucune autre table.
--
-- Retour arrière : repasser cette même clé à 'true' (nouvelle migration versionnée).

INSERT INTO site_settings (key, value, label, type, updated_at)
VALUES ('maintenance_mode', 'false', 'Mode maintenance', 'boolean', now())
ON CONFLICT (key) DO UPDATE
  SET value = 'false',
      updated_at = now();
