'use client';

import { useState } from 'react';
import { FORBIDDEN_WORDS, HELDONICA_ACCROCHES } from '@/lib/brand-voice';


interface BlogGeneratorProps {
  onGenerated?: (data: { title: string; excerpt: string; content: string; hashtags: string[]; suggestedSlug: string }) => void;
}

export default function BlogGenerator({ onGenerated }: BlogGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [destination, setDestination] = useState('');
  const [notes, setNotes] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [tone, setTone] = useState<'informatif' | 'intimiste' | 'humoristique' | 'expert'>('informatif');
  const [language, setLanguage] = useState<'FR' | 'EN'>('FR');
  const [style, setStyle] = useState<'story' | 'guide' | 'list' | 'review'>('story');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [voiceCheck, setVoiceCheck] = useState<{ forbidden: string[]; score: number } | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    setError('');
    setResult(null);
    
    try {
      const response = await fetch('/api/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, destination, notes, seoKeywords, tone, language, style, length }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(data);
        setVoiceCheck(data.voiceCheck || null);
        onGenerated?.(data);
      } else {
        setError(data.error || 'Erreur de génération');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseContent = () => {
    if (result) {
      onGenerated?.(result);
    }
  };

  return (
    <div style={{ background: '#faf8f5', borderRadius: '1rem', padding: '1.5rem', border: '1.5px solid #e8e3dc' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '1rem', margin: '0 0 1rem' }}>
        ✨ Générateur d’articles Blog
      </h3>
      
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontWeight: 600, fontSize: '.85rem', color: '#555', marginBottom: '.35rem' }}>
          Sujet du voyage *
        </label>
        <input
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="Ex: Pépite dénichée à Funchal, Levada hors des sentiers battus..."
          style={{ width: '100%', padding: '.65rem .9rem', border: '1.5px solid #e0dbd5', borderRadius: '.5rem', fontSize: '.88rem', background: '#fff' }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem', marginTop: '.4rem' }}>
          {HELDONICA_ACCROCHES.slice(0, 3).map((a, i) => (
            <button key={i} onClick={() => setNotes(prev => prev ? prev : a)}
              style={{ fontSize: '.72rem', padding: '.2rem .5rem', borderRadius: '9999px', background: '#f0e8e4', color: '#6b2a1a', border: 'none', cursor: 'pointer' }}>
              ✨ {a.slice(0, 30)}…
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontWeight: 600, fontSize: '.85rem', color: '#555', marginBottom: '.35rem' }}>
          Anecdote personnelle à intégrer <span style={{ color: '#01696f', fontSize: '.78rem' }}>(✨ améliore la voix)</span>
        </label>
        <input
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Ex: On était seuls ce matin-là, la brume descendait sur les nuages…"
          style={{ width: '100%', padding: '.65rem .9rem', border: '1.5px solid #e0dbd5', borderRadius: '.5rem', fontSize: '.88rem', background: '#fff' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '.85rem', color: '#555', marginBottom: '.35rem' }}>Style</label>
          <select
            value={tone}
            onChange={e => setTone(e.target.value as any)}
            style={{ width: '100%', padding: '.65rem .9rem', border: '1.5px solid #e0dbd5', borderRadius: '.5rem', fontSize: '.88rem', background: '#fff' }}
          >
            <option value="informatif">📚 Informatif</option>
            <option value="intimiste">💜 Intimiste</option>
            <option value="humoristique">😄 Humoristique</option>
            <option value="expert">🎯 Expert</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '.85rem', color: '#555', marginBottom: '.35rem' }}>Langue</label>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value as any)}
            style={{ width: '100%', padding: '.65rem .9rem', border: '1.5px solid #e0dbd5', borderRadius: '.5rem', fontSize: '.88rem', background: '#fff' }}
          >
            <option value="FR">🇫🇷 Français</option>
            <option value="EN">🇬🇧 English</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '.85rem', color: '#555', marginBottom: '.35rem' }}>Style</label>
          <select
            value={style}
            onChange={e => setStyle(e.target.value as any)}
            style={{ width: '100%', padding: '.65rem .9rem', border: '1.5px solid #e0dbd5', borderRadius: '.5rem', fontSize: '.88rem', background: '#fff' }}
          >
            <option value="story">📖 Histoire / Récit</option>
            <option value="guide">📋 Guide pratique</option>
            <option value="list">📝 Liste de tips</option>
            <option value="review">⭐ Avis / Retour</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '.85rem', color: '#555', marginBottom: '.35rem' }}>Longueur</label>
          <select
            value={length}
            onChange={e => setLength(e.target.value as any)}
            style={{ width: '100%', padding: '.65rem .9rem', border: '1.5px solid #e0dbd5', borderRadius: '.5rem', fontSize: '.88rem', background: '#fff' }}
          >
            <option value="short"> court (200-300 mots)</option>
            <option value="medium">✓ Moyen (400-600 mots)</option>
            <option value="long"> long (800-1000 mots)</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontWeight: 600, fontSize: '.85rem', color: '#555', marginBottom: '.35rem' }}>
          Mots-clés SEO
        </label>
        <input
          value={seoKeywords}
          onChange={e => setSeoKeywords(e.target.value)}
          placeholder="Ex: hotel boutique paris, voyageitalie, randonnneeeurope..."
          style={{ width: '100%', padding: '.65rem .9rem', border: '1.5px solid #e0dbd5', borderRadius: '.5rem', fontSize: '.88rem', background: '#fff' }}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating || !topic.trim()}
        style={{
          width: '100%', padding: '.75rem',
          background: isGenerating ? '#ccc' : '#01696f',
          color: 'white', border: 'none', borderRadius: '.5rem',
          cursor: isGenerating ? 'wait' : 'pointer',
          fontSize: '.9rem', fontWeight: 600,
          marginBottom: '1rem',
        }}
      >
        {isGenerating ? '⏳ Génération en cours...' : '✨ Générer mon article'}
      </button>

      {error && (
        <div style={{ background: '#fdecea', color: '#c0392b', padding: '.75rem', borderRadius: '.5rem', fontSize: '.85rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ background: '#fff', borderRadius: '.75rem', padding: '1rem', border: '1.5px solid #e8e3dc', maxHeight: 300, overflow: 'auto' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', margin: '0 0 .5rem' }}>{result.title}</h4>
          <p style={{ fontSize: '.85rem', color: '#666', marginBottom: '.75rem', fontStyle: 'italic' }}>{result.excerpt}</p>
          <div style={{ fontSize: '.8rem', color: '#888', whiteSpace: 'pre-wrap', marginBottom: '.75rem' }}>
            {result.content?.slice(0, 500)}...
          </div>
          {result.hashtags?.length > 0 && (
            <div style={{ fontSize: '.75rem', color: '#6b2a1a' }}>
              {result.hashtags.slice(0, 8).join(' ')}
            </div>
          )}

          {/* Voice check badge */}
          {voiceCheck && (
            <div style={{ marginTop: '.75rem', padding: '.6rem .9rem', borderRadius: '.5rem', background: voiceCheck.forbidden.length === 0 ? '#d1fae5' : '#fef3c7', border: `1px solid ${voiceCheck.forbidden.length === 0 ? '#6ee7b7' : '#fbbf24'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: voiceCheck.forbidden.length > 0 ? '.4rem' : 0 }}>
                <span style={{ fontSize: '.78rem', fontWeight: 700, color: voiceCheck.forbidden.length === 0 ? '#065f46' : '#92400e' }}>
                  {voiceCheck.forbidden.length === 0 ? '✨ Voix Heldonica ✓' : `⚠️ ${voiceCheck.forbidden.length} mot(s) à corriger`}
                </span>
                <span style={{ fontSize: '.72rem', fontWeight: 600, color: voiceCheck.score >= 80 ? '#065f46' : voiceCheck.score >= 60 ? '#92400e' : '#991b1b' }}>
                  Score : {voiceCheck.score}/100
                </span>
              </div>
              {voiceCheck.forbidden.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem' }}>
                  {voiceCheck.forbidden.map(w => (
                    <span key={w} style={{ fontSize: '.72rem', padding: '.15rem .45rem', borderRadius: '9999px', background: '#fee2e2', color: '#991b1b', fontWeight: 600 }}>
                      ❌ {w}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleUseContent}
            style={{
              width: '100%', marginTop: '1rem', padding: '.5rem',
              background: '#6b2a1a', color: 'white', border: 'none', borderRadius: '.4rem',
              cursor: 'pointer', fontSize: '.85rem', fontWeight: 600,
            }}
          >
            📥 Utiliser cet article
          </button>
        </div>
      )}
    </div>
  );
}