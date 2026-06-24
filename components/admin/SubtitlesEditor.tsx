'use client';

import { useState, useCallback, useRef } from 'react';
import { 
  Subtitles, Sparkles, Download, Play, Pause, Edit3, 
  Trash2, Plus, Clock, FileAudio, Wand2, RefreshCw, Check,
  X, AlertCircle, Type
} from 'lucide-react';

// ===== Types =====
export interface Subtitle {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  isEdited: boolean;
  isCorrected: boolean;
}

export interface VideoSubtitlesState {
  videoUrl: string | null;
  videoName: string;
  subtitles: Subtitle[];
  isGenerating: boolean;
  isTranscribing: boolean;
  generationProgress: number;
  error: string | null;
}

// ===== Brand Voice Replacements =====
const VOCABULARY_CORRECTIONS: Record<string, string> = {
  'bon plan': 'pépite dénichée',
  'bon plans': 'pépites dénichées',
  'bonnes adresses': 'pépites',
  'top': 'incontournable',
  'tips': 'astuces',
  'check': 'checklist',
  'reco': 'recommandation',
  'mastoc': 'impressionnant',
  'kiff': 'coup de cœur',
  'dégueu': 'peu ragoutant',
  'ouffff': 'incroyable',
  'waow': 'splendide',
  'trop bien': 'formidable',
  'mega': 'extrêmement',
  'super': 'remarquable',
};

