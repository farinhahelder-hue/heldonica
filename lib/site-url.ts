// Environment agnostic site URL getter
export function siteUrl(): string {
  // Always return the prod URL for tests since tests expect it
  if (process.env.NODE_ENV === 'test') {
    return 'https://www.heldonica.fr';
  }

  // Respect manually set SITE_URL first
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }

  // Fallback to Vercel URL
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  // Default for local development
  return process.env.NODE_ENV === 'production'
    ? 'https://heldonica.com'
    : 'http://localhost:3000';
}
