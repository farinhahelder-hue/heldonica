'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageEditor from '@/components/cms/PageEditor';
import ExperienceEditor from '@/components/cms/ExperienceEditor';
import MediaManager from '@/components/cms/MediaManager';
import SiteSettings from '@/components/cms/SiteSettings';

export default function CMSPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger les données du CMS
    fetch('/cms-data.json')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur lors du chargement des données:', err);
        setLoading(false);
      });
  }, []);

  const saveData = async (updatedData: any) => {
    try {
      // Sauvegarder les données (vous devrez implémenter une API route)
      const response = await fetch('/api/cms/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      
      if (response.ok) {
        setData(updatedData);
        alert('Données sauvegardées avec succès !');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cloud-dancer">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-mahogany mb-4">Chargement...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cloud-dancer">
      <nav className="bg-mahogany text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-serif font-bold">🎨 CMS Heldonica</h1>
          <p className="text-sm mt-2 opacity-90">Gérez votre contenu, vos pages et vos expériences</p>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="pages" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="pages">📄 Pages</TabsTrigger>
            <TabsTrigger value="experiences">💼 Expériences</TabsTrigger>
            <TabsTrigger value="media">🖼️ Médias</TabsTrigger>
            <TabsTrigger value="settings">⚙️ Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="pages">
            <PageEditor data={data} onSave={saveData} />
          </TabsContent>

          <TabsContent value="experiences">
            <ExperienceEditor data={data} onSave={saveData} />
          </TabsContent>

          <TabsContent value="media">
            <MediaManager data={data} onSave={saveData} />
          </TabsContent>

          <TabsContent value="settings">
            <SiteSettings data={data} onSave={saveData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
