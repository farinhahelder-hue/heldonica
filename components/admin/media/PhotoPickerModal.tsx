'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Camera,
  Search,
  X,
  MapPin,
  Calendar,
  Check,
  FolderOpen,
  Image as ImageIcon,
  HardDrive,
  Upload,
  RefreshCw,
} from 'lucide-react';
import {
  VERIFIED_PHOTO_ALBUMS,
  searchVerifiedPhotos,
  type PhotoEvidenceItem,
} from '@/lib/cms-photo-albums';
import { detectStockPhoto, type PhotoExifResult } from '@/lib/photo-exif';

export interface SelectedPhotoPayload {
  url: string;
  alt: string;
  caption?: string;
  location?: string;
  date?: string;
  albumLink?: string;
  exif?: PhotoExifResult;
  isStockCandidate?: boolean;
  stockReasons?: string[];
}

interface PhotoPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (photo: SelectedPhotoPayload) => void;
  title?: string;
}

interface StorageMediaFile {
  key: string;
  url: string;
  name: string;
  size?: number;
  lastModified?: string;
  exif?: PhotoExifResult;
  isStockCandidate?: boolean;
  stockReasons?: string[];
}

const STORAGE_FOLDERS = [
  { value: 'articles', label: '📁 articles/' },
  { value: 'destinations', label: '📁 destinations/' },
  { value: 'blog', label: '📁 blog/' },
  { value: 'coulisses', label: '📁 coulisses/' },
];

function fmtSize(b?: number): string {
  if (!b) return '';
  if (b < 1024) return b + ' o';
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' Ko';
  return (b / (1024 * 1024)).toFixed(1) + ' Mo';
}

