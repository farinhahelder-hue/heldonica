export type PhotoExifResult = any;

export const extractPhotoExif = (file: File | Buffer, buffer?: Buffer | string) => ({ isStockCandidate: false, stockReasons: [] });
export const detectStockPhoto = (file: File | string | Buffer, buffer?: Buffer | string) => ({ isStockCandidate: false, reasons: [] });
