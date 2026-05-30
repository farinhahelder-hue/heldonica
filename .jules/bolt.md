# Bolt - Blog Index Caching (ISR)

Date: 2026-05-16

Optimized blog index page with Incremental Static Regeneration (ISR) with 60 second revalidation period.## 2024-05-18 - ISR Caching Added
**Learning:** Adding Incremental Static Regeneration (ISR) to static Next.js App Router pages significantly improves Time To First Byte (TTFB) by caching the page output for 60 seconds.
**Action:** Always identify pages with static content that do not need real-time data but could benefit from caching. Use `export const revalidate = 60` for caching these pages.
## 2025-03-02 - React Client-Side Filtering Optimization
**Learning:** In React 18, applying `useDeferredValue` to text inputs used for heavy client-side list filtering (like a list of blog posts) is a fast, safe, and effective way to ensure the UI thread remains unblocked and typing feels snappy, even if the filtering computation is complex.
**Action:** When encountering a large list filtered by user input on the client-side, prefer using `useDeferredValue` over traditional debouncing, as it integrates natively with React's concurrent rendering to avoid tearing and delays without arbitrary timeouts.
