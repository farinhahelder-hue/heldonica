# Bolt - Blog Index Caching (ISR)

Date: 2026-05-16

Optimized blog index page with Incremental Static Regeneration (ISR) with 60 second revalidation period.## 2024-05-18 - ISR Caching Added
**Learning:** Adding Incremental Static Regeneration (ISR) to static Next.js App Router pages significantly improves Time To First Byte (TTFB) by caching the page output for 60 seconds.
**Action:** Always identify pages with static content that do not need real-time data but could benefit from caching. Use `export const revalidate = 60` for caching these pages.

## 2024-05-18 - Client-Side Search Filtering
**Learning:** For React components rendering large lists (like blog posts) with client-side text filtering, typing quickly in the search input can cause noticeable UI lag as React attempts to re-filter and re-render the entire list on every keystroke, blocking the main thread.
**Action:** Use React 18's `useDeferredValue` on the text input state before passing it to the `useMemo` dependency array for the list filter. This allows React to prioritize the input field update (keeping typing responsive) while deferring the heavy list filtering operation to the background.
