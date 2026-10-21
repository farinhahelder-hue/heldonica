-- Nettoyage des emojis-icones des zones CMS (lot 2 design « carnet »).
--
-- POURQUOI UNE MIGRATION ET PAS UNE CORRECTION DE COMPOSANT
-- Les zones *_emoji / *_icon / *_badge de cms_editable_zones stockaient un
-- emoji en guise d'icone. `EditableZone` affiche la valeur de la base telle
-- quelle : la base gagne toujours sur le `fallback` JSX. Corriger les
-- composants ne changeait donc rien a l'ecran. Il fallait nettoyer la source.
--
-- CE QUE FAIT CETTE MIGRATION
--   1. Les zones qui ne contenaient QU'un emoji recoivent un nom d'icone
--      lucide (« Leaf », « Sparkles »), rendu par components/ui/CmsIcon.tsx
--      et components/inline-edit/EditableIcon.tsx.
--   2. Les emojis glisses DANS une phrase sont retires, le texte est conserve.
--
-- Les zones inactives ne sont pas touchees (elles ne sont pas rendues).
-- Idempotente : chaque WHERE porte sur la valeur exacte d'origine.

BEGIN;

-- destinations-alentejo
UPDATE cms_editable_zones SET value = 'Leaf', updated_at = now()
 WHERE page = 'destinations-alentejo' AND zone_key = 'accom_1_emoji' AND value = '🌿';
UPDATE cms_editable_zones SET value = 'Notre conseil : bookez au minimum 3 nuits, le temps de décompresser.', updated_at = now()
 WHERE page = 'destinations-alentejo' AND zone_key = 'accom_1_tip' AND value = '💡 Notre conseil : bookez au minimum 3 nuits, le temps de décompresser.';
UPDATE cms_editable_zones SET value = 'Building2', updated_at = now()
 WHERE page = 'destinations-alentejo' AND zone_key = 'accom_2_emoji' AND value = '🏘️';
UPDATE cms_editable_zones SET value = 'Notre conseil : privilégiez les établissements avec petit-déjeuner inclus.', updated_at = now()
 WHERE page = 'destinations-alentejo' AND zone_key = 'accom_2_tip' AND value = '💡 Notre conseil : privilégiez les établissements avec petit-déjeuner inclus.';
UPDATE cms_editable_zones SET value = 'Grape', updated_at = now()
 WHERE page = 'destinations-alentejo' AND zone_key = 'accom_3_emoji' AND value = '🍇';
UPDATE cms_editable_zones SET value = 'Notre conseil : contactez directement pour les meilleurs tarifs.', updated_at = now()
 WHERE page = 'destinations-alentejo' AND zone_key = 'accom_3_tip' AND value = '💡 Notre conseil : contactez directement pour les meilleurs tarifs.';
UPDATE cms_editable_zones SET value = 'Sparkle', updated_at = now()
 WHERE page = 'destinations-alentejo' AND zone_key = 'hero_badge' AND value = '✦';
UPDATE cms_editable_zones SET value = 'Landmark', updated_at = now()
 WHERE page = 'destinations-alentejo' AND zone_key = 'pepite_1_emoji' AND value = '🏛️';
UPDATE cms_editable_zones SET value = 'Verdict Heldonica : À faire le matin, avant les bus de touristes.', updated_at = now()
 WHERE page = 'destinations-alentejo' AND zone_key = 'pepite_1_verdict' AND value = '⭐ Verdict Heldonica : À faire le matin, avant les bus de touristes.';
UPDATE cms_editable_zones SET value = 'Castle', updated_at = now()
 WHERE page = 'destinations-alentejo' AND zone_key = 'pepite_2_emoji' AND value = '🏰';
UPDATE cms_editable_zones SET value = 'Verdict Heldonica : Restez y dormir, pas qu’une journée.', updated_at = now()
 WHERE page = 'destinations-alentejo' AND zone_key = 'pepite_2_verdict' AND value = '⭐ Verdict Heldonica : Restez y dormir, pas qu’une journée.';
UPDATE cms_editable_zones SET value = 'Wine', updated_at = now()
 WHERE page = 'destinations-alentejo' AND zone_key = 'pepite_3_emoji' AND value = '🍷';
UPDATE cms_editable_zones SET value = 'Verdict Heldonica : Prévoyez un driver ou un copilote.', updated_at = now()
 WHERE page = 'destinations-alentejo' AND zone_key = 'pepite_3_verdict' AND value = '⭐ Verdict Heldonica : Prévoyez un driver ou un copilote.';
UPDATE cms_editable_zones SET value = 'Waves', updated_at = now()
 WHERE page = 'destinations-alentejo' AND zone_key = 'pepite_4_emoji' AND value = '🏊';
