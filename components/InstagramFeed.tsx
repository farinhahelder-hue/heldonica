'use client'

import Image from 'next/image'

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

// Fallback data using gradient placeholders (Instagram CDN blocked by Vercel)
const DEFAULT_DATA: InstagramData = {
  biography: 'Explorateurs émerveillés, dénicheurs de pépites, créateurs d\'aventure',
  profilePictureUrl: '/placeholder-avatar.svg',
  followersCount: 94,
  posts: [
    {
      id: '1',
      timestamp: '2026-05-19',
      permalink: 'https://instagram.com/heldonica',
      mediaType: 'IMAGE',
      mediaUrl: '/placeholder-post.svg',
      prunedCaption: 'Paysages incroyables'
    },
    {
      id: '2',
      timestamp: '2026-05-18',
      permalink: 'https://instagram.com/heldonica',
      mediaType: 'IMAGE',
      mediaUrl: '/placeholder-post.svg',
      prunedCaption: 'Nature au rendez-vous'
    },
    {
      id: '3',
      timestamp: '2026-05-17',
      permalink: 'https://instagram.com/heldonica',
      mediaType: 'IMAGE',
      mediaUrl: '/placeholder-post.svg',
      prunedCaption: 'Chutes d\'eau majestueuses'
    },
    {
      id: '4',
      timestamp: '2026-05-16',
      permalink: 'https://instagram.com/heldonica',
      mediaType: 'IMAGE',
      mediaUrl: '/placeholder-post.svg',
      prunedCaption: 'Au détour du chemin'
    },
    {
      id: '5',
      timestamp: '2026-05-15',
      permalink: 'https://instagram.com/heldonica',
      mediaType: 'IMAGE',
      mediaUrl: '/placeholder-post.svg',
      prunedCaption: 'Lacs et montagnes'
    },
    {
      id: '6',
      timestamp: '2026-05-14',
      permalink: 'https://instagram.com/heldonica',
      mediaType: 'IMAGE',
      mediaUrl: '/placeholder-post.svg',
      prunedCaption: 'Horizons infinis'
    },
  ],
}

function GradientPlaceholder({ text, index }: { text: string, index: number }) {
  const gradients = [
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600', 
    'from-rose-500 to-pink-600',
    'from-violet-500 to-purple-600',
    'from-cyan-500 to-blue-600',
    'from-lime-500 to-green-600'
  ]
  const bgClass = gradients[index % gradients.length]
  
  return (
    <div className={`w-full h-full bg-gradient-to-br ${bgClass} flex items-center justify-center`}>
      <span className="text-white/60 text-xs text-center px-2">{text}</span>
    </div>
  )
}

export default function InstagramFeed({ data }: InstagramFeedProps) {
  const instagramData = (data && data.posts && data.posts.length > 0) ? data : DEFAULT_DATA
  const { posts, profilePictureUrl, followersCount, biography } = instagramData

  return (
    <section className="py-16 bg-stone-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-serif">
              H
            </div>
            <div>
              <h3 className="font-serif text-xl text-stone-900">@heldonica</h3>
              <p className="text-sm text-stone-500">{followersCount} abonnés</p>
            </div>
          </div>
          <a 
            href="https://instagram.com/heldonica"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-eucalyptus hover:underline font-medium"
          >
            Suivre →
          </a>
        </div>

        <p className="text-stone-600 mb-10 max-w-2xl">{biography}</p>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {posts.map((post, idx) => (
            <a 
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-square relative group overflow-hidden rounded-lg"
            >
              <GradientPlaceholder text={post.prunedCaption} index={idx} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-2">
                <p className="text-white text-xs truncate opacity-0 group-hover:opacity-100 transition-opacity">
                  {post.prunedCaption.slice(0, 40)}
                </p>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a 
            href="https://instagram.com/heldonica"
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
