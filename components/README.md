# Components Heldonica — notes d'usage

## PhotoEvidenceBlock (preuve photo + contexte réel)

Affiche une photo attestée avec son contexte vécu : lieu exact, date ISO,
anecdote des fondateurs (≤ 200 caractères) et lien optionnel vers l'album
Google Photos source. Aucune donnée générée : tout vient du CMS.

```tsx
import PhotoEvidenceBlock from '@/components/PhotoEvidenceBlock';

<PhotoEvidenceBlock
  imageUrl="https://..."
  location="Madère, Ponta do Sol"
  date="2024-09-15"
  anecdote="Aube vécue sur la falaise."
  albumLink="https://photos.app.goo.gl/..."
/>
```

- `components/PhotoEvidenceBlock.tsx` : composant présentatif + JSDoc.
- `components/PhotoEvidenceBlock.module.css` : classes `container`, `image`, `meta`, `anecdote`, `button`.
- `components/blocks/PhotoEvidenceBlock.tsx` : adaptateur pour le système de blocs (`type: 'photo_evidence'`).
- Validation : `lib/photo-evidence.ts` (`validatePhotoEvidence`, `isValidISODate`).
- Édition : palette `BlockCanvas` + section « 📸 Preuve visuelle » dans `app/panel-manager/CmsAdminClient.tsx`.
