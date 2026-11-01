/**
 * POST /api/cms/auth/google — connexion par compte Google.
 *
 * Le corps porte `{ idToken }`, obtenu côté client (Credential Manager sur
 * Android, ou Google Identity Services sur le web). On le vérifie auprès de
 * Google, on contrôle l'adresse autorisée, puis on émet la session CMS
 * habituelle : le reste du CMS ne change pas.
 *
 * La double authentification est celle du compte Google : elle s'est déjà
 * appliquée avant que le jeton ne soit émis. On ne la refait pas.
 *
 * Cette route est publique (le middleware laisse passer `/api/cms/auth/*`) :
 * c'est le jeton Google qui fait office de preuve, pas un cookie.
 */

import { NextResponse } from 'next/server';
import { createCmsSessionResponse } from '@/lib/cms-auth';
import { isGoogleSignInConfigured, verifierJetonGoogle, getSignInClientId } from '@/lib/cms-google-signin';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET() {
  // État de la connexion, pour que l'app puisse l'afficher sans tenter un appel.
  // On expose aussi le client ID : le bouton web en a besoin pour initialiser
  // Google Identity Services, et il n'est pas secret (il figure dans chaque page
  // qui charge le script). Tant qu'il n'est pas posé, on n'envoie rien.
  return NextResponse.json({
    configure: isGoogleSignInConfigured(),
    clientId: getSignInClientId(),
  });
}

export async function POST(req: Request) {
  // Une vérification de jeton est bon marché, mais elle interroge Google : on
  // borne les tentatives par IP comme le fait la connexion par mot de passe.
  const limite = checkRateLimit(getClientIp(req), { limit: 10, prefix: 'cms-google-signin' });
  if (!limite.success) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Réessaie dans une minute.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((limite.reset - Date.now()) / 1000)) } }
    );
  }

  if (!isGoogleSignInConfigured()) {
    return NextResponse.json(
      { error: 'Connexion Google non configurée : variables GOOGLE_SIGNIN_CLIENT_ID et CMS_ALLOWED_EMAIL requises.' },
      { status: 503 }
    );
  }

  let jeton = '';
  try {
    const corps = await req.json();
    jeton = typeof corps?.idToken === 'string' ? corps.idToken : '';
  } catch {
    return NextResponse.json({ error: 'Corps de requête illisible.' }, { status: 400 });
  }

  const verdict = await verifierJetonGoogle(jeton);
  if (!verdict.ok) {
    console.warn('[cms-auth/google] refusé :', verdict.raison);
    return NextResponse.json({ error: 'Connexion Google refusée.' }, { status: 401 });
  }

  return createCmsSessionResponse();
}
