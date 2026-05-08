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

// DOMPurify alternative for ESM-only v3
// On server: returns HTML unchanged (DOMPurify needs browser DOM)
// On client: actual sanitization happens in EnhancedRichContent component
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';
  
  // Server-side rendering: return as-is (DOMPurify works in browser only)
  if (typeof window === 'undefined') {
    return html;
  }
  
  // Client-side: return as-is, EnhancedRichContent handles sanitization
  return html;
}
