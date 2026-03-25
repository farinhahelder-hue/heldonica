'use client';

import { useState, useEffect } from 'react';
import ArticleForm from './ArticleForm';
import ArticleList from './ArticleList';

export default function ArticleManager() {
  const [articles, setArticles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/articles');
      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setShowForm(false);
    setEditingId(null);
    await fetchArticles();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setArticles(articles.filter((a: any) => a._id !== id));
      }
    } catch (error) {
      console.error('Failed to delete article:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Articles</h2>
        <button
          onClick={() => {
            setEditingId(null);
            setShowForm(!showForm);
          }}
          className="bg-[#2E4F4F] text-white px-6 py-2 rounded-lg hover:bg-[#1a2f2f] transition"
        >
          {showForm ? 'Cancel' : 'New Article'}
        </button>
      </div>

      {showForm && (
        <ArticleForm
          articleId={editingId}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingId(null);
          }}
        />
      )}

      {loading ? (
        <div className="text-center py-8">Loading articles...</div>
      ) : (
        <ArticleList
          articles={articles}
          onEdit={(id) => {
            setEditingId(id);
            setShowForm(true);
          }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
