/**
 * ============================================================================
 * RBAC TESTS
 * ============================================================================
 */

import { describe, it, expect } from 'vitest';
import { Role, Permission, hasPermission, hasAnyPermission, hasAllPermissions, getRolePermissions, hasHigherOrEqualRole } from '../rbac';

describe('RBAC', () => {
  describe('hasPermission', () => {
    it('grants super_admin all permissions', () => {
      expect(hasPermission(Role.SUPER_ADMIN, Permission.CONTENT_DELETE)).toBe(true);
      expect(hasPermission(Role.SUPER_ADMIN, Permission.SYSTEM_CONFIG)).toBe(true);
    });

    it('grants admin content permissions', () => {
      expect(hasPermission(Role.ADMIN, Permission.CONTENT_CREATE)).toBe(true);
      expect(hasPermission(Role.ADMIN, Permission.CONTENT_DELETE)).toBe(true);
    });

    it('denies admin system config', () => {
      expect(hasPermission(Role.ADMIN, Permission.SYSTEM_CONFIG)).toBe(false);
    });

    it('grants editor content permissions only', () => {
      expect(hasPermission(Role.EDITOR, Permission.CONTENT_CREATE)).toBe(true);
      expect(hasPermission(Role.EDITOR, Permission.CONTENT_DELETE)).toBe(false);
      expect(hasPermission(Role.EDITOR, Permission.USERS_READ)).toBe(false);
    });

    it('denies guest content creation', () => {
      expect(hasPermission(Role.GUEST, Permission.CONTENT_CREATE)).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('returns true if any permission is granted', () => {
      expect(hasAnyPermission(Role.EDITOR, [Permission.CONTENT_READ, Permission.USERS_READ])).toBe(true);
    });

    it('returns false if no permissions are granted', () => {
      expect(hasAnyPermission(Role.GUEST, [Permission.CONTENT_CREATE, Permission.USERS_DELETE])).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('returns true if all permissions are granted', () => {
      expect(hasAllPermissions(Role.SUPER_ADMIN, [Permission.CONTENT_CREATE, Permission.USERS_DELETE])).toBe(true);
    });

    it('returns false if any permission is missing', () => {
      expect(hasAllPermissions(Role.EDITOR, [Permission.CONTENT_CREATE, Permission.USERS_READ])).toBe(false);
    });
  });

  describe('getRolePermissions', () => {
    it('returns all permissions for super_admin', () => {
      const perms = getRolePermissions(Role.SUPER_ADMIN);
      expect(perms.length).toBe(Object.values(Permission).length);
    });

    it('returns limited permissions for user', () => {
      const perms = getRolePermissions(Role.USER);
      expect(perms).toContain(Permission.CONTENT_READ);
      expect(perms).not.toContain(Permission.CONTENT_CREATE);
    });
  });

  describe('hasHigherOrEqualRole', () => {
    it('super_admin > admin', () => {
      expect(hasHigherOrEqualRole(Role.SUPER_ADMIN, Role.ADMIN)).toBe(true);
    });

    it('admin > editor', () => {
      expect(hasHigherOrEqualRole(Role.ADMIN, Role.EDITOR)).toBe(true);
    });

    it('editor !> admin', () => {
      expect(hasHigherOrEqualRole(Role.EDITOR, Role.ADMIN)).toBe(false);
    });

    it('admin >= admin', () => {
      expect(hasHigherOrEqualRole(Role.ADMIN, Role.ADMIN)).toBe(true);
    });
  });
});
