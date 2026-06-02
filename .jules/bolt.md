# Bolt - Blog Index Caching (ISR)

Date: 2026-05-16

Optimized blog index page with Incremental Static Regeneration (ISR) with 60 second revalidation period.## 2024-05-18 - ISR Caching Added
**Learning:** Adding Incremental Static Regeneration (ISR) to static Next.js App Router pages significantly improves Time To First Byte (TTFB) by caching the page output for 60 seconds.
**Action:** Always identify pages with static content that do not need real-time data but could benefit from caching. Use `export const revalidate = 60` for caching these pages.

## 2024-05-20 - React useDeferredValue for Heavy Search Inputs
**Learning:** In React components with client-side text filtering over lists (like `filteredPosts` in the blog or `filteredDemandes` in the CRM panel), wrapping the input state variable in `useDeferredValue` prevents the search filtering logic from blocking the main UI thread as the user types. This is cleaner and more declarative than building custom debouncing wrappers.
**Action:** When implementing client-side filtering via text input over a potentially large local array, use `useDeferredValue` to debounce the search query that gets passed into the `useMemo` filter block.
