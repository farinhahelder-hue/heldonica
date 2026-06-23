'use client';

import React, { useState } from 'react';
import { Camera, Sparkles, Loader2, Video, Download } from 'lucide-react';
import Cookies from 'js-cookie';

export default function VideoMaker() {
  const cmsPassword = Cookies.get('heldonica_cms_session') || '';
  const authHeader = cmsPassword ? { 'x-cms-auth': cmsPassword } : {};

  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [generatedVideo, setGeneratedVideo] = useState('');

  // This state holds the selected photos from Google Photos
  const [selectedPhotos, setSelectedPhotos] = useState<any[]>([]);

  const generateVideo = async () => {
    if (!topic && selectedPhotos.length === 0) {
      alert('Veuillez entrer un sujet ou sélectionner des photos');
      return;
    }

    setLoading(true);
    setStatus('Génération du script et sélection des images...');

    try {
      // 1. Get images either from selected Google Photos or fallback dummy data
      let imagesToUse = selectedPhotos.map(p => p.baseUrl);
      let script = null;

      if (imagesToUse.length === 0) {
        // We use static placeholders for now if no google photo selected
        imagesToUse = [
          'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
          'https://images.unsplash.com/photo-1504280387367-361c6d9e38f4?w=800&q=80',
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80'
        ];

        script = `Script généré pour le sujet: ${topic}`;
      }

      setStatus('Assemblage de la vidéo en cours (FFmpeg)...');

      // 2. Call the assembly API
      const assembleRes = await fetch('/api/cms/video-assembly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(cmsPassword ? { 'x-cms-auth': cmsPassword } : {}) },
        body: JSON.stringify({
          images: imagesToUse,
          prompt: topic,
          textOverlay: script
        })
      });

      if (!assembleRes.ok) throw new Error('Erreur lors de l\'assemblage');

      const assembleData = await assembleRes.json();

      setGeneratedVideo(assembleData.url);
      setStatus('');
    } catch (err: any) {
      console.error(err);
      setStatus(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
          <Video size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Générateur de Réels Instagram</h2>
          <p className="text-sm text-gray-500">Créez des vidéos automatiquement à partir d’un prompt ou de Google Photos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sujet de la vidéo</label>
            <textarea
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              placeholder="Ex: Les 5 meilleures plages de Bali..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2"><Camera size={16} /> Source des images</h3>
            <p className="text-xs text-gray-500 mb-3">Si vous ne sélectionnez pas d’images, l’IA cherchera des photos d’illustration sur Unsplash.</p>

            <button className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
               <Camera size={14} /> Connecter Google Photos (En dev)
            </button>

            {selectedPhotos.length > 0 && (
              <div className="mt-3 text-xs font-medium text-green-600">
                {selectedPhotos.length} photos sélectionnées
              </div>
            )}
          </div>

          <button
            onClick={generateVideo}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {loading ? 'Création en cours...' : 'Générer la vidéo'}
          </button>

          {status && (
            <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> {status}
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 flex flex-col items-center justify-center min-h-[400px]">
          {generatedVideo ? (
            <div className="w-full max-w-[280px] space-y-4">
              <video
                src={generatedVideo}
                controls
                autoPlay
                loop
                className="w-full rounded-lg shadow-lg border-2 border-white"
                style={{ aspectRatio: '9/16', objectFit: 'cover' }}
              />
              <a
                href={generatedVideo}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-black text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800"
              >
                <Download size={16} /> Télécharger
              </a>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <Video size={48} className="mx-auto mb-3 opacity-20" />
              <p>Aperçu de la vidéo générée</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