UPDATE cms_editable_zones SET value = 'Verdict Heldonica : Demande aux locaux, ils indiquent les meilleures adresses.', updated_at = now()
 WHERE page = 'destinations-alentejo' AND zone_key = 'pepite_4_verdict' AND value = '⭐ Verdict Heldonica : Demande aux locaux, ils indiquent les meilleures adresses.';
UPDATE cms_editable_zones SET value = 'Car', updated_at = now()
 WHERE page = 'destinations-alentejo' AND zone_key = 'transport_1_emoji' AND value = '🚗';
UPDATE cms_editable_zones SET value = 'Notre conseil : réservez depuis l''aéroport de Lisbonne, compter 30-40€/jour.', updated_at = now()
 WHERE page = 'destinations-alentejo' AND zone_key = 'transport_1_tip' AND value = '💡 Notre conseil : réservez depuis l''aéroport de Lisbonne, compter 30-40€/jour.';
UPDATE cms_editable_zones SET value = 'Bus', updated_at = now()
 WHERE page = 'destinations-alentejo' AND zone_key = 'transport_2_emoji' AND value = '🚌';
-- destinations-grece
UPDATE cms_editable_zones SET value = 'Grèce — Bientôt', updated_at = now()
 WHERE page = 'destinations-grece' AND zone_key = 'hero_eyebrow' AND value = '🏛️ Grèce — Bientôt';
-- destinations-idf-fontainebleau
UPDATE cms_editable_zones SET value = 'MapPin', updated_at = now()
 WHERE page = 'destinations-idf-fontainebleau' AND zone_key = 'highlight_1_emoji' AND value = '📍';
UPDATE cms_editable_zones SET value = 'Leaf', updated_at = now()
 WHERE page = 'destinations-idf-fontainebleau' AND zone_key = 'highlight_2_emoji' AND value = '🌿';
UPDATE cms_editable_zones SET value = 'Sparkles', updated_at = now()
 WHERE page = 'destinations-idf-fontainebleau' AND zone_key = 'highlight_3_emoji' AND value = '✨';
-- destinations-idf-giverny
UPDATE cms_editable_zones SET value = 'MapPin', updated_at = now()
 WHERE page = 'destinations-idf-giverny' AND zone_key = 'highlight_1_emoji' AND value = '📍';
UPDATE cms_editable_zones SET value = 'Leaf', updated_at = now()
 WHERE page = 'destinations-idf-giverny' AND zone_key = 'highlight_2_emoji' AND value = '🌿';
UPDATE cms_editable_zones SET value = 'Sparkles', updated_at = now()
 WHERE page = 'destinations-idf-giverny' AND zone_key = 'highlight_3_emoji' AND value = '✨';
-- destinations-idf-paris
UPDATE cms_editable_zones SET value = 'MapPin', updated_at = now()
 WHERE page = 'destinations-idf-paris' AND zone_key = 'highlight_1_emoji' AND value = '📍';
UPDATE cms_editable_zones SET value = 'Leaf', updated_at = now()
 WHERE page = 'destinations-idf-paris' AND zone_key = 'highlight_2_emoji' AND value = '🌿';
UPDATE cms_editable_zones SET value = 'Sparkles', updated_at = now()
 WHERE page = 'destinations-idf-paris' AND zone_key = 'highlight_3_emoji' AND value = '✨';
-- destinations-idf-versailles
UPDATE cms_editable_zones SET value = 'MapPin', updated_at = now()
 WHERE page = 'destinations-idf-versailles' AND zone_key = 'highlight_1_emoji' AND value = '📍';
UPDATE cms_editable_zones SET value = 'Leaf', updated_at = now()
 WHERE page = 'destinations-idf-versailles' AND zone_key = 'highlight_2_emoji' AND value = '🌿';
UPDATE cms_editable_zones SET value = 'Sparkles', updated_at = now()
 WHERE page = 'destinations-idf-versailles' AND zone_key = 'highlight_3_emoji' AND value = '✨';
-- destinations-madere-achadas-da-cruz
UPDATE cms_editable_zones SET value = 'MapPin', updated_at = now()
 WHERE page = 'destinations-madere-achadas-da-cruz' AND zone_key = 'highlight_1_emoji' AND value = '📍';
UPDATE cms_editable_zones SET value = 'Leaf', updated_at = now()
 WHERE page = 'destinations-madere-achadas-da-cruz' AND zone_key = 'highlight_2_emoji' AND value = '🌿';
UPDATE cms_editable_zones SET value = 'Sparkles', updated_at = now()
 WHERE page = 'destinations-madere-achadas-da-cruz' AND zone_key = 'highlight_3_emoji' AND value = '✨';
-- destinations-madere-cabo-girao
UPDATE cms_editable_zones SET value = 'MapPin', updated_at = now()
 WHERE page = 'destinations-madere-cabo-girao' AND zone_key = 'highlight_1_emoji' AND value = '📍';
