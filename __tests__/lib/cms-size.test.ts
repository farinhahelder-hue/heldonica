import { describe, it, expect } from 'vitest'
import { parseCssPx } from '@/lib/cms-size'

describe('parseCssPx', () => {
  it('accepte un entier positif simple', () => {
    expect(parseCssPx('40')).toBe('40px')
    expect(parseCssPx(' 48 ')).toBe('48px')
    expect(parseCssPx('1')).toBe('1px')
    expect(parseCssPx('400')).toBe('400px')
  })

  it('refuse une valeur vide ou absente', () => {
    expect(parseCssPx('')).toBeUndefined()
    expect(parseCssPx('   ')).toBeUndefined()
    expect(parseCssPx(undefined)).toBeUndefined()
  })

  it('refuse tout ce qui n’est pas un entier simple', () => {
    expect(parseCssPx('40px')).toBeUndefined()
    expect(parseCssPx('40.5')).toBeUndefined()
    expect(parseCssPx('+40')).toBeUndefined()
    expect(parseCssPx('040')).toBeUndefined()
    expect(parseCssPx('quarante')).toBeUndefined()
    expect(parseCssPx('40 48')).toBeUndefined()
  })

  it('refuse zéro, le négatif et l’au-delà de la borne', () => {
    expect(parseCssPx('0')).toBeUndefined()
    expect(parseCssPx('-10')).toBeUndefined()
    expect(parseCssPx('401')).toBeUndefined()
    expect(parseCssPx('99999')).toBeUndefined()
  })

  it('refuse une tentative d’injection CSS', () => {
    expect(parseCssPx('40; background:url(evil)')).toBeUndefined()
    expect(parseCssPx('40px}body{display:none')).toBeUndefined()
    expect(parseCssPx('calc(100% - 10px)')).toBeUndefined()
  })
})
