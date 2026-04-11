'use client';

import { useState, useRef } from 'react';
import { searchUnsplash, type UnsplashPhoto } from '@/lib/unsplash';
import { buildCarouselPrompt, type CarouselSlide } from '@/lib/perplexity-carousel';

interface CarouselEditorProps {
  onComplete?: (slides: CarouselSlide[]) => void;
}

// Instagram carousel dimensions (1080x1350 for 4:5 ratio)
const SLIDE_WIDTH = 540;
const SLIDE_HEIGHT = 675;

export default function CarouselEditor({ onComplete }: CarouselEditorProps) {
  const [topic, setTopic] = useState('');
  const [title, setTitle] = useState('');
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [images, setImages] = useState<Record<number, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const slideRefs = useRef<HTMLDivElement[]>([]);

  // Generate content via Perplexity link
  const handleGenerateContent = () => {
    if (!topic.trim()) return;
    const prompt = buildCarouselPrompt(topic, 5);
    const encoded = encodeURIComponent(prompt);
    window.open(`https://perplexity.ai/?q=${encoded}`, '_blank');
  };

  // Search images for each slide
  const handleSearchImages = async () => {
    if (slides.length === 0) return;
    
    setIsGenerating(true);
    const newImages: Record<number, string> = {};
    
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      if (slide.content) {
        // Extract keywords from content or use topic
        const keyword = slide.content.split(' ').slice(0, 2).join(' ');
        const results = await searchUnsplash(keyword || topic, 1);
        if (results[0]) {
          newImages[i] = results[0].urls.small;
        }
      }
    }
    
    setImages({ ...images, ...newImages });
    setIsGenerating(false);
  };

  // Update a specific slide
  const updateSlide = (index: number, field: 'title' | 'content', value: string) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setSlides(newSlides);
  };

  // Manual add slide
  const addSlide = () => {
    setSlides([...slides, { title: '', content: '' }]);
  };

  // Remove slide
  const removeSlide = (index: number) => {
    setSlides(slides.filter((_, i) => i !== index));
  };

  // Export as PNG (simplified - would need html2canvas)
  const handleExport = async () => {
    setIsExporting(true);
    alert('Export: Click each slide to save as image, then upload to Buffer');
    setIsExporting(false);
    onComplete?.(slides);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">🎠 Créer un Carrousel</h2>
      
      {/* Topic Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Sujet du carrousel</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Ex: 5 tips voyage Portugal"
          className="w-full px-3 py-2 border rounded-lg"
        />
        <button
          onClick={handleGenerateContent}
          disabled={!topic.trim()}
          className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <span>🤖</span>
          <span>Générer avec Perplexity</span>
        </button>
        <p className="text-xs text-gray-500 mt-1">
          Perplexity va générer le contenu. Copiez/collez les résultat ci-dessous.
        </p>
      </div>
      
      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Titre principal</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre du carrousel"
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>
      
      {/* Slides Editor */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="font-medium">Slides ({slides.length})</label>
          <button
            onClick={addSlide}
            className="text-sm px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            + Ajouter slide
          </button>
        </div>
        
        {slides.map((slide, index) => (
          <div key={index} className="p-3 mb-2 bg-gray-50 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Slide {index + 1}</span>
              <button
                onClick={() => removeSlide(index)}
                className="text-red-500 text-sm"
              >
                Supprimer
              </button>
            </div>
            <input
              type="text"
              value={slide.title}
              onChange={(e) => updateSlide(index, 'title', e.target.value)}
              placeholder="Titre"
              className="w-full mb-2 px-2 py-1 border rounded text-sm"
            />
            <textarea
              value={slide.content}
              onChange={(e) => updateSlide(index, 'content', e.target.value)}
              placeholder="Contenu (2-3 phrases)"
              rows={2}
              className="w-full px-2 py-1 border rounded text-sm"
            />
            {/* Image preview */}
            {images[index] && (
              <img src={images[index]} alt={`Slide ${index + 1}`} className="mt-2 w-full h-24 object-cover rounded" />
            )}
          </div>
        ))}
      </div>
      
      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={handleSearchImages}
          disabled={slides.length === 0 || isGenerating}
          className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50"
        >
          {isGenerating ? 'Recherche images...' : '🔍 Rechercher images Unsplash'}
        </button>
        
        <button
          onClick={handleExport}
          disabled={slides.length === 0 || isExporting}
          className="w-full px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 disabled:opacity-50"
        >
          {isExporting ? 'Export...' : '📥 Export PNG'}
        </button>
      </div>
    </div>
  );
}