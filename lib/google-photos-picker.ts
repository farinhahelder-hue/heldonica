/**
 * Client serveur de l'API Google Photos Picker.
 *
 * Depuis mars 2025, Google interdit de lister une photothèque entière :
 * `albums.list` et `mediaItems.search` répondent 403 quel que soit le scope.
 * Le Picker est la voie officielle restante — l'utilisateur choisit ses médias
 * dans l'interface Google, l'application ne voit que la sélection.
 *
 * Ce module remplace le script Python `scripts/photos_picker.py` pour un usage
 * depuis le CMS : aucun terminal, tout passe par /panel-manager/photos.
 *
 * Prérequis (variables Vercel) :
 *   GOOGLE_PHOTOS_CLIENT_ID
 *   GOOGLE_PHOTOS_CLIENT_SECRET
 *   GOOGLE_PHOTOS_REFRESH_TOKEN   — obtenu une fois via scripts/auth_google_picker.py
 */

const API_ROOT = 'https://photospicker.googleapis.com/v1';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

export type PickerSession = {
  id: string;
  pickerUri?: string;
  mediaItemsSet?: boolean;
  pollingConfig?: { pollInterval?: string; timeoutIn?: string };
};

export type PickedMedia = {
  id: string;
  createTime?: string;
  mediaFile?: {
    baseUrl?: string;
    filename?: string;
    mimeType?: string;
    mediaFileMetadata?: {
      width?: number;
      height?: number;
      cameraMake?: string;
      cameraModel?: string;
    };
  };
};

export function isPickerConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_PHOTOS_CLIENT_ID?.trim() &&
    process.env.GOOGLE_PHOTOS_CLIENT_SECRET?.trim() &&
    process.env.GOOGLE_PHOTOS_REFRESH_TOKEN?.trim()
  );
}

/**
 * Les jetons d'accès Google vivent une heure. Une session de sélection peut
 * rester ouverte bien plus longtemps : on en redemande un à chaque appel plutôt
 * que d'en garder un en mémoire, ce qui évite les 401 en milieu de parcours.
 */
export async function getAccessToken(): Promise<string> {
  const client_id = process.env.GOOGLE_PHOTOS_CLIENT_ID?.trim();
  const client_secret = process.env.GOOGLE_PHOTOS_CLIENT_SECRET?.trim();
  const refresh_token = process.env.GOOGLE_PHOTOS_REFRESH_TOKEN?.trim();

  if (!client_id || !client_secret || !refresh_token) {
    throw new Error(
      'Picker non configuré : GOOGLE_PHOTOS_CLIENT_ID, GOOGLE_PHOTOS_CLIENT_SECRET ' +
      'et GOOGLE_PHOTOS_REFRESH_TOKEN sont requis.'
    );
  }

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id, client_secret, refresh_token, grant_type: 'refresh_token' }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Renouvellement du jeton Google refusé (${res.status}).`);
  }

  const data = await res.json();
  if (!data.access_token) throw new Error('Réponse Google sans access_token.');
  return data.access_token as string;
}

async function appel<T>(chemin: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${API_ROOT}${chemin}`, {
    ...init,
    headers: { ...(init.headers || {}), Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Google Picker ${chemin} → ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

/** Ouvre une session : `pickerUri` est le lien où l'utilisateur choisit ses médias. */
export function createPickerSession(): Promise<PickerSession> {
  return appel<PickerSession>('/sessions', { method: 'POST' });
}

/** `mediaItemsSet` passe à true une fois la sélection validée dans Google Photos. */
export function getPickerSession(id: string): Promise<PickerSession> {
  return appel<PickerSession>(`/sessions/${encodeURIComponent(id)}`);
}

export async function listPickedMedia(sessionId: string): Promise<PickedMedia[]> {
  const items: PickedMedia[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({ sessionId, pageSize: '100' });
    if (pageToken) params.set('pageToken', pageToken);
    const page = await appel<{ mediaItems?: PickedMedia[]; nextPageToken?: string }>(
      `/mediaItems?${params.toString()}`
    );
    items.push(...(page.mediaItems ?? []));
    pageToken = page.nextPageToken;
  } while (pageToken);

  return items;
}

/**
 * Télécharge l'original. `=d` pour une image, `=dv` pour une vidéo : sans ce
 * suffixe Google renvoie une vignette redimensionnée, dépourvue des
 * métadonnées EXIF dont dépend tout le registre de preuves.
 */
export async function downloadMedia(baseUrl: string, isVideo: boolean): Promise<Buffer> {
  const token = await getAccessToken();
  const res = await fetch(`${baseUrl}=${isVideo ? 'dv' : 'd'}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Téléchargement refusé (${res.status}).`);
  return Buffer.from(await res.arrayBuffer());
}
