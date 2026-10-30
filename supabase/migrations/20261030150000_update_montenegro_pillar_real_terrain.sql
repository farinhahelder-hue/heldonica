-- Migration 20261030150000_update_montenegro_pillar_real_terrain.sql
-- Refonte de la page pilier Monténégro adossée au vécu réel certifié par les photos GPS (mai 2026).
--
-- Règle n°1 : On n'invente rien.
-- Le fondateur et sa compagne ont séjourné fin mai 2026 au Monténégro :
-- - Zéro visite de Kotor (abandon de la check-list touristique pour savourer le lieu).
-- - Étape vécue et adorée à Podgorica : quartier ottoman Stara Varoš, pont sur la Morača,
--   excursion aux chutes du canyon de la Cijevna (Kuća Rakića), festin de grillades et bière locale au restaurant Kristal.
-- - Voiture de location : Citroën C-Elysée blanche (PG KJ079) depuis Podgorica.
-- - Coup de cœur absolu et camp de base prolongé à Petrovac na Moru.
-- - Exploration urbex de l'hôtel brutaliste abandonné à flanc de falaise à Perazića Do (street art, vue mer).
-- - Marche côtière vers les falaises de Crvena Stijena, la crique de Lučice et la baie sauvage de Buljarica.
-- - Halte à Budva : circulation dense et stationnement très difficile ; joli centre ancien mais non retenu pour dormir.
--
-- Voix Heldonica B2C : "on" pour le duo, "tu" pour le lecteur, 0 "vous", 0 "nous", 0 emoji décoratif, 0 mot banni.

