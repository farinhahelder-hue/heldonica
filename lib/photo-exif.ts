export interface PhotoExifResult {
  width?: number;
  height?: number;
  orientation?: number;
  make?: string;
  model?: string;
  exposureTime?: number;
  fNumber?: number;
  iso?: number;
  focalLength?: number;
  lensModel?: string;
  datetime?: string;
  date?: string;
  gps?: { latitude: number, longitude: number, lat?: number, lng?: number };
  isStockCandidate?: boolean;
  stockReasons?: string[];
}

export async function extractPhotoExif(buffer: Buffer, config?: any): Promise<PhotoExifResult> {
  return {};
}

export function detectStockPhoto(buffer: Buffer | string): { isStockCandidate: boolean, reasons: string[] } {
  return { isStockCandidate: false, reasons: [] };
}
