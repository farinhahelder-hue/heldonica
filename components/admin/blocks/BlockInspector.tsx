'use client';

import React, { useMemo } from 'react';
import type {
  CmsBlock,
  BlockType,
  TextBlock,
  HeadingBlock,
  ImageBlock,
  GalleryBlock,
  ButtonBlock,
  ListBlock,
  VideoBlock,
  VaultSpotBlock,
  PhotoEvidenceBlock,
  MapBlock,
  TableOfContentsBlock,
  HospitalitySpotBlock,
} from '@/types/cms-blocks';

type FieldKind = 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'url';

interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  options?: { label: string; value: string }[];
  placeholder?: string;
}

interface BlockSchema {
  label: string;
  description: string;
  fields: FieldDef[];
}

const BLOCK_SCHEMAS: Record<BlockType, BlockSchema> = {
  heading: {
    label: 'Titre',
    description: 'Titres H1 à H4 avec typographie',
    fields: [
      { key: 'level', label: 'Niveau', kind: 'select', options: [
        { label: 'H1 - Titre principal', value: '1' },
        { label: 'H2 - Titre de section', value: '2' },
        { label: 'H3 - Sous-titre', value: '3' },
        { label: 'H4 - Petit titre', value: '4' },
      ] },
      { key: 'text', label: 'Texte', kind: 'text', placeholder: 'Titre du bloc...' },
      { key: 'subtitle', label: 'Sous-titre', kind: 'text', placeholder: 'Sous-titre optionnel...' },
    ],
  },
  text: {
    label: 'Paragraphe',
    description: 'Texte riche ou paragraphes',
    fields: [
      { key: 'content', label: 'Contenu', kind: 'textarea', placeholder: 'Écrivez votre paragraphe...', },
    ],
  },
  image: {
    label: 'Image',
    description: 'Photo responsive et légende',
    fields: [
      { key: 'url', label: 'URL de l’image', kind: 'url', placeholder: 'https://...' },
      { key: 'alt', label: 'Texte alternatif', kind: 'text', placeholder: 'Description de l’image' },
      { key: 'caption', label: 'Légende', kind: 'text', placeholder: 'Légende optionnelle' },
      { key: 'layout', label: 'Disposition', kind: 'select', options: [
        { label: 'Inline', value: 'inline' },
        { label: 'Large', value: 'wide' },
        { label: 'Plein écran', value: 'fullwidth' },
      ] },
      { key: 'aspectRatio', label: 'Ratio', kind: 'select', options: [
        { label: '16:9', value: '16:9' },
        { label: '4:3', value: '4:3' },
        { label: '1:1', value: '1:1' },
        { label: 'Auto', value: 'auto' },
      ] },
    ],
  },
  gallery: {
    label: 'Galerie / Carrousel',
    description: 'Diaporama ou grille de photos',
    fields: [
      { key: 'displayMode', label: 'Mode d’affichage', kind: 'select', options: [
        { label: 'Carrousel', value: 'carousel' },
        { label: 'Grille 2', value: 'grid_2' },
        { label: 'Grille 3', value: 'grid_3' },
        { label: 'Mosaïque', value: 'masonry' },
      ] },
    ],
  },
  video: {
    label: 'Vidéo & Shorts',
    description: 'YouTube, format standard ou 9:16',
    fields: [
      { key: 'source', label: 'Source', kind: 'select', options: [
        { label: 'YouTube', value: 'youtube' },
        { label: 'Fichier local', value: 'local' },
      ] },
      { key: 'url', label: 'URL de la vidéo', kind: 'url', placeholder: 'https://...' },
      { key: 'aspectRatio', label: 'Ratio', kind: 'select', options: [
        { label: '16:9', value: '16:9' },
        { label: '9:16', value: '9:16' },
      ] },
      { key: 'caption', label: 'Légende', kind: 'text', placeholder: 'Légende optionnelle' },
    ],
  },
  button: {
    label: 'Bouton / Lien',
    description: 'Appel à l action ou lien externe',
    fields: [
      { key: 'label', label: 'Étiquette', kind: 'text', placeholder: 'Découvrir la suite' },
      { key: 'url', label: 'URL cible', kind: 'url', placeholder: 'https://...' },
      { key: 'variant', label: 'Style', kind: 'select', options: [
        { label: 'Or primaire', value: 'primary_gold' },
        { label: 'Contour', value: 'outline' },
        { label: 'Discret', value: 'subtle' },
      ] },
      { key: 'openInNewTab', label: 'Ouvrir dans un nouvel onglet', kind: 'checkbox' },
    ],
  },
  list: {
    label: 'Liste / Checklist',
    description: 'Puces, numéros ou checklist voyage',
    fields: [
      { key: 'style', label: 'Style', kind: 'select', options: [
        { label: 'Puces', value: 'bullet' },
        { label: 'Numérotée', value: 'numbered' },
        { label: 'Checklist', value: 'checklist' },
      ] },
      { key: 'items', label: 'Éléments (un par ligne)', kind: 'textarea', placeholder: 'Premier élément\nDeuxième élément' },
    ],
  },
  vault_spot: {
    label: 'Pépite du Coffre',
    description: 'Encadré lié au Coffre des Savoirs RAG',
    fields: [
      { key: 'spotId', label: 'ID du spot (Coffre)', kind: 'text', placeholder: 'ID RAG…' },
      { key: 'title', label: 'Titre', kind: 'text', placeholder: 'Pépite dénichée' },
      { key: 'location', label: 'Lieu', kind: 'text', placeholder: 'Lieu authentique' },
      { key: 'livedExperience', label: 'Expérience vécue', kind: 'textarea', placeholder: 'Notre vécu sur place…' },
    ],
  },
  photo_evidence: {
    label: 'Preuve photo',
    description: 'Photo + lieu, date, anecdote et album',
    fields: [
      { key: 'imageUrl', label: 'URL de l’image', kind: 'url', placeholder: 'https://...' },
      { key: 'location', label: 'Lieu exact', kind: 'text', placeholder: 'Lieu vécu et vérifiable' },
      { key: 'date', label: 'Date (ISO)', kind: 'text', placeholder: 'YYYY-MM-DD' },
      { key: 'anecdote', label: 'Anecdote', kind: 'textarea', placeholder: 'Max 200 caractères, vécue et vérifiable' },
      { key: 'albumLink', label: 'Lien album', kind: 'url', placeholder: 'https://...' },
      { key: 'cameraInfo', label: 'Boîtier & Optique', kind: 'text', placeholder: 'Nikon D7200 • 35mm f/1.8' },
    ],
  },
  map: {
    label: 'Carte & Repères',
    description: 'Balade avec étapes géolocalisées',
    fields: [
      { key: 'center.lat', label: 'Latitude', kind: 'number', placeholder: '48.8566' },
      { key: 'center.lng', label: 'Longitude', kind: 'number', placeholder: '2.3522' },
      { key: 'zoom', label: 'Zoom (1-18)', kind: 'number', placeholder: '13' },
      { key: 'mapStyle', label: 'Style', kind: 'select', options: [
        { label: 'Topo', value: 'topo' },
        { label: 'Minimal', value: 'minimal' },
        { label: 'Voyage', value: 'voyage' },
      ] },
      { key: 'caption', label: 'Légende', kind: 'text', placeholder: 'Légende optionnelle' },
    ],
  },
  table_of_contents: {
    label: 'Sommaire interactif',
    description: 'Table des matières calculée sur les titres',
    fields: [
      { key: 'title', label: 'Titre', kind: 'text', placeholder: 'Au fil du carnet' },
      { key: 'maxLevel', label: 'Niveau max', kind: 'select', options: [
        { label: 'H2', value: '2' },
        { label: 'H3', value: '3' },
      ] },
      { key: 'displayStyle', label: 'Style', kind: 'select', options: [
        { label: 'Liste', value: 'list' },
        { label: 'Numéroté', value: 'numbered' },
        { label: 'Cartes', value: 'cards' },
      ] },
    ],
  },
  hospitality_spot: {
    label: 'Hébergement Éthique',
    description: 'Chambre d’hôtes ou hôtel slow travel',
    fields: [
      { key: 'name', label: 'Nom', kind: 'text', placeholder: 'Nom de l’hébergement' },
      { key: 'location', label: 'Lieu', kind: 'text', placeholder: 'Lieu de l’hébergement' },
      { key: 'hostName', label: 'Hôte', kind: 'text', placeholder: 'Nom de l’hôte' },
      { key: 'livedAnecdote', label: 'Anecdote vécue', kind: 'textarea', placeholder: 'Notre expérience sur place…' },
      { key: 'directBookingUrl', label: 'Réservation directe', kind: 'url', placeholder: 'https://...' },
      { key: 'priceIndication', label: 'Indication de prix', kind: 'text', placeholder: 'Ex: 120 € la nuit' },
      { key: 'ethicalCriteria.localFood', label: 'Produits locaux', kind: 'checkbox' },
      { key: 'ethicalCriteria.lowCarbonAccess', label: 'Accès bas carbone', kind: 'checkbox' },
      { key: 'ethicalCriteria.quietAtmosphere', label: 'Ambiance calme', kind: 'checkbox' },
      { key: 'ethicalCriteria.fairPricing', label: 'Tarifs justes', kind: 'checkbox' },
    ],
  },
};

