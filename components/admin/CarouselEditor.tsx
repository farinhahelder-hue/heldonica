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
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">📝 Créer depuis Perplexity</h2>
      
      {/* Paste text area */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Colle ici le texte de Perplexity:
        </label>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Colle le contenu généré par Perplexity..."
          className="w-full px-3 py-2 border rounded-lg h-32 text-sm"
        />
        <button
          onClick={handleParseText}
          disabled={!rawText.trim()}
          className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          📋 Analyser le texte
        </button>
      </div>
      
      {/* Title input */}
      {slides.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Titre:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre du carrousel"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
      )}
      
      {/* Slides preview */}
      {slides.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="font-medium">Slides ({slides.length}):</label>
            <button
              onClick={handleSearchImages}
              disabled={isSearching}
              className="text-sm px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              {isSearching ? '⏳...' : '🔍 Rechercher images'}
            </button>
          </div>
          <div className="space-y-2">
            {slides.map((slide, i) => (
              <div key={i} className="p-2 bg-gray-50 rounded flex gap-2">
                {images[i] && (
                  <img src={images[i]} alt="" className="w-16 h-16 object-cover rounded" />
                )}
                <div className="flex-1">
                  <input
                    type="text"
                    value={slide.title}
                    onChange={(e) => {
                      const newSlides = [...slides];
                      newSlides[i].title = e.target.value;
                      setSlides(newSlides);
                    }}
                    placeholder="Titre"
                    className="w-full px-2 py-1 border rounded text-sm mb-1"
                  />
                  <textarea
                    value={slide.content}
                    onChange={(e) => {
                      const newSlides = [...slides];
                      newSlides[i].content = e.target.value;
                      setSlides(newSlides);
                    }}
                    placeholder="Contenu"
                    className="w-full px-2 py-1 border rounded text-xs h-12 resize-none"
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
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          📦 Télécharger ZIP
        </button>
      )}
    </div>
  );
}
