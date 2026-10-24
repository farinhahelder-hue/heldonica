-- Reecriture des politiques RLS qui reevaluent auth.* a chaque ligne
-- (lint Supabase « auth_rls_initplan » : 30 cas mesures sur le schema public).
--
-- Remede recommande par Supabase : envelopper l'appel dans un sous-SELECT
-- (`(select auth.role())`) pour qu'il devienne un InitPlan evalue UNE fois par
-- requete, au lieu d'une fois par ligne parcourue. Le booleen rendu est
-- strictement identique ; seul le travail de la base change.
--
-- Aucune politique n'est ajoutee, supprimee ou renommee ; aucun role ni
-- commande (SELECT/INSERT/UPDATE/DELETE/ALL) n'est touche. Genere a partir des
-- definitions reelles de pg_policies — aucune reecriture a la main.
--
-- Idempotent : rejouer la migration reecrit les memes expressions.

begin;

-- public.ai_context | ai_context_write | ALL | {public}
alter policy "ai_context_write" on public.ai_context
  using (((select auth.role()) = 'service_role'::text));

-- public.article_map_pois | admin_write_article_map_pois | ALL | {public}
alter policy "admin_write_article_map_pois" on public.article_map_pois
  using (((select auth.role()) = 'authenticated'::text))
  with check (((select auth.role()) = 'authenticated'::text));

-- public.article_map_route_points | admin_write_article_map_route_points | ALL | {public}
alter policy "admin_write_article_map_route_points" on public.article_map_route_points
  using (((select auth.role()) = 'authenticated'::text))
  with check (((select auth.role()) = 'authenticated'::text));

-- public.article_map_routes | admin_write_article_map_routes | ALL | {public}
alter policy "admin_write_article_map_routes" on public.article_map_routes
  using (((select auth.role()) = 'authenticated'::text))
  with check (((select auth.role()) = 'authenticated'::text));

-- public.cms_blog_categories | Admin write categories | ALL | {public}
alter policy "Admin write categories" on public.cms_blog_categories
  using (((select auth.role()) = 'service_role'::text));

-- public.cms_carousel_history | Admin only: manage carousel history | ALL | {authenticated}
alter policy "Admin only: manage carousel history" on public.cms_carousel_history
  using ((((select auth.jwt()) ->> 'email'::text) = 'helder.farinha@mustcompliance.fr'::text))
  with check ((((select auth.jwt()) ->> 'email'::text) = 'helder.farinha@mustcompliance.fr'::text));

-- public.cms_checklist_templates | Admins can manage checklists | ALL | {public}
alter policy "Admins can manage checklists" on public.cms_checklist_templates
  using (((select auth.role()) = 'service_role'::text));

-- public.cms_content_blocks | cms_content_blocks_admin_all | ALL | {public}
alter policy "cms_content_blocks_admin_all" on public.cms_content_blocks
  using (((select auth.role()) = 'service_role'::text));

-- public.cms_editable_zones | cms_editable_zones_admin_all | ALL | {public}
alter policy "cms_editable_zones_admin_all" on public.cms_editable_zones
  using (((select auth.role()) = 'service_role'::text));

-- public.cms_guide_items | service_write_guide_items | ALL | {public}
alter policy "service_write_guide_items" on public.cms_guide_items
  using (((select auth.role()) = 'service_role'::text));

-- public.cms_pillar_pages | service_write_pillar_pages | ALL | {public}
alter policy "service_write_pillar_pages" on public.cms_pillar_pages
  using (((select auth.role()) = 'service_role'::text));

-- public.cms_redirects | Admin all redirects | ALL | {public}
alter policy "Admin all redirects" on public.cms_redirects
  using (((select auth.role()) = 'service_role'::text));

-- public.cms_seo_geo | cms_seo_geo_admin_all | ALL | {public}
alter policy "cms_seo_geo_admin_all" on public.cms_seo_geo
  using (((select auth.role()) = 'service_role'::text));

-- public.cms_settings | Admin only: delete cms_settings | DELETE | {authenticated}
alter policy "Admin only: delete cms_settings" on public.cms_settings
  using ((((select auth.jwt()) ->> 'email'::text) = 'helder.farinha@mustcompliance.fr'::text));

