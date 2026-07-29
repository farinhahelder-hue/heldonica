# Storage Configuration — Heldonica

## Buckets Supabase Storage

### 1. `media` Bucket
- **Usage:** Stockage principal des médias (images, vidéos uploadées)
- **Type:** Public (accessible via URL publique)
- **File size limit:** 50MB (pour vidéos)
- **Path pattern:** `uploads/{timestamp}-{filename}`
- **Fichiers liés:**
  - `lib/supabase-storage.ts` — Fonctions utilitaires (upload, delete, list, getPublicUrl)
  - `app/api/cms/media/route.ts` — API d'upload/téléchargement
  - `app/api/cms/upload/route.ts` — Endpoint d'upload alternatif
  - `app/api/cms/setup-storage/route.ts` — Initialisation bucket

### 2. `blog-images` Bucket
- **Usage:** Images de couverture des articles blog
- **Type:** Public
- **Fichiers liés:**
  - `app/api/cms/blog-cover-upload/route.ts` — Upload des covers

## AWS S3 (Optionnel)

### Configuration
```bash
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
```

### Usage
- `lib/s3-media.ts` — Alternative à Supabase Storage
- Non activé par défaut (Supabase Storage utilisé)

### Note
S3 est configuré mais pas utilisé activement. À nettoyer si non nécessaire.

## RLS Policies

Les buckets Supabase Storage doivent avoir les policies RLS suivantes:

### Bucket `media`
```sql
-- Lecture publique
CREATE POLICY "Public read media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Upload via service role uniquement
CREATE POLICY "Service role upload media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media' AND auth.role() = 'service_role');

-- Suppression via service role uniquement
CREATE POLICY "Service role delete media"
ON storage.objects FOR DELETE
USING (bucket_id = 'media' AND auth.role() = 'service_role');
```

### Bucket `blog-images`
```sql
-- Lecture publique
CREATE POLICY "Public read blog-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- Upload via service role uniquement
CREATE POLICY "Service role upload blog-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'blog-images' AND auth.role() = 'service_role');
```

## Maintenance

### Vérifier les buckets
```typescript
GET /api/cms/setup-storage
```

### Nettoyer les fichiers non utilisés
```typescript
// Via Supabase Dashboard
// ou API
const { data } = await supabase.storage.from('media').list('uploads/')
```

## Bonnes pratiques

1. **Images:** Utiliser Unsplash pour les images de stock, Supabase Storage pour les uploads users
2. **Taille max:** 10MB recommandé pour les images, 50MB max pour les vidéos
3. **CDN:** Supabase Storage inclut CloudFront automatiquement
4. **Backup:** Supabase gère les backups automatiques

---

*Dernière mise à jour: 2026-07-27*
