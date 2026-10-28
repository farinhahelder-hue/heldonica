# Bolt - Blog Index Caching (ISR)

Date: 2026-05-16

Optimized blog index page with Incremental Static Regeneration (ISR) with 60 second revalidation period.## 2024-05-18 - ISR Caching Added
**Learning:** Adding Incremental Static Regeneration (ISR) to static Next.js App Router pages significantly improves Time To First Byte (TTFB) by caching the page output for 60 seconds.
**Action:** Always identify pages with static content that do not need real-time data but could benefit from caching. Use `export const revalidate = 60` for caching these pages.

## 2026-10-07 - Scroll Event Throttling with requestAnimationFrame
**Learning:** Listening to 'scroll' events and synchronously updating React state inside them causes excessive re-renders, blocks the main thread, and leads to janky scrolling.
**Action:** Always use the `requestAnimationFrame` ticking pattern (setting a boolean flag to prevent queuing multiple frames) to throttle state updates linked to scroll listeners, deferring the work to the browser's render cycle.
## 2026-10-23 - Fix N+1 query when verifying drafts
**Learning:** Checking elements iteratively from the database inside a for loop leads to an N+1 queries performance bottleneck.
**Action:** Always fetch items in a batch where possible by querying an array of properties via `.in('column', ARRAY)` and mapping the responses, to guarantee O(1) query requests over O(N).

## 2026-10-27 - Pre-compiling RegExp for Linter Performance
**Learning:** Instantiating `new RegExp()` inside a loop that runs on every keystroke (like `lintBlock` in a React `useMemo`) forces the JS engine to re-parse and compile hundreds of regexes synchronously. This blocks the main thread (e.g. 170ms for 100 blocks) and causes severe typing latency.
**Action:** Always pre-compile static `RegExp` objects at the module level (e.g. mapping `FORBIDDEN_WORDS` into a `PRECOMPILED_FORBIDDEN_REGEXES` array) so the runtime evaluation is strictly O(1) in compilation time and avoids main thread jank during React re-renders.
