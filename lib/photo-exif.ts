export interface PhotoExifResult {
  isStockCandidate: boolean;
  reasons: string[];
  stockReasons?: string[];
  date?: string;
  gps?: { lat?: number; lng?: number; latitude?: number; longitude?: number };
}
export async function extractPhotoExif(file: any, metadata: any = null): Promise<PhotoExifResult> { return { isStockCandidate: false, reasons: [] }; }
export function detectStockPhoto(file: any): PhotoExifResult { return { isStockCandidate: false, reasons: [] }; }
