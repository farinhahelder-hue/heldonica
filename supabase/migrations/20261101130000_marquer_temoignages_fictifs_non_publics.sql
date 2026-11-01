-- ============================================================================
-- Marquer `temoignages` comme NON PUBLIABLE, et rendre les faux temoignages
-- impossibles a publier par construction.
--
-- Contexte (mesure le 2026-11-01) :
--   La migration 20261101110000 a retire la politique « Public read temoignages » :
--   la table n'est plus lisible anonymement. Mais la table est CONSERVEE (decision
--   du proprietaire : « a laisser pour l'avenir ») et elle contient encore 5 lignes
--   de temoignages de COACHING PROFESSIONNEL fictifs (attribues a « Monica »),
--   residus d'un ancien projet. Le site est un media de SLOW TRAVEL.
--
--   Deux defauts subsistaient, que cette migration ferme :
--     1. `visible` valait true sur les 5 lignes, et la colonne avait
--        DEFAULT true : si une politique de lecture revenait un jour (reprise
--        d'un ancien script, ajout par megarde), les 5 faux temoignages
--        redevenaient publics immediatement.
--     2. Rien, ni dans la table ni dans son commentaire, ne disait que ce
--        contenu est FICTIF. Un relecteur du tableau de bord pouvait croire
--        a de vrais avis clients et les reactiver.
--
-- Regle de marque (regle n°1 du depot) : « on n'invente rien ». Un temoignage
-- affiche doit correspondre a une realite verifiee. La source actuelle du site
-- reste `cms_testimonials` (lue par `lib/testimonials.ts`) ; `temoignages` n'est
-- lue par AUCUN code (ni app/, ni components/, ni lib/, ni mobile).
--
-- Remede, NON DESTRUCTIF :
--   - AUCUNE ligne n'est supprimee ni modifiee dans son texte : les 5 faux
--     temoignages restent consultables (tableau de bord, cle service).
--   - La table n'est ni renommee ni supprimee : elle reste disponible pour de
--     futurs temoignages reels.
--   - On MARQUE la provenance et on EMPECHE la publication d'un faux.
--
--   Apres cette migration :
--     - un temoignage ne peut etre visible que s'il est marque origine = 'reel' ;
--     - toute nouvelle ligne est invisible par defaut (visible = false) et
--       marquee 'fictif' tant que sa provenance n'est pas etablie ;
--     - publier un vrai temoignage demande deux gestes explicites et traces :
--       origine = 'reel' PUIS visible = true.
--
-- Idempotent : rejouer la migration ne change rien.
-- ============================================================================

begin;

-- 1. Marquer la table elle-meme, pour qu'aucun relecteur ne s'y trompe.
comment on table public.temoignages is
  'ANCIEN PROJET — NE PAS PUBLIER. Contient 5 temoignages de coaching FICTIFS '
  '(« Monica »), residus d''un ancien projet, sans rapport avec le slow travel. '
  'Aucun code ne lit cette table. La source des temoignages du site est '
  'cms_testimonials. Conservee pour de futurs temoignages REELS : dans ce cas, '
  'poser origine = ''reel'' puis visible = true (la contrainte l''impose).';

-- 2. Colonne de provenance. Les lignes existantes deviennent 'fictif' par defaut,
--    ce qui est exact : ce sont bien 5 faux temoignages.
alter table public.temoignages
  add column if not exists origine text not null default 'fictif';

comment on column public.temoignages.origine is
  'Provenance du temoignage. ''fictif'' = invente / ancien projet : JAMAIS publiable. '
  '''reel'' = temoignage verifie : seul cas ou visible peut passer a true.';

comment on column public.temoignages.visible is
  'Publication. Defaut false : rien n''est public sans un geste explicite. '
  'Un temoignage ''fictif'' ne peut pas etre visible (contrainte temoignages_publication_reelle_check).';

-- 3. Les 5 lignes existantes : provenance etablie = fictif, et on les rend
--    invisibles. Aucun texte n'est touche.
update public.temoignages
   set origine = 'fictif',
       visible = false,
       updated_at = now()
 where origine <> 'fictif' or visible = true;

-- 4. Fail-safe pour l'avenir : une nouvelle ligne est invisible tant qu'on ne
--    l'a pas publiee volontairement.
alter table public.temoignages
  alter column visible set default false;

-- 5. Les deux contraintes qui font mordre la regle.
alter table public.temoignages
  drop constraint if exists temoignages_origine_check;
alter table public.temoignages
  add constraint temoignages_origine_check
  check (origine in ('fictif', 'reel'));

alter table public.temoignages
  drop constraint if exists temoignages_publication_reelle_check;
alter table public.temoignages
  add constraint temoignages_publication_reelle_check
  check (not visible or origine = 'reel');

-- 6. Verification (lecture seule) : plus aucun temoignage fictif visible, et la
--    contrainte de publication est bien en place.
do $$
declare
  fictifs_visibles int;
  contraintes int;
begin
  select count(*) into fictifs_visibles
    from public.temoignages
   where origine = 'fictif' and visible = true;

  if fictifs_visibles > 0 then
    raise exception 'Temoignage(s) fictif(s) encore visible(s) : % ligne(s)', fictifs_visibles;
  end if;

  select count(*) into contraintes
    from pg_constraint
   where conrelid = 'public.temoignages'::regclass
     and conname = 'temoignages_publication_reelle_check';

  if contraintes <> 1 then
    raise exception 'La contrainte de publication reelle n''est pas en place.';
  end if;
end $$;

commit;
