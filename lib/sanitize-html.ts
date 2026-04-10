import DOMPurify from 'isomorphic-dompurify';

const SANITIZE_OPTIONS = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
};

export function sanitizeHtml(html: string | null | undefined) {
  if (!html) {
    return '';
  }

  return DOMPurify.sanitize(html, SANITIZE_OPTIONS);
}
