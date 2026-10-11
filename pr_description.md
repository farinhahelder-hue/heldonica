🧹 [code health improvement] Deduplicate fallback image domain in sitemap.ts

🎯 **What:** Replaced the hardcoded domain string `'https://www.heldonica.fr'` in the `FALLBACK_IMAGE` definition with the `BASE_URL` constant.
💡 **Why:** This improves maintainability by eliminating a duplicated base URL. Any future changes to `BASE_URL` will automatically propagate to the fallback image.
✅ **Verification:** Ran `npm run build`, `npm run typecheck` and `npx vitest run`. Test failures and build failures observed in the workspace exist on unrelated modules (e.g. `@/lib/photo-exif`). Verified the diff via git that functionality remains mathematically identical to before.
✨ **Result:** A cleaner `app/sitemap.ts` string definition without redundant domain hardcoding.
