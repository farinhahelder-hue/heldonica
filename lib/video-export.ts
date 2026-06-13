// Video export utilities using WebCodecs API
// Note: Requires Chrome/Edge for full WebCodecs support

export interface ExportConfig {
  width: number;
  height: number;
  frameRate: number;
  videoBitrate: number;
  audioBitrate: number;
  format: 'webm' | 'mp4';
}

export interface ExportProgress {
  stage: 'preparing' | 'encoding' | 'finalizing' | 'complete';
  progress: number;
  currentFrame?: number;
  totalFrames?: number;
}

// Default export configurations for Instagram formats
export const EXPORT_PRESETS = {
  reels: {
    width: 1080,
    height: 1920,
    frameRate: 30,
    videoBitrate: 8_000_000, // 8 Mbps
    audioBitrate: 192_000,
    format: 'webm' as const,
  },
  square: {
    width: 1080,
    height: 1080,
    frameRate: 30,
    videoBitrate: 8_000_000,
    audioBitrate: 192_000,
    format: 'webm' as const,
  },
  landscape: {
    width: 1080,
    height: 566,
    frameRate: 30,
    videoBitrate: 8_000_000,
    audioBitrate: 192_000,
    format: 'webm' as const,
  },
  story: {
    width: 1080,
    height: 1920,
    frameRate: 30,
    videoBitrate: 8_000_000,
    audioBitrate: 192_000,
    format: 'webm' as const,
  },
} as const;

// Color grading adjustments
export interface ColorGrading {
  brightness: number; // 0-200, 100 = normal
  contrast: number;   // 0-200, 100 = normal
  saturation: number; // 0-200, 100 = normal
}

// Apply color grading to canvas context
export function applyColorGrading(
  ctx: CanvasRenderingContext2D,
  grading: ColorGrading
): void {
  const filters = [
    `brightness(${grading.brightness}%)`,
    `contrast(${grading.contrast}%)`,
    `saturate(${grading.saturation}%)`,
  ].join(' ');
  
  ctx.filter = filters;
}

// Generate SRT subtitle file
export function generateSRTFile(
  subtitles: Array<{ start: number; end: number; text: string }>
): string {
  return subtitles
    .map((sub, index) => {
      const startTime = formatSRTTime(sub.start);
      const endTime = formatSRTTime(sub.end);
      return `${index + 1}\n${startTime} --> ${endTime}\n${sub.text}`;
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

// Download blob as file
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Check WebCodecs support
export function isWebCodecsSupported(): boolean {
  return typeof VideoEncoder !== 'undefined' && typeof VideoDecoder !== 'undefined';
}

// Aspect ratio utilities
export function calculateCropDimensions(
  sourceWidth: number,
  sourceHeight: number,
  targetAspect: number
): { x: number; y: number; width: number; height: number } {
  const sourceAspect = sourceWidth / sourceHeight;
  
  if (sourceAspect > targetAspect) {
    // Source is wider, crop sides
    const targetWidth = sourceHeight * targetAspect;
    return {
      x: (sourceWidth - targetWidth) / 2,
      y: 0,
      width: targetWidth,
      height: sourceHeight,
    };
  } else {
    // Source is taller, crop top/bottom
    const targetHeight = sourceWidth / targetAspect;
    return {
      x: 0,
      y: (sourceHeight - targetHeight) / 2,
      width: sourceWidth,
      height: targetHeight,
    };
  }
}

// Export format labels for UI
export const FORMAT_LABELS: Record<string, string> = {
  reels: 'Instagram Reels (9:16)',
  square: 'Feed Carré (1:1)',
  landscape: 'Feed Paysage (16:9)',
  story: 'Story (9:16)',
};