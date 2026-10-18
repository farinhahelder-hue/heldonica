import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * lib/instagram-feed.ts — Behold en lecture, repli vide configuré.
 *
 * Le fichier d'origine ne vérifiait qu'une seule chose : que le tableau
 * renvoyé est bien un tableau — ce qui reste vrai quand la fonction renvoie
 * []. Ici on contrôle le mapping des champs, les replis et les en-têtes.
 */

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.clearAllMocks()
  fetchMock = vi.fn()
  global.fetch = fetchMock as any
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
  delete process.env.BEHOLD_API_KEY
  delete process.env.INSTAGRAM_USERNAME
})

afterEach(() => {
  vi.restoreAllMocks()
  delete process.env.BEHOLD_API_KEY
  delete process.env.INSTAGRAM_USERNAME
})

const POST_BEHOLD = {
  id: 'ig-1',
  shortcode: 'abc123',
  caption: 'Lever de soleil sur la Madère',
  display_url: 'https://cdn.test/full.jpg',
  thumbnail_url: 'https://cdn.test/thumb.jpg',
  permalink: 'https://instagram.com/p/abc123/',
  timestamp: '2026-09-01T08:00:00Z',
  likes_count: 42,
  comments_count: 3,
}

function reponseOk(body: unknown) {
  return { ok: true, json: async () => body } as Response
}

describe('getInstagramFeed', () => {
  it('sans BEHOLD_API_KEY, renvoie le repli vide sans appeler le réseau', async () => {
    const { getInstagramFeed } = await import('@/lib/instagram-feed')
    const feed = await getInstagramFeed()
    expect(feed).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('mappe les champs Behold vers la forme attendue par les composants', async () => {
    process.env.BEHOLD_API_KEY = 'behold-key'
    fetchMock.mockResolvedValue(reponseOk({ posts: [POST_BEHOLD] }))
    const { getInstagramFeed } = await import('@/lib/instagram-feed')
    const [post] = await getInstagramFeed(5)

    expect(post).toEqual({
      id: 'ig-1',
      shortcode: 'abc123',
      caption: 'Lever de soleil sur la Madère',
      mediaUrl: 'https://cdn.test/full.jpg',
      thumbnailUrl: 'https://cdn.test/thumb.jpg',
      permalink: 'https://instagram.com/p/abc123/',
      timestamp: '2026-09-01T08:00:00Z',
      likes: 42,
      comments: 3,
    })

    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.behold.so/v1/instagram/heldonica?limit=5')
    expect((options as any).headers.Authorization).toBe('behold-key')
  })

  it('utilise INSTAGRAM_USERNAME quand il est fourni et comble les champs absents', async () => {
    process.env.BEHOLD_API_KEY = 'k'
    process.env.INSTAGRAM_USERNAME = 'celine_en_route'
    fetchMock.mockResolvedValue(reponseOk({ posts: [{ id: 'x', display_url: 'https://cdn.test/a.jpg' }] }))
    const { getInstagramFeed } = await import('@/lib/instagram-feed')
    const [post] = await getInstagramFeed()

    expect(fetchMock.mock.calls[0][0]).toContain('celine_en_route')
    expect(post.shortcode).toBe('')
    // Le permalink brut est construit depuis post.shortcode (absent ici).
    expect(post.permalink).toBe('https://instagram.com/p/undefined')
    expect(post.likes).toBe(0)
    expect(post.comments).toBe(0)
    expect(post.thumbnailUrl).toBe('https://cdn.test/a.jpg')
  })

  it('replie sur image_url quand display_url manque', async () => {
    process.env.BEHOLD_API_KEY = 'k'
    fetchMock.mockResolvedValue(reponseOk({ posts: [{ id: 'x', image_url: 'https://cdn.test/alt.jpg' }] }))
    const { getInstagramFeed } = await import('@/lib/instagram-feed')
    const [post] = await getInstagramFeed()
    expect(post.mediaUrl).toBe('https://cdn.test/alt.jpg')
  })

  it('un res.ok faux (401) bascule sur le repli vide au lieu de propager', async () => {
    process.env.BEHOLD_API_KEY = 'mauvaise-cle'
    fetchMock.mockResolvedValue({ ok: false, status: 401, json: async () => ({}) } as Response)
    const { getInstagramFeed } = await import('@/lib/instagram-feed')
    expect(await getInstagramFeed()).toEqual([])
  })

  it('une exception réseau bascule sur le repli vide', async () => {
    process.env.BEHOLD_API_KEY = 'k'
    fetchMock.mockRejectedValue(new Error('ECONNRESET'))
    const { getInstagramFeed } = await import('@/lib/instagram-feed')
    expect(await getInstagramFeed()).toEqual([])
  })

  it('un corps sans posts renvoie [] plutôt que de planter', async () => {
    process.env.BEHOLD_API_KEY = 'k'
    fetchMock.mockResolvedValue(reponseOk({}))
    const { getInstagramFeed } = await import('@/lib/instagram-feed')
    expect(await getInstagramFeed()).toEqual([])
  })
})

describe('getInstagramHashtag', () => {
  it('sans clé API, ne sort jamais de requête réseau', async () => {
    const { getInstagramHashtag } = await import('@/lib/instagram-feed')
    expect(await getInstagramHashtag('slowtravel')).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('interroge l’endpoint hashtag et renvoie les posts bruts', async () => {
    process.env.BEHOLD_API_KEY = 'k'
    const posts = [{ id: 'h1', shortcode: 'zz' }]
    fetchMock.mockResolvedValue(reponseOk({ posts }))
    const { getInstagramHashtag } = await import('@/lib/instagram-feed')
    expect(await getInstagramHashtag('slowtravel', 3)).toEqual(posts)
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.behold.so/v1/instagram/hashtag/slowtravel?limit=3')
  })

  it('renvoie [] si l’appel échoue', async () => {
    process.env.BEHOLD_API_KEY = 'k'
    fetchMock.mockRejectedValue(new Error('boom'))
    const { getInstagramHashtag } = await import('@/lib/instagram-feed')
    expect(await getInstagramHashtag('slowtravel')).toEqual([])
  })
})

describe('isInstagramFeedConfigured', () => {
  it('refuse sans aucune variable', async () => {
    const { isInstagramFeedConfigured } = await import('@/lib/instagram-feed')
    expect(isInstagramFeedConfigured()).toBe(false)
  })

  it('accepte avec une clé Behold seule', async () => {
    process.env.BEHOLD_API_KEY = 'k'
    const { isInstagramFeedConfigured } = await import('@/lib/instagram-feed')
    expect(isInstagramFeedConfigured()).toBe(true)
  })

  it('accepte un nom d’utilisateur seul', async () => {
    process.env.INSTAGRAM_USERNAME = 'heldonica'
    const { isInstagramFeedConfigured } = await import('@/lib/instagram-feed')
    expect(isInstagramFeedConfigured()).toBe(true)
  })
})
