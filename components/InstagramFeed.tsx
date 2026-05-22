'use client'

interface InstagramPost {
  id: string
  timestamp: string
  permalink: string
  mediaType: string
  isReel?: boolean
  mediaUrl: string
  thumbnailUrl?: string
  caption: string
  prunedCaption: string
}

interface InstagramData {
  biography: string
  profilePictureUrl: string
  followersCount: number
  posts: InstagramPost[]
}

interface InstagramFeedProps {
  data?: InstagramData
}

const DEFAULT_DATA: InstagramData = {
  biography: "Explorateurs émerveillés, dénicheurs de pépites, créateurs d'aventure",
  profilePictureUrl: '/placeholder-avatar.svg',
  followersCount: 94,
  posts: [
    { id: '1', timestamp: '2026-05-19', permalink: 'https://instagram.com/heldonica', mediaType: 'IMAGE', mediaUrl: '', prunedCaption: 'Paysages incroyables', caption: '' },
    { id: '2', timestamp: '2026-05-18', permalink: 'https://instagram.com/heldonica', mediaType: 'IMAGE', mediaUrl: '', prunedCaption: 'Nature au rendez-vous', caption: '' },
    { id: '3', timestamp: '2026-05-17', permalink: 'https://instagram.com/heldonica', mediaType: 'IMAGE', mediaUrl: '', prunedCaption: "Chutes d'eau majestueuses", caption: '' },
    { id: '4', timestamp: '2026-05-16', permalink: 'https://instagram.com/heldonica', mediaType: 'IMAGE', mediaUrl: '', prunedCaption: 'Au détour du chemin', caption: '' },
    { id: '5', timestamp: '2026-05-15', permalink: 'https://instagram.com/heldonica', mediaType: 'IMAGE', mediaUrl: '', prunedCaption: 'Lacs et montagnes', caption: '' },
    { id: '6', timestamp: '2026-05-14', permalink: 'https://instagram.com/heldonica', mediaType: 'IMAGE', mediaUrl: '', prunedCaption: 'Horizons infinis', caption: '' },
  ],
}

// Palette Heldonica : Cloud Dancer, Eucalyptus Green, Transformative Teal, Warm Mahogany
const HELDONICA_TILES = [
  { bg: '#2D6A4F', text: '#F5F0E8' },   // Eucalyptus Green foncé
  { bg: '#40916C', text: '#F5F0E8' },   // Eucalyptus Green
  { bg: '#1B4332', text: '#F5F0E8' },   // Vert forêt profond
  { bg: '#6B4C3B', text: '#F5F0E8' },   // Warm Mahogany
  { bg: '#52796F', text: '#F5F0E8' },   // Transformative Teal
  { bg: '#354F52', text: '#F5F0E8' },   // Teal sombre
]

function BrandTile({ text, index, permalink }: { text: string; index: number; permalink: string }) {
  const tile = HELDONICA_TILES[index % HELDONICA_TILES.length]

  return (
    <a
      href={permalink}
      target="_blank"
      rel="noopener noreferrer"
      className="aspect-square relative group overflow-hidden rounded-lg flex items-center justify-center"
      style={{ backgroundColor: tile.bg }}
    >
      {/* Texture subtile */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 60%)',
        }}
      />
      {/* Logo / initiale */}
      <div className="relative z-10 flex flex-col items-center gap-2 px-3 text-center">
        <span
          className="font-serif text-2xl opacity-40"
          style={{ color: tile.text }}
        >
          H
        </span>
        <span
          className="text-xs font-medium leading-tight opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ color: tile.text }}
        >
          {text}
        </span>
      </div>
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
    </a>
  )
}

export default function InstagramFeed({ data }: InstagramFeedProps) {
  const instagramData =
    data && data.posts && data.posts.length > 0 ? data : DEFAULT_DATA
  const { posts, followersCount, biography } = instagramData

  return (
    <section className="py-16" style={{ backgroundColor: '#F5F0E8' }}>
      <div className="max-w-6xl mx-auto px-6">

        {/* En-tête section */}
        <h2 className="font-serif text-2xl text-center mb-10" style={{ color: '#2D3A2E' }}>
          Sur le terrain, pas en studio
        </h2>

        {/* Profil */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {/* Avatar initiale */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-serif flex-shrink-0"
              style={{ backgroundColor: '#40916C' }}
            >
              H
            </div>
            <div>
              <p className="font-serif text-lg" style={{ color: '#2D3A2E' }}>
                @heldonica
              </p>
              <p className="text-sm" style={{ color: '#7A7A6E' }}>
                {followersCount} abonnés
              </p>
            </div>
          </div>
          <a
            href="https://instagram.com/heldonica"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium hover:underline transition-all"
            style={{ color: '#40916C' }}
          >
            Suivre →
          </a>
        </div>

        {/* Bio */}
        <p className="mb-10 text-sm leading-relaxed" style={{ color: '#5C5C52' }}>
          {biography}
        </p>

        {/* Grille posts */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {posts.map((post, idx) => (
            <BrandTile
              key={post.id}
              text={post.prunedCaption}
              index={idx}
              permalink={post.permalink}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <a
            href="https://instagram.com/heldonica"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all duration-200"
            style={{ color: '#40916C' }}
          >
            Voir plus sur Instagram →
          </a>
        </div>
      </div>
    </section>
  )
}
