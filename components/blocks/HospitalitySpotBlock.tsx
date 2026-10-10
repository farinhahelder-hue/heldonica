import React from 'react';
import type { HospitalitySpotBlock as HospitalitySpotBlockType } from '@/types/cms-blocks';
import { Bed, MapPin, CheckCircle2, Leaf, Coffee, VolumeX, ShieldCheck } from 'lucide-react';

interface Props {
  block: HospitalitySpotBlockType;
  className?: string;
}

export function HospitalitySpotBlock({ block, className = '' }: Props) {
  const { name, location, hostName, ethicalCriteria, livedAnecdote, directBookingUrl, priceIndication } = block;

  const criteriaList = [
    { key: 'localFood', label: 'Produits ultra-locaux / fait maison', icon: Coffee, active: ethicalCriteria.localFood },
    { key: 'lowCarbonAccess', label: 'Accessible sans voiture', icon: Leaf, active: ethicalCriteria.lowCarbonAccess },
    { key: 'quietAtmosphere', label: 'Déconnexion sonore', icon: VolumeX, active: ethicalCriteria.quietAtmosphere },
    { key: 'fairPricing', label: 'Tarifs équitables', icon: ShieldCheck, active: ethicalCriteria.fairPricing },
  ].filter(c => c.active);

  const schemaOrgData = {
    '@context': 'https://schema.org',
    '@type': 'BedAndBreakfast', // Fallback to a general hospitality type
    name: name,
    address: location,
    ...(directBookingUrl ? { url: directBookingUrl } : {}),
  };

  return (
    <article className={`my-10 relative overflow-hidden rounded-2xl bg-stone-50 border border-stone-200 p-6 md:p-8 shadow-sm ${className}`}>
      {/* Schema.org microdata injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgData) }}
      />
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <h3 className="font-serif text-2xl md:text-3xl text-stone-900 mb-2">{name}</h3>
          <div className="flex items-center gap-4 text-stone-600 text-sm">
            <div className="flex items-center gap-1.5">
              <MapPin size={16} className="text-amber-700" />
              <span>{location}</span>
            </div>
            {hostName && (
              <div className="flex items-center gap-1.5">
                <Bed size={16} className="text-amber-700" />
                <span>Hôte : {hostName}</span>
              </div>
            )}
          </div>
        </div>
        
        {priceIndication && (
          <div className="flex-shrink-0 bg-white border border-stone-200 px-4 py-2 rounded-xl">
            <span className="text-sm font-medium text-stone-800">{priceIndication}</span>
          </div>
        )}
      </div>

      {/* Ethical Badges */}
      {criteriaList.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {criteriaList.map((criterion) => {
            const Icon = criterion.icon;
            return (
              <div key={criterion.key} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-900 text-xs font-medium">
                <Icon size={14} className="text-teal-700" />
                <span>{criterion.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Anecdote */}
      {livedAnecdote && (
        <div className="my-6 pl-4 border-l-2 border-amber-400">
          <p className="text-stone-700 font-sans text-base leading-relaxed italic">
            « {livedAnecdote} »
          </p>
        </div>
      )}

      {/* CTA */}
      {directBookingUrl && (
        <div className="mt-8">
          <a
            href={directBookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            Réserver en direct auprès de l'hôte
            <CheckCircle2 size={16} className="text-amber-400" />
          </a>
          <p className="text-xs text-stone-500 mt-2">
            Zéro commission pour l'hôte.
          </p>
        </div>
      )}
    </article>
  );
}
