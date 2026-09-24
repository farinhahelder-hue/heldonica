export const STYLE_LABELS: Record<string, string> = {
  'slow-culture': 'Culture',
  'slow-nature': 'Nature',
  'nature': 'Nature',
  'culture': 'Culture',
  'city': 'Ville',
  'food': 'Food',
}

export const STYLE_EMOJIS: Record<string, string> = {
  'slow-culture': '🏛️',
  'slow-nature': '🌿',
  'nature': '🌿',
  'culture': '🏛️',
  'city': '🏙️',
  'food': '🍽️',
}

export function getStyleLabel(style?: string): string {
  return style ? STYLE_LABELS[style] || style : ''
}

export function getStyleEmoji(style?: string): string {
  return style ? STYLE_EMOJIS[style] || '📍' : ''
}