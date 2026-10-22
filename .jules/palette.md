## 2024-10-22 - Adding aria-labels to icon-only buttons
**Learning:** Icon-only buttons without an `aria-label` are completely inaccessible to screen reader users, who will just hear "button" without context. This is specifically true for internal tools components like TestimonialsManager and VideoEditor where quick icon buttons are frequently used.
**Action:** When adding new icon-only buttons with tooltips (`title` attribute), always ensure an `aria-label` is also included for screen readers.
