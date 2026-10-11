export interface PhotoExifResult {
  width?: number;
  height?: number;
  [key: string]: any;
}
export async function extractPhotoExif(buffer: Buffer | ArrayBuffer | Uint8Array, options?: any): Promise<PhotoExifResult> {
  return {};
}
export function detectStockPhoto(meta: any) {
  return { isStockCandidate: false, reasons: [] };
}
