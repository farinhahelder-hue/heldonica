// Whisper API integration for automatic subtitles generation
// Uses OpenAI's Whisper API for audio transcription

export interface WhisperSegment {
  start: number;
  end: number;
  text: string;
}

export interface WhisperResponse {
  text: string;
  segments: WhisperSegment[];
  language: string;
}

// Brand voice corrections for Heldonica vocabulary
export const VOCABULARY_CORRECTIONS: Record<string, string> = {
  'bon plan': 'pépite dénichée',
  'bon plans': 'pépites dénichées',
  'bonnes adresses': 'pépites',
  'top': 'incontournable',
  'tips': 'astuces',
  'check': 'checklist',
  'reco': 'recommandation',
  'mastoc': 'impressionnant',
  'kiff': 'coup de cœur',
  'dégueu': 'peu ragoutant',
  'ouffff': 'incroyable',
  'waow': 'splendide',
  'trop bien': 'formidable',
  'mega': 'extrêmement',
  'super': 'remarquable',
  'tip top': 'parfait',
  'au top': 'incontournable',
};

// Apply brand voice corrections to text
export function applyBrandCorrections(text: string): string {
  let corrected = text;
  Object.entries(VOCABULARY_CORRECTIONS).forEach(([original, replacement]) => {
    const regex = new RegExp(`\\b${original}\\b`, 'gi');
    corrected = corrected.replace(regex, replacement);
  });
  return corrected;
}

// Transcribe audio using Whisper API
export async function transcribeAudio(
  audioBlob: Blob,
  apiKey: string
): Promise<WhisperResponse> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.wav');
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'verbose_json');
  formData.append('timestamp_granularities[]', 'segment');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Whisper API error: ${response.statusText}`);
  }

  return response.json();
}

// Convert video to audio for transcription
export async function extractAudioFromVideo(videoBlob: Blob): Promise<Blob> {
  // This would use ffmpeg.wasm in a real implementation
  // For now, return the blob as-is (assuming it's already audio or will be handled by the API)
  return videoBlob;
}

// Generate SRT file from segments
export function generateSRTFile(segments: WhisperSegment[]): string {
  return segments
    .map((segment, index) => {
      const startTime = formatSRTTime(segment.start);
      const endTime = formatSRTTime(segment.end);
      return `${index + 1}\n${startTime} --> ${endTime}\n${segment.text}`;
    })
    .join('\n\n');
}

function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

// Download SRT file
export function downloadSRT(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Subtitle styling options
export interface SubtitleStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  backgroundColor: string;
  padding: number;
  borderRadius: number;
  position: 'bottom' | 'top' | 'center';
}

export const HELDONICA_SUBTITLE_STYLES: SubtitleStyle = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: 24,
  color: '#ffffff',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  padding: 8,
  borderRadius: 4,
  position: 'bottom',
};

// Check if OPENAI_API_KEY is configured
export function isWhisperConfigured(): boolean {
  return typeof process !== 'undefined' && !!process.env.NEXT_PUBLIC_OPENAI_API_KEY;
}