UPDATE cms_editable_zones SET value = 'Leaf', updated_at = now()
 WHERE page = 'destinations-madere-cabo-girao' AND zone_key = 'highlight_2_emoji' AND value = '🌿';
UPDATE cms_editable_zones SET value = 'Sparkles', updated_at = now()
 WHERE page = 'destinations-madere-cabo-girao' AND zone_key = 'highlight_3_emoji' AND value = '✨';
-- destinations-madere-camara-de-lobos
UPDATE cms_editable_zones SET value = 'MapPin', updated_at = now()
 WHERE page = 'destinations-madere-camara-de-lobos' AND zone_key = 'highlight_1_emoji' AND value = '📍';
UPDATE cms_editable_zones SET value = 'Leaf', updated_at = now()
 WHERE page = 'destinations-madere-camara-de-lobos' AND zone_key = 'highlight_2_emoji' AND value = '🌿';
UPDATE cms_editable_zones SET value = 'Sparkles', updated_at = now()
 WHERE page = 'destinations-madere-camara-de-lobos' AND zone_key = 'highlight_3_emoji' AND value = '✨';
-- destinations-madere-cote-est
UPDATE cms_editable_zones SET value = 'MapPin', updated_at = now()
 WHERE page = 'destinations-madere-cote-est' AND zone_key = 'highlight_1_emoji' AND value = '📍';
UPDATE cms_editable_zones SET value = 'Leaf', updated_at = now()
 WHERE page = 'destinations-madere-cote-est' AND zone_key = 'highlight_2_emoji' AND value = '🌿';
UPDATE cms_editable_zones SET value = 'Sparkles', updated_at = now()
 WHERE page = 'destinations-madere-cote-est' AND zone_key = 'highlight_3_emoji' AND value = '✨';
-- destinations-madere-estreito
UPDATE cms_editable_zones SET value = 'MapPin', updated_at = now()
 WHERE page = 'destinations-madere-estreito' AND zone_key = 'highlight_1_emoji' AND value = '📍';
UPDATE cms_editable_zones SET value = 'Leaf', updated_at = now()
 WHERE page = 'destinations-madere-estreito' AND zone_key = 'highlight_2_emoji' AND value = '🌿';
UPDATE cms_editable_zones SET value = 'Sparkles', updated_at = now()
 WHERE page = 'destinations-madere-estreito' AND zone_key = 'highlight_3_emoji' AND value = '✨';
-- destinations-madere-faial
UPDATE cms_editable_zones SET value = 'MapPin', updated_at = now()
 WHERE page = 'destinations-madere-faial' AND zone_key = 'highlight_1_emoji' AND value = '📍';
UPDATE cms_editable_zones SET value = 'Leaf', updated_at = now()
 WHERE page = 'destinations-madere-faial' AND zone_key = 'highlight_2_emoji' AND value = '🌿';
UPDATE cms_editable_zones SET value = 'Sparkles', updated_at = now()
 WHERE page = 'destinations-madere-faial' AND zone_key = 'highlight_3_emoji' AND value = '✨';
-- destinations-madere-funchal
UPDATE cms_editable_zones SET value = 'MapPin', updated_at = now()
 WHERE page = 'destinations-madere-funchal' AND zone_key = 'highlight_1_emoji' AND value = '📍';
UPDATE cms_editable_zones SET value = 'Leaf', updated_at = now()
 WHERE page = 'destinations-madere-funchal' AND zone_key = 'highlight_2_emoji' AND value = '🌿';
UPDATE cms_editable_zones SET value = 'Sparkles', updated_at = now()
 WHERE page = 'destinations-madere-funchal' AND zone_key = 'highlight_3_emoji' AND value = '✨';
-- destinations-madere-ponta-do-sol
UPDATE cms_editable_zones SET value = 'MapPin', updated_at = now()
 WHERE page = 'destinations-madere-ponta-do-sol' AND zone_key = 'highlight_1_emoji' AND value = '📍';
UPDATE cms_editable_zones SET value = 'Leaf', updated_at = now()
 WHERE page = 'destinations-madere-ponta-do-sol' AND zone_key = 'highlight_2_emoji' AND value = '🌿';
UPDATE cms_editable_zones SET value = 'Sparkles', updated_at = now()
 WHERE page = 'destinations-madere-ponta-do-sol' AND zone_key = 'highlight_3_emoji' AND value = '✨';
-- destinations-madere-portela
UPDATE cms_editable_zones SET value = 'MapPin', updated_at = now()
 WHERE page = 'destinations-madere-portela' AND zone_key = 'highlight_1_emoji' AND value = '📍';
UPDATE cms_editable_zones SET value = 'Leaf', updated_at = now()
 WHERE page = 'destinations-madere-portela' AND zone_key = 'highlight_2_emoji' AND value = '🌿';
