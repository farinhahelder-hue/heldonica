import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { NextRequest } from 'next/server'

/**
 * Tests de la vraie route POST /api/cms/mobile-publish.
 *
 * Les deux tests « should reject >10 photos » et « should handle REELS video »
 * qui vivaient ici ne faisaient que remplir un FormData et compter ses
 * entrées : ils ne passaient jamais par le handler, donc rien n'était prouvé.
 * Ici on appelle POST(req) et on vérifie la réponse, les écritures base et les
 * appels de stockage réels.
 */

const h = vi.hoisted(() => {
  type Reponse = { data?: any; error?: any }

  const state = {
    inserts: [] as { table: string; payload: any }[],
    uploads: [] as { bucket: string; key: string; contentType?: string }[],
    removed: [] as string[],
    filee: {} as Record<string, Reponse[]>,
    defaut: {} as Record<string, Reponse>,
    erreurUpload: null as { message: string } | null,
  }

  function suivant(table: string): Reponse {
    const filee = state.filee[table]
    if (filee && filee.length) return filee.shift() as Reponse
    if (state.defaut[table]) return state.defaut[table] as Reponse
    // Reponses reussies par defaut : les insertions avec .select().single()
    // doivent renvoyer une ligne, sinon le handler plante sur post.id.
    if (table === 'cms_blog_posts') return { data: { id: 'post-1', slug: 'brouillon-test' }, error: null }
    if (table === 'article_map_pois') return { data: { id: 'poi-1' }, error: null }
    if (table === 'instagram_scheduled_posts') return { data: { id: 'ig-1' }, error: null }
    return { data: null, error: null }
  }

  function construireClient() {
    return {
      from(table: string) {
        return {
          insert(payload: any) {
            state.inserts.push({ table, payload })
            const thenable = {
              select: () => ({ single: async () => suivant(table) }),
              then: (onF: any, onR: any) => Promise.resolve(suivant(table)).then(onF, onR),
            }
            return thenable
          },
        }
      },
      storage: {
        from(bucket: string) {
          return {
            async upload(key: string, _bytes: any, opts?: any) {
              if (state.erreurUpload) return { error: state.erreurUpload }
              state.uploads.push({ bucket, key, contentType: opts?.contentType })
              return { error: null }
            },
            getPublicUrl(key: string) {
              return { data: { publicUrl: `https://cdn.test/${bucket}/${key}` } }
            },
            async remove(keys: string[]) {
              state.removed.push(...keys)
              return { data: [], error: null }
            },
          }
        },
      },
    }
  }

  return { state, construireClient }
})

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => h.construireClient(),
}))

vi.mock('@/lib/cms-auth', () => ({
  getCmsAuthStatus: vi.fn(async () => 'ok'),
}))

vi.mock('exifr', () => ({
  default: { parse: vi.fn(async () => null) },
}))

vi.mock('@/lib/ai-provider', () => ({
  generateAiCompletion: vi.fn(),
}))

vi.mock('@/lib/brand-voice', () => ({
  HELDONICA_B2C_PROMPT: 'PROMPT_HELDONICA',
}))

import { POST, GET } from '@/app/api/cms/mobile-publish/route'
import { getCmsAuthStatus } from '@/lib/cms-auth'
import exifr from 'exifr'
import { generateAiCompletion } from '@/lib/ai-provider'

type Champs = Record<string, unknown>

class Formulaire {
  private champs = new Map<string, unknown[]>()
  // Un tableau devient autant d'entrées, comme un vrai append multipart :
  // photos[] arrive comme plusieurs champs du même nom, pas comme un tableau.
  set(cle: string, valeur: unknown) {
    this.champs.set(cle, Array.isArray(valeur) ? [...(valeur as unknown[])] : [valeur])
  }
  get(cle: string) {
    const v = this.champs.get(cle)
    return v ? v[0] : null
  }
  getAll(cle: string) {
    return (this.champs.get(cle) ?? []) as unknown[]
  }
}

