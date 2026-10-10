import React from 'react';
import LivePreview from './LivePreview';

type Props = {
  title: string;
  slug: string;
  excerpt: string;
  onTitleChange: (v: string) => void;
  onSlugChange: (v: string) => void;
  onExcerptChange: (v: string) => void;
  onRegenerateSlug: () => void;
};

export default function EditHeader({
  title,
  slug,
  excerpt,
  onTitleChange,
  onSlugChange,
  onExcerptChange,
  onRegenerateSlug,
}: Props) {
  return (
    <div className="flex flex-col md:flex-row gap-6 mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex-1 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B7A]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={slug}
              onChange={(e) => onSlugChange(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2D8B7A]"
            />
            <button
              type="button"
              onClick={onRegenerateSlug}
              className="px-3 py-2 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 whitespace-nowrap"
            >
              ↺ Regénérer
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Extrait (Markdown supporté)</label>
          <textarea
            value={excerpt}
            onChange={(e) => onExcerptChange(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B7A]"
          />
        </div>
      </div>

      <div className="flex-1 hidden md:block">
        <label className="block text-sm font-medium text-gray-700 mb-1">Aperçu en temps réel</label>
        <div className="h-full border border-gray-200 rounded-xl overflow-hidden bg-gray-50 p-4 relative">
            <LivePreview
              siteName={title || 'Titre de l\'article'}
              tagline={excerpt || 'Extrait de l\'article...'}
              primaryColor="#2D8B7A"
              secondaryColor="#C4714A"
              fontHeading="Playfair Display"
              fontBody="DM Sans"
              logoUrl=""
              ctaLabel="Lire l'article"
              footerText="Heldonica"
              copyright=""
            />
        </div>
      </div>
    </div>
  );
}
