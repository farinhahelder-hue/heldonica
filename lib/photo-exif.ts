export type PhotoExifResult = any;
export function detectStockPhoto(file: any) { return { isStockCandidate: false, reasons: [] }; }
export async function extractPhotoExif(file: any, options?: any) { return { lat: 0, lng: 0, isStockCandidate: false, stockReasons: [] }; }
