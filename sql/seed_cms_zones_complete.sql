-- ============================================================
-- SEED COMPLET — cms_editable_zones pour Heldonica
-- Exécuter UNE FOIS pour initialiser toutes les zones modifiables
-- ============================================================

-- Nettoyage préalable (optionnel)
-- DELETE FROM cms_editable_zones;

-- ============================================================
-- GLOBAL — Navigation, Footer, Paramètres site
-- ============================================================
INSERT INTO cms_editable_zones (page, zone_key, zone_type, value) VALUES
('global', 'nav_item_1_label', 'text', 'Accueil'),
('global', 'nav_item_1_url', 'text', '/'),
('global', 'nav_item_2_label', 'text', 'Destinations'),
('global', 'nav_item_2_url', 'text', '/destinations'),
('global', 'nav_item_3_label', 'text', 'Blog'),
('global', 'nav_item_3_url', 'text', '/blog'),
('global', 'nav_item_4_label', 'text', 'Services'),
('global', 'nav_item_4_url', 'text', '/travel-planning'),
('global', 'nav_item_5_label', 'text', 'Consulting hôtelier'),
('global', 'nav_item_5_url', 'text', '/expert-hotelier'),
('global', 'nav_item_6_label', 'text', 'Contact'),
('global', 'nav_item_6_url', 'text', '/contact'),
('global', 'nav_item_7_label', 'text', 'À propos'),
('global', 'nav_item_7_url', 'text', '/a-propos'),
('global', 'footer_tagline', 'text', 'Slow travel vécu, conçu pour toi.'),
('global', 'footer_copyright', 'text', '© Heldonica. Tous droits réservés.'),
('global', 'newsletter_placeholder', 'text', 'ton@email.fr'),
('global', 'newsletter_cta', 'text', 'S''abonner'),
('global', 'primary_cta_label', 'text', 'Planifier mon voyage'),
('global', 'primary_cta_url', 'text', '/travel-planning')
ON CONFLICT (page, zone_key) DO NOTHING;

-- ============================================================
-- HOME — Hero, sections, stats, CTA
-- ============================================================
INSERT INTO cms_editable_zones (page, zone_key, zone_type, value) VALUES
('home', 'hero_badge', 'text', 'Slow travel vécu en duo · Hors sentiers · Paris'),
('home', 'hero_line_1', 'text', 'On ferme les ordis.'),
('home', 'hero_line_2', 'text', 'On part.'),
('home', 'hero_line_3', 'text', 'On revient avec des pépites qu''on n''avait pas cherchées.'),
('home', 'hero_tagline', 'text', 'Un duo qui fabrique des voyages authentiques sur mesure — là où les autres passent sans regarder.'),
('home', 'hero_cta_1_label', 'text', 'Lire le carnet →'),
('home', 'hero_cta_1_url', 'text', '/blog'),
('home', 'hero_cta_2_label', 'text', 'Nous écrire →'),
('home', 'hero_cta_2_url', 'text', '/travel-planning-form'),
('home', 'section_story_badge', 'text', 'Notre histoire'),
('home', 'section_story_title', 'text', 'Un art du voyage <span class=\"italic text-eucalyptus\">autrement</span>'),
('home', 'section_story_text_1', 'textarea', 'On est un duo. On fabrique des voyages vrais, hors des sentiers, dans les endroits que les autres ne voient pas. Elle a grandi entre la Normandie et Paris, avec le voyage dans le sang depuis toujours.'),
('home', 'section_story_text_2', 'textarea', 'Lui est né à Madère, entre l''Atlantique et des falaises que les cartes n''ont pas encore toutes nommées.'),
('home', 'section_story_text_3', 'textarea', 'Notre regard est né à deux, entre Paris, Madère et la Roumanie. On ferme les ordis, on part, on revient, on note ce qui tient vraiment sur le terrain.'),
('home', 'section_story_cta', 'text', 'Lire le carnet →'),
('home', 'section_featured_badge', 'text', '✦ À la une'),
('home', 'section_featured_cta', 'text', 'Lire le carnet →'),
('home', 'section_travel_badge', 'text', '✦ Carnets de voyage'),
('home', 'section_travel_title', 'text', 'Nos itinéraires vécus'),
('home', 'section_travel_text', 'text', 'Chaque itinéraire qu''on propose, on l''a fait. Plusieurs fois. En conditions réelles, pas en press trip.'),
('home', 'section_travel_cta', 'text', 'Voir tous les carnets →'),
('home', 'section_food_badge', 'text', 'Pépites terrain'),
('home', 'section_food_title', 'text', 'Pépites dénichées'),
('home', 'section_food_text', 'textarea', 'Ce qu''on a trouvé en chemin — pas ce qu''on a lu ailleurs. Des boulangeries de quartier aux itinéraires de rando, des marchés de terroir aux coins de baignade que même Google Maps ne liste pas encore.'),
('home', 'section_food_cta', 'text', 'Voir toutes les pépites →'),
('home', 'section_latest_badge', 'text', '✦ Fraîchement publié'),
('home', 'section_latest_title', 'text', 'Les dernières pépites'),
('home', 'section_latest_cta', 'text', 'Tout voir →'),
('home', 'section_destinations_badge', 'text', '✦ Nos territoires'),
('home', 'section_destinations_title_1', 'text', 'Des lieux qu''on a aimés,'),
('home', 'section_destinations_title_2', 'text', 'qu''on comprend vraiment.'),
('home', 'section_destinations_text', 'text', 'Madère, Roumanie, Monténégro, Sicile… On ne parle que de ce qu''on a vécu. Chaque destination est un carnet qu''on continue d''écrire.'),
('home', 'section_destinations_cta', 'text', 'Explorer toutes les destinations →'),
('home', 'section_cta_badge', 'text', 'Travel Planning · terrain vécu'),
('home', 'section_cta_title_1', 'text', 'On ne fait pas des itinéraires.'),
('home', 'section_cta_title_2', 'text', 'On fait le tien.'),
('home', 'section_cta_text', 'textarea', 'Tu nous envoies tes contraintes réelles — temps, budget, énergie, envie. On transforme ça en séquence concrète, avec les adresses qu''on a testées et l''ordre qui a du sens sur le terrain.'),
('home', 'section_cta_subtext', 'text', 'Notre terrain naturel : les couples qui veulent ralentir sans s''ennuyer, les solos qui cherchent du vrai, les familles qui en ont marre des parcs d''attractions.'),
('home', 'section_cta_btn_1', 'text', 'Nous écrire →'),
('home', 'section_cta_btn_2', 'text', 'Voir nos services →'),
('home', 'stat_country_count', 'text', '4+'),
('home', 'stat_country_label', 'text', 'Ans de slow travel'),
('home', 'stat_addresses_count', 'text', '100+'),
('home', 'stat_addresses_label', 'text', 'Adresses vécues'),
('home', 'stat_pays_count', 'text', '7+'),
('home', 'stat_pays_label', 'text', 'Pays habités'),
('home', 'stat_carnets_count', 'text', '25+'),
('home', 'stat_carnets_label', 'text', 'Carnets publiés')
ON CONFLICT (page, zone_key) DO NOTHING;

