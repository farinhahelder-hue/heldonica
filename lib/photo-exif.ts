
export interface PhotoExifResult {
  latitude?: number | null;
  longitude?: number | null;
  takenAt?: string | null;
  cameraMake?: string | null;
  cameraModel?: string | null;
  date?: string | null;
  gps?: { latitude?: number; longitude?: number } | null;
  isStockCandidate?: boolean;
  stockReasons?: string[];
}
export async function readExif(buffer: Buffer): Promise<PhotoExifResult> { return {}; }
export async function extractPhotoExif(buffer: Buffer, _options?: any): Promise<PhotoExifResult> { return {}; }
export function detectStockPhoto(file: any): { isStockCandidate: boolean, reasons: string[] } { return { isStockCandidate: false, reasons: [] }; }
export const parseExifDate = (date: string) => new Date();
export const extractCoordinates = (exif: any) => ({ lat: 0, lng: 0 });
