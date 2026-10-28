/**
 * Heldonica CMS — connexion par compte Google (propriétaire uniquement)
 *
 * Pourquoi ce module existe
 * -------------------------
 * Le CMS s'ouvrait avec un mot de passe unique (`CMS_PASSWORD`) partagé par le
 * poste et le téléphone. Un mot de passe partagé ne se révoque pas par appareil,
 * et il doit être saisi puis stocké sur le téléphone.
 *
 * Ici, l'identité est le compte Google du propriétaire : le téléphone obtient un
 * jeton d'identité Google, le serveur le vérifie auprès de Google, et n'accepte
 * que l'adresse autorisée. La double authentification du compte Google s'applique
 * déjà en amont — inutile de la refaire ici.
 *
 * Ce que ce module NE fait PAS : il ne remplace pas `CMS_PASSWORD`. Le mot de
 * passe reste la voie de secours (poste, navigateur, automatisations) ; refuser
 * une connexion Google ne doit jamais enfermer le propriétaire hors de son site.
 */

import { OAuth2Client } from 'google-auth-library';

export const CMS_ALLOWED_EMAIL_ENV = 'CMS_ALLOWED_EMAIL';

/**
 * Client ID OAuth utilisé pour vérifier l'audience du jeton.
 *
 * On lit `GOOGLE_PHOTOS_CLIENT_ID` en repli : les jetons d'identité Google ne
 * portent pas de « type » de client, donc l'audience d'un client OAuth existant
 * du projet est valide. Cela évite d'exiger une variable de plus avant que le
 * client Android dédié n'existe. `GOOGLE_SIGNIN_CLIENT_ID` reste prioritaire.
 */
export function getSignInClientId(): string | null {
  return (
    process.env.GOOGLE_SIGNIN_CLIENT_ID?.trim() ||
    process.env.GOOGLE_PHOTOS_CLIENT_ID?.trim() ||
    null
  );
}

/** L'adresse autorisée à ouvrir le CMS. Une seule, jamais une liste ouverte. */
export function getAllowedEmail(): string | null {
  return process.env[CMS_ALLOWED_EMAIL_ENV]?.trim().toLowerCase() || null;
}

export function isGoogleSignInConfigured(): boolean {
  return Boolean(getSignInClientId() && getAllowedEmail());
}

export type GoogleVerification =
  | { ok: true; email: string }
  | { ok: false; raison: string };

/**
 * Vérifie un jeton d'identité Google.
 *
 * `verifyIdToken` contrôle la signature auprès des clés publiques de Google,
 * l'audience (le jeton doit viser NOTRE client) et l'expiration. On ajoute le
 * contrôle de l'adresse : sans lui, n'importe quel compte Google du monde
 * entrerait dans le CMS.
 */
export async function verifierJetonGoogle(jeton: string): Promise<GoogleVerification> {
  const clientId = getSignInClientId();
  const autorise = getAllowedEmail();

  if (!clientId || !autorise) {
    return { ok: false, raison: 'Connexion Google non configurée sur ce serveur.' };
  }
  if (!jeton || jeton.length > 8192) {
    return { ok: false, raison: 'Jeton manquant ou invalide.' };
  }

  try {
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({ idToken: jeton, audience: clientId });
    const payload = ticket.getPayload();

    if (!payload?.email) {
      return { ok: false, raison: 'Jeton sans adresse.' };
    }
    if (payload.email_verified !== true) {
      return { ok: false, raison: 'Adresse Google non vérifiée.' };
    }
    if (payload.email.toLowerCase() !== autorise) {
      // Le message ne dit pas quelle adresse a été tentée : un échec ne doit pas
      // confirmer au visiteur quel compte est autorisé.
      return { ok: false, raison: 'Ce compte n\'est pas autorisé.' };
    }
    return { ok: true, email: payload.email };
  } catch {
    // Google répond « Token used too late », « Wrong recipient », « Invalid
    // signature »… Détail utile en journal, jamais renvoyé au client.
    return { ok: false, raison: 'Jeton Google refusé.' };
  }
}
