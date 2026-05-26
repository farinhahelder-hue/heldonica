# Audit de Sécurité : Routes CMS

## Liste des routes protégées ✅
- `app/api/cms/ai-reply/route.ts`
- `app/api/cms/articles/route.ts`
- `app/api/cms/articles/[id]/route.ts`
- `app/api/cms/blog-cover-upload/route.ts`
- `app/api/cms/carousel-history/[id]/route.ts`
- `app/api/cms/content/route.ts`
- `app/api/cms/demandes-travel/route.ts`
- `app/api/cms/fix-empty-images/route.ts`
- `app/api/cms/google-photos/import/route.ts`
- `app/api/cms/google-photos/route.ts`
- `app/api/cms/media-upload/route.ts`
- `app/api/cms/media/route.ts`
- `app/api/cms/settings/route.ts`
- `app/api/cms/setup-storage/route.ts`
- `app/api/cms/upload/route.ts`
- `app/api/cms/validate/route.ts`

*(Note : `app/api/cms/auth/route.ts` est la route d'authentification elle-même).*

## Liste des routes non protégées ❌
- `app/api/cms/analytics/route.ts`
  - **Fonction d'auth à appeler :** `requireCmsAuth`
- `app/api/cms/carousel-history/route.ts`
  - **Fonction d'auth à appeler :** `requireCmsAuth`
- `app/api/cms/cloud/google/callback/route.ts`
  - **Fonction d'auth à appeler :** `requireCmsAuth`
- `app/api/cms/cloud/google/disconnect/route.ts`
  - **Fonction d'auth à appeler :** `requireCmsAuth`
- `app/api/cms/cloud/google/initiate/route.ts`
  - **Fonction d'auth à appeler :** `requireCmsAuth`
- `app/api/cms/cloud/google/photos/route.ts`
  - **Fonction d'auth à appeler :** `requireCmsAuth`
- `app/api/cms/cloud/idrive/initiate/route.ts`
  - **Fonction d'auth à appeler :** `requireCmsAuth`
- `app/api/cms/llm-search/route.ts`
  - **Fonction d'auth à appeler :** `requireCmsAuth`
- `app/api/cms/media-storage/route.ts`
  - **Fonction d'auth à appeler :** `requireCmsAuth`
- `app/api/cms/newsletter/route.ts`
  - **Fonction d'auth à appeler :** `requireCmsAuth`
- `app/api/cms/publish-scheduled/route.ts`
  - **Fonction d'auth à appeler :** `requireCmsAuth`
- `app/api/cms/search-console/route.ts`
  - **Fonction d'auth à appeler :** `requireCmsAuth`
