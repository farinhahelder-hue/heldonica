// ============================================================
// État du projet pour le Cerveau du Poco — résumé court, sans réseau.
//
// Un petit modèle (1,5B) ne doit pas deviner l'état du site : la route
// /api/cerveau/etat lit la base, cette fonction en fait quelques lignes
// factuelles qu'on glisse dans son contexte. Rien n'y est inventé : une
// donnée absente est dite absente (« rien de programmé »).
// ============================================================

export type ArticleEtat = {
  slug: string
  title: string | null
  status: string | null
  published: boolean | null
  scheduled_publish_at: string | null
}

export type PostInstagramEtat = {
  status: string | null
  scheduled_at: string | null
  caption: string | null
}

export type TacheEtat = {
  agent: string | null
  status: string | null
  task: string | null
  scope: string | null
}

export type EntreesEtat = {
  maintenant: Date
  articles: ArticleEtat[]
  instagram: PostInstagramEtat[]
  taches: TacheEtat[]
}

const MOTS_MEMORIA = /youtube|memoria|short|c[ée]sar|rubicon|sylla|p[ée]luse|diadoque|miniature|chapitre/i

function premiereLigne(texte: string | null, max = 60): string {
  const l = (texte || '').split('\n').map((s) => s.trim()).find(Boolean) || '(sans légende)'
  return l.length > max ? l.slice(0, max - 1) + '…' : l
}

function jour(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/Paris' })
}

export function resumerEtat({ maintenant, articles, instagram, taches }: EntreesEtat): {
  texte: string
  compteurs: Record<string, number>
} {
  const dans7j = new Date(maintenant.getTime() + 7 * 24 * 3600 * 1000)
  const enLigne = articles.filter((a) => a.status === 'published' && a.published !== false)
  const brouillons = articles.filter((a) => a.status !== 'published')
  const programmesBlog = articles
    .filter((a) => a.scheduled_publish_at && new Date(a.scheduled_publish_at) >= maintenant && new Date(a.scheduled_publish_at) <= dans7j)
    .sort((a, b) => a.scheduled_publish_at!.localeCompare(b.scheduled_publish_at!))
  const igSemaine = instagram
    .filter((p) => p.scheduled_at && new Date(p.scheduled_at) >= maintenant && new Date(p.scheduled_at) <= dans7j)
    .sort((a, b) => a.scheduled_at!.localeCompare(b.scheduled_at!))
  const igSansDate = instagram.filter((p) => !p.scheduled_at && p.status !== 'published')
  const aValider = taches.filter((t) => t.agent === 'fondateur' && t.status === 'waiting_validation')
  const memoria = taches.filter((t) => t.status !== 'done' && MOTS_MEMORIA.test(t.task || ''))

  const l: string[] = []
  l.push(`État du projet au ${jour(maintenant.toISOString())} :`)
  l.push(
    programmesBlog.length || igSemaine.length
      ? `Programmé cette semaine : ${[
          ...programmesBlog.map((a) => `article « ${a.title || a.slug} » (${jour(a.scheduled_publish_at!)})`),
          ...igSemaine.map((p) => `Instagram « ${premiereLigne(p.caption, 40)} » (${jour(p.scheduled_at!)})`),
        ].join(' ; ')}.`
      : 'Rien de programmé cette semaine (aucune date posée, ni pour le blog ni pour Instagram).'
  )
  l.push(`Blog : ${enLigne.length} articles en ligne, ${brouillons.length} brouillons.`)
  if (igSansDate.length) {
    l.push(
      `Instagram : ${igSansDate.length} publications prêtes sans date — ${igSansDate
        .slice(0, 4)
        .map((p) => `« ${premiereLigne(p.caption, 40)} »`)
        .join(', ')}${igSansDate.length > 4 ? '…' : ''}.`
    )
  }
  l.push(
    memoria.length
      ? `Memoria Imperium : ${memoria.length} tâches en cours chez les agents (${memoria
          .slice(0, 3)
          .map((t) => `${t.agent} : ${premiereLigne(t.task, 45)}`)
          .join(' ; ')}).`
      : 'Memoria Imperium : aucune tâche en cours chez les agents.'
  )
  if (aValider.length) l.push(`${aValider.length} décisions attendent le fondateur dans le registre (« qu'est-ce qui attend ma validation ? »).`)

  return {
    texte: l.join('\n'),
    compteurs: {
      articles_en_ligne: enLigne.length,
      brouillons: brouillons.length,
      programmes_semaine: programmesBlog.length + igSemaine.length,
      instagram_sans_date: igSansDate.length,
      memoria_en_cours: memoria.length,
      a_valider: aValider.length,
    },
  }
}
