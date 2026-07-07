import { NextRequest } from 'next/server'
import { ImageResponse } from 'next/og'

const COLORS = {
  eucalyptus: '#006D77',
  teal: '#4ECDC4',
  mahogany: '#6B2D1F',
  amber: '#D4A574',
  cream: '#F8F6F2',
  dark: '#1C1917',
}

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const title = searchParams.get('title') || 'Carnets de Route'
  const description = searchParams.get('description') || 'Pépites dénichées, slow travel vécu'
  const type = searchParams.get('type') || 'article'

  const width = 1200
  const height = 630

  let gradientStart = COLORS.eucalyptus
  let gradientEnd = COLORS.teal

  if (type === 'destination') {
    gradientStart = COLORS.mahogany
    gradientEnd = '#8B4513'
  } else if (type === 'blog') {
    gradientStart = '#2D3748'
    gradientEnd = COLORS.eucalyptus
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px',
              fontWeight: 'bold',
              marginRight: '16px',
            }}
          >
            H
          </div>
          <span
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            Heldonica
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: '100px',
              padding: '8px 20px',
              width: 'fit-content',
              marginBottom: '24px',
            }}
          >
            <span
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
              }}
            >
              {type === 'article' ? 'Article' : type === 'destination' ? 'Destination' : 'Blog'}
            </span>
          </div>

          <h1
            style={{
              fontSize: title.length > 60 ? '42px' : '56px',
              fontWeight: '700',
              color: 'white',
              lineHeight: 1.1,
              margin: 0,
              marginBottom: '24px',
              maxWidth: '900px',
            }}
          >
            {title}
          </h1>

          <p
            style={{
              fontSize: '22px',
              color: 'rgba(255,255,255,0.85)',
              lineHeight: 1.4,
              margin: 0,
              maxWidth: '800px',
            }}
          >
            {description}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255,255,255,0.2)',
            paddingTop: '24px',
          }}
        >
          <span
            style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            heldonica.fr
          </span>
          <span
            style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            Slow travel vecu - Pepites denichees
          </span>
        </div>
      </div>
    ),
    {
      width,
      height,
    }
  )
}
