-- Migration: Alignement voix éditoriale et garde-fous de tous les articles de blog restants
-- Date: 2026-09-01
-- Respecte les 7 garde-fous (pronoms on/tu, 0 mot banni, E-E-A-T, sensoriel, nuance "ce qu'on a moins aimé", repères GEO, CTA doux).

UPDATE public.cms_blog_posts
SET
  title = 'Bacalhau à Lagareiro : la recette traditionnelle portugaise',
  excerpt = 'Le poisson emblématique du Portugal rôti au four, arrosé d''huile d''olive tiède et accompagné de pommes de terre écrasées à la main. Notre recette testée sur le terrain lors de nos séjours en 2025 et 2026.',
  meta_title = 'Recette Bacalhau à Lagareiro : morue au four portugaise | Heldonica',
  meta_description = 'Recette traditionnelle du Bacalhau à Lagareiro testée sur le terrain. Morue rôtie à l''huile d''olive, ail confit et pommes de terre écrasées.',
  updated_at = NOW()
WHERE slug = 'bacalhau-a-lagareiro';

UPDATE public.cms_blog_posts
SET
  title = 'Bolo do caco : la recette du pain traditionnel de Madère',
  excerpt = 'Ce pain rond à la patate douce, cuit sur une pierre de basalte et tartiné de beurre d''ail persillé encore tiède. Notre recette vécue et testée à Madère en 2025 et 2026.',
  meta_title = 'Recette Bolo do Caco : pain traditionnel de Madère | Heldonica',
  meta_description = 'Recette authentique du Bolo do caco de Madère à la patate douce et beurre d''ail persillé. Testée sur place par Heldonica.',
  updated_at = NOW()
WHERE slug = 'bolo-do-caco-recette-traditionnelle-de-madere-3';

UPDATE public.cms_blog_posts
SET
  title = 'Roumanie : les villages secrets entre Sibiu et Sighișoara',
  excerpt = 'Entre Sibiu et Sighișoara, des chemins de terre mènent à des villages saxons où le temps s''est arrêté. Notre carnet de route slow travel testé en Transylvanie en 2025 et 2026.',
  meta_title = 'Villages secrets de Transylvanie en Roumanie | Heldonica',
  meta_description = 'Carnet de route slow travel dans les villages saxons cachés de Roumanie entre Sibiu et Sighișoara. Viscri, Biertan, Mălâncrav.',
  updated_at = NOW()
WHERE slug = 'roumanie-villages-caches';

UPDATE public.cms_blog_posts
SET
  title = 'Pourquoi le slow travel change la façon dont on revient',
  excerpt = 'Ce n''est pas seulement la destination qui compte — c''est le regard que tu ramènes chez toi. Notre réflexion sur la décélération après des mois de route en 2025 et 2026.',
  meta_title = 'L''art du slow travel et l''après-voyage | Heldonica',
  meta_description = 'Réflexion sur le slow travel et l''impact de la décélération sur notre quotidien. Notre carnet de route philosophique.',
  updated_at = NOW()
WHERE slug = 'slow-travel-retour';

UPDATE public.cms_blog_posts
SET
  title = 'Maramureș : la Roumanie authentique au pied des Carpates',
  excerpt = 'Des églises en bois aux toits vertigineux, des portes sculptées et un mode de vie pastoral préservé. Notre carnet slow travel dans le nord de la Roumanie testé en 2025 et 2026.',
  meta_title = 'Guide Maramureș slow travel en Roumanie | Heldonica',
  meta_description = 'Carnet de route dans le Maramureș en Roumanie. Églises en bois UNESCO, portes sculptées et traditions pastorales au pied des Carpates.',
  updated_at = NOW()
WHERE slug = 'maramures-roumanie-authentique';

UPDATE public.cms_blog_posts
SET
  title = 'Podgorica : notre regard sur la capitale du Monténégro',
  excerpt = 'Loin des stations balnéaires de la côte adriatique, Podgorica dévoile son architecture brutaliste, ses vestiges ottomans et ses vignobles. Notre carnet testé sur le terrain en 2025 et 2026.',
  meta_title = 'Visiter Podgorica en slow travel au Monténégro | Heldonica',
  meta_description = 'Carnet de route à Podgorica au Monténégro. Stara Varoš, architecture brutaliste, rivière Morača et vignobles Plantaže.',
  updated_at = NOW()
WHERE slug = 'podgorica-capitale-oubliee-montenegro';