UPDATE cms_editable_zones SET value = 'Sparkles', updated_at = now()
 WHERE page = 'destinations-madere-portela' AND zone_key = 'highlight_3_emoji' AND value = '✨';
-- destinations-madere-porto-moniz
UPDATE cms_editable_zones SET value = 'Waves', updated_at = now()
 WHERE page = 'destinations-madere-porto-moniz' AND zone_key = 'highlight_1_emoji' AND value = '🌊';
UPDATE cms_editable_zones SET value = 'Castle', updated_at = now()
 WHERE page = 'destinations-madere-porto-moniz' AND zone_key = 'highlight_2_emoji' AND value = '🏰';
UPDATE cms_editable_zones SET value = 'Car', updated_at = now()
 WHERE page = 'destinations-madere-porto-moniz' AND zone_key = 'highlight_3_emoji' AND value = '🚗';
-- destinations-madere-ribeiro-frio
UPDATE cms_editable_zones SET value = 'MapPin', updated_at = now()
 WHERE page = 'destinations-madere-ribeiro-frio' AND zone_key = 'highlight_1_emoji' AND value = '📍';
UPDATE cms_editable_zones SET value = 'Leaf', updated_at = now()
 WHERE page = 'destinations-madere-ribeiro-frio' AND zone_key = 'highlight_2_emoji' AND value = '🌿';
UPDATE cms_editable_zones SET value = 'Sparkles', updated_at = now()
 WHERE page = 'destinations-madere-ribeiro-frio' AND zone_key = 'highlight_3_emoji' AND value = '✨';
-- destinations-madere-santos
UPDATE cms_editable_zones SET value = 'MapPin', updated_at = now()
 WHERE page = 'destinations-madere-santos' AND zone_key = 'highlight_1_emoji' AND value = '📍';
UPDATE cms_editable_zones SET value = 'Leaf', updated_at = now()
 WHERE page = 'destinations-madere-santos' AND zone_key = 'highlight_2_emoji' AND value = '🌿';
UPDATE cms_editable_zones SET value = 'Sparkles', updated_at = now()
 WHERE page = 'destinations-madere-santos' AND zone_key = 'highlight_3_emoji' AND value = '✨';
-- destinations-madere-sao-vicente
UPDATE cms_editable_zones SET value = 'MapPin', updated_at = now()
 WHERE page = 'destinations-madere-sao-vicente' AND zone_key = 'highlight_1_emoji' AND value = '📍';
UPDATE cms_editable_zones SET value = 'Leaf', updated_at = now()
 WHERE page = 'destinations-madere-sao-vicente' AND zone_key = 'highlight_2_emoji' AND value = '🌿';
UPDATE cms_editable_zones SET value = 'Sparkles', updated_at = now()
 WHERE page = 'destinations-madere-sao-vicente' AND zone_key = 'highlight_3_emoji' AND value = '✨';
-- destinations-normandie-cote-albatre
UPDATE cms_editable_zones SET value = 'MapPin', updated_at = now()
 WHERE page = 'destinations-normandie-cote-albatre' AND zone_key = 'highlight_1_emoji' AND value = '📍';
UPDATE cms_editable_zones SET value = 'Leaf', updated_at = now()
 WHERE page = 'destinations-normandie-cote-albatre' AND zone_key = 'highlight_2_emoji' AND value = '🌿';
UPDATE cms_editable_zones SET value = 'Sparkles', updated_at = now()
 WHERE page = 'destinations-normandie-cote-albatre' AND zone_key = 'highlight_3_emoji' AND value = '✨';
-- destinations-normandie-le-havre
UPDATE cms_editable_zones SET value = 'MapPin', updated_at = now()
 WHERE page = 'destinations-normandie-le-havre' AND zone_key = 'highlight_1_emoji' AND value = '📍';
UPDATE cms_editable_zones SET value = 'Leaf', updated_at = now()
 WHERE page = 'destinations-normandie-le-havre' AND zone_key = 'highlight_2_emoji' AND value = '🌿';
UPDATE cms_editable_zones SET value = 'Sparkles', updated_at = now()
 WHERE page = 'destinations-normandie-le-havre' AND zone_key = 'highlight_3_emoji' AND value = '✨';
-- destinations-normandie-pays-dauge
UPDATE cms_editable_zones SET value = 'MapPin', updated_at = now()
 WHERE page = 'destinations-normandie-pays-dauge' AND zone_key = 'highlight_1_emoji' AND value = '📍';
UPDATE cms_editable_zones SET value = 'Leaf', updated_at = now()
 WHERE page = 'destinations-normandie-pays-dauge' AND zone_key = 'highlight_2_emoji' AND value = '🌿';
UPDATE cms_editable_zones SET value = 'Sparkles', updated_at = now()
 WHERE page = 'destinations-normandie-pays-dauge' AND zone_key = 'highlight_3_emoji' AND value = '✨';
