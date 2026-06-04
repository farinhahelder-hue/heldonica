# Bolt - Blog Index Caching (ISR)

Date: 2026-05-16

Optimized blog index page with Incremental Static Regeneration (ISR) with 60 second revalidation period.## 2024-05-18 - ISR Caching Added
**Learning:** Adding Incremental Static Regeneration (ISR) to static Next.js App Router pages significantly improves Time To First Byte (TTFB) by caching the page output for 60 seconds.
**Action:** Always identify pages with static content that do not need real-time data but could benefit from caching. Use `export const revalidate = 60` for caching these pages.

## 2026-06-04 - Client-side Search Input Optimization
**Learning:** For client-side search filtering on large lists in React 18, utilizing `useDeferredValue` prevents heavy list filtering operations from blocking the main UI thread during typing, creating a smoother user experience.
**Action:** Always use `useDeferredValue` to debounce search query state for components with complex client-side filtering logic to maintain UI responsiveness without needing external debounce packages.
