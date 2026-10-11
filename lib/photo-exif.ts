export type PhotoExifResult = {
    date: string;
    gps: { latitude: number; longitude: number } | null;
    isStockCandidate: boolean;
    stockReasons: string[];
}
export async function extractPhotoExif(buffer: Buffer, name: string): Promise<PhotoExifResult> {
    return { date: '', gps: null, isStockCandidate: false, stockReasons: [] };
}
export function detectStockPhoto(url: string) {
    return { isStockCandidate: false, reasons: [] };
}
