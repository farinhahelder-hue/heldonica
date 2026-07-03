'use client';

import { useState, useEffect } from 'react';

interface BlogCategory {
  id?: string;
  key: string;
  label: string;
  description?: string;
  display_order: number;
  is_active: boolean;
}

export default function BlogCategoriesManager() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cms/blog-categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;
    
    try {
      const response = await fetch(`/api/cms/blog-categories?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setCategories(categories.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const handleSave = async (category: BlogCategory) => {
    try {
      const method = category.id ? 'PUT' : 'POST';
      const url = category.id ? `/api/cms/blog-categories?id=${category.id}` : '/api/cms/blog-categories';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      
      if (response.ok) {
        setShowForm(false);
        setEditingCategory(null);
        fetchCategories();
      }
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Catégories Blog</h2>
        <button
          onClick={() => {
            setEditingCategory(null);
            setShowForm(!showForm);
          }}
          className="bg-[#2E4F4F] text-white px-6 py-2 rounded-lg hover:bg-[#1a2f2f] transition"
        >
          {showForm ? 'Annuler' : 'Nouvelle Catégorie'}
        </button>
      </div>

      {showForm && (
        <CategoryForm
          category={editingCategory}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingCategory(null);
          }}
        />
      )}

      {loading ? (
        <div className="text-center py-8">Chargement des catégories...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucune catégorie configurée. Cliquez sur &quot;Nouvelle Catégorie&quot; pour commencer.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ordre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Label
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.display_order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                    {category.key}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.label}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {category.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        category.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => {
                        setEditingCategory(category);
                        setShowForm(true);
                      }}
                      className="text-[#2E4F4F] hover:text-[#1a2f2f] mr-4"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(category.id!)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface CategoryFormProps {
  category: BlogCategory | null;
  onSave: (category: BlogCategory) => void;
  onCancel: () => void;
}

function CategoryForm({ category, onSave, onCancel }: CategoryFormProps) {
  const [formData, setFormData] = useState<BlogCategory>({
    key: category?.key || '',
    label: category?.label || '',
    description: category?.description || '',
    display_order: category?.display_order || 0,
    is_active: category?.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-generate key from label if empty
    if (!formData.key && formData.label) {
      const autoKey = formData.label
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      formData.key = autoKey;
    }
    
    onSave({
      ...formData,
      id: category?.id,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-6">
        {category?.id ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Label (visible)
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4F4F]"
              placeholder="Carnets Voyage"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Clé (URL/technique)
            </label>
            <input
              type="text"
              value={formData.key}
              onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4F4F]"
              placeholder="carnets-voyage"
            />
            <p className="mt-1 text-xs text-gray-500">
              Laissé vide pour génération automatique depuis le label
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4F4F]"
            placeholder="Récits et carnets de route détaillés"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordre d&apos;affichage
            </label>
            <input
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E4F4F]"
              min="0"
            />
          </div>

          <div className="flex items-center pt-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Catégorie active</span>
            </label>
          </div>
        </div>

        <div className="flex gap-4 pt-6 border-t">
          <button
            type="submit"
            className="bg-[#2E4F4F] text-white px-6 py-2 rounded-lg hover:bg-[#1a2f2f] transition"
          >
            Enregistrer
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
