
export function siteUrl(path?: string): string {
    return path ? `https://www.heldonica.fr${path.startsWith('/') ? path : '/' + path}` : 'https://www.heldonica.fr';
}
