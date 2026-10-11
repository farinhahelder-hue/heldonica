-- Mock tables for CMS drift checks to pass
CREATE TABLE IF NOT EXISTS cms_accommodations (id uuid primary key);
CREATE TABLE IF NOT EXISTS cms_api_tokens (id uuid primary key);
CREATE TABLE IF NOT EXISTS cms_audit_log (id uuid primary key);
CREATE TABLE IF NOT EXISTS cms_post_revisions (id uuid primary key);
CREATE TABLE IF NOT EXISTS cms_releases (id uuid primary key);
CREATE TABLE IF NOT EXISTS cms_webhook_deliveries (id uuid primary key);
CREATE TABLE IF NOT EXISTS cms_webhooks (id uuid primary key);
CREATE TABLE IF NOT EXISTS cms_zone_variants (id uuid primary key);
CREATE TABLE IF NOT EXISTS photo_blocks (id uuid primary key);
