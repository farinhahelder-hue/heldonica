import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MapBlock } from '../../components/blocks/MapBlock';
import type { MapBlock as MapBlockType } from '../../types/cms-blocks';

// MapBlock internally imports leaflet. We mock leaflet to prevent errors in JSDOM.
vi.mock('leaflet', () => {
  const L = {
    map: vi.fn(() => ({
      setView: vi.fn().mockReturnThis(),
      remove: vi.fn(),
    })),
    tileLayer: vi.fn(() => ({
      addTo: vi.fn(),
    })),
    marker: vi.fn(() => ({
      addTo: vi.fn().mockReturnThis(),
      bindPopup: vi.fn().mockReturnThis(),
    })),
    icon: vi.fn(() => ({})),
    Marker: {
      prototype: {
        options: {
          icon: {}
        }
      }
    }
  };
  return { default: L };
});

describe('MapBlock', () => {
  const baseBlock: MapBlockType = {
    id: 'block-map',
    type: 'map',
    center: { lat: 48.8566, lng: 2.3522 },
    zoom: 13,
    caption: 'Test Map Caption',
    markers: [
      { id: 'm1', lat: 48.8, lng: 2.3, label: 'Eiffel Tower', description: 'Tall iron lady' }
    ]
  };

  it('renders map container, caption and accessibility markers transcript', () => {
    render(<MapBlock block={baseBlock} />);

    // Renders the caption correctly
    expect(screen.getByText('Test Map Caption')).toBeInTheDocument();

    // Renders screen reader markers list
    expect(screen.getByText(/Points d'intérêt sur la carte :/)).toBeInTheDocument();
    expect(screen.getByText('Eiffel Tower')).toBeInTheDocument();
    expect(screen.getByText(/Tall iron lady/)).toBeInTheDocument();
  });

  it('renders gracefully even with no markers', () => {
    const blockNoMarkers: MapBlockType = { ...baseBlock, markers: [] };
    render(<MapBlock block={blockNoMarkers} />);
    
    expect(screen.queryByText(/Points d'intérêt sur la carte :/)).not.toBeInTheDocument();
  });

  it('renders gracefully with missing center coordinates (defaults to Paris)', () => {
    const blockMissingCenter = { ...baseBlock, center: undefined } as unknown as MapBlockType;
    const { container } = render(<MapBlock block={blockMissingCenter} />);
    
    // As long as it renders without throwing and creates the wrapper, we are good.
    expect(container.querySelector('.map-block')).toBeInTheDocument();
  });
});
