-- Fermeture de cinq politiques RLS ouvertes au role `public`.
--
-- Constat mesure le 2026-10-21 : cinq politiques
--   FOR ALL TO public USING (true) WITH CHECK (true)
-- laissaient le role `anon` ecrire et lire des tables du CMS. Or la cle anon est
-- publique (elle est embarquee dans le bundle du site) : n'importe qui pouvait donc
-- ecrire dans ces tables depuis un navigateur.
--
-- Preuve, non theorique : un POST PostgREST avec la cle anon renvoyait le code
-- `23502` (violation NOT NULL) et NON `42501` (RLS refuse). La ligne est donc bien
-- arrivee jusqu'a la contrainte : la politique laissait passer.
--
-- Tables visees et etat mesure :
--   cms_accommodations   0 ligne   anon INSERT/DELETE autorises
--   cms_post_revisions   0 ligne   BROUILLONS d'articles — lisibles par anon
--   cms_releases         0 ligne   anon INSERT/DELETE autorises
--   photo_blocks         0 ligne   anon INSERT/DELETE autorises
--   cms_settings         20 lignes branding du site — lisible, modifiable,
--                                  supprimable par anon ; plus lue par le code
--
-- Les quatre premieres tables sont vides : aucune donnee n'a fuite. La porte etait
-- ouverte pour tout contenu a venir.
--
-- Remede : remplacer chaque politique `true` par une politique reservee au
-- service_role, de meme forme que `cms_audit_log_service_all` deja en place.
-- Le code serveur bascule sur `createServiceClient()` dans le meme lot : sans ce
-- basculement, l'enregistrement des revisions casserait.
--
-- Aucune table n'est supprimee, aucune donnee n'est touchee, aucun role ni commande
-- des autres tables n'est modifie. Idempotent : rejouer la migration ne change rien.

begin;

-- ---------------------------------------------------------------------------
-- cms_accommodations
-- ---------------------------------------------------------------------------
drop policy if exists "cms_accommodations_all" on public.cms_accommodations;
drop policy if exists "cms_accommodations_service_all" on public.cms_accommodations;
create policy "cms_accommodations_service_all" on public.cms_accommodations
  for all to service_role using (true) with check (true);

-- ---------------------------------------------------------------------------
-- cms_post_revisions — brouillons d'articles, jamais expose au public
-- ---------------------------------------------------------------------------
drop policy if exists "cms_post_revisions_all" on public.cms_post_revisions;
drop policy if exists "cms_post_revisions_service_all" on public.cms_post_revisions;
create policy "cms_post_revisions_service_all" on public.cms_post_revisions
  for all to service_role using (true) with check (true);

-- ---------------------------------------------------------------------------
-- cms_releases
-- ---------------------------------------------------------------------------
drop policy if exists "cms_releases_all" on public.cms_releases;
drop policy if exists "cms_releases_service_all" on public.cms_releases;
create policy "cms_releases_service_all" on public.cms_releases
  for all to service_role using (true) with check (true);

-- ---------------------------------------------------------------------------
-- photo_blocks
-- ---------------------------------------------------------------------------
drop policy if exists "photo_blocks_all" on public.photo_blocks;
drop policy if exists "photo_blocks_service_all" on public.photo_blocks;
create policy "photo_blocks_service_all" on public.photo_blocks
  for all to service_role using (true) with check (true);

-- ---------------------------------------------------------------------------
-- cms_settings — table morte (plus referencee par le code) : service_role seul.
-- Les trois politiques « Admin only: … » filtraient sur l'email du JWT Supabase ;
-- aucun utilisateur Supabase n'existe (l'authentification du CMS est un cookie
-- HMAC maison), elles ne se declenchaient donc jamais. On les retire avec les
-- autres pour ne pas laisser de faux garde-fou.
-- ---------------------------------------------------------------------------
drop policy if exists "Allow all for dev" on public.cms_settings;
drop policy if exists "Allow read settings" on public.cms_settings;
drop policy if exists "Allow update settings" on public.cms_settings;
drop policy if exists "cms_settings_read_public" on public.cms_settings;
drop policy if exists "Admin only: delete cms_settings" on public.cms_settings;
drop policy if exists "Admin only: insert cms_settings" on public.cms_settings;
drop policy if exists "Admin only: update cms_settings" on public.cms_settings;
drop policy if exists "cms_settings_service_all" on public.cms_settings;
create policy "cms_settings_service_all" on public.cms_settings
  for all to service_role using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Verification (lecture seule) : aucune politique `true` ne doit rester sur ces
-- tables pour un role autre que service_role. Doit renvoyer 0 ligne.
-- ---------------------------------------------------------------------------
do $$
declare restant int;
begin
  select count(*) into restant
  from pg_policies
  where schemaname = 'public'
    and tablename in ('cms_accommodations','cms_post_revisions','cms_releases',
                      'photo_blocks','cms_settings')
    and qual = 'true'
    and roles::text not like '%service_role%';

  if restant > 0 then
    raise exception 'Fermeture RLS incomplete : % politique(s) `true` restante(s)', restant;
  end if;
end $$;

commit;
