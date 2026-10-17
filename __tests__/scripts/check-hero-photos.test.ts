import { describe, it, expect, vi } from 'vitest'
import { execSync } from 'child_process'

describe('check-hero-photos script', () => {
  it('exits with code 2 when Supabase credentials are missing (ignored check)', () => {
    try {
      execSync('node scripts/check-hero-photos.mjs', {
        env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '' },
        encoding: 'utf8',
      })
      // Should not reach here
      expect(true).toBe(false)
    } catch (err: any) {
      expect(err.status).toBe(2)
    }
  })
})
