import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const results: Record<string, unknown> = {}

  // ÉTAPE 1 — Voir les stubs (read_time <= 1)
  const { data: stubs, error: stubsError } = await supabase
    .from('cms_blog_posts')
    .select('id, title, read_time, published')
    .lte('read_time', 1)

  results.stubs_found = stubs
  results.stubs_error = stubsError

  // ÉTAPE 2 — Dépublier les stubs
  const stubIds = stubs?.map((s: { id: number }) => s.id) ?? []
  if (stubIds.length > 0) {
    const { data: depublished, error: depubError } = await supabase
      .from('cms_blog_posts')
      .update({ published: false })
      .in('id', stubIds)
      .select('id, title')

    results.depublished = depublished
    results.depublished_error = depubError
  } else {
    results.depublished = 'Aucun stub trouvé (read_time <= 1)'
  }

  // ÉTAPE 3 — Corriger les titres génériques
  const titleFixes = [
    {
      match: 'Guide Complet Éco-Luxe',
      newTitle: "Madère en slow travel : ce qu'on a vraiment fait (et raté)",
    },
    {
      match: 'brasseries de Zurich',
      newTitle: "Brasseries à Zurich : les adresses qu'on retourne voir",
    },
    {
      match: 'carnet slow travel 2026',
      newTitle: 'Notre carnet de route — printemps 2026',
    },
    {
      match: 'Comment débuter le Slow Travel',
      newTitle: "Comment on a commencé à voyager autrement",
    },
  ]

  results.title_updates = []

  for (const fix of titleFixes) {
    const { data: found } = await supabase
      .from('cms_blog_posts')
      .select('id, title')
      .ilike('title', `%${fix.match}%`)

    if (found && found.length > 0) {
      const { data: updated, error: updateError } = await supabase
        .from('cms_blog_posts')
        .update({ title: fix.newTitle })
        .ilike('title', `%${fix.match}%`)
        .select('id, title')

      ;(results.title_updates as unknown[]).push({
        match: fix.match,
        updated,
        error: updateError,
      })
    } else {
      ;(results.title_updates as unknown[]).push({
        match: fix.match,
        updated: 'Non trouvé en base',
      })
    }
  }

  return NextResponse.json(results, { status: 200 })
}
