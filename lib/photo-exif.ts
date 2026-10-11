export interface PhotoExifResult {
  isStockCandidate: boolean;
  reasons: string[];
  stockReasons?: string[];
  date?: string;
  gps?: { lat?: number; lng?: number; latitude?: number; longitude?: number };
}
export function detectStockPhoto(file: File | string): PhotoExifResult {
  return { isStockCandidate: false, reasons: [] };
}
export function extractPhotoExif(buffer: Buffer, arg2?: any): PhotoExifResult {
  return { isStockCandidate: false, reasons: [] };
}