-- destinations-portugal-lisbonne
UPDATE cms_editable_zones SET value = 'Sunrise', updated_at = now()
 WHERE page = 'destinations-portugal-lisbonne' AND zone_key = 'highlight_1_emoji' AND value = '🌅';
UPDATE cms_editable_zones SET value = 'Building2', updated_at = now()
 WHERE page = 'destinations-portugal-lisbonne' AND zone_key = 'highlight_2_emoji' AND value = '🏘️';
UPDATE cms_editable_zones SET value = 'CakeSlice', updated_at = now()
 WHERE page = 'destinations-portugal-lisbonne' AND zone_key = 'highlight_3_emoji' AND value = '🥧';
-- destinations-portugal-porto
UPDATE cms_editable_zones SET value = 'MapPin', updated_at = now()
 WHERE page = 'destinations-portugal-porto' AND zone_key = 'highlight_1_emoji' AND value = '📍';
UPDATE cms_editable_zones SET value = 'Leaf', updated_at = now()
 WHERE page = 'destinations-portugal-porto' AND zone_key = 'highlight_2_emoji' AND value = '🌿';
UPDATE cms_editable_zones SET value = 'Sparkles', updated_at = now()
 WHERE page = 'destinations-portugal-porto' AND zone_key = 'highlight_3_emoji' AND value = '✨';
-- destinations-roumanie-apuseni
UPDATE cms_editable_zones SET value = 'CircleDot', updated_at = now()
 WHERE page = 'destinations-roumanie-apuseni' AND zone_key = 'highlight_1_emoji' AND value = '🕳️';
UPDATE cms_editable_zones SET value = 'Droplet', updated_at = now()
 WHERE page = 'destinations-roumanie-apuseni' AND zone_key = 'highlight_2_emoji' AND value = '💧';
UPDATE cms_editable_zones SET value = 'MountainSnow', updated_at = now()
 WHERE page = 'destinations-roumanie-apuseni' AND zone_key = 'highlight_3_emoji' AND value = '🏔️';
-- destinations-roumanie-brasov
UPDATE cms_editable_zones SET value = 'MountainSnow', updated_at = now()
 WHERE page = 'destinations-roumanie-brasov' AND zone_key = 'highlight_1_emoji' AND value = '🏔️';
UPDATE cms_editable_zones SET value = 'Church', updated_at = now()
 WHERE page = 'destinations-roumanie-brasov' AND zone_key = 'highlight_2_emoji' AND value = '⛪';
UPDATE cms_editable_zones SET value = 'Blocks', updated_at = now()
 WHERE page = 'destinations-roumanie-brasov' AND zone_key = 'highlight_3_emoji' AND value = '🧱';
-- destinations-roumanie-bucarest
UPDATE cms_editable_zones SET value = 'MapPin', updated_at = now()
 WHERE page = 'destinations-roumanie-bucarest' AND zone_key = 'highlight_1_emoji' AND value = '📍';
UPDATE cms_editable_zones SET value = 'Leaf', updated_at = now()
 WHERE page = 'destinations-roumanie-bucarest' AND zone_key = 'highlight_2_emoji' AND value = '🌿';
UPDATE cms_editable_zones SET value = 'Sparkles', updated_at = now()
 WHERE page = 'destinations-roumanie-bucarest' AND zone_key = 'highlight_3_emoji' AND value = '✨';
-- destinations-roumanie-cluj
UPDATE cms_editable_zones SET value = 'Coffee', updated_at = now()
 WHERE page = 'destinations-roumanie-cluj' AND zone_key = 'highlight_1_emoji' AND value = '☕';
UPDATE cms_editable_zones SET value = 'Leaf', updated_at = now()
 WHERE page = 'destinations-roumanie-cluj' AND zone_key = 'highlight_2_emoji' AND value = '🌿';
UPDATE cms_editable_zones SET value = 'Church', updated_at = now()
 WHERE page = 'destinations-roumanie-cluj' AND zone_key = 'highlight_3_emoji' AND value = '⛪';
-- destinations-roumanie-maramures
UPDATE cms_editable_zones SET value = 'Logs', updated_at = now()
 WHERE page = 'destinations-roumanie-maramures' AND zone_key = 'highlight_1_emoji' AND value = '🪵';
UPDATE cms_editable_zones SET value = 'DoorOpen', updated_at = now()
 WHERE page = 'destinations-roumanie-maramures' AND zone_key = 'highlight_2_emoji' AND value = '🚪';
UPDATE cms_editable_zones SET value = 'Soup', updated_at = now()
 WHERE page = 'destinations-roumanie-maramures' AND zone_key = 'highlight_3_emoji' AND value = '🍲';
-- destinations-roumanie-sibiu
UPDATE cms_editable_zones SET value = 'MapPin', updated_at = now()
 WHERE page = 'destinations-roumanie-sibiu' AND zone_key = 'highlight_1_emoji' AND value = '📍';