function fichier(nom: string, contenu: string | Uint8Array, type = 'image/jpeg') {
  const buf = Buffer.isBuffer(contenu) ? contenu : Buffer.from(contenu)
  return {
    name: nom,
    type,
    size: buf.length,
    arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
  }
}

let compteurIp = 0
function requete(champs: Champs = {}, entetes: Record<string, string> = {}) {
  const form = new Formulaire()
  for (const [cle, valeur] of Object.entries(champs)) form.set(cle, valeur)
  // IP neuve a chaque appel : le compteur de la route est en memoire et vit
  // entre les tests d'un meme fichier.
  const ip = `10.9.${Math.floor(compteurIp / 250)}.${(compteurIp++ % 250) + 1}`
  return {
    req: {
      headers: new Headers({ 'x-forwarded-for': ip, ...entetes }),
      formData: async () => form,
    } as unknown as NextRequest,
    ip,
  }
}

function reponsesDu(table: string, ...reponses: any[]) {
  h.state.filee[table] = h.state.filee[table] ?? []
  h.state.filee[table].push(...reponses)
}

function insertions(table: string) {
  return h.state.inserts.filter((i) => i.table === table).map((i) => i.payload)
}

const ENV = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_KEY', 'CRON_SECRET']

beforeEach(() => {
  vi.clearAllMocks()
  h.state.inserts = []
  h.state.uploads = []
  h.state.removed = []
  h.state.filee = {}
  h.state.defaut = {}
  h.state.erreurUpload = null
  for (const cle of ENV) delete process.env[cle]
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://sb.test'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test'
  vi.mocked(getCmsAuthStatus).mockResolvedValue('ok' as any)
  vi.mocked(exifr.parse).mockResolvedValue(null as any)
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
  for (const cle of ENV) delete process.env[cle]
})

describe('mobile-publish — garde d’authentification', () => {
  it('refuse sans jeton (401) et n’écrit rien en base', async () => {
    vi.mocked(getCmsAuthStatus).mockResolvedValue('invalid' as any)
    const { req } = requete({ caption: 'un texte' })
    const res = await POST(req)
    expect(res.status).toBe(401)
    expect(h.state.inserts).toHaveLength(0)
  })

  it('accepte le Bearer CRON_SECRET sans passer par le cookie de session', async () => {
    process.env.CRON_SECRET = 'secret-cron'
    const { req } = requete({ caption: 'brouillon' }, { authorization: 'Bearer secret-cron' })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(getCmsAuthStatus).not.toHaveBeenCalled()
  })

  it('refuse un Bearer qui ne correspond pas au CRON_SECRET (401)', async () => {
    process.env.CRON_SECRET = 'secret-cron'
    // Repli sur la session, qui n'est pas non plus valide ici.
    vi.mocked(getCmsAuthStatus).mockResolvedValue('invalid' as any)
    const { req } = requete({ caption: 'brouillon' }, { authorization: 'Bearer faux' })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('répond 429 une fois la fenêtre de 60 requêtes par IP épuisée', async () => {
    const { req } = requete({ caption: 'une fois' })
    const headers = (req as any).headers as Headers
    const ip = headers.get('x-forwarded-for') as string
    const { rateLimit } = await import('@/lib/rate-limit')
    for (let i = 0; i < 60; i++) expect(rateLimit(ip, 60, 60_000)).toBe(true)
    const res = await POST(req)
    expect(res.status).toBe(429)
  })

  it('répond 503 quand Supabase n’est pas configuré', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    const { req } = requete({ caption: 'texte' })
    const res = await POST(req)
    expect(res.status).toBe(503)
  })
})

describe('mobile-publish — garde de contenu', () => {
  it('refuse un envoi sans photo, ni vidéo, ni texte (400)', async () => {
    const { req } = requete({})
    const res = await POST(req)
    expect(res.status).toBe(400)
    expect(await res.json()).toMatchObject({ error: expect.stringContaining('Rien à publier') })
  })

  it('accepte un carnet en texte seul : le brouillon n’a pas besoin de média', async () => {
    const { req } = requete({ caption: 'Le café ouvre à 7h' })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.post.status).toBe('draft')
    expect(body.uploadedUrls).toEqual([])
  })

  it('refuse 11 photos multipart (400, carrousel IG limité à 10)', async () => {
    const photos = Array.from({ length: 11 }, (_, i) => fichier(`p${i}.jpg`, 'x'))
    const { req } = requete({ photos })
    const res = await POST(req)
    expect(res.status).toBe(400)
    expect(await res.json()).toMatchObject({ error: expect.stringContaining('Max 10 photos') })
  })

  it('accepte 10 photos et bascule en carrousel', async () => {
    const photos = Array.from({ length: 10 }, (_, i) => fichier(`p${i}.jpg`, `contenu-${i}`))
    const { req } = requete({ photos, place_title: 'Stoos' })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.isCarousel).toBe(true)
    expect(body.uploadedUrls).toHaveLength(10)
    expect(h.state.uploads).toHaveLength(10)
  })

  it('refuse une vidéo de plus de 100 Mo (400) avant tout appel de stockage', async () => {
    const video = { name: 'gros.mp4', type: 'video/mp4', size: 101 * 1024 * 1024, arrayBuffer: async () => new ArrayBuffer(0) }
    const { req } = requete({ video })
    const res = await POST(req)
    expect(res.status).toBe(400)
    expect(await res.json()).toMatchObject({ error: expect.stringContaining('Vidéo trop lourde') })
    expect(h.state.uploads).toHaveLength(0)
  })

  it('refuse une photo multipart de plus de 15 Mo (400)', async () => {
    const lourde = fichier('lourde.jpg', Buffer.alloc(16 * 1024 * 1024))
    const { req } = requete({ photos: [lourde] })
    const res = await POST(req)
    expect(res.status).toBe(400)
    expect(await res.json()).toMatchObject({ error: expect.stringContaining('>15MB') })
  })
})

