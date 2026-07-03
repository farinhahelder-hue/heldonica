'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

interface ArticleFormProps {
  articleId?: string | null;
  onSave: () => void;
  onCancel: () => void;
}

const CATEGORIES = [
  'Carnets Voyage',
  'Guides Pratiques',
  'Food & Lifestyle',
  'Découvertes Locales'
];

export default function ArticleForm({ articleId, onSave, onCancel }: ArticleFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Carnets Voyage',
    author: 'Heldonica',
    published: false,
    featured_image: '',
    meta_title: '',
    meta_description: '',
    tags: '',
    published_at: '',
    status: 'draft',
    faq_content: '',
    show_map: false,
    og_image_url: '',
    featured: false,
    voice_notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');

  const fetchArticle = useCallback(async () => {
    try {
      const response = await fetch(`/api/cms/articles/${articleId}`);
      if (!response.ok) throw new Error('Impossible de charger l\'article');
      const data = await response.json();
      
      if (data && data.article) {
        const art = data.article;
        setFormData({
          title: art.title || '',
          slug: art.slug || '',
          excerpt: art.excerpt || '',
          content: art.content || '',
          category: art.category || 'Carnets Voyage',
          author: art.author || 'Heldonica',
          published: !!art.published,
          featured_image: art.featured_image || '',
          meta_title: art.meta_title || '',
          meta_description: art.meta_description || '',
          tags: Array.isArray(art.tags) ? art.tags.join(', ') : (art.tags || ''),
          published_at: art.published_at ? new Date(art.published_at).toISOString().slice(0, 16) : '',
          status: art.status || 'draft',
          faq_content: typeof art.faq_content === 'object' ? JSON.stringify(art.faq_content, null, 2) : (art.faq_content || ''),
          show_map: !!art.show_map,
          og_image_url: art.og_image_url || '',
          featured: !!art.featured,
          voice_notes: art.voice_notes || '',
        });
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement de l\'article');
    }
  }, [articleId]);

  useEffect(() => {
    if (articleId) {
      fetchArticle();
    }
  }, [articleId, fetchArticle]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const method = articleId ? 'PATCH' : 'POST';
      const url = articleId ? `/api/cms/articles/${articleId}` : '/api/cms/articles';

      const tagsArray = formData.tags
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      let faqJson = null;
      if (formData.faq_content.trim()) {
        try {
          faqJson = JSON.parse(formData.faq_content);
        } catch {
          faqJson = formData.faq_content;
        }
      }

      const payload = {
        ...formData,
        tags: tagsArray,
        faq_content: faqJson,
        published_at: formData.published_at ? new Date(formData.published_at).toISOString() : null,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const resData = await response.json();
        throw new Error(resData.error || 'Erreur lors de la sauvegarde');
      }

      onSave();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // SEO derived values
  const metaTitle = formData.meta_title || formData.title
  const metaDesc = formData.meta_description || formData.excerpt
  const titleLen = metaTitle.length
  const descLen = metaDesc.length
  const slugValid = /^[a-z0-9-]+$/.test(formData.slug)
  const hasH1 = useMemo(() => {
    const m = formData.content.match(/<h1[\s>]/gi)
    return m ? m.length === 1 : false
  }, [formData.content])
  const seoChecks = [
    { ok: !!formData.featured_image, label: 'Image principale renseignée' },
    { ok: !!formData.excerpt && formData.excerpt.length >= 50, label: 'Extrait ≥ 50 caractères' },
    { ok: slugValid && !!formData.slug, label: 'Slug valide (minuscules, tirets)' },
    { ok: hasH1, label: 'Exactement 1 balise H1 dans le contenu' },
    { ok: !!formData.category, label: 'Catégorie assignée' },
    { ok: titleLen > 0 && titleLen <= 60, label: 'Titre SEO ≤ 60 caractères' },
    { ok: descLen > 0 && descLen <= 155, label: 'Description SEO ≤ 155 caractères' },
  ]
  const seoScore = seoChecks.filter((c) => c.ok).length

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8">
      <h3 className="text-2xl font-serif text-stone-900 mb-6">
        {articleId ? 'Modifier l\'article' : 'Créer un article'}
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 border-b border-stone-200">
        {(['content', 'seo'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 text-sm font-semibold rounded-t-lg transition ${
              activeTab === tab
                ? 'bg-white border border-b-white border-stone-200 -mb-px text-stone-900'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            {tab === 'content' ? 'Contenu' : (
              <span className="flex items-center gap-1.5">
                SEO
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  seoScore >= 6 ? 'bg-green-100 text-green-700' :
                  seoScore >= 4 ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>{seoScore}/{seoChecks.length}</span>
              </span>
            )}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={activeTab === 'seo' ? 'hidden' : 'space-y-6'}>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Titre</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-eucalyptus text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Slug (URL)</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-eucalyptus text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Extrait (Excerpt)</label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            rows={2}
            className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-eucalyptus text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Contenu (HTML / Markdown)</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={12}
            className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-eucalyptus text-sm font-mono"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Image principale (featured_image)</label>
            <input
              type="text"
              name="featured_image"
              value={formData.featured_image}
              onChange={handleChange}
              placeholder="/images/uploads/exemple.jpg"
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-eucalyptus text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Image OpenGraph (og_image_url)</label>
            <input
              type="text"
              name="og_image_url"
              value={formData.og_image_url}
              onChange={handleChange}
              placeholder="URL absolue de l'image de partage"
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-eucalyptus text-sm"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Catégorie</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-stone-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-eucalyptus text-sm"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Auteur</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-eucalyptus text-sm"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Tags (séparés par des virgules)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="suisse, slow travel, randonnée"
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-eucalyptus text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Date de publication (ISO)</label>
            <input
              type="datetime-local"
              name="published_at"
              value={formData.published_at}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-eucalyptus text-sm"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-center bg-stone-50 p-5 rounded-2xl border border-stone-150">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Statut</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-stone-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-eucalyptus text-sm"
            >
              <option value="draft">Brouillon</option>
              <option value="scheduled">Programmé</option>
              <option value="published">Publié</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 mt-4 md:mt-0">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="published"
                checked={formData.published}
                onChange={handleChange}
                className="w-4 h-4 rounded text-eucalyptus border-stone-300 focus:ring-eucalyptus"
              />
              <span className="text-sm font-medium text-stone-700">Rendre visible (published)</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-4 h-4 rounded text-eucalyptus border-stone-300 focus:ring-eucalyptus"
              />
              <span className="text-sm font-medium text-stone-700">Mettre à la une (featured)</span>
            </label>
          </div>

          <div className="flex flex-col gap-2 mt-4 md:mt-0">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="show_map"
                checked={formData.show_map}
                onChange={handleChange}
                className="w-4 h-4 rounded text-eucalyptus border-stone-300 focus:ring-eucalyptus"
              />
              <span className="text-sm font-medium text-stone-700">Afficher la carte</span>
            </label>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">FAQ Content (JSON ou texte libre)</label>
            <textarea
              name="faq_content"
              value={formData.faq_content}
              onChange={handleChange}
              rows={4}
              placeholder='[{"question": "...", "answer": "..."}]'
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-eucalyptus text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Notes Vocales / Memo Destination</label>
            <textarea
              name="voice_notes"
              value={formData.voice_notes}
              onChange={handleChange}
              rows={4}
              placeholder="Notes de terrain, destination, etc."
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-eucalyptus text-sm"
            />
          </div>
        </div>

        </div>{/* end content tab wrapper */}

        {/* SEO Tab */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            {/* Google Snippet Preview */}
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">Aperçu Google</p>
              <div className="bg-white rounded-xl border border-stone-100 p-4 shadow-sm space-y-0.5">
                <p className="text-[18px] text-[#1a0dab] font-normal leading-snug truncate">
                  {metaTitle || 'Titre de l\'article'}
                </p>
                <p className="text-[13px] text-[#006621] truncate">
                  heldonica.fr › blog › <span className="text-stone-400">{formData.slug || 'slug'}</span>
                </p>
                <p className="text-[13px] text-[#545454] leading-snug line-clamp-2">
                  {metaDesc || 'Extrait ou description SEO de l\'article…'}
                </p>
              </div>
            </div>

            {/* Char counters */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Meta Title
                  <span className={`ml-2 font-mono ${titleLen > 60 ? 'text-red-500' : 'text-stone-400'}`}>
                    {titleLen}/60
                  </span>
                </label>
                <input
                  type="text"
                  name="meta_title"
                  value={formData.meta_title}
                  onChange={handleChange}
                  placeholder={formData.title}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 text-sm ${
                    titleLen > 60
                      ? 'border-red-300 focus:ring-red-300'
                      : 'border-stone-200 focus:ring-eucalyptus'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Meta Description
                  <span className={`ml-2 font-mono ${descLen > 155 ? 'text-red-500' : 'text-stone-400'}`}>
                    {descLen}/155
                  </span>
                </label>
                <textarea
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={handleChange}
                  rows={3}
                  placeholder={formData.excerpt}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 text-sm ${
                    descLen > 155
                      ? 'border-red-300 focus:ring-red-300'
                      : 'border-stone-200 focus:ring-eucalyptus'
                  }`}
                />
              </div>
            </div>

            {/* Checklist */}
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
                Checklist SEO — {seoScore}/{seoChecks.length}
              </p>
              <ul className="space-y-2">
                {seoChecks.map((c) => (
                  <li key={c.label} className="flex items-center gap-2.5 text-sm">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                      c.ok ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                    }`}>
                      {c.ok ? '✓' : '✗'}
                    </span>
                    <span className={c.ok ? 'text-stone-700' : 'text-stone-400'}>{c.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-6 border-t border-stone-200">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-stone-900 text-white font-semibold rounded-full hover:bg-stone-800 transition disabled:opacity-50 text-sm"
          >
            {loading ? 'Sauvegarde...' : 'Enregistrer l\'article'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 bg-stone-100 text-stone-700 font-semibold rounded-full hover:bg-stone-200 transition text-sm"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
