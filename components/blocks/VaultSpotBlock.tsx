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
    <aside className={`my-8 relative overflow-hidden rounded-sm bg-[#FAF7F2] border border-[#DED5C6] p-6 md:p-8 ${className}`}>
      {/* Decorative badge */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] text-mahogany text-xs font-semibold tracking-[0.14em] uppercase">
          <Sparkles size={13} className="text-mahogany" />
          <span>Pépite Heldonica</span>
        </div>
        {location && (
          <div className="flex items-center gap-1.5 text-xs md:text-sm text-charcoal/60 font-medium">
            <MapPin size={14} className="text-eucalyptus" />
            <span>{location}</span>
          </div>
        )}
      </div>

      <div className="flex items-start gap-4">
        <div className="hidden sm:flex flex-shrink-0 w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] text-mahogany items-center justify-center">
          <Compass size={22} />
        </div>
        <div className="space-y-2">
          <h4 className="font-serif font-normal text-xl md:text-2xl text-mahogany tracking-tight">
            {title}
          </h4>
          <p className="text-charcoal/80 font-sans text-sm md:text-base leading-relaxed italic border-l-2 border-mahogany/40 pl-3.5 my-2">
            « {livedExperience} »
          </p>
        </div>
      </div>
    </aside>
  );
}
