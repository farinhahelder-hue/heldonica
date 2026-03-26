'use client';

import { useState, useEffect } from 'react';
import { blogPosts as initialBlogPosts } from '@/lib/wordpress-data';

export default function CMSPage() {
  const [activeTab, setActiveTab] = useState('blog');
  const [blogPosts, setBlogPosts] = useState(initialBlogPosts);
  const [editingPost, setEditingPost] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('heldonicaCMS');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.blogPosts) setBlogPosts(data.blogPosts);
      } catch (e) {
        console.error('Erreur lors du chargement:', e);
      }
    }
  }, []);

  const saveToLocalStorage = () => {
    localStorage.setItem('heldonicaCMS', JSON.stringify({ blogPosts }));
    setMessage('✅ Sauvegardé localement');
    setTimeout(() => setMessage(''), 3000);
  };

  const exportData = () => {
    const data = { blogPosts };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'heldonica-cms-backup.json';
    a.click();
    setMessage('✅ Exporté');
    setTimeout(() => setMessage(''), 3000);
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.blogPosts) setBlogPosts(data.blogPosts);
          setMessage('✅ Importé');
          setTimeout(() => setMessage(''), 3000);
        } catch (err) {
          setMessage('❌ Erreur');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-amber-900 to-green-900 text-white p-6">
        <h1 className="text-3xl font-bold">🎨 Heldonica CMS</h1>
        <p className="text-amber-100">Gestion complète du contenu</p>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {message && (
          <div className="mb-4 p-4 bg-green-100 text-green-800 rounded">
            {message}
          </div>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('blog')}
            className={`px-4 py-2 rounded ${activeTab === 'blog' ? 'bg-amber-900 text-white' : 'bg-white'}`}
          >
            📝 Blog ({blogPosts.length})
          </button>
          <button
            onClick={saveToLocalStorage}
            className="px-4 py-2 rounded bg-blue-600 text-white ml-auto"
          >
            💾 Sauvegarder
          </button>
          <button
            onClick={exportData}
            className="px-4 py-2 rounded bg-green-600 text-white"
          >
            📥 Exporter
          </button>
          <button
            onClick={importData}
            className="px-4 py-2 rounded bg-purple-600 text-white"
          >
            📤 Importer
          </button>
        </div>

        {activeTab === 'blog' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Articles de Blog</h2>
            {blogPosts.map((post) => (
              <div key={post.id} className="bg-white p-4 rounded shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{post.title}</h3>
                    <p className="text-sm text-gray-600">{post.category} • {post.date}</p>
                  </div>
                  <button
                    onClick={() => setEditingPost(post)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                  >
                    Éditer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {editingPost && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold mb-4">Éditer Article</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  value={editingPost.title}
                  onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Titre"
                />
                <textarea
                  value={editingPost.excerpt}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  className="w-full p-2 border rounded h-24"
                  placeholder="Résumé"
                />
                <textarea
                  value={editingPost.content}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  className="w-full p-2 border rounded h-40"
                  placeholder="Contenu"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setBlogPosts(blogPosts.map(p => p.id === editingPost.id ? editingPost : p));
                      setEditingPost(null);
                      setMessage('✅ Article mis à jour');
                      setTimeout(() => setMessage(''), 3000);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded"
                  >
                    Sauvegarder
                  </button>
                  <button
                    onClick={() => setEditingPost(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
