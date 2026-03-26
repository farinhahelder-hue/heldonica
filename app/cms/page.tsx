'use client';

import { useState, useEffect } from 'react';
import { blogPosts as initialBlogPosts, destinationPages as initialDestinations } from '@/lib/wordpress-data';

export default function CMSPage() {
  const [activeTab, setActiveTab] = useState('blog');
  const [blogPosts, setBlogPosts] = useState(initialBlogPosts);
  const [destinations, setDestinations] = useState(initialDestinations);
  const [editingPost, setEditingPost] = useState(null);
  const [editingDestination, setEditingDestination] = useState(null);
  const [message, setMessage] = useState('');
  const [searchBlog, setSearchBlog] = useState('');
  const [searchDest, setSearchDest] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    const saved = localStorage.getItem('heldonicaCMS');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.blogPosts) setBlogPosts(data.blogPosts);
        if (data.destinations) setDestinations(data.destinations);
      } catch (e) {
        console.error('Erreur lors du chargement:', e);
      }
    }
  }, []);

  const saveToLocalStorage = () => {
    localStorage.setItem('heldonicaCMS', JSON.stringify({ blogPosts, destinations }));
    setMessage('✅ Sauvegardé localement');
    setTimeout(() => setMessage(''), 3000);
  };

  const exportData = () => {
    const data = { blogPosts, destinations };
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
          if (data.destinations) setDestinations(data.destinations);
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

  const filteredBlogPosts = blogPosts.filter(post => {
    const matchSearch = post.title.toLowerCase().includes(searchBlog.toLowerCase()) ||
                       post.excerpt.toLowerCase().includes(searchBlog.toLowerCase());
    const matchCategory = filterCategory === 'all' || post.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const filteredDestinations = destinations.filter(dest =>
    dest.title.toLowerCase().includes(searchDest.toLowerCase())
  );

  const categories = ['all', ...new Set(blogPosts.map(p => p.category))];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-amber-900 to-green-900 text-white p-6 shadow-lg">
        <h1 className="text-4xl font-bold">🎨 Heldonica CMS</h1>
        <p className="text-amber-100 mt-1">Gestion complète du contenu • {blogPosts.length} articles • {destinations.length} destinations</p>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {message && (
          <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg shadow">
            {message}
          </div>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('blog')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === 'blog' ? 'bg-amber-900 text-white shadow-lg' : 'bg-white hover:bg-gray-100'}`}
          >
            📝 Blog ({blogPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('destinations')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === 'destinations' ? 'bg-amber-900 text-white shadow-lg' : 'bg-white hover:bg-gray-100'}`}
          >
            🗺️ Destinations ({destinations.length})
          </button>
          <button
            onClick={saveToLocalStorage}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white ml-auto hover:bg-blue-700 font-semibold"
          >
            💾 Sauvegarder
          </button>
          <button
            onClick={exportData}
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold"
          >
            📥 Exporter
          </button>
          <button
            onClick={importData}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 font-semibold"
          >
            📤 Importer
          </button>
        </div>

        {activeTab === 'blog' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <input
                type="text"
                placeholder="🔍 Rechercher un article..."
                value={searchBlog}
                onChange={(e) => setSearchBlog(e.target.value)}
                className="w-full p-2 border rounded-lg mb-4"
              />
              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                      filterCategory === cat
                        ? 'bg-amber-900 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {cat === 'all' ? '📌 Tous' : cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredBlogPosts.length > 0 ? (
                filteredBlogPosts.map((post) => (
                  <div key={post.id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800">{post.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          📁 {post.category} • 📅 {post.date} • ⏱️ {post.readTime} min
                        </p>
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{post.excerpt}</p>
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {post.tags.map(tag => (
                            <span key={tag} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingPost(post)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 ml-4 whitespace-nowrap"
                      >
                        ✏️ Éditer
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Aucun article trouvé
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'destinations' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <input
                type="text"
                placeholder="🔍 Rechercher une destination..."
                value={searchDest}
                onChange={(e) => setSearchDest(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div className="space-y-3">
              {filteredDestinations.length > 0 ? (
                filteredDestinations.map((dest) => (
                  <div key={dest.id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800">{dest.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">📍 {dest.slug}</p>
                        {dest.image && (
                          <img src={dest.image} alt={dest.title} className="mt-2 h-24 rounded object-cover" />
                        )}
                      </div>
                      <button
                        onClick={() => setEditingDestination(dest)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 ml-4 whitespace-nowrap"
                      >
                        ✏️ Éditer
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Aucune destination trouvée
                </div>
              )}
            </div>
          </div>
        )}

        {editingPost && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold mb-4">✏️ Éditer Article</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Titre</label>
                  <input
                    type="text"
                    value={editingPost.title}
                    onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Catégorie</label>
                  <input
                    type="text"
                    value={editingPost.category}
                    onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Résumé</label>
                  <textarea
                    value={editingPost.excerpt}
                    onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                    className="w-full p-2 border rounded-lg h-20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Contenu</label>
                  <textarea
                    value={editingPost.content}
                    onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                    className="w-full p-2 border rounded-lg h-40 font-mono text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setBlogPosts(blogPosts.map(p => p.id === editingPost.id ? editingPost : p));
                      setEditingPost(null);
                      setMessage('✅ Article mis à jour');
                      setTimeout(() => setMessage(''), 3000);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    ✅ Sauvegarder
                  </button>
                  <button
                    onClick={() => setEditingPost(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
                  >
                    ❌ Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {editingDestination && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold mb-4">✏️ Éditer Destination</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Titre</label>
                  <input
                    type="text"
                    value={editingDestination.title}
                    onChange={(e) => setEditingDestination({ ...editingDestination, title: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Slug</label>
                  <input
                    type="text"
                    value={editingDestination.slug}
                    onChange={(e) => setEditingDestination({ ...editingDestination, slug: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Image URL</label>
                  <input
                    type="text"
                    value={editingDestination.image}
                    onChange={(e) => setEditingDestination({ ...editingDestination, image: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Contenu</label>
                  <textarea
                    value={editingDestination.content}
                    onChange={(e) => setEditingDestination({ ...editingDestination, content: e.target.value })}
                    className="w-full p-2 border rounded-lg h-40 font-mono text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setDestinations(destinations.map(d => d.id === editingDestination.id ? editingDestination : d));
                      setEditingDestination(null);
                      setMessage('✅ Destination mise à jour');
                      setTimeout(() => setMessage(''), 3000);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    ✅ Sauvegarder
                  </button>
                  <button
                    onClick={() => setEditingDestination(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
                  >
                    ❌ Annuler
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
