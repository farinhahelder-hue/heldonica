export const siteUrl = (path: string = ''): string => {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.heldonica.fr';
  if (!path) return base;
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
};
