## 2024-05-18 - Avoid force-dynamic on Index Pages
**Learning:** In Next.js App Router, using `export const dynamic = "force-dynamic"` or `export const revalidate = 0` on index/listing pages disables caching entirely. This creates a significant performance bottleneck by forcing a server render on every request, increasing TTFB and database load unnecessarily.
**Action:** Always prefer Incremental Static Regeneration (ISR) by setting `export const revalidate = 60` (or similar reasonable duration) for pages that require freshness but don't need to be strictly real-time (like blog lists).
