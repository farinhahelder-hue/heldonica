# Bolt - Blog Index Caching (ISR)

Date: 2026-05-16

Optimized blog index page with Incremental Static Regeneration (ISR) with 60 second revalidation period.## 2024-05-18 - ISR Caching Added
**Learning:** Adding Incremental Static Regeneration (ISR) to static Next.js App Router pages significantly improves Time To First Byte (TTFB) by caching the page output for 60 seconds.
**Action:** Always identify pages with static content that do not need real-time data but could benefit from caching. Use `export const revalidate = 60` for caching these pages.
2024-10-24/Performance/Refactored N+1 Supabase .upsert() loop into a single bulk upsert in app/api/cms/settings/route.ts
## 2026-08-01 - Batch fetching data in Blog page
**Learning:** Batch fetching independent data sources like posts and categories via Promise.all() in Next.js Server Components reduces TTFB significantly.
**Action:** When a Next.js Server component has multiple sequential await queries for independent resources, re-factor them to use Promise.all().
