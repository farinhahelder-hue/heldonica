export const STYLE_LABELS: Record<string, string> = {
  'slow-culture': 'Culture',
  'slow-nature': 'Nature',
  'nature': 'Nature',
  'culture': 'Culture',
  'city': 'Ville',
  'food': 'Food',
}

export function getStyleLabel(style?: string): string {
  return style ? STYLE_LABELS[style] || style : ''
}
