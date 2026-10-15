import { describe, it, expect } from 'vitest'
import {
  decisionCloture,
  conversationTerminee,
  conversationTracee,
  compteRendu,
  prs,
  INACTIVITE_MINUTES,
  TacheCloturable,
  Conversation,
} from '@/lib/registre-cloture'

/**
 * La clôture du registre — testée sans base ni réseau.
 *
 * Le test qui compte : la clôture ne pose JAMAIS `done`. C'est la règle
 * d'AGENTS.md, et le théâtre de validation (un statut vert sans mesure) est la
 * faute la plus coûteuse du projet.
 */

const MAINTENANT = new Date('2026-10-15T12:00:00Z')
const ilYA = (min: number) => new Date(MAINTENANT.getTime() - min * 60_000).toISOString()

function t(over: Partial<TacheCloturable> = {}): TacheCloturable {
  return {
    id: '11111111-2222-3333-4444-555555555555',
    status: 'in_progress',
    task: 'Corriger le guide de la vallée',
    payload: { dispatch: { conversation_id: 'conv-1', at: ilYA(60) } },
    ...over,
  }
}

function conv(over: Partial<Conversation> = {}): Conversation {
  return {
    id: 'conv-1',
    execution_status: null,
    sandbox_status: 'PAUSED',
    updated_at: ilYA(30),
    pr_number: [601],
    conversation_ui_url: 'https://app.all-hands.dev/canvas/conversations/conv-1',
    ...over,
  }
}

describe('conversationTracee', () => {
  it('lit la trace du dispatch', () => {
    expect(conversationTracee(t())).toBe('conv-1')
  })
  it('ne voit rien sans trace', () => {
    expect(conversationTracee(t({ payload: {} }))).toBe(null)
    expect(conversationTracee(t({ payload: null }))).toBe(null)
    expect(conversationTracee(t({ payload: { dispatch: { conversation_id: '' } } }))).toBe(null)
  })
})

describe('conversationTerminee', () => {
  it('attend une conversation encore en cours', () => {
    expect(conversationTerminee(conv({ execution_status: 'running', updated_at: ilYA(120) }), MAINTENANT)).toBe(false)
  })

  it('clôt une conversation arrêtée et inactive depuis assez longtemps', () => {
    expect(conversationTerminee(conv({ updated_at: ilYA(INACTIVITE_MINUTES + 1) }), MAINTENANT)).toBe(true)
  })

  it('attend une conversation arrêtée mais toute récente', () => {
    expect(conversationTerminee(conv({ updated_at: ilYA(1) }), MAINTENANT)).toBe(false)
  })

  it("attend si l'horodatage manque, plutôt que de clore à l'aveugle", () => {
    expect(conversationTerminee(conv({ updated_at: null }), MAINTENANT)).toBe(false)
    expect(conversationTerminee(conv({ updated_at: 'pas une date' }), MAINTENANT)).toBe(false)
  })
})

describe('prs', () => {
  it('extrait les numéros', () => {
    expect(prs(conv({ pr_number: [529, 601] }))).toEqual([529, 601])
  })
  it('ignore les formes inattendues', () => {
    expect(prs(conv({ pr_number: null }))).toEqual([])
    expect(prs(conv({ pr_number: '601' }))).toEqual([])
    expect(prs(conv({ pr_number: [0, -1, 'x', 601] }))).toEqual([601])
  })
})

describe('decisionCloture', () => {
  it('clôt une tâche dispatchée dont la conversation est terminée', () => {
    expect(decisionCloture(t(), conv(), MAINTENANT)).toEqual({ clore: true, raison: 'conversation terminée' })
  })

  it('ne touche pas une tâche non dispatchée par la route', () => {
    // Prise à la main par un humain : le cron ne doit pas la clore sous ses pieds.
    const d = decisionCloture(t({ payload: {} }), conv(), MAINTENANT)
    expect(d.clore).toBe(false)
    expect(d.raison).toContain('pas dispatchée')
  })

  it('ne re-clôt pas une tâche déjà close', () => {
    for (const status of ['waiting_validation', 'blocked', 'done']) {
      const d = decisionCloture(t({ status }), conv(), MAINTENANT)
      expect(d.clore).toBe(false)
      expect(d.raison).toContain('déjà')
    }
  })

  it('attend si la conversation est introuvable, plutôt que de supposer', () => {
    const d = decisionCloture(t(), null, MAINTENANT)
    expect(d.clore).toBe(false)
    expect(d.raison).toContain('introuvable')
  })

  it('attend si la conversation tourne encore', () => {
    expect(decisionCloture(t(), conv({ execution_status: 'running' }), MAINTENANT).clore).toBe(false)
  })
})

describe('compteRendu — le garde-fou central', () => {
  const cr = compteRendu(t(), conv(), { repo: 'farinhahelder-hue/heldonica' })

  it("ne pose JAMAIS done : toujours waiting_validation", () => {
    expect(cr.status).toBe('waiting_validation')
    // Même avec une PR détectée — une PR n'est pas une preuve de test.
    expect(cr.status).not.toBe('done')
  })

  it("laisse `verifie` vide : la clôture n'a rien mesuré", () => {
    expect(cr.actions_done.verifie).toEqual([])
  })

  it('dit explicitement ce qui n\'a pas été vérifié', () => {
    expect(cr.actions_done.non_verifie.join(' ')).toContain('tests')
  })

  it('porte le lien de la PR et demande sa vérification', () => {
    expect(cr.description).toContain('https://github.com/farinhahelder-hue/heldonica/pull/601')
    expect(cr.actions_done.reste_a_faire.join(' ')).toContain('pull/601')
  })

  it('sans PR, pointe la conversation à inspecter', () => {
    const sans = compteRendu(t(), conv({ pr_number: [] }), { repo: 'farinhahelder-hue/heldonica' })
    expect(sans.description).toContain('sans PR détectée')
    expect(sans.actions_done.reste_a_faire.join(' ')).toContain('conversations/conv-1')
    expect(sans.status).toBe('waiting_validation')
  })

  it('rappelle dans les notes que done n\'est jamais posé ici', () => {
    expect(cr.notes).toContain('jamais done')
  })
})
