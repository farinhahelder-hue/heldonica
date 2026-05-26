'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Instagram } from 'lucide-react'

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

interface InstagramFeedProps {
  feedId?: string
}

export default function InstagramFeed({ feedId }: InstagramFeedProps) {
  const [posts, setPosts] = useState<BeholdPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [bgColor, setBgColor] = useState<string>('transparent')

  const username = 'heldonica'
  const apiUrl = feedId
    ? `https://feeds.behold.so/${feedId}`
    : `https://feeds.behold.so/${process.env.NEXT_PUBLIC_BEHOLD_FEED_ID || 'demo'}`

  useEffect(() => {
    const controller = new AbortController()

    fetch(apiUrl, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error('API error')
        return r.json()
      })
      .then((data: BeholdPost[]) => {
        if (!Array.isArray(data) || data.length === 0) {
          setError(true)
        } else {
          setPosts(data.slice(0, 6))
          if (data[0]?.dominantColor) {
            const [r, g, b] = data[0].dominantColor
            setBgColor(`rgba(${r},${g},${b},0.08)`)
          }
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [apiUrl])

  function getMediaUrl(post: BeholdPost): string {
    return post.sizes?.medium?.mediaUrl || post.thumbnailUrl || ''
  }

  const showEmptyState = !loading && (error || posts.length === 0)

  return (
    <section style={{ backgroundColor: bgColor }} className="py-16 transition-colors duration-700">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-serif text-mahogany text-center mb-8">
          Sur le terrain, pas en studio
        </h2>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-stone-200 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Posts grid */}
        {!loading && posts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {posts.map((post) => {
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
                    <Image
                      src={src}
                      alt={caption || `Post Instagram @${username}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 33vw"
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
        )}

        {/* Empty/error state */}
        {showEmptyState && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Instagram className="w-12 h-12 text-stone-400 mb-4" />
            <p className="text-stone-500 mb-2">@{username}</p>
          </div>
        )}

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
