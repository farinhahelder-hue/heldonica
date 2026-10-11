export function siteUrl(path?: string) { return (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.heldonica.fr') + (path || ''); }
