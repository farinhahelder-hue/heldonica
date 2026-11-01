-- Levée du mode maintenance — 2026-10-26
-- Décision du propriétaire : rouvrir le site public après résorption des incohérences
-- éditoriales relevées dans l'audit du 2026-10-20 (voir
-- .audit/audit-editorial-2026-10-20/PREPARATION-LEVEE-MAINTENANCE-2026-10-26.md).
--
-- Source de vérité : `site_settings.maintenance_mode`, lue par middleware.ts via
-- getMaintenanceMode() (lib/supabase-edge.ts). La variable Vercel MAINTENANCE_MODE
-- n'intervient qu'en secours si Supabase est injoignable.
--
-- NE PAS APPLIQUER SANS L'ACCORD EXPLICITE DU PROPRIÉTAIRE (règle n°4 : le mode
-- maintenance est piloté intentionnellement). Cette migration est rédigée, pas exécutée.
--
-- RENOMMAGE OBLIGATOIRE AU MOMENT DE LA LEVÉE (consigne du propriétaire, 2026-10-26) :
-- ce fichier est horodaté `20261026140000`, soit ANTÉRIEUR aux migrations déjà
-- appliquées depuis (`20261026170000` zones logo, `20261026180000` compteurs morts).
-- Appliquer une migration antérieure à une migration déjà appliquée fait échouer
-- `supabase db push` (« migration antérieure à une migration appliquée »). Le jour
-- de la levée : renommer ce fichier avec un horodatage POSTÉRIEUR à la dernière
-- migration appliquée, puis l'ajouter à `main` et le pousser. D'ici là il reste
-- hors de `main` et non suivi par git.
--
-- Prérequis constatés le 2026-10-26 (à re-vérifier au moment de l'application) :
--   1. Les incohérences éditoriales D, E, F, G du rapport sont tranchées (années
--      d'expérience « dix ans » vs « 4+ », pays 7 vs 6 vs 9 terrains, « 8+ » carnets,
--      dates « 18 mai 2026 »).
--   2. Le conflit `robots.txt` (public/ vs app/) est résolu — en dev il renvoie 500.
--   3. Les images de public/ ne sont plus bloquées pendant la maintenance
--      (og:image renvoie 307 vers /maintenance).
-- Ces points relèvent du code, pas de cette migration.
--
-- Cette migration ne fait QUE basculer le drapeau. Elle ne touche à aucune autre
-- ligne de site_settings, ni à aucune autre table.

INSERT INTO site_settings (key, value, label, type, updated_at)
VALUES ('maintenance_mode', 'false', 'Mode maintenance', 'boolean', now())
ON CONFLICT (key) DO UPDATE
  SET value = 'false',
      updated_at = now();
