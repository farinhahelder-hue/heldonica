// Lossless video trimming utilities using WebCodecs API
// Allows cutting video segments without re-encoding

export interface TrimSegment {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
}

export interface ExportResult {
  success: boolean;
  segments: number;
  totalDuration: number;
  outputUrl?: string;
  error?: string;
}

// Check if WebCodecs is supported
export function isLosslessCutSupported(): boolean {
  return typeof VideoEncoder !== 'undefined' && typeof VideoDecoder !== 'undefined';
}

// Calculate total output duration
export function calculateTotalDuration(segments: TrimSegment[]): number {
  return segments.reduce((acc, seg) => acc + seg.duration, 0);
}

// Generate output filename
export function generateOutputFilename(inputName: string, segmentIndex: number): string {
  const baseName = inputName.replace(/\.[^/.]+$/, '');
  return `${baseName}_segment_${segmentIndex + 1}.mp4`;
}

// Validate segment timings
export function validateSegment(
  segment: TrimSegment,
  videoDuration: number
): { valid: boolean; error?: string } {
  if (segment.startTime < 0) {
    return { valid: false, error: 'Le début ne peut pas être négatif' };
  }
  if (segment.endTime > videoDuration) {
    return { valid: false, error: 'La fin dépasse la durée de la vidéo' };
  }
  if (segment.startTime >= segment.endTime) {
    return { valid: false, error: 'Le début doit être avant la fin' };
  }
  if (segment.duration <= 0) {
    return { valid: false, error: 'La durée doit être positive' };
  }
  return { valid: true };
}

// Merge overlapping segments (keep earliest start and latest end)
export function mergeOverlappingSegments(
  segments: TrimSegment[]
): TrimSegment[] {
  if (segments.length === 0) return [];

  const sorted = [...segments].sort((a, b) => a.startTime - b.startTime);
  const merged: TrimSegment[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    if (current.startTime <= last.endTime) {
      // Overlapping - merge
      last.endTime = Math.max(last.endTime, current.endTime);
      last.duration = last.endTime - last.startTime;
    } else {
      // Non-overlapping - add new segment
      merged.push(current);
    }
  }

  return merged;
}

// Format duration for display
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Format time for display (with milliseconds)
export function formatTimeWithMs(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

// Snap to frame boundaries
export function snapToFrame(time: number, frameRate: number = 30): number {
  const frameDuration = 1 / frameRate;
  return Math.round(time / frameDuration) * frameDuration;
}

// Find gaps between segments
export function findGaps(
  segments: TrimSegment[],
  videoDuration: number
): Array<{ start: number; end: number; duration: number }> {
  const gaps: Array<{ start: number; end: number; duration: number }> = [];
  
  if (segments.length === 0) {
    gaps.push({ start: 0, end: videoDuration, duration: videoDuration });
    return gaps;
  }

  const sorted = [...segments].sort((a, b) => a.startTime - b.startTime);

  // Gap at the beginning
  if (sorted[0].startTime > 0) {
    gaps.push({
      start: 0,
      end: sorted[0].startTime,
      duration: sorted[0].startTime,
    });
  }

  // Gaps between segments
  for (let i = 0; i < sorted.length - 1; i++) {
    const currentEnd = sorted[i].endTime;
    const nextStart = sorted[i + 1].startTime;
    
    if (nextStart > currentEnd) {
      gaps.push({
        start: currentEnd,
        end: nextStart,
        duration: nextStart - currentEnd,
      });
    }
  }

  // Gap at the end
  const lastSegment = sorted[sorted.length - 1];
  if (lastSegment.endTime < videoDuration) {
    gaps.push({
      start: lastSegment.endTime,
      end: videoDuration,
      duration: videoDuration - lastSegment.endTime,
    });
  }

  return gaps;
}

// Keyboard shortcuts for timeline navigation
export const TIMELINE_SHORTCUTS = {
  playPause: 'Space',
  setInPoint: 'I',
  setOutPoint: 'O',
  addSegment: 'M',
  deleteSegment: 'Delete',
  previousFrame: 'Left',
  nextFrame: 'Right',
  previousSecond: 'Shift+Left',
  nextSecond: 'Shift+Right',
  goToStart: 'Home',
  goToEnd: 'End',
} as const;