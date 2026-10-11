export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.heldonica.fr';
export function getSiteUrl(): string {
  return siteUrl;
}
export default function getSiteUrlFunc(): string {
    return siteUrl;
}
