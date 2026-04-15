'use client'

import { INSTAGRAM_PROFILE, INSTAGRAM_STORIES } from '@/lib/instagram-static'

interface InstagramEmbedProps {
  limit?: number
}

export default function InstagramEmbed({ limit = 6 }: InstagramEmbedProps) {
  const stories = INSTAGRAM_STORIES.slice(0, limit)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-eucalyptus to-teal p-2 shadow-md mx-auto sm:mx-0">
          <img
            src="/images/badges-heldonica.svg"
            alt="Badge Heldonica"
            className="w-full h-full object-cover rounded-full bg-white"
            loading="lazy"
          />
        </div>
        <div className="text-center sm:text-left">
          <a
            href={`https://instagram.com/${INSTAGRAM_PROFILE.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-mahogany hover:text-eucalyptus transition"
          >
            @{INSTAGRAM_PROFILE.username}
          </a>
          <p className="text-sm text-stone-600">{INSTAGRAM_PROFILE.followersLabel}</p>
        </div>
        <a
          href={`https://instagram.com/${INSTAGRAM_PROFILE.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-auto sm:mx-0 px-4 py-2 bg-gradient-to-r from-eucalyptus to-teal text-white text-sm rounded-full hover:opacity-90 transition font-semibold"
        >
          Suivre
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {stories.map((story) => (
          <a
            key={story.id}
            href={story.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="group aspect-[4/5] relative overflow-hidden rounded-xl border border-stone-200 bg-stone-900 block"
          >
            <img
              src={story.image}
              alt={`${story.title} - ${story.location}`}
              className="w-full h-full object-cover opacity-85 group-hover:opacity-95 group-hover:scale-105 transition duration-500"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.src = '/images/badges-heldonica.svg'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <span className="absolute top-2 left-2 text-[10px] uppercase tracking-[0.14em] bg-white/20 text-white px-2 py-1 rounded-full backdrop-blur-sm">
              Story
            </span>
            <div className="absolute bottom-2 left-2 right-2">
              <p className="text-[11px] text-teal font-semibold uppercase tracking-[0.12em]">
                {story.location}
              </p>
              <p className="text-sm text-white font-semibold leading-tight line-clamp-2">{story.title}</p>
            </div>
          </a>
        ))}
      </div>

      <p className="text-center mt-6">
        <a
          href={`https://instagram.com/${INSTAGRAM_PROFILE.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-eucalyptus hover:text-teal transition text-sm font-semibold"
        >
          Voir plus sur Instagram -&gt;
        </a>
      </p>
    </div>
  )
}
