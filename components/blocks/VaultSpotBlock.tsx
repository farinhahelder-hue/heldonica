import React from 'react';
import type { VaultSpotBlock as VaultSpotBlockType } from '@/types/cms-blocks';
import { Compass, MapPin, Sparkles } from 'lucide-react';

interface Props {
  block: VaultSpotBlockType;
  className?: string;
}

export function VaultSpotBlock({ block, className = '' }: Props) {
  const { title, location, livedExperience } = block;

  return (
    <aside className={`my-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50/70 via-stone-50 to-orange-50/40 border border-amber-200/60 p-6 md:p-8 shadow-sm ${className}`}>
      {/* Decorative badge */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold tracking-wide">
          <Sparkles size={13} className="text-amber-600 fill-amber-500" />
          <span>Pépite Heldonica</span>
        </div>
        {location && (
          <div className="flex items-center gap-1.5 text-xs md:text-sm text-stone-500 font-medium">
            <MapPin size={14} className="text-amber-700" />
            <span>{location}</span>
          </div>
        )}
      </div>

      <div className="flex items-start gap-4">
        <div className="hidden sm:flex flex-shrink-0 w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 items-center justify-center">
          <Compass size={22} />
        </div>
        <div className="space-y-2">
          <h4 className="font-serif text-xl md:text-2xl font-medium text-stone-900 tracking-tight">
            {title}
          </h4>
          <p className="text-stone-700 font-sans text-sm md:text-base leading-relaxed italic border-l-2 border-amber-400 pl-3.5 my-2">
            « {livedExperience} »
          </p>
        </div>
      </div>
    </aside>
  );
}
