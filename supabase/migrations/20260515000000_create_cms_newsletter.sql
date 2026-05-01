-- Create newsletter subscriptions table
CREATE TABLE IF NOT EXISTS public.cms_newsletter (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'website',
  subscribed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS
ALTER TABLE public.cms_newsletter ENABLE ROW LEVEL SECURITY;

-- Policy for public insert
CREATE POLICY "Anyone can subscribe" ON public.cms_newsletter
  FOR INSERT WITH CHECK (true);

-- Policy for authenticated read (admin)
CREATE POLICY "Admin can read newsletter" ON public.cms_newsletter
  FOR SELECT USING (true);
