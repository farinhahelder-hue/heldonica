import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DiscoveryCallModal from '@/components/DiscoveryCallModal'
import LeadMagnetCoupleModal from '@/components/LeadMagnetCoupleModal'

describe('DiscoveryCallModal', () => {
  it('does not render when closed', () => {
    const { container } = render(
      <DiscoveryCallModal isOpen={false} onClose={() => {}} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders correctly when open with default voyageur audience', () => {
    render(<DiscoveryCallModal isOpen={true} onClose={() => {}} defaultAudience="voyageur" />)
    expect(screen.getByText('Échangeons de vive voix')).toBeDefined()
    expect(screen.getByText('Voyage en couple')).toBeDefined()
    expect(screen.getByText('Hôte ou hôtelier')).toBeDefined()
    expect(screen.getByPlaceholderText('Ex: Sophie & Marc')).toBeDefined()
  })

  it('switches audience to hotelier when clicked', () => {
    render(<DiscoveryCallModal isOpen={true} onClose={() => {}} defaultAudience="voyageur" />)
    const hotelierBtn = screen.getByText('Hôte ou hôtelier')
    fireEvent.click(hotelierBtn)
    expect(screen.getByPlaceholderText('Ex: Julien Laurent')).toBeDefined()
  })

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn()
    render(<DiscoveryCallModal isOpen={true} onClose={handleClose} />)
    const closeBtn = screen.getByLabelText('Fermer la fenêtre')
    fireEvent.click(closeBtn)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })
})

describe('LeadMagnetCoupleModal', () => {
  it('does not render when closed', () => {
    const { container } = render(
      <LeadMagnetCoupleModal isOpen={false} onClose={() => {}} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders guide title and email input when open', () => {
    render(<LeadMagnetCoupleModal isOpen={true} onClose={() => {}} />)
    expect(screen.getByText('Les 5 erreurs qui gâchent un voyage en couple')).toBeDefined()
    expect(screen.getByPlaceholderText('ton.email@exemple.fr')).toBeDefined()
  })
})
