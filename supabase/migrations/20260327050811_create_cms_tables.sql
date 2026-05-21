/*
  # CMS Database Schema
  
  1. New Tables
    - `cms_settings` - Site-wide settings (logo, colors, social links)
    - `cms_blog_posts` - Blog articles with full content management
    - `cms_destinations` - Travel destinations
    - `cms_media` - Uploaded media files
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated admin users
    
  3. Features
    - Full CRUD for blog posts
    - Full CRUD for destinations
    - Media library with uploads
    - Site settings management
*/

-- Create cms_settings table
CREATE TABLE IF NOT EXISTS cms_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url text,
  site_name text NOT NULL DEFAULT 'Heldonica',
  tagline text,
  primary_color text DEFAULT '#78350f',
  secondary_color text DEFAULT '#166534',
  linkedin_url text,
  instagram_url text,
  instagram_handle text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cms_blog_posts table
CREATE TABLE IF NOT EXISTS cms_blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  category text DEFAULT 'Travel',
  tags text[] DEFAULT '{}',
  featured_image text,
  author text,
  published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cms_destinations table
CREATE TABLE IF NOT EXISTS cms_destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  country text,
  description text,
  long_description text,
  featured_image text,
  gallery jsonb DEFAULT '[]',
  best_season text,
  duration text,
  difficulty text DEFAULT 'Moderate',
  highlights text[] DEFAULT '{}',
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cms_media table
CREATE TABLE IF NOT EXISTS cms_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size bigint,
  alt_text text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE cms_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_media ENABLE ROW LEVEL SECURITY;

-- Create policies for cms_settings
CREATE POLICY "Allow public read access to settings"
  ON cms_settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to update settings"
  ON cms_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert settings"
  ON cms_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policies for cms_blog_posts
CREATE POLICY "Allow public read access to published posts"
  ON cms_blog_posts FOR SELECT
  TO public
  USING (published = true);

CREATE POLICY "Allow authenticated users full access to posts"
  ON cms_blog_posts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for cms_destinations
CREATE POLICY "Allow public read access to published destinations"
  ON cms_destinations FOR SELECT
  TO public
  USING (published = true);

CREATE POLICY "Allow authenticated users full access to destinations"
  ON cms_destinations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for cms_media
CREATE POLICY "Allow public read access to media"
  ON cms_media FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users full access to media"
  ON cms_media FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON cms_blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON cms_blog_posts(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON cms_blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_destinations_slug ON cms_destinations(slug);
CREATE INDEX IF NOT EXISTS idx_destinations_published ON cms_destinations(published);
CREATE INDEX IF NOT EXISTS idx_media_file_type ON cms_media(file_type);

-- Insert default settings if none exist
INSERT INTO cms_settings (site_name, tagline, primary_color, secondary_color)
SELECT 'Heldonica', 'Explorateurs émerveillés, dénicheurs de pépites', '#78350f', '#166534'
WHERE NOT EXISTS (SELECT 1 FROM cms_settings LIMIT 1);
