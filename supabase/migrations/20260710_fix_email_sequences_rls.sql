-- ============================================================
-- Heldonica — Security Fix: Enable RLS on email_sequences
-- Date: 2026-07-10
-- Issue: Table created without RLS enabled
-- Fix: Enable RLS with service_role only policy
-- ============================================================

-- Enable Row Level Security
ALTER TABLE IF EXISTS email_sequences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Service role only" ON email_sequences;

-- Create policy: only service_role can access this table
-- This ensures only server-side API routes (using SUPABASE_SERVICE_ROLE_KEY)
-- can read/write to this table
CREATE POLICY "Service role only" ON email_sequences
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Verify RLS is enabled
SELECT 
  'email_sequences' as table_name,
  rowsecurity as rls_enabled,
  '✅ RLS enabled' as status
FROM pg_tables 
WHERE tablename = 'email_sequences';
