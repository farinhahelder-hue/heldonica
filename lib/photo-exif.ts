export interface PhotoExifResult {
    date?: string;
    isStockCandidate?: boolean;
    stockReasons?: string[];
    gps?: { latitude?: number; longitude?: number };
}
export const detectStockPhoto = (url: string): { isStockCandidate: boolean, reasons: string[] } => ({ isStockCandidate: false, reasons: [] });
export const extractPhotoExif = async (buffer: Buffer, name: string): Promise<PhotoExifResult> => ({});
