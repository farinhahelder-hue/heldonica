# Bolt - Blog Index Caching (ISR)

Date: 2026-05-16

Optimized blog index page with Incremental Static Regeneration (ISR) with 60 second revalidation period.## 2024-05-18 - ISR Caching Added
**Learning:** Adding Incremental Static Regeneration (ISR) to static Next.js App Router pages significantly improves Time To First Byte (TTFB) by caching the page output for 60 seconds.
**Action:** Always identify pages with static content that do not need real-time data but could benefit from caching. Use `export const revalidate = 60` for caching these pages.
## 2024-05-24 - Static Page ISR Implementation
**Learning:** When configuring Next.js pages for performance, verify if a page is a Server Component or Client Component before applying `export const revalidate`. In Server Components, adding ISR via `export const revalidate = 3600` ensures the content is cached (e.g. 1 hour) avoiding unnecessary server re-renders, while maintaining up-to-date data.
**Action:** Before optimizing a page with route segment configs like `revalidate`, ensure it does not use the `"use client"` directive to prevent Next.js build errors.
