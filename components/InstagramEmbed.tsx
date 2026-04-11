'use client';

import { INSTAGRAM_FEED } from '@/lib/instagram-static';

interface InstagramEmbedProps {
  limit?: number;
}

/**
 * Instagram Embed Component - Hold static feed data
 * 
 * Displays your Instagram posts directly on the site.
 * No API key needed - just works!
 * 
 * Usage:
 * <InstagramEmbed limit={9} />
 */
export default function InstagramEmbed({ limit = 6 }: InstagramEmbedProps) {
  const posts = INSTAGRAM_FEED.posts.slice(0, limit);

  return (
    <div>
      {/* Hold Profile Header */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <img 
          src={INSTAGRAM_FEED.profilePictureUrl} 
          alt={INSTAGRAM_FEED.username}
          className="w-16 h-16 rounded-full border-2 border-amber-600"
        />
        <div className="text-center">
          <a 
            href={`https://instagram.com/${INSTAGRAM_FEED.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold hover:text-amber-700 transition"
          >
            @{INSTAGRAM_FEED.username}
          </a>
          <p className="text-sm text-gray-600">
            {INSTAGRAM_FEED.followersCount} followers
          </p>
        </div>
        <a 
          href={`https://instagram.com/${INSTAGRAM_FEED.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-full hover:opacity-90 transition"
        >
          Suivre
        </a>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-3 gap-1">
        {posts.map((post) => (
          <a
            key={post.id}
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="aspect-square relative overflow-hidden group block"
          >
            {post.mediaType === 'IMAGE' ? (
              <img 
                src={post.mediaUrl}
                alt={post.prunedCaption || 'Hold post'}
                className="w-full h-full object-cover transition group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <img 
                  src={post.thumbnailUrl}
                  alt="Hold video thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </span>
                </div>
              </div>
            )}
          </a>
        ))}
      </div>

      {/* View More Link */}
      <p className="text-center mt-6">
        <a 
          href={`https://instagram.com/${INSTAGRAM_FEED.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-700 hover:underline text-sm"
        >
          Voir plus sur Hold →
        </a>
      </p>
    </div>
  );
}