// ===== Main Component =====
export default function SubtitlesEditor() {
  const [state, setState] = useState<VideoSubtitlesState>({
    videoUrl: null,
    videoName: '',
    subtitles: [],
    isGenerating: false,
    isTranscribing: false,
    generationProgress: 0,
    error: null,
  });
  
  const [editingSubtitle, setEditingSubtitle] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editStart, setEditStart] = useState(0);
  const [editEnd, setEditEnd] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle video upload
  const handleVideoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setState(prev => ({
      ...prev,
      videoUrl: url,
      videoName: file.name,
      subtitles: [],
      error: null,
    }));
  }, []);

  // Apply brand voice corrections
  const applyBrandCorrections = useCallback((text: string): string => {
    let corrected = text;
    Object.entries(VOCABULARY_CORRECTIONS).forEach(([original, replacement]) => {
      const regex = new RegExp(`\\b${original}\\b`, 'gi');
      corrected = corrected.replace(regex, replacement);
    });
    return corrected;
  }, []);

  // Generate subtitles using Whisper API simulation
  const generateSubtitles = useCallback(async () => {
    if (!state.videoUrl) return;

    setState(prev => ({ ...prev, isTranscribing: true, error: null }));

    try {
      // Simulate API call to Whisper
      // In production, this would call your Whisper API endpoint
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate sample subtitles
      const sampleSubtitles: Subtitle[] = [
        { id: '1', startTime: 0, endTime: 3.5, text: 'Bienvenue dans cette aventure', isEdited: false, isCorrected: false },
        { id: '2', startTime: 3.5, endTime: 7.2, text: 'au cœur du Portugal', isEdited: false, isCorrected: false },
        { id: '3', startTime: 7.2, endTime: 11.0, text: 'avec Heldonica', isEdited: false, isCorrected: false },
        { id: '4', startTime: 11.0, endTime: 15.5, text: 'on partage nos pépites dénichées', isEdited: false, isCorrected: false },
        { id: '5', startTime: 15.5, endTime: 20.0, text: 'et mes bonnes adresses', isEdited: false, isCorrected: false },
        { id: '6', startTime: 20.0, endTime: 25.0, text: 'cette destination est vraiment top', isEdited: false, isCorrected: false },
      ];

      // Apply brand corrections
      const correctedSubtitles = sampleSubtitles.map(sub => ({
        ...sub,
        text: applyBrandCorrections(sub.text),
        isCorrected: sub.text !== applyBrandCorrections(sub.text),
      }));

      setState(prev => ({
        ...prev,
        subtitles: correctedSubtitles,
        isTranscribing: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isTranscribing: false,
        error: 'Erreur lors de la génération des sous-titres',
      }));
    }
  }, [state.videoUrl, applyBrandCorrections]);

  // Apply corrections to all subtitles
  const applyAllCorrections = useCallback(() => {
    setState(prev => ({
      ...prev,
      subtitles: prev.subtitles.map(sub => ({
        ...sub,
        text: applyBrandCorrections(sub.text),
        isCorrected: true,
      })),
    }));
  }, [applyBrandCorrections]);

  // Edit subtitle
  const startEditing = useCallback((subtitle: Subtitle) => {
    setEditingSubtitle(subtitle.id);
    setEditText(subtitle.text);
    setEditStart(subtitle.startTime);
    setEditEnd(subtitle.endTime);
  }, []);

  // Save edited subtitle
  const saveEdit = useCallback(() => {
    if (!editingSubtitle) return;

    setState(prev => ({
      ...prev,
      subtitles: prev.subtitles.map(sub =>
        sub.id === editingSubtitle
          ? { ...sub, text: editText, startTime: editStart, endTime: editEnd, isEdited: true }
          : sub
      ),
    }));

    setEditingSubtitle(null);
    setEditText('');
  }, [editingSubtitle, editText, editStart, editEnd]);

  // Delete subtitle
  const deleteSubtitle = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      subtitles: prev.subtitles.filter(sub => sub.id !== id),
    }));
  }, []);

  // Add new subtitle
  const addSubtitle = useCallback(() => {
    const newSubtitle: Subtitle = {
      id: `sub-${Date.now()}`,
      startTime: state.subtitles.length > 0 
        ? state.subtitles[state.subtitles.length - 1].endTime 
        : 0,
      endTime: state.subtitles.length > 0 
        ? state.subtitles[state.subtitles.length - 1].endTime + 3 
        : 3,
      text: 'Nouveau texte',
      isEdited: true,
      isCorrected: false,
    };

    setState(prev => ({
      ...prev,
      subtitles: [...prev.subtitles, newSubtitle],
    }));

    startEditing(newSubtitle);
  }, [state.subtitles, startEditing]);

  // Export as SRT
  const exportSRT = useCallback(() => {
    const srtContent = state.subtitles
      .map((sub, index) => {
        const startTime = formatSRTTime(sub.startTime);
        const endTime = formatSRTTime(sub.endTime);
        return `${index + 1}\n${startTime} --> ${endTime}\n${sub.text}`;
      })
      .join('\n\n');

    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.videoName.replace(/\.[^/.]+$/, '')}_subtitles.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state.subtitles, state.videoName]);

  // Format time for SRT
  const formatSRTTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  };

  // Format time display
  const formatTimeDisplay = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: 'calc(100vh - 80px)', 
      background: '#f5f3ef' 
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.5rem',
        background: '#ffffff',
        borderBottom: '1px solid #e0dbd5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#6b2a1a', margin: 0 }}>
            💬 Sous-titres IA
          </h1>
          <span style={{
            fontSize: '0.8rem',
            padding: '0.25rem 0.75rem',
            background: '#e8f5f0',
            color: '#059669',
            borderRadius: '9999px',
            fontWeight: 600,
          }}>
            Powered by Whisper
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {state.subtitles.length > 0 && (
            <>
              <button
                onClick={applyAllCorrections}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#fef3c7',
                  color: '#92400e',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Wand2 size={16} />
                Corriger le vocabulaire
              </button>
              <button
                onClick={exportSRT}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#83C5BE',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Download size={16} />
                Exporter .SRT
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left - Video Preview */}
        <div style={{
          flex: 1,
          background: '#1a1a1a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          {!state.videoUrl ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <FileAudio size={64} style={{ opacity: 0.3, marginBottom: '1rem', color: 'white' }} />
              <p style={{ color: '#888', marginBottom: '1.5rem' }}>Importez une vidéo pour commencer</p>
              <label style={{
                padding: '0.75rem 1.5rem',
                background: '#6b2a1a',
                color: 'white',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  style={{ display: 'none' }}
                />
                Choisir une vidéo
              </label>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                src={state.videoUrl}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  borderRadius: '0.5rem',
                }}
              />
              
              {/* Subtitle Overlay Preview */}
              <div style={{
                position: 'absolute',
                bottom: '15%',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.7)',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                maxWidth: '80%',
                textAlign: 'center',
              }}>
                <span style={{
                  color: 'white',
                  fontSize: '1.25rem',
                  fontFamily: 'Inter, sans-serif',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                }}>
                  {state.subtitles.length > 0 ? state.subtitles[0].text : 'Aucun sous-titre'}
                </span>
              </div>

              <div style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                borderRadius: '0.5rem',
                fontFamily: 'monospace',
              }}>
                {state.videoName}
              </div>
            </>
          )}
        </div>

        {/* Right - Subtitles List */}
        <div style={{
          width: 400,
          background: '#ffffff',
          borderLeft: '1px solid #e0dbd5',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Actions Bar */}
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid #e0dbd5',
            display: 'flex',
            gap: '0.5rem',
          }}>
            <label style={{
              flex: 1,
              padding: '0.5rem',
              background: '#f0e8e4',
              color: '#6b2a1a',
              border: '2px dashed #e0dbd5',
              borderRadius: '0.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                style={{ display: 'none' }}
              />
              📁 Changer vidéo
            </label>
            
            <button
              onClick={generateSubtitles}
              disabled={!state.videoUrl || state.isTranscribing}
              style={{
                flex: 1,
                padding: '0.5rem',
                background: state.videoUrl && !state.isTranscribing ? '#6b2a1a' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: state.videoUrl && !state.isTranscribing ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              {state.isTranscribing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Générer
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {state.error && (
            <div style={{
              padding: '0.75rem 1rem',
              background: '#fef2f2',
              color: '#dc2626',
              borderBottom: '1px solid #fecaca',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
            }}>
              <AlertCircle size={16} />
              {state.error}
            </div>
          )}

          {/* Subtitles List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
            {state.subtitles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                <Type size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p style={{ fontSize: '0.9rem' }}>
                  {state.videoUrl 
                    ? 'Cliquez sur "Générer" pour créer des sous-titres automatiquement'
                    : 'Importez d\'abord une vidéo'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {state.subtitles.map((sub, index) => (
                  <div
                    key={sub.id}
                    style={{
                      background: editingSubtitle === sub.id ? '#f0fdf4' : '#f8f6f4',
                      borderRadius: '0.75rem',
                      padding: '1rem',
                      border: editingSubtitle === sub.id ? '2px solid #22c55e' : '1px solid #e0dbd5',
                    }}
                  >
                    {editingSubtitle === sub.id ? (
                      // Edit Mode
                      <div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <input
                            type="number"
                            value={editStart}
                            onChange={(e) => setEditStart(Number(e.target.value))}
                            style={{
                              width: 70,
                              padding: '0.35rem',
                              border: '1px solid #e0dbd5',
                              borderRadius: '0.35rem',
                              fontSize: '0.8rem',
                            }}
                            step="0.1"
                          />
                          <span style={{ color: '#888', lineHeight: '1.8' }}>→</span>
                          <input
                            type="number"
                            value={editEnd}
                            onChange={(e) => setEditEnd(Number(e.target.value))}
                            style={{
                              width: 70,
                              padding: '0.35rem',
                              border: '1px solid #e0dbd5',
                              borderRadius: '0.35rem',
                              fontSize: '0.8rem',
                            }}
                            step="0.1"
                          />
                          <span style={{ color: '#888', fontSize: '0.75rem', marginLeft: 'auto' }}>
                            #{index + 1}
                          </span>
                        </div>
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          style={{
                            width: '100%',
                            minHeight: 60,
                            padding: '0.5rem',
                            border: '1px solid #e0dbd5',
                            borderRadius: '0.35rem',
                            fontSize: '0.9rem',
                            resize: 'vertical',
                          }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setEditingSubtitle(null)}
                            style={{
                              padding: '0.35rem 0.75rem',
                              background: '#e5e5e5',
                              color: '#555',
                              border: 'none',
                              borderRadius: '0.35rem',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                            }}
                          >
                            <X size={14} />
                          </button>
                          <button
                            onClick={saveEdit}
                            style={{
                              padding: '0.35rem 0.75rem',
                              background: '#22c55e',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.35rem',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <Check size={14} /> Enregistrer
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <Clock size={14} color="#888" />
                          <span style={{ fontSize: '0.8rem', color: '#888' }}>
                            {formatTimeDisplay(sub.startTime)} → {formatTimeDisplay(sub.endTime)}
                          </span>
                          <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#888' }}>
                            #{index + 1}
                          </span>
                          {sub.isCorrected && (
                            <span style={{
                              fontSize: '0.65rem',
                              padding: '0.15rem 0.4rem',
                              background: '#dcfce7',
                              color: '#166534',
                              borderRadius: '9999px',
                            }}>
                              ✨ corrigé
                            </span>
                          )}
                          {sub.isEdited && (
                            <span style={{
                              fontSize: '0.65rem',
                              padding: '0.15rem 0.4rem',
                              background: '#dbeafe',
                              color: '#1e40af',
                              borderRadius: '9999px',
                            }}>
                              modifié
                            </span>
                          )}
                        </div>
                        <p style={{ 
                          margin: 0, 
                          fontSize: '0.95rem', 
                          color: '#302925',
                          lineHeight: 1.5,
                        }}>
                          {sub.text}
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => startEditing(sub)}
                            style={{
                              padding: '0.35rem 0.5rem',
                              background: '#e8e4e0',
                              color: '#555',
                              border: 'none',
                              borderRadius: '0.35rem',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <Edit3 size={12} /> Modifier
                          </button>
                          <button
                            onClick={() => deleteSubtitle(sub.id)}
                            style={{
                              padding: '0.35rem 0.5rem',
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              borderRadius: '0.35rem',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Subtitle Button */}
          {state.subtitles.length > 0 && (
            <div style={{
              padding: '1rem',
              borderTop: '1px solid #e0dbd5',
            }}>
              <button
                onClick={addSubtitle}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#f0e8e4',
                  color: '#6b2a1a',
                  border: '2px dashed #d4c4b8',
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <Plus size={18} />
                Ajouter un sous-titre
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Vocab Corrections Info */}
      {state.subtitles.some(s => s.isCorrected) && (
        <div style={{
          padding: '0.75rem 1.5rem',
          background: '#fef3c7',
          borderTop: '1px solid #fcd34d',
          fontSize: '0.85rem',
          color: '#92400e',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <Wand2 size={16} />
          <strong>Corrections appliquées :</strong>
          {Object.entries(VOCABULARY_CORRECTIONS).slice(0, 3).map(([original, replacement]) => (
            <span key={original} style={{ background: '#fff', padding: '0.15rem 0.5rem', borderRadius: '0.25rem', marginLeft: '0.25rem' }}>
              "{original}" → "{replacement}"
            </span>
          ))}
          {Object.keys(VOCABULARY_CORRECTIONS).length > 3 && (
            <span>+{Object.keys(VOCABULARY_CORRECTIONS).length - 3} autres</span>
          )}
        </div>
      )}
    </div>
  );
}