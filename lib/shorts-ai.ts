// AI-powered shorts generation utilities
// Uses AI to analyze video content and identify best moments for short-form content

export interface ShortClip {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  thumbnail: string;
  caption: string;
  hashtags: string[];
  score: number;
}

export interface VideoAnalysisResult {
  totalDuration: number;
  bestMoments: Array<{
    startTime: number;
    endTime: number;
    score: number;
    reason: string;
  }>;
  themes: string[];
}

// Branded intro/outro for Heldonica
export const BRANDED_INTRO = {
  text: 'Heldonica',
  duration: 2,
  style: {
    backgroundColor: '#6b2a1a',
    textColor: '#ffffff',
    fontSize: 32,
    animation: 'fade-in',
  },
};

export const BRANDED_OUTRO = {
  text: 'Follow @heldonica',
  duration: 2,
  style: {
    backgroundColor: '#83C5BE',
    textColor: '#ffffff',
    fontSize: 24,
    animation: 'slide-up',
  },
};

// Generate caption suggestions based on theme
export function generateCaptionSuggestions(theme: string): string[] {
  const captions: Record<string, string[]> = {
    default: [
      'Cette destination va vous surprendre',
      'Le secret que personne ne vous dit',
      'Voici pourquoi j\'adore ce lieu',
      'Mon coup de cœur du moment',
      'À faire absolument lors de votre visite',
    ],
    food: [
      'La meilleure adresse que j\'ai trouvée',
      'Un festin pour les yeux et le palais',
      'Goûtez à cette merveille',
      'Mon adresse préférée pour manger local',
    ],
    nature: [
      'La nature à l\'état pur',
      'Un cadre absolument magnifique',
      'Le calme dont vous avez besoin',
      'Un panorama à couper le souffle',
    ],
    culture: [
      'L\'histoire se dévoile ici',
      'Un patrimoine fascinant',
      'Découvrez ce lieu unique',
      'L\'authenticité au rendez-vous',
    ],
  };

  const category = Object.keys(captions).find(key => 
    theme.toLowerCase().includes(key)
  ) || 'default';

  return captions[category];
}

// Generate hashtags based on theme
export function generateHashtags(theme: string, count: number = 8): string[] {
  const baseHashtags = [
    '#heldonica',
    '#pépitesvoyage',
    '#voyageinspirant',
    '#traveltips',
    '#destination',
    '#wanderlust',
    '#voyage',
    '#travelgram',
    '#travelphotography',
    '#travelblogger',
    '#exploremore',
    '#adventuretime',
    '#instatravel',
    '#traveladdict',
  ];

  // Shuffle and return requested count
  const shuffled = [...baseHashtags].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Analyze video content using AI (simulated)
export async function analyzeVideoContent(
  videoBlob: Blob,
  apiKey?: string
): Promise<VideoAnalysisResult> {
  // In a real implementation, this would:
  // 1. Extract frames from the video
  // 2. Send to AI vision API for analysis
  // 3. Identify best moments based on visual/audio cues
  // 4. Return timestamps of best segments

  // Simulated response
  return {
    totalDuration: 180,
    bestMoments: [
      { startTime: 15, endTime: 45, score: 0.95, reason: 'Coucher de soleil spectaculaire' },
      { startTime: 60, endTime: 90, score: 0.88, reason: 'Moment convivial' },
      { startTime: 105, endTime: 135, score: 0.82, reason: 'Découverte intéressante' },
      { startTime: 150, endTime: 175, score: 0.79, reason: 'Vue panoramique' },
    ],
    themes: ['voyage', 'découverte', 'nature'],
  };
}

// Create ZIP file from clips (requires JSZip)
export async function createClipsZip(clips: ShortClip[]): Promise<Blob> {
  // In a real implementation, this would:
  // 1. Extract each clip from the source video
  // 2. Apply recropping to 9:16
  // 3. Add branded intro/outro
  // 4. Burn in subtitles
  // 5. Create ZIP file with all clips

  // For now, return an empty blob
  return new Blob([], { type: 'application/zip' });
}

// Format time for display
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Clip duration presets
export const CLIP_PRESETS = [
  { label: '15s', value: 15, type: 'short' },
  { label: '30s', value: 30, type: 'medium' },
  { label: '60s', value: 60, type: 'long' },
] as const;

// Export format
export interface ExportFormat {
  width: number;
  height: number;
  aspectRatio: string;
  platform: string;
}

export const SHORT_FORMATS: ExportFormat[] = [
  { width: 1080, height: 1920, aspectRatio: '9:16', platform: 'Instagram Reels / TikTok / YouTube Shorts' },
  { width: 1080, height: 1350, aspectRatio: '4:5', platform: 'Instagram Feed (4:5)' },
];