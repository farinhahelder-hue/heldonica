'use client';

import { useState } from 'react';
import { Image, Link } from 'lucide-react';
import MediaLibrary from '@/components/MediaLibrary';

type Props = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  altText?: string;
  onAltTextChange?: (alt: string) => void;
};

export default function ImagePicker({ value, onChange, label, placeholder, altText, onAltTextChange }: Props) {
  const [showLibrary, setShowLibrary] = useState(false);

  return (
    <div>
      {label && <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          {value && (
            <img
              src={value}
              alt=""
              className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded object-cover border border-gray-200"
            />
          )}
          <input
            type="url"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder || 'https://...'}
            className={`w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm ${value ? 'pl-10' : ''}`}
          />
        </div>
        <button
          onClick={() => setShowLibrary(true)}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
        >
          <Image size={14} />
          Parcourir
        </button>
      </div>
      {onAltTextChange && (
        <div className="mt-1.5">
          <input
            type="text"
            value={altText || ''}
            onChange={e => onAltTextChange(e.target.value)}
            placeholder="Texte alternatif (accessibilité, SEO)"
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
          />
          <p className="text-[10px] text-gray-400 mt-0.5">Décrivez l’image pour l’accessibilité et le SEO</p>
        </div>
      )}

      {showLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={e => { if (e.target === e.currentTarget) setShowLibrary(false); }}>
          <div className="relative w-full max-w-4xl mx-4">
            <button onClick={() => setShowLibrary(false)} className="absolute -top-3 -right-3 z-10 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md border border-gray-200 text-gray-500 hover:text-gray-700 text-lg leading-none">×</button>
            <MediaLibrary
              onSelect={(url) => { onChange(url); setShowLibrary(false); }}
              onClose={() => setShowLibrary(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
