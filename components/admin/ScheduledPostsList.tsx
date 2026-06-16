'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Send, Trash2, Eye } from 'lucide-react'

interface ScheduledPost {
  id: string
  image_url: string
  caption: string
  status: string
  scheduled_at: string | null
  article_id: number | null
  created_at: string
  error_message?: string | null
}

export default function ScheduledPostsList() {
  const [posts, setPosts] = useState<ScheduledPost[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/instagram/scheduled')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setPosts(data.scheduledPosts || data || [])
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPosts() }, [])

  const handlePublish = async (id: string) => {
    const res = await fetch('/api/instagram/scheduled', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'published' }),
    })
    if (res.ok) fetchPosts()
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/instagram/scheduled?id=${id}`, { method: 'DELETE' })
    if (res.ok) fetchPosts()
  }

  if (loading) return <div className="text-sm text-stone-400">Chargement...</div>

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-5">
        <h3 className="font-semibold text-sm text-stone-700 mb-3">Posts programmés</h3>
        <p className="text-xs text-stone-400">Aucun post programmé. Publie un article pour qu&apos;un brouillon soit créé automatiquement.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5">
      <h3 className="font-semibold text-sm text-stone-700 mb-3">
        Posts programmés ({posts.length})
      </h3>
      <div className="space-y-3">
        {posts.map((post) => (
          <div key={post.id} className="flex gap-3 items-start p-3 rounded-lg bg-stone-50 border border-stone-100">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-200 flex-shrink-0">
              {post.image_url ? (
                <img src={post.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">No img</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-stone-700 line-clamp-2 leading-relaxed">{post.caption?.substring(0, 120) || 'Sans légende'}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  post.status === 'published' ? 'bg-green-100 text-green-700' :
                  post.status === 'draft' ? 'bg-amber-100 text-amber-700' :
                  post.status === 'failed' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {post.status === 'draft' && <Eye size={10} />}
                  {post.status === 'scheduled' && <Calendar size={10} />}
                  {post.status === 'published' && <Send size={10} />}
                  {post.status === 'failed' && <Clock size={10} />}
                  {post.status}
                </span>
                {post.article_id && (
                  <span className="text-[10px] text-stone-400">Article #{post.article_id}</span>
                )}
                {post.status !== 'published' && (
                  <div className="ml-auto flex gap-1">
                    {post.status === 'draft' && (
                      <button onClick={() => handlePublish(post.id)} className="p-1 rounded hover:bg-stone-200 text-eucalyptus" title="Marquer comme publié">
                        <Send size={12} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(post.id)} className="p-1 rounded hover:bg-stone-200 text-red-400" title="Supprimer">
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
