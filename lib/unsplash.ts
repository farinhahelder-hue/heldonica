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
    social?: {
      instagram_username?: string | null;
    };
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
  return photo.user.social?.instagram_username
    ? `https://instagram.com/${photo.user.social.instagram_username}`
    : '';
}

/**
 * Get photographer credit for caption
 */
export function getCredit(photo: UnsplashPhoto): string {
  return `Photo de ${photo.user.name} sur Unsplash`;
}

// Default fallback images by category — tous remplacés par le fallback de marque
export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  default: '/og-default.jpg',
  'Carnets Voyage': '/og-default.jpg',
  'Découvertes Locales': '/og-default.jpg',
  'Guides Pratiques': '/og-default.jpg',
  'europe': '/og-default.jpg',
  'france': '/og-default.jpg',
  'portugal': '/og-default.jpg',
  'espagne': '/og-default.jpg',
  'italie': '/og-default.jpg',
  'voyage': '/og-default.jpg',
  'slow-travel': '/og-default.jpg',
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