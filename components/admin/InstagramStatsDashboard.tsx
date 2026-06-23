'use client';

import { useState, useEffect } from 'react';

interface InstagramMedia {
  id: string;
  media_type: string;
  media_url: string;
  permalink: string;
  caption: string;
  like_count: number;
  comments_count: number;
  timestamp: string;
}

export default function InstagramStatsDashboard() {
  const [media, setMedia] = useState<InstagramMedia[]>([]);
  const [profile, setProfile] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/instagram/stats')
      .then(r => r.json())
      .then(d => {
        if (d.configured === false) {
          setError('Instagram non configuré');
        } else {
          setMedia(d.media || []);
          setProfile(d.profile || null);
        }
      })
      .catch(() => setError('Erreur de connexion'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="bg-white rounded-xl border border-gray-100 p-5"><p className="text-sm text-gray-400">Chargement...</p></div>;
  if (error) return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-sm text-gray-500">{error}</p>
      <p className="text-xs text-gray-400 mt-2">Définissez INSTAGRAM_ACCESS_TOKEN et INSTAGRAM_BUSINESS_ACCOUNT_ID dans les variables d’environnement.</p>
    </div>
  );

  const totalLikes = media.reduce((sum, p) => sum + (p.like_count || 0), 0);
  const totalComments = media.reduce((sum, p) => sum + (p.comments_count || 0), 0);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-sm text-gray-700 mb-3">Statistiques</h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="text-xl font-bold text-[#2D8B7A]">{(profile?.media_count as number) || media.length}</div>
            <div className="text-[10px] text-gray-400">Posts</div>
          </div>
          <div>
            <div className="text-xl font-bold text-[#C4714A]">{totalLikes}</div>
            <div className="text-[10px] text-gray-400">Likes (9 derniers)</div>
          </div>
          <div>
            <div className="text-xl font-bold text-yellow-600">{totalComments}</div>
            <div className="text-[10px] text-gray-400">Comments (9 derniers)</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-sm text-gray-700 mb-3">Derniers posts</h3>
        {media.length === 0 ? (
          <p className="text-xs text-gray-400">Aucun post trouvé</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {media.map((post) => (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative group"
              >
                {post.media_type === 'VIDEO' ? (
                  <video src={post.media_url} className="w-full h-full object-cover" />
                ) : (
                  <img src={post.media_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                  <div className="flex items-center gap-2 text-[10px] text-white">
                    <span>♥ {post.like_count || 0}</span>
                    <span>💬 {post.comments_count || 0}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
