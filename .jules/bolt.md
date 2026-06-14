# Bolt - Blog Index Caching (ISR)

Date: 2026-05-16

Optimized blog index page with Incremental Static Regeneration (ISR) with 60 second revalidation period.## 2024-05-18 - ISR Caching Added
**Learning:** Adding Incremental Static Regeneration (ISR) to static Next.js App Router pages significantly improves Time To First Byte (TTFB) by caching the page output for 60 seconds.
**Action:** Always identify pages with static content that do not need real-time data but could benefit from caching. Use `export const revalidate = 60` for caching these pages.
2024-10-24/Performance/Refactored N+1 Supabase .upsert() loop into a single bulk upsert in app/api/cms/settings/route.ts
## 2026-05-18 - Admin Panel Search Optimization (useDeferredValue)
**Learning:** For React components that perform heavy client-side filtering on large arrays (like articles in an admin panel), typing in the search box can become noticeably slow.
**Action:** Use React 18's `useDeferredValue` to debounce the search query input state before feeding it into the array `.filter()` method. This prevents the heavy array iteration and subsequent DOM updates from blocking the main thread, resulting in a lag-free typing experience.
