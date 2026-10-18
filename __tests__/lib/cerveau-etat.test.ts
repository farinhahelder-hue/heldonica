import { describe, it, expect } from 'vitest'
import { resumerEtat } from '@/lib/cerveau-etat'

/**
 * Le résumé glissé dans le contexte du Cerveau du Poco. Un petit modèle répète
 * ce qu'on lui donne : une ligne fausse ici devient une réponse fausse là-bas.
 */
const maintenant = new Date('2026-10-18T12:00:00Z')

describe('resumerEtat', () => {
  it('dit « rien de programmé » quand aucune date n’est posée, sans rien inventer', () => {
    const { texte, compteurs } = resumerEtat({
      maintenant,
      articles: [
        { slug: 'poncha', title: 'Poncha', status: 'published', published: true, scheduled_publish_at: null },
        { slug: 'urbex', title: 'Urbex', status: 'draft', published: false, scheduled_publish_at: null },
      ],
      instagram: [{ status: 'draft', scheduled_at: null, caption: '📍 Timișoara\nla suite' }],
      taches: [],
    })
    expect(texte).toContain('Rien de programmé cette semaine')
    expect(texte).toContain('Blog : 1 articles en ligne, 1 brouillons.')
    expect(texte).toContain('« 📍 Timișoara »')
    expect(compteurs.programmes_semaine).toBe(0)
  })

  it('liste ce qui tombe dans les 7 jours, pas au-delà', () => {
    const { texte, compteurs } = resumerEtat({
      maintenant,
      articles: [
        { slug: 'a', title: 'Madère en hiver', status: 'draft', published: false, scheduled_publish_at: '2026-10-20T08:00:00Z' },
        { slug: 'b', title: 'Trop tard', status: 'draft', published: false, scheduled_publish_at: '2026-11-30T08:00:00Z' },
      ],
      instagram: [{ status: 'scheduled', scheduled_at: '2026-10-19T17:00:00Z', caption: 'Carrousel poncha' }],
      taches: [],
    })
    expect(texte).toContain('article « Madère en hiver »')
    expect(texte).toContain('Instagram « Carrousel poncha »')
    expect(texte).not.toContain('Trop tard')
    expect(compteurs.programmes_semaine).toBe(2)
  })

  it('suit Memoria Imperium et les décisions qui attendent le fondateur', () => {
    const { texte, compteurs } = resumerEtat({
      maintenant,
      articles: [],
      instagram: [],
      taches: [
        { agent: 'jules', status: 'in_progress', task: 'feat(thumbnail): miniatures YouTube 1280x720', scope: null },
        { agent: 'jules', status: 'in_progress', task: 'Corriger le CSS du footer', scope: null },
        { agent: 'fondateur', status: 'waiting_validation', task: 'Fusionner PR #616', scope: 'revue-jules' },
      ],
    })
    expect(compteurs.memoria_en_cours).toBe(1)
    expect(texte).toContain('Memoria Imperium : 1 tâches en cours')
    expect(texte).toContain('1 décisions attendent le fondateur')
  })
})
