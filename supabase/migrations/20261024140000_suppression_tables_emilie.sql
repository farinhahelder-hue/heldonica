-- Migration 20261024140000_suppression_tables_emilie.sql
-- Suppression des 24 tables `emilie_*` de la base Heldonica.
--
-- Contexte : ces tables (385 lignes de contenu scolaire : dictées, poésies,
-- leçons, calcul mental) appartiennent à une **autre application** qui partage
-- la base — documenté dans `20260730000004_security_rls_hardening.sql:7`.
-- Elles n'ont aucun consommateur dans le code Heldonica (aucune référence dans
-- `app/`, `lib/`, `components/`, `scripts/`), aucune FK entrante, aucune vue ni
-- fonction ne les lit.
--
-- Défaut mesuré avant suppression : les 24 tables portaient une policy
-- `SELECT USING (true)` pour le rôle `public`, donc étaient **lisibles avec la
-- clé `anon` publique** (vérifié : `GET /rest/v1/emilie_dictees?select=titre,texte`
-- → HTTP 200). Elles ont été retirées de la base Heldonica sur décision
-- explicite du fondateur (2026-10-24).
--
-- Sauvegarde préalable (irréversible après coup) :
--   `.audit/backup-emilie-2026-10-24/donnees.json` (385 lignes, toutes colonnes)
--   `.audit/backup-emilie-2026-10-24/donnees.sql`  (INSERT restaurables)
--   sha256(donnees.json) = c2d4a9049bd33df80b7c8d37cb15210714e43c7f3b90a202663124512f1e7db7
--
-- Idempotent : `if exists` partout. `cascade` emporte les 24 séquences liées,
-- les 4 FK internes entre tables `emilie_*` et les 25 policies. Vérifié avant
-- écriture : aucune FK entrante d'une table hors `emilie_*`.
--
-- Retour arrière : recréer les tables (schéma dans `donnees.sql` ne porte que
-- les données) puis rejouer `donnees.sql`. Le schéma complet n'est pas
-- conservé ici — cette migration est une suppression assumée, pas une migration
-- de schéma réversible.

drop table if exists public.emilie_anglais cascade;
drop table if exists public.emilie_animaux cascade;
drop table if exists public.emilie_arts cascade;
drop table if exists public.emilie_badges cascade;
drop table if exists public.emilie_calcul_mental cascade;
drop table if exists public.emilie_conjugaison cascade;
drop table if exists public.emilie_corps_humain cascade;
drop table if exists public.emilie_dictees cascade;
drop table if exists public.emilie_emc cascade;
drop table if exists public.emilie_espace cascade;
drop table if exists public.emilie_exercices cascade;
drop table if exists public.emilie_geometrie cascade;
drop table if exists public.emilie_grammaire cascade;
drop table if exists public.emilie_lecons cascade;
drop table if exists public.emilie_lecture cascade;
drop table if exists public.emilie_lecture_questions cascade;
drop table if exists public.emilie_matieres cascade;
drop table if exists public.emilie_mesures cascade;
drop table if exists public.emilie_orthographe cascade;
drop table if exists public.emilie_poesies cascade;
drop table if exists public.emilie_problemes cascade;
drop table if exists public.emilie_progression cascade;
drop table if exists public.emilie_questionner_monde cascade;
drop table if exists public.emilie_vocabulaire cascade;
