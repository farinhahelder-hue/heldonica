import DOMPurify from 'isomorphic-dompurify';

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

export function sanitizeHtml(html: string | null | undefined) {
  if (!html) {
    return '';
  }

  return DOMPurify.sanitize(html, SANITIZE_OPTIONS);
}
