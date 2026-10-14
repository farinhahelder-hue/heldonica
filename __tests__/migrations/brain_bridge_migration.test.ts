import { describe, it, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'

/**
 * Tâche 1.2 — vérification de la migration du pont.
 *
 * La migration `20260922000000_brain_bridge_agent_tasks.sql` ajoute `task_type`
 * et `payload` à `agent_tasks`. La garde statique `check:cms-migrations` vérifie
 * qu'un fichier de migration existe ; elle ne dit rien du schéma **réellement**
 * appliqué. Ce test lit la vraie base.
 *
 * Lecture seule : il ne fait qu'un `SELECT … LIMIT 1`. Il ne s'exécute que si
 * `INTEGRATION=true` et que les identifiants Supabase sont présents, et refuse
 * toute URL de production (voir la garde ci-dessous).
 */

const INTEGRATION = process.env.INTEGRATION === 'true'
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

const isProdUrl = (url: string | undefined) => !!url && /heldonica\.fr|prod/i.test(url)

const canRun = INTEGRATION && !!SB_URL && !!SB_KEY && !isProdUrl(SB_URL)

describe.skipIf(!canRun)('migration agent_tasks — colonnes du pont', () => {
  it('task_type et payload existent et sont lisibles', async () => {
    const sb = createClient(SB_URL!, SB_KEY!)

    // Si l'une des colonnes manquait, PostgREST renverrait une erreur de schéma.
    const { error } = await sb.from('agent_tasks').select('task_type, payload').limit(1)

    expect(error).toBeNull()
  })

  it('les colonnes préexistantes du pont sont toujours là (migration non destructive)', async () => {
    const sb = createClient(SB_URL!, SB_KEY!)

    const { error } = await sb
      .from('agent_tasks')
      .select('id, agent, task, status, created_at, claimed_by, claimed_at, actions_done, notes')
      .limit(1)

    expect(error).toBeNull()
  })
})
