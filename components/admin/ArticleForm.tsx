'use client';

import { useState, useEffect, useCallback } from 'react';

interface ArticleFormProps {
  articleId?: string | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function ArticleForm({ articleId, onSave, onCancel }: ArticleFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Travel',
    author: 'Heldonica',
    published: false,
    image: '',
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: [] as string[],
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchArticle = useCallback(async () => {
    try {
      const response = await fetch(`/api/articles/${articleId}`);
      const data = await response.json();
      setFormData(data);
    } catch (err) {
      console.error('Failed to fetch article:', err);
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

  const handleSeoChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const method = articleId ? 'PUT' : 'POST';
      const url = articleId ? `/api/articles/${articleId}` : '/api/articles';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save article');
      }

      onSave();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-6">{articleId ? 'Edit Article' : 'New Article'}</h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4F4F]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4F4F]"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4F4F]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4F4F]"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4F4F]"
            >
              <option>Travel</option>
              <option>Culture</option>
              <option>Destination</option>
              <option>Tips</option>
              <option>News</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4F4F]"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="published"
              checked={formData.published}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700">Published</span>
          </label>
        </div>

        <div className="border-t pt-6">
          <h4 className="font-bold mb-4">SEO Settings</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
              <input
                type="text"
                value={formData.seo.metaTitle}
                onChange={(e) => handleSeoChange('metaTitle', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4F4F]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
              <textarea
                value={formData.seo.metaDescription}
                onChange={(e) => handleSeoChange('metaDescription', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4F4F]"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-6 border-t">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#2E4F4F] text-white px-6 py-2 rounded-lg hover:bg-[#1a2f2f] transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Article'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
