import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Seul l'appel reseau a Google est simule : c'est un service externe qu'on ne
// peut pas joindre en test. Toute la logique de decision (adresse autorisee,
// adresse verifiee, refus generique) est celle du vrai module.
const { verifyIdToken } = vi.hoisted(() => ({ verifyIdToken: vi.fn() }));

vi.mock('google-auth-library', () => ({
  OAuth2Client: class {
    verifyIdToken = verifyIdToken;
  },
}));

import {
  isGoogleSignInConfigured,
  getAllowedEmail,
  getSignInClientId,
  verifierJetonGoogle,
  classerRefusGoogle,
} from '@/lib/cms-google-signin';

const ENV_KEYS = ['GOOGLE_SIGNIN_CLIENT_ID', 'GOOGLE_PHOTOS_CLIENT_ID', 'CMS_ALLOWED_EMAIL'] as const;
const ADRESSE = 'farinhahelder@gmail.com';

function ticketAvec(payload: Record<string, unknown> | undefined) {
  return { getPayload: () => payload };
}

describe('cms-google-signin', () => {
  const sauvegarde: Record<string, string | undefined> = {};

  beforeEach(() => {
    verifyIdToken.mockReset();
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

  describe('configuration', () => {
    it('refuse tant que client et adresse ne sont pas tous deux poses', () => {
      expect(isGoogleSignInConfigured()).toBe(false);

      process.env.GOOGLE_SIGNIN_CLIENT_ID = 'client-123';
      expect(isGoogleSignInConfigured()).toBe(false);

      process.env.CMS_ALLOWED_EMAIL = ADRESSE;
      expect(isGoogleSignInConfigured()).toBe(true);
    });

    it('normalise l adresse autorisee (espaces, majuscules)', () => {
      process.env.CMS_ALLOWED_EMAIL = '  FarinhaHelder@Gmail.COM  ';
      expect(getAllowedEmail()).toBe(ADRESSE);
    });

    it('prefere GOOGLE_SIGNIN_CLIENT_ID, sinon replie sur le client Photos', () => {
      process.env.GOOGLE_PHOTOS_CLIENT_ID = 'photos-client';
      expect(getSignInClientId()).toBe('photos-client');

      process.env.GOOGLE_SIGNIN_CLIENT_ID = 'signin-client';
      expect(getSignInClientId()).toBe('signin-client');
    });
  });

  describe('verification du jeton', () => {
    beforeEach(() => {
      process.env.GOOGLE_SIGNIN_CLIENT_ID = 'client-123';
      process.env.CMS_ALLOWED_EMAIL = ADRESSE;
    });

    it('accepte le compte autorise', async () => {
      verifyIdToken.mockResolvedValue(
        ticketAvec({ email: ADRESSE, email_verified: true })
      );

      const verdict = await verifierJetonGoogle('jeton-valide');

      expect(verdict).toEqual({ ok: true, email: ADRESSE });
      expect(verifyIdToken).toHaveBeenCalledWith({ idToken: 'jeton-valide', audience: 'client-123' });
    });

    it('refuse un autre compte Google, et ne dit pas lequel est autorise', async () => {
      verifyIdToken.mockResolvedValue(
        ticketAvec({ email: 'quelquun.dautre@gmail.com', email_verified: true })
      );

      const verdict = await verifierJetonGoogle('jeton-valide');

      expect(verdict.ok).toBe(false);
      // Le refus ne doit pas confirmer au visiteur l'adresse attendue.
      if (!verdict.ok) expect(verdict.raison).not.toContain(ADRESSE);
    });

    it('refuse une adresse non verifiee par Google', async () => {
      verifyIdToken.mockResolvedValue(
        ticketAvec({ email: ADRESSE, email_verified: false })
      );

      const verdict = await verifierJetonGoogle('jeton-valide');

      expect(verdict.ok).toBe(false);
    });

    it('refuse un jeton sans adresse', async () => {
      verifyIdToken.mockResolvedValue(ticketAvec({ email_verified: true }));

      expect((await verifierJetonGoogle('jeton-valide')).ok).toBe(false);
    });

    it('refuse un jeton illisible sans lever', async () => {
      verifyIdToken.mockRejectedValue(new Error('Wrong recipient'));

      const verdict = await verifierJetonGoogle('jeton-valide');

      expect(verdict.ok).toBe(false);
      if (!verdict.ok) expect(verdict.raison).toBe('Jeton Google refusé.');
    });

    it('refuse un jeton vide ou demesure sans appeler Google', async () => {
      expect((await verifierJetonGoogle('')).ok).toBe(false);
      expect((await verifierJetonGoogle('x'.repeat(9000))).ok).toBe(false);
      expect(verifyIdToken).not.toHaveBeenCalled();
    });

    it('refuse tout quand le serveur n est pas configure', async () => {
      delete process.env.GOOGLE_SIGNIN_CLIENT_ID;

      const verdict = await verifierJetonGoogle('jeton-valide');

      expect(verdict.ok).toBe(false);
      expect(verifyIdToken).not.toHaveBeenCalled();
    });
  });

  describe('classe un refus en categorie journalisable', () => {
    it('distingue une audience erronee (client ID du bouton)', () => {
      expect(classerRefusGoogle(new Error('Wrong recipient, payload audience != requiredAudience'))).toBe('audience');
    });

    it('distingue une expiration', () => {
      expect(classerRefusGoogle(new Error('Token used too late, 123 > 456'))).toBe('expiration');
    });

    it('distingue un jeton illisible', () => {
      expect(classerRefusGoogle(new Error('Invalid token signature: abc.def.ghi'))).toBe('jeton illisible');
    });

    it('retombe sur inconnu plutot que de deviner', () => {
      expect(classerRefusGoogle(new Error('panne reseau'))).toBe('inconnu');
      expect(classerRefusGoogle(undefined)).toBe('inconnu');
    });
  });

  describe('journalisation sure', () => {
    beforeEach(() => {
      process.env.GOOGLE_SIGNIN_CLIENT_ID = 'client-123';
      process.env.CMS_ALLOWED_EMAIL = ADRESSE;
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('journalise une categorie, jamais le jeton brut', async () => {
      // google-auth-library peut mettre le jeton dans le message d'erreur :
      // la journalisation ne doit jamais le reprendre tel quel.
      const jeton = 'jeton-secret-qui-ne-doit-pas-fuiter';
      verifyIdToken.mockRejectedValue(new Error(`Invalid token signature: ${jeton}`));
      const espion = vi.spyOn(console, 'error').mockImplementation(() => {});

      const verdict = await verifierJetonGoogle(jeton);

      expect(verdict.ok).toBe(false);
      expect(espion).toHaveBeenCalledWith('[cms-auth/google] jeton refusé :', 'jeton illisible');
      const trace = espion.mock.calls.flat().join(' ');
      expect(trace).not.toContain(jeton);
    });
  });
});
