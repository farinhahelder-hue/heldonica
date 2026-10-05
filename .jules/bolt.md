# Bolt - Blog Index Caching (ISR)

Date: 2026-05-16

Optimized blog index page with Incremental Static Regeneration (ISR) with 60 second revalidation period.## 2024-05-18 - ISR Caching Added
**Learning:** Adding Incremental Static Regeneration (ISR) to static Next.js App Router pages significantly improves Time To First Byte (TTFB) by caching the page output for 60 seconds.
**Action:** Always identify pages with static content that do not need real-time data but could benefit from caching. Use `export const revalidate = 60` for caching these pages.
2024-10-24/Performance/Refactored N+1 Supabase .upsert() loop into a single bulk upsert in app/api/cms/settings/route.ts
## 2024-05-18 - ISR Caching Implementation details
**Learning:** Adding Incremental Static Regeneration (ISR) to static Next.js App Router pages via `export const revalidate = 3600` is highly effective, but it is important to include a brief comment explaining the optimization (e.g., `// ISR: cache page for 1 hour to reduce CMS load and improve TTFB`) to ensure clarity and adherence to the prompt.
**Action:** When adding standard Next.js route segment configs like `revalidate`, always include an inline code comment summarizing the intent and expected performance benefit.