UPDATE cms_editable_zones SET value = 'Leaf', updated_at = now()
 WHERE page = 'destinations-roumanie-sibiu' AND zone_key = 'highlight_2_emoji' AND value = '🌿';
UPDATE cms_editable_zones SET value = 'Sparkles', updated_at = now()
 WHERE page = 'destinations-roumanie-sibiu' AND zone_key = 'highlight_3_emoji' AND value = '✨';
-- destinations-roumanie-timisoara
UPDATE cms_editable_zones SET value = 'Landmark', updated_at = now()
 WHERE page = 'destinations-roumanie-timisoara' AND zone_key = 'pepite_1_icon' AND value = '🏛️';
UPDATE cms_editable_zones SET value = 'Palette', updated_at = now()
 WHERE page = 'destinations-roumanie-timisoara' AND zone_key = 'pepite_2_icon' AND value = '🎨';
UPDATE cms_editable_zones SET value = 'Home', updated_at = now()
 WHERE page = 'destinations-roumanie-timisoara' AND zone_key = 'pepite_3_icon' AND value = '🏚️';
UPDATE cms_editable_zones SET value = 'TreeDeciduous', updated_at = now()
 WHERE page = 'destinations-roumanie-timisoara' AND zone_key = 'pepite_5_icon' AND value = '🌳';
UPDATE cms_editable_zones SET value = 'Martini', updated_at = now()
 WHERE page = 'destinations-roumanie-timisoara' AND zone_key = 'pepite_6_icon' AND value = '🍸';
-- destinations-roumanie-transylvanie
UPDATE cms_editable_zones SET value = 'MapPin', updated_at = now()
 WHERE page = 'destinations-roumanie-transylvanie' AND zone_key = 'highlight_1_emoji' AND value = '📍';
UPDATE cms_editable_zones SET value = 'Leaf', updated_at = now()
 WHERE page = 'destinations-roumanie-transylvanie' AND zone_key = 'highlight_2_emoji' AND value = '🌿';
UPDATE cms_editable_zones SET value = 'Sparkles', updated_at = now()
 WHERE page = 'destinations-roumanie-transylvanie' AND zone_key = 'highlight_3_emoji' AND value = '✨';
-- guides
UPDATE cms_editable_zones SET value = 'Leaf', updated_at = now()
 WHERE page = 'guides' AND zone_key = 'guide_1_emoji' AND value = '🌿';
-- home
UPDATE cms_editable_zones SET value = 'Sparkles', updated_at = now()
 WHERE page = 'home' AND zone_key = 'pillar_1_icon' AND value = '✨';
UPDATE cms_editable_zones SET value = 'Compass', updated_at = now()
 WHERE page = 'home' AND zone_key = 'pillar_2_icon' AND value = '🧭';
UPDATE cms_editable_zones SET value = 'Banknote', updated_at = now()
 WHERE page = 'home' AND zone_key = 'pillar_3_icon' AND value = '💚';
UPDATE cms_editable_zones SET value = 'Espace Hébergeurs & Hôteliers', updated_at = now()
 WHERE page = 'home' AND zone_key = 'section_b2b_badge' AND value = '✦ Espace Hébergeurs & Hôteliers';
UPDATE cms_editable_zones SET value = 'Nos territoires', updated_at = now()
 WHERE page = 'home' AND zone_key = 'section_destinations_badge' AND value = '✦ Nos territoires';
UPDATE cms_editable_zones SET value = 'À la une', updated_at = now()
 WHERE page = 'home' AND zone_key = 'section_featured_badge' AND value = '✦ À la une';
UPDATE cms_editable_zones SET value = 'Fraîchement publié', updated_at = now()
 WHERE page = 'home' AND zone_key = 'section_latest_badge' AND value = '✦ Fraîchement publié';
UPDATE cms_editable_zones SET value = 'Quel voyageur es-tu ?', updated_at = now()
 WHERE page = 'home' AND zone_key = 'section_quiz_badge' AND value = '✦ Quel voyageur es-tu ?';
UPDATE cms_editable_zones SET value = 'Carnets de voyage', updated_at = now()
 WHERE page = 'home' AND zone_key = 'section_travel_badge' AND value = '✦ Carnets de voyage';
-- maintenance
UPDATE cms_editable_zones SET value = 'Merci de ta patience', updated_at = now()
 WHERE page = 'maintenance' AND zone_key = 'footer' AND value = 'Merci de ta patience 🌿';
-- merci
UPDATE cms_editable_zones SET value = 'On a bien reçu ton projet.', updated_at = now()
 WHERE page = 'merci' AND zone_key = 'hero_title' AND value = 'On a bien reçu ton projet. 🌍';
-- quiz
UPDATE cms_editable_zones SET value = 'MountainSnow', updated_at = now()
 WHERE page = 'quiz' AND zone_key = 'question_1_opt_1_emoji' AND value = '🏔️';
