'use client'

import { useState } from 'react'
import { INSTAGRAM_PROFILE } from '@/lib/instagram-static'
import type { InstagramStory } from '@/lib/instagram-static'

// Anciennement peuplé de liens heldonica.fr/wp-content — tous morts (403) depuis la migration
// vers Next.js. Tant qu'un flux Instagram réel n'est pas configuré via CMS, on affiche un état
// vide explicite plutôt que des vignettes cassées.
const HARDCODED_STORIES: InstagramStory[] = []

interface InstagramEmbedProps {
  limit?: number
  siteSettings?: {
    instagramUsername?: string
    instagramPostCount?: number
    instagramPosts?: string
    instagramStoriesJson?: string
  }
}

export default function InstagramEmbed({ limit = 6, siteSettings }: InstagramEmbedProps) {
  // Parse site settings for custom posts
  let stories = HARDCODED_STORIES.slice(0, limit)

  // 1. Try JSON from settings (instagram_stories_json)
  if (siteSettings?.instagramStoriesJson) {
    try {
      const parsed = JSON.parse(siteSettings.instagramStoriesJson)
      if (Array.isArray(parsed) && parsed.length > 0) {
        stories = parsed.slice(0, limit)
      }
    } catch {}
  }
  
  // 2. Fallback to pipe-delimited format
  if (siteSettings?.instagramPosts) {
    const customPosts = siteSettings.instagramPosts.split('\n').filter(Boolean).slice(0, limit).map((line, idx) => {
      const [image, permalink, title, status] = line.split('|')
      if (status?.includes('⚠️')) return null
      return {
        id: `custom-${idx}`,
        title: title?.trim() || '',
        location: '',
        permalink: permalink?.trim() || `https://instagram.com/${siteSettings.instagramUsername || INSTAGRAM_PROFILE.username}`,
        image: image?.trim() || ''
      }
    }).filter(Boolean) as InstagramStory[]
    if (customPosts.length > 0) {
      stories = customPosts
    }
  }

  const username = siteSettings?.instagramUsername || INSTAGRAM_PROFILE.username
  const postCount = siteSettings?.instagramPostCount || limit

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
            href={`https://instagram.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-mahogany hover:text-eucalyptus transition"
          >
            @{username}
          </a>
          <p className="text-sm text-charcoal/70">{INSTAGRAM_PROFILE.followersLabel}</p>
        </div>
        <a
          href={`https://instagram.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-auto sm:mx-0 px-4 py-2 bg-gradient-to-r from-eucalyptus to-teal text-white text-sm rounded-full hover:opacity-90 transition font-semibold"
        >
          Suivre
        </a>
      </div>

      {stories.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {stories.slice(0, postCount).map((story) => (
            <StoryTile key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-cloud-dancer bg-cloud-dancer/40 px-6 py-12 text-center">
          <p className="text-sm text-charcoal/70 max-w-md mx-auto">
            Le flux Instagram n&apos;est pas encore connecté ici. En attendant, retrouve nos photos terrain directement sur le compte.
          </p>
          <a
            href={`https://instagram.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block px-4 py-2 bg-gradient-to-r from-eucalyptus to-teal text-white text-sm rounded-full hover:opacity-90 transition font-semibold"
          >
            Voir @{username} sur Instagram →
          </a>
        </div>
      )}

      <p className="text-center mt-6">
        <a
          href={`https://instagram.com/${username}`}
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

function StoryTile({ story }: { story: InstagramStory }) {
  const [imageError, setImageError] = useState(false)

  return (
    <a
      href={story.permalink}
      target="_blank"
      rel="noopener noreferrer"
      className="group aspect-[4/5] relative overflow-hidden rounded-xl border border-cloud-dancer bg-mahogany block"
    >
      {!imageError ? (
        <img
          src={story.image}
          alt={`${story.title} - ${story.location}`}
          className="w-full h-full object-cover opacity-85 group-hover:opacity-95 group-hover:scale-105 transition duration-500"
          loading="lazy"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-mahogany to-eucalyptus" />
      )}
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
  )
}
