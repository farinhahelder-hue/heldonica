# Bolt - Blog Index Caching (ISR)

Date: 2026-05-16

Optimized blog index page with Incremental Static Regeneration (ISR) with 60 second revalidation period.## 2024-05-18 - ISR Caching Added
**Learning:** Adding Incremental Static Regeneration (ISR) to static Next.js App Router pages significantly improves Time To First Byte (TTFB) by caching the page output for 60 seconds.
**Action:** Always identify pages with static content that do not need real-time data but could benefit from caching. Use `export const revalidate = 60` for caching these pages.

## 2024-05-27 - Hub Page Static Generation Anti-pattern
**Learning:** Using `export const dynamic = 'force-dynamic'` on static hub pages that only contain static structural data and interactive client components (like `/destinations`) de-optimizes the entire route, forcing SSR on every request and killing TTFB, even when no dynamic server data is actually fetched.
**Action:** Remove `force-dynamic` from static hub pages and replace with `export const revalidate = 3600;` to leverage ISR, allowing Next.js to cache the static wrapper at the edge while letting client components handle their own state.
