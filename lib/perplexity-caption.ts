/**
 * Caption Generator using Perplexity
 * 
 * Opens Perplexity to generate Instagram captions
 */

export interface CaptionRequest {
  imageUrl?: string;
  topic?: string;
  style?: string;
}

/**
 * Generate Perplexity search URL for caption
 * User can copy-paste the result
 */
export function getPerplexityUrl(request: CaptionRequest): string {
  const baseUrl = 'https://perplexity.ai';
  
  // Build a detailed prompt for Instagram caption generation
  const prompt = buildCaptionPrompt(request);
  const encodedPrompt = encodeURIComponent(prompt);
  
  return `${baseUrl}?q=${encodedPrompt}`;
}

/**
 * Build a detailedprompt for Perplexity
 */
function buildCaptionPrompt(request: CaptionRequest): string {
  let prompt = `Generate an engaging Instagram caption for a travel/photography post.`;
  
  if (request.topic) {
    prompt += ` The photo is about: ${request.topic}.`;
  }
  
  if (request.style) {
    prompt += ` Style: ${request.style}.`;
  }
  
  prompt += `\n\nPlease provide:
1. A short caption (under 2200 characters)
2. 5-10 relevant hashtags
3. A call-to-action`;
  
  return prompt;
}

/**
 * Open Perplexity in new tab for caption generation
 */
export function openPerplexityForCaption(request?: CaptionRequest): void {
  const url = getPerplexityUrl(request || {});
  window.open(url, '_blank');
}

/**
 * Alternative: Use Perplexity Sonar for better results
 */
export function getSonarUrl(request: CaptionRequest): string {
  const prompt = buildCaptionPrompt(request);
  const encoded = encodeURIComponent(prompt);
  return `https://perplexity.ai/sonar?=${encoded}`;
}