import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// On appelle la vraie route : c'est le contrat que le client web consomme.
import { GET } from '@/app/api/cms/auth/google/route';

const ENV_KEYS = ['GOOGLE_SIGNIN_CLIENT_ID', 'GOOGLE_PHOTOS_CLIENT_ID', 'CMS_ALLOWED_EMAIL'] as const;
const ADRESSE = 'farinhahelder@gmail.com';

describe('GET /api/cms/auth/google', () => {
  const sauvegarde: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const k of ENV_KEYS) {
      sauvegarde[k] = process.env[k];
      delete process.env[k];
    }
  });

  afterEach(() => {
    for (const k of ENV_KEYS) {
      if (sauvegarde[k] === undefined) delete process.env[k];
      else process.env[k] = sauvegarde[k];
    }
  });

  it('annonce non configure et n expose aucun client quand les variables manquent', async () => {
    const corps = await (await GET()).json();

    expect(corps.configure).toBe(false);
    expect(corps.clientId).toBeNull();
  });

  it('n annonce configure qu avec le client ET l adresse, et expose le client', async () => {
    process.env.GOOGLE_SIGNIN_CLIENT_ID = 'client-123.apps.googleusercontent.com';
    let corps = await (await GET()).json();
    expect(corps.configure).toBe(false);

    process.env.CMS_ALLOWED_EMAIL = ADRESSE;
    corps = await (await GET()).json();
    expect(corps.configure).toBe(true);
    expect(corps.clientId).toBe('client-123.apps.googleusercontent.com');
  });

  it('replie le client expose sur le client Photos quand le client dedie manque', async () => {
    process.env.GOOGLE_PHOTOS_CLIENT_ID = 'photos-client.apps.googleusercontent.com';
    process.env.CMS_ALLOWED_EMAIL = ADRESSE;

    const corps = await (await GET()).json();

    expect(corps.configure).toBe(true);
    expect(corps.clientId).toBe('photos-client.apps.googleusercontent.com');
  });
});
