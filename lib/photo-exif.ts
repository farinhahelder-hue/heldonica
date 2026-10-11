export interface PhotoExifResult {
  isStockCandidate?: boolean;
  stockReasons?: string[];
  date?: string;
  gps?: { latitude: number; longitude: number };
  [key: string]: any;
}
export function detectStockPhoto(file: any, buffer?: any): { isStockCandidate: boolean, reasons: string[] } {
  return { isStockCandidate: false, reasons: [] };
}
export async function extractPhotoExif(buffer: any, filename: string): Promise<PhotoExifResult> {
  return {};
}
