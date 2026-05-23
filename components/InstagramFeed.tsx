'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

const BEHOLD_URL = 'https://feeds.behold.so/h8gmFRoQO2TtCYj4Guz3'

interface PostSize {
  height: number
  width: number
  mediaUrl: string
}

interface InstagramPost {
  id: string
  permalink: string
  mediaType: string
  isReel?: boolean
  mediaUrl: string
  thumbnailUrl?: string
  prunedCaption: string
  sizes?: {
    small?: PostSize
    medium?: PostSize
    large?: PostSize
  }
  colorPalette?: {
    dominant?: { r: number; g: number; b: number }
  }
}

interface BeholdFeed {
  username?: string
  posts: InstagramPost[]
}

function getPostImageUrl(post: InstagramPost): string {
  if (post.sizes?.medium?.mediaUrl) return post.sizes.medium.mediaUrl
  if (post.sizes?.small?.mediaUrl) return post.sizes.small.mediaUrl
  if ((post.mediaType === 'VIDEO' || post.isReel) && post.thumbnailUrl) return post.thumbnailUrl
  return post.mediaUrl
}

function SkeletonCard() {
  return (
    <div className="aspect-square rounded-lg bg-stone-200 animate-pulse" />
  )
}

export default function InstagramFeed() {
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [username, setUsername] = useState('heldonica')
  const [bgTint, setBgTint] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(BEHOLD_URL)
      .then((r) => r.json())
      .then((data: BeholdFeed) => {
        const fetched = data.posts?.slice(0, 6) ?? []
        setPosts(fetched)
        if (data.username) setUsername(data.username)
        // Dominant color tint from first post
        const dom = fetched[0]?.colorPalette?.dominant
        if (dom) setBgTint(`rgba(${dom.r},${dom.g},${dom.b},0.07)`)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <section
      className="py-16"
      style={{ backgroundColor: bgTint ?? undefined }}
    >
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-2xl text-stone-900">
            Notre quotidien en images
          </h2>
          <a
            href={`https://instagram.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[#1A7A7A] hover:underline"
          >
            @{username} →
          </a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : posts.map((post) => (
                <a
                  key={post.id}
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aspect-square relative group overflow-hidden rounded-lg bg-stone-200"
                >
                  <Image
                    src={getPostImageUrl(post)}
                    alt={post.prunedCaption?.slice(0, 100) || `Post @${username}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <p className="text-white text-xs line-clamp-2">
                      {post.prunedCaption?.slice(0, 80)}
                    </p>
                  </div>
                  {/* Reels badge */}
                  {(post.isReel || post.mediaType === 'VIDEO') && (
                    <div className="absolute top-2 right-2 bg-black/60 rounded px-1.5 py-0.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}
                </a>
              ))}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <a
            href={`https://instagram.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 rounded-full border border-[#2D6A4F] text-[#2D6A4F] text-sm font-medium hover:bg-[#2D6A4F] hover:text-white transition-colors duration-200"
          >
            Nous suivre sur Instagram @heldonica
          </a>
        </div>
      </div>
    </section>
  )
}
