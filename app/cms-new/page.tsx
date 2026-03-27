'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  featured_image: string | null;
  author: string | null;
  published: boolean;
  created_at: string;
}

interface Destination {
  id: string;
  name: string;
  slug: string;
  country: string;
  description: string;
  featured_image: string | null;
  best_season: string;
  duration: string;
  difficulty: string;
  highlights: string[];
  published: boolean;
}

interface Settings {
  id: string;
  logo_url: string | null;
  site_name: string;
  tagline: string | null;
  primary_color: string;
  secondary_color: string;
  linkedin_url: string | null;
  instagram_url: string | null;
  instagram_handle: string | null;
}

export default function CMSNew() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Settings
  const [settings, setSettings] = useState<Settings | null>(null);

  // Blog
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [searchBlog, setSearchBlog] = useState('');

  // Destinations
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [searchDest, setSearchDest] = useState('');

  useEffect(() => {
    loadSettings();
    loadBlogPosts();
    loadDestinations();
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Settings functions
  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('cms_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error: any) {
      showMessage('error', 'Erreur chargement paramètres: ' + error.message);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('cms_settings')
        .update({
          logo_url: settings.logo_url,
          site_name: settings.site_name,
          tagline: settings.tagline,
          primary_color: settings.primary_color,
          secondary_color: settings.secondary_color,
          linkedin_url: settings.linkedin_url,
          instagram_url: settings.instagram_url,
          instagram_handle: settings.instagram_handle,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id);

      if (error) throw error;
      showMessage('success', 'Paramètres sauvegardés');
    } catch (error: any) {
      showMessage('error', 'Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Blog functions
  const loadBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('cms_blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogPosts(data || []);
    } catch (error: any) {
      showMessage('error', 'Erreur chargement articles: ' + error.message);
    }
  };

  const createBlogPost = async () => {
    const newPost = {
      title: 'Nouvel article',
      slug: `article-${Date.now()}`,
      excerpt: '',
      content: '',
      category: 'Travel',
      tags: [],
      published: false
    };

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cms_blog_posts')
        .insert(newPost)
        .select()
        .single();

      if (error) throw error;
      setBlogPosts([data, ...blogPosts]);
      setEditingPost(data);
      showMessage('success', 'Article créé');
    } catch (error: any) {
      showMessage('error', 'Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateBlogPost = async (post: BlogPost) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('cms_blog_posts')
        .update({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          tags: post.tags,
          featured_image: post.featured_image,
          author: post.author,
          published: post.published,
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id);

      if (error) throw error;

      setBlogPosts(blogPosts.map(p => p.id === post.id ? post : p));
      showMessage('success', 'Article mis à jour');
    } catch (error: any) {
      showMessage('error', 'Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteBlogPost = async (id: string) => {
    if (!confirm('Supprimer cet article ?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('cms_blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBlogPosts(blogPosts.filter(p => p.id !== id));
      setEditingPost(null);
      showMessage('success', 'Article supprimé');
    } catch (error: any) {
      showMessage('error', 'Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Destination functions
  const loadDestinations = async () => {
    try {
      const { data, error } = await supabase
        .from('cms_destinations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDestinations(data || []);
    } catch (error: any) {
      showMessage('error', 'Erreur chargement destinations: ' + error.message);
    }
  };

  const createDestination = async () => {
    const newDest = {
      name: 'Nouvelle destination',
      slug: `destination-${Date.now()}`,
      country: '',
      description: '',
      best_season: '',
      duration: '5-7 jours',
      difficulty: 'Moderate',
      highlights: [],
      published: false
    };

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cms_destinations')
        .insert(newDest)
        .select()
        .single();

      if (error) throw error;
      setDestinations([data, ...destinations]);
      setEditingDestination(data);
      showMessage('success', 'Destination créée');
    } catch (error: any) {
      showMessage('error', 'Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateDestination = async (dest: Destination) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('cms_destinations')
        .update({
          name: dest.name,
          slug: dest.slug,
          country: dest.country,
          description: dest.description,
          featured_image: dest.featured_image,
          best_season: dest.best_season,
          duration: dest.duration,
          difficulty: dest.difficulty,
          highlights: dest.highlights,
          published: dest.published,
          updated_at: new Date().toISOString()
        })
        .eq('id', dest.id);

      if (error) throw error;

      setDestinations(destinations.map(d => d.id === dest.id ? dest : d));
      showMessage('success', 'Destination mise à jour');
    } catch (error: any) {
      showMessage('error', 'Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteDestination = async (id: string) => {
    if (!confirm('Supprimer cette destination ?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('cms_destinations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDestinations(destinations.filter(d => d.id !== id));
      setEditingDestination(null);
      showMessage('success', 'Destination supprimée');
    } catch (error: any) {
      showMessage('error', 'Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredBlogPosts = blogPosts.filter(post =>
    post.title.toLowerCase().includes(searchBlog.toLowerCase())
  );

  const filteredDestinations = destinations.filter(dest =>
    dest.name.toLowerCase().includes(searchDest.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CMS Heldonica</h1>
              <p className="text-sm text-gray-600">Powered by Supabase</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {blogPosts.length} articles • {destinations.length} destinations
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Message */}
      {message && (
        <div className={`max-w-7xl mx-auto px-4 py-3 mt-4 ${
          message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
        } rounded-lg`}>
          {message.text}
        </div>
      )}

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-4 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'blog', label: 'Blog', icon: '📝' },
              { id: 'destinations', label: 'Destinations', icon: '🗺️' },
              { id: 'media', label: 'Médias', icon: '🖼️' },
              { id: 'settings', label: 'Paramètres', icon: '⚙️' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-semibold border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-amber-900 text-amber-900'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Articles de blog</p>
                    <p className="text-3xl font-bold text-gray-900">{blogPosts.length}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {blogPosts.filter(p => p.published).length} publiés
                    </p>
                  </div>
                  <div className="text-4xl">📝</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Destinations</p>
                    <p className="text-3xl font-bold text-gray-900">{destinations.length}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {destinations.filter(d => d.published).length} publiées
                    </p>
                  </div>
                  <div className="text-4xl">🗺️</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Stockage</p>
                    <p className="text-3xl font-bold text-gray-900">Cloud</p>
                    <p className="text-xs text-gray-500 mt-1">Supabase</p>
                  </div>
                  <div className="text-4xl">☁️</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Articles récents</h3>
              <div className="space-y-3">
                {blogPosts.slice(0, 5).map(post => (
                  <div key={post.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium text-gray-900">{post.title}</p>
                      <p className="text-sm text-gray-500">{post.category} • {new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${post.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {post.published ? 'Publié' : 'Brouillon'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Blog */}
        {activeTab === 'blog' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Articles de blog ({blogPosts.length})</h2>
              <button
                onClick={createBlogPost}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
              >
                + Nouvel article
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* List */}
              <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchBlog}
                  onChange={(e) => setSearchBlog(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                />

                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredBlogPosts.map(post => (
                    <div
                      key={post.id}
                      onClick={() => setEditingPost(post)}
                      className={`p-3 rounded-lg cursor-pointer transition ${
                        editingPost?.id === post.id ? 'bg-amber-50 border-2 border-amber-900' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <h3 className="font-semibold text-gray-900 text-sm">{post.title}</h3>
                      <p className="text-xs text-gray-600 mt-1">{post.category}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${post.published ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                          {post.published ? 'Publié' : 'Brouillon'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editor */}
              <div className="lg:col-span-2">
                {editingPost ? (
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Éditer article</h3>
                      <button
                        onClick={() => deleteBlogPost(editingPost.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                      >
                        Supprimer
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Titre</label>
                        <input
                          type="text"
                          value={editingPost.title}
                          onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Slug</label>
                        <input
                          type="text"
                          value={editingPost.slug}
                          onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Extrait</label>
                        <textarea
                          value={editingPost.excerpt}
                          onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Contenu</label>
                        <textarea
                          value={editingPost.content}
                          onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                          rows={12}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Catégorie</label>
                          <select
                            value={editingPost.category}
                            onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          >
                            <option>Travel</option>
                            <option>Food & Lifestyle</option>
                            <option>Expertise Hôtelière</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Auteur</label>
                          <input
                            type="text"
                            value={editingPost.author || ''}
                            onChange={(e) => setEditingPost({ ...editingPost, author: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editingPost.published}
                            onChange={(e) => setEditingPost({ ...editingPost, published: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <span className="text-sm font-semibold text-gray-700">Publier</span>
                        </label>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => updateBlogPost(editingPost)}
                          disabled={loading}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
                        >
                          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                        </button>
                        <button
                          onClick={() => setEditingPost(null)}
                          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
                    Sélectionnez un article pour l'éditer
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Destinations */}
        {activeTab === 'destinations' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Destinations ({destinations.length})</h2>
              <button
                onClick={createDestination}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
              >
                + Nouvelle destination
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* List */}
              <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchDest}
                  onChange={(e) => setSearchDest(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                />

                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredDestinations.map(dest => (
                    <div
                      key={dest.id}
                      onClick={() => setEditingDestination(dest)}
                      className={`p-3 rounded-lg cursor-pointer transition ${
                        editingDestination?.id === dest.id ? 'bg-amber-50 border-2 border-amber-900' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <h3 className="font-semibold text-gray-900 text-sm">{dest.name}</h3>
                      <p className="text-xs text-gray-600 mt-1">{dest.country}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${dest.published ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                          {dest.published ? 'Publié' : 'Brouillon'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editor */}
              <div className="lg:col-span-2">
                {editingDestination ? (
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Éditer destination</h3>
                      <button
                        onClick={() => deleteDestination(editingDestination.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                      >
                        Supprimer
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nom</label>
                        <input
                          type="text"
                          value={editingDestination.name}
                          onChange={(e) => setEditingDestination({ ...editingDestination, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Slug</label>
                          <input
                            type="text"
                            value={editingDestination.slug}
                            onChange={(e) => setEditingDestination({ ...editingDestination, slug: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Pays</label>
                          <input
                            type="text"
                            value={editingDestination.country}
                            onChange={(e) => setEditingDestination({ ...editingDestination, country: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea
                          value={editingDestination.description}
                          onChange={(e) => setEditingDestination({ ...editingDestination, description: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Saison</label>
                          <input
                            type="text"
                            value={editingDestination.best_season}
                            onChange={(e) => setEditingDestination({ ...editingDestination, best_season: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Durée</label>
                          <input
                            type="text"
                            value={editingDestination.duration}
                            onChange={(e) => setEditingDestination({ ...editingDestination, duration: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulté</label>
                          <select
                            value={editingDestination.difficulty}
                            onChange={(e) => setEditingDestination({ ...editingDestination, difficulty: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          >
                            <option>Easy</option>
                            <option>Moderate</option>
                            <option>Challenging</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editingDestination.published}
                            onChange={(e) => setEditingDestination({ ...editingDestination, published: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <span className="text-sm font-semibold text-gray-700">Publier</span>
                        </label>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => updateDestination(editingDestination)}
                          disabled={loading}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
                        >
                          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                        </button>
                        <button
                          onClick={() => setEditingDestination(null)}
                          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
                    Sélectionnez une destination pour l'éditer
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Media */}
        {activeTab === 'media' && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Bibliothèque de médias</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">🖼️</div>
              <p className="text-gray-600 mb-2">Fonctionnalité en développement</p>
              <p className="text-sm text-gray-500">L'upload de médias sera bientôt disponible</p>
            </div>
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && settings && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Paramètres du site</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nom du site</label>
                <input
                  type="text"
                  value={settings.site_name}
                  onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tagline</label>
                <textarea
                  value={settings.tagline || ''}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Couleur primaire</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.primary_color}
                      onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.primary_color}
                      onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Couleur secondaire</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.secondary_color}
                      onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.secondary_color}
                      onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn URL</label>
                <input
                  type="url"
                  value={settings.linkedin_url || ''}
                  onChange={(e) => setSettings({ ...settings, linkedin_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://linkedin.com/company/..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Instagram URL</label>
                <input
                  type="url"
                  value={settings.instagram_url || ''}
                  onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://instagram.com/..."
                />
              </div>

              <button
                onClick={saveSettings}
                disabled={loading}
                className="px-6 py-2 bg-amber-900 text-white rounded-lg hover:bg-amber-800 font-semibold disabled:opacity-50"
              >
                {loading ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
