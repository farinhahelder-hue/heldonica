'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

type Props = {
  open: boolean;
  title: string;
  excerpt?: string;
  content?: string;
  category?: string;
  author?: string;
  featured_image?: string;
  onClose: () => void;
};

export default function ArticlePreview({
  open,
  title,
  excerpt,
  content,
  category,
  author,
  featured_image,
  onClose,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 bg-black/40 backdrop-blur-sm overflow-auto"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-gray-900">Aperçu de l’article</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {featured_image && (
            <img
              src={featured_image}
              alt=""
              className="w-full h-48 object-cover rounded-lg mb-6"
            />
          )}

          <h1 className="text-2xl font-bold text-gray-900 mb-3">{title || '(Sans titre)'}</h1>

          <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
            {category && <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{category}</span>}
            {author && <span>Par {author}</span>}
          </div>

          {excerpt && (
            <p className="text-gray-600 italic border-l-4 border-[#2D8B7A] pl-4 mb-6">{excerpt}</p>
          )}

          {content ? (
            <div
              className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-a:text-[#2D8B7A]"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <p className="text-gray-400 text-sm">Aucun contenu à afficher.</p>
          )}
        </div>
      </div>
    </div>
  );
}
