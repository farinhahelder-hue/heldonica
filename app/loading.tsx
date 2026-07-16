export default function Loading() {
  return (
    <div className="min-h-screen bg-cloud-dancer flex items-center justify-center" aria-label="Chargement en cours" role="status">
      <div className="flex flex-col items-center gap-4">
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          className="animate-spin text-eucalyptus"
          aria-hidden="true"
        >
          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" strokeDasharray="80 40" strokeLinecap="round" opacity="0.3" />
          <path d="M24 4a20 20 0 0 1 20 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <span className="text-sm text-charcoal/50 font-medium tracking-wide">Chargement…</span>
      </div>
    </div>
  )
}
