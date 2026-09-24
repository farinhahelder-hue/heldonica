'use client';
import { useState, useEffect, useCallback } from 'react';

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

export default function InstagramManagerSection() {
  const [comments, setComments] = useState<InstagramComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'all'>('pending');
  const [editingReply, setEditingReply] = useState<{ [key: string]: string }>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [refreshingToken, setRefreshingToken] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cms/instagram/comments?status=${activeTab === 'all' ? 'all' : activeTab === 'pending' ? 'pending_review' : 'approved'}`);
      const data = await res.json();
      if (data.comments) {
        setComments(data.comments);
        // Initialiser les brouillons éditables
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
  }, [fetchComments]);

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
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>📱</span> Modération & Réponses Instagram Auto-Assistées
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gère et réponds aux commentaires de tes publications avec des brouillons générés dans le respect de la voix Heldonica (100% "on/tu", 0 hallucination).
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={handleRefreshToken}
            disabled={refreshingToken}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            🔄 {refreshingToken ? 'Rafraîchissement...' : 'Rafraîchir le token Meta (60j)'}
          </button>
          {tokenStatus && <span className="text-xs font-semibold">{tokenStatus}</span>}
        </div>
      </div>

      {/* Onglets Filtres */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === 'pending'
              ? 'bg-emerald-800 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          ⏳ En attente de validation ({comments.filter(c => c.status === 'pending_review').length})
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === 'approved'
              ? 'bg-emerald-800 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          ✅ Réponses publiées
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === 'all'
              ? 'bg-emerald-800 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          📋 Tous les commentaires
        </button>
      </div>

      {/* Liste des commentaires */}
      {loading ? (
        <div className="py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
          Chargement des commentaires...
        </div>
      ) : comments.length === 0 ? (
        <div className="py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
          ✨ Aucun commentaire en attente pour le moment !
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.ig_comment_id}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                    {comment.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 text-sm">@{comment.username}</span>
                    <span className="text-xs text-gray-400 ml-2">
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
                      : 'bg-gray-100 text-gray-600'
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
              <div className="bg-gray-50 p-3.5 rounded-lg text-sm text-gray-800 italic border-l-4 border-emerald-700">
                "{comment.text}"
              </div>

              {/* Brouillon IA & Modification */}
              {comment.status === 'pending_review' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
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
                    className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700"
                  />
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleReject(comment.ig_comment_id)}
                      disabled={processingId === comment.ig_comment_id}
                      className="px-3 py-1.5 text-xs text-gray-500 hover:text-red-600 font-medium transition-colors"
                    >
                      Ignorer
                    </button>
                    <button
                      onClick={() => handleApproveReply(comment)}
                      disabled={processingId === comment.ig_comment_id}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
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
                <div className="bg-emerald-50 p-3 rounded-lg text-xs text-emerald-900">
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
