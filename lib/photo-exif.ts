export interface PhotoExifResult {
  isStockCandidate?: boolean;
  stockReasons?: string[];
  date?: string;
  gps?: { latitude: number; longitude: number; lat?: number; lng?: number };
  metadata?: any;
}
export async function extractPhotoExif(file: any, filename?: string): Promise<PhotoExifResult> {
  return {};
}
export function detectStockPhoto(exif: any): any {
  return { isStockCandidate: false, reasons: [] };
}
