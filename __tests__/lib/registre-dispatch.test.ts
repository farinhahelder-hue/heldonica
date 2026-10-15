import { describe, it, expect } from 'vitest'
import {
  estDispatchable,
  dejaDispatchee,
  dependancesSatisfaites,
  brancheDe,
  brief,
  DISPATCHABLES,
  Tache,
} from '@/lib/registre-dispatch'

/**
 * La règle de dispatch du registre — testée sans base ni réseau.
 *
 * Ces tests verrouillent la propriété qui compte : une tâche abandonnée (bail
 * libéré, `claimed_by = null`, remise en `sent`) ne doit PAS être relancée. Sans
 * cela, `libererBauxExpires` transforme la veille en usine à doublons.
 */

function t(over: Partial<Tache> = {}): Tache {
  return {
    id: '11111111-2222-3333-4444-555555555555',
    agent: 'openhands',
    status: 'sent',
    task: 'Faire quelque chose de précis',
    ...over,
  }
}
const map = (...ts: Tache[]) => new Map(ts.map((x) => [x.id, x]))

describe('dejaDispatchee', () => {
  it('reconnaît une tâche déjà lancée', () => {
    expect(dejaDispatchee(t({ payload: { dispatch: { conversation_id: 'abc' } } }))).toBe(true)
  })

  it('ne se laisse pas berner par un payload quelconque', () => {
    expect(dejaDispatchee(t({ payload: { note: 'autre chose' } }))).toBe(false)
    expect(dejaDispatchee(t({ payload: { dispatch: {} } }))).toBe(false)
    expect(dejaDispatchee(t({ payload: { dispatch: { conversation_id: '' } } }))).toBe(false)
    expect(dejaDispatchee(t({ payload: null }))).toBe(false)
    expect(dejaDispatchee(t())).toBe(false)
  })
})

describe('dependancesSatisfaites', () => {
  it('sans dépendance, rien ne bloque', () => {
    expect(dependancesSatisfaites(t(), map())).toBe(true)
  })

  it("bloque tant que la dépendance n'est pas done", () => {
    const dep = t({ id: 'dep', status: 'in_progress' })
    expect(dependancesSatisfaites(t({ depends_on: 'dep' }), map(dep))).toBe(false)
  })

  it('laisse passer quand la dépendance est done', () => {
    const dep = t({ id: 'dep', status: 'done' })
    expect(dependancesSatisfaites(t({ depends_on: 'dep' }), map(dep))).toBe(true)
  })

  it('bloque si la dépendance est introuvable (anomalie visible, pas silencieuse)', () => {
    expect(dependancesSatisfaites(t({ depends_on: 'inconnue' }), map())).toBe(false)
  })
})

describe('estDispatchable — le contrat', () => {
  it('dispatche une tâche sent adressée à openhands', () => {
    expect(estDispatchable(t(), map())).toBe(true)
  })

  it('NE relance PAS une tâche abandonnée dont le bail a été libéré', () => {
    // Exactement ce que produit libererBauxExpires : status=sent, claimed_by=null,
    // mais payload.dispatch est resté. C'est le cas qui fabriquerait des doublons.
    const abandonnee = t({
      status: 'sent',
      claimed_by: null,
      payload: { dispatch: { conversation_id: 'conv-1' } },
    })
    expect(estDispatchable(abandonnee, map())).toBe(false)
  })

  it('ne dispatche pas une tâche déjà prise ou close', () => {
    for (const status of ['in_progress', 'waiting_validation', 'blocked', 'done']) {
      expect(estDispatchable(t({ status }), map())).toBe(false)
    }
  })

  it("ne dispatche pas `tous` : une tâche ouverte n'est pas un ordre", () => {
    expect(estDispatchable(t({ agent: 'tous' }), map())).toBe(false)
  })

  it("ne dispatche pas un agent qu'on ne sait pas piloter", () => {
    for (const agent of ['claude', 'gemini', 'opencode', 'jules', 'muse-spark', 'discord-bot', 'inconnu']) {
      expect(estDispatchable(t({ agent }), map())).toBe(false)
    }
  })

  it("n'ouvre que pour les agents de la liste blanche", () => {
    expect(DISPATCHABLES).toEqual(['openhands'])
  })

  it('respecte les dépendances', () => {
    const dep = t({ id: 'dep', status: 'in_progress' })
    expect(estDispatchable(t({ depends_on: 'dep' }), map(dep))).toBe(false)
  })
})

describe('brancheDe', () => {
  it('préfère la branche déjà notée', () => {
    expect(brancheDe(t({ payload: { branch: 'agent/openhands/mon-sujet' } }))).toBe(
      'agent/openhands/mon-sujet'
    )
  })

  it('sinon en dérive une, stable et propre', () => {
    expect(brancheDe(t())).toBe('agent/openhands/11111111')
  })
})

describe('brief', () => {
  const b = brief(t({ id: 'aaaa-bbbb', task: 'Corriger le titre du guide' }), {
    siteUrl: 'https://www.heldonica.fr',
  })

  it('porte la tâche', () => {
    expect(b).toContain('Corriger le titre du guide')
  })

  it('porte le protocole de compte rendu, sinon la tâche resterait sent', () => {
    expect(b).toContain('rendre_compte')
    expect(b).toContain('agent_name')
    expect(b).toContain('aaaa-bbbb')
  })

  it('rappelle la règle `done` avec preuve mesurée', () => {
    expect(b).toContain('verifie')
    expect(b).toContain('waiting_validation')
  })

  it("n'embarque aucune vraie clé dans le brief", () => {
    // On interdit une clé, pas le mot « hld_ » : le brief explique le format sans
    // en contenir une. Un motif long est le seul signe d'une vraie clé.
    expect(b).not.toMatch(/hld_[A-Za-z0-9_-]{16,}/)
    expect(b).not.toContain('service_role')
  })
})
