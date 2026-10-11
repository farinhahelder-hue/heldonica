export interface PhotoExifResult {
    latitude?: number;
    longitude?: number;
    date?: string;
    camera?: string;
    isStockCandidate?: boolean;
    stockReasons?: string[];
    gps?: { lat: number, lng: number, latitude?: number, longitude?: number };
}

export function detectStockPhoto(file: any, buffer?: any): { isStockCandidate: boolean, reasons: string[] } {
    return { isStockCandidate: false, reasons: [] };
}

export async function extractPhotoExif(file: any, buffer?: any): Promise<PhotoExifResult> {
    return {};
}
