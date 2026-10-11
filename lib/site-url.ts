export const siteUrl = (path?: string) => `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${path || ''}`;
