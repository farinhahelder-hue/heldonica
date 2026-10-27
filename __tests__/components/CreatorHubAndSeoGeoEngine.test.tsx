import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CreatorHub from '@/components/admin/CreatorHub'
import SeoGeoEngine from '@/components/admin/SeoGeoEngine'
import { CreatorQuickDock } from '@/components/admin/CreatorQuickDock'

describe('CreatorHub', () => {
  it('renders Google, Meta, and YouTube direct launcher cards', () => {
    render(<CreatorHub />)

    expect(screen.getByText(/Hub Créateur & Accès Direct aux Suites/i)).toBeInTheDocument()
    expect(screen.getByText('Google Search Console')).toBeInTheDocument()
    expect(screen.getByText('Google Analytics 4')).toBeInTheDocument()
    expect(screen.getByText('Meta Business Suite')).toBeInTheDocument()
    expect(screen.getByText('Instagram (@heldonica)')).toBeInTheDocument()
    expect(screen.getByText('YouTube Studio (Creator)')).toBeInTheDocument()
    expect(screen.getByText('Google Jules Agent')).toBeInTheDocument()
  })

  it('filters services by category', () => {
    render(<CreatorHub />)

    const socialFilter = screen.getByText('Réseaux & Vidéo')
    fireEvent.click(socialFilter)

    expect(screen.getByText('Instagram (@heldonica)')).toBeInTheDocument()
    expect(screen.getByText('YouTube Studio (Creator)')).toBeInTheDocument()
    expect(screen.queryByText('Google Search Console')).not.toBeInTheDocument()
  })
})

describe('SeoGeoEngine', () => {
  it('renders destination pillars with geo coordinates and audit signals', () => {
    render(<SeoGeoEngine />)

    expect(screen.getByText(/Moteur SEO & Géo-Positionnement Sémantique/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Madère \(Fajãs & Laurisylve\)/i)[0]).toBeInTheDocument()
    expect(screen.getByText(/Roumanie \(Apuseni & Bucarest\)/i)).toBeInTheDocument()
    expect(screen.getByText('Schema.org TouristTrip')).toBeInTheDocument()
    expect(screen.getByText('Google BreadcrumbList')).toBeInTheDocument()
    expect(screen.getByText('Lien OpenStreetMap (0€)')).toBeInTheDocument()
  })

  it('switches active destination card on click', () => {
    render(<SeoGeoEngine />)

    const roumanieBtn = screen.getByText(/Roumanie \(Apuseni & Bucarest\)/i)
    fireEvent.click(roumanieBtn)

    expect(screen.getByText('https://www.heldonica.fr/destinations/roumanie')).toBeInTheDocument()
  })
})

describe('CreatorQuickDock', () => {
  it('opens quick launcher modal on click and displays direct links', () => {
    render(<CreatorQuickDock />)

    const trigger = screen.getByRole('button', { name: /hub créateur/i })
    expect(trigger).toBeInTheDocument()

    // Ouvre le dock
    fireEvent.click(trigger)

    expect(screen.getByPlaceholderText(/rechercher search console/i)).toBeInTheDocument()
    expect(screen.getByText('Google Search Console')).toBeInTheDocument()
    expect(screen.getByText('Meta Business Suite')).toBeInTheDocument()
    expect(screen.getByText('Google Jules (Agent IA)')).toBeInTheDocument()

    // Filtre la recherche
    const input = screen.getByPlaceholderText(/rechercher search console/i)
    fireEvent.change(input, { target: { value: 'jules' } })

    expect(screen.getByText('Google Jules (Agent IA)')).toBeInTheDocument()
    expect(screen.queryByText('Google Analytics 4')).not.toBeInTheDocument()
  })
})
