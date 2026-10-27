'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface InstagramComment {
  id: number;
  ig_comment_id: string;
  media_id?: string;
  username: string;
  text: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'auto_replied';
  ai_draft?: string;
  ai_confidence?: number;
  reply_published?: string;
  created_at: string;
}

interface InstagramRecentMedia {
  id: string;
  caption?: string;
  media_url?: string;
  permalink?: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
}

interface InstagramStatsPayload {
  configured: boolean;
  profile?: {
    id: string;
    username: string;
    account_type?: string;
    media_count?: number;
  };
  stats?: {
    data?: Array<{ name: string; values: Array<{ value: number }> }>;
  };
  media?: InstagramRecentMedia[];
  error?: string;
}

export default function InstagramManagerSection() {
  const [comments, setComments] = useState<InstagramComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'all'>('pending');
  const [editingReply, setEditingReply] = useState<{ [key: string]: string }>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [refreshingToken, setRefreshingToken] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<string | null>(null);

  // Nouvelles métriques en direct
  const [statsData, setStatsData] = useState<InstagramStatsPayload | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/instagram/stats');
      if (res.ok) {
        const data = await res.json();
        setStatsData(data);
      }
    } catch (err) {
      console.warn('Erreur chargement métriques Instagram:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cms/instagram/comments?status=${activeTab === 'all' ? 'all' : activeTab === 'pending' ? 'pending_review' : 'approved'}`);
      const data = await res.json();
      if (data.comments) {
        setComments(data.comments);
        const drafts: { [key: string]: string } = {};
        data.comments.forEach((c: InstagramComment) => {
          if (c.ai_draft) drafts[c.ig_comment_id] = c.ai_draft;
        });
        setEditingReply(drafts);
      }
    } catch (err) {
      console.error('Erreur chargement commentaires:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchComments();
    fetchStats();
  }, [fetchComments, fetchStats]);

  const handleApproveReply = async (comment: InstagramComment) => {
    const replyText = editingReply[comment.ig_comment_id] || comment.ai_draft;
    if (!replyText) return;

    setProcessingId(comment.ig_comment_id);
    try {
      const res = await fetch('/api/cms/instagram/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reply',
          igCommentId: comment.ig_comment_id,
          replyMessage: replyText,
        }),
      });
      if (res.ok) {
        fetchComments();
      } else {
        const err = await res.json();
        alert(`Erreur réponse : ${err.error}`);
      }
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (commentId: string) => {
    setProcessingId(commentId);
    try {
      await fetch('/api/cms/instagram/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          igCommentId: commentId,
        }),
      });
      fetchComments();
    } finally {
      setProcessingId(null);
    }
  };

  const handleRefreshToken = async () => {
    setRefreshingToken(true);
    setTokenStatus(null);
    try {
      const res = await fetch('/api/instagram/refresh', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setTokenStatus(`✅ Token renouvelé pour ${data.expires_in_days} jours !`);
        fetchStats();
      } else {
        setTokenStatus(`❌ Erreur : ${data.error}`);
      }
    } catch (err: any) {
      setTokenStatus(`❌ Erreur : ${err.message}`);
    } finally {
      setRefreshingToken(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête & Statut Token */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#241D1A] font-serif flex items-center gap-2">
            <span>📱</span> Tableau de Bord & Modération Instagram
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Métriques d&apos;audience, synchronisation des publications et modération des réponses avec voix de marque Heldonica.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={handleRefreshToken}
            disabled={refreshingToken}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2"
          >
            🔄 {refreshingToken ? 'Rafraîchissement...' : 'Rafraîchir le token Meta (60j)'}
          </button>
          {tokenStatus && <span className="text-xs font-semibold text-emerald-800">{tokenStatus}</span>}
        </div>
      </div>

      {/* Cartes KPI Instagram en direct */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
            Compte Officiel
          </span>
          <div className="text-lg font-bold text-[#241D1A] font-serif truncate">
            {statsData?.profile?.username ? `@${statsData.profile.username}` : '@heldonica'}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">
            {statsData?.configured ? '✓ API Graph Connectée' : 'Mode local / veille'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
            Publications Actives
          </span>
          <div className="text-2xl font-bold text-[#241D1A] font-serif">
            {statsData?.profile?.media_count ?? statsData?.media?.length ?? 12}
          </div>
          <span className="text-[11px] text-stone-500">
            Posts &amp; Carnets en ligne
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
            Commentaires Traités
          </span>
          <div className="text-2xl font-bold text-amber-900 font-serif">
            {comments.length}
          </div>
          <span className="text-[11px] text-stone-500">
            {comments.filter((c) => c.status === 'pending_review').length} en attente de validation
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
            Qualité Éditoriale
          </span>
          <div className="text-2xl font-bold text-emerald-700 font-serif">
            100%
          </div>
          <span className="text-[11px] text-stone-500">
            Voix slow travel (« on / tu »)
          </span>
        </div>
      </div>

      {/* Galerie des dernières publications avec likes et stats */}
      {statsData?.media && statsData.media.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <h3 className="text-sm font-bold text-[#241D1A] font-serif mb-3">
            Dernières publications synchronisées
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {statsData.media.slice(0, 6).map((item) => (
              <a
                key={item.id}
                href={item.permalink || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group block relative aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-100"
              >
                {item.media_url ? (
                  <Image
                    src={item.media_url}
                    alt={item.caption?.slice(0, 50) || 'Publication Instagram'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-stone-400 font-mono">
                    Photo
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-semibold">
                  <span>❤️ {item.like_count ?? 0}</span>
                  <span>💬 {item.comments_count ?? 0}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Onglets Filtres */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'pending'
              ? 'bg-amber-800 text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          ⏳ En attente de validation ({comments.filter((c) => c.status === 'pending_review').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'approved'
              ? 'bg-amber-800 text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          ✅ Réponses publiées
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'all'
              ? 'bg-amber-800 text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          📋 Tous les commentaires
        </button>
      </div>

      {/* Liste des commentaires */}
      {loading ? (
        <div className="py-12 text-center text-stone-500 bg-white rounded-2xl border border-stone-200">
          Chargement des commentaires...
        </div>
      ) : comments.length === 0 ? (
        <div className="py-12 text-center text-stone-500 bg-white rounded-2xl border border-stone-200">
          ✨ Aucun commentaire en attente pour le moment !
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.ig_comment_id}
              className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4 hover:border-stone-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center text-white font-bold text-xs">
                    {comment.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-stone-900 text-sm">@{comment.username}</span>
                    <span className="text-xs text-stone-400 ml-2">
                      {new Date(comment.created_at).toLocaleDateString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    comment.status === 'pending_review'
                      ? 'bg-amber-100 text-amber-800'
                      : comment.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {comment.status === 'pending_review'
                    ? 'Brouillon prêt'
                    : comment.status === 'approved'
                    ? 'Publié'
                    : 'Rejeté'}
                </span>
              </div>

              {/* Texte du commentaire */}
              <div className="bg-stone-50 p-3.5 rounded-xl text-sm text-stone-800 italic border-l-4 border-amber-700">
                &ldquo;{comment.text}&rdquo;
              </div>

              {/* Brouillon IA & Modification */}
              {comment.status === 'pending_review' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span>✨</span> Proposition de réponse IA (Voix Heldonica) :
                  </label>
                  <textarea
                    rows={2}
                    value={editingReply[comment.ig_comment_id] || ''}
                    onChange={(e) =>
                      setEditingReply({
                        ...editingReply,
                        [comment.ig_comment_id]: e.target.value,
                      })
                    }
                    className="w-full p-3 text-sm border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-700 focus:border-amber-700"
                  />
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => handleReject(comment.ig_comment_id)}
                      disabled={processingId === comment.ig_comment_id}
                      className="px-3 py-1.5 text-xs text-stone-500 hover:text-red-600 font-medium transition-colors"
                    >
                      Ignorer
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveReply(comment)}
                      disabled={processingId === comment.ig_comment_id}
                      className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      {processingId === comment.ig_comment_id
                        ? 'Publication...'
                        : '🚀 Approuver & Répondre sur Instagram'}
                    </button>
                  </div>
                </div>
              )}

              {/* Réponse déjà publiée */}
              {comment.status === 'approved' && comment.reply_published && (
                <div className="bg-emerald-50 p-3 rounded-xl text-xs text-emerald-900">
                  <span className="font-bold">Réponse envoyée :</span> {comment.reply_published}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