-- public.cms_settings | Admin only: insert cms_settings | INSERT | {authenticated}
alter policy "Admin only: insert cms_settings" on public.cms_settings
  with check ((((select auth.jwt()) ->> 'email'::text) = 'helder.farinha@mustcompliance.fr'::text));

-- public.cms_settings | Admin only: update cms_settings | UPDATE | {authenticated}
alter policy "Admin only: update cms_settings" on public.cms_settings
  using ((((select auth.jwt()) ->> 'email'::text) = 'helder.farinha@mustcompliance.fr'::text))
  with check ((((select auth.jwt()) ->> 'email'::text) = 'helder.farinha@mustcompliance.fr'::text));

-- public.cms_sub_destinations | Admins can do everything on sub destinations | ALL | {public}
alter policy "Admins can do everything on sub destinations" on public.cms_sub_destinations
  using (((select auth.role()) = 'authenticated'::text));

-- public.cms_testimonials | Admins can manage testimonials | ALL | {public}
alter policy "Admins can manage testimonials" on public.cms_testimonials
  using (((select auth.role()) = 'service_role'::text));

-- public.cms_zone_history | Admin insert zone history | INSERT | {public}
alter policy "Admin insert zone history" on public.cms_zone_history
  with check (((select auth.role()) = 'service_role'::text));

-- public.cms_zone_history | Admin read zone history | SELECT | {public}
alter policy "Admin read zone history" on public.cms_zone_history
  using (((select auth.role()) = 'service_role'::text));

-- public.demandes_travel | Service role only demandes_travel | ALL | {service_role}
alter policy "Service role only demandes_travel" on public.demandes_travel
  using (((select auth.role()) = 'service_role'::text))
  with check (((select auth.role()) = 'service_role'::text));

-- public.email_sequences | Service role only email_sequences | ALL | {service_role}
alter policy "Service role only email_sequences" on public.email_sequences
  using (((select auth.role()) = 'service_role'::text))
  with check (((select auth.role()) = 'service_role'::text));

-- public.guide_downloads | Service role can manage guide_downloads | ALL | {public}
alter policy "Service role can manage guide_downloads" on public.guide_downloads
  using (((select auth.role()) = 'service_role'::text));

-- public.instagram_drafts | Admin only: manage instagram_drafts | ALL | {authenticated}
alter policy "Admin only: manage instagram_drafts" on public.instagram_drafts
  using ((((select auth.jwt()) ->> 'email'::text) = 'helder.farinha@mustcompliance.fr'::text))
  with check ((((select auth.jwt()) ->> 'email'::text) = 'helder.farinha@mustcompliance.fr'::text));

-- public.reservations_seances | Service role full access reservations | ALL | {public}
-- Table supprimee le 2026-10-24 (migration 20261024150000) : elle appartenait a une
-- autre application et n'etait pas creee par une migration. Garde pour que ce fichier
-- reste rejouable sur une base neuve (l'en-tete le promet).
do $$
begin
  if to_regclass('public.reservations_seances') is not null then
    alter policy "Service role full access reservations" on public.reservations_seances
      using (((select auth.role()) = 'service_role'::text))
      with check (((select auth.role()) = 'service_role'::text));
  end if;
end $$;

-- public.site_settings | Service role full access | ALL | {public}
alter policy "Service role full access" on public.site_settings
  using (((select auth.role()) = 'service_role'::text))
  with check (((select auth.role()) = 'service_role'::text));

-- public.temoignages | Service role full access temoignages | ALL | {public}
alter policy "Service role full access temoignages" on public.temoignages
  using (((select auth.role()) = 'service_role'::text))
  with check (((select auth.role()) = 'service_role'::text));

-- public.test_attachement_results | Service role full access test results | ALL | {public}
alter policy "Service role full access test results" on public.test_attachement_results
  using (((select auth.role()) = 'service_role'::text))
  with check (((select auth.role()) = 'service_role'::text));

-- public.travel_guides | Service role can manage travel_guides | ALL | {public}
alter policy "Service role can manage travel_guides" on public.travel_guides
  using (((select auth.role()) = 'service_role'::text));

-- public.user_profiles | user_profiles_update_own | UPDATE | {authenticated}
alter policy "user_profiles_update_own" on public.user_profiles
  using ((( SELECT (select auth.uid()) AS uid) = id))
  with check (((select auth.uid()) = user_id));

commit;
