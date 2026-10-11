export const siteUrl = (path?: string) => (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.heldonica.fr') + (path || '');
