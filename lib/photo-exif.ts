export type PhotoExifResult = any;
export const extractPhotoExif = async (file: File | string | Buffer, b?: any): Promise<PhotoExifResult> => ({});
export const detectStockPhoto = (file: File | string | Buffer): any => ({isStockCandidate: false, reasons: []});
