'use client';

import { useState } from 'react';

interface CarouselGeneratorProps {
  onComplete?: (carousel: any) => void;
}

export default function CarouselGenerator({ onComplete }: CarouselGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    setError('');
    
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

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">🎠 Générateur de Carrousel</h2>
      
      {/* Topic Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Sujet du carrousel</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Ex: 5 tips voyage Portugal"
          className="w-full px-3 py-2 border rounded-lg"
          disabled={isGenerating}
        />
      </div>
      
      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!topic.trim() || isGenerating}
        className="w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <span className="animate-spin">⏳</span>
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
        <div className="mt-3 p-2 bg-red-50 text-red-600 rounded text-sm">
          {error}
        </div>
      )}
      
      {/* Result */}
      {result && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <h3 className="font-bold text-green-800 mb-2">✅ Carrousel généré!</h3>
          
          <div className="mb-3">
            <span className="text-sm font-medium">Titre:</span>
            <p className="text-lg font-bold">{result.title}</p>
          </div>
          
          <div className="mb-3">
            <span className="text-sm font-medium">Slides:</span>
            <ul className="mt-1 space-y-1">
              {result.slides?.map((slide: any, i: number) => (
                <li key={i} className="text-sm p-2 bg-white rounded">
                  <strong>{i + 1}. {slide.title}</strong>
                  <p className="text-gray-600">{slide.content}</p>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mb-3">
            <span className="text-sm font-medium">Caption:</span>
            <p className="text-sm">{result.caption}</p>
          </div>
          
          <div className="mb-3">
            <span className="text-sm font-medium">Hashtags:</span>
            <p className="text-sm">{result.hashtags?.join(' ')}</p>
          </div>
          
          {result.image && (
            <div>
              <span className="text-sm font-medium">Image:</span>
              <img src={result.image} alt="Preview" className="mt-1 w-full h-40 object-cover rounded" />
            </div>
          )}
          
          <button
            onClick={() => window.open('https://buffer.com/app', '_blank')}
            className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            📱 Ouvrir Buffer
          </button>
        </div>
      )}
    </div>
  );
}