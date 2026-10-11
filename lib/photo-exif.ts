export interface PhotoExifResult {
  width?: number;
  height?: number;
  [key: string]: any;
}
export function extractPhotoExif(buffer: Buffer | string, mime?: string): Promise<PhotoExifResult> { return Promise.resolve({}); }
export function detectStockPhoto(buffer: Buffer | string, mime?: string): { isStockCandidate: boolean, reasons: string[] } {
    return { isStockCandidate: false, reasons: [] };
}
