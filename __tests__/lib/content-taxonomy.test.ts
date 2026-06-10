import { describe, it, expect } from 'vitest'
import { getTravelStyleLabel, getCategoryColor } from '@/lib/content-taxonomy'

describe('content-taxonomy', () => {
  describe('getTravelStyleLabel', () => {
    it('should return the correct label for a known travel style', () => {
      expect(getTravelStyleLabel('slow-travel')).toBe('Slow Travel')
      expect(getTravelStyleLabel('adventure')).toBe('Aventure')
    })

    it('should return the input string if the travel style is unknown', () => {
      expect(getTravelStyleLabel('unknown-style')).toBe('unknown-style')
      expect(getTravelStyleLabel('')).toBe('')
    })
  })

  describe('getCategoryColor', () => {
    it('should return the correct color for a known category', () => {
      expect(getCategoryColor('destinations')).toBe('#1e40af')
      expect(getCategoryColor('guides')).toBe('#065f46')
    })

    it('should return the default color (#666) if the category is unknown', () => {
      expect(getCategoryColor('unknown-category')).toBe('#666')
      expect(getCategoryColor('')).toBe('#666')
    })
  })
})
