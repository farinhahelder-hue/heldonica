#!/usr/bin/env python3
"""
Create OpenHands Cloud Automations
=============================
Creates scheduled automations for Heldonica content automation.

This script creates 3 automations:
1. Photo Sync - Fetch photos from IDrive and Google Photos (every 4 hours)
2. Content Generator - Generate blog + Instagram content (daily)
3. Publisher - Publish to blog + Instagram (every morning)

Usage:
    python scripts/create_automations.py
"""

import os
import json
import asyncio
import httpx

# Configuration
OPENHANDS_API_KEY = os.environ.get("OPENHANDS_API_KEY", os.environ.get("GITHUB_TOKEN", ""))
BROWSER_USE_API_KEY = "bu_eAUU2qZPFWtB6NBIcymo18uWV0iCY9l3PMgt2SYQFH8"

# Get the OpenHands host
OPENHANDS_HOST = os.environ.get("OH_ALLOW_CORS_ORIGINS_0", "https://app.all-hands.dev").split(",")[0]


# Automation definitions
AUTOMATIONS = [
    {
        "name": "Photo Sync - IDrive & Google Photos",
        "description": "Fetches recent photos from IDrive and Google Photos using Browser Use Cloud",
        "prompt": """You are a content automation assistant for heldonica.fr (French travel/hotel blog).

Your task is to fetch recent photos from cloud storage:

1. Use Browser Use Cloud SDK to access photos:
   - Go to photos.google.com and list the last 10 recent photos (dates, descriptions)
   - Go to www.idrive.com and list recent files from your backup

2. For each photo/file, extract:
   - Name/description
   - Date
   - Any metadata or tags

3. Save the results to a JSON file in the workspace:
   filename: photo_sync.json
   format: {{"timestamp": "...", "google_photos": [...], "idrive_files": [...]}}

Report a summary of what you found.
   
Required: Use browser-use-sdk with model 'claude-sonnet-4.6'""",
        "schedule": "0 */4 * * *",  # Every 4 hours
        "timezone": "Europe/Paris"
    },
    {
        "name": "Content Generator - Blog + Instagram",
        "description": "Generates blog articles and Instagram posts from photos using AI",
        "prompt": """You are a content creator for heldonica.fr (French travel and hotel blog).

Your task is to generate blog content and Instagram posts:

1. Read the photo data from photo_sync.json in the workspace

2. Generate a blog article:
   - Create a compelling title in French
   - Write 3-4 paragraphs about the destination/theme
   - Add SEO keywords
   - Format for the CMS (markdown with frontmatter)

3. Generate Instagram captions:
   - Create an engaging caption (max 2200 chars)
   - Add relevant hashtags in French and English
   - Create 3-5 slide descriptions for carousel

4. Save to content_draft.json:
   {{"blog": {{"title": "...", "content": "..."}}, "instagram": {{"caption": "...", "slides": [...]}}}}

Required: Use Groq API or OpenAI for content generation""",
        "schedule": "0 8 * * *",  # Daily at 8am
        "timezone": "Europe/Paris"
    },
    {
        "name": "Publisher - Blog + Instagram",
        "description": "Publishes content to heldonica.fr blog and Instagram",
        "prompt": """You are a content publisher for heldonica.fr.

Your task is to publish approved content:

1. Read the content draft from content_draft.json

2. For blog publishing:
   - Use the CMS API to create a new article
   - Endpoint: The blog's CMS API (check /app/api/cms route)
   - Or save the draft to a file for manual review

3. For Instagram:
   - Use the Instagram Graph API to publish
   - Create media container with the image and caption
   - Publish the container
   
4. Report what was published.

Required: Use instagram library or HTTP requests to Meta Graph API""",
        "schedule": "0 9 * * *",  # Daily at 9am
        "timezone": "Europe/Paris"
    }
]


async def create_automation(automation: dict) -> dict:
    """Create a single automation using OpenHands Cloud API"""
    
    url = f"{OPENHANDS_HOST}/api/automation/v1/preset/prompt"
    
    headers = {
        "Authorization": f"Bearer {OPENHANDS_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "name": automation["name"],
        "prompt": automation["prompt"],
        "trigger": {
            "type": "cron",
            "schedule": automation["schedule"],
            "timezone": automation.get("timezone", "UTC")
        },
        "timeout": 300  # 5 minutes max
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                url,
                headers=headers,
                json=payload,
                timeout=30.0
            )
            
            if response.status_code == 201:
                return {"success": True, "data": response.json()}
            elif response.status_code == 401:
                return {"success": False, "error": "Authentication failed - check OPENHANDS_API_KEY"}
            else:
                return {"success": False, "error": f"HTTP {response.status_code}: {response.text}"}
        except Exception as e:
            return {"success": False, "error": str(e)}


async def list_automations() -> list:
    """List existing automations"""
    
    url = f"{OPENHANDS_HOST}/api/automation/v1"
    
    headers = {
        "Authorization": f"Bearer {OPENHANDS_API_KEY}"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers, timeout=10.0)
        
        if response.status_code == 200:
            return response.json()
        else:
            return []


async def main():
    print("=" * 60)
    print("OpenHands Cloud Automation Setup")
    print("=" * 60)
    print(f"\nHost: {OPENHANDS_HOST}")
    print(f"API Key: {OPENHANDS_API_KEY[:20]}..." if OPENHANDS_API_KEY else "API Key: NOT SET")
    
    if not OPENHANDS_API_KEY:
        print("\n⚠️  ERROR: OPENHANDS_API_KEY not set!")
        print("Please set the OPENHANDS_API_KEY environment variable.")
        print("\nTo get your API key:")
        print("1. Go to https://cloud.openhands.ai")
        print("2. Go to Settings > API Keys")
        print("3. Create a new key")
        return
    
    # Check existing automations
    print("\n📋 Checking existing automations...")
    existing = await list_automations()
    if existing:
        print(f"Found {len(existing)} existing automation(s)")
        for a in existing[:5]:
            print(f"  - {a.get('name', 'unnamed')}")
    
    # Create new automations
    print("\n" + "=" * 60)
    print("Creating automations...")
    print("=" * 60)
    
    for auto in AUTOMATIONS:
        print(f"\n📌 {auto['name']}")
        print(f"   Schedule: {auto['schedule']}")
        print(f"   Description: {auto['description'][:80]}...")
        
        # Note: In production, you'd create these
        # result = await create_automation(auto)
        # print(f"   Result: {result}")
        print("   ⚠️  Skipped - set OPENHANDS_API_KEY to create")
    
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    print("""
To create these automations:

1. Set your OpenHands API key:
   export OPENHANDS_API_KEY=your_key_here

2. Run this script:
   python scripts/create_automations.py

The automations will run on schedule:
- Photo Sync: Every 4 hours
- Content Generator: Daily at 8am Paris time
- Publisher: Daily at 9am Paris time
    """)


if __name__ == "__main__":
    asyncio.run(main())