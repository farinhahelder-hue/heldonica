import { describe, it, expect } from 'vitest'
import {
  fixDestinationPrepositions,
  inDestination,
  prepositionForDestination,
  stripAccents,
} from '@/lib/french-prepositions'

describe('french-prepositions', () => {
  it('choisit la préposition juste pour un pays, une région, une île ou une ville', () => {
    expect(prepositionForDestination('Roumanie')).toBe('en')
    expect(prepositionForDestination('Suisse')).toBe('en')
    expect(prepositionForDestination('Colombie')).toBe('en')
    expect(prepositionForDestination('Monténégro')).toBe('au')
    expect(prepositionForDestination('Portugal')).toBe('au')
    expect(prepositionForDestination('Pays-Bas')).toBe('aux')
    expect(prepositionForDestination('Madère')).toBe('à')
    expect(prepositionForDestination('Paris')).toBe('à')
  })

  it('ne double pas une préposition déjà présente', () => {
    expect(inDestination('Roumanie')).toBe('en Roumanie')
    expect(inDestination('en Roumanie')).toBe('en Roumanie')
    expect(inDestination('à Madère')).toBe('à Madère')
    expect(inDestination('  Monténégro ')).toBe('au Monténégro')
  })

  it('répare les gabarits « à + pays »', () => {
    expect(fixDestinationPrepositions('Quand partir à Roumanie ?')).toBe('Quand partir en Roumanie ?')
    expect(fixDestinationPrepositions('Où dormir à Monténégro ?')).toBe('Où dormir au Monténégro ?')
    expect(fixDestinationPrepositions('Séjour à Colombie')).toBe('Séjour en Colombie')
    expect(fixDestinationPrepositions('Week-end à Pays-Bas')).toBe('Week-end aux Pays-Bas')
  })

  it('laisse intactes les phrases où « au » n’est pas une destination', () => {
    const phrases = [
      "Le lever du soleil au bord de l'eau",
      'Un café au lait à la terrasse',
      'Notre rythme à deux',
      'Séjour à Madère',
    ]
    for (const phrase of phrases) {
      expect(fixDestinationPrepositions(phrase)).toBe(phrase)
    }
  })

  it('ignore les accents et la casse', () => {
    expect(fixDestinationPrepositions('Séjour à Montenegro')).toBe('Séjour au Montenegro')
    expect(fixDestinationPrepositions('séjour à ROUMANIE')).toBe('séjour en ROUMANIE')
    expect(stripAccents('Monténégro')).toBe('Montenegro')
  })
})
