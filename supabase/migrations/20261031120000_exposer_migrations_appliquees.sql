-- Exposer le registre des migrations appliquées, pour que la CI puisse le lire.
--
-- Pourquoi cette vue existe
-- -------------------------
-- `supabase_migrations.schema_migrations` n'est PAS exposée par PostgREST :
-- seuls les schémas `public` et `graphql_public` le sont (vérifié le
-- 2026-10-31 : `Accept-Profile: supabase_migrations` répond PGRST106
-- « Only the following schemas are exposed: public, graphql_public »).
--
-- Conséquence mesurée : la CI possède `SUPABASE_SERVICE_ROLE_KEY`, mais aucun
-- contrôle ne pouvait savoir quelles migrations sont réellement appliquées.
-- C'est ce qui a permis à des dizaines de tâches de finir en
-- `waiting_validation` avec la mention « MANQUE : appliquer la migration »,
-- sans qu'aucun garde-fou ne voie la base prendre du retard sur le dépôt —
-- et à l'inverse, sans qu'un `db push` manuel reste invisible.
--
-- Cette vue publie le registre à la seule clé secrète : `anon` et
-- `authenticated` n'ont aucun droit dessus (revoke explicite ci-dessous).
--
-- Colonnes : `version` et `name` UNIQUEMENT.
-- `created_by` a été délibérément ÉCARTÉ : il contient des adresses e-mail
-- (relevé : `farinhahelder@gmail.com`, `openhands`). Publier cette colonne
-- exposerait l'adresse du propriétaire à travers PostgREST — exactement le
-- défaut corrigé sur la route Google le 30/10 (une variable mal remplie y
-- rendait l'adresse publique).
--
-- Le registre est la vérité de ce qui a été appliqué, pas de ce qui est écrit
-- dans le dépôt : c'est leur comparaison qui a de la valeur
-- (voir `scripts/check-cms-migrations-appliquees.mjs`).

create or replace view public.migrations_appliquees as
  select version, name
  from supabase_migrations.schema_migrations;

comment on view public.migrations_appliquees is
  'Registre des migrations appliquées (version, name), lisible par la clé secrète seule. Sert au contrôle check:cms-migrations-appliquees.';

-- Aucun droit pour les clés publiques : la vue ne doit pas être lisible depuis
-- le navigateur.
revoke all on public.migrations_appliquees from anon, authenticated;

-- La clé secrète (service_role) est la seule à pouvoir lire.
grant select on public.migrations_appliquees to service_role;
