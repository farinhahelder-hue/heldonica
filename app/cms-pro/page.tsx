'use client';

import { useState, useEffect } from 'react';
import React from 'react';

export default function CMSPro() {
  const [activeTab, setActiveTab] = useState('global');
  const [siteData, setSiteData] = useState<any>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const stored = localStorage.getItem('heldonicaCMS');
    if (stored) {
      const data = JSON.parse(stored);
      setSiteData(data.site || {});
      setPages(data.pages || []);
      setBlogPosts(data.blog || []);
      setDestinations(data.destinations || []);
      setMedia(data.media || []);
    } else {
      initializeData();
    }
  };

  const initializeData = () => {
    const initialData = {
      site: {
        title: 'Heldonica',
        tagline: 'Expert en slow travel et consulting hôtelier',
        logo: '',
        favicon: '',
        primaryColor: '#92400e',
        secondaryColor: '#15803d',
        contactEmail: 'hello@heldonica.fr',
        contactPhone: '+33 (0)6 XX XX XX XX',
        socialLinks: { linkedin: '', instagram: '', facebook: '' },
      },
      hero: {
        title: 'Découvrez le slow travel',
        subtitle: 'Des voyages authentiques, conçus pour vous',
        videoUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663470606636/jAd3LynLbumRRtRSgGxysF/Heldonica_11053b9d.mp4',
        ctaText: 'Planifier mon voyage',
        ctaLink: '/travel-planning-form',
      },
      pages: [],
      blog: [],
      destinations: [],
      media: [],
    };
    setSiteData(initialData.site);
    saveData(initialData);
  };

  const saveData = (data: any) => {
    localStorage.setItem('heldonicaCMS', JSON.stringify(data));
    setMessage('✅ Données sauvegardées !');
    setTimeout(() => setMessage(''), 3000);
  };

  const updateSiteData = (key: string, value: any) => {
    const updated = { ...siteData, [key]: value };
    setSiteData(updated);
    const fullData = {
      site: updated,
      pages,
      blog: blogPosts,
      destinations,
      media,
    };
    saveData(fullData);
  };

  const addPage = () => {
    const newPage = {
      id: Date.now(),
      title: 'Nouvelle Page',
      slug: 'nouvelle-page',
      content: '',
      image: '',
      metaTitle: '',
      metaDescription: '',
    };
    const updated = [...pages, newPage];
    setPages(updated);
    const fullData = { site: siteData, pages: updated, blog: blogPosts, destinations, media };
    saveData(fullData);
  };

  const addBlogPost = () => {
    const newPost = {
      id: Date.now(),
      title: 'Nouvel Article',
      slug: 'nouvel-article',
      content: '',
      category: 'Travel',
      tags: [],
      image: '',
      metaTitle: '',
      metaDescription: '',
      date: new Date().toISOString(),
    };
    const updated = [...blogPosts, newPost];
    setBlogPosts(updated);
    const fullData = { site: siteData, pages, blog: updated, destinations, media };
    saveData(fullData);
  };

  const addDestination = () => {
    const newDest = {
      id: Date.now(),
      name: 'Nouvelle Destination',
      country: '',
      description: '',
      season: '',
      duration: '',
      budget: '',
      highlights: [],
      image: '',
      metaTitle: '',
      metaDescription: '',
    };
    const updated = [...destinations, newDest];
    setDestinations(updated);
    const fullData = { site: siteData, pages, blog: blogPosts, destinations: updated, media };
    saveData(fullData);
  };

  const exportSite = () => {
    const data = { site: siteData, pages, blog: blogPosts, destinations, media };
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'heldonica-cms-backup.json';
    link.click();
    setMessage('✅ Backup exporté !');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-amber-900">🎨 Heldonica CMS Pro</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setPreview(!preview)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {preview ? '✏️ Éditer' : '👁️ Aperçu'}
            </button>
            <button
              onClick={exportSite}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              💾 Exporter
            </button>
          </div>
        </div>
      </header>

      {/* Message */}
      {message && (
        <div className="max-w-7xl mx-auto px-6 py-3 mt-4 bg-green-100 text-green-800 rounded">
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-4 border-b border-gray-200 mb-6">
          {['global', 'pages', 'blog', 'destinations', 'media'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium transition ${
                activeTab === tab
                  ? 'text-amber-900 border-b-2 border-amber-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'global' && '⚙️ Global'}
              {tab === 'pages' && '📄 Pages'}
              {tab === 'blog' && '📝 Blog'}
              {tab === 'destinations' && '🗺️ Destinations'}
              {tab === 'media' && '🖼️ Médias'}
            </button>
          ))}
        </div>

        {/* Global Settings */}
        {activeTab === 'global' && siteData && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-2xl font-bold mb-4">Paramètres Globaux</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Titre du site</label>
                  <input
                    type="text"
                    value={siteData.title}
                    onChange={(e) => updateSiteData('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tagline</label>
                  <input
                    type="text"
                    value={siteData.tagline}
                    onChange={(e) => updateSiteData('tagline', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={siteData.contactEmail}
                    onChange={(e) => updateSiteData('contactEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={siteData.contactPhone}
                    onChange={(e) => updateSiteData('contactPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Couleur Primaire</label>
                  <input
                    type="color"
                    value={siteData.primaryColor}
                    onChange={(e) => updateSiteData('primaryColor', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded h-10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Couleur Secondaire</label>
                  <input
                    type="color"
                    value={siteData.secondaryColor}
                    onChange={(e) => updateSiteData('secondaryColor', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded h-10"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-xl font-bold mb-4">Hero Section</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Titre Hero</label>
                  <input
                    type="text"
                    placeholder="Découvrez le slow travel"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sous-titre</label>
                  <input
                    type="text"
                    placeholder="Des voyages authentiques, conçus pour vous"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">URL Vidéo</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pages */}
        {activeTab === 'pages' && (
          <div className="space-y-4">
            <button
              onClick={addPage}
              className="px-4 py-2 bg-amber-900 text-white rounded hover:bg-amber-800"
            >
              + Ajouter une page
            </button>
            {pages.map((page) => (
              <div key={page.id} className="bg-white p-4 rounded shadow">
                <h3 className="font-bold text-lg">{page.title}</h3>
                <p className="text-gray-600 text-sm">/{page.slug}</p>
              </div>
            ))}
          </div>
        )}

        {/* Blog */}
        {activeTab === 'blog' && (
          <div className="space-y-4">
            <button
              onClick={addBlogPost}
              className="px-4 py-2 bg-amber-900 text-white rounded hover:bg-amber-800"
            >
              + Ajouter un article
            </button>
            {blogPosts.map((post) => (
              <div key={post.id} className="bg-white p-4 rounded shadow">
                <h3 className="font-bold text-lg">{post.title}</h3>
                <p className="text-gray-600 text-sm">{post.category}</p>
              </div>
            ))}
          </div>
        )}

        {/* Destinations */}
        {activeTab === 'destinations' && (
          <div className="space-y-4">
            <button
              onClick={addDestination}
              className="px-4 py-2 bg-amber-900 text-white rounded hover:bg-amber-800"
            >
              + Ajouter une destination
            </button>
            {destinations.map((dest) => (
              <div key={dest.id} className="bg-white p-4 rounded shadow">
                <h3 className="font-bold text-lg">{dest.name}</h3>
                <p className="text-gray-600 text-sm">{dest.country}</p>
              </div>
            ))}
          </div>
        )}

        {/* Media */}
        {activeTab === 'media' && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Gestionnaire de Médias</h2>
            <div className="border-2 border-dashed border-gray-300 rounded p-8 text-center">
              <p className="text-gray-600">Drag & drop vos images/vidéos ici</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
