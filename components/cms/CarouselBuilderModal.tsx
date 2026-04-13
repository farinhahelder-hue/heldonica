'use client';

import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { normalizeCarouselUrls } from '@/lib/carousel-html';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (urls: string[]) => void;
  folder?: string;
};

export default function CarouselBuilderModal({
  isOpen,
  onClose,
  onInsert,
  folder = 'articles',
}: Props) {
  const [images, setImages] = useState<string[]>([]);
  const [manualUrls, setManualUrls] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setImages([]);
      setManualUrls('');
      setUploading(false);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const addImages = (incoming: string[]) => {
    setImages((prev) => normalizeCarouselUrls([...prev, ...incoming]));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError('');
    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', folder);

        const res = await fetch('/api/cms/media-upload', {
          method: 'POST',
          body: fd,
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.url) {
          throw new Error(data.error || `Upload impossible pour ${file.name}`);
        }

        uploadedUrls.push(data.url);
      }

      addImages(uploadedUrls);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible d’uploader les images.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const addManualUrlBatch = () => {
    const urls = normalizeCarouselUrls(manualUrls.split(/[\r\n,]+/));
    if (urls.length === 0) {
      setError('Ajoute au moins une URL valide.');
      return;
    }

    setError('');
    addImages(urls);
    setManualUrls('');
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    setImages((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) {
        return prev;
      }

      const next = [...prev];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const handleInsert = () => {
    if (images.length < 2) {
      setError('Un carrousel a besoin d’au moins 2 images.');
      return;
    }

    onInsert(images);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 220,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !uploading) {
          onClose();
        }
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 920,
          maxHeight: '90vh',
          overflow: 'auto',
          background: 'white',
          borderRadius: '1.25rem',
          boxShadow: '0 24px 64px rgba(0,0,0,.22)',
        }}
      >
        <div
          style={{
            padding: '1.35rem 1.5rem',
            borderBottom: '1px solid #ece3d8',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: '.78rem', color: '#8a7a70', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>
              Générateur
            </p>
            <h2 style={{ margin: '.15rem 0 0', fontSize: '1.1rem', color: '#6b2a1a' }}>
              Carrousel photo
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            style={{
              border: 'none',
              background: 'none',
              cursor: uploading ? 'wait' : 'pointer',
              color: '#8a7a70',
              fontSize: '1.3rem',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '1.5rem', display: 'grid', gap: '1.5rem' }}>
          <div
            style={{
              background: '#faf8f5',
              border: '1px solid #ece3d8',
              borderRadius: '1rem',
              padding: '1rem',
              display: 'grid',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <label
                style={{
                  padding: '.7rem 1rem',
                  background: uploading ? '#94a3b8' : '#01696f',
                  color: 'white',
                  borderRadius: '.6rem',
                  cursor: uploading ? 'wait' : 'pointer',
                  fontWeight: 700,
                  fontSize: '.9rem',
                }}
              >
                {uploading ? '⏳ Upload…' : '⬆️ Uploader plusieurs images'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleUpload}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
              </label>
              <span style={{ color: '#8a7a70', fontSize: '.82rem' }}>
                Les images sont envoyées dans le dossier `{folder}/`.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#4b3b35', fontSize: '.88rem', marginBottom: '.45rem' }}>
                Ou colle des URLs d’images
              </label>
              <textarea
                value={manualUrls}
                onChange={(e) => setManualUrls(e.target.value)}
                placeholder={'Une URL par ligne\nhttps://...\nhttps://...'}
                style={{
                  width: '100%',
                  minHeight: 110,
                  resize: 'vertical',
                  border: '1.5px solid #e0dbd5',
                  borderRadius: '.75rem',
                  padding: '.85rem 1rem',
                  fontSize: '.9rem',
                  lineHeight: 1.5,
                  color: '#1f1a17',
                  background: 'white',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.75rem', alignItems: 'center', marginTop: '.75rem', flexWrap: 'wrap' }}>
                <p style={{ margin: 0, color: '#8a7a70', fontSize: '.8rem' }}>
                  Tu peux séparer les URLs par ligne ou par virgule.
                </p>
                <button
                  type="button"
                  onClick={addManualUrlBatch}
                  style={{
                    padding: '.6rem .95rem',
                    border: '1px solid #d9cfc2',
                    borderRadius: '.55rem',
                    background: 'white',
                    color: '#6b2a1a',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '.84rem',
                  }}
                >
                  Ajouter ces URLs
                </button>
              </div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '.85rem', flexWrap: 'wrap' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: '#1f1a17' }}>Slides du carrousel</p>
                <p style={{ margin: '.2rem 0 0', fontSize: '.82rem', color: '#8a7a70' }}>
                  Glisse l’ordre mentalement ici: tu peux remonter, descendre, supprimer.
                </p>
              </div>
              <span
                style={{
                  padding: '.35rem .65rem',
                  borderRadius: '999px',
                  background: images.length >= 2 ? '#e8f5f2' : '#fff4db',
                  color: images.length >= 2 ? '#01696f' : '#8a5a00',
                  fontSize: '.78rem',
                  fontWeight: 700,
                }}
              >
                {images.length} image{images.length > 1 ? 's' : ''}
              </span>
            </div>

            {images.length === 0 ? (
              <div
                style={{
                  border: '1.5px dashed #d9cfc2',
                  borderRadius: '1rem',
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#8a7a70',
                  background: '#fffdfa',
                }}
              >
                Ajoute au moins 2 images pour générer un carrousel.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '.9rem' }}>
                {images.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '120px 1fr auto',
                      gap: '1rem',
                      alignItems: 'center',
                      border: '1px solid #ece3d8',
                      borderRadius: '.9rem',
                      padding: '.8rem',
                      background: '#fffdfa',
                    }}
                  >
                    <img
                      src={url}
                      alt={`Slide ${index + 1}`}
                      style={{
                        width: '100%',
                        height: 84,
                        objectFit: 'cover',
                        borderRadius: '.7rem',
                        background: '#f4ede5',
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700, color: '#1f1a17', fontSize: '.9rem' }}>
                        Slide {index + 1}
                      </p>
                      <p
                        style={{
                          margin: '.2rem 0 0',
                          color: '#8a7a70',
                          fontSize: '.78rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={url}
                      >
                        {url}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '.45rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => moveImage(index, -1)}
                        disabled={index === 0}
                        style={actionButton(index === 0)}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(index, 1)}
                        disabled={index === images.length - 1}
                        style={actionButton(index === images.length - 1)}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        style={{
                          ...actionButton(false),
                          color: '#c0392b',
                          borderColor: '#f0d0cc',
                        }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div
              style={{
                background: '#fff1f0',
                color: '#a61b1b',
                border: '1px solid #f3c7c3',
                borderRadius: '.8rem',
                padding: '.85rem 1rem',
                fontSize: '.88rem',
              }}
            >
              {error}
            </div>
          )}
        </div>

        <div
          style={{
            padding: '1rem 1.5rem 1.35rem',
            borderTop: '1px solid #ece3d8',
            display: 'flex',
            justifyContent: 'space-between',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap',
            background: '#faf8f5',
          }}
        >
          <p style={{ margin: 0, color: '#8a7a70', fontSize: '.82rem' }}>
            Le bloc sera inséré directement dans le contenu de l’article.
          </p>
          <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              style={{
                padding: '.7rem 1rem',
                border: '1px solid #d9cfc2',
                borderRadius: '.6rem',
                background: 'white',
                color: '#6b2a1a',
                cursor: uploading ? 'wait' : 'pointer',
                fontWeight: 700,
              }}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleInsert}
              disabled={uploading || images.length < 2}
              style={{
                padding: '.75rem 1.1rem',
                border: 'none',
                borderRadius: '.6rem',
                background: uploading || images.length < 2 ? '#c8c3bc' : '#6b2a1a',
                color: 'white',
                cursor: uploading || images.length < 2 ? 'not-allowed' : 'pointer',
                fontWeight: 700,
              }}
            >
              Insérer le carrousel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function actionButton(disabled: boolean): CSSProperties {
  return {
    padding: '.45rem .7rem',
    borderRadius: '.5rem',
    border: '1px solid #ddd4c9',
    background: disabled ? '#f4f1ec' : 'white',
    color: disabled ? '#b7afa6' : '#6b2a1a',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '.78rem',
    fontWeight: 700,
  };
}
