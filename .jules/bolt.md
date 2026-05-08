## 2024-05-18 - Missing debounce on Scroll Progress
**Learning:** `BlogClientPage.tsx` uses `window.addEventListener('scroll', handleScroll, { passive: true })` but `handleScroll` triggers a React state update (`setProgress(pct)`) synchronously on every scroll event. This causes excessive re-renders.

**Action:** Debounce or throttle the scroll event listener, or better yet, use `requestAnimationFrame` to throttle the state updates.
