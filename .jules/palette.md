## 2026-10-14 - Accessible text updates with React State
**Learning:** In React components with interactive text changes (like changing 'Copy' to 'Copied!'), using direct DOM manipulation (`document.getElementById`) circumvents React's rendering lifecycle and can break accessibility since screen readers may miss the text change.
**Action:** Always use React state (`useState`) to manage dynamic text, and combine it with `aria-live="polite"` on the element to ensure screen readers properly announce the feedback.
