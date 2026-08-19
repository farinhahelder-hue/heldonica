-- ============================================================
-- HELDONICA — Dépublier les 3 doublons Stoos Ridge (audit du 28.07.2026, H-22)
--
-- next.config.js redirige déjà ces 3 anciens slugs en 301 vers l'article
-- canonique 'stoos-ridge-notre-aventure-sur-la-crete-panoramique', mais les
-- 3 lignes restent status='published' dans `articles` : elles continuent
-- donc à s'afficher comme cartes distinctes sur /blog et la home, à côté
-- de l'article canonique — 4 cartes quasi identiques au lieu d'une.
--
-- Cette migration les passe en brouillon (elles restent en base pour
-- l'historique / les 301 continuent de fonctionner) plutôt que de les
-- supprimer. À adapter si une autre table (cms_blog_posts) doit être
-- alignée de la même façon.
-- ============================================================

-- getAllPosts() (lib/blog-supabase.ts) filtre sur published = true, pas sur `status` :
-- les deux colonnes doivent basculer pour que l'article disparaisse réellement de /blog.
UPDATE articles
SET status = 'draft', published = false, updated_at = NOW()
WHERE slug IN (
  'stoos-ridge-la-crete-pano',
  'stoos-ridge-coucher-soleil-traversee-funiculaire',
  'stoos-ridge-notre-aventure-crete-panoramique'
);

UPDATE cms_blog_posts
SET status = 'draft', published = false, updated_at = NOW()
WHERE slug IN (
  'stoos-ridge-la-crete-pano',
  'stoos-ridge-coucher-soleil-traversee-funiculaire',
  'stoos-ridge-notre-aventure-crete-panoramique'
);
