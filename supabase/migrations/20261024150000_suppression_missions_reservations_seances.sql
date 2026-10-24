-- Migration 20261024150000_suppression_missions_reservations_seances.sql
-- Suppression des tables `missions` et `reservations_seances` de la base Heldonica.
--
-- Contexte : ces deux tables appartiennent à une **autre application** qui partage
-- la base — citées nommément dans `20260730000004_security_rls_hardening.sql:7-8`
-- (« Base partagée avec une autre application (tables emilie_*, missions,
-- reservations_seances) »). Elles sont **vides** (0 ligne) et n'ont aucun
-- consommateur dans le code Heldonica : aucune requête `.from('missions')` ni
-- `.from('reservations_seances')`, aucune route API, aucune référence dans
-- `app/`, `lib/`, `components/`, `scripts/`.
--
-- Suppression sur décision explicite du fondateur (2026-10-24), même session que
-- la suppression des tables `emilie_*` (migration `20261024140000`).
--
-- Dépendances relevées avant écriture :
--   - `missions.hotel_id` → `hotels(id)` on delete cascade (FK sortante, emportée par cascade).
--   - `missions` porte le trigger `missions_updated_at` (function `update_updated_at`).
--   - Les enums `mission_type` et `mission_statut` ne servent QU'À `missions`.
--   - La vue `v_pipeline_b2b` N'EST PAS une dépendance réelle : elle est déjà
--     cassée (« infinite recursion detected in rules for relation v_pipeline_b2b »,
--     elle se référence elle-même) et n'est référencée nulle part dans le code.
--     Elle n'est pas touchée par cette migration.
--   - Aucune FK entrante depuis une autre table, aucune vue saine, aucune fonction.
--
-- Sauvegarde préalable (les tables étant vides, il s'agit d'un schéma, pas de données) :
--   `.audit/backup-missions-reservations-2026-10-24/snapshot.json` (colonnes, policies,
--   grants, FK, RLS), `recreation.sql` (DDL complet de recréation, enums et trigger
--   inclus), sha256(snapshot.json) = 047921ef1dfc4114440ed7fbb5a35524b0959533d105a1f75bf169834f9be180
--
-- Idempotent : `if exists` partout. `cascade` emporte le trigger, la FK et les
-- policies. Les enums `mission_type` / `mission_statut` sont supprimés
-- explicitement (plus aucun usage après le drop de `missions`).
--
-- Retour arrière : rejouer `recreation.sql` (schéma seul, aucune donnée).

drop table if exists public.missions cascade;
drop table if exists public.reservations_seances cascade;

drop type if exists public.mission_type;
drop type if exists public.mission_statut;
