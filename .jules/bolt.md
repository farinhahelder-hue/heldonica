# Bolt - Blog Index Caching (ISR)

Date: 2026-05-16

Optimized blog index page with Incremental Static Regeneration (ISR) with 60 second revalidation period.## 2024-05-18 - ISR Caching Added
**Learning:** Adding Incremental Static Regeneration (ISR) to static Next.js App Router pages significantly improves Time To First Byte (TTFB) by caching the page output for 60 seconds.
**Action:** Always identify pages with static content that do not need real-time data but could benefit from caching. Use `export const revalidate = 60` for caching these pages.
## 2024-06-10 / Optimizing N+1 Supabase API Queries
**Learning:** Found an anti-pattern in `app/api/jules/route.ts` where we were iterating over an array of sessions to hit the `upsert` API individually, creating an N+1 performance bottleneck.
**Action:** Replaced the loop with an array mapping to perform a single batched `.upsert(array)` to significantly decrease network latency (532ms to 11ms for 100 items).