function getNested(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => (acc == null ? undefined : acc[part]), obj);
}

function setNested(obj: any, path: string, value: any): any {
  const parts = path.split('.');
  const last = parts.pop()!;
  const target = parts.reduce((acc, part) => {
    if (!(part in acc) || acc[part] == null) acc[part] = {};
    return acc[part];
  }, obj);
  target[last] = value;
  return obj;
}

interface BlockInspectorProps {
  block: CmsBlock | null;
  onUpdate: (patch: Partial<CmsBlock>) => void;
}

export function BlockInspector({ block, onUpdate }: BlockInspectorProps) {
  if (!block) return null;

  const schema = BLOCK_SCHEMAS[block.type];

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 shadow-sm sticky top-4 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-3 border-b border-stone-200 pb-2">
        <div>
          <h3 className="text-sm font-bold text-stone-900 font-serif">{schema.label}</h3>
          <p className="text-[10px] text-stone-500">{schema.description}</p>
        </div>
        <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full font-semibold">
          Bloc {block.type}
        </span>
      </div>

      <div className="space-y-3 text-xs">
        {schema.fields.map((field) => {
          const isNested = field.key.includes('.');
          const baseKey = isNested ? field.key.split('.')[0] : field.key;
          const current = block as any;
          const value = getNested(current, field.key);

          const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            let next: any;
            if (field.kind === 'checkbox') {
              next = (e.target as HTMLInputElement).checked;
            } else if (field.kind === 'number') {
              next = e.target.value === '' ? undefined : Number(e.target.value);
            } else {
              next = e.target.value;
            }
            const patch = setNested({ ...block }, field.key, next) as CmsBlock;
            // Supprimer les clés mises à undefined pour rester propre
            onUpdate(patch);
          };

          return (
            <div key={field.key} className="space-y-1">
              <label className="flex items-center justify-between text-stone-700 font-medium">
                {field.label}
                {field.kind === 'checkbox' && <span className="text-[10px] text-stone-400 font-normal">{(value ? 'activé' : 'désactivé')}</span>}
              </label>

              {field.kind === 'checkbox' ? (
                <input
                  type="checkbox"
                  checked={!!value}
                  onChange={onChange}
                  className="rounded border-stone-200 text-amber-600 focus:ring-amber-500"
                />
              ) : field.kind === 'select' ? (
                <select
                  value={String(value ?? '')}
                  onChange={onChange}
                  className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-stone-800 focus:outline-none focus:border-amber-500"
                >
                  <option value="">{field.placeholder || 'Choisir…'}</option>
                  {field.options?.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : field.kind === 'textarea' ? (
                <textarea
                  rows={2}
                  value={value ?? ''}
                  onChange={onChange}
                  placeholder={field.placeholder}
                  className="w-full bg-white border border-stone-200 rounded-xl p-2.5 text-stone-800 focus:outline-none focus:border-amber-500 resize-y"
                />
              ) : (
                <input
                  type={field.kind}
                  value={value ?? ''}
                  onChange={onChange}
                  placeholder={field.placeholder}
                  className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-stone-800 focus:outline-none focus:border-amber-500"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
