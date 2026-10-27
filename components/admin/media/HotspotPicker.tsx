'use client';

import React, { useState, useRef, useCallback } from 'react';
import type { ImageHotspot } from '@/types/cms-blocks';
import { Target, Sparkles, Smartphone, Monitor, Square } from 'lucide-react';

interface HotspotPickerProps {
  imageUrl: string;
  hotspot?: ImageHotspot;
  onChange: (hotspot: ImageHotspot) => void;
  onAutoFocalAi?: () => void;
  isAiLoading?: boolean;
}

const PRESETS = [
  { label: 'Centre', x: 0.5, y: 0.5 },
  { label: 'Visage / Sujet haut', x: 0.5, y: 0.25 },
  { label: 'Sommet / Ciel', x: 0.5, y: 0.15 },
  { label: 'Premier plan / Sol', x: 0.5, y: 0.8 },
  { label: 'Tiers gauche', x: 0.3, y: 0.5 },
  { label: 'Tiers droit', x: 0.7, y: 0.5 },
];

export function HotspotPicker({
  imageUrl,
  hotspot = { x: 0.5, y: 0.5 },
  onChange,
  onAutoFocalAi,
  isAiLoading = false,
}: HotspotPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showMultiPreview, setShowMultiPreview] = useState(false);

  const updateFromCoords = useCallback(
    (clientX: number, clientY: number) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const rawX = (clientX - rect.left) / rect.width;
      const rawY = (clientY - rect.top) / rect.height;
      const x = Math.max(0, Math.min(1, Math.round(rawX * 100) / 100));
      const y = Math.max(0, Math.min(1, Math.round(rawY * 100) / 100));
      onChange({ x, y });
    },
    [onChange]
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    updateFromCoords(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateFromCoords(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const focalXPercent = Math.round((hotspot?.x ?? 0.5) * 100);
  const focalYPercent = Math.round((hotspot?.y ?? 0.5) * 100);
  const objectPositionStyle = `${focalXPercent}% ${focalYPercent}%`;

  if (!imageUrl) {
    return null;
  }

  return (
    <div className="bg-stone-50 border border-stone-200/90 rounded-xl p-3.5 space-y-3">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Target size={14} className="text-amber-600" />
          <span className="text-xs font-semibold text-stone-700">Point focal & Cadrage dynamique (Sanity-style)</span>
          <span className="text-[10px] font-mono text-stone-400 bg-stone-200/60 px-1.5 py-0.5 rounded">
            X: {focalXPercent}% • Y: {focalYPercent}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onAutoFocalAi && (
            <button
              type="button"
              onClick={onAutoFocalAi}
              disabled={isAiLoading}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200/70 transition-colors"
            >
              <Sparkles size={11} className={isAiLoading ? 'animate-spin' : ''} />
              <span>{isAiLoading ? 'Analyse…' : 'Cadrage IA'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowMultiPreview((prev) => !prev)}
            className="text-[11px] text-stone-500 hover:text-stone-800 underline"
          >
            {showMultiPreview ? 'Masquer aperçus' : 'Aperçus multi-formats'}
          </button>
        </div>
      </div>

      <p className="text-[11px] text-stone-500">
        Cliquez ou glissez la mire sur le centre d'intérêt (clocher, regard, horizon). L'image s'adaptera sans jamais couper ce sujet, du mobile vertical 9:16 au panorama 16:9.
      </p>

      {/* Surface interactive de sélection du point focal */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative w-full aspect-[16/9] max-h-56 bg-stone-900 rounded-lg overflow-hidden cursor-crosshair select-none border border-stone-300 shadow-inner group"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Sélection du point focal"
          className="w-full h-full object-cover pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity"
        />

        {/* Lignes de repère des tiers (grille de composition photographique) */}
        <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-20">
          <div className="border-r border-b border-white" />
          <div className="border-r border-b border-white" />
          <div className="border-b border-white" />
          <div className="border-r border-b border-white" />
          <div className="border-r border-b border-white" />
          <div className="border-b border-white" />
          <div className="border-r border-white" />
          <div className="border-r border-white" />
          <div />
        </div>

        {/* Mire du Hotspot interactif */}
        <div
          style={{
            left: `${focalXPercent}%`,
            top: `${focalYPercent}%`,
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center"
        >
          {/* Cercle extérieur pulsé */}
          <span className="w-8 h-8 rounded-full border-2 border-white/90 shadow-md bg-amber-500/30 flex items-center justify-center animate-pulse">
            {/* Point central */}
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm border border-stone-900" />
          </span>
          {/* Réticule de visée */}
          <span className="absolute w-12 h-[1px] bg-white/70" />
          <span className="absolute h-12 w-[1px] bg-white/70" />
        </div>
      </div>

      {/* Presets rapides de cadrage */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {PRESETS.map((p) => {
          const isActive =
            Math.abs((hotspot?.x ?? 0.5) - p.x) < 0.05 && Math.abs((hotspot?.y ?? 0.5) - p.y) < 0.05;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onChange({ x: p.x, y: p.y })}
              className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors ${
                isActive
                  ? 'bg-amber-600 text-white border-amber-600 font-semibold'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Aperçu comparatif multi-ratios en direct (Sanity-style) */}
      {showMultiPreview && (
        <div className="pt-2 border-t border-stone-200/80">
          <div className="text-[11px] font-semibold text-stone-600 mb-2 flex items-center gap-1">
            <span>Rendu en direct selon le support :</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {/* 16:9 Desktop */}
            <div className="space-y-1 text-center">
              <div className="w-full aspect-[16/9] rounded overflow-hidden bg-stone-200 border border-stone-300">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt=""
                  style={{ objectPosition: objectPositionStyle }}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-center gap-1 text-[10px] text-stone-500 font-medium">
                <Monitor size={10} />
                <span>16:9 Desktop</span>
              </div>
            </div>

            {/* 1:1 Carré */}
            <div className="space-y-1 text-center">
              <div className="w-full aspect-square rounded overflow-hidden bg-stone-200 border border-stone-300">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt=""
                  style={{ objectPosition: objectPositionStyle }}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-center gap-1 text-[10px] text-stone-500 font-medium">
                <Square size={10} />
                <span>1:1 Carré</span>
              </div>
            </div>

            {/* 9:16 Mobile Reel */}
            <div className="space-y-1 text-center">
              <div className="w-full aspect-[9/16] max-h-24 mx-auto rounded overflow-hidden bg-stone-200 border border-stone-300">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt=""
                  style={{ objectPosition: objectPositionStyle }}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-center gap-1 text-[10px] text-stone-500 font-medium">
                <Smartphone size={10} />
                <span>9:16 Mobile</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HotspotPicker;
