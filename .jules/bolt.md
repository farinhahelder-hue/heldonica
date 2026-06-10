# Bolt - Blog Index Caching (ISR)

Date: 2026-05-16

Optimized blog index page with Incremental Static Regeneration (ISR) with 60 second revalidation period.## 2024-05-18 - ISR Caching Added
**Learning:** Adding Incremental Static Regeneration (ISR) to static Next.js App Router pages significantly improves Time To First Byte (TTFB) by caching the page output for 60 seconds.
**Action:** Always identify pages with static content that do not need real-time data but could benefit from caching. Use `export const revalidate = 60` for caching these pages.

## 2024-05-26 - force-dynamic Anti-Pattern on Static Pages
**Learning:** Using `export const dynamic = 'force-dynamic'` on essentially static pages (like hub pages with client-side filtering) destroys Time To First Byte (TTFB) by forcing server-side rendering on every request when there is no actual dynamic server data needed.
**Action:** Replace unnecessary `force-dynamic` with ISR (`export const revalidate = 3600`) for pages containing static or slowly changing content, even if they render client components.
