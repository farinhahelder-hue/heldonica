-- Seed 3 blog articles for /blog page
INSERT INTO cms_blog_posts (title, slug, excerpt, category, status, published_at, featured_image, author) VALUES
('Madère en mars : ce que personne ne te dit', 'madere-en-mars', 'On y retourne chaque année et chaque fois l''île nous surprend. Voici ce qu''on a appris à force de revenir.', 'Carnets de voyage', 'published', '2026-05-15', 'https://images.unsplash.com/photo-1560719887-fe3105fa1e55?w=800&q=80', 'Heldonica'),
('Pourquoi le slow travel change la façon dont on revient', 'slow-travel-retour', 'Ce n''est pas le voyage qui change, c''est ce qu''on ramène dans nos façons de vivre au quotidien.', 'Découvertes', 'published', '2026-04-28', 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80', 'Heldonica'),
('Roumanie : les villages que les guides ne mentionnent pas', 'roumanie-villages-caches', 'Entre Sibiu et Sighișoara, il y a des routes qui n''existent que si tu sais les chercher.', 'Découvertes', 'published', '2026-04-10', 'https://images.unsplash.com/photo-1520939817895-060bdaf4fe1b?w=800&q=80', 'Heldonica')
ON CONFLICT (slug) DO NOTHING;
