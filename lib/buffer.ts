/**
 * Buffer Integration for Instagram Publishing
 * 
 * Opens Buffer Composer with pre-filled content
 * No API key needed - just uses Buffer's web interface
 */

export interface BufferPost {
  text: string;
  imageUrl?: string;
  profileIds?: string[];
}

/**
 * Generate Buffer Composer URL
 * Opens Buffer with pre-filled image and caption
 */
export function getBufferComposerUrl(profileId?: string): string {
  const baseUrl = 'https://buffer.com/app/compose';
  
  // Can add profile ID if available
  if (profileId) {
    return `${baseUrl}?profile=${profileId}`;
  }
  
  return baseUrl;
}

/**
 * Generate Buffer Post URL with text
 * Opens Buffer and pre-fills the caption
 */
export function getBufferPostUrl(text: string, profileId?: string): string {
  const baseUrl = 'https://buffer.com/app/compose';
  
  // Encode text for URL
  const encodedText = encodeURIComponent(text);
  
  if (profileId) {
    return `${baseUrl}?text=${encodedText}&profile=${profileId}`;
  }
  
  return `${baseUrl}?text=${encodedText}`;
}

/**
 * Open Buffer Composer in new tab
 * User will add image manually
 */
export function openBufferComposer(profileId?: string): void {
  const url = getBufferComposerUrl(profileId);
  window.open(url, '_blank');
}

/**
 * Check if Buffer is configured
 */
export function isBufferConfigured(): boolean {
  return true; // Always available - uses web interface
}