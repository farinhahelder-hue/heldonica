-- ============================================================================
-- Pages hubs (portugal, normandie, colombie) : contenu piloté par le CMS
-- Date: 2026-08-01 — généré par scripts/generate-hub-pages-cms.mjs
--
-- Idempotente : ON CONFLICT (page, zone_key) DO UPDATE.

-- ─── destinations-portugal ────────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
  ('destinations-portugal', 'hero_badge', 'text', 'Destinations Portugal', 'Badge du hero'),
  ('destinations-portugal', 'hero_title', 'text', 'Portugal', 'Titre du hero'),
  ('destinations-portugal', 'hero_description', 'textarea', 'Le pays qu''on visite et revisite. Madère pour la nature, Lisbonne pour l''âme, Porto pour le vin. Le Portugal a fait le slow travel avant que le mot existe.', 'Description du hero'),
  ('destinations-portugal', 'intro_title', 'text', 'Le Portugal qu''on connaît vraiment', 'Titre d''intro'),
  ('destinations-portugal', 'intro_1', 'html', 'On a une relation particulière avec le Portugal. L''un de nous y a des racines atlantiques — Madère, forêts de lauriers, sentiers de levadas. L''autre l''a adopté séjour après séjour, de Lisbonne aux plaines de l''Alentejo.', 'Paragraphe d''intro 1'),
  ('destinations-portugal', 'intro_2', 'html', 'Ce qu''on documente, c''est le Portugal qui n''a pas changé : les marchés de village le samedi matin, les restaurants sans menus traduits, les routes de montagne à Madère où on s''arrête sans raison précise parce que la vue mérite la pause.', 'Paragraphe d''intro 2'),
  ('destinations-portugal', 'card_1_title', 'text', 'Madère', 'Carte 1 — titre'),
  ('destinations-portugal', 'card_1_tag', 'text', 'Île · Nature', 'Carte 1 — tag'),
  ('destinations-portugal', 'card_1_desc', 'textarea', 'L''île de l''éternel printemps. Forêt de Fanal dans la brume, levadas, bolo do caco. Notre destination portugaise favorite, de loin.', 'Carte 1 — description'),
  ('destinations-portugal', 'card_2_title', 'text', 'Lisbonne', 'Carte 2 — titre'),
  ('destinations-portugal', 'card_2_tag', 'text', 'Capitale · Culture', 'Carte 2 — tag'),
  ('destinations-portugal', 'card_2_desc', 'textarea', 'Les collines, les azulejos, le Tram 28 bondé qu''on évite au profit des ruelles du Mouraria. La ville qui se vit lentement.', 'Carte 2 — description'),
  ('destinations-portugal', 'card_3_title', 'text', 'Porto', 'Carte 3 — titre'),
  ('destinations-portugal', 'card_3_tag', 'text', 'Vin · Histoire', 'Carte 3 — tag'),
  ('destinations-portugal', 'card_3_desc', 'textarea', 'Le vin de Porto, les caves de Vila Nova de Gaia, les bords du Douro et les librairies du centre historique. Porto est dense et mémorable.', 'Carte 3 — description'),
  ('destinations-portugal', 'card_4_title', 'text', 'Alentejo', 'Carte 4 — titre'),
  ('destinations-portugal', 'card_4_tag', 'text', 'Rural · Terroir', 'Carte 4 — tag'),
  ('destinations-portugal', 'card_4_desc', 'textarea', 'Les plaines de liège, les villages blancs perchés, les vignerons qui vous racontent leur terroir. L''Alentejo prend son temps — et c''est tant mieux.', 'Carte 4 — description'),
  ('destinations-portugal', 'info_title', 'text', 'Ce qu''il faut savoir', 'Titre des infos pratiques'),
  ('destinations-portugal', 'info_1_title', 'text', 'Quand y aller', 'Infos 1 — titre'),
  ('destinations-portugal', 'info_1_item_1', 'html', '<span><strong>Mars – Juin</strong> — idéal sur le continent. Fleurs, douceur, prix de saison.</span>', 'Infos 1 — item 1'),
  ('destinations-portugal', 'info_1_item_2', 'html', '<span><strong>Septembre – Octobre</strong> — mer chaude, foule en baisse, vendanges en Alentejo.</span>', 'Infos 1 — item 2'),
  ('destinations-portugal', 'info_1_item_3', 'html', '<span><strong>Madère toute l''année</strong> — entre 18 et 23°C. Novembre-mars pour les cascades, juillet pour les fleurs.</span>', 'Infos 1 — item 3'),
  ('destinations-portugal', 'info_2_title', 'text', 'Budget & Logistique', 'Infos 2 — titre'),
  ('destinations-portugal', 'info_2_item_1', 'html', '<span><strong>Vols</strong> — 80–200€ A/R depuis Paris selon saison. Madère légèrement plus cher.</span>', 'Infos 2 — item 1'),
  ('destinations-portugal', 'info_2_item_2', 'html', '<span><strong>Hébergement</strong> — 60–150€/nuit. Les aldeias (villages) d''Alentejo sont souvent les meilleurs rapports qualité-prix.</span>', 'Infos 2 — item 2'),
  ('destinations-portugal', 'info_2_item_3', 'html', '<span><strong>Repas</strong> — 20–40€/personne dans un bon restaurant local. Le bacalhau à 12€ existe encore.</span>', 'Infos 2 — item 3'),
  ('destinations-portugal', 'faq_1_q', 'text', 'Quand aller au Portugal ?', 'FAQ 1 — question'),
  ('destinations-portugal', 'faq_1_a', 'textarea', 'Mars à juin pour la douceur printanière et les foules maîtrisées. Septembre-octobre pour la mer encore chaude et les prix raisonnables. Juillet-août possible mais touristique et chaud. Madère se visite toute l''année (l''île de l''éternel printemps — entre 18 et 23°C selon les saisons).', 'FAQ 1 — réponse'),
  ('destinations-portugal', 'faq_2_q', 'text', 'Comment aller au Portugal depuis Paris ?', 'FAQ 2 — question'),
  ('destinations-portugal', 'faq_2_a', 'textarea', 'Vols directs depuis Paris vers Lisbonne (2h30), Porto (2h15) ou Funchal/Madère (3h30). EasyJet, Ryanair et TAP proposent des liaisons régulières. En train via Madrid est possible mais long (environ 20h).', 'FAQ 2 — réponse'),
  ('destinations-portugal', 'faq_3_q', 'text', 'Quel est le budget pour un voyage au Portugal ?', 'FAQ 3 — question'),
  ('destinations-portugal', 'faq_3_a', 'textarea', 'En Portugal continental : 80–120€/jour/personne en hôtel confort et restaurant local. À Madère : légèrement plus (70–100€ hors vols). Lisbonne et Porto restent abordables comparé à l''Europe occidentale. L''Alentejo et les régions rurales sont les zones les plus économiques.', 'FAQ 3 — réponse'),
  ('destinations-portugal', 'faq_4_q', 'text', 'Portugal ou Madère — laquelle choisir en premier ?', 'FAQ 4 — question'),
  ('destinations-portugal', 'faq_4_a', 'textarea', 'Madère si vous cherchez nature, randonnée et dépaysement absolu. Le Portugal continental (Lisbonne + Porto + Alentejo) si vous préférez les villes, la gastronomie et les paysages variés. Les deux en combinant : Lisbonne 3 jours + vol Madère pour une semaine complet est notre schéma favori.', 'FAQ 4 — réponse'),
  ('destinations-portugal', 'cta_title', 'text', 'Un itinéraire Portugal sur mesure', 'Titre du CTA'),
  ('destinations-portugal', 'cta_text', 'textarea', 'On conçoit des carnets de route Portugal complets : Madère + continent, circuits Alentejo, combinés familles.', 'Texte du CTA')
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-normandie ────────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
  ('destinations-normandie', 'hero_badge', 'text', 'Destinations', 'Badge du hero'),
  ('destinations-normandie', 'hero_title', 'text', 'Normandie', 'Titre du hero'),
  ('destinations-normandie', 'hero_description', 'textarea', 'Falaises de craie blanche, ports de pêche authentique, histoire par chaque rue. La Normandie qu''on aime — entre mer et patrimoine.', 'Description du hero'),
  ('destinations-normandie', 'intro_1', 'html', 'Quand on pense Normandie, on imagine les plages du Débarquement, les falaises d''Étretat, Honfleur.
              Mais entre les sentiers battus, il y a une Normandie plus secrète : les petits ports de pêche, les vallons du Pays d''Auge,
              l''architecture Art Déco du Havre. <strong>C''est celle-là qu''on est allés chercher.</strong>', 'Paragraphe d''intro 1'),
  ('destinations-normandie', 'card_1_title', 'text', 'Le Havre et environs', 'Carte 1 — titre'),
  ('destinations-normandie', 'card_1_desc', 'textarea', 'Deuxième port de France, patrimoine UNESCO d''Auguste Perret. Ville reconstruite, fascinante.', 'Carte 1 — description'),
  ('destinations-normandie', 'card_2_title', 'text', 'Côte d''Albâtre', 'Carte 2 — titre'),
  ('destinations-normandie', 'card_2_desc', 'textarea', 'Les falaises de craie blanche d''Étretat aux caps. La Normandie qui coupe le souffle.', 'Carte 2 — description'),
  ('destinations-normandie', 'card_3_title', 'text', 'Pays d''Auge', 'Carte 3 — titre'),
  ('destinations-normandie', 'card_3_desc', 'textarea', 'Bocage normand, Calvados en direct, villages pittoresques et camembert fermier.', 'Carte 3 — description'),
  ('destinations-normandie', 'info_1_title', 'text', 'Quand y aller', 'Infos 1 — titre'),
  ('destinations-normandie', 'info_1_item_1', 'html', '<strong>Mai - Juin:</strong> Ideal, moins de monde', 'Infos 1 — item 1'),
  ('destinations-normandie', 'info_1_item_2', 'html', '<strong>Septembre:</strong> Fin de saison, tarifs ok', 'Infos 1 — item 2'),
  ('destinations-normandie', 'info_1_item_3', 'html', '<strong>Juillet - Aout:</strong> Peak estival, prevoyez', 'Infos 1 — item 3'),
  ('destinations-normandie', 'info_2_title', 'text', 'Budget couple', 'Infos 2 — titre'),
  ('destinations-normandie', 'info_2_item_1', 'html', '<strong>Confort:</strong> 120-180€ /nuit', 'Infos 2 — item 1'),
  ('destinations-normandie', 'info_2_item_2', 'html', '<strong>Repas:</strong> 40-60€', 'Infos 2 — item 2'),
  ('destinations-normandie', 'info_2_item_3', 'html', '<strong>Carburant:</strong>~80€ pour le roadtrip', 'Infos 2 — item 3')
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-colombie ────────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
  ('destinations-colombie', 'hero_badge', 'text', 'Destination testée', 'Badge du hero'),
  ('destinations-colombie', 'hero_title', 'text', 'Colombie', 'Titre du hero'),
  ('destinations-colombie', 'hero_subtitle', 'text', 'le pays qui a changé plus vite que sa réputation', 'Sous-titre du hero'),
  ('destinations-colombie', 'hero_description', 'textarea', 'Café, salsa, émeraudes. Medellín métamorphosée, Bogotá qui déborde de culture, et les routes du café qui n''ont pas d''équivalent.', 'Description du hero'),
  ('destinations-colombie', 'intro_1', 'html', 'La Colombie, c''est le retour. Le retour d''une destination qui a mis des années à se défaire de sa réputation, et qui s''est transformée plus vite que les voyageurs n''ont pu le réaliser.
              Bogotá la culturelle, Medellín la résiliente, Cali la sensuelle — et entre les deux, les routes du café, où l''on s''arrête dans les fincas pour comprendre ce qui pousse dans ces collines vertes.', 'Paragraphe d''intro 1'),
  ('destinations-colombie', 'intro_2', 'html', 'Ce qu''on préfère ? La façon dont les gens parlent de leur pays. Avec une fierté calme, une envie de te montrer ce qui a changé. C''est ça, la vraie Colombie lente.', 'Paragraphe d''intro 2'),
  ('destinations-colombie', 'card_1_title', 'text', 'Bogotá', 'Carte 1 — titre'),
  ('destinations-colombie', 'card_1_desc', 'textarea', 'Capitale à 2 600 m. Musées de classe mondiale, street food, graffitis engagés.', 'Carte 1 — description'),
  ('destinations-colombie', 'card_2_title', 'text', 'Medellín', 'Carte 2 — titre'),
  ('destinations-colombie', 'card_2_desc', 'textarea', 'La ville de l''éternel printemps. Innovation urbaine, quartier El Poblado, tramway.', 'Carte 2 — description'),
  ('destinations-colombie', 'card_3_title', 'text', 'Cali', 'Carte 3 — titre'),
  ('destinations-colombie', 'card_3_desc', 'textarea', 'Reine de la salsa. Valle del Cauca, ambiance décalée, feria en décembre.', 'Carte 3 — description'),
  ('destinations-colombie', 'card_4_title', 'text', 'Cartago & la région café', 'Carte 4 — titre'),
  ('destinations-colombie', 'card_4_desc', 'textarea', 'UNESCO. Fincas caféières, paysages ondulés, haciendas coloniales.', 'Carte 4 — description'),
  ('destinations-colombie', 'info_1_title', 'text', 'Meilleure période', 'Infos 1 — titre'),
  ('destinations-colombie', 'info_1_item_1', 'html', '✓ Décembre – Avril : saison sèche, idéale', 'Infos 1 — item 1'),
  ('destinations-colombie', 'info_1_item_2', 'html', '✓ Juillet – Août : festivals, Feria de Cali', 'Infos 1 — item 2'),
  ('destinations-colombie', 'info_1_item_3', 'html', '⚠ Mai – Juin : saison des pluies', 'Infos 1 — item 3'),
  ('destinations-colombie', 'info_2_title', 'text', 'Budget indicatif (duo/semaine)', 'Infos 2 — titre'),
  ('destinations-colombie', 'info_2_item_1', 'html', 'Hébergement : 50–120€/nuit', 'Infos 2 — item 1'),
  ('destinations-colombie', 'info_2_item_2', 'html', 'Repas au restaurant : 20–40€/jour', 'Infos 2 — item 2'),
  ('destinations-colombie', 'info_2_item_3', 'html', 'Vol Paris–Bogotá : ~600–900€ A/R', 'Infos 2 — item 3')
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();
