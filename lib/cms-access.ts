/**
 * Heldonica CMS — Contrôle d'accès déclaratif et fonctionnel (façon Payload CMS).
 *
 * Règles :
 * - 'admin' : accès total (création, édition, publication, suppression, gestion utilisateurs, audit).
 * - 'editor' : création et édition de brouillons, modification de contenu, upload média. Pas de publication directe en prod ni de suppression d'articles.
 * - 'viewer' : lecture seule des contenus et aperçus.
 */

export type CmsRole = 'admin' | 'editor' | 'viewer';

export type CmsAction = 'create' | 'read' | 'update' | 'delete' | 'publish' | 'archive';

export type CmsEntity = 
  | 'article' 
  | 'destination' 
  | 'zone' 
  | 'media' 
  | 'settings' 
  | 'block' 
  | 'audit_log' 
  | 'user_profile'
  | 'accommodation'
  | 'stay_offer'
  | 'release'
  | 'api_token';

export interface CmsUser {
  id: string;
  email: string;
  role: CmsRole;
  name?: string;
}

/**
 * Utilisateur admin système par défaut (utilisé lors de l'authentification par mot de passe maître / clé service).
 */
export const SYSTEM_ADMIN_USER: CmsUser = {
  id: 'usr_sys_admin',
  email: 'admin@heldonica.fr',
  role: 'admin',
  name: 'Fondateur (Admin)',
};

/**
 * Vérifie si un utilisateur a la permission d'effectuer une action sur une entité.
 */
export function can(
  user: CmsUser | null | undefined,
  action: CmsAction,
  entity: CmsEntity,
  doc?: Record<string, unknown>
): boolean {
  if (!user) return false;

  // L'administrateur a tous les droits
  if (user.role === 'admin') {
    return true;
  }

  // Le viewer ne peut que lire
  if (user.role === 'viewer') {
    return action === 'read';
  }

  // L'éditeur
  if (user.role === 'editor') {
    // Lecture autorisée partout sauf gestion des profils et audit log
    if (action === 'read') {
      return entity !== 'user_profile';
    }

    // Publication réservée à l'admin
    if (action === 'publish') {
      return false;
    }

    // Suppression réservée à l'admin pour les entités critiques
    if (action === 'delete') {
      return entity === 'media'; // Un éditeur peut nettoyer un média non utilisé, mais pas supprimer un article ou une zone
    }

    // Création & Mise à jour autorisées sur les contenus
    if (action === 'create' || action === 'update') {
      // Les paramètres globaux (settings) sont réservés aux admins
      if (entity === 'settings' || entity === 'user_profile' || entity === 'audit_log') {
        return false;
      }
      return true;
    }

    if (action === 'archive') {
      return entity === 'article';
    }
  }

  return false;
}

/**
 * Vérifie si l'utilisateur a le droit de publier un document en production.
 */
export function canPublish(
  user: CmsUser | null | undefined, 
  entityOrDoc?: CmsEntity | Record<string, unknown>, 
  maybeDoc?: Record<string, unknown>
): boolean {
  if (typeof entityOrDoc === 'string') {
    return can(user, 'publish', entityOrDoc as CmsEntity, maybeDoc);
  }
  return can(user, 'publish', 'article', entityOrDoc as Record<string, unknown> | undefined);
}

/**
 * Vérifie si l'utilisateur a le droit de supprimer un document.
 */
export function canDelete(user: CmsUser | null | undefined, entity: CmsEntity, doc?: Record<string, unknown>): boolean {
  return can(user, 'delete', entity, doc);
}

/**
 * Contrôle au niveau du champ : certains champs sensibles ne peuvent être modifiés que par un admin.
 * (ex: slug d'un article déjà publié, état de maintenance, rôles).
 */
export function canEditField(
  user: CmsUser | null | undefined,
  field: string,
  entity: CmsEntity,
  isAlreadyPublished = false
): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;

  if (user.role === 'editor') {
    // Un éditeur ne peut pas altérer le slug d'un article déjà en ligne (évite les bris de liens SEO)
    if (field === 'slug' && isAlreadyPublished) {
      return false;
    }
    // Champs système protégés
    if (['id', 'created_at', 'role', 'is_active', 'published_at'].includes(field)) {
      return false;
    }
    return true;
  }

  return false;
}

/**
 * Vérifie si l'utilisateur a accès au journal d'audit.
 */
export function canViewAuditLog(user: CmsUser | null | undefined): boolean {
  if (!user) return false;
  return user.role === 'admin' || user.role === 'editor';
}

/**
 * Vérifie si l'utilisateur peut modifier les rôles d'autres utilisateurs.
 */
export function canManageUsers(user: CmsUser | null | undefined): boolean {
  if (!user) return false;
  return user.role === 'admin';
}
