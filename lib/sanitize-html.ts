// Sanitisation HTML : DOMPurify côté client uniquement (SSR-safe)
// Note: DOMPurify is required lazily (not top-level) to avoid a TDZ in the
// production bundle where the minifier renames its internal consts.

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

  // Côté client : import dynamique pour éviter la TDZ dans le bundle minifié
  try {
    // eslint-disable-line
    const DOMPurify = require('dompurify');
    const purify = DOMPurify.default ?? DOMPurify;
    if (typeof purify?.sanitize !== 'function') return html;
    return purify.sanitize(html, SANITIZE_OPTIONS);
  } catch {
    // Fallback silencieux si DOMPurify indisponible (SSR edge case)
    return html;
  }
}
