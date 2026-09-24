-- Migration: Phase 6 - Travel Planning CRM
-- Adds notes_internes column to demandes_travel for CRM use

BEGIN;

-- Add internal notes column for CRM
ALTER TABLE demandes_travel 
ADD COLUMN IF NOT EXISTS notes_internes TEXT DEFAULT '';

-- Add email_sent tracking
ALTER TABLE demandes_travel 
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;

-- Add last status change tracking
ALTER TABLE demandes_travel 
ADD COLUMN IF NOT EXISTS statut_changed_at TIMESTAMPTZ DEFAULT NOW();

-- Add conversation value (estimated from budget)
ALTER TABLE demandes_travel 
ADD COLUMN IF NOT EXISTS ca_estime NUMERIC(10,2);

COMMIT;
