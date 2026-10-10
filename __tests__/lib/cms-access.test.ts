import { describe, it, expect } from 'vitest';
import {
  can,
  canPublish,
  canDelete,
  canEditField,
  canViewAuditLog,
  canManageUsers,
  SYSTEM_ADMIN_USER,
  type CmsUser,
} from '@/lib/cms-access';

describe('CMS Access Control (Payload-style can functions)', () => {
  const adminUser: CmsUser = {
    id: 'u1',
    email: 'admin@heldonica.fr',
    role: 'admin',
    name: 'Admin Fondateur',
  };

  const editorUser: CmsUser = {
    id: 'u2',
    email: 'editeur@heldonica.fr',
    role: 'editor',
    name: 'Rédacteur Voyage',
  };

  const viewerUser: CmsUser = {
    id: 'u3',
    email: 'invite@heldonica.fr',
    role: 'viewer',
    name: 'Invité Lecture Seule',
  };

  describe('Rôle Admin', () => {
    it('permet toutes les actions sur toutes les entités', () => {
      expect(can(adminUser, 'create', 'article')).toBe(true);
      expect(can(adminUser, 'update', 'article')).toBe(true);
      expect(can(adminUser, 'publish', 'article')).toBe(true);
      expect(can(adminUser, 'delete', 'article')).toBe(true);
      expect(can(adminUser, 'update', 'settings')).toBe(true);
      expect(can(adminUser, 'update', 'user_profile')).toBe(true);
    });

    it('permet la publication directe', () => {
      expect(canPublish(adminUser)).toBe(true);
    });

    it('permet la suppression d articles et de médias', () => {
      expect(canDelete(adminUser, 'article')).toBe(true);
      expect(canDelete(adminUser, 'media')).toBe(true);
    });

    it('permet d éditer tous les champs même protégés', () => {
      expect(canEditField(adminUser, 'slug', 'article', true)).toBe(true);
      expect(canEditField(adminUser, 'role', 'user_profile')).toBe(true);
    });

    it('permet de gérer les utilisateurs et voir l audit', () => {
      expect(canManageUsers(adminUser)).toBe(true);
      expect(canViewAuditLog(adminUser)).toBe(true);
    });
  });

  describe('Rôle Editor', () => {
    it('permet la création et la modification de contenu', () => {
      expect(can(editorUser, 'create', 'article')).toBe(true);
      expect(can(editorUser, 'update', 'article')).toBe(true);
      expect(can(editorUser, 'create', 'block')).toBe(true);
    });

    it('interdit la publication directe en production (seul admin)', () => {
      expect(can(editorUser, 'publish', 'article')).toBe(false);
      expect(canPublish(editorUser)).toBe(false);
    });

    it('interdit la suppression d articles mais autorise le nettoyage de médias', () => {
      expect(canDelete(editorUser, 'article')).toBe(false);
      expect(canDelete(editorUser, 'media')).toBe(true);
    });

    it('interdit la modification des paramètres système et profils', () => {
      expect(can(editorUser, 'update', 'settings')).toBe(false);
      expect(can(editorUser, 'update', 'user_profile')).toBe(false);
    });

    it('interdit de changer le slug d un article déjà en ligne', () => {
      expect(canEditField(editorUser, 'slug', 'article', true)).toBe(false);
      expect(canEditField(editorUser, 'slug', 'article', false)).toBe(true);
    });

    it('interdit de modifier les champs système protégés', () => {
      expect(canEditField(editorUser, 'id', 'article')).toBe(false);
      expect(canEditField(editorUser, 'role', 'article')).toBe(false);
    });

    it('peut consulter le journal d audit mais pas gérer les utilisateurs', () => {
      expect(canViewAuditLog(editorUser)).toBe(true);
      expect(canManageUsers(editorUser)).toBe(false);
    });
  });

  describe('Rôle Viewer', () => {
    it('autorise uniquement la lecture', () => {
      expect(can(viewerUser, 'read', 'article')).toBe(true);
      expect(can(viewerUser, 'create', 'article')).toBe(false);
      expect(can(viewerUser, 'update', 'article')).toBe(false);
      expect(can(viewerUser, 'delete', 'article')).toBe(false);
      expect(can(viewerUser, 'publish', 'article')).toBe(false);
    });
  });

  describe('Utilisateur anonyme ou non connecté', () => {
    it('refuse tout accès', () => {
      expect(can(null, 'read', 'article')).toBe(false);
      expect(can(undefined, 'update', 'article')).toBe(false);
      expect(canPublish(null)).toBe(false);
      expect(canDelete(undefined, 'article')).toBe(false);
      expect(canEditField(null, 'title', 'article')).toBe(false);
    });
  });

  describe('SYSTEM_ADMIN_USER', () => {
    it('dispose des pleins pouvoirs administrateur', () => {
      expect(SYSTEM_ADMIN_USER.role).toBe('admin');
      expect(canPublish(SYSTEM_ADMIN_USER)).toBe(true);
    });
  });
});
