import { getAllPosts, formatDate } from '@/lib/blog-supabase'
import HomeClient from '@/components/HomeClient'

export const revalidate = 60

export default async function Home() {
  const allPosts = await getAllPosts()
  // Top 6 pour les sections dynamiques
  const latestPosts = allPosts.slice(0, 6)
  // Articles par catégorie pour la home
  const travelPosts = allPosts.filter(p => p.category === 'Travel').slice(0, 3)
  const foodPosts = allPosts.filter(p => p.category === 'Food & Lifestyle').slice(0, 3)
  // Article mis en avant = le plus récent
  const featured = allPosts[0] ?? null

  return (
    <HomeClient
      featured={featured}
      travelPosts={travelPosts}
      foodPosts={foodPosts}
      latestPosts={latestPosts}
      totalPosts={allPosts.length}
      formatDate={formatDate}
    />
  )
}
