export function siteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.heldonica.fr';
  if (!url.startsWith('https://') && process.env.NODE_ENV === 'production') {
     console.warn(`WARNING: NEXT_PUBLIC_SITE_URL must start with 'https://' in production. Falling back to default.`);
     return 'https://www.heldonica.fr';
  }
  return url;
}

export function canonicalPath(path: string): string {
  const base = siteUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
