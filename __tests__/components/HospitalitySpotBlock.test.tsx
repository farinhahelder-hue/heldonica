import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { HospitalitySpotBlock } from '@/components/blocks/HospitalitySpotBlock';
import type { HospitalitySpotBlock as HospitalitySpotBlockType } from '@/types/cms-blocks';

describe('HospitalitySpotBlock', () => {
  const mockBlock: HospitalitySpotBlockType = {
    id: 'blk_test',
    type: 'hospitality_spot',
    name: 'Auberge du Val Sauvage',
    location: 'Murol, Massif Central',
    hostName: 'Marie et Pierre',
    ethicalCriteria: {
      localFood: true,
      lowCarbonAccess: false,
      quietAtmosphere: true,
      fairPricing: true,
    },
    livedAnecdote: 'Le meilleur petit-déjeuner de la région avec la confiture de myrtilles de Marie.',
    directBookingUrl: 'https://auberge-val-sauvage.com',
    priceIndication: '120 - 150 € la nuit avec petit-déjeuner',
  };

  it('renders all main elements correctly', () => {
    const { container } = render(<HospitalitySpotBlock block={mockBlock} />);

    // Basic info
    expect(screen.getByText('Auberge du Val Sauvage')).toBeInTheDocument();
    expect(screen.getByText('Murol, Massif Central')).toBeInTheDocument();
    expect(screen.getByText('Hôte : Marie et Pierre')).toBeInTheDocument();
    expect(screen.getByText('120 - 150 € la nuit avec petit-déjeuner')).toBeInTheDocument();

    // Badges (only those set to true)
    expect(screen.getByText('Produits ultra-locaux / fait maison')).toBeInTheDocument();
    expect(screen.getByText('Déconnexion sonore')).toBeInTheDocument();
    expect(screen.getByText('Tarifs équitables')).toBeInTheDocument();
    
    // Low carbon access should NOT be present
    expect(screen.queryByText('Accessible sans voiture')).not.toBeInTheDocument();

    // Anecdote
    expect(screen.getByText(/Le meilleur petit-déjeuner/)).toBeInTheDocument();

    // CTA
    const link = screen.getByRole('link', { name: /Réserver en direct/i });
    expect(link).toHaveAttribute('href', 'https://auberge-val-sauvage.com');
  });

  it('generates the correct Schema.org JSON-LD', () => {
    const { container } = render(<HospitalitySpotBlock block={mockBlock} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    
    expect(script).not.toBeNull();
    const json = JSON.parse(script!.innerHTML);
    
    expect(json['@context']).toBe('https://schema.org');
    expect(json['@type']).toBe('BedAndBreakfast');
    expect(json.name).toBe('Auberge du Val Sauvage');
    expect(json.address).toBe('Murol, Massif Central');
    expect(json.url).toBe('https://auberge-val-sauvage.com');
  });
  
  it('does not render optional elements if missing', () => {
    const minBlock: HospitalitySpotBlockType = {
      ...mockBlock,
      hostName: undefined,
      livedAnecdote: undefined,
      directBookingUrl: undefined,
      priceIndication: undefined,
      ethicalCriteria: {
        localFood: false,
        lowCarbonAccess: false,
        quietAtmosphere: false,
        fairPricing: false,
      }
    };
    
    render(<HospitalitySpotBlock block={minBlock} />);
    
    // Missing info
    expect(screen.queryByText(/Hôte/)).not.toBeInTheDocument();
    expect(screen.queryByText(/€ la nuit/)).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    
    // Badges
    expect(screen.queryByText('Produits ultra-locaux / fait maison')).not.toBeInTheDocument();
  });
});
