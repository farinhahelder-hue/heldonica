/**
 * components/admin/seo/SerpAndSocialPreview.tsx
 *
 * Aperçu « Google SERP » et « carte sociale » d'un article, tel qu'il
 * apparaîtra une fois publié. Reproduit la logique de repli du site :
 * seo_title → title, seo_description → excerpt, og_image → featured_image.
 * Aucune donnée n'est inventée, le composant n'affiche que ce qui est saisi.
 */

import { SITE_URL } from '@/lib/seo';

export interface SerpPreviewArticle {
  title?: string;
  slug?: string;
  seo_title?: string;
  seo_description?: string;
  excerpt?: string;
  og_image?: string;
  featured_image?: string;
}

export interface SerpAndSocialPreviewProps {
  article?: SerpPreviewArticle | null;
}

function truncate(value: string, max: number): string {
  const text = value.trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export default function SerpAndSocialPreview({ article }: SerpAndSocialPreviewProps) {
  const title = article?.seo_title || article?.title || '';
  const description = article?.seo_description || article?.excerpt || '';
  const image = article?.og_image || article?.featured_image || '';
  const slug = article?.slug || '';
  const url = slug ? `${SITE_URL}/blog/${slug}` : SITE_URL;

  const empty = !title && !description;

  return (
    <div className="space-y-4">
      {empty && (
        <p className="text-sm text-gray-500">
          Renseigne un titre et une méta-description pour voir l’aperçu.
        </p>
      )}

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Aperçu Google
        </p>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="truncate text-xs text-emerald-700">{url}</p>
          <p className="mt-0.5 truncate text-lg text-blue-800">
            {title ? truncate(title, 60) : 'Titre de l’article'}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {description
              ? truncate(description, 160)
              : 'La méta-description apparaîtra ici.'}
          </p>
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Aperçu partage social
        </p>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={title || 'Aperçu de partage'}
              className="h-40 w-full object-cover"
            />
          ) : (
            <div className="flex h-40 w-full items-center justify-center bg-gray-100 text-xs text-gray-400">
              Image de partage non définie
            </div>
          )}
          <div className="p-3">
            <p className="text-xs uppercase text-gray-400">
              {slug ? slug.replace(/-/g, ' ') : 'heldonica.fr'}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-gray-900">
              {title || 'Titre de l’article'}
            </p>
            <p className="mt-1 text-xs text-gray-600">
              {description ? truncate(description, 120) : 'Description du partage.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
