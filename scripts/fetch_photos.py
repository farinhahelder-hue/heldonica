"""
Browser Use Cloud - Photo Fetch Automation
========================================
Fetches photos from IDrive and Google Photos using Browser Use Cloud API.
"""

import os
import asyncio
import json
from datetime import datetime
from browser_use_sdk.v3 import AsyncBrowserUse

# Your API Key
BROWSER_USE_API_KEY = "bu_QMuXOMk_89x0ArZT_jGSon1Cr9hyzeNklG5wpEgHBJU"

# Set the API key
os.environ["BROWSER_USE_API_KEY"] = BROWSER_USE_API_KEY


async def fetch_google_photos(limit: int = 10):
    """Fetch recent photos from Google Photos"""
    client = AsyncBrowserUse()
    
    task = f"""
    1. Go to photos.google.com
    2. If login is needed, check if there are any photos visible in the main view
    3. Navigate to the "Photos" tab (not "Albums")
    4. Scroll down to load recent photos
    5. For each of the last {limit} photos, extract:
       - Photo thumbnail URL or description
       - Date taken
       - Any labels or tags
    6. Return a JSON array with the collected photo information
    """
    
    result = await client.run(
        task,
        model="claude-sonnet-4.6"  # Use Sonnet for better reasoning
    )
    
    return {
        "source": "google_photos",
        "timestamp": datetime.now().isoformat(),
        "photos": result.output,
        "count": len(result.output) if result.output else 0
    }


async def fetch_idrive_photos(limit: int = 10):
    """Fetch recent photos from IDrive"""
    client = AsyncBrowserUse()
    
    task = f"""
    1. Go to www.idrive.com
    2. Look for login or "Sign In" button - click it if present
    3. Check what's available on the main page (files, photos, folders)
    4. If logged in, navigate to see photos/files
    5. List what you find - show file names, dates, types
    6. Return a summary of what you found
    """
    
    result = await client.run(
        task,
        model="claude-sonnet-4.6"
    )
    
    return {
        "source": "idrive",
        "timestamp": datetime.now().isoformat(),
        "data": result.output,
        "success": result.output is not None
    }


async def test_browser_use():
    """Test the Browser Use API connection"""
    client = AsyncBrowserUse()
    
    # Simple test task
    task = "Go to google.com and tell me what the page title is"
    
    result = await client.run(
        task,
        model="claude-sonnet-4.6"  # Explicit model
    )
    
    return {
        "success": result.output is not None,
        "output": result.output,
        "error": getattr(result, 'error', None)
    }


async def main():
    print("=" * 60)
    print("Testing Browser Use Cloud API...")
    print("=" * 60)
    
    # Test connection
    test_result = await test_browser_use()
    print(f"Test result: {json.dumps(test_result, indent=2)}")
    
    if test_result["success"]:
        print("\n✓ API connection successful!")
        print("\n" + "=" * 60)
        print("Fetching Google Photos...")
        print("=" * 60)
        
        google_result = await fetch_google_photos(limit=5)
        print(f"Google Photos result: {json.dumps(google_result, indent=2)}")
        
        print("\n" + "=" * 60)
        print("Fetching IDrive...")
        print("=" * 60)
        
        idrive_result = await fetch_idrive_photos(limit=5)
        print(f"IDrive result: {json.dumps(idrive_result, indent=2)}")
    else:
        print(f"✗ API connection failed: {test_result.get('error')}")


if __name__ == "__main__":
    asyncio.run(main())