'use client'
import { useEffect, useState } from 'react'

type Draft = { id: string; title: string; slug: string; created_at: string; source: string; published: boolean }
type Log = { id: string; import_type: string; total_items: number; enriched_items: number; created_at: string; metadata: any }

export default function ImportsPage() {
  const [data, setData] = useState<{drafts: Draft[], logs: Log[], pois: any[]} | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/cms/imports').then(r=>r.json()).then(setData).finally(()=>setLoading(false))
  }, [])

  if (loading) return <div className="p-8 text-gray-400">Chargement imports...</div>
  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Imports Google Maps / Photos</h1>
      <p className="text-sm text-gray-500 mb-6">Drafts auto-générés (published=false) + POIs + logs. À valider avant publication — règle &quot;on n&apos;invente rien&quot;.</p>

      <div className="grid gap-6">
        <section className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold mb-3">📝 Drafts auto (à relire)</h2>
          {data?.drafts?.length ? (
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500"><tr><th className="text-left py-2">Titre</th><th className="text-left">Slug</th><th className="text-left">Date</th><th></th></tr></thead>
              <tbody className="divide-y">
                {data.drafts.map(d=>(
                  <tr key={d.id}><td className="py-2 font-medium">{d.title}</td><td className="text-gray-500">{d.slug}</td><td className="text-gray-400 text-xs">{new Date(d.created_at).toLocaleDateString('fr-FR')}</td><td><a href={`/panel-manager?article=${d.slug}`} className="text-teal-600 hover:underline text-xs">Ouvrir</a></td></tr>
                ))}
              </tbody>
            </table>
          ) : <p className="text-sm text-gray-400">Aucun draft auto — lance <code>python scripts/auto_watch_import_v2.py</code></p>}
        </section>

        <section className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold mb-3">📍 POIs importés (GMaps)</h2>
          {data?.pois?.length ? (
            <div className="space-y-2 max-h-80 overflow-auto">
              {data.pois.map((p:any)=>(
                <div key={p.id} className="flex justify-between text-sm border-b py-2">
                  <span className="font-medium">{p.name} <span className="text-gray-400">— {p.source}</span></span>
                  <span className="text-xs text-gray-500">{p.lat},{p.lng} {p.metadata?.google ? '✓ enrichi' : '○ à enrichir'}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400">Aucun POI importé</p>}
          <p className="text-xs text-gray-400 mt-3">Enrichissement: <code>POST /api/cron/enrich-places</code> (cron 06:00) ou manuel via panel</p>
        </section>

        <section className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold mb-3">📜 Logs</h2>
          {data?.logs?.length ? (
            <div className="space-y-2">
              {data.logs.map(l=>(
                <div key={l.id} className="text-sm flex justify-between"><span>{l.import_type} — {l.total_items} items → {l.enriched_items} enrichis</span><span className="text-xs text-gray-400">{new Date(l.created_at).toLocaleString('fr-FR')}</span></div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400">Aucun log</p>}
        </section>

        <section className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h3 className="font-semibold text-amber-900 mb-2">Comment utiliser (local)</h3>
          <pre className="text-xs bg-white rounded p-3 overflow-auto">{`# 1. Export Google Takeout : https://takeout.google.com
#    coche: Google Photos + Maps (Saved Places, Timeline)
# 2. Place le zip dans ~/Downloads
python scripts/auto_watch_import_v2.py --slug roumanie
# ou surveillance continue
python scripts/auto_watch_import_v2.py --watch --slug roumanie

# 3. Migration générée -> committer
git add supabase/migrations/20260902*_auto_takeout_*.sql
supabase db push

# 4. Enrichissement cloud (Places API)
#    Ajoute GOOGLE_PLACES_API_KEY dans Vercel Env, puis:
curl -X POST https://heldonica.fr/api/cron/enrich-places -H "Authorization: Bearer $CRON_SECRET"
curl -X POST https://heldonica.fr/api/cron/enrich-photos -H "Authorization: Bearer $CRON_SECRET"

# Tout est en draft (published=false) -> valider dans /panel-manager`}</pre>
        </section>
      </div>
    </div>
  )
}