export default function PhotoPickerModal({
  isOpen,
  onClose,
  onSelect,
  title = 'Médiathèque 2.0 — Albums & Stockage Unifiés',
}: PhotoPickerModalProps) {
  const [activeTab, setActiveTab] = useState<'albums' | 'storage' | 'manual'>('albums');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>(VERIFIED_PHOTO_ALBUMS[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Onglet URL manuelle
  const [manualUrl, setManualUrl] = useState('');
  const [manualAlt, setManualAlt] = useState('');
  const [manualCaption, setManualCaption] = useState('');

  // Onglet Supabase Storage
  const [storageFolder, setStorageFolder] = useState('articles');
  const [storageFiles, setStorageFiles] = useState<StorageMediaFile[]>([]);
  const [storageLoading, setStorageLoading] = useState(false);
  const [storageUploading, setStorageUploading] = useState(false);
  const [storageSearch, setStorageSearch] = useState('');
  const [storageError, setStorageError] = useState<string | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
  } | null>(null);

  // Détection photo de stock en temps réel sur la saisie manuelle
  const manualStockCheck = useMemo(() => {
    if (!manualUrl.trim()) return null;
    return detectStockPhoto(manualUrl.trim());
  }, [manualUrl]);

  // Recherche ou affichage de l'album actif
  const displayedPhotos: PhotoEvidenceItem[] = useMemo(() => {
    if (searchQuery.trim()) {
      return searchVerifiedPhotos(searchQuery);
    }
    const album = VERIFIED_PHOTO_ALBUMS.find((a) => a.id === selectedAlbumId);
    return album ? album.photos : [];
  }, [searchQuery, selectedAlbumId]);

  const currentAlbum = useMemo(
    () => VERIFIED_PHOTO_ALBUMS.find((a) => a.id === selectedAlbumId) || VERIFIED_PHOTO_ALBUMS[0],
    [selectedAlbumId]
  );

  // Chargement des fichiers Storage
  const loadStorageFiles = useCallback(async () => {
    if (!isOpen) return;
    setStorageLoading(true);
    setStorageError(null);
    try {
      const res = await fetch(`/api/cms/media?prefix=${encodeURIComponent(storageFolder)}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStorageFiles(data.files || []);
    } catch (e: unknown) {
      setStorageError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setStorageLoading(false);
    }
  }, [isOpen, storageFolder]);

  useEffect(() => {
    if (activeTab === 'storage') {
      loadStorageFiles();
    }
  }, [activeTab, loadStorageFiles]);

  const filteredStorageFiles = useMemo(() => {
    if (!storageSearch.trim()) return storageFiles;
    const q = storageSearch.trim().toLowerCase();
    return storageFiles.filter((f) => f.name.toLowerCase().includes(q));
  }, [storageFiles, storageSearch]);

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStorageUploading(true);
    setUploadFeedback(null);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', storageFolder);
    try {
      const res = await fetch('/api/cms/media-upload', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (data.url) {
        if (data.isStockCandidate) {
          setUploadFeedback({
            type: 'warning',
            message: `⚠️ Photo importée mais suspectée d'être issue d'une banque d'images (${data.stockReasons?.join(', ')}). Règle n°1 : 100% réel.`,
          });
        } else if (data.exif?.date || data.exif?.device) {
          const deviceName = [data.exif.device?.make, data.exif.device?.model].filter(Boolean).join(' ');
          setUploadFeedback({
            type: 'success',
            message: `✅ Métadonnées réelles extraites : Date ${data.exif.date || 'présente'}${deviceName ? ` · Matériel : ${deviceName}` : ''}.`,
          });
        }
        loadStorageFiles();
      } else {
        setUploadFeedback({
          type: 'error',
          message: `Erreur upload : ${data.error}`,
        });
      }
    } catch (err) {
      setUploadFeedback({
        type: 'error',
        message: `Erreur upload : ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setStorageUploading(false);
      e.target.value = '';
    }
  };

  if (!isOpen) return null;

  const handleSelectVerifiedPhoto = (photo: PhotoEvidenceItem) => {
    onSelect({
      url: photo.imageUrl,
      alt: photo.location || 'Cliché de terrain Heldonica',
      caption: photo.suggestedAnecdote,
      location: photo.location,
      date: photo.date,
      albumLink: photo.albumLink,
    });
    onClose();
  };

  const handleSelectStorageFile = (file: StorageMediaFile) => {
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    onSelect({
      url: file.url,
      alt: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
      caption: undefined,
      ...(file.exif?.date ? { date: file.exif.date } : {}),
      ...(file.exif ? { exif: file.exif } : {}),
      ...(file.isStockCandidate
        ? { isStockCandidate: true, stockReasons: file.stockReasons }
        : {}),
    });
    onClose();
  };

  const handleSelectManual = () => {
    if (!manualUrl.trim()) return;
    onSelect({
      url: manualUrl.trim(),
      alt: manualAlt.trim() || 'Image de carnet de voyage',
      caption: manualCaption.trim() || undefined,
      ...(manualStockCheck?.isStockCandidate
        ? { isStockCandidate: true, stockReasons: manualStockCheck.reasons }
        : {}),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="photo-picker-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* En-tête modal */}
        <div className="p-4 md:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
              <Camera size={20} />
            </div>
            <div>
              <h3 id="photo-picker-title" className="text-base font-bold text-stone-900 font-serif">
                {title}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Règle n°1 d’Heldonica : 100% de photos réelles vécues par le duo fondateur.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
            aria-label="Fermer la médiathèque"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation par onglets */}
        <div className="px-5 pt-3 border-b border-stone-200 flex gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('albums')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'albums'
                ? 'border-teal-700 text-teal-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FolderOpen size={14} />
            <span>Albums de terrain ({VERIFIED_PHOTO_ALBUMS.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('storage')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'storage'
                ? 'border-teal-700 text-teal-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <HardDrive size={14} />
            <span>Supabase Storage</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'manual'
                ? 'border-teal-700 text-teal-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ImageIcon size={14} />
            <span>URL externe</span>
          </button>
        </div>

        {/* Contenu principal */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'albums' ? (
            /* ── Onglet 1 : Albums de terrain certifiés ── */
            <>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher par lieu, destination ou anecdote (ex. Monténégro, Morača, Stara Varoš)..."
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
                    >
                      Effacer
                    </button>
                  )}
                </div>

                {!searchQuery && (
                  <div className="text-[11px] text-teal-800 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200 font-medium shrink-0">
                    📍 {currentAlbum?.period || 'Prises de vue réelles'}
                  </div>
                )}
              </div>

              {!searchQuery && (
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {VERIFIED_PHOTO_ALBUMS.map((album) => (
                    <button
                      key={album.id}
                      type="button"
                      onClick={() => setSelectedAlbumId(album.id)}
                      className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all ${
                        selectedAlbumId === album.id
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {album.title.split('—')[0].trim()} ({album.photos.length})
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-1">
                {displayedPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => handleSelectVerifiedPhoto(photo)}
                    className="group cursor-pointer border border-stone-200 hover:border-teal-600 rounded-xl overflow-hidden bg-white hover:shadow-md transition-all text-left flex flex-col"
                  >
                    <div className="relative aspect-video bg-stone-100 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.imageUrl}
                        alt={photo.location}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 bg-black/70 backdrop-blur-xs text-white text-[10px] rounded-md font-mono flex items-center gap-1">
                        <Calendar size={10} />
                        {photo.date}
                      </span>
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between space-y-2 bg-stone-50/50">
                      <div>
                        <div className="text-xs font-bold text-stone-800 flex items-center gap-1 truncate">
                          <MapPin size={12} className="text-teal-700 shrink-0" />
                          <span>{photo.location}</span>
                        </div>
                        <p className="text-[11px] text-stone-600 line-clamp-2 mt-1 italic leading-snug">
                          « {photo.suggestedAnecdote} »
                        </p>
                      </div>

                      <button
                        type="button"
                        className="w-full py-1.5 bg-teal-100 hover:bg-teal-700 hover:text-white text-teal-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Check size={13} />
                        <span>Sélectionner ce cliché</span>
                      </button>
                    </div>
                  </div>
                ))}

                {displayedPhotos.length === 0 && (
                  <div className="col-span-full py-12 text-center text-xs text-stone-500">
                    Aucun cliché de terrain ne correspond à votre recherche. Règle #1 : nous n'inventons aucune image.
                  </div>
                )}
              </div>
            </>
          ) : activeTab === 'storage' ? (
            /* ── Onglet 2 : Stockage Supabase Storage ── */
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
                <div className="flex items-center gap-2">
                  <select
                    value={storageFolder}
                    onChange={(e) => setStorageFolder(e.target.value)}
                    className="bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-700 focus:outline-none"
                  >
                    {STORAGE_FOLDERS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={loadStorageFiles}
                    disabled={storageLoading}
                    className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-200 transition-colors"
                    title="Rafraîchir"
                  >
                    <RefreshCw size={14} className={storageLoading ? 'animate-spin' : ''} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-2xs">
                    <Upload size={13} />
                    <span>{storageUploading ? 'Upload en cours…' : 'Uploader une image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadFile}
                      disabled={storageUploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Champ de recherche dans les fichiers Storage */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={storageSearch}
                  onChange={(e) => setStorageSearch(e.target.value)}
                  placeholder="Filtrer les fichiers de ce dossier..."
                  className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-none"
                />
              </div>

              {uploadFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
                    uploadFeedback.type === 'warning'
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : uploadFeedback.type === 'error'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-teal-50 border-teal-200 text-teal-900'
                  }`}
                >
                  <span className="font-medium">{uploadFeedback.message}</span>
                  <button
                    type="button"
                    onClick={() => setUploadFeedback(null)}
                    className="text-stone-400 hover:text-stone-600 ml-2"
                    aria-label="Fermer l'alerte"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {storageError && (
                <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs">
                  {storageError}
                </div>
              )}

              {storageLoading ? (
                <div className="py-12 text-center text-xs text-stone-400">Chargement des fichiers Storage…</div>
              ) : filteredStorageFiles.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-400">
                  Aucune image trouvée dans {storageFolder}/. Vous pouvez en uploader une directement.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto pt-1">
                  {filteredStorageFiles.map((file) => (
                    <div
                      key={file.key}
                      onClick={() => handleSelectStorageFile(file)}
                      className="group cursor-pointer border border-stone-200 hover:border-teal-600 rounded-xl overflow-hidden bg-white hover:shadow-md transition-all text-left flex flex-col"
                    >
                      <div className="relative aspect-video bg-stone-100 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-2 text-xs flex-1 flex flex-col justify-between bg-stone-50/50">
                        <div className="truncate font-medium text-stone-800 text-[11px]" title={file.name}>
                          {file.name}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-stone-400 mt-1">
                          <span>{fmtSize(file.size)}</span>
                          <span className="text-teal-700 font-semibold group-hover:underline">Choisir</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ── Onglet 3 : Saisie Manuelle ── */
            <div className="max-w-xl mx-auto space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-700">URL HTTPS de l’image</label>
                <input
                  type="url"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="https://heldonica.com/images/... ou URL Supabase"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
                {manualStockCheck?.isStockCandidate && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2 animate-in fade-in">
                    <span className="text-sm leading-none mt-0.5" role="img" aria-label="Avertissement">⚠️</span>
                    <div>
                      <p className="font-semibold">Alerte banque d’images / stock détectée</p>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        {manualStockCheck.reasons.join(' · ')}
                      </p>
                      <p className="text-[10px] text-amber-700 mt-1 italic">
                        Règle n°1 d’Heldonica : « On n'invente rien ». Les visuels doivent attester d'un terrain réel vécu par le duo.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-700">Description alternative (Alt text)</label>
                <input
                  type="text"
                  value={manualAlt}
                  onChange={(e) => setManualAlt(e.target.value)}
                  placeholder="Ex. Église en bois au coucher du soleil dans les Maramureș"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
                <p className="text-[10px] text-stone-400">Requis pour l'accessibilité RGAA et le référencement SEO.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-700">Légende optionnelle</label>
                <input
                  type="text"
                  value={manualCaption}
                  onChange={(e) => setManualCaption(e.target.value)}
                  placeholder="Légende éditoriale visible sous la photo..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={!manualUrl.trim()}
                  onClick={handleSelectManual}
                  className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
                >
                  Appliquer cette image
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
