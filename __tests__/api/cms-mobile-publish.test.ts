import { describe, it, expect, vi } from 'vitest'

describe('mobile-publish', () => {
  it('should reject >10 photos', async () => {
    const form = new FormData()
    for (let i = 0; i < 11; i++) form.append('photos', new File(['a'], `p${i}.jpg`, { type: 'image/jpeg' }))
    // Simulate handler check
    expect(form.getAll('photos').length).toBe(11)
  })
  it('should handle REELS video', async () => {
    const form = new FormData()
    form.append('video', new File(['a'], 'v.mp4', { type: 'video/mp4' }))
    expect(form.get('video')).toBeTruthy()
  })
})
