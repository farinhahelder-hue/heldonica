'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';

interface MediaItem {
  id: string
  name: string
  type: 'image' | 'video'
  url: string
  size: number
  uploadedAt: string
  uploading?: boolean
  progress?: number
}

export default function MediaManager({ data, onSave }: any) {
  const [media, setMedia] = useState<MediaItem[]>(data?.media || []);
  const [uploading, setUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  // Upload vers Supabase Storage avec progression
  const uploadToSupabase = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    // Upload avec XMLHttpRequest pour suivre la progression
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/supabase-media')
    
    const promise = new Promise<string>((resolve, reject) => {
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText)
          resolve(data.publicUrl)
        } else {
          reject(new Error(`Erreur: ${xhr.status}`))
        }
      }
      xhr.onerror = () => reject(new Error('Erreur réseau'))
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          updateProgress(file.name, progress)
        }
      }
    })

    xhr.send(formData)
    return promise
  };

  // Fallback: FileReader base64 (pour petits fichiers ou erreur Supabase)
  const uploadAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setOverallProgress(0);
    
    const tempIds: string[] = [];
    const newMedia: MediaItem[] = [];

    // Créer entrées temporaires avec progress
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const tempId = `temp-${Date.now()}-${i}`;
      tempIds.push(tempId);
      
      newMedia.push({
        id: tempId,
        name: file.name,
        type: file.type.startsWith('image') ? 'image' : 'video',
        url: '',
        size: file.size,
        uploadedAt: new Date().toISOString(),
        uploading: true,
        progress: 0,
      });
    }

    setMedia(prev => [...prev, ...newMedia]);

    // Uploader chaque fichier
    let successCount = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const tempId = tempIds[i];
      
      try {
        let url: string;
        const isLargeFile = file.size > 5 * 1024 * 1024; // 5MB seuil pour vidéo
        
        // Pour vidéos ou gros fichiers, utiliser S3 si disponible
        if (isLargeFile || file.type.startsWith('video/')) {
          try {
            url = await uploadToSupabase(file);
          } catch (supabaseError) {
            console.warn('Supabase échoué, fallback base64:', supabaseError);
            url = await uploadAsBase64(file);
          }
        } else {
          // Petites images: essayer Supabase, sinon base64
          try {
            url = await uploadToSupabase(file);
          } catch {
            url = await uploadAsBase64(file);
          }
        }

        // Mise à jour avec URL réelle
        setMedia(prev => prev.map(m => 
          m.id === tempId 
            ? { ...m, url, uploading: false, progress: 100 } 
            : m
        ));
        successCount++;
        
      } catch (err) {
        console.error('Upload échoué:', file.name, err);
        // Supprimer entrée échouée
        setMedia(prev => prev.filter(m => m.id !== tempId));
      }
    }

    setOverallProgress(successCount > 0 ? 100 : 0);
    setUploading(false);
  };

  const updateProgress = (filename: string, progress: number) => {
    setMedia(prev => prev.map(m => 
      m.name === filename ? { ...m, progress } : m
    ));
    setOverallProgress(progress);
  };

  const removeMedia = (id: string) => {
    setMedia(media.filter((m: any) => m.id !== id));
  };

  const handleSave = () => {
    onSave({
      ...data,
      media,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-serif font-bold text-mahogany mb-6">🖼️ Gestion des Médias</h2>

      {/* Upload */}
      <div className="mb-8 p-6 border-2 border-dashed border-eucalyptus rounded-lg bg-blue-50">
        <div className="text-center">
          <h3 className="font-bold text-mahogany mb-4">Télécharger des médias</h3>
          <Input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="inline-block">
            <button
              type="button"
              disabled={uploading}
              className="inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 px-8 py-3.5 text-sm rounded-full bg-eucalyptus text-white hover:bg-eucalyptus/90 focus-visible:ring-2 focus-visible:ring-eucalyptus focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? '⏳ Téléchargement...' : '📤 Sélectionner des fichiers'}
            </button>
          </label>
          <p className="text-sm text-gray-600 mt-2">
            Glissez-déposez vos images ou vidéos ici
          </p>
        </div>
      </div>

      {/* Galerie de médias */}
      <div>
        <h3 className="font-bold text-mahogany mb-4">Médias ({media.length})</h3>
        {media.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucun média téléchargé</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((item: MediaItem) => (
              <div key={item.id} className="relative group">
                <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square flex items-center justify-center">
                  {item.uploading ? (
                    // État d’upload
                    <div className="text-center w-full p-4">
                      <div className="animate-pulse text-2xl mb-2">⏳</div>
                      <p className="text-xs text-gray-600 truncate">{item.name}</p>
                      <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-eucalyptus h-full transition-all duration-300" 
                          style={{ width: `${item.progress || 0}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{item.progress || 0}%</p>
                    </div>
                  ) : item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      controls
                    />
                  )}
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button
                    onClick={() => removeMedia(item.id)}
                    variant="destructive"
                    size="sm"
                  >
                    Supprimer
                  </Button>
                </div>
                <p className="text-xs text-gray-600 mt-2 truncate">{item.name}</p>
                <p className="text-xs text-gray-500">
                  {item.type === 'video' ? '🎥 ' : ''}{(item.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Boutons d’action */}
      <div className="flex gap-4 mt-8">
        <Button onClick={handleSave} className="bg-mahogany hover:bg-red-900">
          💾 Sauvegarder
        </Button>
      </div>
    </div>
  );
}
