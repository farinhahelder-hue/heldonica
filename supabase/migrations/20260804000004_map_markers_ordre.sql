-- ===========================================================================
-- Ordre d'affichage des marqueurs de la carte.
--
-- La liste sous la carte suivait l'ordre du fichier : Madère en tête, puis
-- chaque région groupée. Lus par slug, les marqueurs remontaient classés
-- alphabétiquement — Bogotá d'abord. Cette colonne restitue le choix éditorial
-- et le rend modifiable depuis la base.
--
-- Pas ajoutée à la migration initiale : celle-ci est déjà appliquée en base, et
-- la rejouer ne créerait pas la colonne (CREATE TABLE IF NOT EXISTS).
--
-- Pas de trous entre les valeurs (10, 20, 30…) : insérer un marqueur entre deux
-- existants ne demande pas de renuméroter.
--
-- Idempotente.

ALTER TABLE public.map_markers
  ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 999;

UPDATE public.map_markers SET display_order = CASE slug
    WHEN 'madere' THEN 10
    WHEN 'funchal' THEN 20
    WHEN 'porto-moniz' THEN 30
    WHEN 'cabo-girao' THEN 40
    WHEN 'sicile' THEN 50
    WHEN 'palerme' THEN 60
    WHEN 'taormine' THEN 70
    WHEN 'cagliari' THEN 80
    WHEN 'roumanie' THEN 90
    WHEN 'bucarest' THEN 100
    WHEN 'brasov' THEN 110
    WHEN 'cluj' THEN 120
    WHEN 'sibiu' THEN 130
    WHEN 'lisbonne' THEN 140
    WHEN 'porto' THEN 150
    WHEN 'paris' THEN 160
    WHEN 'versailles' THEN 170
    WHEN 'giverny' THEN 180
    WHEN 'fontainebleau' THEN 190
    WHEN 'cote-albatre' THEN 200
    WHEN 'le-havre' THEN 210
    WHEN 'colombie' THEN 220
    WHEN 'bogota' THEN 230
    WHEN 'medellin' THEN 240
    ELSE display_order
  END;

CREATE INDEX IF NOT EXISTS map_markers_display_order_idx
  ON public.map_markers (display_order);
