# Bolt - Blog Index Caching (ISR)

Date: 2026-05-16

Optimized blog index page with Incremental Static Regeneration (ISR) with 60 second revalidation period.## 2024-05-18 - ISR Caching Added
**Learning:** Adding Incremental Static Regeneration (ISR) to static Next.js App Router pages significantly improves Time To First Byte (TTFB) by caching the page output for 60 seconds.
**Action:** Always identify pages with static content that do not need real-time data but could benefit from caching. Use `export const revalidate = 60` for caching these pages.

## 2026-10-07 - Scroll Event Throttling with requestAnimationFrame
**Learning:** Listening to 'scroll' events and synchronously updating React state inside them causes excessive re-renders, blocks the main thread, and leads to janky scrolling.
**Action:** Always use the `requestAnimationFrame` ticking pattern (setting a boolean flag to prevent queuing multiple frames) to throttle state updates linked to scroll listeners, deferring the work to the browser's render cycle.

## 2024-10-25 - Scroll Progress Bars with Direct DOM Mutation
**Learning:** Updating React state on every scroll frame (even when throttled with `requestAnimationFrame`) for a progress bar still triggers unnecessary component re-renders.
**Action:** Always use `useRef` to directly mutate the DOM node's `style.width` and `aria-valuenow` attributes for scroll progress bars, completely bypassing React's reconciliation cycle and eliminating re-renders.
