'use client';

import { useState, useEffect } from 'react';
import { Copy, RefreshCw, Instagram, Zap, Plus, Check, FileText, MapPin } from 'lucide-react';

type Article = {
  id: number;
  title: string;
  excerpt?: string;
  category?: string;
  country?: string;
  city?: string;
  featured_image?: string;
};

const AMBIANCE_OPTIONS = [
  { value: 'decouverte', label: 'Découverte' },
  { value: 'emotion', label: 'Émotion' },
  { value: 'coulisses', label: 'Coulisses' },
  { value: 'conseil-pratique', label: 'Conseil pratique' },
];

const HASHTAG_PACKS = {
  slowTravel: ['#slowtravel', '#voyagelentement', '#voyageresponsable', '#ecotravel', '#slowtourisme'],
  couple: ['#voyageencouple', '#coupletravel', '#aventureàdeux', '#heldonicafr', '#conceptionsurmesure'],
};

export default function InstagramCaptionGenerator({ articles }: { articles: Article[] }) {
  const [mode, setMode] = useState<'article' | 'freeform'>('article');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [topic, setTopic] = useState('');
  const [destination, setDestination] = useState('');
  const [ambiance, setAmbiance] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastParams, setLastParams] = useState<any>({});

  const charCount = caption.length;
  const isOverLimit = charCount > 2000;
  const isNearLimit = charCount > 1800;

  // Load published articles for dropdown
  const publishedArticles = articles.filter(a => (a as any).published);

  const generate = async (variant?: 'short') => {
    setLoading(true);
    try {
      const params: any = { variant };

      if (mode === 'article' && selectedArticle) {
        params.articleTitle = selectedArticle.title;
        params.articleExcerpt = selectedArticle.excerpt;
        params.destination = selectedArticle.city || selectedArticle.country;
        setLastParams({ articleTitle: selectedArticle.title, articleExcerpt: selectedArticle.excerpt, destination: selectedArticle.city || selectedArticle.country });
      } else {
        params.topic = topic;
        params.destination = destination;
        params.ambiance = ambiance;
        setLastParams({ topic, destination, ambiance });
      }

      const res = await fetch('/api/cms/instagram-captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      if (data.caption) {
        setCaption(data.caption);
      }
    } catch (e) {
      console.error('Generation error:', e);
    } finally {
      setLoading(false);
    }
  };

  const regenerate = () => {
    generate();
  };

  const generateShort = () => {
    generate('short');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy error:', e);
    }
  };

  const appendHashtags = (hashtags: string[]) => {
    const currentHashtags = caption.split('\n').pop()?.match(/#\S+/g)?.join(' ') || '';
    const newHashtags = [...new Set([...currentHashtags.split(' ').filter(Boolean), ...hashtags])].join(' ');
    
    if (currentHashtags) {
      const lines = caption.split('\n');
      lines[lines.length - 1] = newHashtags;
      setCaption(lines.join('\n'));
    } else {
      setCaption(caption + '\n\n' + newHashtags);
    }
  };

  const generateDestinationHashtags = () => {
    if (!destination) return;
    
    const destParts = destination.toLowerCase().replace(/\s+/g, '').split(/[,\/]/);
    const destHashtags = destParts.map(p => `#${p.replace(/[^a-z0-9]/g, '')}`).filter(h => h.length > 2);
    
    appendHashtags(destHashtags.slice(0, 3));
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.5rem' }}>
          <Instagram size={28} style={{ color: '#E1306C' }} />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#6b2a1a', margin: 0 }}>Générateur de Légendes Instagram</h2>
        </div>
        <p style={{ color: '#888', fontSize: '.9rem', margin: 0 }}>
          Créez des légendes engageantes et authentiques pour vos posts. Ton sensoriel, narratif, jamais corporate.
        </p>
      </div>

      {/* Mode Toggle */}
      <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setMode('article')}
            style={{
              flex: 1,
              padding: '.75rem 1rem',
              border: 'none',
              borderRadius: '.5rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '.5rem',
              background: mode === 'article' ? '#2D6A4F' : '#f0f0f0',
              color: mode === 'article' ? 'white' : '#666',
            }}
          >
            <FileText size={18} />
            Générer depuis un article
          </button>
          <button
            onClick={() => setMode('freeform')}
            style={{
              flex: 1,
              padding: '.75rem 1rem',
              border: 'none',
              borderRadius: '.5rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '.5rem',
              background: mode === 'freeform' ? '#2D6A4F' : '#f0f0f0',
              color: mode === 'freeform' ? 'white' : '#666',
            }}
          >
            <Zap size={18} />
            Saisie libre
          </button>
        </div>

        {/* Mode 1: Article Selection */}
        {mode === 'article' && (
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '.85rem', color: '#555', marginBottom: '.5rem' }}>
              Sélectionner un article publié
            </label>
            <select
              value={selectedArticle?.id || ''}
              onChange={(e) => {
                const article = publishedArticles.find(a => a.id === Number(e.target.value));
                setSelectedArticle(article || null);
              }}
              style={{
                width: '100%',
                padding: '.75rem 1rem',
                border: '1.5px solid #e0dbd5',
                borderRadius: '.5rem',
                fontSize: '.95rem',
                background: '#faf9f7',
                color: '#1a1a1a',
                cursor: 'pointer',
              }}
            >
              <option value="">— Choisir un article —</option>
              {publishedArticles.map(a => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
            
            {selectedArticle && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8f5f0', borderRadius: '.5rem', borderLeft: '3px solid #2D6A4F' }}>
                <p style={{ fontWeight: 600, color: '#333', marginBottom: '.25rem' }}>{selectedArticle.title}</p>
                {selectedArticle.excerpt && (
                  <p style={{ fontSize: '.85rem', color: '#666', margin: 0 }}>{selectedArticle.excerpt.slice(0, 150)}...</p>
                )}
                {(selectedArticle.city || selectedArticle.country) && (
                  <p style={{ fontSize: '.8rem', color: '#888', marginTop: '.5rem', display: 'flex', alignItems: 'center', gap: '.25rem' }}>
                    <MapPin size={14} />
                    {selectedArticle.city || ''} {selectedArticle.country || ''}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mode 2: Freeform Input */}
        {mode === 'freeform' && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '.85rem', color: '#555', marginBottom: '.35rem' }}>
                Sujet
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: Balade à Bogotá"
                style={{
                  width: '100%',
                  padding: '.75rem 1rem',
                  border: '1.5px solid #e0dbd5',
                  borderRadius: '.5rem',
                  fontSize: '.95rem',
                  background: '#faf9f7',
                  color: '#1a1a1a',
                }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '.85rem', color: '#555', marginBottom: '.35rem' }}>
                  Destination
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Ex: Bogotá, Colombie"
                  style={{
                    width: '100%',
                    padding: '.75rem 1rem',
                    border: '1.5px solid #e0dbd5',
                    borderRadius: '.5rem',
                    fontSize: '.95rem',
                    background: '#faf9f7',
                    color: '#1a1a1a',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '.85rem', color: '#555', marginBottom: '.35rem' }}>
                  Ambiance
                </label>
                <select
                  value={ambiance}
                  onChange={(e) => setAmbiance(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '.75rem 1rem',
                    border: '1.5px solid #e0dbd5',
                    borderRadius: '.5rem',
                    fontSize: '.95rem',
                    background: '#faf9f7',
                    color: '#1a1a1a',
                  }}
                >
                  <option value="">— Choisir —</option>
                  {AMBIANCE_OPTIONS.map(a => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => generate()}
          disabled={loading || (mode === 'article' && !selectedArticle) || (mode === 'freeform' && !topic)}
          style={{
            width: '100%',
            padding: '1rem',
            border: 'none',
            borderRadius: '.75rem',
            cursor: loading || (mode === 'article' && !selectedArticle) || (mode === 'freeform' && !topic) ? 'not-allowed' : 'pointer',
            fontWeight: 700,
            fontSize: '1rem',
            background: (loading || (mode === 'article' && !selectedArticle) || (mode === 'freeform' && !topic)) ? '#ccc' : 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '.5rem',
          }}
        >
          {loading ? (
            <>
              <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
              Génération en cours...
            </>
          ) : (
            <>
              <Zap size={20} />
              Générer la légende
            </>
          )}
        </button>
      </div>

      {/* Output Section */}
      {caption && (
        <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
          {/* Caption Display */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem' }}>
              <label style={{ fontWeight: 600, color: '#333' }}>Légende générée</label>
              <span style={{
                fontSize: '.8rem',
                fontWeight: 600,
                color: isOverLimit ? '#dc3545' : isNearLimit ? '#ffc107' : '#2D6A4F',
              }}>
                {charCount} / 2200 caractères
              </span>
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              style={{
                width: '100%',
                minHeight: 280,
                padding: '1rem',
                border: '1.5px solid #e0dbd5',
                borderRadius: '.75rem',
                fontSize: '.95rem',
                lineHeight: 1.6,
                background: '#faf9f7',
                color: '#1a1a1a',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <button
              onClick={copyToClipboard}
              style={{
                flex: 1,
                minWidth: 120,
                padding: '.75rem 1rem',
                border: 'none',
                borderRadius: '.5rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '.9rem',
                background: copied ? '#2D6A4F' : '#2D6A4F',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '.5rem',
              }}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copié ✓' : 'Copier'}
            </button>
            <button
              onClick={regenerate}
              disabled={loading}
              style={{
                flex: 1,
                minWidth: 120,
                padding: '.75rem 1rem',
                border: '1.5px solid #e0dbd5',
                borderRadius: '.5rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '.9rem',
                background: 'white',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '.5rem',
                opacity: loading ? 0.6 : 1,
              }}
            >
              <RefreshCw size={18} />
              Régénérer
            </button>
            <button
              onClick={generateShort}
              disabled={loading}
              style={{
                flex: 1,
                minWidth: 120,
                padding: '.75rem 1rem',
                border: '1.5px solid #E1306C',
                borderRadius: '.5rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '.9rem',
                background: 'white',
                color: '#E1306C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '.5rem',
                opacity: loading ? 0.6 : 1,
              }}
            >
              <Instagram size={18} />
              Variante courte (Stories)
            </button>
          </div>

          {/* Hashtag Packs */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '.85rem', color: '#555', marginBottom: '.75rem' }}>
              Packs de hashtags — Cliquez pour ajouter
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '.75rem', fontWeight: 600, color: '#666', marginRight: '.25rem' }}>Slow Travel:</span>
                {HASHTAG_PACKS.slowTravel.map(tag => (
                  <button
                    key={tag}
                    onClick={() => appendHashtags([tag])}
                    style={{
                      padding: '.35rem .65rem',
                      border: '1px solid #2D6A4F',
                      borderRadius: '9999px',
                      cursor: 'pointer',
                      fontSize: '.75rem',
                      background: 'transparent',
                      color: '#2D6A4F',
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '.75rem', fontWeight: 600, color: '#666', marginRight: '.25rem' }}>Couple:</span>
                {HASHTAG_PACKS.couple.map(tag => (
                  <button
                    key={tag}
                    onClick={() => appendHashtags([tag])}
                    style={{
                      padding: '.35rem .65rem',
                      border: '1px solid #8B4513',
                      borderRadius: '9999px',
                      cursor: 'pointer',
                      fontSize: '.75rem',
                      background: 'transparent',
                      color: '#8B4513',
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {destination && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', alignItems: 'center' }}>
                  <button
                    onClick={generateDestinationHashtags}
                    style={{
                      padding: '.35rem .75rem',
                      border: '1px solid #E1306C',
                      borderRadius: '9999px',
                      cursor: 'pointer',
                      fontSize: '.75rem',
                      fontWeight: 600,
                      background: 'white',
                      color: '#E1306C',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '.25rem',
                    }}
                  >
                    <Plus size={14} />
                    Destination ({destination})
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}