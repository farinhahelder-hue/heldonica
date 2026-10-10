/**
 * Heldonica CMS — Gestion des Tokens API à Scopes (Flotte IA, MCP, Automatisations)
 *
 * Implémenté pour la Phase 3 du CMS (Pattern Strapi & Payload).
 * Gère l'authentification par clé API avec scopes granulaires :
 * - `read:content` : consultation lecture seule (articles, destinations, hébergements)
 * - `write:draft` : création et modification de brouillons uniquement
 * - `publish:content` : validation et mise en ligne directe
 * - `admin:*` : tous les droits administrateur
 *
 * Règle AGENTS.md :
 * - Zéro secret en clair dans la base (seul le hash SHA-256 est persisté).
 * - Lecture stricte des erreurs Supabase.
 */

import { createHash, randomBytes } from 'node:crypto';
import { supabase } from '@/lib/supabase-client';

export type CmsTokenScope = 'read:content' | 'write:draft' | 'publish:content' | 'admin:*';

export interface CmsApiToken {
  id: string;
  name: string;
  token_prefix: string;
  scopes: CmsTokenScope[];
  created_by?: string | null;
  last_used_at?: string | null;
  expires_at?: string | null;
  is_revoked: boolean;
  created_at: string;
  updated_at: string;
}

export interface GeneratedTokenResult {
  success: boolean;
  rawToken?: string;
  token?: CmsApiToken;
  error?: string;
}

export interface TokenVerificationResult {
  valid: boolean;
  token?: CmsApiToken;
  error?: string;
}

/**
 * Calcule l'empreinte SHA-256 d'un token brut pour comparaison sécurisée en base.
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token.trim()).digest('hex');
}

/**
 * Génère un nouveau token d'accès avec ses scopes associés.
 * Le token brut n'est renvoyé qu'une seule fois à la création.
 */
export async function generateApiToken(params: {
  name: string;
  scopes: CmsTokenScope[];
  createdBy?: string;
  expiresInDays?: number;
}): Promise<GeneratedTokenResult> {
  const { name, scopes, createdBy, expiresInDays } = params;

  if (!name || !name.trim()) {
    return { success: false, error: 'Le nom du token est obligatoire.' };
  }

  if (!scopes || scopes.length === 0) {
    return { success: false, error: 'Au moins un scope de permission est requis.' };
  }

  if (!supabase) {
    return { success: false, error: 'Client Supabase non initialisé.' };
  }

  // Format du token : held_live_ + 32 octets aléatoires en hex (64 caractères)
  const randomPart = randomBytes(32).toString('hex');
  const rawToken = `held_live_${randomPart}`;
  const tokenPrefix = `held_live_${randomPart.slice(0, 8)}...`;
  const tokenHash = hashToken(rawToken);

  let expiresAt: string | null = null;
  if (expiresInDays && expiresInDays > 0) {
    const exp = new Date();
    exp.setDate(exp.getDate() + expiresInDays);
    expiresAt = exp.toISOString();
  }

  const payload = {
    name: name.trim(),
    token_hash: tokenHash,
    token_prefix: tokenPrefix,
    scopes,
    created_by: createdBy || 'system',
    expires_at: expiresAt,
    is_revoked: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('cms_api_tokens')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('[CmsTokens] Erreur lors de l’enregistrement du token:', error);
    return { success: false, error: error.message };
  }

  return {
    success: true,
    rawToken,
    token: data as CmsApiToken,
  };
}

/**
 * Vérifie un jeton d'authentification API (Bearer token) et contrôle les scopes requis.
 */
export async function verifyApiToken(
  authHeaderOrToken: string | null | undefined,
  requiredScope?: CmsTokenScope
): Promise<TokenVerificationResult> {
  if (!authHeaderOrToken) {
    return { valid: false, error: 'Jeton d’authentification absent.' };
  }

  // Nettoyage du préfixe Bearer si présent
  const rawToken = authHeaderOrToken.replace(/^Bearer\s+/i, '').trim();
  if (!rawToken) {
    return { valid: false, error: 'Format du jeton invalide.' };
  }

  if (!supabase) {
    return { valid: false, error: 'Client Supabase non initialisé.' };
  }

  const computedHash = hashToken(rawToken);

  const { data, error } = await supabase
    .from('cms_api_tokens')
    .select('*')
    .eq('token_hash', computedHash)
    .single();

  if (error || !data) {
    return { valid: false, error: 'Jeton non reconnu ou invalide.' };
  }

  const token = data as CmsApiToken;

  if (token.is_revoked) {
    return { valid: false, error: 'Ce jeton d’accès a été révoqué.' };
  }

  if (token.expires_at && new Date(token.expires_at).getTime() < Date.now()) {
    return { valid: false, error: 'Ce jeton d’accès a expiré.' };
  }

  // Contrôle des scopes
  if (requiredScope) {
    const hasScope =
      token.scopes.includes('admin:*') ||
      token.scopes.includes(requiredScope);

    if (!hasScope) {
      return {
        valid: false,
        error: `Permission insuffisante. Scope requis: '${requiredScope}'. Scopes possédés: [${token.scopes.join(', ')}].`,
      };
    }
  }

  // Mise à jour de last_used_at
  const { error: touchErr } = await supabase
    .from('cms_api_tokens')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', token.id);

  if (touchErr) {
    console.warn('[CmsTokens] Impossible de mettre à jour last_used_at:', touchErr.message);
  }

  return { valid: true, token };
}

/**
 * Révoque un jeton d'accès par son ID.
 */
export async function revokeApiToken(tokenId: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Client Supabase non initialisé.' };
  }

  const { error } = await supabase
    .from('cms_api_tokens')
    .update({ is_revoked: true, updated_at: new Date().toISOString() })
    .eq('id', tokenId);

  if (error) {
    console.error('[CmsTokens] Erreur lors de la révocation du token:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Liste tous les jetons API existants (sans exposer de secrets).
 */
export async function listApiTokens(): Promise<{ success: boolean; tokens: CmsApiToken[]; error?: string }> {
  if (!supabase) {
    return { success: false, tokens: [], error: 'Client Supabase non initialisé.' };
  }

  const { data, error } = await supabase
    .from('cms_api_tokens')
    .select('id, name, token_prefix, scopes, created_by, last_used_at, expires_at, is_revoked, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[CmsTokens] Erreur lors de la récupération des tokens:', error);
    return { success: false, tokens: [], error: error.message };
  }

  return { success: true, tokens: (data || []) as CmsApiToken[] };
}
