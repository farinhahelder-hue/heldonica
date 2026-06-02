-- Migration: Seed destinations from Q3 2026 editorial plan
-- Purpose: Populate destinations table with 6 new destinations
-- Date: 2026-06-02

-- Insert 6 destinations (Madère already exists)
INSERT INTO destinations (slug, title, excerpt, country, region, category, link) VALUES

-- Roumanie / Transylvanie (culture)
('roumanie-transylvanie',
 'Transylvanie secrète | Guide Heldonica',
 'Villages saxons oubliés, forêts de hêtres, châteaux sans touristes. Notre itinéraire Transylvanie slow travel en couple, avril 2026.',
 'Roumanie', 'Europe de l''Est', 'culture',
 '/destinations/roumanie'),

-- Monténégro / Podgorica (nature)
('montenegro-podgorica',
 'Monténégro & Podgorica | Guide Heldonica',
 'Podgorica comme base méconnue, Kotor sans foule, fjord de Boka. Notre itinéraire couple hors sentiers battus, mai 2026.',
 'Monténégro', 'Balkans', 'nature',
 '/destinations/montenegro'),

-- Sicile intérieure (culture)
('sicile-interieure',
 'Sicile intérieure | Guide Heldonica',
 'Agrigente, Raguse, Modica, Caltagirone. La vraie Sicile à l''intérieur des terres, testée en couple 9 jours.',
 'Italie', 'Méditerranée', 'culture',
 '/destinations/sicile'),

-- Lisbonne hors sentiers (city)
('lisbonne-hors-sentiers',
 'Lisbonne en 72h sans les touristes | Guide Heldonica',
 'Alfama secret, LX Factory le matin, ferries locaux. Lisbonne comme les Lisboètes la vivent, testée 4 fois.',
 'Portugal', 'Europe du Sud', 'city',
 '/destinations/lisbonne'),

-- Paris Canal & Marais (city)
('paris-canal-marais',
 'Paris slow travel : Canal Saint-Martin & Le Marais',
 'La Petite Ceinture, la rue du Temple, les cafés de la Villette. Paris sans les files d''attente.',
 'France', 'Europe de l''Ouest', 'city',
 '/destinations/paris'),

-- Suisse Stoos Ridge (nature)
('suisse-stoos',
 'Suisse slow travel : Stoos Ridge & lacs de montagne',
 'Le funiculaire le plus raide du monde, les crêtes du Stoos, les bains du Lötschental. Testé 6 jours.',
 'Suisse', 'Alpes', 'nature',
 '/destinations/suisse')

ON CONFLICT (slug) DO NOTHING;

-- Verification query (commented out for safety)
-- SELECT slug, country, category FROM destinations ORDER BY country;