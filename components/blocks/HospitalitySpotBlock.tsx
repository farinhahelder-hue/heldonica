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
    <article className={`my-10 relative overflow-hidden rounded-sm bg-[#FAF7F2] border border-[#DED5C6] p-6 md:p-8 ${className}`}>
      {/* Schema.org microdata injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgData) }}
      />
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <h3 className="font-serif font-normal text-2xl md:text-3xl text-mahogany mb-2">{name}</h3>
          <div className="flex items-center gap-4 text-charcoal/70 text-sm">
            <div className="flex items-center gap-1.5">
              <MapPin size={16} className="text-eucalyptus" />
              <span>{location}</span>
            </div>
            {hostName && (
              <div className="flex items-center gap-1.5">
                <Bed size={16} className="text-eucalyptus" />
                <span>Hôte : {hostName}</span>
              </div>
            )}
          </div>
        </div>
        
        {priceIndication && (
          <div className="flex-shrink-0 bg-[#F7F3EC] border border-[#DED5C6] px-4 py-2 rounded-sm">
            <span className="text-sm font-medium text-charcoal">{priceIndication}</span>
          </div>
        )}
      </div>

      {/* Ethical Badges */}
      {criteriaList.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {criteriaList.map((criterion) => {
            const Icon = criterion.icon;
            return (
              <div key={criterion.key} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] text-charcoal/80 text-xs font-medium">
                <Icon size={14} className="text-eucalyptus" />
                <span>{criterion.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Anecdote */}
      {livedAnecdote && (
        <div className="my-6 pl-4 border-l-2 border-mahogany/40">
          <p className="text-charcoal/80 font-sans text-base leading-relaxed italic">
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
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-sm text-sm font-medium transition-colors"
          >
            Réserver en direct auprès de l'hôte
            <CheckCircle2 size={16} className="text-eucalyptus" />
          </a>
          <p className="text-xs text-charcoal/50 mt-2">
            Zéro commission pour l'hôte.
          </p>
        </div>
      )}
    </article>
  );
}
