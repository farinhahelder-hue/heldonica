import { describe, it, expect } from 'vitest'
import {
  buildImageAdjustment,
  normalizeFit,
  normalizePosition,
  normalizeRatio,
} from '@/lib/image-adjustment'

describe('normalizeRatio', () => {
  it('accepte les séparateurs / et :, avec ou sans espaces', () => {
    expect(normalizeRatio('16/9')).toBe('16 / 9')
    expect(normalizeRatio('16:9')).toBe('16 / 9')
    expect(normalizeRatio(' 4 / 3 ')).toBe('4 / 3')
  })

  it('rejette ce qui n’est pas un ratio', () => {
    expect(normalizeRatio('')).toBeUndefined()
    expect(normalizeRatio(undefined)).toBeUndefined()
    expect(normalizeRatio('16')).toBeUndefined()
    expect(normalizeRatio('16/9/4')).toBeUndefined()
    expect(normalizeRatio('16px/9')).toBeUndefined()
    expect(normalizeRatio('auto')).toBeUndefined()
  })

  it('rejette une tentative d’injection CSS', () => {
    expect(normalizeRatio('16/9; background: red')).toBeUndefined()
    expect(normalizeRatio('1/1} body{display:none')).toBeUndefined()
  })
})

describe('normalizePosition', () => {
  it('accepte les mots-clés et les pourcentages usuels', () => {
    expect(normalizePosition('top')).toBe('top')
    expect(normalizePosition('center')).toBe('center')
    expect(normalizePosition('50% 20%')).toBe('50% 20%')
    expect(normalizePosition('top right')).toBe('top right')
  })

  it('rejette au-delà de deux jetons ou un jeton inconnu', () => {
    expect(normalizePosition('top right left')).toBeUndefined()
    expect(normalizePosition('33%')).toBeUndefined()
    expect(normalizePosition('top 33%')).toBeUndefined()
    expect(normalizePosition('')).toBeUndefined()
  })

  it('rejette une tentative d’injection CSS', () => {
    expect(normalizePosition('top; background:url(x)')).toBeUndefined()
    expect(normalizePosition('url(javascript:alert(1))')).toBeUndefined()
  })
})

describe('normalizeFit', () => {
  it('ne retient que cover et contain', () => {
    expect(normalizeFit('cover')).toBe('cover')
    expect(normalizeFit('contain')).toBe('contain')
    expect(normalizeFit('fill')).toBeUndefined()
    expect(normalizeFit('')).toBeUndefined()
    expect(normalizeFit(undefined)).toBeUndefined()
  })
})

describe('buildImageAdjustment', () => {
  it('ne produit aucune propriété sans zone renseignée', () => {
    expect(buildImageAdjustment({}, 'home', 'hero_image')).toEqual({})
  })

  it('compose les trois réglages quand les zones existent', () => {
    const zones = {
      'home__hero_image_ratio': '16:9',
      'home__hero_image_position': '50% 20%',
      'home__hero_image_fit': 'contain',
    }
    expect(buildImageAdjustment(zones, 'home', 'hero_image')).toEqual({
      aspectRatio: '16 / 9',
      objectPosition: '50% 20%',
      objectFit: 'contain',
    })
  })

  it('ignore une zone invalide sans rejeter les autres', () => {
    const zones = {
      'home__hero_image_ratio': 'n’importe quoi',
      'home__hero_image_fit': 'contain',
    }
    expect(buildImageAdjustment(zones, 'home', 'hero_image')).toEqual({ objectFit: 'contain' })
  })

  it('applique le repli de fit seulement si aucune zone ne le surcharge', () => {
    expect(buildImageAdjustment({}, 'home', 'hero_image', 'cover')).toEqual({ objectFit: 'cover' })
    const zones = { 'home__hero_image_fit': 'contain' }
    expect(buildImageAdjustment(zones, 'home', 'hero_image', 'cover')).toEqual({ objectFit: 'contain' })
  })

  it('ne lit pas les zones d’une autre page ni d’une autre image', () => {
    const zones = { 'about__hero_image_fit': 'contain' }
    expect(buildImageAdjustment(zones, 'home', 'hero_image')).toEqual({})
  })
})
