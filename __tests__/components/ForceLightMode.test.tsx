import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import ForceLightMode from '@/app/panel-manager/ForceLightMode'

afterEach(() => {
  cleanup()
  document.documentElement.classList.remove('dark')
  document.documentElement.style.colorScheme = ''
  window.localStorage.clear()
})

describe('ForceLightMode (panel-manager)', () => {
  it('retire la classe dark à l’entrée du panneau', () => {
    document.documentElement.classList.add('dark')
    render(<ForceLightMode />)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.style.colorScheme).toBe('light')
  })

  it('restaure dark à la sortie si le thème enregistré est sombre', () => {
    document.documentElement.classList.add('dark')
    window.localStorage.setItem('theme', 'dark')
    const { unmount } = render(<ForceLightMode />)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    unmount()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('ne réapplique pas dark à la sortie en thème clair', () => {
    window.localStorage.setItem('theme', 'light')
    const { unmount } = render(<ForceLightMode />)
    unmount()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
