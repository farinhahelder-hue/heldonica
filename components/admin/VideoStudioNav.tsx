'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Film, Type, Zap, Scissors, Home, 
  ChevronRight, FolderOpen, Image, Music
} from 'lucide-react';

// ===== Studio Navigation Configuration =====
const STUDIO_MODULES = [
  {
    id: 'editor',
    label: 'Éditeur Timeline',
    description: 'Monter des vlogs de voyage',
    icon: Film,
    href: '/panel-manager/video',
    color: '#6b2a1a',
    features: ['Multi-piste', 'Color grading', 'Text overlays'],
  },
  {
    id: 'subtitles',
    label: 'Sous-titres IA',
    description: 'Accessibilité + engagement',
    icon: Type,
    href: '/panel-manager/subtitles',
    color: '#2563eb',
    features: ['Transcription Whisper', 'Correction vocabulaire', 'Export SRT'],
  },
  {
    id: 'auto-shorts',
    label: 'Auto-Shorts',
    description: 'Recycler les vlogs en Reels',
    icon: Zap,
    href: '/panel-manager/auto-shorts',
    color: '#9333ea',
    features: ['Analyse IA', 'Captions auto', 'Hashtags'],
  },
  {
    id: 'fast-trim',
    label: 'Découpe Rapide',
    description: 'Extraire les meilleures scènes',
    icon: Scissors,
    href: '/panel-manager/fast-trim',
    color: '#059669',
    features: ['Lossless', 'Marqueurs IN/OUT', 'Batch processing'],
  },
];

