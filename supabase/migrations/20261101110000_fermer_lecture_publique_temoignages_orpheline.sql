-- Fermeture de la lecture publique de la table orpheline `temoignages`.
--
-- Constat mesure le 2026-11-01 :
--   `temoignages` (sans le prefixe `cms_`) contient 5 lignes de temoignages de
--   COACHING PROFESSIONNEL attribues a une denommee « Monica » (Directrice
--   Marketing, DRH, Philosophical Counselling). Le site est un media de
--   SLOW TRAVEL : ce contenu appartient a un ancien projet.
--
--   La politique « Public read temoignages » (SELECT, roles {public},
--   USING visible = true) rend ces 5 lignes LISIBLES ANONYMEMENT. Preuve :
--   GET /rest/v1/temoignages avec la cle publiable renvoie HTTP 200 et 5 lignes.
--
--   Aucun lecteur, nulle part : ni `app/`, ni `components/`, ni `lib/`, ni le
--   mobile. Les seules occurrences de ce nom sont dans `docs/` et
--   `CHANGELOG.md`. La page /temoignages lit `cms_testimonials`, l'unique
--   source (`lib/testimonials.ts`) — jamais cette table.
--
--   La table n'a AUCUNE migration de creation : elle a ete creee a la main.
--   La migration 20261018160000 a desactive les 5 faux temoignages de
--   `cms_testimonials`, mais a oublie cette table homonyme.
--
-- Remede, non destructif : retirer la SEULE politique de lecture publique.
--   - Aucune ligne n'est supprimee : les 5 temoignages restent en base.
--   - « Service role full access temoignages » est CONSERVEE : elle est deja
--     bornee a auth.role() = 'service_role', elle ne fuit rien.
--   - La table n'est ni renommee ni supprimee : le contenu reste consultable
--     depuis le tableau de bord ou via la cle service, pour archivage.
--
-- Aucune autre table n'est touchee. `ai_context` en particulier reste ouverte
-- en lecture, et ce n'est PAS un oubli : sa migration de creation
-- (20260903191920_ai_context_table.sql) ecrit noir sur blanc
-- « RLS : lecture publique (les agents lisent) ». C'est le fil conducteur que
-- Claude, Gemini, Jules et le service Heldonica Brain II lisent en debut de
-- session avec la cle anon. La fermer casserait cet usage.
-- Son seul defaut reel — un secret — a ete mesure : la valeur de
-- glossary_maintenance_bypass est TRONQUEE par conception et ne contient pas
-- le vrai jeton (comparaison programmatique : False). Aucune des 35 cles ne
-- contient de secret exploitable. Decision : ne pas la fermer.
-- Une session future ne doit donc PAS « corriger » ai_context par symetrie.
--
-- Idempotent : rejouer la migration ne change rien.

begin;

drop policy if exists "Public read temoignages" on public.temoignages;

-- Verification (lecture seule) : plus aucune politique de lecture sur cette table
-- dont la clause USING ne reclame pas le service_role.
--
-- Le critere porte sur `qual`, pas sur `roles` : la politique conservee
-- « Service role full access temoignages » est declaree `to public` mais sa
-- clause USING exige auth.role() = 'service_role'. Juger sur `roles` la
-- declarerait ouverte a tort et ferait echouer la migration (constate en test).
do $$
declare restant int;
begin
  select count(*) into restant
  from pg_policies
  where schemaname = 'public'
    and tablename = 'temoignages'
    and cmd in ('SELECT', 'ALL')
    and coalesce(qual, '') not like '%service_role%';

  if restant > 0 then
    raise exception 'Lecture publique encore ouverte sur temoignages : % politique(s)', restant;
  end if;
end $$;

commit;
