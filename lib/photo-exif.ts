export type PhotoExifResult = any;
export function extractPhotoExif(buffer: any, fallback?: any): PhotoExifResult { return null; }
export function detectStockPhoto(buffer: any): { isStockCandidate: boolean; reasons: string[] } {
  return { isStockCandidate: false, reasons: [] };
}
