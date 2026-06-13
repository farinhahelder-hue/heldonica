# Bolt - Blog Index Caching (ISR)

Date: 2026-05-16

Optimized blog index page with Incremental Static Regeneration (ISR) with 60 second revalidation period.## 2024-05-18 - ISR Caching Added
**Learning:** Adding Incremental Static Regeneration (ISR) to static Next.js App Router pages significantly improves Time To First Byte (TTFB) by caching the page output for 60 seconds.
**Action:** Always identify pages with static content that do not need real-time data but could benefit from caching. Use `export const revalidate = 60` for caching these pages.

## 2024-06-10 - Search Input Debouncing with useDeferredValue
**Learning:** In React 18 apps, heavy list filtering operations inside `useMemo` that depend on a text input's state can block the main UI thread during typing, causing a laggy input experience. This is a common pattern in admin panels or search hubs.
**Action:** Prefer using `useDeferredValue` on the search query state before passing it into the `useMemo` dependency array for large list filtering. This yields rendering back to the main thread immediately for the input keystrokes while deferring the heavy filtering calculation.