UPDATE cms_editable_zones SET value = 'Landmark', updated_at = now()
 WHERE page = 'quiz' AND zone_key = 'question_1_opt_2_emoji' AND value = '🏛️';
UPDATE cms_editable_zones SET value = 'Leaf', updated_at = now()
 WHERE page = 'quiz' AND zone_key = 'question_1_opt_3_emoji' AND value = '🌿';
UPDATE cms_editable_zones SET value = 'PersonStanding', updated_at = now()
 WHERE page = 'quiz' AND zone_key = 'question_1_opt_4_emoji' AND value = '🧘';
UPDATE cms_editable_zones SET value = 'AlarmClock', updated_at = now()
 WHERE page = 'quiz' AND zone_key = 'question_2_opt_1_emoji' AND value = '⏰';
UPDATE cms_editable_zones SET value = 'Footprints', updated_at = now()
 WHERE page = 'quiz' AND zone_key = 'question_2_opt_2_emoji' AND value = '🚶';
UPDATE cms_editable_zones SET value = 'Snail', updated_at = now()
 WHERE page = 'quiz' AND zone_key = 'question_2_opt_3_emoji' AND value = '🐢';
UPDATE cms_editable_zones SET value = 'Sun', updated_at = now()
 WHERE page = 'quiz' AND zone_key = 'question_2_opt_4_emoji' AND value = '☀️';
UPDATE cms_editable_zones SET value = 'Tent', updated_at = now()
 WHERE page = 'quiz' AND zone_key = 'question_3_opt_1_emoji' AND value = '🏕️';
UPDATE cms_editable_zones SET value = 'Castle', updated_at = now()
 WHERE page = 'quiz' AND zone_key = 'question_3_opt_2_emoji' AND value = '🏰';
UPDATE cms_editable_zones SET value = 'House', updated_at = now()
 WHERE page = 'quiz' AND zone_key = 'question_3_opt_3_emoji' AND value = '🏡';
UPDATE cms_editable_zones SET value = 'Bath', updated_at = now()
 WHERE page = 'quiz' AND zone_key = 'question_3_opt_4_emoji' AND value = '🛁';
UPDATE cms_editable_zones SET value = 'Target', updated_at = now()
 WHERE page = 'quiz' AND zone_key = 'question_4_opt_1_emoji' AND value = '🎯';
UPDATE cms_editable_zones SET value = 'MessageCircle', updated_at = now()
 WHERE page = 'quiz' AND zone_key = 'question_4_opt_2_emoji' AND value = '💬';
UPDATE cms_editable_zones SET value = 'Sparkles', updated_at = now()
 WHERE page = 'quiz' AND zone_key = 'question_4_opt_3_emoji' AND value = '✨';
UPDATE cms_editable_zones SET value = 'Sunrise', updated_at = now()
 WHERE page = 'quiz' AND zone_key = 'question_4_opt_4_emoji' AND value = '🌅';
UPDATE cms_editable_zones SET value = 'BookOpen', updated_at = now()
 WHERE page = 'quiz' AND zone_key = 'question_5_opt_1_emoji' AND value = '📖';
UPDATE cms_editable_zones SET value = 'Globe', updated_at = now()
 WHERE page = 'quiz' AND zone_key = 'question_5_opt_2_emoji' AND value = '🌍';
UPDATE cms_editable_zones SET value = 'Leaf', updated_at = now()
 WHERE page = 'quiz' AND zone_key = 'question_5_opt_3_emoji' AND value = '🍃';
UPDATE cms_editable_zones SET value = 'Heart', updated_at = now()
 WHERE page = 'quiz' AND zone_key = 'question_5_opt_4_emoji' AND value = '💝';
-- top-10-pepites-madere
UPDATE cms_editable_zones SET value = 'Télécharge gratuitement', updated_at = now()
 WHERE page = 'top-10-pepites-madere' AND zone_key = 'hero_download_label' AND value = '📥 Télécharge gratuitement';
UPDATE cms_editable_zones SET value = 'Les 10 pépites', updated_at = now()
 WHERE page = 'top-10-pepites-madere' AND zone_key = 'list_title' AND value = 'Les 10 pépites 👇';
-- travel-planning-form
UPDATE cms_editable_zones SET value = 'Coins', updated_at = now()
 WHERE page = 'travel-planning-form' AND zone_key = 'budget_1_emoji' AND value = '💛';
UPDATE cms_editable_zones SET value = 'Banknote', updated_at = now()
 WHERE page = 'travel-planning-form' AND zone_key = 'budget_2_emoji' AND value = '💚';
UPDATE cms_editable_zones SET value = 'Euro', updated_at = now()
 WHERE page = 'travel-planning-form' AND zone_key = 'budget_3_emoji' AND value = '💙';
