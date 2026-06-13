# Bolt - Blog Index Caching (ISR)

Date: 2026-05-16

Optimized blog index page with Incremental Static Regeneration (ISR) with 60 second revalidation period.## 2024-05-18 - ISR Caching Added
**Learning:** Adding Incremental Static Regeneration (ISR) to static Next.js App Router pages significantly improves Time To First Byte (TTFB) by caching the page output for 60 seconds.
**Action:** Always identify pages with static content that do not need real-time data but could benefit from caching. Use `export const revalidate = 60` for caching these pages.
- **Date**: $(date +%Y-%m-%d)
- **Learning**: Unnecessary N+1 loops using Supabase `upsert` were found in the CMS settings API route (`/api/cms/settings`). This blocks DB connections and significantly reduces DB throughput (measured ~516ms vs ~51ms for 10 entries).
- **Action**: Always accumulate multiple database rows in an array and use a single `.upsert(array)` call instead of looping through items sequentially, especially in serverless functions where concurrency bounds apply.

## 2026-06-12 - React Performance Optimization with useDeferredValue
**Learning:** Filtering large lists locally in React (like the CRM travel demands panel) blocks the main thread on every keystroke when typing in a search bar, causing input lag.
**Action:** When filtering lists based on text input in React 18+, use `useDeferredValue` to debounce the search state. This ensures the typing remains responsive by deferring the heavy filtering calculation.