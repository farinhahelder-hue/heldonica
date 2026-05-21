'use client';

import { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { searchUnsplash } from '@/lib/unsplash';

interface CarouselEditorProps {
  onComplete?: (carousel: any) => void;
}

export default function CarouselEditor({ onComplete }: CarouselEditorProps) {
  const [rawText, setRawText] = useState('');
  const [title, setTitle] = useState('');
  const [slides, setSlides] = useState<{title: string, content: string}[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Parse pasted text into slides
  const handleParseText = () => {
    if (!rawText.trim()) return;
    
    const lines = rawText.split('\n').filter(l => l.trim());
    const newSlides: {title: string, content: string}[] = [];
    let currentTitle = '';
    let currentContent = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      // Check if line looks like a title (starts with number or short)
      if (/^\d+[\.\)\-:]/.test(trimmed) || trimmed.length < 50) {
        if (currentTitle && currentContent) {
          newSlides.push({ title: currentTitle, content: currentContent });
        }
        currentTitle = trimmed.replace(/^\d+[\.\)\-:]\s*/, '');
        currentContent = '';
      } else {
        currentContent += (currentContent ? '\n' : '') + trimmed;
      }
    }
    if (currentTitle && currentContent) {
      newSlides.push({ title: currentTitle, content: currentContent });
    }
    
    // If no slides parsed, try different approach
    if (newSlides.length === 0 && lines.length > 0) {
      // Use first line as title, rest as slides
      setTitle(lines[0]?.replace(/^[#*\d\-.]+\s*/, '').substring(0, 50) || 'Carrousel');
      // Split remaining lines into 5 slides
      const remaining = lines.slice(1).join(' ').split(/(?=\d+[\.\)\-:])/);
      for (const part of remaining) {
        if (part.trim()) {
          const cleaned = part.replace(/^\d+[\.\)\-:]\s*/, '').trim();
          if (cleaned) {
            const words = cleaned.split(' ').slice(0, 15).join(' ');
            newSlides.push({ title: words.substring(0, 30), content: cleaned });
          }
        }
      }
    }
    
    // Ensure we have 5 slides
    while (newSlides.length < 5) {
      newSlides.push({ title: `Slide ${newSlides.length + 1}`, content: '' });
    }
    
    setSlides(newSlides.slice(0, 5));
  };

  // Search Unsplash for images matching each slide
  const handleSearchImages = async () => {
    if (slides.length === 0) return;
    
    setIsSearching(true);
    const newImages: string[] = [];
    
    for (const slide of slides) {
      const keyword = slide.title || slide.content.split(' ').slice(0, 3).join(' ');
      try {
        const results = await searchUnsplash(keyword, 1);
        if (results[0]) {
          newImages.push(results[0].urls.regular);
        } else {
          newImages.push('');
        }
      } catch {
        newImages.push('');
      }
    }
    
    setImages(newImages);
    setIsSearching(false);
  };

  // Download ZIP with images and text
  const handleDownloadZip = async () => {
    if (slides.length === 0) return;
    
    setIsLoading(true);
    const zip = new JSZip();
    
    const contentText = `TITRE: ${title}
DATE: ${new Date().toLocaleDateString()}

SLIDES:
${slides.map((s, i) => `
--- Slide ${i+1} ---
${s.title}
${s.content}
`).join('\n')}

---
Généré avec Heldonica CMS
`;
    zip.file('contenu.txt', contentText);
    
    // Add images
    for (let i = 0; i < images.length; i++) {
      if (images[i]) {
        try {
          const res = await fetch(images[i]);
          const blob = await res.blob();
          zip.file(`slide-${i+1}.jpg`, blob);
        } catch {}
      }
    }
    
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${title.replace(/\s+/g, '-').toLowerCase() || 'carousel'}.zip`);
    setIsLoading(false);
  };

  return (
    <div style={{ padding: '1rem', background: 'white', borderRadius: '.5rem', boxShadow: '0 1px 4px rgba(0,0,0,.1)' }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>📝 Créer depuis Perplexity</h2>

      {/* Paste text area */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '.875rem', fontWeight: 500, marginBottom: '.25rem' }}>
          Colle ici le texte de Perplexity:
        </label>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Colle le contenu généré par Perplexity..."
          style={{ width: '100%', padding: '.5rem .75rem', border: '1px solid #ddd', borderRadius: '.5rem', height: '8rem', fontSize: '.875rem', resize: 'vertical' }}
        />
        <button
          onClick={handleParseText}
          disabled={!rawText.trim()}
          style={{ marginTop: '.5rem', width: '100%', padding: '.5rem 1rem', background: !rawText.trim() ? '#ccc' : '#2563eb', color: 'white', border: 'none', borderRadius: '.5rem', cursor: !rawText.trim() ? 'not-allowed' : 'pointer', fontSize: '.875rem', fontWeight: 600 }}
        >
          📋 Analyser le texte
        </button>
      </div>

      {/* Title input */}
      {slides.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '.875rem', fontWeight: 500, marginBottom: '.25rem' }}>Titre:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre du carrousel"
            style={{ width: '100%', padding: '.5rem .75rem', border: '1px solid #ddd', borderRadius: '.5rem', fontSize: '.875rem' }}
          />
        </div>
      )}

      {/* Slides preview */}
      {slides.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
            <label style={{ fontWeight: 500 }}>Slides ({slides.length}):</label>
            <button
              onClick={handleSearchImages}
              disabled={isSearching}
              style={{ fontSize: '.875rem', padding: '.25rem .5rem', background: '#f3f4f6', border: '1px solid #ddd', borderRadius: '.375rem', cursor: isSearching ? 'wait' : 'pointer', opacity: isSearching ? .6 : 1 }}
            >
              {isSearching ? '⏳...' : '🔍 Rechercher images'}
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            {slides.map((slide, i) => (
              <div key={i} style={{ padding: '.5rem', background: '#f9fafb', borderRadius: '.375rem', display: 'flex', gap: '.5rem' }}>
                {images[i] && (
                  <img src={images[i]} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: '.375rem', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <input
                    type="text"
                    value={slide.title}
                    onChange={(e) => {
                      const newSlides = [...slides];
                      newSlides[i].title = e.target.value;
                      setSlides(newSlides);
                    }}
                    placeholder="Titre"
                    style={{ width: '100%', padding: '.25rem .5rem', border: '1px solid #ddd', borderRadius: '.25rem', fontSize: '.875rem', marginBottom: '.25rem' }}
                  />
                  <textarea
                    value={slide.content}
                    onChange={(e) => {
                      const newSlides = [...slides];
                      newSlides[i].content = e.target.value;
                      setSlides(newSlides);
                    }}
                    placeholder="Contenu"
                    style={{ width: '100%', padding: '.25rem .5rem', border: '1px solid #ddd', borderRadius: '.25rem', fontSize: '.75rem', height: '3rem', resize: 'none' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Download button */}
      {slides.length > 0 && (
        <button
          onClick={handleDownloadZip}
          disabled={isLoading}
          style={{ width: '100%', padding: '.5rem 1rem', background: isLoading ? '#ccc' : '#7c3aed', color: 'white', border: 'none', borderRadius: '.5rem', cursor: isLoading ? 'wait' : 'pointer', fontSize: '.875rem', fontWeight: 600 }}
        >
          📦 Télécharger ZIP
        </button>
      )}
    </div>
  );
}