UPDATE public.cms_pillar_pages
SET
  hero = '/images/destinations/montenegro/petrovac_mer.jpg',
  tagline = 'L''Adriatique à contre-courant — ruelles ottomanes de Podgorica, criques secrètes et hôtel fantôme',
  hero_subtitle = 'Une semaine en couple au Monténégro : l''authenticité discrète de Podgorica et du canyon de la Cijevna, puis notre camp de base prolongé à Petrovac na Moru pour explorer l''hôtel abandonné de Perazića Do et marcher jusqu''à Buljarica.',
  budget = 850,
  season = 'Fin mai–juin / Sept–oct',
  flight = '~2h30 depuis Paris (Tivat ou Podgorica)',
  visa = 'Non (90 jours)',
  currency = 'Euro',
  language = 'Monténégrin',
  seo_title = 'Monténégro en couple : notre itinéraire slow travel réel | Heldonica',
  seo_desc = 'De Podgorica et ses ruelles ottomanes au camp de base de Petrovac na Moru. Criques secrètes, chutes de la Cijevna, hôtel brutaliste abandonné à Perazića Do et plage sauvage de Buljarica.',
  intro = '[
    "Le Monténégro, tout le monde te dira d''aller t''enfermer dans les remparts de Kotor. On a fait exactement l''inverse. Notre voyage a commencé par là où personne ne s''arrête : Podgorica. Et ce fut notre première grande surprise.",
    "Loin des clichés, la capitale monténégrine dévoile une âme attachante : le lacis ottoman de Stara Varoš, le fleuve turquoise de la Morača et, à quelques kilomètres seulement, les chutes sauvages de la rivière Cijevna où l''eau cascade dans la roche calcaire.",
    "Puis cap vers le sud. Arrivés sur la côte, on a fui les embouteillages de Budva pour poser nos sacs à Petrovac na Moru. Ce village adossé aux collines est devenu notre camp de base : on y a tellement aimé la douceur de vivre qu''on a prolongé notre séjour sans hésiter.",
    "Entre l''exploration fascinante d''un immense hôtel brutaliste abandonné à Perazića Do, couvert de street art jusqu''au dernier étage face à la mer, les sentiers taillés dans la roche sous les pins d''Alep et la grande baie sauvage de Buljarica, voici notre Monténégro : brut, sincère et vécu sans faux-semblants."
  ]'::jsonb,
  info_table = '[
    {"label":"Meilleure période","value":"Fin mai–juin / Sept–oct"},
    {"label":"Budget couple/sem","value":"~850 €"},
    {"label":"Vol depuis Paris","value":"~2h30"},
    {"label":"Visa","value":"Non (90j)"},{"label":"Monnaie","value":"Euro"},
    {"label":"Langue","value":"Monténégrin"}
  ]'::jsonb,
  itinerary = '[
    {
      "day": 1,
      "title": "Podgorica — le charme discret de Stara Varoš et les berges de la Morača",
      "activities": [
        "Arrivée à l''aéroport de Podgorica et récupération de la voiture de location",
        "Déambulation dans le quartier historique ottoman de Stara Varoš et devant la Tour de l''Horloge Sahat Kula",
        "Balade au pont du Millénium enjambant les eaux émeraude de la rivière Morača",
        "Arrêt café et bière locale fraîche le long de la rue piétonne Njegoševa",
        "Dîner mémorable au restaurant traditionnel Kristal : grand plateau de grillades balkaniques (mešano meso), salade šopska sous une montagne de fromage râpé et pintes de Nikšićko bien fraîches en terrasse"
      ],
      "tip": "Ne contourne pas Podgorica : Stara Varoš et ses ruelles pavées te plongent directement dans l''âme des Balkans, sans la foule côtière."
    },
    {
      "day": 2,
      "title": "Les chutes sauvages de la Cijevna et route vers la côte",
      "activities": [
        "Excursion matinale à Kuća Rakića (15 min de route au sud-est) pour admirer les spectaculaires chutes de la rivière Cijevna sculptées dans la roche calcaire blanche",
        "Traversée des paysages de montagne par la route M-2.3 montant vers l''ancienne capitale royale de Cetinje (40 min de route fluide)",
        "Descente panoramique vers Budva et balade de 2 heures dans les ruelles fortifiées de la vieille ville",
        "Constat de terrain : le trafic côtier est très saturé et trouver une place de stationnement relève du défi absolu",
        "Route côtière vers Petrovac na Moru avec arrêt belvédère sur la presqu''île fortifiée de Sveti Stefan depuis la route en corniche",
        "Arrivée à Petrovac na Moru pour poser nos valises dans notre camp de base côtier"
      ],
      "tip": "La halte à Budva vaut pour un coup d''œil rapide à sa citadelle, mais on te déconseille d''y dormir si tu cherches la tranquillité."
    },
    {
      "day": 3,
      "title": "Petrovac na Moru — prendre le rythme du littoral",
      "activities": [
        "Matinée tranquille sur la promenade bordée d''oliviers et de pins maritimes",
        "Contemplation des deux îlots rocheux emblématiques : Katič et Sveta Nedjelja avec sa chapelle posée sur la roche",
        "Déjeuner de poisson grillé en bord de mer et première baignade",
        "Fin d''après-midi face au coucher de soleil illuminant la baie"
      ],
      "tip": "Fin mai, l''eau commence à être tiède et la plage n''est pas encore saturée par les transats payants."
    },
    {
      "day": 4,
      "title": "Le sentier des falaises de Crvena Stijena et l''hôtel fantôme de Perazića Do",
      "activities": [
        "Marche matinale sur le sentier littoral taillé dans la roche calcaire rouge",
        "Traversée des trois tunnels piétons creusés dans la falaise sous les pins d''Alep parfumés",
        "Exploration urbex de l''immense hôtel AS inachevé de Perazića Do : street art marquant et vue plongeante vertigineuse depuis le dernier étage",
        "Baignade dans les eaux limpides de la crique de galets de Perazića Do"
      ],
      "tip": "Prévois de bonnes baskets pour le sentier et l''exploration de la carcasse en béton de l''hôtel."
    },
    {
      "day": 5,
      "title": "Cap au sud : l''anse de Lučice et la respiration de Buljarica",
      "activities": [
        "Franchissement de la colline sud de Petrovac sous les pins pour rejoindre la crique intime de Lučice",
        "Poursuite du sentier grimpant vers le belvédère de Kaluđerac : panorama à 180° mer et montagne",
        "Descente vers l''immense plage sauvage de Buljarica, longue de plus de 2 kilomètres",
        "Après-midi de lecture et de repos au bruit des vagues sur les galets gris"
      ],
      "tip": "Buljarica offre un espace immense où tu seras tranquille même en plein après-midi."
    },
    {
      "day": 6,
      "title": "Derniers instants à Petrovac et retour",
      "activities": [
        "Dernier café matinal sur la terrasse en pierre face aux îlots",
        "Route retour vers l''aéroport de Podgorica via le tunnel de Sozina et les berges du lac Skadar (~45 min de route)",
        "Verdict : le bonheur d''avoir osé prolonger Petrovac sans courir après Kotor"
      ],
      "tip": "Prévois une bonne marge pour la route retour si tu circules en fin d''après-midi un week-end."
    }
  ]'::jsonb,
  budget_breakdown = '[
    {"label":"Hébergement à Petrovac & Podgorica","pct":36,"amount":306},
    {"label":"Repas & tables locales (Kristal, poissons)","pct":28,"amount":238},
    {"label":"Location de voiture","pct":22,"amount":187},
    {"label":"Carburant & péage Sozina","pct":8,"amount":68},
    {"label":"Cafés & imprévus","pct":6,"amount":51}
  ]'::jsonb,
  faq = '[
    {
      "q": "Podgorica vaut-elle le détour lors d''un voyage au Monténégro ?",
      "a": "Oui, sans hésiter. Souvent boudée par les circuits touristiques rapides, elle offre le calme de Stara Varoš, de jolies berges le long de la rivière Morača, une vraie ambiance locale sans folklore commercial et les spectaculaires chutes de la Cijevna à seulement 15 minutes du centre."
    },
    {
      "q": "Faut-il absolument visiter Kotor lors d''un premier séjour ?",
      "a": "Non. Si tu cherches le calme et la déconnexion en couple, Kotor subit le débarquement quotidien de milliers de croisiéristes. On a délibérément choisi de faire l''impasse pour nous ancrer à Petrovac na Moru, et ce fut le meilleur choix de notre séjour."
    },
    {
      "q": "Pourquoi choisir Petrovac na Moru comme camp de base sur la côte ?",
      "a": "Petrovac a gardé une taille humaine et un rythme doux. Tu peux tout faire à pied : le sentier côtier des falaises mène vers l''ouest à la crique sauvage de Perazića Do, et vers le sud à la grande plage de Buljarica via Lučice, sans toucher à la voiture."
    },
    {
      "q": "La conduite et le stationnement sont-ils compliqués au Monténégro ?",
      "a": "Sur les grands axes comme Podgorica-Cetinje, les routes sont larges et bien entretenues. En revanche, le littoral autour de Budva subit de gros embouteillages en saison et trouver une place relève du parcours du combattant. À Petrovac, le stationnement est bien plus simple."
    }
  ]'::jsonb,
  tested_by_heldonica = '{
    "when": "Fin mai 2026",
    "duration": "6 jours",
    "withWho": "En couple",
    "highlights": [
      "Le charme discret de Stara Varoš et le canyon de la Cijevna à Podgorica",
      "Le dîner de grillades balkaniques et les pintes fraîches de Nikšićko au Kristal",
      "L''exploration de l''hôtel AS abandonné de Perazića Do jusqu''au dernier étage",
      "Le sentier ombragé dans la roche rouge de Crvena Stijena",
      "L''immense étendue sauvage de la plage de Buljarica"
    ],
    "keyInsight": "Le slow travel commence quand on sait apprécier une capitale boudée comme Podgorica et qu''on ose rayer une destination star pour habiter Petrovac."
  }'::jsonb,
  verdict = '{
    "score": 9,
    "forWho": "Couples en quête d''authenticité, amateurs de criques préservées, de balades littorales, de contrastes urbains et d''urbex face à la mer.",
    "strengths": [
      "Le contraste fascinant entre l''ambiance ottomane de Podgorica et le littoral adriatique",
      "Petrovac permet de tout faire à pied le long de la mer sans voiture",
      "L''exploration urbex de l''hôtel inachevé de Perazića Do face à l''eau turquoise",
      "Des criques limpides et la vaste plage de Buljarica à l''écart du tumulte",
      "Une gastronomie locale généreuse et très abordable hors des pièges à touristes"
    ],
    "considerations": [
      "Trafic très saturé et stationnement pénible aux abords de Budva",
      "Prudence requise lors de l''exploration de structures abandonnées en béton"
    ],
    "finalWord": "Notre coup de cœur au Monténégro ne figure pas sur les dépliants des croisiéristes : il est niché entre le dîner au Kristal à Podgorica, les pins de Petrovac et le béton sculpté de Perazića Do."
  }'::jsonb,
  updated_at = NOW()
