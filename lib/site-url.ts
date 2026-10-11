// Minimal mock for missing site-url module

export function siteUrl(): string {
    return process.env.NEXT_PUBLIC_SITE_URL || 'https://www.heldonica.fr';
}

export function canonicalPath(path: string): string {
    const base = siteUrl();
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${base}/${cleanPath}`;
}
