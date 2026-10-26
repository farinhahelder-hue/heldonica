import { describe, it, expect } from 'vitest'
import {
  buildFramingWrites,
  companionKey,
  readFraming,
  EMPTY_FRAMING,
} from '@/lib/image-framing'

describe('companionKey', () => {
  it('suffixe la clé de la zone image', () => {
    expect(companionKey('hero_image_url', 'fit')).toBe('hero_image_url_fit')
    expect(companionKey('hero_image_url', 'ratio')).toBe('hero_image_url_ratio')
    expect(companionKey('hero_image_url', 'position')).toBe('hero_image_url_position')
  })
})

describe('readFraming', () => {
  const zones = {
    'a-propos__hero_image_url_fit': { value: 'contain' },
    'a-propos__hero_image_url_ratio': { value: ' 16 / 9 ' },
    // position absente
  }

  it('préremplit depuis les zones compagnes, en trimant', () => {
    expect(readFraming(zones, 'a-propos', 'hero_image_url')).toEqual({
      fit: 'contain',
      ratio: '16 / 9',
      position: '',
    })
  })

  it('rend des chaînes vides quand aucune zone compagne n’existe', () => {
    expect(readFraming({}, 'a-propos', 'hero_image_url')).toEqual(EMPTY_FRAMING)
  })
})

describe('buildFramingWrites', () => {
  it('produit trois écritures actives pour des réglages valides, en normalisant', () => {
    const { writes, errors } = buildFramingWrites('a-propos', 'hero_image_url', {
      fit: 'contain',
      ratio: '16:9',
      position: 'top',
    })
    expect(errors).toEqual([])
    expect(writes).toHaveLength(3)
    expect(writes).toContainEqual({
      page: 'a-propos',
      zone_key: 'hero_image_url_fit',
      zone_type: 'text',
      value: 'contain',
      is_active: true,
    })
    // « 16:9 » est normalisé comme le rendu l'attend.
    expect(writes.find((w) => w.zone_key === 'hero_image_url_ratio')?.value).toBe('16 / 9')
    expect(writes.find((w) => w.zone_key === 'hero_image_url_position')?.value).toBe('top')
  })

  it('désactive la zone compagne quand le champ est vidé (retirer un réglage)', () => {
    const { writes, errors } = buildFramingWrites('a-propos', 'hero_image_url', EMPTY_FRAMING)
    expect(errors).toEqual([])
    expect(writes).toHaveLength(3)
    expect(writes.every((w) => w.is_active === false)).toBe(true)
    expect(writes.every((w) => w.value === '')).toBe(true)
  })

  it('refuse une valeur invalide sans rien écrire pour ce champ', () => {
    const { writes, errors } = buildFramingWrites('a-propos', 'hero_image_url', {
      fit: 'stretch',
      ratio: '16 / 9',
      position: 'center',
    })
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('Remplissage')
    // Le `fit` fautif n'est pas écrit ; les deux autres le sont.
    expect(writes.find((w) => w.zone_key === 'hero_image_url_fit')).toBeUndefined()
    expect(writes).toHaveLength(2)
  })

  it('rejette une tentative d’injection CSS et le signale', () => {
    const { writes, errors } = buildFramingWrites('a-propos', 'hero_image_url', {
      fit: '',
      ratio: '16/9; background:url(evil)',
      position: '',
    })
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('Proportions')
    expect(writes.some((w) => w.value.includes('evil'))).toBe(false)
  })
})
