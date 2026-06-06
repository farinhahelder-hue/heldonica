# Bolt - Blog Index Caching (ISR)

Date: 2026-05-16

Optimized blog index page with Incremental Static Regeneration (ISR) with 60 second revalidation period.## 2024-05-18 - ISR Caching Added
**Learning:** Adding Incremental Static Regeneration (ISR) to static Next.js App Router pages significantly improves Time To First Byte (TTFB) by caching the page output for 60 seconds.
**Action:** Always identify pages with static content that do not need real-time data but could benefit from caching. Use `export const revalidate = 60` for caching these pages.

## 2026-06-06 - Client-side Search List Debouncing
**Learning:** For React performance optimizations involving client-side search filtering on large lists, preferring `useDeferredValue` (React 18) to debounce the query state prevents heavy list filtering operations from blocking the main UI thread during typing.
**Action:** Always identify long lists mapped out in the UI that use text input search filtering, and wrap the `searchQuery` state variable with `useDeferredValue`.
