export type PhotoExifResult = { date?: string, gps?: any, make?: string, model?: string, isStockCandidate?: boolean, stockReasons?: string[] };
export async function extractExifData(buffer: Buffer): Promise<any> { return {}; }
export async function extractPhotoExif(buffer: Buffer, filename?: string): Promise<PhotoExifResult> { return {}; }
export function detectStockPhoto(exif: any): { isStockCandidate: boolean; reasons: string[] } { return { isStockCandidate: false, reasons: [] }; }
