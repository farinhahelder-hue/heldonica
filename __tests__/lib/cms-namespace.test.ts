import { describe, it, expect } from 'vitest'
import { pathToNamespace } from '@/lib/cms-namespace'

describe('pathToNamespace', () => {
  it('racine -> home', () => {
    expect(pathToNamespace('/')).toBe('home')
  })
  it('sous-destination -> namespace pointillé du code', () => {
    expect(pathToNamespace('/destinations/roumanie/sibiu')).toBe('destinations-roumanie-sibiu')
  })
  it('normalise accents, casse et query', () => {
    expect(pathToNamespace('/Destinations/Île-de-France/Paris?preview_token=x')).toBe('destinations-ile-de-france-paris')
  })
  it('blog et carte', () => {
    expect(pathToNamespace('/blog')).toBe('blog')
    expect(pathToNamespace('/destinations/carte')).toBe('destinations-carte')
  })
})
