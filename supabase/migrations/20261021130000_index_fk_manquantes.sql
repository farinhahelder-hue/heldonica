-- Index couvrants sur les cles etrangeres qui n'en avaient pas.
--
-- Mesure a l'origine (pg_stat + advisors/performance) : 11 FK sans index,
-- dont 9 dans le schema public. Sans index, chaque suppression ou mise a jour
-- de la ligne parente declenche un parcours sequentiel de la table enfant pour
-- verifier la contrainte referentielle, et chaque jointure sur la FK aussi.
--
-- Idempotent : `if not exists`, noms d'index absents du catalogue (verifie).
-- Additif et sans effet de bord : un index ne change aucun resultat de requete.

create index if not exists agent_tasks_depends_on_idx
  on public.agent_tasks (depends_on);

create index if not exists article_map_pois_route_id_idx
  on public.article_map_pois (route_id);

create index if not exists instagram_scheduled_posts_article_id_idx
  on public.instagram_scheduled_posts (article_id);

create index if not exists ai_requests_log_api_key_id_idx
  on public.ai_requests_log (api_key_id);

-- Tables emilie_* : lecture quasi nulle aujourd'hui, mais la FK est la pour
-- garantir l'integrite ; l'index evite le scan sur suppression du parent.
create index if not exists emilie_lecons_matiere_id_idx
  on public.emilie_lecons (matiere_id);

create index if not exists emilie_exercices_matiere_id_idx
  on public.emilie_exercices (matiere_id);

create index if not exists emilie_exercices_lecon_id_idx
  on public.emilie_exercices (lecon_id);

create index if not exists emilie_lecture_questions_lecture_id_idx
  on public.emilie_lecture_questions (lecture_id);

create index if not exists purchase_order_items_purchase_order_id_idx
  on public.purchase_order_items (purchase_order_id);

create index if not exists delivery_items_delivery_id_idx
  on public.delivery_items (delivery_id);

create index if not exists delivery_items_purchase_order_item_id_idx
  on public.delivery_items (purchase_order_item_id);