describe('mobile-publish — publication d’un brouillon photo', () => {
  it('crée un brouillon jamais publié et trace le média en base', async () => {
    const { req } = requete({
      photos: [fichier('terrain.jpg', 'octets')],
      caption: 'Sentier sous la pluie',
      place_title: 'Stoos',
      place_lat: '46.98',
      place_lng: '8.66',
      place_address: 'Suisse',
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()

    expect(body.success).toBe(true)
    expect(body.post.status).toBe('draft')
    expect(body.uploadedUrls).toHaveLength(1)
    expect(body.isCarousel).toBe(false)

    const [billet] = insertions('cms_blog_posts')
    expect(billet.published).toBe(false)
    expect(billet.status).toBe('draft')
    expect(billet.title).toBe('Carnet : Stoos')
    expect(billet.featured_image).toBe(body.uploadedUrls[0])
    expect(billet.slug).toMatch(/^stoos-\d{6}$/)

    const [media] = insertions('cms_media')
    expect(media.filename).toBe('terrain.jpg')
    expect(media.source).toBe('mobile')
    expect(media.size).toBe('octets'.length)
    expect(media.latitude).toBeCloseTo(46.98)
    expect(media.longitude).toBeCloseTo(8.66)
    expect(media.metadata.geo_source).toBe('formulaire')
  })

  it('lit l’EXIF : coordonnées et date de prise de vue priment sur le formulaire', async () => {
    vi.mocked(exifr.parse).mockResolvedValue({
      latitude: 45.1,
      longitude: 7.2,
      DateTimeOriginal: new Date('2025-06-02T10:15:00Z'),
    } as any)
    const { req } = requete({
      photos: [fichier('exo.jpg', 'octets')],
      place_lat: '46.98',
      place_lng: '8.66',
    })
    const res = await POST(req)
    expect(res.status).toBe(200)

    const [media] = insertions('cms_media')
    expect(media.latitude).toBe(45.1)
    expect(media.longitude).toBe(7.2)
    expect(media.taken_at).toBe('2025-06-02T10:15:00.000Z')
    expect(media.metadata.geo_source).toBe('exif')
  })

  it('sans EXIF GPS ni coordonnées, marque geo_source: aucune et taken_at null', async () => {
    vi.mocked(exifr.parse).mockResolvedValue({} as any)
    const { req } = requete({ photos: [fichier('sans geo.jpg', 'o')] })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const [media] = insertions('cms_media')
    expect(media.latitude).toBeNull()
    expect(media.taken_at).toBeNull()
    expect(media.metadata.geo_source).toBe('aucune')
  })

  it('survit à un exifr qui plante : la photo part quand même, sans preuve de lieu', async () => {
    vi.mocked(exifr.parse).mockRejectedValue(new Error('jpeg corrompu'))
    const { req } = requete({ photos: [fichier('corrompue.jpg', 'o')], place_lat: '1.5' })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const [media] = insertions('cms_media')
    expect(media.latitude).toBe(1.5)
    expect(media.metadata.geo_source).toBe('formulaire')
  })

  it('nettoie le fichier du stockage quand la base refuse le média (422)', async () => {
    reponsesDu('cms_media', { error: { message: 'colonne inconnue' } })
    const { req } = requete({ photos: [fichier('a.jpg', 'o')] })
    const res = await POST(req)
    expect(res.status).toBe(422)
    expect(h.state.removed).toHaveLength(1)
    expect(h.state.removed[0]).toContain('mobile/')
    expect(insertions('cms_blog_posts')).toHaveLength(0)
  })

  it('propage le refus d’un média pré-déposé et supprime son chemin', async () => {
    reponsesDu('cms_media', { error: { message: 'contrainte violée' } })
    const { req } = requete({
      caption: 'texte',
      uploaded: JSON.stringify([{ nom: 'x.jpg', chemin: 'pre/x.jpg', url: 'https://cdn.test/pre/x.jpg' }]),
    })
    const res = await POST(req)
    expect(res.status).toBe(422)
    expect(h.state.removed).toContain('pre/x.jpg')
  })

  it('échec Supabase de code 23514 sur le billet → 422 avec detail (pas de boucle de rejeu)', async () => {
    reponsesDu('cms_blog_posts', { data: null, error: { message: 'check_violation', code: '23514' } })
    const { req } = requete({ caption: 'texte' })
    const res = await POST(req)
    expect(res.status).toBe(422)
    const body = await res.json()
    expect(body.detail).toContain('cms_blog_posts')
  })

  it('échec Supabase non structurel sur le billet → 500 sans detail', async () => {
    reponsesDu('cms_blog_posts', { data: null, error: { message: 'timeout' } })
    const { req } = requete({ caption: 'texte' })
    const res = await POST(req)
    expect(res.status).toBe(500)
    expect((await res.json()).detail).toBeUndefined()
  })
})

describe('mobile-publish — médias pré-déposés (URL signées)', () => {
  it('compte les uploads pré-déposés dans le carrousel sans passer par le multipart', async () => {
    const { req } = requete({
      place_title: 'Madère',
      uploaded: JSON.stringify([
        { nom: 'a.jpg', chemin: 'pre/a.jpg', url: 'https://cdn.test/pre/a.jpg' },
        { nom: 'b.jpg', chemin: 'pre/b.jpg', url: 'https://cdn.test/pre/b.jpg' },
      ]),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.isCarousel).toBe(true)
    expect(body.uploadedUrls).toEqual(['https://cdn.test/pre/a.jpg', 'https://cdn.test/pre/b.jpg'])
    expect(h.state.uploads).toHaveLength(0)
    expect(insertions('cms_media')).toHaveLength(2)
  })

  it('ignore les entrées sans chemin ni URL : la trace pointerait dans le vide', async () => {
    const { req } = requete({
      caption: 'texte',
      uploaded: JSON.stringify([{ nom: 'incomplet.jpg' }]),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(insertions('cms_media')).toHaveLength(0)
    expect((await res.json()).isCarousel).toBe(false)
  })

  it('refuse un champ uploaded qui n’est pas du JSON (400)', async () => {
    const { req } = requete({ caption: 'texte', uploaded: '{pas-du-json' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    expect(await res.json()).toMatchObject({ error: expect.stringContaining('uploaded') })
  })

  it('repasse en multipart quand la photo n’a pas d’EXIF transmis par l’app', async () => {
    const { req } = requete({
      caption: 'texte',
      uploaded: JSON.stringify([{ nom: 'a.jpg', chemin: 'pre/a.jpg', url: 'https://cdn.test/pre/a.jpg', lat: 12.5 }]),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const [media] = insertions('cms_media')
    expect(media.latitude).toBe(12.5)
    expect(media.metadata.geo_source).toBe('exif')
  })
})

describe('mobile-publish — vidéo et file Instagram', () => {
  it('envoie une vidéo en draft REELS sur Instagram, jamais publié', async () => {
    const { req } = requete({
      video: fichier('reel.mp4', 'video-bytes', 'video/mp4'),
      caption: 'Lever de soleil',
      place_title: 'Madère',
      publish_instagram: '1',
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.videoUrl).toContain('https://cdn.test/media/')

    const [ig] = insertions('instagram_scheduled_posts')
    expect(ig.status).toBe('draft')
    expect(ig.metadata.type).toBe('REELS')
    expect(ig.metadata.video_url).toBe(body.videoUrl)
    expect(ig.caption).toContain('#slowtravel')
  })

  it('classe les deux photos en CAROUSEL avec les enfants', async () => {
    const { req } = requete({
      photos: [fichier('a.jpg', 'a'), fichier('b.jpg', 'b')],
      publish_instagram: '1',
      place_title: 'Stoos',
    })
    const res = await POST(req)
    const body = await res.json()
    const [ig] = insertions('instagram_scheduled_posts')
    expect(ig.metadata.type).toBe('CAROUSEL')
    expect(ig.metadata.children).toEqual(body.uploadedUrls)
  })

  it('une seule photo : métadonnées Instagram nulles', async () => {
    const { req } = requete({ photos: [fichier('a.jpg', 'a')], publish_instagram: '1' })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const [ig] = insertions('instagram_scheduled_posts')
    expect(ig.metadata).toBeNull()
  })

  it('un carnet en texte seul ne part jamais sur Instagram (pas de média à joindre)', async () => {
    const { req } = requete({ caption: 'texte seulement', publish_instagram: '1' })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(insertions('instagram_scheduled_posts')).toHaveLength(0)
    expect((await res.json()).instagramErreur).toBeNull()
  })

  it('un échec de la file Instagram remonte le motif au lieu d’annoncer un succès complet', async () => {
    reponsesDu('instagram_scheduled_posts', { data: null, error: { message: 'table absente' } })
    const { req } = requete({ photos: [fichier('a.jpg', 'a')], publish_instagram: '1' })
    const res = await POST(req)
    const body = await res.json()
    expect(body.instagramScheduled).toBeNull()
    expect(body.instagramErreur).toContain('Instagram')
    expect(body.message).toContain('En revanche')
    // Le brouillon site existe malgré tout.
    expect(body.post.status).toBe('draft')
  })
})

describe('mobile-publish — légende IA (cascade Groq→Gemini)', () => {
  it('génère une légende globale et une par slide sur un carrousel, tronquées au nombre de photos', async () => {
    vi.mocked(generateAiCompletion).mockResolvedValue({
      content: JSON.stringify({ caption: 'Légende globale', slides: ['s1', 's2', 's3'] }),
      provider: 'groq',
      model: 'm',
    })
    const { req } = requete({
      photos: [fichier('a.jpg', 'a'), fichier('b.jpg', 'b')],
      auto_caption: '1',
      place_title: 'Stoos',
    })
    const res = await POST(req)
    const body = await res.json()
    expect(body.aiCaption).toBe('Légende globale')
    expect(body.aiCarouselCaptions).toEqual(['s1', 's2'])
    expect(body.mode).toBe('both')
    expect(insertions('cms_blog_posts')[0].content).toContain('Proposition IA')
    expect(generateAiCompletion).toHaveBeenCalledTimes(1)
  })

  it('sur une vidéo, le prompt demande une légende Reels', async () => {
    vi.mocked(generateAiCompletion).mockResolvedValue({
      content: JSON.stringify({ caption: 'Reels de la Madère' }),
      provider: 'gemini',
      model: 'm',
    })
    const { req } = requete({ video: fichier('v.mp4', 'v', 'video/mp4'), auto_caption: '1', place_title: 'Madère' })
    const res = await POST(req)
    expect((await res.json()).aiCaption).toBe('Reels de la Madère')
    const appel = vi.mocked(generateAiCompletion).mock.calls[0][0]
    expect(appel.messages[0].content).toContain('Vidéo terrain à Madère')
  })

  it('un échec de la cascade IA laisse le squelette [À TOI] et ne casse rien', async () => {
    vi.mocked(generateAiCompletion).mockRejectedValue(new Error('Aucun fournisseur'))
    const { req } = requete({ photos: [fichier('a.jpg', 'a')], auto_caption: '1' })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.aiCaption).toBeNull()
    expect(insertions('cms_blog_posts')[0].content).toContain('[À TOI')
  })

  it('mode auto : seul le bloc IA est retenu, pas le squelette manuel', async () => {
    vi.mocked(generateAiCompletion).mockResolvedValue({
      content: JSON.stringify({ caption: 'Proposition retenue' }),
      provider: 'groq',
      model: 'm',
    })
    const { req } = requete({ photos: [fichier('a.jpg', 'a')], auto_caption: '1', mode: 'auto' })
    const res = await POST(req)
    const content = insertions('cms_blog_posts')[0].content
    expect(content).toContain('Proposition retenue')
    expect(content).not.toContain('Brouillon mobile')
    expect((await res.json()).mode).toBe('auto')
  })
})

describe('mobile-publish — point de carte et origine', () => {
  it('crée un POI quand le lieu est complet et le renvoie dans la réponse', async () => {
    const { req } = requete({
      caption: 'texte',
      place_title: 'Belvédère',
      place_lat: '46.5',
      place_lng: '8.2',
      place_address: 'Valais',
    })
    const res = await POST(req)
    expect((await res.json()).poiId).toBe('poi-1')
    const [poi] = insertions('article_map_pois')
    expect(poi.content_slug).toBe('mobile-inbox')
    expect(poi.category).toBe('point_vue')
    expect(poi.address).toBe('Valais')
  })

  it('un POI refusé par la base ne casse pas le brouillon (poiId null)', async () => {
    reponsesDu('article_map_pois', { data: null, error: { message: 'pas de table' } })
    const { req } = requete({ caption: 'texte', place_title: 'X', place_lat: '1', place_lng: '2' })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect((await res.json()).poiId).toBeNull()
  })

  it('aucun POI sans coordonnées complètes', async () => {
    const { req } = requete({ caption: 'texte', place_title: 'X' })
    const res = await POST(req)
    expect((await res.json()).poiId).toBeNull()
    expect(insertions('article_map_pois')).toHaveLength(0)
  })

  it('l’origine web du panneau est conservée, le téléphone reste le défaut', async () => {
    const { req } = requete({ caption: 'texte', source: 'web' })
    await POST(req)
    expect(insertions('cms_blog_posts')[0].source).toBe('web')

    const suivant = requete({ caption: 'texte' })
    await POST(suivant.req)
    expect(insertions('cms_blog_posts')[1].source).toBe('mobile')
  })

  it('tranche l’origine à 20 caractères : elle sert de colonne, pas de récit', async () => {
    const { req } = requete({ caption: 'texte', source: 'x'.repeat(60) })
    await POST(req)
    expect(insertions('cms_blog_posts')[0].source).toHaveLength(20)
  })
})

describe('mobile-publish — GET', () => {
  it('décrit l’usage de la route', async () => {
    const res = await GET()
    const body = await res.json()
    expect(body.usage).toContain('photos[] (1-10)')
    expect(body.usage).toContain('cascade Groq→Gemini')
  })
})
