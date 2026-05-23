'use client'

import Image from 'next/image'

interface PostSize {
  height: number
  width: number
  mediaUrl: string
}

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
  sizes?: {
    small?: PostSize
    medium?: PostSize
    large?: PostSize
    full?: PostSize
  }
  colorPalette?: {
    dominant: string
    vibrant?: string
  }
}

interface InstagramData {
  username?: string
  biography: string
  profilePictureUrl: string
  followersCount: number
  posts: InstagramPost[]
}

interface InstagramFeedProps {
  data?: InstagramData
}

function getPostImageUrl(post: InstagramPost): string {
  // Priorité : Behold CDN (stable, pas de CORS) > thumbnailUrl pour les reels > mediaUrl
  if (post.sizes?.medium?.mediaUrl) return post.sizes.medium.mediaUrl
  if (post.sizes?.small?.mediaUrl) return post.sizes.small.mediaUrl
  if (post.isReel && post.thumbnailUrl) return post.thumbnailUrl
  return post.mediaUrl
}

function getPostImageDimensions(post: InstagramPost): { width: number; height: number } {
  if (post.sizes?.medium) return { width: post.sizes.medium.width, height: post.sizes.medium.height }
  if (post.sizes?.small) return { width: post.sizes.small.width, height: post.sizes.small.height }
  return { width: 700, height: 700 }
}

export default function InstagramFeed({ data }: InstagramFeedProps) {
  if (!data || !data.posts || data.posts.length === 0) return null

  const { posts, profilePictureUrl, followersCount, biography } = data
  const username = data.username || 'heldonica'

  return (
    <section className="py-16 bg-stone-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header profil */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-stone-200 relative flex-shrink-0">
              <Image
                src={profilePictureUrl}
                alt={`Photo de profil @${username}`}
                fill
                sizes="64px"
                className="object-cover"
                unoptimized
              />
            </div>
            <div>
              <h3 className="font-serif text-xl text-stone-900">@{username}</h3>
              <p className="text-sm text-stone-500">{followersCount} abonnés</p>
            </div>
          </div>
          <a
            href={`https://instagram.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-eucalyptus hover:underline font-medium"
          >
            Suivre →
          </a>
        </div>

        <p className="text-stone-600 mb-10 max-w-2xl">{biography}</p>

        {/* Grille de posts */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {posts.slice(0, 6).map((post) => {
            const imgUrl = getPostImageUrl(post)
            const { width, height } = getPostImageDimensions(post)
            const isPortrait = height > width

            return (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square relative group overflow-hidden rounded-lg bg-stone-200"
              >
                <Image
                  src={imgUrl}
                  alt={post.prunedCaption?.slice(0, 100) || `Post Instagram @${username}`}
                  fill
                  sizes="(max-width: 768px) 33vw, 16vw"
                  className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isPortrait ? 'object-top' : 'object-center'}`}
                  unoptimized
                />
                {/* Overlay hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end p-2">
                  {post.prunedCaption && (
                    <p className="text-white text-xs line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {post.prunedCaption.slice(0, 80)}
                    </p>
                  )}
                </div>
                {/* Badge Reel */}
                {post.isReel && (
                  <div className="absolute top-2 right-2 bg-black/60 rounded px-1.5 py-0.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                )}
              </a>
            )
          })}
        </div>

        <div className="mt-8 text-center">
          <a
            href={`https://instagram.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-eucalyptus font-medium hover:gap-3 transition-all"
          >
            Voir plus sur Instagram →
          </a>
        </div>
      </div>
    </section>
  )
}
