export interface PhotoExifResult {
  isStockCandidate: boolean;
  reasons: string[];
  stockReasons?: string[];
  date?: string;
  gps?: any;
}
export function detectStockPhoto(file: File | string): { isStockCandidate: boolean; reasons: string[] } {
  return { isStockCandidate: false, reasons: [] };
}
export async function extractPhotoExif(file: any, something?: any): Promise<PhotoExifResult> {
  return { isStockCandidate: false, reasons: [] };
}
