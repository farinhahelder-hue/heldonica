-- ============================================================
-- HELDONICA — Corriger les fautes de titre sur l'article Maramureș (audit du 28.07.2026, H-37)
--
-- seo_title : "Maramuș" → accent/lettre manquants, devrait être "Maramureș"
-- title     : "Train delle 4h15" → "delle" est de l'italien, pas du français
-- ============================================================

UPDATE cms_blog_posts
SET title = 'Maramureș : sur les traces du train de 4h15',
    seo_title = 'Maramureș : sur les traces du train de 4h15',
    updated_at = NOW()
WHERE slug = 'maramures-train-moitie-siecle';

UPDATE articles
SET title = 'Maramureș : sur les traces du train de 4h15',
    updated_at = NOW()
WHERE slug = 'maramures-train-moitie-siecle';
