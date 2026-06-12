'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Scissors, Play, Pause, Plus, Trash2, Download, 
  FileVideo, Check, Clock, ZoomIn, ZoomOut, 
  RotateCcw, ChevronLeft, ChevronRight, AlertCircle,
  Loader2, Layers
} from 'lucide-react';

// ===== Types =====
export interface TrimSegment {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  isActive: boolean;
  thumbnail?: string;
}

export interface FastTrimState {
  videoUrl: string | null;
  videoName: string;
  videoDuration: number;
  segments: TrimSegment[];
  currentTime: number;
  isPlaying: boolean;
  isExporting: boolean;
  zoom: number;
  error: string | null;
}

// ===== Main Component =====
export default function FastTrimTool() {
  const [state, setState] = useState<FastTrimState>({
    videoUrl: null,
    videoName: '',
    videoDuration: 0,
    segments: [],
    currentTime: 0,
    isPlaying: false,
    isExporting: false,
    zoom: 100,
    error: null,
  });

  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | 'playhead' | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, []);

  // Handle playback
  useEffect(() => {
    if (state.isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setState(prev => {
          if (prev.currentTime >= prev.videoDuration) {
            return { ...prev, isPlaying: false, currentTime: 0 };
          }
          return { ...prev, currentTime: prev.currentTime + 0.033 };
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
  }, [state.isPlaying, state.videoDuration]);

  // Handle video upload
  const handleVideoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setState(prev => ({
      ...prev,
      videoUrl: url,
      videoName: file.name,
      segments: [],
      currentTime: 0,
      error: null,
    }));
  }, []);

  // Handle video metadata loaded
  const handleVideoLoaded = useCallback(() => {
    if (videoRef.current) {
      setState(prev => ({
        ...prev,
        videoDuration: videoRef.current?.duration || 0,
      }));
    }
  }, []);

  // Add segment at current time
  const addSegment = useCallback(() => {
    const newSegment: TrimSegment = {
      id: `seg-${Date.now()}`,
      startTime: state.currentTime,
      endTime: Math.min(state.currentTime + 10, state.videoDuration),
      duration: Math.min(10, state.videoDuration - state.currentTime),
      isActive: true,
    };

    setState(prev => ({
      ...prev,
      segments: [...prev.segments, newSegment],
    }));
    setSelectedSegment(newSegment.id);
  }, [state.currentTime, state.videoDuration]);

  // Update segment
  const updateSegment = useCallback((segmentId: string, updates: Partial<TrimSegment>) => {
    setState(prev => ({
      ...prev,
      segments: prev.segments.map(seg =>
        seg.id === segmentId ? { ...seg, ...updates } : seg
      ),
    }));
  }, []);

  // Delete segment
  const deleteSegment = useCallback((segmentId: string) => {
    setState(prev => ({
      ...prev,
      segments: prev.segments.filter(seg => seg.id !== segmentId),
    }));
    if (selectedSegment === segmentId) setSelectedSegment(null);
  }, [selectedSegment]);

  // Clear all segments
  const clearAllSegments = useCallback(() => {
    setState(prev => ({ ...prev, segments: [] }));
    setSelectedSegment(null);
  }, []);

  // Seek to time
  const seekTo = useCallback((time: number) => {
    setState(prev => ({ ...prev, currentTime: Math.max(0, Math.min(time, prev.videoDuration)) }));
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  }, []);

  // Set IN marker
  const setInMarker = useCallback(() => {
    if (selectedSegment) {
      updateSegment(selectedSegment, { startTime: state.currentTime });
    }
  }, [selectedSegment, state.currentTime, updateSegment]);

  // Set OUT marker
  const setOutMarker = useCallback(() => {
    if (selectedSegment) {
      const segment = state.segments.find(s => s.id === selectedSegment);
      if (segment) {
        const newDuration = state.currentTime - segment.startTime;
        if (newDuration > 0) {
          updateSegment(selectedSegment, { 
            endTime: state.currentTime, 
            duration: newDuration 
          });
        }
      }
    }
  }, [selectedSegment, state.currentTime, state.segments, updateSegment]);

  // Export segments (lossless cut simulation)
  const exportSegments = useCallback(async () => {
    if (state.segments.length === 0) return;

    setState(prev => ({ ...prev, isExporting: true }));

    // Simulate lossless export
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    const totalDuration = state.segments.reduce((acc, seg) => acc + seg.duration, 0);
    alert(`Export terminé !\n\n${state.segments.length} segments exportés\nDurée totale: ${totalDuration.toFixed(1)}s\n\nNote: L'export lossless réel utiliserait WebCodecs ou ffmpeg.wasm`);

    setState(prev => ({ ...prev, isExporting: false }));
  }, [state.segments]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  const selectedSegData = state.segments.find(s => s.id === selectedSegment);
  const totalSelectedDuration = state.segments.reduce((acc, seg) => acc + seg.duration, 0);

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
            ✂️ Découpe Rapide
          </h1>
          <span style={{
            fontSize: '0.8rem',
            padding: '0.25rem 0.75rem',
            background: '#e8f5f0',
            color: '#059669',
            borderRadius: '9999px',
            fontWeight: 600,
          }}>
            Lossless
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.9rem', color: '#888' }}>
            {state.segments.length} segment(s) • {totalSelectedDuration.toFixed(1)}s
          </span>
          {state.segments.length > 0 && (
            <>
              <button
                onClick={clearAllSegments}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#fee2e2',
                  color: '#dc2626',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Tout effacer
              </button>
              <button
                onClick={exportSegments}
                disabled={state.isExporting}
                style={{
                  padding: '0.5rem 1rem',
                  background: state.isExporting ? '#ccc' : '#83C5BE',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: state.isExporting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {state.isExporting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Export...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Exporter
                  </>
                )}
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
              <FileVideo size={64} style={{ opacity: 0.3, marginBottom: '1rem', color: 'white' }} />
              <p style={{ color: '#888', marginBottom: '1.5rem' }}>
                Importez une vidéo pour commencer la découpe
              </p>
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
                onLoadedMetadata={handleVideoLoaded}
                style={{
                  maxWidth: '100%',
                  maxHeight: '60vh',
                  borderRadius: '0.5rem',
                }}
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    setState(prev => ({ ...prev, currentTime: videoRef.current?.currentTime || 0 }));
                  }
                }}
              />
              
              {/* Timecode */}
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
                fontSize: '1.25rem',
              }}>
                {formatTime(state.currentTime)} / {formatTime(state.videoDuration)}
              </div>
            </>
          )}

          {/* Playback Controls */}
          {state.videoUrl && (
            <div style={{
              position: 'absolute',
              bottom: '4rem',
              display: 'flex',
              gap: '0.5rem',
              background: 'rgba(0,0,0,0.5)',
              padding: '0.5rem',
              borderRadius: '0.5rem',
            }}>
              <button
                onClick={() => seekTo(state.currentTime - 5)}
                style={iconButtonStyle}
                title="5s en arrière"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
                style={{ ...iconButtonStyle, width: 48, height: 48, background: '#6b2a1a', color: 'white' }}
              >
                {state.isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button
                onClick={() => seekTo(state.currentTime + 5)}
                style={iconButtonStyle}
                title="5s en avant"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Right - Timeline & Segments */}
        <div style={{
          width: 400,
          background: '#ffffff',
          borderLeft: '1px solid #e0dbd5',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Timeline */}
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid #e0dbd5',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#302925', margin: 0 }}>
                📍 Timeline
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setState(prev => ({ ...prev, zoom: Math.max(50, prev.zoom - 25) }))}
                  style={smallIconButtonStyle}
                >
                  <ZoomOut size={14} />
                </button>
                <span style={{ fontSize: '0.75rem', color: '#888', minWidth: 35, textAlign: 'center' }}>
                  {state.zoom}%
                </span>
                <button
                  onClick={() => setState(prev => ({ ...prev, zoom: Math.min(200, prev.zoom + 25) }))}
                  style={smallIconButtonStyle}
                >
                  <ZoomIn size={14} />
                </button>
              </div>
            </div>

            {/* Waveform/Timeline visualization */}
            <div 
              ref={timelineRef}
              style={{
                height: 80,
                background: '#f8f6f4',
                borderRadius: '0.5rem',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const time = (x / rect.width) * state.videoDuration;
                seekTo(time);
              }}
            >
              {/* Segments on timeline */}
              {state.segments.map(seg => {
                const left = (seg.startTime / state.videoDuration) * 100;
                const width = (seg.duration / state.videoDuration) * 100;
                return (
                  <div
                    key={seg.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSegment(seg.id);
                    }}
                    style={{
                      position: 'absolute',
                      top: 10,
                      left: `${left}%`,
                      width: `${width}%`,
                      height: 60,
                      background: selectedSegment === seg.id ? '#6b2a1a' : '#a05040',
                      borderRadius: '0.35rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      boxShadow: selectedSegment === seg.id ? '0 0 0 2px white' : 'none',
                    }}
                  >
                    {seg.duration.toFixed(0)}s
                  </div>
                );
              })}

              {/* Playhead */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: `${(state.currentTime / state.videoDuration) * 100}%`,
                width: 2,
                height: '100%',
                background: '#83C5BE',
                zIndex: 10,
              }}>
                <div style={{
                  width: 12,
                  height: 12,
                  background: '#83C5BE',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: -6,
                  left: -5,
                }} />
              </div>
            </div>
          </div>

          {/* Markers */}
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid #e0dbd5',
            display: 'flex',
            gap: '0.5rem',
          }}>
            <button
              onClick={setInMarker}
              disabled={!selectedSegment}
              style={{
                flex: 1,
                padding: '0.5rem',
                background: selectedSegment ? '#fef3c7' : '#e5e5e5',
                color: selectedSegment ? '#92400e' : '#888',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: selectedSegment ? 'pointer' : 'not-allowed',
              }}
            >
              [ IN
            </button>
            <button
              onClick={addSegment}
              disabled={!state.videoUrl}
              style={{
                flex: 1,
                padding: '0.5rem',
                background: state.videoUrl ? '#6b2a1a' : '#e5e5e5',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: state.videoUrl ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <Plus size={14} />
              Ajouter
            </button>
            <button
              onClick={setOutMarker}
              disabled={!selectedSegment}
              style={{
                flex: 1,
                padding: '0.5rem',
                background: selectedSegment ? '#fef3c7' : '#e5e5e5',
                color: selectedSegment ? '#92400e' : '#888',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: selectedSegment ? 'pointer' : 'not-allowed',
              }}
            >
              OUT ]
            </button>
          </div>

          {/* Segments List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
            {state.segments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                <Scissors size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p style={{ fontSize: '0.9rem' }}>
                  {state.videoUrl
                    ? 'Cliquez sur "Ajouter" pour créer un segment'
                    : 'Importez d\'abord une vidéo'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {state.segments.map((seg, index) => (
                  <div
                    key={seg.id}
                    onClick={() => {
                      setSelectedSegment(seg.id);
                      seekTo(seg.startTime);
                    }}
                    style={{
                      background: selectedSegment === seg.id ? '#f8f4f0' : '#f8f6f4',
                      borderRadius: '0.75rem',
                      padding: '1rem',
                      border: selectedSegment === seg.id ? '2px solid #6b2a1a' : '1px solid #e0dbd5',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600, color: '#6b2a1a' }}>
                        Segment {index + 1}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={14} color="#888" />
                        <span style={{ fontSize: '0.85rem', color: '#302925', fontWeight: 600 }}>
                          {seg.duration.toFixed(1)}s
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.7rem', color: '#888' }}>Début</label>
                        <input
                          type="number"
                          value={seg.startTime.toFixed(1)}
                          onChange={(e) => {
                            const newStart = Number(e.target.value);
                            const newDuration = seg.endTime - newStart;
                            if (newDuration > 0) {
                              updateSegment(seg.id, { startTime: newStart, duration: newDuration });
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          style={timeInputStyle}
                          step="0.1"
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.7rem', color: '#888' }}>Fin</label>
                        <input
                          type="number"
                          value={seg.endTime.toFixed(1)}
                          onChange={(e) => {
                            const newEnd = Number(e.target.value);
                            const newDuration = newEnd - seg.startTime;
                            if (newDuration > 0) {
                              updateSegment(seg.id, { endTime: newEnd, duration: newDuration });
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          style={timeInputStyle}
                          step="0.1"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          seekTo(seg.startTime);
                        }}
                        style={smallButtonStyle}
                      >
                        <Play size={12} /> Lire
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSegment(seg.id);
                        }}
                        style={{ ...smallButtonStyle, background: '#fee2e2', color: '#dc2626' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{
            padding: '1rem',
            background: '#f8f6f4',
            borderTop: '1px solid #e0dbd5',
            fontSize: '0.8rem',
            color: '#888',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <AlertCircle size={16} />
            <span>
              Découpe lossless : aucun réencodage, qualité préservée à 100%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles
const iconButtonStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  background: '#e8e4e0',
  color: '#302925',
  border: 'none',
  borderRadius: '0.5rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const smallIconButtonStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  background: '#e8e4e0',
  color: '#555',
  border: 'none',
  borderRadius: '0.25rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const smallButtonStyle: React.CSSProperties = {
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
};

const timeInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.35rem',
  border: '1px solid #e0dbd5',
  borderRadius: '0.35rem',
  fontSize: '0.85rem',
  fontFamily: 'monospace',
};