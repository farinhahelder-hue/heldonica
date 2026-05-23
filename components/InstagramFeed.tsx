'use client'

import { useEffect, useState } from 'react'

interface BeholdPost {
  id: string
  permalink: string
  prunedCaption?: string
  mediaType?: string
  sizes?: {
    medium?: { mediaUrl?: string }
    thumbnail?: { mediaUrl?: string }
  }
  thumbnailUrl?: string
  dominantColor?: number[]
}

export default function InstagramFeed() {
  const [posts, setPosts] = useState<BeholdPost[]>([])
  const [loading, setLoading] = useState(true)
  const [bgColor, setBgColor] = useState<string>('transparent')

  useEffect(() => {
    fetch('https://feeds.behold.so/h8gmFRoQO2TtCYj4Guz3')
      .then((r) => r.json())
      .then((data: BeholdPost[]) => {
        setPosts(data.slice(0, 6))
        if (data[0]?.dominantColor) {
          const [r, g, b] = data[0].dominantColor
          setBgColor(`rgba(${r},${g},${b},0.08)`)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function getMediaUrl(post: BeholdPost): string {
    if (post.mediaType === 'VIDEO' || post.mediaType === 'REEL') {
      return post.sizes?.medium?.mediaUrl || post.thumbnailUrl || ''
    }
    return post.sizes?.medium?.mediaUrl || post.thumbnailUrl || ''
  }

  const username = 'heldonica'

  return (
    <section style={{ backgroundColor: bgColor }} className="py-16 transition-colors duration-700">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-serif text-mahogany text-center mb-8">
          Sur le terrain, pas en studio
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-stone-200 animate-pulse"
                />
              ))
            : posts.map((post) => {
                const isReel = post.mediaType === 'VIDEO' || post.mediaType === 'REEL'
                const src = getMediaUrl(post)
                const caption = post.prunedCaption?.slice(0, 80) ?? ''

                return (
                  <a
                    key={post.id}
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-square relative group overflow-hidden rounded-lg bg-stone-200 block"
                  >
                    {src && (
                      <img
                        src={src}
                        alt={caption || `Post Instagram @${username}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        width={400}
                        height={400}
                      />
                    )}

                    {/* Reel badge */}
                    {isReel && (
                      <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                        ▶
                      </span>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end p-3">
                      <p className="text-white text-xs leading-snug line-clamp-3">{caption}</p>
                    </div>
                  </a>
                )
              })}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <a
            href={`https://instagram.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-eucalyptus text-eucalyptus font-medium hover:bg-eucalyptus hover:text-white transition-all rounded-full"
          >
            Nous suivre sur Instagram @{username} →
          </a>
        </div>
      </div>
    </section>
  )
}
