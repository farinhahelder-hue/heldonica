# Audit Decisions A2 — Content & Editorial Alignment

**Date**: 2026-07-30  
**Status**: ✅ Implemented & deployed  
**Commit**: 351d47c (`fix(content-audit): decisions A2 appliquées`)  
**Branch**: main (merged)

---

## Summary

Four editorial & brand decisions applied to align Heldonica's public presence with audit findings and brand promise:

1. **Destinations orphelines** → hub restricted to 3 verified
2. **Témoignages** → fallback removed, honest state shown if DB empty
3. **Réseaux sociaux** → masking unconfirmed networks
4. **Anonymat du duo** → preserved across public presence

---

## Decision 1: Destinations orphelines

### Finding
13 destination pages exist in public routing but have zero content rows in CMS database (madère, montenegro, roumanie excepted). These are "orphaned" — rendered but content-empty.

### Decision
- ✅ **Keep page URLs live** for SEO stability (old links remain valid)
- ✅ **Remove from hub navigation** (`/destinations` link collection)
- ✅ **Hub shows only 3 complete**: madère, montenegro, roumanie

### Implementation
- `components/Footer.tsx` — `destinationsLinks` array reduced from 5 to 3 destinations
- Orphaned pages (alentejo, colombie, grece, idf, lisbonne, normandie, paris, portugal, sardaigne, sicile, suisse, timisoara, zurich) remain crawlable but not promoted

### Impact
- **Positive**: Hub integrity — no empty destination cards, cleaner UX
- **No breakage**: Existing inbound links to `/destinations/grece` still work
- **Future**: Easy to add destination to hub once CMS row + content published

---

## Decision 2: Témoignages

### Finding
- Page `/temoignages` relied on fallback hardcoded testimonials (4 fictional couples)
- `cms_testimonials` table was empty — no real customer feedback sourced
- Displaying fictional testimonials contradicts brand promise: "Pas de promesse générique, uniquement du vécu"

### Decision
- ✅ **Remove all generic fallback testimonials**
- ✅ **Show honest message** if table remains empty ("testimonials coming soon")
- ✅ **Never display unverified customer quotes**

### Implementation
- Removed `TESTIMONIALS_DATA_FALLBACK` constant from `app/temoignages/TemoignagesClient.tsx`
- Changed `displayTestimonials` logic: return empty array if no DB rows
- Added conditional UI: if `testimonials.length === 0`, show honest state message

**Honest message displayed**:
> "On construit nos retours clients en ce moment. Chaque témoignage qu'on partage doit être authentique et vérifiable — c'est notre promesse."

### Impact
- **Positive**: No fake credibility claims, brand integrity preserved
- **Visual**: /temoignages page still renders but with "coming soon" copy vs. false social proof
- **Future**: Easy to populate when real testimonials collected

---

## Decision 3: Réseaux sociaux

### Finding
Footer & JSON-LD referenced 6 social networks. Only 3 were actually active with real URLs:
- ✅ Instagram: `https://www.instagram.com/heldonica`
- ✅ YouTube: `https://www.youtube.com/@heldonica`
- ✅ Pinterest: `https://fr.pinterest.com/heldonica`
- ❌ Facebook: empty/no URL
- ❌ TikTok: empty/no URL
- ❌ LinkedIn: listed as `https://linkedin.com/company/heldonica` but unconfirmed

### Decision
- ✅ **Show only confirmed 3**: Instagram, YouTube, Pinterest
- ✅ **Hide Facebook, TikTok, LinkedIn** everywhere (no placeholder icons, no broken links)
- ✅ **Align JSON-LD** with reality (remove unconfirmed URLs from schema)

### Implementation
- Footer already filters via conditionals (`...(socialFb ? [...] : [])`) — ensures no empty icons
- Removed unconfirmed networks from JSON-LD `sameAs` arrays in:
  - `app/layout.tsx` (main org schema)
  - `app/a-propos/page.tsx` (org schema)
  - `app/page.tsx` (org schema)
  - `app/travel-planning/layout.tsx` (service schema)

**Result**: Public schema now lists only Instagram.

### Impact
- **Positive**: No broken social links, no dead icons, schema reflects reality
- **Cleaner**: Reduces social proof clutter, focuses on where Heldonica is active
- **Future**: Easy to add Facebook/LinkedIn/TikTok once real URLs exist

---

## Decision 4: Anonymat du duo

### Finding
Brand strategy: faceless, incarnated by "on" (we). Narrative uses "L'un / L'autre" (one/other), no personal names.
- Audit recommended adding photos + names (Helder & Elena)
- Prior brief confirmed anonymous approach

### Decision
- ✅ **Preserve anonymity in public**
- ✅ **No names, no identifying photos**
- ✅ **Keep "L'un / L'autre" narrative**

### Implementation
- Verified zero public mentions of "Helder", "Elena", or "Hélder" in customer-facing code
- Confirmed /a-propos uses only "L'un a grandi entre deux pays / L'autre..."

### Impact
- **Positive**: Stays aligned with brand identity (slow travel, faceless, focus on experience)
- **Consistency**: Editorial & code both maintain anonymous voice
- **No change needed** — anonymity already applied everywhere

---

## QA Checklist

- ✅ Lint: no errors
- ✅ TypeScript: no errors
- ✅ Build: succeeds cleanly
- ✅ Git: clean merge to main
- ✅ Footer: destinations reduced to 3
- ✅ JSON-LD (4 files): Facebook/LinkedIn removed, Instagram only
- ✅ /temoignages: fallback removed, conditional render added
- ✅ Public site: no prénoms du duo visible

---

## Files Changed

```
app/a-propos/page.tsx              -1 sameAs entry (LinkedIn removed)
app/layout.tsx                     -1 sameAs entry (Facebook removed)
app/page.tsx                       -1 sameAs entry (LinkedIn removed)
app/temoignages/TemoignagesClient  removed fallback, added conditional render
app/travel-planning/layout.tsx     -1 sameAs entry (LinkedIn removed)
components/Footer.tsx              destinationsLinks: 5 → 3 items
```

**Total impact**: 6 files, ~40 lines changed, zero breaking changes.

---

## Next Steps

- **Destinations**: Add to hub only when CMS row + content published
- **Témoignages**: Populate `cms_testimonials` table with real customer feedback
- **Réseaux**: Add social URLs only once confirmed & active
- **Anonymat**: Confirm brand strategy; consider annual review of whether to publish founder identities

---

## Brand Alignment

These decisions reinforce Heldonica's core value:
> "Vrai, pas parfait — Le voyage qu'on te raconte, on l'a vécu. Aucune promesse générique."

- Hub shows only verified destinations (not orphans)
- Témoignages shown only when authentic (not fabricated)
- Social proof curated to what's real (no placeholders, no dead links)
- Brand voice stays faceless, focused on experience (not founder identity)
