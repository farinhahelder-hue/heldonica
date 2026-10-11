export type PhotoExifResult = any;

export function detectStockPhoto(file: File | string, buffer?: Buffer): {isStockCandidate: boolean, reasons: string[]} {
  return { isStockCandidate: false, reasons: [] }; // Stub
}
export async function extractPhotoMetadata(buffer: Buffer) {
  return {}; // Stub
}
export async function extractPhotoExif(buffer: Buffer, name?: string): Promise<PhotoExifResult> {
  return {};
}
