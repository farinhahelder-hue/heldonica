import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import {
  getBufferComposerUrl,
  getBufferPostUrl,
  openBufferComposer,
  isBufferConfigured
} from '../../lib/buffer'

describe('buffer', () => {
  describe('getBufferComposerUrl', () => {
    it('should return base URL without profileId', () => {
      expect(getBufferComposerUrl()).toBe('https://buffer.com/app/compose')
    })

    it('should return URL with profile parameter when profileId is provided', () => {
      expect(getBufferComposerUrl('12345')).toBe('https://buffer.com/app/compose?profile=12345')
    })

    it('should handle empty string profileId', () => {
      expect(getBufferComposerUrl('')).toBe('https://buffer.com/app/compose')
    })

    it('should handle special characters in profileId', () => {
      expect(getBufferComposerUrl('abc_123')).toBe('https://buffer.com/app/compose?profile=abc_123')
    })
  })

  describe('getBufferPostUrl', () => {
    it('should return URL with encoded text when no profileId is provided', () => {
      expect(getBufferPostUrl('Hello World')).toBe('https://buffer.com/app/compose?text=Hello%20World')
    })

    it('should return URL with encoded text and profile parameter when profileId is provided', () => {
      expect(getBufferPostUrl('Hello World', '12345')).toBe('https://buffer.com/app/compose?text=Hello%20World&profile=12345')
    })

    it('should properly encode special characters in text', () => {
      const textWithSpecialChars = 'Check this out! 🚀 #awesome & cool'
      const encodedText = encodeURIComponent(textWithSpecialChars)
      expect(getBufferPostUrl(textWithSpecialChars)).toBe(`https://buffer.com/app/compose?text=${encodedText}`)
    })

    it('should encode emojis correctly', () => {
      const text = 'Voyage 🌴✈️'
      const encoded = encodeURIComponent(text)
      expect(getBufferPostUrl(text)).toBe(`https://buffer.com/app/compose?text=${encoded}`)
    })

    it('should encode French accented characters', () => {
      const text = 'Voyage en France: été, Noël, naïve'
      const encoded = encodeURIComponent(text)
      expect(getBufferPostUrl(text)).toBe(`https://buffer.com/app/compose?text=${encoded}`)
    })

    it('should handle empty text', () => {
      expect(getBufferPostUrl('')).toBe('https://buffer.com/app/compose?text=')
    })

    it('should handle text with line breaks', () => {
      const text = 'Line1\nLine2'
      const encoded = encodeURIComponent(text)
      expect(getBufferPostUrl(text)).toBe(`https://buffer.com/app/compose?text=${encoded}`)
    })

    it('should encode HTML special characters', () => {
      const text = '<script>alert("test")</script>'
      const encoded = encodeURIComponent(text)
      expect(getBufferPostUrl(text)).toBe(`https://buffer.com/app/compose?text=${encoded}`)
    })
  })

  describe('openBufferComposer', () => {
    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('should open window with base URL when no profileId is provided', () => {
      const mockOpen = vi.fn()
      vi.stubGlobal('open', mockOpen)

      openBufferComposer()

      expect(mockOpen).toHaveBeenCalledWith('https://buffer.com/app/compose', '_blank')
    })

    it('should open window with profile parameter when profileId is provided', () => {
      const mockOpen = vi.fn()
      vi.stubGlobal('open', mockOpen)

      openBufferComposer('12345')

      expect(mockOpen).toHaveBeenCalledWith('https://buffer.com/app/compose?profile=12345', '_blank')
    })
  })

  describe('isBufferConfigured', () => {
    it('should return true (always available - uses web interface)', () => {
      expect(isBufferConfigured()).toBe(true)
    })
  })
})
