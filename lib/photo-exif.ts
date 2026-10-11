export type PhotoExifResult = any;
export const extractPhotoExif = async (...args: any[]): Promise<PhotoExifResult> => ({});
export const detectStockPhoto = (...args: any[]): { isStockCandidate: boolean, reasons: string[] } => ({ isStockCandidate: false, reasons: [] });
