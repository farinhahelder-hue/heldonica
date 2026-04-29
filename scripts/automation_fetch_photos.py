# """
# Heldonica Content Automation
# ========================
# Complete automation to fetch photos from IDrive and Google Photos,
# generate blog articles and Instagram posts, then publish.
# 
# Usage:
#   python scripts/automation_fetch_photos.py
# 
# Environment variables required:
#   - BROWSER_USE_API_KEY (already set: bu_eAUU2qZPFWtB6NBIcymo18uWV0iCY9l3PMgt2SYQFH8)
#   - GOOGLE_EMAIL, GOOGLE_PASSWORD (for Google Photos)
#   - IDRIVE_EMAIL, IDRIVE_PASSWORD (for IDrive)
#   - GROQ_KEY (for AI content generation)
#   - INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_BUSINESS_ACCOUNT_ID (for Instagram)
#   - SUPABASE_URL, SUPABASE_KEY (for storage)
# """

import os
import json
import asyncio
import base64
from datetime import datetime
from typing import Optional
from browser_use_sdk.v3 import AsyncBrowserUse

# API Key is already configured
BROWSER_USE_API_KEY = os.environ.get("BROWSER_USE_API_KEY", "bu_eAUU2qZPFWtB6NBIcymo18uWV0iCY9l3PMgt2SYQFH8")
os.environ["BROWSER_USE_API_KEY"] = BROWSER_USE_API_KEY


class PhotoFetcher:
    """Fetch photos from cloud services using Browser Use"""
    
    def __init__(self):
        self.client = AsyncBrowserUse()
    
    async def fetch_google_photos(
        self, 
        email: str = None, 
        password: str = None,
        limit: int = 10
    ) -> dict:
        """Fetch photos from Google Photos"""
        # Build task with credentials if provided
        if email and password:
            login_steps = f"""
            1. Go to accounts.google.com and sign in with:
               - Email: {email}
               - Password: {password}
            2. If 2FA is needed, I'll provide the code
            3. After login, navigate to photos.google.com
            """
        else:
            login_steps = """
            1. Try to navigate to photos.google.com
            2. If login is needed, report that credentials are required
            """
        
        task = f"""
        {login_steps}
        
        3. Once logged in, navigate to the Photos tab
        4. Scroll to load at least {limit} recent photos
        5. For each photo, extract:
           - Description or title
           - Date taken
           - Any visible metadata
        6. Return the results as a JSON array
        """
        
        result = await self.client.run(task, model="claude-sonnet-4.6")
        
        return {
            "source": "google_photos",
            "timestamp": datetime.now().isoformat(),
            "photos": result.output,
            "success": result.output is not None
        }
    
    async def fetch_idrive_photos(
        self,
        email: str = None,
        password: str = None,
        limit: int = 10
    ) -> dict:
        """Fetch files from IDrive"""
        if email and password:
            login_steps = f"""
            1. Go to www.idrive.com
            2. Click "Sign In" 
            3. Enter email: {email}
            4. Enter password: {password}
            5. Wait for dashboard to load
            """
        else:
            login_steps = """
            1. Go to www.idrive.com
            2. If not logged in, report that credentials are needed
            """
        
        task = f"""
        {login_steps}
        
        6. Navigate to the file browser
        7. List the most recent files (last {limit})
        8. Show file names, dates, sizes, and types
        9. Return as JSON array
        """
        
        result = await self.client.run(task, model="claude-sonnet-4.6")
        
        return {
            "source": "idrive",
            "timestamp": datetime.now().isoformat(),
            "files": result.output,
            "success": result.output is not None
        }


class ContentGenerator:
    """Generate blog content and Instagram posts using AI"""
    
    def __init__(self, groq_key: str = None):
        self.groq_key = groq_key or os.environ.get("GROQ_KEY")
    
    async def generate_blog_post(self, photos_data: dict) -> dict:
        """Generate a blog article from photos"""
        if not self.groq_key:
            return {"error": "GROQ_KEY not configured"}
        
        # Prepare photo information for the AI
        prompt = f"""
        Based on these photos, generate a blog post for a French travel/hotel blog:
        
        Photos: {photos_data}
        
        Create:
        1. A compelling title (French)
        2. A subtitle/description
        3. The main article content (3-4 paragraphs)
        4. SEO keywords
        5. A featured image description
        
        Return as JSON:
        {{
            "title": "...",
            "subtitle": "...",
            "content": "...",
            "keywords": [...],
            "image_description": "..."
        }}
        """
        
        # Call Groq API
        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.groq_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.1-8b-instant",
                    "messages": [
                        {"role": "system", "content": "Tu génères du contenu de blog en français. Sois créatif et engageant."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.7
                }
            )
            
            if response.status_code == 200:
                content = response.json()["choices"][0]["message"]["content"]
                return {"content": content, "success": True}
            else:
                return {"error": response.text, "success": False}
    
    async def generate_instagram_caption(self, blog_post: dict) -> dict:
        """Generate Instagram caption from blog post"""
        if not self.groq_key:
            return {"error": "GROQ_KEY not configured"}
        
        prompt = f"""
        Based on this blog post, generate an Instagram caption:
        
        Blog: {blog_post}
        
        Create:
        1. A catchy first line (hook)
        2. Main caption (max 2200 chars)
        3. 5-10 relevant hashtags in French and English
        
        Keep it engaging and suitable for Instagram travel content.
        """
        
        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.groq_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.1-8b-instant",
                    "messages": [
                        {"role": "system", "content": "Tu génères des légendes Instagram engageantes en français."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.8
                }
            )
            
            if response.status_code == 200:
                content = response.json()["choices"][0]["message"]["content"]
                return {"caption": content, "success": True}
            else:
                return {"error": response.text, "success": False}


