'use client';

import { useState, useCallback } from 'react';
import {
  Zap, Video, Sparkles, Clock, Download, Check, 
  ChevronRight, Film, Hash, Image, FileVideo,
  Loader2, Trash2, Eye, Copy, ArrowRight
} from 'lucide-react';

// ===== Types =====
export interface ShortClip {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  thumbnail: string;
  caption: string;
  hashtags: string[];
  isSelected: boolean;
  isProcessing: boolean;
  isReady: boolean;
  videoUrl?: string;
}

export interface AutoShortsState {
  videoUrl: string | null;
  videoName: string;
  videoDuration: number;
  clips: ShortClip[];
  isAnalyzing: boolean;
  isGenerating: boolean;
  analysisProgress: number;
  error: string | null;
}

// ===== Constants =====
const CLIP_DURATIONS = [
  { label: '15s', value: 15 },
  { label: '30s', value: 30 },
  { label: '60s', value: 60 },
];

const BRANDED_INTRO = {
  text: 'Heldonica',
  duration: 2,
};

const BRANDED_OUTRO = {
  text: 'Follow @heldonica',
  duration: 2,
};

// ===== Main Component =====
export default function AutoShortsGenerator() {
  const [state, setState] = useState<AutoShortsState>({
    videoUrl: null,
    videoName: '',
    videoDuration: 0,
    clips: [],
    isAnalyzing: false,
    isGenerating: false,
    analysisProgress: 0,
    error: null,
  });

  const [selectedDuration, setSelectedDuration] = useState(30);
  const [numberOfClips, setNumberOfClips] = useState(5);

  // Handle video upload
  const handleVideoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setState(prev => ({
      ...prev,
      videoUrl: url,
      videoName: file.name,
      videoDuration: 180, // Simulated duration
      clips: [],
      error: null,
    }));
  }, []);

  /**
   * Decoupage automatique : non branche.
   *
   * Rien ici n'analysait la video. Une barre de progression tournait pendant
   * trois secondes, puis des extraits etaient tires au hasard dans la duree
   * totale, illustres par des vignettes picsum.photos - des images sans rapport
   * avec le voyage - et legendes avec des phrases ecrites en dur : « Le secret
   * que personne ne vous dit... », « Mon coup de coeur de l'annee ». La suite du
   * traitement et l'export etaient eux aussi des attentes simulees.
   *
   * Ces legendes racontent un vecu qui n'a pas eu lieu, ce que la charte du
   * projet exclut. Plutot que de laisser croire a un outil qui fonctionne, le
   * bouton dit ce qu'il en est.
   */
  const generateShorts = useCallback(async () => {
    setState(prev => ({
      ...prev,
      isAnalyzing: false,
      analysisProgress: 0,
      clips: [],
      error:
        "Le decoupage automatique n'est pas branche : aucune analyse de video " +
        "n'a lieu ici. Utilise « Montage video » pour couper toi-meme tes " +
        "extraits.",
    }));
  }, []);

  // Toggle clip selection
  const toggleClipSelection = useCallback((clipId: string) => {
    setState(prev => ({
      ...prev,
      clips: prev.clips.map(clip =>
        clip.id === clipId ? { ...clip, isSelected: !clip.isSelected } : clip
      ),
    }));
  }, []);

  // Select all clips
  const selectAllClips = useCallback(() => {
    setState(prev => ({
      ...prev,
      clips: prev.clips.map(clip => ({ ...clip, isSelected: true })),
    }));
  }, []);

  // Deselect all clips
  const deselectAllClips = useCallback(() => {
    setState(prev => ({
      ...prev,
      clips: prev.clips.map(clip => ({ ...clip, isSelected: false })),
    }));
  }, []);

  // Delete clip
  const deleteClip = useCallback((clipId: string) => {
    setState(prev => ({
      ...prev,
      clips: prev.clips.filter(clip => clip.id !== clipId),
    }));
  }, []);

  // Generate selected clips
  const processSelectedClips = useCallback(async () => {
    const selectedClips = state.clips.filter(c => c.isSelected);
    
    for (const clip of selectedClips) {
      setState(prev => ({
        ...prev,
        clips: prev.clips.map(c =>
          c.id === clip.id ? { ...c, isProcessing: true } : c
        ),
      }));

      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      setState(prev => ({
        ...prev,
        clips: prev.clips.map(c =>
          c.id === clip.id ? { ...c, isProcessing: false, isReady: true } : c
        ),
      }));
    }
  }, [state.clips]);

  // Export all ready clips as ZIP
  const exportAllClips = useCallback(() => {
    const readyClips = state.clips.filter(c => c.isReady);
    if (readyClips.length === 0) return;

    // In a real implementation, this would create a ZIP file
    alert(`Export de ${readyClips.length} clips prêts !\n\nFonctionnalité ZIP à implémenter avec une library comme JSZip.`);
  }, [state.clips]);

  // Copy caption to clipboard
  const copyCaption = useCallback((clip: ShortClip) => {
    const fullCaption = `${clip.caption}\n\n${clip.hashtags.join(' ')}`;
    navigator.clipboard.writeText(fullCaption);
  }, []);

  const selectedClipsCount = state.clips.filter(c => c.isSelected).length;
  const readyClipsCount = state.clips.filter(c => c.isReady).length;

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
            ⚡ Auto-Shorts IA
          </h1>
          <span style={{
            fontSize: '0.8rem',
            padding: '0.25rem 0.75rem',
            background: '#fef3c7',
            color: '#92400e',
            borderRadius: '9999px',
            fontWeight: 600,
          }}>
            Powered by AI
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {readyClipsCount > 0 && (
            <button
              onClick={exportAllClips}
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
              Exporter ZIP ({readyClipsCount})
            </button>
          )}
          {state.clips.length > 0 && (
            <button
              onClick={processSelectedClips}
              disabled={selectedClipsCount === 0}
              style={{
                padding: '0.5rem 1rem',
                background: selectedClipsCount > 0 ? '#6b2a1a' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: selectedClipsCount > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Zap size={16} />
              Générer ({selectedClipsCount})
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left - Configuration */}
        <div style={{
          width: 320,
          background: '#ffffff',
          borderRight: '1px solid #e0dbd5',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}>
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#302925', marginBottom: '1rem' }}>
              📹 Vidéo source
            </h3>
            {!state.videoUrl ? (
              <label style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                background: '#f8f6f4',
                border: '2px dashed #e0dbd5',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                gap: '0.75rem',
              }}>
                <FileVideo size={32} color="#6b2a1a" />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#6b2a1a' }}>
                  Choisir une vidéo
                </span>
                <span style={{ fontSize: '0.8rem', color: '#888' }}>
                  Vlog, interview, etc.
                </span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  style={{ display: 'none' }}
                />
              </label>
            ) : (
              <div style={{ position: 'relative' }}>
                <video
                  src={state.videoUrl}
                  style={{
                    width: '100%',
                    borderRadius: '0.5rem',
                    aspectRatio: '16/9',
                    objectFit: 'cover',
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '0.5rem',
                  right: '0.5rem',
                  padding: '0.25rem 0.5rem',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                }}>
                  {Math.floor(state.videoDuration / 60)}:{(state.videoDuration % 60).toString().padStart(2, '0')}
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#302925', marginBottom: '0.75rem' }}>
              ⏱️ Durée des shorts
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {CLIP_DURATIONS.map(duration => (
                <button
                  key={duration.value}
                  onClick={() => setSelectedDuration(duration.value)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: selectedDuration === duration.value ? '#6b2a1a' : '#f0e8e4',
                    color: selectedDuration === duration.value ? 'white' : '#6b2a1a',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {duration.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#302925', marginBottom: '0.75rem' }}>
              🔢 Nombre de clips
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input
                type="range"
                min="3"
                max="10"
                value={numberOfClips}
                onChange={(e) => setNumberOfClips(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ 
                minWidth: 30, 
                textAlign: 'center',
                fontWeight: 600,
                color: '#6b2a1a',
              }}>
                {numberOfClips}
              </span>
            </div>
          </div>

          <div style={{ marginTop: 'auto' }}>
            <button
              onClick={generateShorts}
              disabled={!state.videoUrl || state.isAnalyzing}
              style={{
                width: '100%',
                padding: '1rem',
                background: state.videoUrl && !state.isAnalyzing ? '#6b2a1a' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: state.videoUrl && !state.isAnalyzing ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
              }}
            >
              {state.isAnalyzing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Analyse en cours... {state.analysisProgress}%
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Analyser et générer
                </>
              )}
            </button>

            {state.isAnalyzing && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{
                  height: 4,
                  background: '#e0dbd5',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${state.analysisProgress}%`,
                    background: '#6b2a1a',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
                <p style={{ 
                  fontSize: '0.8rem', 
                  color: '#888', 
                  marginTop: '0.5rem',
                  textAlign: 'center',
                }}>
                  Identification des meilleurs moments...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right - Generated Clips */}
        <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
          {state.clips.length === 0 ? (
            <div style={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#888',
            }}>
              <Video size={64} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p style={{ fontSize: '1rem' }}>
                Importez une vidéo et lancez l’analyse
              </p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                L’IA identifiera automatiquement les meilleurs moments
              </p>
            </div>
          ) : (
            <>
              {/* Selection Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#302925' }}>
                  {state.clips.length} shorts générés
                  <span style={{ fontWeight: 400, color: '#888', marginLeft: '0.5rem' }}>
                    ({selectedClipsCount} sélectionnés)
                  </span>
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={selectAllClips}
                    style={{
                      padding: '0.35rem 0.75rem',
                      background: '#e8e4e0',
                      color: '#555',
                      border: 'none',
                      borderRadius: '0.35rem',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    Tout sélectionner
                  </button>
                  <button
                    onClick={deselectAllClips}
                    style={{
                      padding: '0.35rem 0.75rem',
                      background: '#e8e4e0',
                      color: '#555',
                      border: 'none',
                      borderRadius: '0.35rem',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    Tout désélectionner
                  </button>
                </div>
              </div>

              {/* Clips Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1rem',
              }}>
                {state.clips.map(clip => (
                  <div
                    key={clip.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '0.75rem',
                      overflow: 'hidden',
                      border: clip.isSelected ? '2px solid #6b2a1a' : '2px solid transparent',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => toggleClipSelection(clip.id)}
                  >
                    {/* Thumbnail */}
                    <div style={{ position: 'relative', aspectRatio: '9/16' }}>
                      <img
                        src={clip.thumbnail}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      
                      {/* Duration Badge */}
                      <div style={{
                        position: 'absolute',
                        bottom: '0.5rem',
                        right: '0.5rem',
                        padding: '0.2rem 0.5rem',
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}>
                        {clip.duration}s
                      </div>

                      {/* Selection Indicator */}
                      <div style={{
                        position: 'absolute',
                        top: '0.5rem',
                        left: '0.5rem',
                        width: 24,
                        height: 24,
                        background: clip.isSelected ? '#6b2a1a' : 'rgba(255,255,255,0.9)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: clip.isSelected ? 'none' : '2px solid #ccc',
                      }}>
                        {clip.isSelected && <Check size={14} color="white" />}
                      </div>

                      {/* Processing Overlay */}
                      {clip.isProcessing && (
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(0,0,0,0.7)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Loader2 size={32} color="white" className="animate-spin" />
                        </div>
                      )}

                      {/* Ready Badge */}
                      {clip.isReady && (
                        <div style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          padding: '0.25rem 0.5rem',
                          background: '#22c55e',
                          color: 'white',
                          borderRadius: '0.25rem',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                        }}>
                          ✓ Prêt
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ padding: '0.75rem' }}>
                      <p style={{
                        fontSize: '0.85rem',
                        color: '#302925',
                        margin: 0,
                        marginBottom: '0.5rem',
                        lineHeight: 1.4,
                      }}>
                        {clip.caption}
                      </p>
                      
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.25rem',
                        marginBottom: '0.5rem',
                      }}>
                        {clip.hashtags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            style={{
                              fontSize: '0.7rem',
                              color: '#6b2a1a',
                              background: '#f0e8e4',
                              padding: '0.15rem 0.4rem',
                              borderRadius: '0.25rem',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <span style={{ fontSize: '0.75rem', color: '#888' }}>
                          {clip.startTime}s → {clip.endTime}s
                        </span>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyCaption(clip);
                            }}
                            style={{
                              padding: '0.25rem',
                              background: '#e8e4e0',
                              border: 'none',
                              borderRadius: '0.25rem',
                              cursor: 'pointer',
                            }}
                            title="Copier la caption"
                          >
                            <Copy size={14} color="#555" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteClip(clip.id);
                            }}
                            style={{
                              padding: '0.25rem',
                              background: '#fee2e2',
                              border: 'none',
                              borderRadius: '0.25rem',
                              cursor: 'pointer',
                            }}
                            title="Supprimer"
                          >
                            <Trash2 size={14} color="#dc2626" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Branded Intro/Outro */}
                    <div style={{
                      padding: '0.5rem 0.75rem',
                      background: '#f8f6f4',
                      borderTop: '1px solid #e0dbd5',
                      fontSize: '0.7rem',
                      color: '#888',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}>
                      <span>+{BRANDED_INTRO.duration}s intro</span>
                      <span>+{BRANDED_OUTRO.duration}s outro</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}