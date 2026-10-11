
export function siteUrl(path?: string): string {
    return path ? `https://heldonica.fr${path.startsWith('/') ? path : '/' + path}` : 'https://heldonica.fr';
}
