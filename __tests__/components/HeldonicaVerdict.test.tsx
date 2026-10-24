import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HeldonicaVerdict from '@/components/HeldonicaVerdict';

describe('HeldonicaVerdict', () => {
  it('renders nothing when items array is empty', () => {
    const { container } = render(<HeldonicaVerdict items={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders correctly with default title and a single item', () => {
    const items = [
      {
        name: 'Super Café',
        address: '123 Rue de Paris',
        hours: '10h - 18h',
        price: '15€',
        testDate: '2023-10-15',
        rating: 4.5,
        comment: 'Très bon café.'
      }
    ];
    render(<HeldonicaVerdict items={items} />);

    expect(screen.getByText('Le verdict Heldonica')).toBeTruthy();
    expect(screen.getByText('Super Café')).toBeTruthy();
    expect(screen.getByText('123 Rue de Paris')).toBeTruthy();
    expect(screen.getByText('10h - 18h')).toBeTruthy();
    expect(screen.getByText('Prix constaté : 15€')).toBeTruthy();
    expect(screen.getByText('Très bon café.')).toBeTruthy();
    expect(screen.getByText('4.5/5')).toBeTruthy();
    expect(screen.getByText('Testé octobre 2023')).toBeTruthy();
  });

  it('renders custom title and handles optional fields correctly', () => {
    const items = [
      {
        name: 'Spot Secret',
        testDate: 'invalid-date',
        rating: 3,
      }
    ];
    render(<HeldonicaVerdict items={items} title="Mon Verdict" />);

    expect(screen.getByText('Mon Verdict')).toBeTruthy();
    expect(screen.getByText('Spot Secret')).toBeTruthy();
    expect(screen.getByText('3/5')).toBeTruthy();
    expect(screen.getByText('Testé Invalid Date')).toBeTruthy();
  });
});
