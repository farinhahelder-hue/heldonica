import React from 'react';
import type { VideoBlock as VideoBlockType } from '@/types/cms-blocks';

interface Props {
  block: VideoBlockType;
  className?: string;
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  // Match standard youtube.com/watch?v=ID or youtu.be/ID or youtube.com/shorts/ID
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regExp);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export function VideoBlock({ block, className = '' }: Props) {
  const { url, source = 'youtube', aspectRatio = '16:9', caption, autoPlay = false } = block;

  if (!url) {
    return (
      <div className="w-full bg-stone-100 rounded-xl p-8 border border-dashed border-stone-300 text-center text-stone-400 text-sm">
        Vidéo non renseignée
      </div>
    );
  }

  const isShort = aspectRatio === '9:16';
  const containerClasses = isShort 
    ? 'max-w-xs mx-auto aspect-[9/16]' 
    : 'max-w-4xl mx-auto aspect-[16/9]';

  const embedUrl = source === 'youtube' ? getYouTubeEmbedUrl(url) : null;

  return (
    <figure className={`my-8 w-full ${className}`}>
      <div className={`relative overflow-hidden rounded-2xl bg-black shadow-md ${containerClasses}`}>
        {source === 'youtube' && embedUrl ? (
          <iframe
            src={`${embedUrl}${autoPlay ? '?autoplay=1&mute=1' : ''}`}
            title={caption || 'Vidéo Heldonica'}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={url}
            controls
            autoPlay={autoPlay}
            muted={autoPlay}
            playsInline
            className="w-full h-full object-cover"
          />
        )}
      </div>
      {caption && (
        <figcaption className="text-center text-xs md:text-sm text-stone-500 mt-2.5 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
