'use client';

import { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface CarouselHistory {
  id: string;
  topic: string;
  title: string;
  caption: string;
  hashtags: string[];
  slides: any[];
  images: string[];
  created_at: string;
}

interface CarouselGeneratorProps {
  onComplete?: (carousel: any) => void;
}

export default function CarouselGenerator({ onComplete }: CarouselGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<CarouselHistory[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Load history from API
  useEffect(() => {
    fetch('/api/cms/carousel-history')
      .then(res => res.json())
      .then(data => {
        if (data.history) setHistory(data.history);
      })
      .catch(() => { /* ignore */ });
  }, []);

  // Save to history when result changes
  useEffect(() => {
    if (result) {
      fetch('/api/cms/carousel-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, title: result.title, caption: result.caption, hashtags: result.hashtags, slides: result.slides, images: result.images })
      }).then(() => {
        // Reload history
        fetch('/api/cms/carousel-history').then(res => res.json()).then(data => {
          if (data.history) setHistory(data.history);
        });
      });
    }
  }, [result, topic]);

  const handleLoadFromHistory = (item: CarouselHistory) => {
    setTopic(item.topic);
    setResult({ title: item.title, caption: item.caption, hashtags: item.hashtags || [], slides: item.slides || [], images: item.images || [] });
    setSelectedId(item.id);
  };

  const handleDeleteHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`/api/cms/carousel-history/${id}`, { method: 'DELETE' });
    setHistory(history.filter(h => h.id !== id));
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    setError('');
    setResult(null);
    
    try {
      const response = await fetch('/api/carousel/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(data);
        onComplete?.(data);
      } else {
        setError(data.error || 'Erreur de génération');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadZip = async () => {
    if (!result) return;
    
    try {
      setIsGenerating(true);
      const zip = new JSZip();
      
      const contentText = `TITRE: ${result.title}

CAPTION:
${result.caption}

HASHTAGS:
${result.hashtags?.join(' ')}

SLIDES:
${result.slides?.map((s: any, i: number) => `
--- Slide ${i+1} ---
Titre: ${s.title}
Contenu: ${s.content}
`).join('\n')}

---
Généré avec Heldonica CMS
`;
      
      zip.file('contenu.txt', contentText);
      
      // Add all images
      const allImages = result.images?.length > 0 ? result.images : (result.image ? [result.image] : []);
      for (let i = 0; i < allImages.length; i++) {
        try {
          const imgRes = await fetch(allImages[i]);
          const imgBlob = await imgRes.blob();
          zip.file(`image-${i+1}.jpg`, imgBlob);
        } catch {}
      }
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `carousel-${result.title.replace(/\s+/g, '-').toLowerCase()}.zip`);
    } catch (err) {
      alert('Erreur lors de la création du ZIP');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ padding: '1rem', background: 'white', borderRadius: '.5rem', boxShadow: '0 1px 4px rgba(0,0,0,.1)' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>🎠 Générateur de Carrousel</h2>
      
      {/* Topic Input */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '.875rem', fontWeight: 500, marginBottom: '.25rem' }}>Sujet du carrousel</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Ex: 5 tips voyage Portugal"
          style={{ width: '100%', padding: '.5rem .75rem', border: '1px solid #e5e7eb', borderRadius: '.5rem' }}
          disabled={isGenerating}
        />
      </div>
      
      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!topic.trim() || isGenerating}
        style={{ width: '100%', padding: '.5rem 1rem', background: '#01696f', color: 'white', borderRadius: '.5rem', opacity: (!topic.trim() || isGenerating) ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', border: 'none', cursor: (!topic.trim() || isGenerating) ? 'not-allowed' : 'pointer' }}
      >
        {isGenerating ? (
          <>
            <span>⏳</span>
            <span>Génération en cours...</span>
          </>
        ) : (
          <>
            <span>✨</span>
            <span>Générer le carrousel</span>
          </>
        )}
      </button>
      
      {/* Error */}
      {error && (
        <div style={{ marginTop: '.75rem', padding: '.5rem', background: '#fef2f2', color: '#dc2626', borderRadius: '.25rem', fontSize: '.875rem' }}>
          {error}
        </div>
      )}
      
      {/* Result */}
      {result && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: '.5rem' }}>
          <h3 style={{ fontWeight: 700, color: '#166534', marginBottom: '.5rem' }}>✅ Carrousel généré!</h3>
          
          <div style={{ marginBottom: '.75rem' }}>
            <span style={{ fontSize: '.875rem', fontWeight: 500 }}>Titre:</span>
            <p style={{ fontSize: '1.125rem', fontWeight: 700 }}>{result.title}</p>
          </div>
          
          <div style={{ marginBottom: '.75rem' }}>
            <span style={{ fontSize: '.875rem', fontWeight: 500 }}>Slides:</span>
            <ul style={{ marginTop: '.25rem', display: 'flex', flexDirection: 'column', gap: '.25rem', padding: 0, listStyle: 'none' }}>
              {result.slides?.map((slide: any, i: number) => (
                <li key={i} style={{ fontSize: '.875rem', padding: '.5rem', background: 'white', borderRadius: '.25rem' }}>
                  <strong>{i + 1}. {slide.title}</strong>
                  <p style={{ color: '#4b5563', margin: '0' }}>{slide.content}</p>
                </li>
              ))}
            </ul>
          </div>
          
          <div style={{ marginBottom: '.75rem' }}>
            <span style={{ fontSize: '.875rem', fontWeight: 500 }}>Caption:</span>
            <p style={{ fontSize: '.875rem', margin: 0 }}>{result.caption}</p>
          </div>
          
          <div style={{ marginBottom: '.75rem' }}>
            <span style={{ fontSize: '.875rem', fontWeight: 500 }}>Hashtags:</span>
            <p style={{ fontSize: '.875rem', margin: 0 }}>{result.hashtags?.join(' ')}</p>
          </div>
          
          {result.images && result.images.length > 0 ? (
            <div style={{ marginBottom: '.75rem' }}>
              <span style={{ fontSize: '.875rem', fontWeight: 500 }}>Images ({result.images.length}):</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '.5rem', marginTop: '.25rem' }}>
                {result.images.map((img: string, i: number) => (
                  <img key={i} src={img} alt={`Slide ${i+1}`} style={{ width: '100%', height: '5rem', objectFit: 'cover', borderRadius: '.25rem' }} />
                ))}
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '.75rem', padding: '.75rem', background: '#f5f3ef', border: '1px solid #01696f', borderRadius: '.25rem', fontSize: '.875rem', color: '#01696f' }}>
              ⚠️ Pas d’images - vérifie la clé Unsplash dans Vercel (NEXT_PUBLIC_UNSPLASH_ACCESS_KEY)
            </div>
          )}
          
          <button
            onClick={handleDownloadZip}
            disabled={isGenerating}
            style={{ marginTop: '.75rem', width: '100%', padding: '.5rem 1rem', background: '#9333ea', color: 'white', borderRadius: '.5rem', opacity: isGenerating ? 0.5 : 1, border: 'none', cursor: isGenerating ? 'not-allowed' : 'pointer' }}
          >
            📦 Télécharger ZIP (image + texte)
          </button>
          
          <button
            onClick={() => {
              const text = `TITRE: ${result.title}\n\nCAPTION:\n${result.caption}\n\nHASHTAGS:\n${result.hashtags?.join(' ')}\n\nSLIDES:\n${result.slides?.map((s: any, i: number) => `--- Slide ${i+1} ---\nTitre: ${s.title}\n${s.content}`).join('\n\n')}`;
              navigator.clipboard.writeText(text);
              alert('📋 Copié dans le presse-papier!');
            }}
            style={{ marginTop: '.5rem', width: '100%', padding: '.5rem 1rem', background: '#2563eb', color: 'white', borderRadius: '.5rem', border: 'none', cursor: 'pointer' }}
          >
            📋 Copier le texte
          </button>
        </div>
      )}
    </div>
  );
}