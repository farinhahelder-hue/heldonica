-- Enable Row-Level Security for Heldonica CMS
-- Run this in Supabase SQL Editor

-- 1. Enable RLS on cms_blog_posts
ALTER TABLE public.cms_blog_posts ENABLE ROW LEVEL SECURITY;

-- 2. Create policies for cms_blog_posts
-- Allow read access to authenticated users for the CMS app
CREATE POLICY "Allow read for authenticated" ON public.cms_blog_posts
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow insert for authenticated users  
CREATE POLICY "Allow insert for authenticated" ON public.cms_blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow update for authenticated users
CREATE POLICY "Allow update for authenticated" ON public.cms_blog_posts
  FOR UPDATE
  TO authenticated
  USING (true);

-- Allow delete for authenticated users
CREATE POLICY "Allow delete for authenticated" ON public.cms_blog_posts
  FOR DELETE
  TO authenticated
  USING (true);

-- 3. Enable RLS on cms_demandes (travel requests)
ALTER TABLE public.cms_demandes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read demandes" ON public.cms_demandes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert demandes" ON public.cms_demandes
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow update demandes" ON public.cms_demandes
  FOR UPDATE TO authenticated USING (true);

-- 4. Enable RLS on cms_settings if exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cms_settings') THEN
    ALTER TABLE public.cms_settings ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Allow read settings" ON public.cms_settings
      FOR SELECT TO authenticated USING (true);
      
    CREATE POLICY "Allow update settings" ON public.cms_settings
      FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;

-- 5. Enable RLS on cms_site_content if exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cms_site_content') THEN
    ALTER TABLE public.cms_site_content ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Allow read content" ON public.cms_site_content
      FOR SELECT TO authenticated USING (true);
      
    CREATE POLICY "Allow update content" ON public.cms_site_content
      FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;

-- 6. Create helper function for service role bypass (for admin operations)
-- This should only be used by the CMS admin panel, not exposed publicly
CREATE OR REPLACE FUNCTION public.check_auth_role()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN current_setting('auth.role') = 'service_role';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: For Vercel server-side operations, use SUPABASE_SERVICE_ROLE_KEY
-- which bypasses RLS. This is safe as it's stored in server environment variables.

-- Grant permissions to anon/public users for specific read operations
-- (these don't expose sensitive data)
GRANT SELECT ON public.cms_blog_posts TO anon;
GRANT SELECT ON public.cms_demandes TO anon;

-- For public blog read access (if you want a public API)
-- CREATE POLICY "Public read blog" ON public.cms_blog_posts
--   FOR SELECT TO anon USING (published = true);