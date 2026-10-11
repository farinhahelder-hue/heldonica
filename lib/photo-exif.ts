export type PhotoExifResult = { isStockCandidate: boolean; reasons: string[]; stockReasons?: string[]; date?: any; gps?: any; };
export const detectStockPhoto = (file: any, opts?: any): PhotoExifResult => ({ isStockCandidate: false, reasons: [] });
export const extractPhotoExif = (file: any, opts?: any): PhotoExifResult => ({ isStockCandidate: false, reasons: [] });
