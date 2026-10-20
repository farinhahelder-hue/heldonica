import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

/**
 * Lecture de res.ok côté Brevo sur la vraie route POST /api/contact.
 *
 * Les anciens tests de ce fichier moquaient global.fetch puis appelaient
 * fetch directement : ils ne vérifiaient que la sémantique de res.ok, pas la
 * route. Ici on exécute le handler et on contrôle quelle voie (Brevo puis
 * repli Resend) il emprunte selon le résultat lu.
 */

const envoisResend = vi.hoisted(() => [] as any[])

// Une vraie classe, pas mockImplementation avec flèche : la route appelle
// `new Resend(...)`, et une fonction fléchée n'est pas constructible.
vi.mock('resend', () => ({
  Resend: class {
    emails = {
      send: async (opts: any) => {
        envoisResend.push(opts)
        return { error: null }
      },
    }
  },
}))

let reponsesFetch: { url: string; reponse: () => Promise<Response> }[] = []
let fetchMock: ReturnType<typeof vi.fn>

function repondre(urlContient: string, reponse: Response | (() => Promise<Response>)) {
  reponsesFetch.push({
    url: urlContient,
    reponse: typeof reponse === 'function' ? reponse : async () => reponse,
  })
}

function reponseHttp(status: number, body: unknown = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

let compteurIp = 0
function requete(body: unknown, entetes: Record<string, string> = {}) {
  const ip = `10.20.${Math.floor(compteurIp / 250)}.${(compteurIp++ % 250) + 1}`
  return {
    json: async () => body,
    headers: new Headers({ 'x-forwarded-for': ip, ...entetes }),
  } as unknown as NextRequest
}

const CORPS_VALIDE = {
  nom: 'Dupont',
  prenom: 'Claire',
  email: 'claire@example.com',
  destination: 'Madère',
  message: 'Un carnet, s’il vous plaît.',
}

async function chargerRoute() {
  // BREVO_API_KEY est lu au chargement du module : il faut reimporter.
  vi.resetModules()
  const mod = await import('@/app/api/contact/route')
  return mod.POST
}

beforeEach(() => {
  vi.clearAllMocks()
  envoisResend.length = 0
  reponsesFetch = []
  fetchMock = vi.fn(async (url: any) => {
    const trouve = reponsesFetch.find((r) => String(url).includes(r.url))
    if (!trouve) throw new Error(`fetch inattendu : ${url}`)
    return trouve.reponse()
  })
  global.fetch = fetchMock as any
  vi.spyOn(console, 'error').mockImplementation(() => {})
  delete process.env.BREVO_API_KEY
})

describe('contact — voie Brevo lue via res.ok', () => {
  it('sans clé Brevo, part directement en Resend sans toucher à l’API', async () => {
    const POST = await chargerRoute()
    const res = await POST(requete(CORPS_VALIDE))
    expect(res.status).toBe(200)
    expect((await res.json()).via).toBe('resend')
    expect(fetchMock).not.toHaveBeenCalled()
    expect(envoisResend).toHaveLength(2) // admin + client
  })

  it('quand la notification Brevo est ok, répond via brevo sans passer par Resend', async () => {
    process.env.BREVO_API_KEY = 'cle-test'
    repondre('/contacts', reponseHttp(201))
    repondre('/smtp/email', reponseHttp(200))
    const POST = await chargerRoute()
    const res = await POST(requete(CORPS_VALIDE))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.via).toBe('brevo')
    expect(body.contact_added).toBe(true)
    expect(envoisResend).toHaveLength(0)
  })

  it('un contact déjà inscrit (400) compte comme ajouté : res.ok || status 400', async () => {
    process.env.BREVO_API_KEY = 'cle-test'
    repondre('/contacts', reponseHttp(400, { code: 'duplicate_parameter' }))
    repondre('/smtp/email', reponseHttp(200))
    const POST = await chargerRoute()
    const res = await POST(requete(CORPS_VALIDE))
    const body = await res.json()
    expect(body.via).toBe('brevo')
    expect(body.contact_added).toBe(true)
  })

  it('un refus contact autre que 400 (401) laisse contact_added false mais envoie quand même la notif', async () => {
    process.env.BREVO_API_KEY = 'cle-test'
    repondre('/contacts', reponseHttp(401, { message: 'IP non autorisée' }))
    repondre('/smtp/email', reponseHttp(200))
    const POST = await chargerRoute()
    const res = await POST(requete(CORPS_VALIDE))
    const body = await res.json()
    expect(body.via).toBe('brevo')
    expect(body.contact_added).toBe(false)
  })

  it('journalise le statut et le corps d’un refus contact (401) au lieu de le taire', async () => {
    process.env.BREVO_API_KEY = 'cle-test'
    repondre('/contacts', reponseHttp(401, { message: 'IP non autorisée' }))
    repondre('/smtp/email', reponseHttp(200))
    const POST = await chargerRoute()
    await POST(requete(CORPS_VALIDE))
    expect(console.error).toHaveBeenCalledWith(
      'Brevo contact error:',
      401,
      expect.stringContaining('IP non autorisée')
    )
  })

  it('une notification Brevo non-ok (500) bascule sur le repli Resend', async () => {
    process.env.BREVO_API_KEY = 'cle-test'
    repondre('/contacts', reponseHttp(201))
    repondre('/smtp/email', reponseHttp(500))
    const POST = await chargerRoute()
    const res = await POST(requete(CORPS_VALIDE))
    expect((await res.json()).via).toBe('resend')
    expect(envoisResend).toHaveLength(2)
  })

  it('une exception réseau côté Brevo ne casse pas le formulaire : repli Resend', async () => {
    process.env.BREVO_API_KEY = 'cle-test'
    repondre('/contacts', () => Promise.reject(new Error('ECONNRESET')))
    repondre('/smtp/email', () => Promise.reject(new Error('ECONNRESET')))
    const POST = await chargerRoute()
    const res = await POST(requete(CORPS_VALIDE))
    expect(res.status).toBe(200)
    expect((await res.json()).via).toBe('resend')
  })

  it('une adresse invalide est rejetée avant tout appel sortant', async () => {
    process.env.BREVO_API_KEY = 'cle-test'
    const POST = await chargerRoute()
    const res = await POST(requete({ ...CORPS_VALIDE, email: 'pas-un-email' }))
    expect(res.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(envoisResend).toHaveLength(0)
  })

  it('un message de plus de 2000 caractères est refusé', async () => {
    const POST = await chargerRoute()
    const res = await POST(requete({ ...CORPS_VALIDE, message: 'x'.repeat(2001) }))
    expect(res.status).toBe(400)
  })

  it('applique le plafond de 5 demandes par IP (429)', async () => {
    const POST = await chargerRoute()
    const ipFixe = '203.0.113.9'
    const statuses: number[] = []
    for (let i = 0; i < 6; i++) {
      const res = await POST(requete(CORPS_VALIDE, { 'x-forwarded-for': ipFixe }))
      statuses.push(res.status)
    }
    expect(statuses.slice(0, 5)).toEqual([200, 200, 200, 200, 200])
    expect(statuses[5]).toBe(429)
  })
})
