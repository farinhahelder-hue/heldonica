## 2025-05-15 - Remove anti-pattern serverless caching in Next.js
**Learning:** Found `export const dynamic = 'force-dynamic'` and `export const revalidate = 0` in `app/blog/page.tsx`. This completely disables caching for static-leaning index pages, increasing server load and Time to First Byte (TTFB). This is a known anti-pattern in the memory.
**Action:** Replace with ISR (e.g. `export const revalidate = 60`) for pages like the blog index that don't need real-time dynamism.
