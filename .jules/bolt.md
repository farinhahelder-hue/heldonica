# Bolt - Blog Index Caching (ISR)

Date: 2026-05-16

Optimized blog index page with Incremental Static Regeneration (ISR) with 60 second revalidation period.## 2024-05-16 - [Blog Index Caching (ISR)]
**Learning:** The blog index was completely bypassing cache (`force-dynamic`, `revalidate = 0`), which causes unnecessary database load and slow TTFB for highly static content.
**Action:** Implemented Incremental Static Regeneration (ISR) with a 60s revalidation period. Always verify caching strategies on index pages in Next.js App Router.
