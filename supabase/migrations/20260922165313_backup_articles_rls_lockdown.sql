-- Fichier retroactif : cette migration a ete appliquee directement en base
-- (version 20260922165313 au registre) sans fichier committe au depot.
--
-- Reconstitue a l'identique des `statements` enregistres. Aucune execution
-- nouvelle : la migration est deja appliquee.
--
-- Elle verrouille la table de sauvegarde `backup_articles_20260915` creee le
-- 15/09 : RLS activee et privileges retires a anon et authenticated.

begin;

alter table public.backup_articles_20260915 enable row level security;

revoke all on public.backup_articles_20260915 from anon, authenticated;

commit;
