import { ImageResponse } from 'next/og'
import { getPostBySlug } from '@/lib/blog-supabase'

export const runtime = 'edge'
export const alt = 'Heldonica — Slow Travel en couple'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getPostBySlug(params.slug)

  const title = post?.title ?? 'Heldonica — Slow Travel & Carnets de voyage'
  const destination = post?.destination ?? ''
  const category = post?.category ?? 'Carnet de voyage'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          fontFamily: 'serif',
          position: 'relative',
          overflow: 'hidden',
          background: '#1C2B2B', // Eucalyptus Green foncé
        }}
      >
        {/* Image de fond si cover_image disponible */}
        {post?.cover_image && (
          <img
            src={post.cover_image}
            alt="Cover Image"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.35,
            }}
          />
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, rgba(28,43,43,0.97) 0%, rgba(28,43,43,0.5) 60%, transparent 100%)',
          }}
        />

        {/* Contenu */}
        <div
          style={{
            position: 'relative',
            padding: '56px 64px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Badge catégorie + destination */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span
              style={{
                background: '#5C8A7A', // Transformative Teal
                color: '#F5F0E8',
                fontSize: '18px',
                fontFamily: 'sans-serif',
                padding: '6px 18px',
                borderRadius: '999px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {category}
            </span>
            {destination && (
              <span
                style={{
                  color: '#A8C5B8',
                  fontSize: '18px',
                  fontFamily: 'sans-serif',
                }}
              >
                📍 {destination}
              </span>
            )}
          </div>

          {/* Titre */}
          <div
            style={{
              fontSize: title.length > 60 ? '42px' : '52px',
              fontWeight: 700,
              color: '#F5F0E8', // Cloud Dancer
              lineHeight: 1.2,
              maxWidth: '900px',
            }}
          >
            {title}
          </div>

          {/* Signature Heldonica */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '8px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '2px',
                background: '#8B4513', // Warm Mahogany
              }}
            />
            <span
              style={{
                color: '#A8C5B8',
                fontSize: '18px',
                fontFamily: 'sans-serif',
                letterSpacing: '0.1em',
              }}
            >
              heldonica.fr
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
