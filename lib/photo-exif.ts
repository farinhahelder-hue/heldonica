export type PhotoExifResult = { date?: string; gps?: { latitude: number; longitude: number }; isStockCandidate: boolean; stockReasons: string[] };
export async function extractPhotoExif(buffer: Buffer, name: string): Promise<PhotoExifResult> { return { isStockCandidate: false, stockReasons: [] }; }
export function detectStockPhoto(url: string) { return { isStockCandidate: false, reasons: [] }; }
