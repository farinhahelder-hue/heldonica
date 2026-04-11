/**
 * Unsplash API Integration for Free Stock Photos
 * 
 * Use your Unsplash credentials:
 * - Application ID: 921608
 * - Access Key: VKxcQvLNtFlLcgTxXW5YjnsQng4mu-WyIjyNHvLYsWA
 */

export const UNSPLASH_CONFIG = {
  applicationId: '921608',
  accessKey: 'VKxcQvLNtFlLcgTxXW5YjnsQng4mu-WyIjyNHvLYsWA',
  secretKey: 'b8b0mVr_GrMJXdB8ddQTSma5Cf2zo-EHXBFAosljpVQ',
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