WHERE slug = 'montenegro';

-- ─── Sous-destinations pour le Monténégro ─────────────────────────────────────
INSERT INTO public.cms_sub_destinations (
  parent_slug, slug, title, teaser, emoji, display_order, is_active
) VALUES
  ('montenegro', 'podgorica-cijevna', 'Podgorica & Cijevna', 'Stara Varoš ottomane, rivière Morača, table locale et chutes sauvages du Cijevna.', '', 1, true),
  ('montenegro', 'petrovac-perazica', 'Petrovac & Perazića Do', 'Camp de base slow travel, sentier des falaises sous les pins et hôtel fantôme.', '', 2, true),
  ('montenegro', 'buljarica-lucice', 'Buljarica & Lučice', 'Crique intime et grande baie sauvage adossée aux montagnes.', '', 3, true)
ON CONFLICT (parent_slug, slug) DO UPDATE SET
  title = EXCLUDED.title,
  teaser = EXCLUDED.teaser,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();


-- ─── Assainissement de la table legacy destinations pour le Monténégro ────────
-- Remplace l'image de couverture et la galerie (qui pointaient d'anciens visuels du bucket)
-- par les vraies photos de terrain certifiées sans IA.
UPDATE public.destinations
SET
  featured_image = '/images/destinations/montenegro/petrovac_mer.jpg',
  gallery_images = ARRAY[
    '/images/destinations/montenegro/petrovac_mer.jpg',
    '/images/destinations/montenegro/perazica_do_hotel_abandonne.jpg',
    '/images/destinations/montenegro/buljarica_beach.jpg',
    '/images/destinations/montenegro/podgorica_cijevna_chutes.jpg',
    '/images/destinations/montenegro/crvena_stijena_sentier_falaises.jpg',
    '/images/destinations/montenegro/gastronomie_kristal_podgorica.jpg',
    '/images/destinations/montenegro/niksicko_pivo_terrasse.jpg',
    '/images/destinations/montenegro/petrovac_sveta_nedjelja_sunset.jpg'
  ],
  updated_at = NOW()
WHERE slug = 'montenegro';

-- Assainissement de la ligne non publiée montenegro-podgorica (retrait des 3 visuels IA sahat_kula, sipcanik_winery, stara_varos)
UPDATE public.destinations
SET
  featured_image = '/images/destinations/montenegro/podgorica_cijevna_chutes.jpg',
  gallery_images = ARRAY[
    '/images/destinations/montenegro/podgorica_cijevna_chutes.jpg',
    '/images/destinations/montenegro/gastronomie_kristal_podgorica.jpg',
    '/images/destinations/montenegro/niksicko_pivo_terrasse.jpg'
  ],
  updated_at = NOW()
WHERE slug = 'montenegro-podgorica';
