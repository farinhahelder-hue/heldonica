/**
 * Correspondance emoji → icône, pour les zones CMS qui portaient un emoji.
 *
 * Les zones `*_emoji` / `*_icon` / `*_badge` de `cms_editable_zones` stockaient
 * un emoji en guise d'icône (🌿, ✨, 🏔️…). Comme `EditableZone` affiche la
 * valeur de la base telle quelle, l'emoji gagnait toujours sur le fallback JSX :
 * corriger le composant ne changeait rien à l'écran. La seule voie était de
 * nettoyer la base par migration versionnée — ce qui est fait — puis de
 * traduire ce qui reste.
 *
 * Ce module sert à deux choses :
 *   1. `resolveIconName` : la migration a écrit des noms d'icônes lucide
 *      (« Leaf », « Sparkles ») ; on les reconnaît directement.
 *   2. `emojiToIconName` : filet de sécurité pour une valeur non migrée (zone
 *      créée après coup, variante ciblée, saisie manuelle dans le CMS). On
 *      préfère afficher une icône neutre plutôt que l'emoji — le but étant
 *      qu'aucun emoji ne soit plus visible.
 *
 * `stripEmoji` nettoie les emojis restés *dans une phrase* (« 💡 Notre conseil : »,
 * « Les 10 pépites 👇 ») sans toucher au texte.
 */

/** Icône neutre quand la valeur ne dit rien d'exploitable. */
export const FALLBACK_ICON = 'Leaf'

/**
 * Les emojis effectivement présents en base au 2026-10-21, plus quelques
 * variantes proches que le CMS pourrait recevoir. Chaque entrée pointe vers un
 * nom exporté par `lucide-react` (vérifié contre la version installée).
 */
const EMOJI_TO_ICON: Record<string, string> = {
  // Nature, paysage
  '🌿': 'Leaf',
  '🍃': 'Leaf',
  '🌱': 'Sprout',
  '🌳': 'TreeDeciduous',
  '🌲': 'TreePine',
  '🌴': 'TreePalm',

  // Saisons (cms_seasons) et sous-destinations (cms_sub_destinations) : ces
  // deux tables portent leur propre colonne `emoji`, hors cms_editable_zones.
  '❄️': 'Snowflake',
  '🍂': 'TreeDeciduous',
  '🍁': 'TreeDeciduous',
  '🏖️': 'Umbrella',
  '🌧️': 'CloudRain',
  '🌷': 'Flower',
  '🌸': 'Flower2',
  '🌺': 'Flower2',
  '🏝️': 'TreePalm',
  '🏔️': 'MountainSnow',
  '🏔': 'MountainSnow',
  '⛰️': 'Mountain',
  '🌊': 'Waves',
  '💧': 'Droplet',
  '🕳️': 'CircleDot',
  '☀️': 'Sun',
  '🌅': 'Sunrise',
  '🌍': 'Globe',
  '🌐': 'Globe',
  '🪵': 'Logs',
  '🧱': 'Blocks',
  '♻️': 'Recycle',

  // Patrimoine, bâti
  '🏛️': 'Landmark',
  '🏛': 'Landmark',
  '🏰': 'Castle',
  '🏘️': 'Building2',
  '🏚️': 'Home',
  '🏡': 'House',
  '⛪': 'Church',
  '🚪': 'DoorOpen',
  '🎨': 'Palette',
  '🎭': 'Drama',
  '🖼️': 'Image',

  // Gastronomie
  '🍷': 'Wine',
  '🍇': 'Grape',
  '🍸': 'Martini',
  '🥂': 'Martini',
  '☕': 'Coffee',
  '🥧': 'CakeSlice',
  '🍲': 'Soup',
  '🥗': 'Salad',
  '🐟': 'Fish',
  '🍞': 'Croissant',

  // Déplacement
  '🚗': 'Car',
  '🚌': 'Bus',
  '🚆': 'Train',
  '🚲': 'Bike',
  '⛵': 'Sailboat',
  '📍': 'MapPin',
  '🗺️': 'Map',
  '🗺': 'Map',
  '🧭': 'Compass',
  '🏕️': 'Tent',

  // Personnes, séjour
  '💑': 'HeartHandshake',
  '👨\u200d👩\u200d👧': 'Users',
  '👨👩👧': 'Users',
  '🛁': 'Bath',
  '🏊': 'Waves',
  '🧘': 'PersonStanding',
  '🚶': 'Footprints',
  '🐢': 'Snail',
  '⏰': 'AlarmClock',
  '📖': 'BookOpen',
  '💬': 'MessageCircle',
  '🎯': 'Target',
  '💍': 'Gem',
  '💎': 'Gem',
  '🕯️': 'Flame',
  '💝': 'Heart',
  '💛': 'Coins',
  '💚': 'Banknote',
  '💙': 'Euro',
  '🇷🇴': 'Flag',
  '🇨🇴': 'Flag',
  '🇪🇺': 'Flag',
  '✨': 'Sparkles',
  '⭐': 'Star',
  '✦': 'Sparkle',
}

/** Vrai si la chaîne ne contient rien d'autre qu'un emoji (et ses sélecteurs). */
export function isEmojiOnly(value: string): boolean {
  return /^[\p{Extended_Pictographic}\uFE0F\u200D\s]+$/u.test(value) && /\p{Extended_Pictographic}/u.test(value)
}

/**
 * Traduit une valeur de zone en nom d'icône lucide, ou `null` si rien
 * d'exploitable. Un nom lucide déjà écrit (« Leaf ») est renvoyé tel quel :
 * c'est le format que la migration a semé.
 */
export function resolveIconName(value: string | undefined | null): string | null {
  const raw = (value ?? '').trim()
  if (!raw) return null
  if (EMOJI_TO_ICON[raw]) return EMOJI_TO_ICON[raw]
  // Nom lucide écrit à la main dans le CMS (ex. « Waves »). On n'accepte que
  // des identifiants : un mot de phrase ne doit pas devenir une icône.
  if (/^[A-Z][A-Za-z0-9]{1,30}$/.test(raw)) return raw
  return null
}

/**
 * Retire les emojis d'une phrase et recolle les espaces doubles. Utilisé par la
 * migration pour les zones de texte (« 💡 Notre conseil : … » → « Notre conseil : … »)
 * et par les composants en filet de sécurité.
 */
export function stripEmoji(value: string): string {
  return value
    .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/^[ \t]+/, '')
    .replace(/[ \t]+$/g, '')
    .replace(/\s+([.,;:!?])/g, '$1')
}
