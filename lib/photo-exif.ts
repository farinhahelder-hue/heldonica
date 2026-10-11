export interface PhotoExifResult {
  latitude: number | null;
  longitude: number | null;
  date: string | null;
  make: string | null;
  model: string | null;
  isStock: boolean;
  isStockCandidate: boolean;
  stockReasons: string[];
  gps?: {
    lat: number;
    latitude: number;
    lng: number;
    longitude: number;
  };
}

export function detectStockPhoto(file: any, buffer?: any): { isStockCandidate: boolean, reasons: string[] } {
  return { isStockCandidate: false, reasons: [] };
}

export async function extractPhotoExif(file: any, buffer?: any): Promise<PhotoExifResult> {
  return {
    latitude: null,
    longitude: null,
    date: null,
    make: null,
    model: null,
    isStock: false,
    isStockCandidate: false,
    stockReasons: [],
  };
}
