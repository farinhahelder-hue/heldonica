## 2026-05-21 - Added ARIA labels to icon-only toggle buttons
**Learning:** Found that the custom video studio navigation (`components/admin/VideoStudioNav.tsx`) heavily relied on icon-only buttons for toggling the sidebar and mobile menus without accessible names, reducing screen reader compatibility in the admin panel.
**Action:** Always verify that interactive elements containing only SVGs (like `ChevronRight` or `Film`) explicitly include an `aria-label` attribute describing their action, especially in custom UI patterns.