UPDATE cms_editable_zones SET value = 'Gem', updated_at = now()
 WHERE page = 'travel-planning-form' AND zone_key = 'budget_4_emoji' AND value = '💎';
UPDATE cms_editable_zones SET value = 'MessageCircle', updated_at = now()
 WHERE page = 'travel-planning-form' AND zone_key = 'budget_5_emoji' AND value = '💬';
UPDATE cms_editable_zones SET value = 'MapPin', updated_at = now()
 WHERE page = 'travel-planning-form' AND zone_key = 'dest_1_emoji' AND value = '📍';
UPDATE cms_editable_zones SET value = 'Map', updated_at = now()
 WHERE page = 'travel-planning-form' AND zone_key = 'dest_2_emoji' AND value = '🗺️';
UPDATE cms_editable_zones SET value = 'Globe', updated_at = now()
 WHERE page = 'travel-planning-form' AND zone_key = 'dest_3_emoji' AND value = '🌐';
UPDATE cms_editable_zones SET value = 'HeartHandshake', updated_at = now()
 WHERE page = 'travel-planning-form' AND zone_key = 'trip_1_emoji' AND value = '💑';
UPDATE cms_editable_zones SET value = 'Compass', updated_at = now()
 WHERE page = 'travel-planning-form' AND zone_key = 'trip_2_emoji' AND value = '🧭';
UPDATE cms_editable_zones SET value = 'Martini', updated_at = now()
 WHERE page = 'travel-planning-form' AND zone_key = 'trip_3_emoji' AND value = '🥂';
UPDATE cms_editable_zones SET value = 'Gem', updated_at = now()
 WHERE page = 'travel-planning-form' AND zone_key = 'trip_4_emoji' AND value = '💍';
UPDATE cms_editable_zones SET value = 'Users', updated_at = now()
 WHERE page = 'travel-planning-form' AND zone_key = 'trip_5_emoji' AND value = '👨‍👩‍👧';
UPDATE cms_editable_zones SET value = 'Sparkles', updated_at = now()
 WHERE page = 'travel-planning-form' AND zone_key = 'trip_6_emoji' AND value = '✨';
UPDATE cms_editable_zones SET value = 'Leaf', updated_at = now()
 WHERE page = 'travel-planning-form' AND zone_key = 'vibe_1_emoji' AND value = '🌿';
UPDATE cms_editable_zones SET value = 'MountainSnow', updated_at = now()
 WHERE page = 'travel-planning-form' AND zone_key = 'vibe_2_emoji' AND value = '🏔️';
UPDATE cms_editable_zones SET value = 'Drama', updated_at = now()
 WHERE page = 'travel-planning-form' AND zone_key = 'vibe_3_emoji' AND value = '🎭';
UPDATE cms_editable_zones SET value = 'Recycle', updated_at = now()
 WHERE page = 'travel-planning-form' AND zone_key = 'vibe_4_emoji' AND value = '♻️';
UPDATE cms_editable_zones SET value = 'Flame', updated_at = now()
 WHERE page = 'travel-planning-form' AND zone_key = 'vibe_5_emoji' AND value = '🕯️';

-- ---------------------------------------------------------------------------
-- Deux tables portent leur propre colonne `emoji`, hors `cms_editable_zones`,
-- et alimentent directement des pages publiques :
--   cms_sub_destinations.emoji -> grille « sous-destinations » (DestinationPillar)
--   cms_seasons.emoji          -> tableau des saisons (SeasonalTable)
-- Elles sont traitées ici pour la même raison : l'emoji s'affichait tel quel.
-- ---------------------------------------------------------------------------

UPDATE cms_sub_destinations SET emoji = 'Logs'      WHERE parent_slug = 'roumanie' AND slug = 'maramures' AND emoji = '🪵';
UPDATE cms_sub_destinations SET emoji = 'TreePine'  WHERE parent_slug = 'roumanie' AND slug = 'apuseni'   AND emoji = '🌲';

UPDATE cms_seasons SET emoji = 'TreeDeciduous' WHERE emoji = '🍂';
UPDATE cms_seasons SET emoji = 'TreeDeciduous' WHERE emoji = '🍁';
UPDATE cms_seasons SET emoji = 'Umbrella'      WHERE emoji = '🏖️';
UPDATE cms_seasons SET emoji = 'Sun'           WHERE emoji = '☀️';
UPDATE cms_seasons SET emoji = 'Snowflake'     WHERE emoji = '❄️';
UPDATE cms_seasons SET emoji = 'CloudRain'     WHERE emoji = '🌧️';
UPDATE cms_seasons SET emoji = 'Flower'        WHERE emoji = '🌷';
UPDATE cms_seasons SET emoji = 'Flower2'       WHERE emoji = '🌸';
UPDATE cms_seasons SET emoji = 'Leaf'          WHERE emoji = '🌿';

COMMIT;
