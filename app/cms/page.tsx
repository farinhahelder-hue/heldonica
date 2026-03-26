'use client';

import { useState, useEffect } from 'react';
import { blogPosts as initialBlogPosts, destinationPages as initialDestinations } from '@/lib/wordpress-data';

export default function CMSPage() {
  const [activeTab, setActiveTab] = useState('settings');
  const [blogPosts, setBlogPosts] = useState(initialBlogPosts);
  const [destinations, setDestinations] = useState(initialDestinations);
  const [editingPost, setEditingPost] = useState(null);
  const [editingDestination, setEditingDestination] = useState(null);
  const [message, setMessage] = useState('');
  const [searchBlog, setSearchBlog] = useState('');
  const [searchDest, setSearchDest] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Settings
  const [siteSettings, setSiteSettings] = useState({
    logo: '',
    siteName: 'Heldonica',
    tagline: 'Explorateurs émerveillés, dénicheurs de pépites',
    primaryColor: '#78350f',
    secondaryColor: '#166534',
    linkedinUrl: 'https://linkedin.com/company/heldonica',
    instagramUrl: 'https://instagram.com/heldonica',
    instagramHandle: '@heldonica'
  });

  useEffect(() => {
    const saved = localStorage.getItem('heldonicaCMS');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.blogPosts) setBlogPosts(data.blogPosts);
        if (data.destinations) setDestinations(data.destinations);
        if (data.settings) setSiteSettings(data.settings);
      } catch (e) {
        console.error('Erreur lors du chargement:', e);
      }
    }
  }, []);

  const saveToLocalStorage = () => {
    localStorage.setItem('heldonicaCMS', JSON.stringify({ 
      blogPosts, 
      destinations,
      settings: siteSettings 
    }));
    setMessage('✅ Sauvegardé localement');
    setTimeout(() => setMessage(''), 3000);
  };

  const exportData = () => {
    const data = { blogPosts, destinations, settings: siteSettings };
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
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            if (data.blogPosts) setBlogPosts(data.blogPosts);
            if (data.destinations) setDestinations(data.destinations);
            if (data.settings) setSiteSettings(data.settings);
            setMessage('✅ Importé avec succès');
            setTimeout(() => setMessage(''), 3000);
          } catch (err) {
            setMessage('❌ Erreur lors de l\'import');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSiteSettings({ ...siteSettings, logo: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileImport = (type) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'pdf' ? '.pdf' : '.html';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setMessage(`✅ Fichier ${type.toUpperCase()} importé: ${file.name}`);
          // Vous pouvez traiter le contenu du fichier ici
          setTimeout(() => setMessage(''), 3000);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const addBlogPost = () => {
    const newPost = {
      id: Date.now(),
      title: 'Nouvel article',
      content: 'Contenu de l\'article...',
      category: 'Travel',
      image: '',
      date: new Date().toISOString().split('T')[0]
    };
    setBlogPosts([...blogPosts, newPost]);
  };

  const addDestination = () => {
    const newDest = {
      id: Date.now(),
      name: 'Nouvelle destination',
      country: 'Pays',
      description: 'Description...',
      image: '',
      bestSeason: 'À définir',
      duration: '5-7 jours'
    };
    setDestinations([...destinations, newDest]);
  };

  const deleteBlogPost = (id) => {
    setBlogPosts(blogPosts.filter(p => p.id !== id));
    setMessage('✅ Article supprimé');
  };

  const deleteDestination = (id) => {
    setDestinations(destinations.filter(d => d.id !== id));
    setMessage('✅ Destination supprimée');
  };

  const updateBlogPost = (id, updates) => {
    setBlogPosts(blogPosts.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const updateDestination = (id, updates) => {
    setDestinations(destinations.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">🎨 CMS Heldonica</h1>
          <p className="text-gray-600 mt-1">Gérez votre contenu, visuels et paramètres</p>
        </div>
      </header>

      {/* Message */}
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 m-4 rounded">
          {message}
        </div>
      )}

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-4 overflow-x-auto">
            {[
              { id: 'settings', label: '⚙️ Paramètres' },
              { id: 'blog', label: '📝 Blog' },
              { id: 'destinations', label: '🗺️ Destinations' },
              { id: 'files', label: '📁 Fichiers' },
              { id: 'backup', label: '💾 Backup' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-semibold border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-amber-900 text-amber-900'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* PARAMÈTRES */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Paramètres du site</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Logo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Logo</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {siteSettings.logo ? (
                    <img src={siteSettings.logo} alt="Logo" className="h-20 mx-auto mb-2" />
                  ) : (
                    <div className="text-gray-400 mb-2">📸 Logo</div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="cursor-pointer text-blue-600 hover:text-blue-800">
                    Cliquez pour uploader
                  </label>
                </div>
              </div>

              {/* Nom du site */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nom du site</label>
                <input
                  type="text"
                  value={siteSettings.siteName}
                  onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-900 focus:border-transparent"
                />
              </div>

              {/* Tagline */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tagline</label>
                <textarea
                  value={siteSettings.tagline}
                  onChange={(e) => setSiteSettings({ ...siteSettings, tagline: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-900 focus:border-transparent"
                />
              </div>

              {/* Couleurs */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Couleur primaire</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={siteSettings.primaryColor}
                    onChange={(e) => setSiteSettings({ ...siteSettings, primaryColor: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={siteSettings.primaryColor}
                    onChange={(e) => setSiteSettings({ ...siteSettings, primaryColor: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Couleur secondaire</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={siteSettings.secondaryColor}
                    onChange={(e) => setSiteSettings({ ...siteSettings, secondaryColor: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={siteSettings.secondaryColor}
                    onChange={(e) => setSiteSettings({ ...siteSettings, secondaryColor: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Réseaux sociaux */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn URL</label>
                <input
                  type="url"
                  value={siteSettings.linkedinUrl}
                  onChange={(e) => setSiteSettings({ ...siteSettings, linkedinUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-900 focus:border-transparent"
                  placeholder="https://linkedin.com/company/..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Instagram URL</label>
                <input
                  type="url"
                  value={siteSettings.instagramUrl}
                  onChange={(e) => setSiteSettings({ ...siteSettings, instagramUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-900 focus:border-transparent"
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Instagram Handle</label>
                <input
                  type="text"
                  value={siteSettings.instagramHandle}
                  onChange={(e) => setSiteSettings({ ...siteSettings, instagramHandle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-900 focus:border-transparent"
                  placeholder="@heldonica"
                />
              </div>
            </div>

            <button
              onClick={saveToLocalStorage}
              className="mt-6 px-6 py-2 bg-amber-900 text-white rounded-lg hover:bg-amber-800 font-semibold"
            >
              💾 Sauvegarder les paramètres
            </button>
          </div>
        )}

        {/* BLOG */}
        {activeTab === 'blog' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Articles de blog ({blogPosts.length})</h2>
                <button
                  onClick={addBlogPost}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                >
                  + Nouvel article
                </button>
              </div>

              <input
                type="text"
                placeholder="Rechercher..."
                value={searchBlog}
                onChange={(e) => setSearchBlog(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              />

              <div className="space-y-3">
                {blogPosts
                  .filter(post => post.title.toLowerCase().includes(searchBlog.toLowerCase()))
                  .map(post => (
                    <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{post.title}</h3>
                          <p className="text-sm text-gray-600">{post.category} • {post.date}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingPost(post)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                          >
                            ✏️ Éditer
                          </button>
                          <button
                            onClick={() => deleteBlogPost(post.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                          >
                            🗑️ Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {editingPost && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900">Éditer article</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editingPost.title}
                    onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                    placeholder="Titre"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <textarea
                    value={editingPost.content}
                    onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                    placeholder="Contenu"
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <select
                    value={editingPost.category}
                    onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option>Travel</option>
                    <option>Food & Lifestyle</option>
                    <option>Expertise</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        updateBlogPost(editingPost.id, editingPost);
                        setEditingPost(null);
                        setMessage('✅ Article mis à jour');
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      ✅ Sauvegarder
                    </button>
                    <button
                      onClick={() => setEditingPost(null)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                      ❌ Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DESTINATIONS */}
        {activeTab === 'destinations' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Destinations ({destinations.length})</h2>
                <button
                  onClick={addDestination}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                >
                  + Nouvelle destination
                </button>
              </div>

              <input
                type="text"
                placeholder="Rechercher..."
                value={searchDest}
                onChange={(e) => setSearchDest(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              />

              <div className="space-y-3">
                {destinations
                  .filter(dest => dest.name.toLowerCase().includes(searchDest.toLowerCase()))
                  .map(dest => (
                    <div key={dest.id} className="border border-gray-200 rounded-lg p-4 hover:shadow transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{dest.name}</h3>
                          <p className="text-sm text-gray-600">{dest.country} • {dest.duration}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingDestination(dest)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                          >
                            ✏️ Éditer
                          </button>
                          <button
                            onClick={() => deleteDestination(dest.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                          >
                            🗑️ Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {editingDestination && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900">Éditer destination</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editingDestination.name}
                    onChange={(e) => setEditingDestination({ ...editingDestination, name: e.target.value })}
                    placeholder="Nom"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={editingDestination.country}
                    onChange={(e) => setEditingDestination({ ...editingDestination, country: e.target.value })}
                    placeholder="Pays"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <textarea
                    value={editingDestination.description}
                    onChange={(e) => setEditingDestination({ ...editingDestination, description: e.target.value })}
                    placeholder="Description"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={editingDestination.bestSeason}
                    onChange={(e) => setEditingDestination({ ...editingDestination, bestSeason: e.target.value })}
                    placeholder="Meilleure saison"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={editingDestination.duration}
                    onChange={(e) => setEditingDestination({ ...editingDestination, duration: e.target.value })}
                    placeholder="Durée"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        updateDestination(editingDestination.id, editingDestination);
                        setEditingDestination(null);
                        setMessage('✅ Destination mise à jour');
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      ✅ Sauvegarder
                    </button>
                    <button
                      onClick={() => setEditingDestination(null)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                      ❌ Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FICHIERS */}
        {activeTab === 'files' && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Importer des fichiers</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition cursor-pointer"
                   onClick={() => handleFileImport('pdf')}>
                <div className="text-4xl mb-2">📄</div>
                <h3 className="font-semibold text-gray-900 mb-1">Importer PDF</h3>
                <p className="text-sm text-gray-600">Cliquez pour importer un fichier PDF</p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition cursor-pointer"
                   onClick={() => handleFileImport('html')}>
                <div className="text-4xl mb-2">🌐</div>
                <h3 className="font-semibold text-gray-900 mb-1">Importer HTML</h3>
                <p className="text-sm text-gray-600">Cliquez pour importer un fichier HTML</p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Astuce :</strong> Vous pouvez importer des fichiers PDF ou HTML pour enrichir votre contenu.
              </p>
            </div>
          </div>
        )}

        {/* BACKUP */}
        {activeTab === 'backup' && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Sauvegarde et restauration</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">📥 Exporter les données</h3>
                <p className="text-sm text-gray-600 mb-4">Téléchargez une sauvegarde JSON de tout votre contenu</p>
                <button
                  onClick={() => { exportData(); saveToLocalStorage(); }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  📥 Exporter JSON
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">📤 Importer les données</h3>
                <p className="text-sm text-gray-600 mb-4">Restaurez une sauvegarde JSON précédente</p>
                <button
                  onClick={importData}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                >
                  📤 Importer JSON
                </button>
              </div>
            </div>

            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Important :</strong> Vos données sont sauvegardées localement dans votre navigateur. Exportez régulièrement pour éviter la perte de données.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
