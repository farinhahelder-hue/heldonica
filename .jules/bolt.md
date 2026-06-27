# Bolt - Blog Index Caching (ISR)

Date: 2026-05-16

Optimized blog index page with Incremental Static Regeneration (ISR) with 60 second revalidation period.## 2024-05-18 - ISR Caching Added
**Learning:** Adding Incremental Static Regeneration (ISR) to static Next.js App Router pages significantly improves Time To First Byte (TTFB) by caching the page output for 60 seconds.
**Action:** Always identify pages with static content that do not need real-time data but could benefit from caching. Use `export const revalidate = 60` for caching these pages.
2024-10-24/Performance/Refactored N+1 Supabase .upsert() loop into a single bulk upsert in app/api/cms/settings/route.ts
## 2026-06-27 - Debounced Search in CmsAdminClient
**Learning:** When dealing with large lists that are filtered on the client side, tying the filter directly to every keystroke can block the main thread and cause typing lag. Using React 18's `useDeferredValue` allows the typing input to remain responsive while the expensive filtering operation runs in the background.
**Action:** Use `useDeferredValue` combined with `useMemo` for client-side search filtering on large lists to prevent UI lag during text input.
