'use client';

type Props = {
  siteName: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  fontHeading: string;
  fontBody: string;
  logoUrl: string;
  ctaLabel: string;
  footerText: string;
  copyright: string;
};

export default function LivePreview({
  siteName,
  tagline,
  primaryColor,
  secondaryColor,
  fontHeading,
  fontBody,
  logoUrl,
  ctaLabel,
  footerText,
  copyright,
}: Props) {
  const headingFont = fontHeading || 'Playfair Display';
  const bodyFont = fontBody || 'DM Sans';

  const previewStyle = {
    header: {
      background: '#fff',
      borderBottom: `1px solid #e5e0db`,
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    } as React.CSSProperties,
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    } as React.CSSProperties,
    siteNameStyle: {
      fontFamily: `"${headingFont}", serif`,
      fontSize: '18px',
      fontWeight: 700,
      color: primaryColor,
    } as React.CSSProperties,
    cta: {
      background: primaryColor,
      color: '#fff',
      border: 'none',
      borderRadius: '999px',
      padding: '8px 18px',
      fontSize: '13px',
      fontWeight: 600,
      fontFamily: `"${bodyFont}", sans-serif`,
    } as React.CSSProperties,
    hero: {
      background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}20)`,
      padding: '48px 24px',
      textAlign: 'center',
    } as React.CSSProperties,
    heroTitle: {
      fontFamily: `"${headingFont}", serif`,
      fontSize: '28px',
      fontWeight: 700,
      color: '#1A1A1A',
      marginBottom: '8px',
    } as React.CSSProperties,
    heroText: {
      fontFamily: `"${bodyFont}", sans-serif`,
      fontSize: '14px',
      color: '#666',
      maxWidth: 400,
      margin: '0 auto',
    } as React.CSSProperties,
    footer: {
      background: '#1A1A1A',
      color: '#ccc',
      padding: '32px 24px',
      textAlign: 'center',
    } as React.CSSProperties,
    footerTextStyle: {
      fontFamily: `"${bodyFont}", sans-serif`,
      fontSize: '13px',
      color: '#999',
    } as React.CSSProperties,
    badge: {
      display: 'inline-block',
      background: secondaryColor,
      color: '#fff',
      borderRadius: '4px',
      padding: '2px 8px',
      fontSize: '10px',
      fontWeight: 600,
      marginBottom: '12px',
      textTransform: 'uppercase',
      letterSpacing: '1px',
    } as React.CSSProperties,
    navItem: {
      fontFamily: `"${bodyFont}", sans-serif`,
      fontSize: '13px',
      color: '#666',
      cursor: 'default',
    } as React.CSSProperties,
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
      {/* Preview header bar */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <span className="text-xs text-gray-400 font-mono ml-2">aperçu.heldonica.fr</span>
      </div>

      {/* Preview content (scaled) */}
      <div className="scale-[0.6] origin-top-left" style={{ width: `${100 / 0.6}%` }}>
        {/* Header */}
        <div style={previewStyle.header}>
          <div style={previewStyle.logo}>
            {logoUrl ? (
              <img src={logoUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: primaryColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 700,
                }}
              >
                {siteName?.charAt(0) || 'H'}
              </div>
            )}
            <span style={previewStyle.siteNameStyle}>{siteName || 'Heldonica'}</span>
          </div>
          <div className="flex items-center gap-4">
            <span style={previewStyle.navItem}>Accueil</span>
            <span style={previewStyle.navItem}>Destinations</span>
            <span style={previewStyle.navItem}>Blog</span>
            <button style={previewStyle.cta}>{ctaLabel || 'Planifier mon voyage'}</button>
          </div>
        </div>

        {/* Hero */}
        <div style={previewStyle.hero}>
          <div style={previewStyle.badge}>Template {fontHeading}</div>
          <h1 style={previewStyle.heroTitle}>
            {tagline || 'Vivre, découvrir, partager.'}
          </h1>
          <p style={previewStyle.heroText}>
            Un blog slow travel avec le style "{headingFont}" et les couleurs qui reflètent votre identité.
          </p>
        </div>

        {/* Mini cards */}
        <div className="p-6 grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg border border-gray-100 p-4">
              <div
                className="h-3 w-16 rounded mb-3"
                style={{ background: primaryColor + '30' }}
              />
              <div className="h-2 w-full bg-gray-100 rounded mb-2" />
              <div className="h-2 w-3/4 bg-gray-100 rounded" />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={previewStyle.footer}>
          <div
            style={{
              fontFamily: `"${headingFont}", serif`,
              fontSize: '18px',
              fontWeight: 700,
              color: '#fff',
              marginBottom: '8px',
            }}
          >
            {siteName || 'Heldonica'}
          </div>
          <p style={previewStyle.footerTextStyle}>
            {footerText || copyright || `© ${new Date().getFullYear()} Heldonica`}
          </p>
        </div>
      </div>
    </div>
  );
}
