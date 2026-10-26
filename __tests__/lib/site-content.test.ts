import { describe, it, expect, vi } from 'vitest'

/**
 * L'accueil affichait « 4+ de dépendance moyenne aux plateformes » : les zones
 * globales sont indexées par clé seule, et la ligne `expert-hotelier` de
 * `stat_1_label` écrasait celle de `global` selon l'ordre renvoyé par la base
 * (12 chargements sur 13, relevé du 19/10/2026).
 */
const db = vi.hoisted(() => ({ rows: [] as Array<Record<string, unknown>> }))

vi.mock('@/lib/supabase', () => {
  // Constructeur de requête minimal : applique `eq` et `in` comme PostgREST,
  // dans l'ordre des lignes reçu, puis se résout en { data, error }.
  const query = (rows: Array<Record<string, unknown>>): unknown => ({
    select: () => query(rows),
    eq: (col: string, v: unknown) => query(rows.filter((r) => r[col] === v)),
    in: (col: string, vs: unknown[]) => query(rows.filter((r) => vs.includes(r[col]))),
    then: (resolve: (r: { data: unknown[]; error: null }) => unknown) =>
      resolve({ data: rows, error: null }),
  })
  return { createServiceClient: () => ({ from: () => query(db.rows) }) }
})

import { getGlobalZones } from '@/lib/site-content'

const zone = (page: string, zone_key: string, value: string) => ({
  id: `${page}-${zone_key}`,
  page,
  zone_key,
  zone_type: 'text',
  value,
  is_active: true,
})

describe('getGlobalZones', () => {
  it("prend la zone de la page global, quel que soit l'ordre des lignes", async () => {
    const global = zone('global', 'stat_1_label', 'Ans de slow travel')
    const hotelier = zone('expert-hotelier', 'stat_1_label', 'de dépendance moyenne aux plateformes')
    const aPropos = zone('a-propos', 'stat_1_label', 'Pays habités')

    for (const ordre of [
      [global, hotelier, aPropos],
      [hotelier, aPropos, global],
      [aPropos, global, hotelier],
    ]) {
      db.rows = ordre
      const zones = await getGlobalZones()
      expect(zones.stat_1_label.value).toBe('Ans de slow travel')
    }
  })

  it("n'emprunte pas la clé d'une autre page quand global ne l'a pas", async () => {
    // Le composant retombe alors sur son fallback, au lieu d'afficher le texte
    // d'une autre page (le titre newsletter de /start, par exemple).
    db.rows = [zone('start', 'newsletter_title', 'Reçois les pépites chaque semaine')]
    const zones = await getGlobalZones()
    expect(zones.newsletter_title).toBeUndefined()
  })

  it("sert une zone neuve, absente de toute liste écrite dans le code", async () => {
    // Le verrou du 25/10/2026 : une liste blanche de clés (`CONSUMED_ZONE_KEYS`)
    // filtrait la requête, si bien qu'une zone créée depuis le CMS restait
    // invisible tant que le code n'avait pas été modifié — c'est ce qui
    // obligeait à passer par un développeur pour ajouter une entrée de menu.
    // La clé ci-dessous n'a jamais figuré dans cette liste : si le filtre
    // revient, ce test tombe.
    db.rows = [
      zone('global', 'nav_item_9_label', 'Itinéraires'),
      zone('global', 'nav_item_9_url', '/itineraire-10-jours'),
    ]
    const zones = await getGlobalZones()
    expect(zones.nav_item_9_label.value).toBe('Itinéraires')
    expect(zones.nav_item_9_url.value).toBe('/itineraire-10-jours')
  })
})
