/**
 * lib/logo-generator.ts
 *
 * Générateur vectoriel SVG autonome de logos, sceaux et insignes pour Heldonica.
 *
 * Esthétique :
 * - Direction artistique "Carnet d'artisan imprimé" & slow travel haut de gamme.
 * - Zéro dépendance externe, rendu vectoriel pur haute résolution (SVG).
 * - Sceaux circulaires, écussons minéraux, roses des vents et monogrammes typographiques.
 */

export type LogoStyle = 'seal_circular' | 'mountain_crest' | 'compass_rose' | 'minimal_monogram';

export interface LogoGeneratorOptions {
  style?: LogoStyle;
  brandName?: string;
  subtitle?: string;
  coordinates?: string;
  year?: string;
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  size?: number;
}

export function generateLogoSvg(opts: LogoGeneratorOptions = {}): string {
  const {
    style = 'seal_circular',
    brandName = 'HELDONICA',
    subtitle = 'SLOW TRAVEL • CARNET DE TERRAIN',
    coordinates = '47.01°N • 8.65°E',
    year = '2026',
    primaryColor = '#241D1A',
    accentColor = '#B8860B',
    backgroundColor = 'transparent',
    size = 300,
  } = opts;

  const bgRect = backgroundColor !== 'transparent'
    ? `<rect width="${size}" height="${size}" fill="${backgroundColor}" />`
    : '';

  switch (style) {
    case 'seal_circular':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="${size}" height="${size}" fill="none">
  ${bgRect}
  <!-- Sceau circulaire double filet -->
  <circle cx="150" cy="150" r="140" stroke="${primaryColor}" stroke-width="2.5" />
  <circle cx="150" cy="150" r="133" stroke="${primaryColor}" stroke-width="1" stroke-dasharray="2 3" />
  <circle cx="150" cy="150" r="95" stroke="${primaryColor}" stroke-width="1.5" />

  <!-- Chemin circulaire pour le texte haut -->
  <defs>
    <path id="circlePathTop" d="M 35, 150 A 115, 115 0 0, 1 265, 150" />
    <path id="circlePathBottom" d="M 265, 150 A 115, 115 0 0, 1 35, 150" />
  </defs>

  <!-- Texte supérieur incurvé -->
  <text fill="${primaryColor}" font-family="serif" font-size="13" font-weight="600" letter-spacing="4">
    <textPath href="#circlePathTop" startOffset="50%" text-anchor="middle">
      ${brandName}
    </textPath>
  </text>

  <!-- Texte inférieur incurvé -->
  <text fill="${accentColor}" font-family="sans-serif" font-size="9" font-weight="600" letter-spacing="2">
    <textPath href="#circlePathBottom" startOffset="50%" text-anchor="middle">
      ${subtitle}
    </textPath>
  </text>

  <!-- Étoiles séparatrices latérales -->
  <circle cx="34" cy="150" r="2.5" fill="${accentColor}" />
  <circle cx="266" cy="150" r="2.5" fill="${accentColor}" />

  <!-- Motif central : Reliefs de crête & Soleil levant -->
  <g transform="translate(150, 150)">
    <!-- Soleil d'or en pointillé -->
    <circle cx="0" cy="-18" r="14" fill="${accentColor}" opacity="0.85" />
    <!-- Crête minérale stylisée -->
    <polygon points="-45,30 -15,-5 5,12 28,-14 55,30" fill="${primaryColor}" />
    <polygon points="-28,30 -5,8 14,22 35,0 48,30" fill="${primaryColor}" opacity="0.65" />
    <!-- Filet d'eau / rivière douce -->
    <path d="M -30,36 Q 0,42 30,36" stroke="${accentColor}" stroke-width="1.5" fill="none" />
    <!-- Millésime central -->
    <text x="0" y="-36" fill="${primaryColor}" font-family="monospace" font-size="9" text-anchor="middle" letter-spacing="2">
      ${year}
    </text>
  </g>
</svg>`;

    case 'mountain_crest':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="${size}" height="${size}" fill="none">
  ${bgRect}
  <!-- Écusson héraldique sobre -->
  <path d="M 60,40 L 240,40 L 240,170 C 240,230 150,275 150,275 C 150,275 60,230 60,170 Z" stroke="${primaryColor}" stroke-width="2.5" />
  <path d="M 68,48 L 232,48 L 232,168 C 232,222 150,264 150,264 C 150,264 68,222 68,168 Z" stroke="${primaryColor}" stroke-width="1" stroke-dasharray="3 3" />

  <!-- Crête de montagne épurée -->
  <g transform="translate(150, 140)">
    <polygon points="-65,45 -20,-25 10,5 35,-15 65,45" fill="${primaryColor}" />
    <!-- Ombre de versant -->
    <polygon points="-20,-25 10,5 0,45 -20,45" fill="${accentColor}" opacity="0.7" />
    <polygon points="35,-15 50,15 40,45 25,45" fill="${accentColor}" opacity="0.7" />
    <!-- Soleil au zénith -->
    <circle cx="0" cy="-40" r="10" stroke="${accentColor}" stroke-width="2" fill="none" />
  </g>

  <!-- Titre et sous-titre -->
  <text x="150" y="215" fill="${primaryColor}" font-family="serif" font-size="16" font-weight="700" text-anchor="middle" letter-spacing="3">
    ${brandName}
  </text>
  <text x="150" y="235" fill="${accentColor}" font-family="sans-serif" font-size="8" font-weight="600" text-anchor="middle" letter-spacing="2">
    ${coordinates}
  </text>
</svg>`;

    case 'compass_rose':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="${size}" height="${size}" fill="none">
  ${bgRect}
  <!-- Anneau gradué extérieur -->
  <circle cx="150" cy="150" r="130" stroke="${primaryColor}" stroke-width="2" />
  <circle cx="150" cy="150" r="124" stroke="${primaryColor}" stroke-width="1" stroke-dasharray="2 4" />

  <!-- Points cardinaux -->
  <text x="150" y="38" fill="${primaryColor}" font-family="serif" font-size="14" font-weight="bold" text-anchor="middle">N</text>
  <text x="268" y="155" fill="${primaryColor}" font-family="serif" font-size="14" font-weight="bold" text-anchor="middle">E</text>
  <text x="150" y="272" fill="${primaryColor}" font-family="serif" font-size="14" font-weight="bold" text-anchor="middle">S</text>
  <text x="32" y="155" fill="${primaryColor}" font-family="serif" font-size="14" font-weight="bold" text-anchor="middle">O</text>

  <!-- Aiguilles de la Rose des Vents -->
  <g transform="translate(150, 150)">
    <!-- Pointe Nord (Sombre) -->
    <polygon points="0,0 -8,-15 0,-85" fill="${primaryColor}" />
    <polygon points="0,0 8,-15 0,-85" fill="${accentColor}" />
    <!-- Pointe Sud -->
    <polygon points="0,0 -8,15 0,85" fill="${accentColor}" />
    <polygon points="0,0 8,15 0,85" fill="${primaryColor}" />
    <!-- Pointe Est -->
    <polygon points="0,0 15,-8 85,0" fill="${primaryColor}" />
    <polygon points="0,0 15,8 85,0" fill="${accentColor}" />
    <!-- Pointe Ouest -->
    <polygon points="0,0 -15,-8 -85,0" fill="${accentColor}" />
    <polygon points="0,0 -15,8 -85,0" fill="${primaryColor}" />

    <!-- Disque central gravé -->
    <circle cx="0" cy="0" r="16" fill="${backgroundColor !== 'transparent' ? backgroundColor : '#FAF7F2'}" stroke="${primaryColor}" stroke-width="2" />
    <text x="0" y="4" fill="${primaryColor}" font-family="serif" font-size="11" font-weight="bold" text-anchor="middle">
      ${brandName.charAt(0)}
    </text>
  </g>

  <!-- Nom de marque et coordonnées sous la rose -->
  <text x="150" y="212" fill="${primaryColor}" font-family="serif" font-size="12" font-weight="600" text-anchor="middle" letter-spacing="3">
    ${brandName}
  </text>
  <text x="150" y="228" fill="${accentColor}" font-family="monospace" font-size="8" text-anchor="middle" letter-spacing="1.5">
    ${coordinates}
  </text>
</svg>`;

    case 'minimal_monogram':
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="${size}" height="${size}" fill="none">
  ${bgRect}
  <!-- Filets d'imprimeur supérieur et inférieur -->
  <line x1="50" y1="65" x2="250" y2="65" stroke="${primaryColor}" stroke-width="1.5" />
  <line x1="80" y1="71" x2="220" y2="71" stroke="${accentColor}" stroke-width="0.8" />

  <!-- Monogramme central typographique -->
  <g transform="translate(150, 140)">
    <text x="0" y="25" fill="${primaryColor}" font-family="serif" font-size="76" font-weight="300" text-anchor="middle" letter-spacing="6">
      ${brandName.charAt(0)}
    </text>
    <!-- Point d'accent d'or -->
    <circle cx="32" cy="18" r="4" fill="${accentColor}" />
  </g>

  <!-- Nom de marque en lettres capitales espacées -->
  <text x="150" y="195" fill="${primaryColor}" font-family="serif" font-size="18" font-weight="600" text-anchor="middle" letter-spacing="6">
    ${brandName}
  </text>

  <!-- Mention artisanale et millésime -->
  <text x="150" y="215" fill="${accentColor}" font-family="sans-serif" font-size="9" font-weight="500" text-anchor="middle" letter-spacing="3">
    ${subtitle}
  </text>

  <!-- Filet bas -->
  <line x1="80" y1="230" x2="220" y2="230" stroke="${accentColor}" stroke-width="0.8" />
  <line x1="50" y1="236" x2="250" y2="236" stroke="${primaryColor}" stroke-width="1.5" />
</svg>`;
  }
}

export function generateLogoDataUri(opts: LogoGeneratorOptions = {}): string {
  const svg = generateLogoSvg(opts);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
