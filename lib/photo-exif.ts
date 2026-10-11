export type PhotoExifResult = any;
export async function extractPhotoExif(buffer: Buffer, options?: any): Promise<PhotoExifResult> { return null; }
export function detectStockPhoto(buffer: Buffer | string): { isStockCandidate: boolean; reasons: string[] } { return { isStockCandidate: false, reasons: [] }; }
