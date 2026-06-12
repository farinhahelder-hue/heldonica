'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Film, Music, Type, Download, Play, Pause, Volume2,
  Plus, Trash2, Sun, Contrast, Droplet, ZoomIn, ZoomOut,
  RotateCcw, ChevronLeft, ChevronRight, Layers, Image as ImageIcon,
  Undo2, Redo2
} from 'lucide-react';

// ===== Types =====
export interface MediaClip {
  id: string;
  type: 'video' | 'audio' | 'image';
  name: string;
  url: string;
  duration?: number;
  thumbnail?: string;
}

export interface TimelineClip {
  id: string;
  mediaId: string;
  trackIndex: number;
  startTime: number;
  duration: number;
  trimStart: number;
  trimEnd: number;
  volume: number;
  fadeIn: number;
  fadeOut: number;
  text?: TextOverlay;
  effects: {
    brightness: number;
    contrast: number;
    saturation: number;
  };
}

export interface TextOverlay {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor: string;
  position: { x: number; y: number };
  animation: 'none' | 'fade' | 'slide-up' | 'typewriter';
  keyframes: Keyframe[];
}

export interface Keyframe {
  time: number;
  properties: {
    x?: number;
    y?: number;
    scale?: number;
    opacity?: number;
    rotation?: number;
  };
}

export interface ExportFormat {
  id: string;
  label: string;
  width: number;
  height: number;
  aspectRatio: string;
}

// ===== Constants =====
const EXPORT_FORMATS: ExportFormat[] = [
  { id: 'reels', label: 'Instagram Reels', width: 1080, height: 1920, aspectRatio: '9:16' },
  { id: 'square', label: 'Feed Carré', width: 1080, height: 1080, aspectRatio: '1:1' },
  { id: 'landscape', label: 'Feed Paysage', width: 1080, height: 566, aspectRatio: '16:9' },
  { id: 'story', label: 'Story', width: 1080, height: 1920, aspectRatio: '9:16' },
];

const COLORS = {
  primary: '#6b2a1a',
  secondary: '#83C5BE',
  background: '#f5f3ef',
  surface: '#ffffff',
  border: '#e0dbd5',
  text: '#302925',
  textMuted: '#6d625a',
  trackVideo: '#e8d4c8',
  trackAudio: '#c8e0d8',
  trackText: '#d4c8e8',
};

