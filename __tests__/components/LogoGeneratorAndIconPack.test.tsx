import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LogoGenerator from '@/components/admin/LogoGenerator'
import IconPackExplorer from '@/components/admin/IconPackExplorer'

describe('LogoGenerator', () => {
  it('renders archetype buttons and default brand name', () => {
    render(<LogoGenerator />)

    expect(screen.getByText(/Générateur de Logo & Sceau Heldonica/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue('Heldonica')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Média & Voyages Singuliers')).toBeInTheDocument()
    expect(screen.getByText(/Sceau Botanique/i)).toBeInTheDocument()
    expect(screen.getByText(/Monogramme H/i)).toBeInTheDocument()
    expect(screen.getByText(/Rose des Vents/i)).toBeInTheDocument()
    expect(screen.getByText(/Éditorial Épuré/i)).toBeInTheDocument()
  })

  it('allows switching archetype and toggling preview background', () => {
    render(<LogoGenerator />)

    const monogramBtn = screen.getByText(/Monogramme H/i)
    fireEvent.click(monogramBtn)

    const darkBgBtn = screen.getByText('Fond Sombre')
    fireEvent.click(darkBgBtn)

    expect(screen.getByRole('button', { name: 'Fond Sombre' })).toHaveClass('bg-stone-900')
  })
})

describe('IconPackExplorer', () => {
  it('renders search bar and travel categories', () => {
    render(<IconPackExplorer />)

    expect(screen.getByText(/Pack d'Icônes Voyage Slow Travel/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Rechercher une icône/i)).toBeInTheDocument()
    expect(screen.getByText('Hospitalité')).toBeInTheDocument()
    expect(screen.getByText('Mobilité')).toBeInTheDocument()
    expect(screen.getByText('Terroir')).toBeInTheDocument()
  })

  it('filters icons by search query', () => {
    render(<IconPackExplorer />)

    const searchInput = screen.getByPlaceholderText(/Rechercher une icône/i)
    fireEvent.change(searchInput, { target: { value: 'train' } })

    expect(screen.getByText('Train')).toBeInTheDocument()
    expect(screen.queryByText('BedDouble')).not.toBeInTheDocument()
  })
})
