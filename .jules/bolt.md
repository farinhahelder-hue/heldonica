# Bolt - Blog Index Caching (ISR)

Date: 2026-05-16

Optimized blog index page with Incremental Static Regeneration (ISR) with 60 second revalidation period.

## 2024-05-18 - ISR Caching Added
**Learning:** Adding Incremental Static Regeneration (ISR) to static Next.js App Router pages significantly improves Time To First Byte (TTFB) by caching the page output for 60 seconds.
**Action:** Always identify pages with static content that do not need real-time data but could benefit from caching. Use `export const revalidate = 60` for caching these pages.

## 2026-06-08 - React 18 useDeferredValue for Search Filtering
**Learning:** Client-side filtering on potentially large lists (like blog posts) can block the main UI thread, causing laggy typing experiences.
**Action:** Use React 18's `useDeferredValue` on the search query state to decouple input rendering from heavy list filtering, ensuring the UI remains responsive during typing.
