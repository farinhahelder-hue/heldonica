import sqlite3
import os
import re
import sys

# Force stdout/stderr to use utf-8 to avoid encoding issues in Windows terminal
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# Paths
DB_PATH = r"C:\Users\farin\.gemini\antigravity\brain\a8d421c0-c053-445f-8ba5-7adabd093877\scratch\heldonica_temp.db"
OUTPUT_DIR = r"C:\Users\farin\StudioProjects\heldonica\content\salvaged"

def clean_html_content(content):
    """
    Cleans WordPress Gutenberg block comments and formatting.
    Keeps standard HTML elements like <p>, <a>, <ul>, <li>, <h2>, etc.
    """
    if not content:
        return ""
        
    # Remove Gutenberg comments e.g. <!-- wp:paragraph -->
    cleaned = re.sub(r'<!--\s*/?wp:[^>]*-->', '', content)
    
    # Replace carriage returns with standard newlines
    cleaned = cleaned.replace('\r\n', '\n').replace('\r', '\n')
    
    # Fix double newlines or excessive spacing
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
    
    return cleaned.strip()

def safe_print(msg):
    try:
        print(msg)
    except UnicodeEncodeError:
        try:
            print(msg.encode('ascii', errors='replace').decode('ascii'))
        except Exception:
            pass

def main():
    if not os.path.exists(DB_PATH):
        safe_print(f"Error: SQLite database not found at {DB_PATH}. Run load_sqlite.py first.")
        return

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Get the 17 published posts (stubs)
    cursor.execute("""
        SELECT ID, post_title, post_name, post_date, post_author, guid
        FROM prkx_posts
        WHERE post_type = 'post' AND post_status = 'publish'
        ORDER BY ID
    """)
    published_posts = cursor.fetchall()
    
    safe_print(f"Starting salvage of {len(published_posts)} posts...")
    
    for pid, title, slug, published_at, author_id, guid in published_posts:
        safe_print(f"Salvaging Post ID: {pid} | Title: '{title}'...")
        
        # 2. Get Rank Math SEO metadata
        cursor.execute("""
            SELECT meta_key, meta_value 
            FROM prkx_postmeta 
            WHERE post_id = ? AND meta_key IN ('rank_math_title', 'rank_math_description', 'rank_math_focus_keyword')
        """, (pid,))
        seo_meta = dict(cursor.fetchall())
        
        seo_title = seo_meta.get('rank_math_title', '').strip()
        seo_desc = seo_meta.get('rank_math_description', '').strip()
        seo_kw = seo_meta.get('rank_math_focus_keyword', '').strip()
        
        # 3. Retrieve full content
        full_content = ""
        content_source = "Post (Stub)"
        
        # Clean title for loose matching
        clean_p_title = ''.join(c for c in title.lower() if c.isalnum() or c.isspace()).strip()
        
        # Query pages or revisions with matching title or slug
        cursor.execute("""
            SELECT ID, post_content, post_type, post_status, LENGTH(post_content)
            FROM prkx_posts
            WHERE ID != ? 
              AND (
                (post_title LIKE ?) 
                OR (post_name = ?)
                OR (post_name LIKE ?)
              )
              AND post_type IN ('page', 'revision', 'post')
            ORDER BY LENGTH(post_content) DESC
        """, (pid, f"%{title}%", slug, f"{pid}-revision%"))
        
        candidates = cursor.fetchall()
        
        # Filter candidates manually to double check title similarity
        best_candidate = None
        for cid, ccontent, ctype, cstatus, clen in candidates:
            # Skip if it is empty
            if not ccontent or clen < 500:
                continue
            best_candidate = (cid, ccontent, ctype, cstatus, clen)
            break
            
        if best_candidate:
            cid, ccontent, ctype, cstatus, clen = best_candidate
            full_content = ccontent
            content_source = f"{ctype.capitalize()} [ID: {cid}, Len: {clen}]"
        else:
            # Fallback to the post content itself
            cursor.execute("SELECT post_content FROM prkx_posts WHERE ID = ?", (pid,))
            full_content = cursor.fetchone()[0]
            
        # Clean content
        cleaned_content = clean_html_content(full_content)
        
        # 4. Get featured image
        # In WordPress, the featured image ID is stored in postmeta under '_thumbnail_id'
        cursor.execute("""
            SELECT meta_value FROM prkx_postmeta WHERE post_id = ? AND meta_key = '_thumbnail_id'
        """, (pid,))
        thumb_row = cursor.fetchone()
        featured_image = ""
        
        if thumb_row:
            thumb_id = thumb_row[0]
            # Find the attachment guid
            cursor.execute("SELECT guid FROM prkx_posts WHERE ID = ? AND post_type = 'attachment'", (thumb_id,))
            guid_row = cursor.fetchone()
            if guid_row:
                abs_url = guid_row[0]
                parts = abs_url.split('/wp-content/uploads/')
                if len(parts) >= 2:
                    featured_image = f"/images/{parts[1]}"
                else:
                    parts = abs_url.split('/uploads/')
                    if len(parts) >= 2:
                        featured_image = f"/images/{parts[1]}"
                    else:
                        featured_image = abs_url
                        
        # 5. Extract category
        cursor.execute("""
            SELECT t.name 
            FROM prkx_terms t
            JOIN prkx_term_taxonomy tt ON t.term_id = tt.term_id
            JOIN prkx_term_relationships tr ON tt.term_taxonomy_id = tr.term_taxonomy_id
            WHERE tr.object_id = ? AND tt.taxonomy = 'category'
            LIMIT 1
        """, (pid,))
        cat_row = cursor.fetchone()
        category = cat_row[0] if cat_row else "Travel"
        
        # 6. Extract tags
        cursor.execute("""
            SELECT t.name 
            FROM prkx_terms t
            JOIN prkx_term_taxonomy tt ON t.term_id = tt.term_id
            JOIN prkx_term_relationships tr ON tt.term_taxonomy_id = tr.term_taxonomy_id
            WHERE tr.object_id = ? AND tt.taxonomy = 'post_tag'
        """, (pid,))
        tag_rows = cursor.fetchall()
        tags = [t[0] for t in tag_rows]
        
        # 7. Write Markdown file
        md_filename = f"{slug}.md"
        md_path = os.path.join(OUTPUT_DIR, md_filename)
        
        with open(md_path, "w", encoding="utf-8") as md:
            md.write("---\n")
            md.write(f"title: \"{title}\"\n")
            md.write(f"slug: \"{slug}\"\n")
            md.write(f"category: \"{category}\"\n")
            md.write(f"published_at: \"{published_at}\"\n")
            md.write(f"author: \"Heldonica\"\n")
            md.write(f"featured_image: \"{featured_image}\"\n")
            md.write(f"tags: {tags}\n")
            md.write(f"source: \"{content_source}\"\n")
            md.write(f"seo_title: \"{seo_title}\"\n")
            md.write(f"seo_description: \"{seo_desc}\"\n")
            md.write(f"seo_keywords: \"{seo_kw}\"\n")
            md.write("---\n\n")
            md.write(cleaned_content)
            md.write("\n")
            
        safe_print(f"  -> Saved to {md_filename} (Source: {content_source})")
        
    conn.close()
    safe_print("\nSalvage complete! All Markdown files created in content/salvaged/")

if __name__ == "__main__":
    main()
