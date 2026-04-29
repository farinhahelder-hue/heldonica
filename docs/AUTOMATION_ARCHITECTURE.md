# Heldonica Content Automation Architecture

## Overview
Automated system to generate blog articles and Instagram posts from your cloud photos/videos using Browser Use Cloud.

## Status: WORKING
- Browser Use Cloud API: Connected and tested
- Next step: Set up Browser Profiles for authentication

## Components

### 1. Photo/Video Source
- Browser Use Cloud: Automates browser login and navigation
- Supported Sources:
  - Google Photos (photos.google.com)
  - IDrive (www.idrive.com)
  - iCloud Photos (icloud.com/photos)

### 2. Content Generation
- AI Processing: Generate blog content + captions from photos
- Image Processing: Optimize images for web and Instagram

### 3. Content Publishing
- Blog (heldonica.fr): Via CMS API
- Instagram: Via Meta Graph API

## Workflow

```
Cloud Source -> Browser Use -> Photos Data -> AI Generator -> Blog + Instagram
                                           (Groq/OpenAI)    (Meta API)
```

## API Keys

| Service | Key | Status |
|---------|-----|--------|
| Browser Use Cloud | bu_eAUU2qZPFWtB6NBIcymo18uWV0iCY9l3PMgt2SYQFH8 | WORKING |
| Instagram | INSTAGRAM_ACCESS_TOKEN | NEEDED |
| Instagram | INSTAGRAM_BUSINESS_ACCOUNT_ID | NEEDED |
| AI | GROQ_KEY | NEEDED |
| Supabase | SUPABASE_URL, SUPABASE_KEY | NEEDED |

## Files Created

- /scripts/fetch_photos.py - Photo fetching (tested)
- /scripts/automation_fetch_photos.py - Complete pipeline
- /scripts/create_automations.py - OpenHands Cloud creator

## How to Run

### 1. Photo Sync (Manual)
```bash
python scripts/fetch_photos.py
```

### 2. Full Automation
```bash
python scripts/automation_fetch_photos.py sync
python scripts/automation_fetch_photos.py generate
```

### 3. Scheduled (OpenHands Cloud)
```bash
export OPENHANDS_API_KEY=your_key
python scripts/create_automations.py
```

## Authentication Required

To access your cloud photos automatically, set up Browser Use Profiles:

1. Go to https://cloud.browser-use.com
2. Login to the dashboard
3. Go to Profiles > New Profile
4. Create "Google Photos" profile with credentials
5. Create "IDrive" profile with credentials

## What's Included

| Component | Status | Notes |
|-----------|--------|-------|
| Browser Use Cloud API | DONE | Tested |
| Photo Fetching | DONE | Needs login |
| IDrive Access | PENDING | Set up Profile |
| Google Photos Access | PENDING | Set up Profile |
| AI Content Generation | PENDING | Set GROQ_KEY |
| Instagram Publishing | PENDING | Set INSTAGRAM_* |
| Blog Publishing | READY | CMS API ready |

## Next Steps

1. Set up Browser Use Profiles at cloud.browser-use.com
2. Get GROQ_KEY from groq.com
3. Get Instagram tokens from developers.facebook.com
4. Run: python scripts/fetch_photos.py