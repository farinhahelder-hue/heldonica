import { describe, it, expect } from 'vitest'
import { rateLimit } from '@/lib/rate-limit'

describe('rate-limit', () => {
  it('should allow first request', () => {
    expect(rateLimit('test-ip-1', 5, 60000)).toBe(true)
  })
  it('should block after limit', () => {
    const ip = 'test-ip-2'
    for (let i = 0; i < 5; i++) rateLimit(ip, 5, 60000)
    expect(rateLimit(ip, 5, 60000)).toBe(false)
  })
  it('should handle different IPs independently', () => {
    expect(rateLimit('ip-a', 1, 60000)).toBe(true)
    expect(rateLimit('ip-b', 1, 60000)).toBe(true)
    expect(rateLimit('ip-a', 1, 60000)).toBe(false)
  })
})
