## 2024-05-14 - Accessible feedback for copied links
**Learning:** Using direct DOM manipulation (`document.getElementById`) to change button text for temporary feedback (e.g. "Copié !") is not announced by screen readers, creating an accessibility gap.
**Action:** Use React `useState` to manage the button's state and add `aria-live="polite"` to the element so that the state change is properly announced to screen readers.
