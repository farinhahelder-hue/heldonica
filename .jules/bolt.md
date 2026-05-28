# Bolt - Performance Optimizations

## 2024-05-18 - ISR Caching Added
**Learning:** Adding Incremental Static Regeneration (ISR) to static Next.js App Router pages significantly improves Time To First Byte (TTFB) by caching the page output for 60 seconds.
**Action:** Always identify pages with static content that do not need real-time data but could benefit from caching. Use `export const revalidate = 60` for caching these pages.

## 2024-05-28 - React 18 Search Debouncing
**Learning:** For client-side search filtering on large lists, updating the search query state immediately blocks the main thread on every keystroke. Using React 18's `useDeferredValue` allows the text input to remain responsive while the heavy list filtering happens in the background.
**Action:** Always wrap search filter query values with `useDeferredValue` before using them inside complex `useMemo` filtering arrays to maintain UI responsiveness.
