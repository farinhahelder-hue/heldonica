-- Fichier retroactif : cette migration a ete appliquee directement en base
-- (elle figure dans supabase_migrations.schema_migrations sous la version
-- 20260922164811) sans qu'aucun fichier n'ait ete committe au depot.
--
-- Il est reconstitue ici, a l'identique des `statements` enregistres, pour
-- remettre le depot et le registre en phase (regle AGENTS.md : toute ecriture
-- en base passe par une migration versionnee). Aucune execution nouvelle :
-- la migration est deja appliquee.

begin;

create policy "Authenticated admin full access" on public.destinations
  for all to authenticated using (true) with check (true);

create policy "Service role full access" on public.destinations
  for all to service_role using (true) with check (true);

commit;
