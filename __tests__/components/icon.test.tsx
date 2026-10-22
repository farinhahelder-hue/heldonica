import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmojiIcon, Stars, iconFor } from '@/components/ui/Icon'

describe('registre d’icônes', () => {
  it('rend un picto vectoriel pour un emoji connu', () => {
    const { container } = render(<EmojiIcon emoji="🏛️" />)

    expect(container.querySelector('svg')).toBeTruthy()
    expect(container.textContent).toBe('')
  })

  it('accepte un nom sémantique en plus de l’emoji', () => {
    expect(iconFor('leaf')).toBe(iconFor('🌿'))
    expect(iconFor('budget')).toBeTruthy()
  })

  it('laisse intact un emoji inconnu plutôt que de le remplacer par un trou', () => {
    render(<EmojiIcon emoji="🫎" />)

    expect(screen.getByText('🫎')).toBeTruthy()
  })

  it('expose le sens quand l’icône en porte un', () => {
    render(<EmojiIcon emoji="🌿" label="Nature" />)

    expect(screen.getByRole('img', { name: 'Nature' })).toBeTruthy()
  })

  it('rend une note en étoiles lisible par un lecteur d’écran', () => {
    render(<Stars value={4} />)

    expect(screen.getByRole('img', { name: '4 sur 5' })).toBeTruthy()
  })
})
