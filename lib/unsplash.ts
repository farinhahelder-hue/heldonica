/**
 * Unsplash API Integration for Free Stock Photos
 */

export const UNSPLASH_CONFIG = {
  applicationId: process.env.UNSPLASH_APP_ID || '',
  accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || '',
  secretKey: process.env.UNSPLASH_SECRET_KEY || '',
};

export interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  description: string;
  user: {
    name: string;
    username: string;
  };
  likes: number;
}

const UNSPLASH_API = 'https://api.unsplash.com';

/**
 * Search Unsplash photos by query
 */
export async function searchUnsplash(query: string, perPage = 10): Promise<UnsplashPhoto[]> {
  const { accessKey } = UNSPLASH_CONFIG;
  
  try {
    const response = await fetch(
      `${UNSPLASH_API}/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=portrait`,
      {
        headers: {
          'Authorization': `Client-ID ${accessKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Unsplash API error');
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Unsplash search error:', error);
    return [];
  }
}

/**
 * Get a random photo for a topic
 */
export async function getRandomPhoto(topic: string): Promise<UnsplashPhoto | null> {
  const photos = await searchUnsplash(topic, 1);
  return photos[0] || null;
}

/**
 * Format photo URL for Instagram (needs high quality)
 */
export function getInstagramUrl(photo: UnsplashPhoto): string {
  // regular size is good for Instagram
  return photo.urls.regular;
}

/**
 * Get photographer credit for caption
 */
export function getCredit(photo: UnsplashPhoto): string {
  return `Photo by ${photo.user.name} @${photo.user.username}`;
}