-- ============================================================
-- A-PROPOS — Bio, valeurs, stats
-- ============================================================
INSERT INTO cms_editable_zones (page, zone_key, zone_type, value) VALUES
('a-propos', 'hero_title_1', 'text', 'On n''est pas des guides.'),
('a-propos', 'hero_title_2', 'text', 'On est des voyageurs.'),
('a-propos', 'hero_text', 'text', 'Un duo qui a tout quitté pour voyager vrai. Et qui t''aide à en faire autant.'),
('a-propos', 'hero_image_url', 'image', 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&q=70'),
('a-propos', 'section_story_badge', 'text', 'Notre histoire'),
('a-propos', 'section_story_title', 'text', 'D''où on vient'),
('a-propos', 'bio_text_1', 'textarea', 'Lui est né à Madère, entre l''Atlantique et des falaises que les cartes n''ont pas encore toutes nommées. Elle a grandi entre la Normandie et Paris, avec le voyage dans le sang depuis toujours.'),
('a-propos', 'bio_text_2', 'textarea', 'On s''est rencontrés à Paris. Et très vite, on a compris qu''on avait la même façon de voir un voyage : pas comme une checklist de lieux à cocher, mais comme une expérience à vivre pleinement.'),
('a-propos', 'bio_text_3', 'textarea', 'En 2019, on a décidé de faire autrement. De ralentir. De prendre le temps de comprendre les endroits où on allait, plutôt que de les traverser.'),
('a-propos', 'bio_text_4', 'textarea', 'Aujourd''hui, on documente ce qu''on vit — parce qu''on croit que les meilleures infos sont celles qu''on trouve sur le terrain, pas dans les blogs sponsorisés.'),
('a-propos', 'stat_1_value', 'text', '7'),
('a-propos', 'stat_1_label', 'text', 'Pays habités'),
('a-propos', 'stat_2_value', 'text', '25+'),
('a-propos', 'stat_2_label', 'text', 'Carnets publiés'),
('a-propos', 'stat_3_value', 'text', '4'),
('a-propos', 'stat_3_label', 'text', 'Ans de slow travel'),
('a-propos', 'section_philo_badge', 'text', 'Notre philosophie'),
('a-propos', 'section_philo_title', 'text', 'Trois piliers qu''on ne négocie pas'),
('a-propos', 'pillar_1_title', 'text', 'Lent, pas lazy'),
('a-propos', 'pillar_1_text', 'textarea', 'Ralentir pour mieux voir. Prendre le temps de comprendre un quartier, une culture, une cuisine. Le voyage qui compte vraiment demande de la présence.'),
('a-propos', 'pillar_2_title', 'text', 'Vrai, pas parfait'),
('a-propos', 'pillar_2_text', 'textarea', 'Le voyage testé, pas fantasmé. Les restaurants où le patron te reconnaît, les sentiers qui n''existent sur aucune carte, les erreurs qui deviennent des histoires.'),
('a-propos', 'pillar_3_title', 'text', 'Sur mesure, pas en série'),
('a-propos', 'pillar_3_text', 'textarea', 'Chaque voyage est unique. On ne copie pas un itinéraire, on construit avec toi — tes envies, ton rythme, tes contraintes.'),
('a-propos', 'section_services_badge', 'text', 'Ce qu''on fait'),
('a-propos', 'section_services_title', 'text', 'Concrètement, on fait quoi ?'),
('a-propos', 'service_1_title', 'text', 'Blog & Carnets'),
('a-propos', 'service_1_text', 'textarea', 'On documente ce qu''on vit vraiment. Pas des listes copiées d''internet, des récits avec les erreurs, les surprises, le vrai — ce qu''on te cache ailleurs.'),
('a-propos', 'service_1_cta', 'text', 'Lire les carnets →'),
('a-propos', 'service_2_title', 'text', 'Travel Planning'),
('a-propos', 'service_2_text', 'textarea', 'On conçoit ton voyage sur mesure. Un brief, un échange humain, un carnet de route pensé pour toi — avec les adresses qu''on a vraiment testées.'),
('a-propos', 'service_2_cta', 'text', 'Concevoir mon voyage →'),
('a-propos', 'service_3_title', 'text', 'Consulting Hôtelier'),
('a-propos', 'service_3_text', 'textarea', 'On accompagne les hôteliers indépendants qui veulent réduire leur dépendance aux OTA. Contenu, stratégie digitale, positionnement.'),
('a-propos', 'service_3_cta', 'text', 'Voir l''offre B2B →'),
('a-propos', 'quote_text', 'text', 'On ne te recommande que ce qu''on serait prêts à conseiller à nos proches.'),
('a-propos', 'contact_email', 'text', 'contact@heldonica.fr')
ON CONFLICT (page, zone_key) DO NOTHING;

-- ============================================================
-- CONTACT
-- ============================================================
INSERT INTO cms_editable_zones (page, zone_key, zone_type, value) VALUES
('contact', 'hero_badge', 'text', 'On lit tous les messages. On répond.'),
('contact', 'hero_title', 'text', 'Parle-nous de ce qui est vrai.'),
('contact', 'hero_text', 'textarea', 'Un projet encore flou, une contrainte qu''on n''ose pas mettre dans un brief, une envie qu''on n''a pas encore mise en mots : c''est très bien comme ça. On préfère partir de la vraie vie que d''un brief lissé.'),
('contact', 'form_badge', 'text', 'Ce qui nous aide'),
('contact', 'form_title', 'text', 'Quelques lignes suffisent pour commencer juste.'),
('contact', 'form_text', 'textarea', 'Où tu veux aller, ce que tu veux éviter, ce qui fatigue, ce qui compte vraiment, même en bas de chez toi. On reprend le fil à partir de là.'),
('contact', 'email_title', 'text', 'Email direct'),
('contact', 'email_text', 'text', 'Réponse humaine sous 48h, sans tunnel automatique.'),
('contact', 'instagram_title', 'text', 'Instagram'),
('contact', 'instagram_text', 'text', 'Si c''est plus simple pour toi, les DM restent ouverts.'),
('contact', 'services_title', 'text', 'Ce qu''on fait'),
('contact', 'service_1', 'text', 'Voyages sur mesure construits à partir de contraintes réelles.'),
('contact', 'service_2', 'text', 'Consulting hôtelier indépendant, vu depuis le terrain.'),
('contact', 'service_3', 'text', 'Partenariats éditoriaux et collaborations alignées avec notre voix.')
ON CONFLICT (page, zone_key) DO NOTHING;

-- ============================================================
-- TRAVEL PLANNING — Hero, promesses, étapes, tarifs, témoignages, FAQ
-- ============================================================
INSERT INTO cms_editable_zones (page, zone_key, zone_type, value) VALUES
('travel-planning', 'hero_image_url', 'image', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=1080&fit=crop'),
('travel-planning', 'hero_badge', 'text', 'Voyage sur mesure'),
('travel-planning', 'hero_title', 'text', 'Ton voyage en couple, conçu sur mesure'),
('travel-planning', 'hero_text', 'text', 'On s''occupe de tout — tu n''as qu''à vivre l''aventure.'),
('travel-planning', 'hero_cta', 'text', 'Démarrer ma demande'),
('travel-planning', 'promise_1_title', 'text', 'Itinéraire sur mesure'),
('travel-planning', 'promise_1_text', 'textarea', 'Chaque jour pensé pour vous deux — rythme slow, pépites dénichées sur le terrain.'),
('travel-planning', 'promise_2_title', 'text', 'Hébergements triés'),
('travel-planning', 'promise_2_text', 'textarea', 'Boutique-hôtels, masseries, riads — uniquement ce qu''on referait demain.'),
('travel-planning', 'promise_3_title', 'text', 'Suivi humain'),
('travel-planning', 'promise_3_text', 'textarea', 'Un interlocuteur unique du devis au retour. On reste disponibles.'),
('travel-planning', 'steps_title', 'text', 'Comment ça marche'),
('travel-planning', 'step_1_title', 'text', 'Tu remplis le formulaire'),
('travel-planning', 'step_1_text', 'text', '5 minutes pour nous dire vos envies, contraintes et budget.'),
('travel-planning', 'step_2_title', 'text', 'Proposition sous 48h'),
('travel-planning', 'step_2_text', 'text', 'On analyse, on conçoit et on vous envoie une proposition détaillée.'),
('travel-planning', 'step_3_title', 'text', 'On affine ensemble'),
('travel-planning', 'step_3_text', 'text', 'Allers-retours jusqu''à la perfection — votre voyage, pas le nôtre.'),
('travel-planning', 'step_4_title', 'text', 'Tu pars l''esprit libre'),
('travel-planning', 'step_4_text', 'text', 'Carnet de route, réservations, contacts — tout est prêt.'),
('travel-planning', 'pricing_title', 'text', 'Tarifs transparents'),
('travel-planning', 'pricing_subtitle', 'text', 'Des formules claires, sans surprise. Le devis est gratuit et sans engagement.'),
('travel-planning', 'plan_1_name', 'text', 'Essentielle'),
('travel-planning', 'plan_1_price', 'text', '250€'),
('travel-planning', 'plan_1_desc', 'text', 'Pour ceux qui veulent l''itinéraire clé en main'),
('travel-planning', 'plan_1_feature_1', 'text', 'Itinéraire jour par jour personnalisé'),
('travel-planning', 'plan_1_feature_2', 'text', 'Carnet de route PDF complet'),
('travel-planning', 'plan_1_feature_3', 'text', '1h de brief en visio pour cerner vos envies'),
('travel-planning', 'plan_1_feature_4', 'text', 'Liens directs hébergements & restaurants'),
('travel-planning', 'plan_1_cta', 'text', 'Choisir cette formule'),
('travel-planning', 'plan_2_name', 'text', 'Complète'),
('travel-planning', 'plan_2_price', 'text', '450€'),
('travel-planning', 'plan_2_desc', 'text', 'Le plus complet — on s''occupe de tout'),
('travel-planning', 'plan_2_badge', 'text', 'Le plus populaire'),
('travel-planning', 'plan_2_feature_1', 'text', 'Tout l''Essentiel'),
('travel-planning', 'plan_2_feature_2', 'text', 'Réservations hébergements incluses'),
('travel-planning', 'plan_2_feature_3', 'text', 'Accès au carnet d''adresses privé Heldonica'),
('travel-planning', 'plan_2_feature_4', 'text', 'Suivi WhatsApp pendant le voyage'),
('travel-planning', 'plan_2_cta', 'text', 'Choisir cette formule'),
('travel-planning', 'plan_3_name', 'text', 'Sur-Mesure'),
('travel-planning', 'plan_3_price', 'text', 'Sur devis'),
('travel-planning', 'plan_3_desc', 'text', 'Voyages complexes, 2+ semaines, destinations multiples'),
('travel-planning', 'plan_3_feature_1', 'text', 'Tout la Complète'),
('travel-planning', 'plan_3_feature_2', 'text', 'Itinéraires multi-destinations'),
('travel-planning', 'plan_3_feature_3', 'text', 'Événements spéciaux (lune de miel, anniversaire)'),
('travel-planning', 'plan_3_feature_4', 'text', 'Conciergerie dédiée 24/7'),
('travel-planning', 'plan_3_cta', 'text', 'Demander un devis'),
('travel-planning', 'testimonials_title', 'text', 'Ils ont voyagé avec nous'),
('travel-planning', 'testimonial_1_text', 'textarea', 'On voulait du vrai, pas du touristique. Heldonica nous a trouvé une quinta qu''on n''aurait jamais découverte seuls.'),
('travel-planning', 'testimonial_1_author', 'text', 'Sophie & Marc'),
('travel-planning', 'testimonial_1_dest', 'text', 'Madère'),
('travel-planning', 'testimonial_2_text', 'textarea', 'L''itinéraire était tellement bien pensé qu''on n''a pas eu à réfléchir une seule fois. Juste à profiter.'),
('travel-planning', 'testimonial_2_author', 'text', 'Julie & Alex'),
('travel-planning', 'testimonial_2_dest', 'text', 'Monténégro'),
('travel-planning', 'testimonial_3_text', 'textarea', 'On est partis 10 jours en Roumanie sans savoir par où commencer. Le carnet Heldonica a été notre meilleur investissement voyage.'),
('travel-planning', 'testimonial_3_author', 'text', 'Camille & Thomas'),
('travel-planning', 'testimonial_3_dest', 'text', 'Roumanie'),
('travel-planning', 'form_title', 'text', 'Prêts à partir autrement ?'),
('travel-planning', 'form_text', 'text', 'Réponds à ces quelques questions — on te fait une proposition sous 48h.'),
('travel-planning', 'success_title', 'text', 'Merci ! On a reçu ta demande.'),
('travel-planning', 'success_text', 'text', 'On te répond sous 48h ouvrées maximum. Prépare-toi à rêver — on s''occupe du reste.'),
('travel-planning', 'faq_title', 'text', 'Questions fréquentes'),
('travel-planning', 'faq_1_q', 'text', 'Dans combien de temps reçoit-on la proposition ?'),
('travel-planning', 'faq_1_a', 'textarea', 'Sous 48h ouvrées maximum. On analyse ta demande en détail avant de te répondre avec une proposition concrète.'),
('travel-planning', 'faq_2_q', 'text', 'La destination doit-elle être dans votre liste ?'),
('travel-planning', 'faq_2_a', 'textarea', 'Non — on peut aussi travailler sur une destination hors liste si elle correspond à nos valeurs slow travel. On fait des recherches approfondies pour chaque nouvelle destination.'),
('travel-planning', 'faq_3_q', 'text', 'Peut-on modifier l''itinéraire après validation ?'),
('travel-planning', 'faq_3_a', 'textarea', 'Oui, jusqu''à 2 allers-retours inclus dans la formule. On ajuste jusqu''à ce que le planning soit parfait pour vous.'),
('travel-planning', 'faq_4_q', 'text', 'Travaillez-vous avec des agences partenaires ?'),
('travel-planning', 'faq_4_a', 'textarea', 'Non. On conçoit nous-mêmes, sans commission cachée. Chaque adresse est testée ou recommandée par quelqu''un en qui on a confiance.'),
('travel-planning', 'faq_5_q', 'text', 'Est-ce adapté aux voyages en famille ?'),
('travel-planning', 'faq_5_a', 'textarea', 'On se spécialise dans les voyages en couple. Pour les familles, on peut orienter vers des ressources adaptées — mais notre cœur de métier reste le slow travel à deux.'),
('travel-planning', 'cta_title', 'text', 'Prêt(e) à partir autrement ?'),
('travel-planning', 'cta_text', 'textarea', 'Un voyage pensé pour vous, pas un itinéraire générique. Remplissez le formulaire et on vous prépare quelque chose d''unique.'),
('travel-planning', 'cta_button', 'text', 'Démarrer ma demande →')
ON CONFLICT (page, zone_key) DO NOTHING;

-- ============================================================
-- BLOG
-- ============================================================
INSERT INTO cms_editable_zones (page, zone_key, zone_type, value) VALUES
('blog', 'page_title', 'text', 'Le blog Heldonica'),
('blog', 'intro_text', 'textarea', 'Carnets de route, pépites dénichées et récits de voyage testés sur le terrain.')
ON CONFLICT (page, zone_key) DO NOTHING;

-- ============================================================
-- DESTINATIONS
-- ============================================================
INSERT INTO cms_editable_zones (page, zone_key, zone_type, value) VALUES
('destinations', 'page_title', 'text', 'Nos destinations slow travel'),
('destinations', 'intro_text', 'textarea', 'Des lieux qu''on a vraiment pris le temps de comprendre.')
ON CONFLICT (page, zone_key) DO NOTHING;

-- ============================================================
-- MENTIONS LÉGALES
-- ============================================================
INSERT INTO cms_editable_zones (page, zone_key, zone_type, value) VALUES
('mentions-legales', 'page_title', 'text', 'Mentions légales'),
('mentions-legales', 'intro_text', 'textarea', 'Informations légales du site heldonica.fr, de son éditeur et de son hébergeur.')
ON CONFLICT (page, zone_key) DO NOTHING;

-- ============================================================
-- POLITIQUE DE CONFIDENTIALITÉ
-- ============================================================
INSERT INTO cms_editable_zones (page, zone_key, zone_type, value) VALUES
('politique-confidentialite', 'page_title', 'text', 'Politique de confidentialité'),
('politique-confidentialite', 'intro_text', 'textarea', 'Cette page détaille la collecte, l''usage et la conservation de vos données sur heldonica.fr.')
ON CONFLICT (page, zone_key) DO NOTHING;

-- ============================================================
-- SLOW TRAVEL
-- ============================================================
INSERT INTO cms_editable_zones (page, zone_key, zone_type, value) VALUES
('slow-travel', 'hero_badge', 'text', 'Slow travel'),
('slow-travel', 'hero_title_line1', 'text', 'Le slow travel n''est pas une esthétique.'),
('slow-travel', 'hero_title_line2', 'text', 'C''est une façon de regarder.'),
('slow-travel', 'hero_text', 'textarea', 'On ralentit pour mieux lire un lieu, mieux choisir un rythme, mieux sentir ce qui tient vraiment. Ce n''est pas une vertu — c''est simplement plus juste.'),
('slow-travel', 'principle_1_title', 'text', 'Ralentir assez pour voir'),
('slow-travel', 'principle_1_text', 'textarea', 'Le slow travel ne consiste pas à faire moins pour cocher une valeur morale. Il consiste à laisser une journée respirer assez longtemps pour qu''un lieu commence enfin à répondre.'),
('slow-travel', 'principle_2_title', 'text', 'Revenir quand c''est nécessaire'),
('slow-travel', 'principle_2_text', 'textarea', 'On comprend rarement un terrain au premier passage. Revenir, corriger, comparer, rater mieux : c''est aussi comme ça qu''on construit Heldonica.'),
('slow-travel', 'principle_3_title', 'text', 'Chercher juste, pas loin'),
('slow-travel', 'principle_3_text', 'textarea', 'Dénicheurs de pépites, même en bas de chez toi. Le regard compte autant que la distance. Un canal, une rue, une forêt proche peuvent déjà changer la journée.'),
('slow-travel', 'quote_badge', 'text', 'Notre point de vue'),
('slow-travel', 'quote_text', 'textarea', 'Voyager lentement, ce n''est pas se retirer du monde. C''est accepter qu''un détail juste vaille mieux qu''une journée trop remplie.'),
('slow-travel', 'cta_badge', 'text', 'Continuer'),
('slow-travel', 'cta_title', 'text', 'Si cette façon de voyager te parle, on a déjà des carnets pour ça.'),
('slow-travel', 'cta_blog_label', 'text', 'Lire le carnet →'),
('slow-travel', 'cta_destinations_label', 'text', 'Voir les destinations →')
ON CONFLICT (page, zone_key) DO NOTHING;

-- ============================================================
-- TEMOIGNAGES
-- ============================================================
INSERT INTO cms_editable_zones (page, zone_key, zone_type, value) VALUES
('temoignages', 'hero_badge', 'text', 'Retours couples'),
('temoignages', 'hero_title', 'text', 'Ils ont voyagé avec nous'),
('temoignages', 'hero_text', 'textarea', 'Chaque témoignage vient d''un projet réel : un duo, une envie, un rythme. Pas de promesse générique, uniquement du vécu et des résultats concrets.'),
('temoignages', 'testimonial_1_dest', 'text', 'Madère'),
('temoignages', 'testimonial_1_quote', 'textarea', 'On voulait un voyage lent, sensoriel et sans stress. On a reçu un carnet ultra clair, avec des pépites qu''on n''aurait jamais trouvées seuls.'),
('temoignages', 'testimonial_1_couple', 'text', 'Lucie et Maxime'),
('temoignages', 'testimonial_1_result', 'text', '7 jours fluides, zéro improvisation subie'),
('temoignages', 'testimonial_2_dest', 'text', 'Sicile'),
('temoignages', 'testimonial_2_quote', 'textarea', 'Le rythme était parfait pour nous. Chaque jour avait une vraie ambiance, sans courir. Le plus : les adresses locales testées sur le terrain.'),
('temoignages', 'testimonial_2_couple', 'text', 'Inès et Adrien'),
('temoignages', 'testimonial_2_result', 'text', '5 jours construits autour de nos envies'),
('temoignages', 'testimonial_3_dest', 'text', 'Suisse'),
('temoignages', 'testimonial_3_quote', 'textarea', 'On a senti qu''il y avait du vécu dans chaque recommandation. Rien de générique. On s''est sentis accompagnés du début à la fin.'),
('temoignages', 'testimonial_3_couple', 'text', 'Camille et Théo'),
('temoignages', 'testimonial_3_result', 'text', '10 jours de voyage contemplatif en duo'),
('temoignages', 'testimonial_4_dest', 'text', 'Roumanie'),
('temoignages', 'testimonial_4_quote', 'textarea', 'On voulait sortir des circuits classiques, sans prendre de risques inutiles. Le carnet Heldonica nous a donné exactement cet équilibre.'),
('temoignages', 'testimonial_4_couple', 'text', 'Léa et Nicolas'),
('temoignages', 'testimonial_4_result', 'text', 'Transylvanie authentique, budget maîtrisé'),
('temoignages', 'cta_badge', 'text', 'Ton projet slow travel'),
('temoignages', 'cta_title', 'text', 'On construit ton itinéraire sur mesure ?'),
('temoignages', 'cta_text', 'textarea', 'Tu partages ton contexte, on te propose un cadre clair, des pépites testées, et un plan vraiment adapté à ton rythme.'),
('temoignages', 'cta_button_write', 'text', 'Nous écrire'),
('temoignages', 'cta_button_contact', 'text', 'Nous contacter')
ON CONFLICT (page, zone_key) DO NOTHING;

-- ============================================================
-- NOS SERVICES
-- ============================================================
INSERT INTO cms_editable_zones (page, zone_key, zone_type, value) VALUES
('nos-services', 'hero_image_url', 'image', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1400&q=70'),
('nos-services', 'hero_badge', 'text', 'Ce qu''on propose'),
('nos-services', 'hero_title_line1', 'text', 'Des services pensés pour'),
('nos-services', 'hero_title_line2', 'text', 'voyager autrement.'),
('nos-services', 'hero_text', 'textarea', 'Du voyage sur mesure à l''expertise hôtelière, on vous accompagne à chaque étape de votre projet.'),
('nos-services', 'section_title', 'text', 'Nos expertises'),
('nos-services', 'card_1_title', 'text', 'Travel Planning'),
('nos-services', 'card_1_text', 'textarea', 'On conçoit votre voyage sur mesure. Carnet de route PDF, hébergements triés sur le volet, pépites dénichées, support WhatsApp.'),
('nos-services', 'card_1_price', 'text', 'À partir de 149€'),
('nos-services', 'card_1_cta', 'text', 'Découvrir →'),
('nos-services', 'card_2_title', 'text', 'Expertise Hôtelière B2B'),
('nos-services', 'card_2_text', 'textarea', 'Audit complet, stratégie contenu et formation équipes pour hôteliers et gestionnaires de biens. On analyse, on optimise, on forme.'),
('nos-services', 'card_2_cta', 'text', 'En savoir plus →'),
('nos-services', 'card_3_title', 'text', 'Carnets de Voyage'),
('nos-services', 'card_3_text', 'textarea', 'Des récits de voyage authentiques, des guides pratiques et des inspirations pour voyager à votre rythme. Sans filtre.'),
('nos-services', 'card_3_cta', 'text', 'Lire le blog →'),
('nos-services', 'cta_title', 'text', 'Prêt à voyager autrement ?'),
('nos-services', 'cta_text', 'text', 'Dis-nous où tu veux aller. On s''occupe du reste.'),
('nos-services', 'cta_primary', 'text', 'Demander un voyage sur mesure →'),
('nos-services', 'cta_secondary', 'text', 'Découvrir l''offre B2B')
ON CONFLICT (page, zone_key) DO NOTHING;

-- ============================================================
-- FAQ — Questions fréquentes
-- ============================================================
INSERT INTO cms_editable_zones (page, zone_key, zone_type, value) VALUES
('faq', 'faq_1_question', 'text', 'Combien de temps à l''avance dois-je vous contacter pour un travel planning ?'),
('faq', 'faq_1_answer', 'textarea', 'Idéalement 3 à 6 semaines avant votre départ. Cela nous laisse le temps d''échanger, de construire un carnet de route personnalisé et de le tester sur le terrain si besoin.'),
('faq', 'faq_2_question', 'text', 'Quels types de voyageurs pouvez-vous accompagner ?'),
('faq', 'faq_2_answer', 'textarea', 'Couples, solos, familles et petits groupes. Notre spécialité : les voyages en couple hors des sentiers battus, mais on adapte à chaque profil.'),
('faq', 'faq_3_question', 'text', 'Quels sont vos tarifs pour un travel planning ?'),
('faq', 'faq_3_answer', 'textarea', 'Nos formules commencent à 180€ pour un week-end et vont jusqu''à 450€ pour un séjour de 2 semaines. Chaque devis est personnalisé selon la complexité et la durée.')
ON CONFLICT (page, zone_key) DO NOTHING;

-- ============================================================
-- GLOBAL — Newsletter, Instagram, CTA Travel Planning, Footer
-- ============================================================
INSERT INTO cms_editable_zones (page, zone_key, zone_type, value) VALUES
('global', 'newsletter_badge', 'text', 'Chaque semaine'),
('global', 'newsletter_title', 'text', 'Ce qu''on a vraiment trouvé, directement dans ta boîte mail'),
('global', 'newsletter_desc', 'textarea', 'Une adresse, un timing, une erreur à éviter. Rien de plus.'),
('global', 'newsletter_placeholder', 'text', 'ton@email.fr'),
('global', 'newsletter_cta', 'text', 'Je m''abonne'),
('global', 'newsletter_cta_loading', 'text', '…'),
('global', 'newsletter_success_title', 'text', 'C''est noté !'),
('global', 'newsletter_success_subtext', 'text', 'Vérifie ta boîte mail, on arrive doucement.'),
('global', 'newsletter_error_invalid', 'text', 'Adresse email invalide.'),
('global', 'newsletter_error_generic', 'text', 'Une erreur est survenue. Réessaie.'),
('global', 'newsletter_error_network', 'text', 'Connexion impossible. Réessaie dans quelques instants.'),
('global', 'newsletter_disclaimer', 'textarea', 'En t''inscrivant, tu acceptes de recevoir nos carnets de voyage. Désinscription possible à tout moment.'),
('global', 'instagram_section_title', 'text', 'Sur le terrain, pas en studio'),
('global', 'instagram_cta_text', 'text', 'Nous suivre sur Instagram @heldonica →'),
('global', 'cta_travel_planning_title', 'text', 'Tu veux qu''on conçoive ton aventure sur mesure ?'),
('global', 'cta_travel_planning_text', 'textarea', 'On prend en charge tout le planning, toi tu n''as plus qu''à partir.'),
('global', 'cta_travel_planning_cta', 'text', 'Découvrir le Travel Planning'),
('global', 'footer_copyright', 'text', '© {year} Heldonica. Tous droits réservés.'),
('global', 'footer_email', 'text', 'contact@heldonica.fr'),
('global', 'social_instagram_url', 'text', 'https://www.instagram.com/heldonica/'),
('global', 'social_youtube_url', 'text', 'https://www.youtube.com/@heldonica'),
('global', 'social_pinterest_url', 'text', 'https://fr.pinterest.com/heldonica'),
('global', 'nav_footer_title', 'text', 'Navigation'),
('global', 'destinations_footer_title', 'text', 'Destinations'),
('global', 'guides_footer_title', 'text', 'Guides gratuits'),
('global', 'legal_footer_title', 'text', 'Legal'),
('global', 'footer_dest_item_1_label', 'text', 'Madère'),
('global', 'footer_dest_item_1_url', 'text', '/destinations/madere'),
('global', 'footer_dest_item_2_label', 'text', 'Roumanie'),
('global', 'footer_dest_item_2_url', 'text', '/destinations/roumanie'),
('global', 'footer_dest_item_3_label', 'text', 'Monténégro'),
('global', 'footer_dest_item_3_url', 'text', '/destinations/montenegro'),
('global', 'footer_dest_item_4_label', 'text', 'Grèce'),
('global', 'footer_dest_item_4_url', 'text', '/destinations/grece'),
('global', 'footer_dest_item_5_label', 'text', 'Colombie'),
('global', 'footer_dest_item_5_url', 'text', '/destinations/colombie'),
('global', 'footer_guide_item_1_label', 'text', 'Guide Madère'),
('global', 'footer_guide_item_1_url', 'text', '/guides/top-10-pepites-madere'),
('global', 'footer_guide_item_2_label', 'text', 'Guides pratiques'),
('global', 'footer_guide_item_2_url', 'text', '/blog?categorie=Guides Pratiques'),
('global', 'footer_guide_item_3_label', 'text', 'Carnets de voyage'),
('global', 'footer_guide_item_3_url', 'text', '/blog?categorie=Carnets Voyage'),
('global', 'footer_legal_item_1_label', 'text', 'Mentions légales'),
('global', 'footer_legal_item_1_url', 'text', '/mentions-legales'),
('global', 'footer_legal_item_2_label', 'text', 'Politique de confidentialité'),
('global', 'footer_legal_item_2_url', 'text', '/politique-confidentialite'),
('global', 'footer_legal_item_3_label', 'text', 'Programme partenaires'),
('global', 'footer_legal_item_3_url', 'text', '/politique-affiliation')
ON CONFLICT (page, zone_key) DO NOTHING;
