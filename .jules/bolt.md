## 2025-05-14 - Removed dynamic force-dynamic on /blog
**Learning:** Hardcoding `export const dynamic = 'force-dynamic'` and `export const revalidate = 0` on static-leaning index pages (like blog lists) in Next.js App Router disables caching completely, which increases server load and TTFB for end users. Incremental Static Regeneration (ISR) with `revalidate` is a better choice.
**Action:** Replace `dynamic = 'force-dynamic'` and `revalidate = 0` with a sensible ISR time like `revalidate = 60` or `revalidate = 3600` on static pages.
