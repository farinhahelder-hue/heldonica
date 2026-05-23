'use client';

import { useState } from 'react';
import { Video, Image, Type, Play, Download, Loader2 } from 'lucide-react';

interface VideoMakerProps {
  onVideoGenerated?: (videoUrl: string) => void;
}

export default function VideoMaker({ onVideoGenerated }: VideoMakerProps) {
  const [title, setTitle] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [caption, setCaption] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState('');

  const handleGenerate = async () => {
    if (!title.trim()) {
      setError('Un titre est requis');
      return;
    }
    
    setIsGenerating(true);
    setError('');
    setResultUrl('');
    
    try {
      const response = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, backgroundImage, caption }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResultUrl(data.videoUrl);
        onVideoGenerated?.(data.videoUrl);
      } else {
        setError(data.error || 'Erreur de génération');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ padding: '1rem', background: 'white', borderRadius: '.5rem', boxShadow: '0 1px 4px rgba(0,0,0,.1)' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
        <Video size={20} />
        🎬 Video Maker (Instagram Reels)
      </h2>
      
      <div style={{ 
        padding: '1rem', 
        background: '#f5f3ef', 
        borderRadius: '.5rem', 
        border: '1px solid #01696f',
        marginBottom: '1rem',
        fontSize: '.875rem'
      }}>
        <strong>⚠️ Prérequis serveur</strong>
        <p style={{ margin: '.5rem 0 0' }}>
          Cette fonctionnalité nécessite FFmpeg installé sur le serveur Vercel. 
          Utilise plutôt le <strong>Carousel Generator</strong> pour créer du contenu Instagram.
        </p>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '.875rem', fontWeight: 500, marginBottom: '.25rem' }}>
          Titre de la vidéo *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: 5 consejos para viajar más lento"
          style={{ width: '100%', padding: '.5rem .75rem', border: '1px solid #e5e7eb', borderRadius: '.5rem' }}
          disabled={isGenerating}
        />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '.875rem', fontWeight: 500, marginBottom: '.25rem' }}>
          Image de fond (URL)
        </label>
        <input
          type="text"
          value={backgroundImage}
          onChange={(e) => setBackgroundImage(e.target.value)}
          placeholder="https://images.unsplash.com/..."
          style={{ width: '100%', padding: '.5rem .75rem', border: '1px solid #e5e7eb', borderRadius: '.5rem' }}
          disabled={isGenerating}
        />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '.875rem', fontWeight: 500, marginBottom: '.25rem' }}>
          Caption / Texte superposé
        </label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Texte à afficher sur la vidéo..."
          style={{ width: '100%', padding: '.5rem .75rem', border: '1px solid #e5e7eb', borderRadius: '.5rem', height: 80, resize: 'vertical' }}
          disabled={isGenerating}
        />
      </div>
      
      <button
        onClick={handleGenerate}
        disabled={!title.trim() || isGenerating}
        style={{ 
          width: '100%', 
          padding: '.5rem 1rem', 
          background: '#9333ea', 
          color: 'white', 
          borderRadius: '.5rem', 
          opacity: (!title.trim() || isGenerating) ? 0.5 : 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '.5rem', 
          border: 'none', 
          cursor: (!title.trim() || isGenerating) ? 'not-allowed' : 'pointer' 
        }}
      >
        {isGenerating ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Génération en cours...</span>
          </>
        ) : (
          <>
            <Video size={16} />
            <span>Générer la vidéo</span>
          </>
        )}
      </button>
      
      {error && (
        <div style={{ marginTop: '.75rem', padding: '.5rem', background: '#fef2f2', color: '#dc2626', borderRadius: '.25rem', fontSize: '.875rem' }}>
          {error}
        </div>
      )}
      
      {resultUrl && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: '.5rem' }}>
          <p style={{ fontWeight: 500, color: '#166534', marginBottom: '.5rem' }}>✅ Vidéo générée!</p>
          <video src={resultUrl} controls style={{ width: '100%', borderRadius: '.25rem' }} />
          <a 
            href={resultUrl} 
            download 
            style={{ 
              display: 'block', 
              marginTop: '.5rem', 
              padding: '.5rem', 
              background: '#2563eb', 
              color: 'white', 
              borderRadius: '.5rem', 
              textAlign: 'center',
              textDecoration: 'none'
            }}
          >
            <Download size={16} style={{ display: 'inline', marginRight: '.25rem' }} />
            Télécharger
          </a>
        </div>
      )}
    </div>
  );
}
