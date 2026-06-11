-- Migration: Create newsletter_subscribers table
-- Date: 2026-06-10
-- Description: Table for tracking newsletter subscriptions

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'popup',
  confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow insert from authenticated users (service role)
CREATE POLICY "insert_newsletter_subscribers" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Policy: Allow select from authenticated users
CREATE POLICY "select_newsletter_subscribers" ON newsletter_subscribers
  FOR SELECT USING (true);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_created_at ON newsletter_subscribers(created_at DESC);