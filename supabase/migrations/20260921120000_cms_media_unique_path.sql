-- Un objet du stockage = une fiche. L'import Google Photos faisait un upsert
-- « on conflict (google_photo_id) » sans qu'aucune contrainte unique n'existe
-- sur cette colonne : PostgREST répondait 42P10 pour chaque photo, après le
-- téléversement. Mesuré le 21/09/2026 : 75 fichiers dans media/destinations/
-- roumanie, 0 ligne dans cms_media. Le chemin est la clé naturelle (un
-- bucket n'a qu'un objet par chemin) ; la route et la reprise s'alignent
-- dessus. Partiel : les lignes anciennes sans chemin ne bloquent pas.
CREATE UNIQUE INDEX IF NOT EXISTS cms_media_path_key
  ON public.cms_media (path)
  WHERE path IS NOT NULL;
