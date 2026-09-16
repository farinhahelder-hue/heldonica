'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, Clock, Send, Trash2, Eye, ExternalLink, Images, Film, Image as ImageIcon } from 'lucide-react'

interface ScheduledPost {
  id: string
  image_url: string
  caption: string
  status: string
  scheduled_at: string | null
  article_id: number | null
  created_at: string
  permalink?: string | null
  error_message?: string | null
  metadata?: { type?: string; children?: string[]; video_url?: string } | null
}

/** Ce que Meta va recevoir, dit en un mot — pour ne pas publier un carrousel en croyant publier une image. */
function decrireType(post: ScheduledPost) {
  const type = (post.metadata?.type || '').toUpperCase()
  const enfants = Array.isArray(post.metadata?.children) ? post.metadata!.children!.length : 0
  if (type === 'CAROUSEL' && enfants >= 2) return { label: `Carrousel · ${enfants} photos`, icone: <Images size={10} /> }
  if (type === 'REELS') return { label: 'Reel', icone: <Film size={10} /> }
  return { label: 'Image', icone: <ImageIcon size={10} /> }
}

export default function ScheduledPostsList() {
  const [posts, setPosts] = useState<ScheduledPost[]>([])
  const [loading, setLoading] = useState(true)
  // Une requete en echec affichait « Aucun post programme » : impossible de
  // distinguer une file vide d'une file inaccessible.
  const [erreur, setErreur] = useState<string | null>(null)
  // null = pas encore su ; false = variables Meta absentes cote Vercel.
  const [configure, setConfigure] = useState<boolean | null>(null)
  const [manque, setManque] = useState<string[]>([])
  const [enCours, setEnCours] = useState<string | null>(null)
  // Resultat du dernier clic, par entree : la raison exacte de Meta, ou le lien.
  const [retours, setRetours] = useState<Record<string, { ok: boolean; texte: string; lien?: string }>>({})

  const fetchPosts = useCallback(async () => {
    setErreur(null)
    try {
      const res = await fetch('/api/instagram/scheduled')
      if (!res.ok) {
        setErreur(
          res.status === 401
            ? 'Session expiree : reconnecte-toi au panneau.'
            : `La file n'a pas pu etre lue (${res.status}).`
        )
        setPosts([])
        return
      }
      const data = await res.json()
      // La route repond { posts: [...] }. Le nom lu ici etait
      // `scheduledPosts`, absent de la reponse : l'objet entier finissait dans
      // l'etat, et `posts.map` levait une erreur des qu'une entree existait.
      setPosts(Array.isArray(data?.posts) ? data.posts : [])
    } catch {
      setErreur('La file est injoignable.')
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/instagram/publish')
      if (!res.ok) return
      const data = await res.json()
      setConfigure(!!data.configured)
      setManque(Array.isArray(data.manque) ? data.manque : [])
    } catch {
      /* le bandeau reste absent : on ne sait pas, on ne dit rien */
    }
  }, [])

  useEffect(() => { fetchPosts(); fetchConfig() }, [fetchPosts, fetchConfig])

  // Publie vraiment sur le compte, via la Graph API. L'ancien bouton
  // « Marquer comme publie » ne changeait que le statut : la file affichait
  // « published » sur des posts qui n'existaient nulle part.
  const handlePublish = async (post: ScheduledPost) => {
    const type = decrireType(post).label
    if (!window.confirm(`Publier maintenant sur le compte Instagram Heldonica ?\n\n${type}\n${(post.caption || '').slice(0, 140)}…`)) return
    setEnCours(post.id)
    setRetours((r) => ({ ...r, [post.id]: { ok: true, texte: 'Envoi a Meta…' } }))
    try {
      const res = await fetch('/api/instagram/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: post.id }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setRetours((r) => ({
          ...r,
          [post.id]: {
            ok: true,
            texte: data.avertissement || 'Publie sur Instagram.',
            lien: data.post?.permalink || undefined,
          },
        }))
      } else {
        setRetours((r) => ({
          ...r,
          [post.id]: { ok: false, texte: [data.error, data.detail].filter(Boolean).join(' — ') || `Echec (${res.status})` },
        }))
      }
    } catch (e) {
      setRetours((r) => ({ ...r, [post.id]: { ok: false, texte: e instanceof Error ? e.message : 'Reseau injoignable' } }))
    } finally {
      setEnCours(null)
      fetchPosts()
    }
  }

  const handleDelete = async (post: ScheduledPost) => {
    if (!window.confirm('Retirer cette entree de la file ? Le brouillon d’article sur le site n’est pas touche.')) return
    const res = await fetch(`/api/instagram/scheduled?id=${post.id}`, { method: 'DELETE' })
    if (res.ok) fetchPosts()
  }

  if (loading) return <div className="text-sm text-stone-400">Chargement...</div>

  const bandeauConfig = configure === false && (
    <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
      <p className="font-semibold">Publier depuis le panneau n&apos;est pas encore possible.</p>
      <p className="mt-1">
        Il manque côté Vercel : <code className="font-mono">{manque.join(', ') || 'INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_BUSINESS_ACCOUNT_ID'}</code>.
        Une fois posées, redéploie : le bouton « Publier » ci-dessous fera le reste.
      </p>
    </div>
  )

  if (erreur) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <h3 className="font-semibold text-sm text-stone-700 mb-2">File Instagram</h3>
        <p className="text-xs text-amber-800">{erreur}</p>
        <button
          onClick={() => { setLoading(true); fetchPosts() }}
          className="mt-3 text-xs underline text-stone-600 hover:text-stone-900"
        >
          Reessayer
        </button>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-5">
        <h3 className="font-semibold text-sm text-stone-700 mb-3">File Instagram</h3>
        {bandeauConfig}
        <p className="text-xs text-stone-400">
          Rien en attente. Un envoi « Brouillon + Ouvrir Instagram » depuis le téléphone, ou la publication d&apos;un article, dépose une entrée ici.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5">
      <h3 className="font-semibold text-sm text-stone-700 mb-3">
        File Instagram ({posts.length})
      </h3>
      {bandeauConfig}
      <div className="space-y-3">
        {posts.map((post) => {
          const type = decrireType(post)
          const retour = retours[post.id]
          const publiable = post.status !== 'published' && configure !== false
          return (
            <div key={post.id} className="p-3 rounded-lg bg-stone-50 border border-stone-100">
              <div className="flex gap-3 items-start">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-200 flex-shrink-0">
                  {post.image_url ? (
                    <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">No img</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-stone-700 line-clamp-2 leading-relaxed">{post.caption?.substring(0, 120) || 'Sans légende'}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-200 text-stone-700">
                      {type.icone}
                      {type.label}
                    </span>
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
                      {post.status === 'draft' ? 'brouillon' : post.status === 'published' ? 'publié' : post.status === 'failed' ? 'échec' : 'programmé'}
                    </span>
                    {post.article_id && (
                      <span className="text-[10px] text-stone-400">Article #{post.article_id}</span>
                    )}
                    {post.status === 'published' && post.permalink && (
                      <a href={post.permalink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] text-eucalyptus underline">
                        <ExternalLink size={10} /> voir sur Instagram
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {post.status === 'failed' && post.error_message && !retour && (
                <p className="mt-2 text-[11px] text-red-700">Dernier échec : {post.error_message}</p>
              )}
              {retour && (
                <p className={`mt-2 text-[11px] ${retour.ok ? 'text-green-700' : 'text-red-700'}`}>
                  {retour.texte}
                  {retour.lien && (
                    <>
                      {' '}
                      <a href={retour.lien} target="_blank" rel="noreferrer" className="underline">voir le post</a>
                    </>
                  )}
                </p>
              )}

              {post.status !== 'published' && (
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => handlePublish(post)}
                    disabled={!publiable || enCours !== null}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                    title={configure === false ? 'Variables Meta manquantes côté Vercel' : 'Publier maintenant sur le compte'}
                  >
                    <Send size={12} />
                    {enCours === post.id ? 'Publication…' : 'Publier sur Instagram'}
                  </button>
                  <button
                    onClick={() => handleDelete(post)}
                    disabled={enCours !== null}
                    className="ml-auto inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-stone-500 hover:text-red-600 hover:bg-stone-100"
                    title="Retirer de la file"
                  >
                    <Trash2 size={12} /> Retirer
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
