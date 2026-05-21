/**
 * Instagram Feed Integration for Heldonica
 * 
 * Fetches Instagram posts without requiring complex API permissions.
 * Uses free third-party services to fetch the feed.
 * 
 * Free alternatives:
 * - Behold.rss (behold.so) - Free Instagram RSS feed
 * - Apify Instagram scraper
 * - Display Instagram manually via embed
 */

export interface InstagramFeedPost {
  id: string;
  shortcode: string;
  caption: string;
  mediaUrl: string;
  thumbnailUrl: string;
  permalink: string;
  timestamp: string;
  likes: number;
  comments: number;
}

/**
 * Get Instagram username from environment or config
 */
function getInstagramUsername(): string {
  // Add your Instagram username here or in .env.local
  return process.env.INSTAGRAM_USERNAME || 'heldonica';
}

/**
 * Fetch Instagram feed using Behold.rss (free service)
 * Sign up at behold.so for a free API key
 */
export async function getInstagramFeed(limit = 9): Promise<InstagramFeedPost[]> {
  const username = getInstagramUsername();
  const apiKey = process.env.BEHOLD_API_KEY;
  
  if (!apiKey) {
    console.warn('Instagram feed: BEHOLD_API_KEY not configured. Using fallback.');
    return getFallbackFeed(username, limit);
  }

  try {
    const response = await fetch(
      `https://api.behold.so/v1/instagram/${username}?limit=${limit}`,
      {
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Behold API error');
    }

    const data = await response.json();
    
    return (data.posts || []).map((post: any) => ({
      id: post.id,
      shortcode: post.shortcode || '',
      caption: post.caption || '',
      mediaUrl: post.display_url || post.image_url || '',
      thumbnailUrl: post.thumbnail_url || post.display_url || '',
      permalink: post.permalink || `https://instagram.com/p/${post.shortcode}`,
      timestamp: post.timestamp || post.created_at || '',
      likes: post.likes_count || 0,
      comments: post.comments_count || 0,
    }));
  } catch (error) {
    console.error('Instagram feed error:', error);
    return getFallbackFeed(username, limit);
  }
}

/**
 * Fallback feed - returns mock data for display when API not configured
 * Replace with real calls when you have a Behold API key
 */
function getFallbackFeed(username: string, limit: number): InstagramFeedPost[] {
  // Return empty array - you can populate with manually curated posts
  // Or use Instagram embed code in components
  console.warn(`Instagram feed: Using fallback for @${username}. Set BEHOLD_API_KEY for live feed.`);
  return [];
}

/**
 * Check if Instagram feed is configured
 */
export function isInstagramFeedConfigured(): boolean {
  return !!process.env.BEHOLD_API_KEY || !!process.env.INSTAGRAM_USERNAME;
}

/**
 * Get posts for a specific hashtag (requires Behold Pro)
 */
export async function getInstagramHashtag(hashtag: string, limit = 9): Promise<InstagramFeedPost[]> {
  const apiKey = process.env.BEHOLD_API_KEY;
  
  if (!apiKey) {
    return [];
  }

  try {
    const response = await fetch(
      `https://api.behold.so/v1/instagram/hashtag/${hashtag}?limit=${limit}`,
      {
        headers: {
          'Authorization': apiKey,
        },
      }
    );

    const data = await response.json();
    return data.posts || [];
  } catch {
    return [];
  }
}