class Publisher:
    """Publish content to blog and Instagram"""
    
    def __init__(
        self,
        instagram_token: str = None,
        instagram_business_id: str = None
    ):
        self.instagram_token = instagram_token or os.environ.get("INSTAGRAM_ACCESS_TOKEN")
        self.instagram_business_id = instagram_business_id or os.environ.get("INSTAGRAM_BUSINESS_ACCOUNT_ID")
    
    async def publish_to_instagram(self, image_url: str, caption: str) -> dict:
        """Publish to Instagram via Meta Graph API"""
        if not self.instagram_token or not self.instagram_business_id:
            return {"error": "Instagram credentials not configured"}
        
        import httpx
        base_url = "https://graph.facebook.com"
        
        # Step 1: Create media container
        response = await httpx.AsyncClient().post(
            f"{base_url}/{self.instagram_business_id}/media",
            json={
                "image_url": image_url,
                "caption": caption,
                "access_token": self.instagram_token
            }
        )
        
        if response.status_code != 200:
            return {"error": response.text}
        
        container_id = response.json().get("id")
        if not container_id:
            return {"error": "No container ID returned"}
        
        # Step 2: Publish the container
        response = await httpx.AsyncClient().post(
            f"{base_url}/{self.instagram_business_id}/media_publish",
            json={
                "creation_id": container_id,
                "access_token": self.instagram_token
            }
        )
        
        if response.status_code == 200:
            return {"success": True, "post_id": response.json().get("id")}
        else:
            return {"error": response.text}


async def run_photo_sync(
    google_email: str = None,
    google_password: str = None,
    idrive_email: str = None,
    idrive_password: str = None
):
    """Main photo sync automation"""
    print("=" * 60)
    print("Starting Photo Sync Automation")
    print("=" * 60)
    
    fetcher = PhotoFetcher()
    
    results = {
        "timestamp": datetime.now().isoformat(),
        "google_photos": None,
        "idrive_files": None
    }
    
    # Fetch from Google Photos
    print("\n1. Fetching Google Photos...")
    results["google_photos"] = await fetcher.fetch_google_photos(
        email=google_email or os.environ.get("GOOGLE_EMAIL"),
        password=google_password or os.environ.get("GOOGLE_PASSWORD"),
        limit=10
    )
    print(f"   Result: {results['google_photos']['success']}")
    
    # Fetch from IDrive
    print("\n2. Fetching IDrive...")
    results["idrive_files"] = await fetcher.fetch_idrive_photos(
        email=idrive_email or os.environ.get("IDRIVE_EMAIL"),
        password=idrive_password or os.environ.get("IDRIVE_PASSWORD"),
        limit=10
    )
    print(f"   Result: {results['idrive_files']['success']}")
    
    # Save results
    output_file = f"photo_sync_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(output_file, "w") as f:
        json.dump(results, f, indent=2, default=str)
    print(f"\n✓ Results saved to {output_file}")
    
    return results


async def run_content_generation(photos_data: dict):
    """Generate blog and Instagram content"""
    print("=" * 60)
    print("Starting Content Generation")
    print("=" * 60)
    
    generator = ContentGenerator()
    
    # Generate blog post
    print("\n1. Generating blog post...")
    blog_post = await generator.generate_blog_post(photos_data)
    print(f"   Result: {blog_post.get('success', False)}")
    
    # Generate Instagram caption
    if blog_post.get("success"):
        print("\n2. Generating Instagram caption...")
        instagram = await generator.generate_instagram_caption(blog_post)
        print(f"   Result: {instagram.get('success', False)}")
        
        return {"blog_post": blog_post, "instagram": instagram}
    
    return {"blog_post": blog_post, "instagram": None}


async def main():
    """Run the full automation"""
    import sys
    
    mode = sys.argv[1] if len(sys.argv) > 1 else "sync"
    
    if mode == "sync":
        await run_photo_sync()
    elif mode == "generate":
        # Load latest photos data
        import glob
        files = sorted(glob.glob("photo_sync_*.json"))
        if files:
            with open(files[-1]) as f:
                photos_data = json.load(f)
            await run_content_generation(photos_data)
        else:
            print("No photo data found. Run sync first.")
    else:
        print(f"Unknown mode: {mode}")
        print("Usage: python automation.py [sync|generate]")


if __name__ == "__main__":
    asyncio.run(main())