// ===== Main Component =====
export default function VideoStudioNav() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Determine active module
  const activeModule = STUDIO_MODULES.find(
    m => pathname?.startsWith(m.href)
  );

  return (
    <div style={{ 
      display: 'flex', 
      height: 'calc(100vh - 80px)', 
      background: '#f5f3ef' 
    }}>
      {/* Desktop Sidebar */}
      <div style={{
        width: isCollapsed ? 60 : 280,
        background: '#ffffff',
        borderRight: '1px solid #e0dbd5',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid #e0dbd5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
        }}>
          {!isCollapsed && (
            <>
              <h2 style={{ 
                fontSize: '1rem', 
                fontWeight: 700, 
                color: '#6b2a1a', 
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                🎬 Studio Vidéo
              </h2>
            </>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              width: 32,
              height: 32,
              background: '#f0e8e4',
              border: 'none',
              borderRadius: '0.35rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: isCollapsed ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease',
            }}
          >
            <ChevronRight size={16} color="#6b2a1a" />
          </button>
        </div>

        {/* Module Links */}
        <nav style={{ flex: 1, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {/* Home Link */}
          <Link
            href="/panel-manager"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: isCollapsed ? '0.75rem' : '0.75rem 1rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              color: pathname === '/panel-manager' ? '#6b2a1a' : '#555',
              background: pathname === '/panel-manager' ? '#f0e8e4' : 'transparent',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
            }}
          >
            <Home size={20} />
            {!isCollapsed && <span style={{ fontWeight: 500 }}>Retour CMS</span>}
          </Link>

          {/* Divider */}
          <div style={{
            height: 1,
            background: '#e0dbd5',
            margin: '0.5rem 0',
          }} />

          {/* Module Links */}
          {STUDIO_MODULES.map(module => {
            const isActive = pathname?.startsWith(module.href);
            const Icon = module.icon;
            
            return (
              <Link
                key={module.id}
                href={module.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: isCollapsed ? '0.75rem' : '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  color: isActive ? 'white' : '#555',
                  background: isActive ? module.color : 'transparent',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  transition: 'all 0.15s ease',
                  borderLeft: isCollapsed && isActive ? `3px solid ${module.color}` : 'none',
                }}
                title={isCollapsed ? module.label : undefined}
              >
                <Icon size={20} style={{ flexShrink: 0 }} />
                {!isCollapsed && (
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{module.label}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.15rem' }}>
                      {module.description}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div style={{
            padding: '1rem',
            borderTop: '1px solid #e0dbd5',
            background: '#f8f6f4',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: '#888',
              marginBottom: '0.5rem',
            }}>
              <FolderOpen size={14} />
              <span>Médiathèque partagée</span>
            </div>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}>
              <span style={{
                padding: '0.2rem 0.5rem',
                background: '#e8e4e0',
                borderRadius: '0.25rem',
                fontSize: '0.7rem',
                color: '#555',
              }}>
                <Image size={10} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Images
              </span>
              <span style={{
                padding: '0.2rem 0.5rem',
                background: '#e8e4e0',
                borderRadius: '0.25rem',
                fontSize: '0.7rem',
                color: '#555',
              }}>
                <Film size={10} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Vidéos
              </span>
              <span style={{
                padding: '0.2rem 0.5rem',
                background: '#e8e4e0',
                borderRadius: '0.25rem',
                fontSize: '0.7rem',
                color: '#555',
              }}>
                <Music size={10} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Audio
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeModule ? (
          // Show module content (will be rendered by dynamic import in page)
          <div style={{ height: '100%' }}>
            {renderActiveModule(activeModule)}
          </div>
        ) : (
          // Show studio overview
          <div style={{ padding: '2rem' }}>
            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              marginBottom: '2rem',
              border: '1px solid #e0dbd5',
            }}>
              <h1 style={{ 
                fontSize: '1.75rem', 
                fontWeight: 700, 
                color: '#6b2a1a', 
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}>
                🎬 Studio Vidéo Heldonica
              </h1>
              <p style={{ 
                color: '#555', 
                fontSize: '1rem',
                marginBottom: '1.5rem',
              }}>
                Créez du contenu Instagram Reels, TikTok et YouTube Shorts sans quitter le CMS.
              </p>

              {/* Module Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1rem',
              }}>
                {STUDIO_MODULES.map(module => {
                  const Icon = module.icon;
                  return (
                    <Link
                      key={module.id}
                      href={module.href}
                      style={{
                        display: 'block',
                        padding: '1.25rem',
                        background: '#f8f6f4',
                        borderRadius: '0.75rem',
                        border: `2px solid transparent`,
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = module.color;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '0.75rem',
                      }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: '0.5rem',
                          background: module.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Icon size={20} color="white" />
                        </div>
                        <div>
                          <h3 style={{ 
                            fontSize: '1rem', 
                            fontWeight: 700, 
                            color: '#302925', 
                            margin: 0 
                          }}>
                            {module.label}
                          </h3>
                          <p style={{ 
                            fontSize: '0.8rem', 
                            color: '#888', 
                            margin: 0 
                          }}>
                            {module.description}
                          </p>
                        </div>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.35rem',
                      }}>
                        {module.features.map(feature => (
                          <span
                            key={feature}
                            style={{
                              fontSize: '0.7rem',
                              padding: '0.2rem 0.5rem',
                              background: 'white',
                              borderRadius: '0.25rem',
                              color: '#555',
                            }}
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{
              background: 'linear-gradient(135deg, #6b2a1a 0%, #83C5BE 100%)',
              borderRadius: '1rem',
              padding: '1.5rem',
              color: 'white',
            }}>
              <h3 style={{ 
                fontSize: '1.1rem', 
                fontWeight: 700, 
                marginBottom: '0.75rem' 
              }}>
                💡 Astuce rapide
              </h3>
              <p style={{ 
                fontSize: '0.9rem', 
                opacity: 0.9,
                margin: 0,
                lineHeight: 1.6,
              }}>
                Commencez par importer une vidéo dans le模块 de votre choix, 
                puis utilisez les outils IA pour générer automatiquement 
                du contenu engageant pour vos réseaux sociaux.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#6b2a1a',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 12px rgba(107, 42, 26, 0.3)',
          cursor: 'pointer',
          display: 'none', // Hidden on desktop
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
        }}
      >
        <Film size={24} />
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 40,
            display: 'none', // Hidden on desktop
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'white',
              borderRadius: '1rem 1rem 0 0',
              padding: '1.5rem',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#6b2a1a', marginBottom: '1rem' }}>
              🎬 Studio Vidéo
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {STUDIO_MODULES.map(module => {
                const Icon = module.icon;
                return (
                  <Link
                    key={module.id}
                    href={module.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                      color: '#302925',
                      background: '#f8f6f4',
                    }}
                  >
                    <Icon size={20} color={module.color} />
                    <span style={{ fontWeight: 500 }}>{module.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          div > div:first-child {
            display: none !important;
          }
          button[style*="position: fixed"] {
            display: flex !important;
          }
          div[style*="position: fixed"][style*="inset: 0"] {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}

// Helper to render active module placeholder
function renderActiveModule(module: typeof STUDIO_MODULES[0]) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: '#888',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          {module.icon === Film && '🎬'}
          {module.icon === Type && '💬'}
          {module.icon === Zap && '⚡'}
          {module.icon === Scissors && '✂️'}
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#6b2a1a', marginBottom: '0.5rem' }}>
          {module.label}
        </h2>
        <p style={{ fontSize: '0.9rem' }}>
          Ce module sera rendu dans la page dédiée
        </p>
      </div>
    </div>
  );
}