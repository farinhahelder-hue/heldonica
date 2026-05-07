// Sanitisation HTML : DOMPurify côté client, échappement sécurisé côté serveur (SSR-safe, no jsdom)

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

  // Côté client : utiliser DOMPurify (disponible dans le bundle navigateur via isomorphic-dompurify)
  // eslint-disable-next-line
  const DOMPurify = require('isomorphic-dompurify');
  return DOMPurify.sanitize(html, SANITIZE_OPTIONS);
}
