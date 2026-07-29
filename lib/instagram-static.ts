import { supabase } from './supabase-client'

export interface InstagramStory {
  id: string
  title: string
  location: string
  permalink: string
  image: string
}

export const INSTAGRAM_PROFILE = {
  username: 'heldonica',
  followersLabel: 'Stories terrain faceless',
  website: 'https://heldonica.fr',
}

// Anciennement peuplé de liens heldonica.fr/wp-content — tous morts (403) depuis la migration
// vers Next.js. Tant qu'un flux Instagram ou des photos maison réelles ne sont pas configurés
// via CMS (instagram_stories_json), on n'affiche rien plutôt qu'une image cassée.
const HARDCODED_STORIES: InstagramStory[] = []

export async function getInstagramStories(): Promise<InstagramStory[]> {
  if (!supabase) return HARDCODED_STORIES

  try {
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['instagram_stories_json', 'instagram_username', 'instagram_followers_label'])

    if (!data || data.length === 0) return HARDCODED_STORIES

    const settingsMap = Object.fromEntries(data.map(s => [s.key, s.value]))

    if (settingsMap.instagram_stories_json) {
      try {
        const parsed = JSON.parse(settingsMap.instagram_stories_json)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as InstagramStory[]
        }
      } catch {}
    }

    return HARDCODED_STORIES
  } catch {
    return HARDCODED_STORIES
  }
}
