-- Migration initiale Heldonica
CREATE TABLE IF NOT EXISTS destinations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom text NOT NULL,
  pays text,
  type_voyage text, -- 'couple', 'solo', 'famille'
  ecoresponsable boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);