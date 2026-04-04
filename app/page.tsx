import { getAllPosts, formatDate } from '@/lib/blog-supabase'
import HomeClient from '@/components/HomeClient'

export const revalidate = 60

// Pre-format dates for client components (cannot pass functions)
function formatPosts(posts: BlogPost[]) {
  return posts.map(post => ({
    ...post,
    formattedDate: formatDate(post.published_at)
  }))
}

export default async function Home() {
  const allPosts = await getAllPosts()
  // Top 6 pour les sections dynamiques
  const latestPosts = allPosts.slice(0, 6)
  // Articles par catégorie pour la home
  const travelPosts = formatPosts(allPosts.filter(p => p.category === 'Travel').slice(0, 3))
  const foodPosts = formatPosts(allPosts.filter(p => p.category === 'Food & Lifestyle').slice(0, 3))
  // Article mis en avant = le plus récent
  const featured = allPosts[0] ? { ...allPosts[0], formattedDate: formatDate(allPosts[0].published_at) } : null

  return (
    <HomeClient
      featured={featured}
      travelPosts={travelPosts}
      foodPosts={foodPosts}
      latestPosts={formatPosts(latestPosts)}
      totalPosts={allPosts.length}
    />
  )
}
