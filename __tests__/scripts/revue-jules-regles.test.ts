import { describe, it, expect } from 'vitest'
// @ts-expect-error module .mjs sans declaration de types
import { estPrDeJules, fichiersSensibles, doublons, etatCi, recommander, libelle } from '../../scripts/revue-jules-regles.mjs'

/**
 * Tri des PR de Jules : ces regles decident de ce qui est PROPOSE au fondateur
 * (fusionner, fermer, a revoir). Une erreur ici ne fusionne rien seule — le
 * fondateur valide chaque proposition — mais elle lui ferait valider une
 * recommandation fausse.
 */

const pr = (over: Record<string, unknown> = {}) => ({
  number: 1,
  title: 'fix(cms): couvertures masquees',
  ci: 'verte',
  mergeable: true,
  files: ['components/Cover.tsx'],
  additions: 10,
  deletions: 2,
  ...over,
})

describe('estPrDeJules', () => {
  it('reconnait le lien de tache Jules, pas une simple mention', () => {
    expect(estPrDeJules({ body: 'PR created by Jules for https://jules.google.com/task/123' })).toBe(true)
    expect(estPrDeJules({ body: 'destinataire jules ajoute au registre' })).toBe(false)
    expect(estPrDeJules({ body: null })).toBe(false)
  })
})

describe('fichiersSensibles', () => {
  it('signale schema, CI, auth, API et dependances', () => {
    expect(
      fichiersSensibles([
        'supabase/migrations/2026.sql',
        '.github/workflows/x.yml',
        'lib/ai-auth.ts',
        'app/api/agent-tasks/route.ts',
        'package.json',
        'components/ShareButtons.tsx',
      ])
    ).toHaveLength(5)
  })
})

describe('etatCi', () => {
  it('rouge des qu’un controle echoue', () => {
    expect(etatCi([{ status: 'completed', conclusion: 'success' }, { status: 'completed', conclusion: 'failure' }], [])).toBe('rouge')
    expect(etatCi([], [{ state: 'error' }])).toBe('rouge')
  })
  it('en cours, verte, absente', () => {
    expect(etatCi([{ status: 'in_progress', conclusion: null }], [])).toBe('en_cours')
    expect(etatCi([{ status: 'completed', conclusion: 'success' }], [{ state: 'success' }])).toBe('verte')
    expect(etatCi([], [])).toBe('absente')
  })
})

describe('doublons', () => {
  it('garde la PR verte et fusionnable, ferme les autres du groupe', () => {
    const prs = [
      pr({ number: 587, title: '🎨 Palette: Improve accessibility of share link button', files: ['components/ShareButtons.tsx'], ci: 'rouge' }),
      pr({ number: 592, title: "🎨 Palette: Improve accessibility of 'Copied!' feedback in share buttons", files: ['components/ShareButtons.tsx'] }),
      pr({ number: 616, title: "🎨 Palette: Improve ShareButtons 'Copied!' accessibility", files: ['components/ShareButtons.tsx'], mergeable: false }),
    ]
    const d = doublons(prs)
    expect(d.get(587)).toBe(592)
    expect(d.get(616)).toBe(592)
    expect(d.has(592)).toBe(false)
  })
  it('ne rapproche pas deux titres proches qui touchent des fichiers differents', () => {
    const d = doublons([
      pr({ number: 1, title: 'Add ARIA labels to icon buttons', files: ['components/A.tsx'] }),
      pr({ number: 2, title: 'Add ARIA labels to icon buttons', files: ['components/B.tsx'] }),
    ])
    expect(d.size).toBe(0)
  })
})

describe('recommander', () => {
  it('fusionner quand tout est vert', () => {
    expect(recommander(pr()).action).toBe('fusionner')
  })
  it('fermer un doublon, meme si sa CI est rouge', () => {
    expect(recommander(pr({ ci: 'rouge' }), 616)).toMatchObject({ action: 'fermer', raison: 'doublon de #616' })
  })
  it('a revoir : conflit, CI rouge, fichiers sensibles', () => {
    expect(recommander(pr({ mergeable: false }))).toMatchObject({ action: 'aucune', statut: 'blocked' })
    expect(recommander(pr({ ci: 'rouge' }))).toMatchObject({ action: 'aucune', raison: 'CI rouge' })
    expect(recommander(pr({ files: ['supabase/migrations/x.sql'] })).action).toBe('aucune')
  })
  it('fermer une PR vide plutot que la fusionner', () => {
    expect(recommander(pr({ files: [], additions: 0, deletions: 0 }))).toMatchObject({ action: 'fermer', raison: 'PR vide : aucun fichier modifie' })
  })
  it('une CI rouge suffit, sans attendre la fusionnabilite', () => {
    expect(recommander(pr({ ci: 'rouge', mergeable: null }))).toMatchObject({ raison: 'CI rouge' })
  })
  it('attend tant que la CI tourne ou que GitHub n’a pas calcule la fusionnabilite', () => {
    expect(recommander(pr({ ci: 'en_cours' }))).toBeNull()
    expect(recommander(pr({ mergeable: null }))).toBeNull()
  })
  it('libelle commence par l’action et le numero, lisibles meme tronques', () => {
    expect(libelle(pr({ number: 612 }), recommander(pr({ number: 612 })))).toMatch(/^Fusionner PR #612 \(Jules\) — CI verte/)
  })
})