// ===== Main Component =====
export default function VideoEditor() {
  const [mediaClips, setMediaClips] = useState<MediaClip[]>([]);
  const [timelineClips, setTimelineClips] = useState<TimelineClip[]>([]);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(50);
  const [exportFormat, setExportFormat] = useState<ExportFormat>(EXPORT_FORMATS[0]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalDuration = Math.max(
    30,
    ...timelineClips.map(c => c.startTime + c.duration)
  );

  useEffect(() => {
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.033;
        });
      }, 33);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, totalDuration]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('video/') ? 'video'
        : file.type.startsWith('audio/') ? 'audio'
        : 'image';
      
      const mediaClip: MediaClip = {
        id: `media-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type,
        name: file.name,
        url,
        duration: type === 'video' ? 10 : type === 'audio' ? 60 : 5,
      };

      setMediaClips(prev => [...prev, mediaClip]);
    });
  }, []);

  const addToTimeline = useCallback((media: MediaClip, trackIndex: number) => {
    const newClip: TimelineClip = {
      id: `clip-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      mediaId: media.id,
      trackIndex,
      startTime: currentTime,
      duration: media.duration || 5,
      trimStart: 0,
      trimEnd: 0,
      volume: 100,
      fadeIn: 0,
      fadeOut: 0,
      effects: { brightness: 100, contrast: 100, saturation: 100 },
    };
    setTimelineClips(prev => [...prev, newClip]);
  }, [currentTime]);

  const updateClip = useCallback((clipId: string, updates: Partial<TimelineClip>) => {
    setTimelineClips(prev => prev.map(c => 
      c.id === clipId ? { ...c, ...updates } : c
    ));
  }, []);

  const deleteClip = useCallback((clipId: string) => {
    setTimelineClips(prev => prev.filter(c => c.id !== clipId));
    if (selectedClipId === clipId) setSelectedClipId(null);
  }, [selectedClipId]);

  const addTextOverlay = useCallback((clipId: string) => {
    const textOverlay: TextOverlay = {
      text: 'Nouveau texte',
      fontSize: 48,
      fontFamily: 'Inter',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.5)',
      position: { x: 50, y: 80 },
      animation: 'fade',
      keyframes: [],
    };
    updateClip(clipId, { text: textOverlay });
  }, [updateClip]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const selectedClip = timelineClips.find(c => c.id === selectedClipId);

  const handleExport = async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert(`Export terminé ! Format: ${exportFormat.label} (${exportFormat.width}x${exportFormat.height})`);
    setIsExporting(false);
    setShowExportModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', background: COLORS.background }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.5rem',
        background: COLORS.surface,
        borderBottom: `1px solid ${COLORS.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: COLORS.primary, margin: 0 }}>
            🎬 Éditeur Vidéo
          </h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button style={buttonStyle('#6b2a1a')} title="Annuler">
              <Undo2 size={18} />
            </button>
            <button style={buttonStyle('#6b2a1a')} title="Rétablir">
              <Redo2 size={18} />
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <select
            value={exportFormat.id}
            onChange={(e) => setExportFormat(EXPORT_FORMATS.find(f => f.id === e.target.value) || EXPORT_FORMATS[0])}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: `1px solid ${COLORS.border}`,
              background: COLORS.surface,
              fontSize: '0.9rem',
            }}
          >
            {EXPORT_FORMATS.map(fmt => (
              <option key={fmt.id} value={fmt.id}>{fmt.label} ({fmt.aspectRatio})</option>
            ))}
          </select>
          
          <button
            onClick={() => setShowExportModal(true)}
            style={{ ...buttonStyle(COLORS.secondary), display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Download size={18} />
            Exporter
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar - Media Library */}
        <div style={{
          width: 280,
          background: COLORS.surface,
          borderRight: `1px solid ${COLORS.border}`,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ padding: '1rem', borderBottom: `1px solid ${COLORS.border}` }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.text, margin: '0 0 0.75rem 0' }}>
              📁 Médiathèque
            </h3>
            <label style={uploadButtonStyle}>
              <Plus size={18} />
              Ajouter des fichiers
              <input
                type="file"
                multiple
                accept="video/*,audio/*,image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
            {mediaClips.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: COLORS.textMuted }}>
                <ImageIcon size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p style={{ fontSize: '0.85rem' }}>Glissez-déposez vos médias ici</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {mediaClips.map(media => (
                  <div
                    key={media.id}
                    style={{
                      background: '#f8f6f4',
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      cursor: 'grab',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      {media.type === 'video' && <Film size={16} color={COLORS.primary} />}
                      {media.type === 'audio' && <Music size={16} color="#9333ea" />}
                      {media.type === 'image' && <ImageIcon size={16} color="#2563eb" />}
                      <span style={{ fontSize: '0.8rem', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {media.name}
                      </span>
                    </div>
                    {media.thumbnail && (
                      <img src={media.thumbnail} alt="" style={{ width: '100%', height: 60, objectFit: 'cover', borderRadius: '0.25rem' }} />
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button
                        onClick={() => addToTimeline(media, 0)}
                        style={{ ...smallButtonStyle, flex: 1 }}
                        title="Ajouter sur piste vidéo"
                      >
                        <Film size={14} /> Vidéo
                      </button>
                      <button
                        onClick={() => addToTimeline(media, 1)}
                        style={{ ...smallButtonStyle, flex: 1, background: '#e8e0f0', color: '#6b21a8' }}
                        title="Ajouter sur piste audio"
                      >
                        <Music size={14} /> Audio
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center - Preview & Tools */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Video Preview */}
          <div style={{
            flex: 1,
            background: '#1a1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
            <div style={{
              width: exportFormat.aspectRatio === '16:9' ? '80%' : exportFormat.aspectRatio === '1:1' ? '50vh' : '33vh',
              aspectRatio: `${exportFormat.width}/${exportFormat.height}`,
              background: '#2a2a2a',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {selectedClip && (
                <div style={{ textAlign: 'center' }}>
                  <Film size={64} style={{ opacity: 0.3 }} />
                  {selectedClip.text && (
                    <div style={{
                      position: 'absolute',
                      bottom: '20%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      padding: '0.5rem 1rem',
                      background: selectedClip.text.backgroundColor,
                      borderRadius: '0.25rem',
                      color: selectedClip.text.color,
                      fontSize: selectedClip.text.fontSize * 0.5,
                    }}>
                      {selectedClip.text.text}
                    </div>
                  )}
                </div>
              )}
              {!selectedClip && (
                <span style={{ fontSize: '0.9rem' }}>Sélectionnez un clip pour prévisualiser</span>
              )}
            </div>

            <div style={{
              position: 'absolute',
              bottom: '1rem',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontFamily: 'monospace',
              fontSize: '1rem',
            }}>
              {formatTime(currentTime)} / {formatTime(totalDuration)}
            </div>
          </div>

          {/* Playback Controls */}
          <div style={{
            padding: '1rem',
            background: COLORS.surface,
            borderTop: `1px solid ${COLORS.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
          }}>
            <button onClick={() => setCurrentTime(0)} style={iconButtonStyle} title="Retour au début">
              <RotateCcw size={20} />
            </button>
            <button onClick={() => setCurrentTime(Math.max(0, currentTime - 5))} style={iconButtonStyle} title="5s en arrière">
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{ ...iconButtonStyle, width: 56, height: 56, background: COLORS.primary, color: 'white', borderRadius: '50%' }}
              title={isPlaying ? 'Pause' : 'Lecture'}
            >
              {isPlaying ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: 4 }} />}
            </button>
            <button onClick={() => setCurrentTime(Math.min(totalDuration, currentTime + 5))} style={iconButtonStyle} title="5s en avant">
              <ChevronRight size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
              <button onClick={() => setZoom(z => Math.max(10, z - 10))} style={iconButtonStyle} title="Zoom -">
                <ZoomOut size={18} />
              </button>
              <span style={{ fontSize: '0.8rem', color: COLORS.textMuted, minWidth: 40, textAlign: 'center' }}>{zoom}%</span>
              <button onClick={() => setZoom(z => Math.min(200, z + 10))} style={iconButtonStyle} title="Zoom +">
                <ZoomIn size={18} />
              </button>
            </div>
          </div>

          {/* Properties Panel */}
          {selectedClip && (
            <div style={{
              padding: '1rem',
              background: '#f8f6f4',
              borderTop: `1px solid ${COLORS.border}`,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'flex-start',
            }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={labelStyle}>Volume</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Volume2 size={16} />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedClip.volume}
                    onChange={(e) => updateClip(selectedClip.id, { volume: Number(e.target.value) })}
                    style={{ flex: 1 }}
                  />
                  <span style={{ fontSize: '0.8rem', minWidth: 35 }}>{selectedClip.volume}%</span>
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={labelStyle}>Luminosité</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sun size={16} />
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={selectedClip.effects.brightness}
                    onChange={(e) => updateClip(selectedClip.id, {
                      effects: { ...selectedClip.effects, brightness: Number(e.target.value) }
                    })}
                    style={{ flex: 1 }}
                  />
                  <span style={{ fontSize: '0.8rem', minWidth: 40 }}>{selectedClip.effects.brightness}%</span>
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={labelStyle}>Contraste</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Contrast size={16} />
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={selectedClip.effects.contrast}
                    onChange={(e) => updateClip(selectedClip.id, {
                      effects: { ...selectedClip.effects, contrast: Number(e.target.value) }
                    })}
                    style={{ flex: 1 }}
                  />
                  <span style={{ fontSize: '0.8rem', minWidth: 40 }}>{selectedClip.effects.contrast}%</span>
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={labelStyle}>Saturation</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Droplet size={16} />
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={selectedClip.effects.saturation}
                    onChange={(e) => updateClip(selectedClip.id, {
                      effects: { ...selectedClip.effects, saturation: Number(e.target.value) }
                    })}
                    style={{ flex: 1 }}
                  />
                  <span style={{ fontSize: '0.8rem', minWidth: 40 }}>{selectedClip.effects.saturation}%</span>
                </div>
              </div>

              <button
                onClick={() => addTextOverlay(selectedClip.id)}
                style={{ ...buttonStyle(COLORS.primary), display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Type size={16} />
                Ajouter texte
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div style={{
        background: COLORS.surface,
        borderTop: `1px solid ${COLORS.border}`,
        height: 200,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          padding: '0.5rem 1rem',
          borderBottom: `1px solid ${COLORS.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8f6f4',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Layers size={18} color={COLORS.primary} />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Timeline</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button style={smallButtonStyle} title="Ajouter piste">
              <Plus size={14} /> Piste
            </button>
            <button style={smallButtonStyle} title="Supprimer clip" onClick={() => selectedClipId && deleteClip(selectedClipId)} disabled={!selectedClipId}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto' }}>
          <div style={{ minWidth: totalDuration * (zoom / 10), padding: '0.5rem' }}>
            {/* Time Ruler */}
            <div style={{ display: 'flex', marginLeft: 100, marginBottom: '0.25rem', position: 'relative', height: 20 }}>
              {Array.from({ length: Math.ceil(totalDuration) + 1 }).map((_, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  left: i * (zoom / 10),
                  fontSize: '0.7rem',
                  color: COLORS.textMuted,
                  fontFamily: 'monospace',
                }}>
                  {formatTime(i).slice(0, 5)}
                </div>
              ))}
              <div style={{
                position: 'absolute',
                left: currentTime * (zoom / 10) + 100,
                width: 2,
                height: '100%',
                background: COLORS.primary,
                zIndex: 10,
              }} />
            </div>

            {/* Video Track */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ width: 100, fontSize: '0.75rem', color: COLORS.textMuted, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Film size={14} /> Vidéo
              </div>
              <div style={{
                flex: 1,
                height: 50,
                background: COLORS.trackVideo,
                borderRadius: '0.5rem',
                position: 'relative',
                minWidth: 500,
              }}>
                {timelineClips.filter(c => c.trackIndex === 0).map(clip => (
                  <div
                    key={clip.id}
                    onClick={() => setSelectedClipId(clip.id)}
                    style={{
                      position: 'absolute',
                      left: clip.startTime * (zoom / 10),
                      width: clip.duration * (zoom / 10),
                      height: '100%',
                      background: selectedClipId === clip.id ? COLORS.primary : '#a05040',
                      borderRadius: '0.35rem',
                      cursor: 'move',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      overflow: 'hidden',
                      boxShadow: selectedClipId === clip.id ? '0 0 0 2px white' : 'none',
                    }}
                  >
                    {clip.text?.text || mediaClips.find(m => m.id === clip.mediaId)?.name || 'Clip'}
                  </div>
                ))}
              </div>
            </div>

            {/* Audio Track */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ width: 100, fontSize: '0.75rem', color: COLORS.textMuted, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Music size={14} /> Audio
              </div>
              <div style={{
                flex: 1,
                height: 40,
                background: COLORS.trackAudio,
                borderRadius: '0.5rem',
                position: 'relative',
                minWidth: 500,
              }}>
                {timelineClips.filter(c => c.trackIndex === 1).map(clip => (
                  <div
                    key={clip.id}
                    onClick={() => setSelectedClipId(clip.id)}
                    style={{
                      position: 'absolute',
                      left: clip.startTime * (zoom / 10),
                      width: clip.duration * (zoom / 10),
                      height: '100%',
                      background: selectedClipId === clip.id ? '#9333ea' : '#a855f7',
                      borderRadius: '0.35rem',
                      cursor: 'move',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      overflow: 'hidden',
                      boxShadow: selectedClipId === clip.id ? '0 0 0 2px white' : 'none',
                    }}
                  >
                    {mediaClips.find(m => m.id === clip.mediaId)?.name || 'Audio'}
                  </div>
                ))}
              </div>
            </div>

            {/* Text Track */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 100, fontSize: '0.75rem', color: COLORS.textMuted, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Type size={14} /> Texte
              </div>
              <div style={{
                flex: 1,
                height: 35,
                background: COLORS.trackText,
                borderRadius: '0.5rem',
                position: 'relative',
                minWidth: 500,
              }}>
                {timelineClips.filter(c => c.trackIndex === 2).map(clip => (
                  <div
                    key={clip.id}
                    onClick={() => setSelectedClipId(clip.id)}
                    style={{
                      position: 'absolute',
                      left: clip.startTime * (zoom / 10),
                      width: clip.duration * (zoom / 10),
                      height: '100%',
                      background: selectedClipId === clip.id ? '#2563eb' : '#3b82f6',
                      borderRadius: '0.35rem',
                      cursor: 'move',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      overflow: 'hidden',
                      boxShadow: selectedClipId === clip.id ? '0 0 0 2px white' : 'none',
                    }}
                  >
                    T: {clip.text?.text || 'Texte'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div style={{
            background: COLORS.surface,
            borderRadius: '1rem',
            padding: '2rem',
            width: 400,
            maxWidth: '90vw',
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: COLORS.primary, margin: '0 0 1.5rem 0' }}>
              📤 Exporter la vidéo
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Format de sortie</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                {EXPORT_FORMATS.map(fmt => (
                  <button
                    key={fmt.id}
                    onClick={() => setExportFormat(fmt)}
                    style={{
                      padding: '0.75rem',
                      border: `2px solid ${exportFormat.id === fmt.id ? COLORS.primary : COLORS.border}`,
                      borderRadius: '0.5rem',
                      background: exportFormat.id === fmt.id ? '#f8f4f0' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{fmt.label}</div>
                    <div style={{ fontSize: '0.75rem', color: COLORS.textMuted }}>
                      {fmt.width}×{fmt.height} ({fmt.aspectRatio})
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowExportModal(false)}
                style={buttonStyle(COLORS.textMuted)}
              >
                Annuler
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                style={{
                  ...buttonStyle(COLORS.secondary),
                  opacity: isExporting ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {isExporting ? (
                  <>⏳ Export en cours...</>
                ) : (
                  <>
                    <Download size={18} />
                    Exporter
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const buttonStyle = (bg: string): React.CSSProperties => ({
  padding: '0.5rem 1rem',
  background: bg,
  color: 'white',
  border: 'none',
  borderRadius: '0.5rem',
  fontSize: '0.9rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
});

const smallButtonStyle: React.CSSProperties = {
  padding: '0.35rem 0.65rem',
  background: '#e8e4e0',
  color: COLORS.text,
  border: 'none',
  borderRadius: '0.35rem',
  fontSize: '0.75rem',
  fontWeight: 500,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
};

const iconButtonStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  background: '#e8e4e0',
  color: COLORS.text,
  border: 'none',
  borderRadius: '0.5rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: COLORS.text,
  marginBottom: '0.5rem',
};

const uploadButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  width: '100%',
  padding: '0.75rem',
  background: '#f0e8e4',
  color: COLORS.primary,
  border: `2px dashed ${COLORS.border}`,
  borderRadius: '0.5rem',
  fontSize: '0.85rem',
  fontWeight: 600,
  cursor: 'pointer',
};