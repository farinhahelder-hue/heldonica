-- Canal Saint-Martin : l'article passe en brouillon
--
-- Son slug `canal-saint-martin-spots-secrets` porte un mot banni (« spot »,
-- FORBIDDEN_WORDS). OpenCode proposait de le renommer avec une redirection 301
-- (tâche registre 8164073d) ; décision du fondateur (18/10/2026) : « canal on
-- garde en brouillon ». Le renommage se tranchera à la remise en ligne.
-- published_at conservé : remise en ligne à l'identique.
-- Garde-fou : seulement s'il est encore publié. Idempotent.

UPDATE public.cms_blog_posts
SET status = 'draft', published = false, updated_at = NOW()
WHERE status = 'published'
  AND slug = 'canal-saint-martin-spots-secrets';
