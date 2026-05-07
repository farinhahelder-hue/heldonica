// Sanitisation HTML : DOMPurify côté client uniquement (SSR-safe, no jsdom)

const SANITIZE_OPTIONS = {
  USE_PROFILES: { html: true },
  ALLOW_DATA_ATTR: true,
  ADD_TAGS: ['button'],
  ADD_ATTR: [
    'class',
    'data-heldonica-carousel',
    'data-carousel-count',
    'data-carousel-slide',
    'data-carousel-prev',
    'data-carousel-next',
    'data-carousel-dot',
    'aria-label',
    'aria-hidden',
    'aria-pressed',
    'loading',
    'type',
  ],
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
};

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';

  // Côté serveur (SSR) : retourner le HTML tel quel — DOMPurify s'exécute côté client
  if (typeof window === 'undefined') {
    return html;
  }

  // Côté client : dompurify pur (pas de dépendance jsdom)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const DOMPurify = require('dompurify');
  return DOMPurify.sanitize(html, SANITIZE_OPTIONS);
}
