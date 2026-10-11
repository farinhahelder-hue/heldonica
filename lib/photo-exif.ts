export type PhotoExifResult = {
    date?: string;
    gps?: { latitude?: number; longitude?: number; };
    isStockCandidate?: boolean;
    stockReasons?: string[];
};

export async function extractPhotoExif(url: string | Buffer, somethingElse?: any): Promise<PhotoExifResult> {
    return {};
}

export function detectStockPhoto(url: string | Buffer, somethingElse?: any): { isStockCandidate: boolean, reasons: string[] } {
    return { isStockCandidate: false, reasons: [] };
}
