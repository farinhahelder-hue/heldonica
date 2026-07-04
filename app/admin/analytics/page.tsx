'use client'

import { useEffect, useState } from 'react'

interface PageViewData {
  pagePath: string
  pageTitle: string
  screenPageViews: number
}

interface DailyTrafficData {
  date: string
  activeUsers: number
}

interface ConversionsData {
  totalVisitors: number
  planningVisitors: number
  submissions: number
  conversionRate: number
}

interface AnalyticsResponse {
  isMocked: boolean
  topPages: PageViewData[]
  dailyTraffic: DailyTrafficData[]
  conversions: ConversionsData
  period: string
}

export default function AnalyticsDashboardPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/admin/analytics?period=${period}`)
        if (!res.ok) throw new Error('Erreur de chargement')
        const json = await res.json()
        setData(json)
      } catch {
        setError('Erreur lors de la recuperation des analyses')
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [period])

  // Custom inline SVG bar chart renderer
  const renderTrafficChart = (traffic: DailyTrafficData[]) => {
    if (!traffic || traffic.length === 0) return null

    const maxUsers = Math.max(...traffic.map((t) => t.activeUsers), 10)
    const chartHeight = 160
    const paddingLeft = 35
    const paddingBottom = 25
    const width = 640
    const height = chartHeight + paddingBottom

    const barWidth = Math.max(2, Math.floor((width - paddingLeft) / traffic.length) - 4)
    const stepX = (width - paddingLeft) / traffic.length

    return (
      <div className="relative w-full overflow-x-auto no-scrollbar">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[500px]">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
            const y = chartHeight - p * chartHeight
            const value = Math.round(p * maxUsers)
            return (
              <g key={i} className="opacity-20">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width}
                  y2={y}
                  stroke="#2C2C2C"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  fill="#2C2C2C"
                  fontSize="9"
                  textAnchor="end"
                  className="font-mono"
                >
                  {value}
                </text>
              </g>
            )
          })}

          {/* Bar rendering */}
          {traffic.map((t, idx) => {
            const barHeight = (t.activeUsers / maxUsers) * chartHeight
            const x = paddingLeft + idx * stepX + 2
            const y = chartHeight - barHeight

            // Format date for tooltip/label
            const rawDate = new Date(t.date)
            const labelDay = rawDate.getDate()
            const labelMonth = rawDate.toLocaleDateString('fr-FR', { month: 'short' })

            // Display labels for every N-th bar to avoid overlap
            const labelFrequency = traffic.length > 30 ? 10 : traffic.length > 7 ? 5 : 1
            const showLabel = idx % labelFrequency === 0 || idx === traffic.length - 1

            return (
              <g key={idx} className="group">
                {/* Visual bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(2, barHeight)}
                  fill="#7C9E8A"
                  rx="2"
                  className="transition-all hover:fill-mahogany duration-200 cursor-pointer"
                />
                {/* Hover Tooltip */}
                <title>{`${t.date} : ${t.activeUsers} utilisateurs actifs`}</title>

                {/* X-axis labels */}
                {showLabel && (
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight + 16}
                    fill="#6B6B6B"
                    fontSize="8"
                    textAnchor="middle"
                    className="font-mono select-none"
                  >
                    {`${labelDay} ${labelMonth}`}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900">
            Tableau de bord de trafic et conversions
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            Suivi des utilisateurs actifs et des demandes de voyage personnalise.
          </p>
        </div>
        <div className="flex bg-stone-100 rounded-lg p-1 shrink-0 border border-stone-200">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition ${
                period === p
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-950'
              }`}
            >
              {p === '7d' ? '7 Jours' : p === '30d' ? '30 Jours' : '90 Jours'}
            </button>
          ))}
        </div>
      </div>

      {/* Connection notice for mocked data */}
      {data?.isMocked && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <span className="font-semibold block mb-0.5">Mode Demonstration actif</span>
            Pour connecter des donnees réelles, ajoutez la variable <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-xs">GA4_PROPERTY_ID</code> dans Vercel.
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded border border-amber-200 shrink-0">
            Mocked GA4 Data
          </span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {/* Skeleton loader / Content */}
      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-200 p-6 h-28 animate-pulse space-y-3">
                <div className="h-4 w-1/3 bg-stone-100 rounded" />
                <div className="h-8 w-1/2 bg-stone-100 rounded" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-6 h-64 animate-pulse space-y-4">
            <div className="h-4 w-1/4 bg-stone-100 rounded" />
            <div className="h-40 w-full bg-stone-50 rounded" />
          </div>
        </div>
      ) : (
        data && (
          <div className="space-y-6 animate-fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Visiteurs uniques (DAU)
                </span>
                <p className="text-3xl font-light font-serif text-stone-900 mt-2">
                  {data.conversions.totalVisitors}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Vues Travel Planning
                </span>
                <p className="text-3xl font-light font-serif text-stone-900 mt-2">
                  {data.conversions.planningVisitors}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Formulaires Soumis
                </span>
                <p className="text-3xl font-light font-serif text-stone-900 mt-2 text-eucalyptus">
                  {data.conversions.submissions}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Taux de conversion
                </span>
                <p className="text-3xl font-light font-serif text-stone-900 mt-2">
                  {data.conversions.conversionRate}%
                </p>
              </div>
            </div>

            {/* Daily traffic chart widget */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">
                Utilisateurs Actifs Quotidiens
              </h3>
              {renderTrafficChart(data.dailyTraffic)}
            </div>

            {/* Top pages table widget */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">
                Top 10 pages les plus vues
              </h3>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500 font-semibold bg-stone-50/50">
                      <th className="p-3 w-8 text-center">#</th>
                      <th className="p-3">Titre de la Page</th>
                      <th className="p-3">Chemin d'accès (Path)</th>
                      <th className="p-3 text-right">Vues</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {data.topPages.map((page, idx) => (
                      <tr key={idx} className="hover:bg-stone-50/30 transition">
                        <td className="p-3 text-center font-mono text-stone-400">{idx + 1}</td>
                        <td className="p-3 text-stone-900 font-medium">{page.pageTitle}</td>
                        <td className="p-3 font-mono text-stone-500">{page.pagePath}</td>
                        <td className="p-3 text-right font-mono font-semibold text-stone-700">
                          {page.screenPageViews}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  )
}
