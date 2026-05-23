'use client'

import Image from 'next/image'
import { InstagramFeedPost } from '@/lib/instagram-feed'

interface InstagramFeedProps {
  posts: InstagramFeedPost[]
  username?: string
}

export default function InstagramFeed({ posts, username = 'heldonica' }: InstagramFeedProps) {
  if (!posts || posts.length === 0) return null

  return (
    <section className="py-8 bg-transparent">
      <div className="w-full">
        {/* Grille de posts */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {posts.slice(0, 6).map((post) => (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-square relative group overflow-hidden rounded-lg bg-stone-200 block"
            >
              <Image
                src={post.mediaUrl}
                alt={post.caption?.slice(0, 100) || `Post Instagram @${username}`}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized
              />
              {/* Overlay hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex items-center text-white gap-2 font-medium">
                  {/* Cœur SVG pour les likes */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span>{post.likes}</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <a
            href={`https://instagram.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-eucalyptus text-eucalyptus font-medium hover:bg-eucalyptus hover:text-white transition-all rounded-full"
          >
            Suivre @{username} →
          </a>
        </div>
      </div>
    </section>
  )
}
