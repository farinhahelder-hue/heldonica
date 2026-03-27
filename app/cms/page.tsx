'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface SiteSettings {
  title: string;
  description: string;
  keywords: string;
  favicon: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  customCSS: string;
  customHTML: string;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  published: boolean;
}

interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  image: string;
  metaTitle: string;
  metaDescription: string;
  published: boolean;
}

interface Destination {
  id: string;
  name: string;
  slug: string;
  description: string;
  region: string;
  image: string;
  bestSeason: string;
  duration: string;
  budget: string;
  highlights: string;
  metaTitle: string;
  metaDescription: string;
  published: boolean;
}

export default function CMSPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    title: 'Heldonica',
    description: 'Travel Blog & Planner',
    keywords: 'travel, slow travel, destinations',
    favicon: '',
    logo: '',
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    customCSS: '',
    customHTML: '',
  });

  const [pages, setPages] = useState<Page[]>([]);
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [activeTab, setActiveTab] = useState('settings');
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [editingArticle, setEditingArticle] = useState<BlogArticle | null>(null);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);

  // Load data from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('heldonica_settings');
    const savedPages = localStorage.getItem('heldonica_pages');
    const savedArticles = localStorage.getItem('heldonica_articles');
    const savedDestinations = localStorage.getItem('heldonica_destinations');

    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedPages) setPages(JSON.parse(savedPages));
    if (savedArticles) setArticles(JSON.parse(savedArticles));
    if (savedDestinations) setDestinations(JSON.parse(savedDestinations));
  }, []);

  // Save settings
  const saveSettings = () => {
    localStorage.setItem('heldonica_settings', JSON.stringify(settings));
    alert('✅ Paramètres sauvegardés !');
  };

  // Pages management
  const addPage = () => {
    const newPage: Page = {
      id: Date.now().toString(),
      title: 'Nouvelle page',
      slug: 'nouvelle-page',
      content: '',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      published: false,
    };
    setPages([...pages, newPage]);
  };

  const updatePage = (page: Page) => {
    setPages(pages.map(p => p.id === page.id ? page : p));
    localStorage.setItem('heldonica_pages', JSON.stringify(pages));
  };

  const deletePage = (id: string) => {
    setPages(pages.filter(p => p.id !== id));
  };

  // Blog management
  const addArticle = () => {
    const newArticle: BlogArticle = {
      id: Date.now().toString(),
      title: 'Nouvel article',
      slug: 'nouvel-article',
      content: '',
      category: 'Travel',
      image: '',
      metaTitle: '',
      metaDescription: '',
      published: false,
    };
    setArticles([...articles, newArticle]);
  };

  const updateArticle = (article: BlogArticle) => {
    setArticles(articles.map(a => a.id === article.id ? article : a));
    localStorage.setItem('heldonica_articles', JSON.stringify(articles));
  };

  const deleteArticle = (id: string) => {
    setArticles(articles.filter(a => a.id !== id));
  };

  // Destinations management
  const addDestination = () => {
    const newDestination: Destination = {
      id: Date.now().toString(),
      name: 'Nouvelle destination',
      slug: 'nouvelle-destination',
      description: '',
      region: '',
      image: '',
      bestSeason: '',
      duration: '',
      budget: '',
      highlights: '',
      metaTitle: '',
      metaDescription: '',
      published: false,
    };
    setDestinations([...destinations, newDestination]);
  };

  const updateDestination = (destination: Destination) => {
    setDestinations(destinations.map(d => d.id === destination.id ? destination : d));
    localStorage.setItem('heldonica_destinations', JSON.stringify(destinations));
  };

  const deleteDestination = (id: string) => {
    setDestinations(destinations.filter(d => d.id !== id));
  };

  // Export data
  const exportData = () => {
    const data = {
      settings,
      pages,
      articles,
      destinations,
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'heldonica-backup.json';
    a.click();
  };

  // Import data
  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        setSettings(data.settings);
        setPages(data.pages);
        setArticles(data.articles);
        setDestinations(data.destinations);
        localStorage.setItem('heldonica_settings', JSON.stringify(data.settings));
        localStorage.setItem('heldonica_pages', JSON.stringify(data.pages));
        localStorage.setItem('heldonica_articles', JSON.stringify(data.articles));
        localStorage.setItem('heldonica_destinations', JSON.stringify(data.destinations));
        alert('✅ Données importées avec succès !');
      } catch (error) {
        alert('❌ Erreur lors de l\'import');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">🎨 CMS Heldonica Pro</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="settings">⚙️ Paramètres</TabsTrigger>
            <TabsTrigger value="pages">📄 Pages</TabsTrigger>
            <TabsTrigger value="blog">📝 Blog</TabsTrigger>
            <TabsTrigger value="destinations">🗺️ Destinations</TabsTrigger>
            <TabsTrigger value="backup">💾 Backup</TabsTrigger>
          </TabsList>

          {/* SETTINGS TAB */}
          <TabsContent value="settings" className="space-y-6">
            <div className="bg-slate-700 p-6 rounded-lg space-y-4">
              <h2 className="text-2xl font-bold text-white">Paramètres Globaux</h2>
              
              <div>
                <label className="block text-white mb-2">Titre du site</label>
                <Input
                  value={settings.title}
                  onChange={(e) => setSettings({...settings, title: e.target.value})}
                  className="bg-slate-600 text-white"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Description</label>
                <Textarea
                  value={settings.description}
                  onChange={(e) => setSettings({...settings, description: e.target.value})}
                  className="bg-slate-600 text-white"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Mots-clés SEO</label>
                <Input
                  value={settings.keywords}
                  onChange={(e) => setSettings({...settings, keywords: e.target.value})}
                  placeholder="keyword1, keyword2, keyword3"
                  className="bg-slate-600 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2">Couleur primaire</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                      className="w-12 h-12 rounded"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                      className="bg-slate-600 text-white flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white mb-2">Couleur secondaire</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => setSettings({...settings, secondaryColor: e.target.value})}
                      className="w-12 h-12 rounded"
                    />
                    <Input
                      value={settings.secondaryColor}
                      onChange={(e) => setSettings({...settings, secondaryColor: e.target.value})}
                      className="bg-slate-600 text-white flex-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-white mb-2">Logo (URL)</label>
                <Input
                  value={settings.logo}
                  onChange={(e) => setSettings({...settings, logo: e.target.value})}
                  placeholder="https://..."
                  className="bg-slate-600 text-white"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Favicon (URL)</label>
                <Input
                  value={settings.favicon}
                  onChange={(e) => setSettings({...settings, favicon: e.target.value})}
                  placeholder="https://..."
                  className="bg-slate-600 text-white"
                />
              </div>

              <div>
                <label className="block text-white mb-2">CSS personnalisé</label>
                <Textarea
                  value={settings.customCSS}
                  onChange={(e) => setSettings({...settings, customCSS: e.target.value})}
                  placeholder="/* Votre CSS ici */"
                  className="bg-slate-600 text-white font-mono text-sm"
                  rows={6}
                />
              </div>

              <div>
                <label className="block text-white mb-2">HTML personnalisé</label>
                <Textarea
                  value={settings.customHTML}
                  onChange={(e) => setSettings({...settings, customHTML: e.target.value})}
                  placeholder="<!-- Votre HTML ici -->"
                  className="bg-slate-600 text-white font-mono text-sm"
                  rows={6}
                />
              </div>

              <Button onClick={saveSettings} className="w-full bg-green-600 hover:bg-green-700">
                💾 Sauvegarder les paramètres
              </Button>
            </div>
          </TabsContent>

          {/* PAGES TAB */}
          <TabsContent value="pages" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Gestion des Pages</h2>
              <Button onClick={addPage} className="bg-blue-600 hover:bg-blue-700">
                ➕ Ajouter une page
              </Button>
            </div>

            <div className="space-y-4">
              {pages.map((page) => (
                <div key={page.id} className="bg-slate-700 p-4 rounded-lg">
                  {editingPage?.id === page.id ? (
                    <div className="space-y-3">
                      <Input
                        value={editingPage.title}
                        onChange={(e) => setEditingPage({...editingPage, title: e.target.value})}
                        placeholder="Titre"
                        className="bg-slate-600 text-white"
                      />
                      <Input
                        value={editingPage.slug}
                        onChange={(e) => setEditingPage({...editingPage, slug: e.target.value})}
                        placeholder="Slug"
                        className="bg-slate-600 text-white"
                      />
                      <Textarea
                        value={editingPage.content}
                        onChange={(e) => setEditingPage({...editingPage, content: e.target.value})}
                        placeholder="Contenu"
                        className="bg-slate-600 text-white"
                        rows={4}
                      />
                      <Input
                        value={editingPage.metaTitle}
                        onChange={(e) => setEditingPage({...editingPage, metaTitle: e.target.value})}
                        placeholder="Meta Title (SEO)"
                        className="bg-slate-600 text-white"
                      />
                      <Textarea
                        value={editingPage.metaDescription}
                        onChange={(e) => setEditingPage({...editingPage, metaDescription: e.target.value})}
                        placeholder="Meta Description (SEO)"
                        className="bg-slate-600 text-white"
                        rows={2}
                      />
                      <Input
                        value={editingPage.metaKeywords}
                        onChange={(e) => setEditingPage({...editingPage, metaKeywords: e.target.value})}
                        placeholder="Mots-clés SEO"
                        className="bg-slate-600 text-white"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            updatePage(editingPage);
                            setEditingPage(null);
                          }}
                          className="bg-green-600 hover:bg-green-700 flex-1"
                        >
                          ✅ Sauvegarder
                        </Button>
                        <Button
                          onClick={() => setEditingPage(null)}
                          className="bg-gray-600 hover:bg-gray-700 flex-1"
                        >
                          ❌ Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-white">{page.title}</h3>
                        <p className="text-gray-300 text-sm">/{page.slug}</p>
                        <p className="text-gray-400 text-sm mt-1">{page.content.substring(0, 100)}...</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setEditingPage(page)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          ✏️ Éditer
                        </Button>
                        <Button
                          onClick={() => deletePage(page.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          🗑️ Supprimer
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* BLOG TAB */}
          <TabsContent value="blog" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Gestion du Blog</h2>
              <Button onClick={addArticle} className="bg-blue-600 hover:bg-blue-700">
                ➕ Ajouter un article
              </Button>
            </div>

            <div className="space-y-4">
              {articles.map((article) => (
                <div key={article.id} className="bg-slate-700 p-4 rounded-lg">
                  {editingArticle?.id === article.id ? (
                    <div className="space-y-3">
                      <Input
                        value={editingArticle.title}
                        onChange={(e) => setEditingArticle({...editingArticle, title: e.target.value})}
                        placeholder="Titre"
                        className="bg-slate-600 text-white"
                      />
                      <Input
                        value={editingArticle.slug}
                        onChange={(e) => setEditingArticle({...editingArticle, slug: e.target.value})}
                        placeholder="Slug"
                        className="bg-slate-600 text-white"
                      />
                      <Input
                        value={editingArticle.category}
                        onChange={(e) => setEditingArticle({...editingArticle, category: e.target.value})}
                        placeholder="Catégorie"
                        className="bg-slate-600 text-white"
                      />
                      <Input
                        value={editingArticle.image}
                        onChange={(e) => setEditingArticle({...editingArticle, image: e.target.value})}
                        placeholder="URL de l'image"
                        className="bg-slate-600 text-white"
                      />
                      <Textarea
                        value={editingArticle.content}
                        onChange={(e) => setEditingArticle({...editingArticle, content: e.target.value})}
                        placeholder="Contenu"
                        className="bg-slate-600 text-white"
                        rows={4}
                      />
                      <Input
                        value={editingArticle.metaTitle}
                        onChange={(e) => setEditingArticle({...editingArticle, metaTitle: e.target.value})}
                        placeholder="Meta Title (SEO)"
                        className="bg-slate-600 text-white"
                      />
                      <Textarea
                        value={editingArticle.metaDescription}
                        onChange={(e) => setEditingArticle({...editingArticle, metaDescription: e.target.value})}
                        placeholder="Meta Description (SEO)"
                        className="bg-slate-600 text-white"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            updateArticle(editingArticle);
                            setEditingArticle(null);
                          }}
                          className="bg-green-600 hover:bg-green-700 flex-1"
                        >
                          ✅ Sauvegarder
                        </Button>
                        <Button
                          onClick={() => setEditingArticle(null)}
                          className="bg-gray-600 hover:bg-gray-700 flex-1"
                        >
                          ❌ Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-white">{article.title}</h3>
                        <p className="text-gray-300 text-sm">📁 {article.category}</p>
                        <p className="text-gray-400 text-sm mt-1">{article.content.substring(0, 100)}...</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setEditingArticle(article)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          ✏️ Éditer
                        </Button>
                        <Button
                          onClick={() => deleteArticle(article.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          🗑️ Supprimer
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* DESTINATIONS TAB */}
          <TabsContent value="destinations" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Gestion des Destinations</h2>
              <Button onClick={addDestination} className="bg-blue-600 hover:bg-blue-700">
                ➕ Ajouter une destination
              </Button>
            </div>

            <div className="space-y-4">
              {destinations.map((destination) => (
                <div key={destination.id} className="bg-slate-700 p-4 rounded-lg">
                  {editingDestination?.id === destination.id ? (
                    <div className="space-y-3">
                      <Input
                        value={editingDestination.name}
                        onChange={(e) => setEditingDestination({...editingDestination, name: e.target.value})}
                        placeholder="Nom"
                        className="bg-slate-600 text-white"
                      />
                      <Input
                        value={editingDestination.slug}
                        onChange={(e) => setEditingDestination({...editingDestination, slug: e.target.value})}
                        placeholder="Slug"
                        className="bg-slate-600 text-white"
                      />
                      <Input
                        value={editingDestination.region}
                        onChange={(e) => setEditingDestination({...editingDestination, region: e.target.value})}
                        placeholder="Région"
                        className="bg-slate-600 text-white"
                      />
                      <Input
                        value={editingDestination.image}
                        onChange={(e) => setEditingDestination({...editingDestination, image: e.target.value})}
                        placeholder="URL de l'image"
                        className="bg-slate-600 text-white"
                      />
                      <Textarea
                        value={editingDestination.description}
                        onChange={(e) => setEditingDestination({...editingDestination, description: e.target.value})}
                        placeholder="Description"
                        className="bg-slate-600 text-white"
                        rows={3}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={editingDestination.bestSeason}
                          onChange={(e) => setEditingDestination({...editingDestination, bestSeason: e.target.value})}
                          placeholder="Meilleure saison"
                          className="bg-slate-600 text-white"
                        />
                        <Input
                          value={editingDestination.duration}
                          onChange={(e) => setEditingDestination({...editingDestination, duration: e.target.value})}
                          placeholder="Durée"
                          className="bg-slate-600 text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={editingDestination.budget}
                          onChange={(e) => setEditingDestination({...editingDestination, budget: e.target.value})}
                          placeholder="Budget"
                          className="bg-slate-600 text-white"
                        />
                        <Input
                          value={editingDestination.highlights}
                          onChange={(e) => setEditingDestination({...editingDestination, highlights: e.target.value})}
                          placeholder="Points forts"
                          className="bg-slate-600 text-white"
                        />
                      </div>
                      <Input
                        value={editingDestination.metaTitle}
                        onChange={(e) => setEditingDestination({...editingDestination, metaTitle: e.target.value})}
                        placeholder="Meta Title (SEO)"
                        className="bg-slate-600 text-white"
                      />
                      <Textarea
                        value={editingDestination.metaDescription}
                        onChange={(e) => setEditingDestination({...editingDestination, metaDescription: e.target.value})}
                        placeholder="Meta Description (SEO)"
                        className="bg-slate-600 text-white"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            updateDestination(editingDestination);
                            setEditingDestination(null);
                          }}
                          className="bg-green-600 hover:bg-green-700 flex-1"
                        >
                          ✅ Sauvegarder
                        </Button>
                        <Button
                          onClick={() => setEditingDestination(null)}
                          className="bg-gray-600 hover:bg-gray-700 flex-1"
                        >
                          ❌ Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-white">{destination.name}</h3>
                        <p className="text-gray-300 text-sm">📍 {destination.region}</p>
                        <p className="text-gray-400 text-sm mt-1">{destination.description.substring(0, 100)}...</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setEditingDestination(destination)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          ✏️ Éditer
                        </Button>
                        <Button
                          onClick={() => deleteDestination(destination.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          🗑️ Supprimer
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* BACKUP TAB */}
          <TabsContent value="backup" className="space-y-6">
            <div className="bg-slate-700 p-6 rounded-lg space-y-4">
              <h2 className="text-2xl font-bold text-white">Sauvegarde & Restauration</h2>
              
              <div className="space-y-2">
                <p className="text-gray-300">Exportez toutes vos données en JSON pour une sauvegarde complète.</p>
                <Button onClick={exportData} className="w-full bg-green-600 hover:bg-green-700">
                  📥 Exporter les données (JSON)
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-gray-300">Importez une sauvegarde JSON pour restaurer vos données.</p>
                <label className="block">
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                  />
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={(e) => {
                    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                    input?.click();
                  }}>
                    📤 Importer une sauvegarde (JSON)
                  </Button>
                </label>
              </div>

              <div className="bg-slate-600 p-4 rounded text-gray-300 text-sm">
                <p className="font-bold mb-2">💡 Conseils :</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Exportez régulièrement vos données</li>
                  <li>Conservez les fichiers JSON en lieu sûr</li>
                  <li>Testez les imports avant de les utiliser en production</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
