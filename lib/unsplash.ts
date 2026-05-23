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
      `${UNSPLASH_API}/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`,
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

// Default fallback images by category
export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  default: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=80',
  'Carnets Voyage': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
  'Découvertes Locales': 'https://images.unsplash.com/photo-1520939817895-060bdaf4fe1b?w=1200&q=80',
  'Guides Pratiques': 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1200&q=80',
  // Destination-based fallbacks
  'europe': 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=80',
  'france': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80',
  'portugal': 'https://images.unsplash.com/photo-1555881400-74d7feeac3e4?w=1200&q=80',
  'espagne': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&q=80',
  'italie': 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=1200&q=80',
  'voyage': 'https://images.unsplash.com/photo-1488646953014-85cb44b258dc?w=1200&q=80',
  'slow-travel': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
};

/**
 * Get a fallback image URL for articles without featured images
 * Uses category, title keyword, or default
 */
export function getFallbackImageUrl(category?: string, title?: string): string {
  // 1. Try category
  if (category && CATEGORY_FALLBACK_IMAGES[category]) {
    return CATEGORY_FALLBACK_IMAGES[category];
  }
  
  // 2. Try matching title keywords
  if (title) {
    const lowerTitle = title.toLowerCase();
    for (const [keyword, url] of Object.entries(CATEGORY_FALLBACK_IMAGES)) {
      if (keyword !== 'default' && lowerTitle.includes(keyword)) {
        return url;
      }
    }
  }
  
  // 3. Use default
  return CATEGORY_FALLBACK_IMAGES.default;
}

/**
 * Auto-fix article with empty featured image using Unsplash
 * Uses article title/category to find relevant photo
 */
export async function autoFixEmptyImage(title: string, category?: string): Promise<string | null> {
  // Build search query from title and category
  const titleWords = title
    .toLowerCase()
    .replace(/[^a-zà-ÿ\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3)
    .slice(0, 3);
  
  const searchQuery = category 
    ? `${category} ${titleWords.join(' ')}`
    : titleWords.join(' ');
  
  const photo = await getRandomPhoto(searchQuery);
  
  if (photo) {
    // Use regular URL (good balance of quality and size)
    return photo.urls.regular;
  }
  
  // Fallback to static image
  return getFallbackImageUrl(category, title);
}