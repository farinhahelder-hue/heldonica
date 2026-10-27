import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import SerpAndSocialPreview from '@/components/admin/seo/SerpAndSocialPreview';

describe('SerpAndSocialPreview Component', () => {
  const mockArticle = {
    title: 'Sur les crêtes du Stoos en Suisse centrale',
    slug: 'suisse-stoos-panoramique',
    seo_title: 'Randonnée crêtes du Stoos : Guide slow travel',
    seo_description: 'Immersion à pied sans voiture sur les crêtes panoramiques du Stoos en Suisse.',
    category: 'Carnet de voyage',
    featured_image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
  };

  it('affiche le message d’invite si l’article est vide ou incomplet', () => {
    render(<SerpAndSocialPreview article={null} />);
    expect(screen.getByText(/Renseigne un titre et une méta-description pour voir l’aperçu/i)).toBeInTheDocument();
  });

  it('affiche l’aperçu Google Search avec l’URL et la méta-description', () => {
    render(<SerpAndSocialPreview article={mockArticle} />);

    // Entête Google
    expect(screen.getByText('Aperçu Google')).toBeInTheDocument();
    expect(screen.getByText(/https:\/\/www\.heldonica\.fr\/blog\/suisse-stoos-panoramique/i)).toBeInTheDocument();

    // Titre et description
    expect(screen.getAllByText('Randonnée crêtes du Stoos : Guide slow travel')[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Immersion à pied sans voiture sur les crêtes panoramiques du Stoos en Suisse\./i)[0]).toBeInTheDocument();
  });

  it('affiche l’aperçu du partage sur les réseaux sociaux', () => {
    render(<SerpAndSocialPreview article={mockArticle} />);

    expect(screen.getByText('Aperçu partage social')).toBeInTheDocument();
    expect(screen.getByText('suisse stoos panoramique')).toBeInTheDocument();
    expect(screen.getByAltText('Randonnée crêtes du Stoos : Guide slow travel')).toBeInTheDocument();
  });

  it('gère l’absence d’image de couverture dans la carte sociale', () => {
    const articleSansImage = {
      ...mockArticle,
      featured_image: undefined,
      og_image: undefined,
    };

    render(<SerpAndSocialPreview article={articleSansImage} />);

    expect(screen.getByText('Image de partage non définie')).toBeInTheDocument();
  });
});
