import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET as contentGET, POST as contentPOST } from '@/app/api/ai/content/route'
import { POST as enhancePOST } from '@/app/api/ai/enhance/route'

// Mock next/server
vi.mock('next/server', () => {
  return {
    NextRequest: vi.fn(),
    NextResponse: {
      json: vi.fn((body, init) => {
        return { body, status: init?.status || 200 }
      })
    }
  }
})

// Mock supabase client creation
vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(() => ({}))
  }
})

describe('AI API Auth Checks', () => {
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    originalEnv = process.env
    // Clear out modules so env vars are read afresh if needed,
    // though vitest might need more complex mocking for module-level env vars.
    // Instead of relying on vitest to re-evaluate module-level consts,
    // let’s just test the behavior via stubbing, or accept that we might need vi.resetModules.
    vi.resetModules()
  })

  afterEach(() => {
    process.env = originalEnv
    vi.clearAllMocks()
  })

  it('content GET should return 401 if x-api-key is missing', async () => {
    const req = {
      headers: new Headers(),
      url: 'http://localhost/api/ai/content'
    } as unknown as NextRequest

    const response = await contentGET(req)
    expect(response.status).toBe(401)
  })

  it('content GET should return 401 if x-api-key is incorrect', async () => {
    const headers = new Headers()
    headers.set('x-api-key', 'wrong-key')
    const req = {
      headers,
      url: 'http://localhost/api/ai/content'
    } as unknown as NextRequest

    const response = await contentGET(req)
    expect(response.status).toBe(401)
  })

  it('content POST should return 401 if x-api-key is missing', async () => {
    const req = {
      headers: new Headers(),
      json: async () => ({ action: 'create', article: {} })
    } as unknown as NextRequest

    const response = await contentPOST(req)
    expect(response.status).toBe(401)
  })

  it('enhance POST should return 401 if x-api-key is missing', async () => {
    const req = {
      headers: new Headers(),
      json: async () => ({ article_id: 1 })
    } as unknown as NextRequest

    const response = await enhancePOST(req)
    expect(response.status).toBe(401)
  })
})
