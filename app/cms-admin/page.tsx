'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function CMSAdmin() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('site');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const res = await fetch('/api/cms/content');
      const data = await res.json();
      setContent(data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setMessage('❌ Erreur lors du chargement du contenu');
      setLoading(false);
    }
  };

  const saveContent = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/cms/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      if (res.ok) {
        setMessage('✅ Contenu sauvegardé avec succès !');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Erreur lors de la sauvegarde');
      }
    } catch (error) {
      setMessage('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: any, field: string) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/cms/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        setContent((prev: any) => ({
          ...prev,
          site: {
            ...prev.site,
            [field]: data.url,
          },
        }));
        setMessage('✅ Fichier uploadé avec succès !');
      }
    } catch (error) {
      setMessage('❌ Erreur lors de l\'upload');
    }
  };

  const handleHeroFileUpload = async (e: any, field: string) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/cms/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        setContent((prev: any) => ({
          ...prev,
          hero: {
            ...prev.hero,
            [field]: data.url,
          },
        }));
        setMessage('✅ Fichier uploadé avec succès !');
      }
    } catch (error) {
      setMessage('❌ Erreur lors de l\'upload');
    }
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;
  if (!content) return <div className="p-8 text-center">Erreur de chargement</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-mahogany text-white p-6 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">🎨 CMS Heldonica</h1>
          <Button
            onClick={saveContent}
            disabled={saving}
            className="bg-white text-mahogany hover:bg-gray-100"
          >
            {saving ? '⏳ Sauvegarde...' : '💾 Sauvegarder'}
          </Button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="max-w-6xl mx-auto mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-6xl mx-auto mt-6">
        <div className="flex gap-2 border-b border-gray-300 mb-6 flex-wrap">
          {[
            { id: 'site', label: '⚙️ Paramètres' },
            { id: 'hero', label: '🎬 Hero' },
            { id: 'pages', label: '📄 Pages' },
            { id: 'sections', label: '📦 Sections' },
            { id: 'blog', label: '📝 Blog' },
            { id: 'destinations', label: '🗺️ Destinations' },
            { id: 'travel', label: '✈️ Travel Planning' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-semibold border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-mahogany text-mahogany'
                  : 'border-transparent text-gray-600 hover:text-mahogany'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Site Settings */}
        {activeTab === 'site' && (
          <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
            <h2 className="text-2xl font-bold text-mahogany">⚙️ Paramètres du Site</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-2">Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'logo')}
                  className="w-full"
                />
                {content.site.logo && (
                  <img src={content.site.logo} alt="Logo" className="mt-2 h-20" />
                )}
              </div>

              <div>
                <label className="block font-semibold mb-2">Titre</label>
                <Input
                  value={content.site.title}
                  onChange={(e) => setContent({
                    ...content,
                    site: { ...content.site, title: e.target.value }
                  })}
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Tagline</label>
                <Input
                  value={content.site.tagline}
                  onChange={(e) => setContent({
                    ...content,
                    site: { ...content.site, tagline: e.target.value }
                  })}
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Email</label>
                <Input
                  type="email"
                  value={content.site.contactEmail}
                  onChange={(e) => setContent({
                    ...content,
                    site: { ...content.site, contactEmail: e.target.value }
                  })}
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Couleur Primaire</label>
                <input
                  type="color"
                  value={content.site.primaryColor}
                  onChange={(e) => setContent({
                    ...content,
                    site: { ...content.site, primaryColor: e.target.value }
                  })}
                  className="w-20 h-10"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Couleur Secondaire</label>
                <input
                  type="color"
                  value={content.site.secondaryColor}
                  onChange={(e) => setContent({
                    ...content,
                    site: { ...content.site, secondaryColor: e.target.value }
                  })}
                  className="w-20 h-10"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-2">Description</label>
              <Textarea
                value={content.site.description}
                onChange={(e) => setContent({
                  ...content,
                  site: { ...content.site, description: e.target.value }
                })}
              />
            </div>
          </div>
        )}

        {/* Hero Section */}
        {activeTab === 'hero' && (
          <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
            <h2 className="text-2xl font-bold text-mahogany">🎬 Hero Section</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-2">Titre</label>
                <Input
                  value={content.hero.title}
                  onChange={(e) => setContent({
                    ...content,
                    hero: { ...content.hero, title: e.target.value }
                  })}
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Texte CTA</label>
                <Input
                  value={content.hero.ctaText}
                  onChange={(e) => setContent({
                    ...content,
                    hero: { ...content.hero, ctaText: e.target.value }
                  })}
                />
              </div>

              <div className="col-span-2">
                <label className="block font-semibold mb-2">Sous-titre</label>
                <Textarea
                  value={content.hero.subtitle}
                  onChange={(e) => setContent({
                    ...content,
                    hero: { ...content.hero, subtitle: e.target.value }
                  })}
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Type Média</label>
                <select
                  value={content.hero.mediaType}
                  onChange={(e) => setContent({
                    ...content,
                    hero: { ...content.hero, mediaType: e.target.value }
                  })}
                  className="w-full p-2 border rounded"
                >
                  <option value="video">Vidéo</option>
                  <option value="image">Image</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-2">Upload Vidéo</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleHeroFileUpload(e, 'videoUrl')}
                  className="w-full"
                />
              </div>
            </div>

            {content.hero.mediaType === 'video' && content.hero.videoUrl && (
              <video src={content.hero.videoUrl} controls className="w-full h-64 object-cover rounded" />
            )}
          </div>
        )}

        {/* Travel Planning Requests */}
        {activeTab === 'travel' && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-mahogany mb-6">✈️ Demandes Travel Planning</h2>
            
            {content.travelRequests && content.travelRequests.length > 0 ? (
              <div className="space-y-4">
                {content.travelRequests.map((request: any, idx: number) => (
                  <div key={idx} className="border p-4 rounded-lg bg-gray-50">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <strong>Email:</strong> {request.email}
                      </div>
                      <div>
                        <strong>Téléphone:</strong> {request.phone}
                      </div>
                      <div>
                        <strong>Type:</strong> {request.tripType}
                      </div>
                      <div>
                        <strong>Vibe:</strong> {request.vibe}
                      </div>
                      <div>
                        <strong>Durée:</strong> {request.duration} jours
                      </div>
                      <div>
                        <strong>Budget:</strong> {request.budget}
                      </div>
                      <div className="col-span-2">
                        <strong>Souvenir:</strong> {request.travelMemory}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Aucune demande pour le moment</p>
            )}
          </div>
        )}

        {/* Pages */}
        {activeTab === 'pages' && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-mahogany mb-6">📄 Pages</h2>
            {content.pages && content.pages.length > 0 ? (
              <div className="space-y-4">
                {content.pages.map((page: any, idx: number) => (
                  <div key={idx} className="border p-4 rounded-lg">
                    <h3 className="font-bold">{page.title}</h3>
                    <p className="text-sm text-gray-600">/{page.slug}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Aucune page</p>
            )}
          </div>
        )}

        {/* Blog */}
        {activeTab === 'blog' && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-mahogany mb-6">📝 Blog</h2>
            {content.blog && content.blog.length > 0 ? (
              <div className="space-y-4">
                {content.blog.map((post: any, idx: number) => (
                  <div key={idx} className="border p-4 rounded-lg">
                    <h3 className="font-bold">{post.title}</h3>
                    <p className="text-sm text-gray-600">{post.category}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Aucun article</p>
            )}
          </div>
        )}

        {/* Destinations */}
        {activeTab === 'destinations' && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-mahogany mb-6">🗺️ Destinations</h2>
            {content.destinations && content.destinations.length > 0 ? (
              <div className="space-y-4">
                {content.destinations.map((dest: any, idx: number) => (
                  <div key={idx} className="border p-4 rounded-lg">
                    <h3 className="font-bold">{dest.name}</h3>
                    <p className="text-sm text-gray-600">{dest.country}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Aucune destination</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
