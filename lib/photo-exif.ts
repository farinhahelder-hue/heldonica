
export interface PhotoExifResult {
  isStockCandidate?: boolean;
  reasons?: string[];
  [key: string]: any;
}
export function detectStockPhoto(file: File | string): PhotoExifResult {
  return { isStockCandidate: false, reasons: [] };
}
export async function extractPhotoExif(buffer: Buffer, filename: string): Promise<PhotoExifResult> {
  return { isStockCandidate: false, reasons: [] };
}
