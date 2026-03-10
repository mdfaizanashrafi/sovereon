/**
 * ============================================================================
 * ROLE-BASED ACCESS CONTROL (RBAC)
 * ============================================================================
 * Granular permission system for authorization
 */

export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  EDITOR = 'editor',
  USER = 'user',
  GUEST = 'guest',
}

export enum Permission {
  // Content permissions
  CONTENT_READ = 'content:read',
  CONTENT_CREATE = 'content:create',
  CONTENT_UPDATE = 'content:update',
  CONTENT_DELETE = 'content:delete',
  CONTENT_PUBLISH = 'content:publish',
  
  // User permissions
  USERS_READ = 'users:read',
  USERS_CREATE = 'users:create',
  USERS_UPDATE = 'users:update',
  USERS_DELETE = 'users:delete',
  
  // Settings permissions
  SETTINGS_READ = 'settings:read',
  SETTINGS_UPDATE = 'settings:update',
  
  // System permissions
  SYSTEM_LOGS = 'system:logs',
  SYSTEM_CONFIG = 'system:config',
}

// Role to permissions mapping
const rolePermissions: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: Object.values(Permission),
  
  [Role.ADMIN]: [
    Permission.CONTENT_READ,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_UPDATE,
    Permission.CONTENT_DELETE,
    Permission.CONTENT_PUBLISH,
    Permission.USERS_READ,
    Permission.USERS_CREATE,
    Permission.USERS_UPDATE,
    Permission.SETTINGS_READ,
    Permission.SETTINGS_UPDATE,
    Permission.SYSTEM_LOGS,
  ],
  
  [Role.EDITOR]: [
    Permission.CONTENT_READ,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_UPDATE,
    Permission.CONTENT_PUBLISH,
  ],
  
  [Role.USER]: [
    Permission.CONTENT_READ,
  ],
  
  [Role.GUEST]: [
    Permission.CONTENT_READ,
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

export function getRolePermissions(role: Role): Permission[] {
  return rolePermissions[role] ?? [];
}

// Permission checker middleware factory
export function requirePermission(permission: Permission) {
  return (req: any, res: any, next: any) => {
    const userRole = req.user?.role as Role;
    
    if (!userRole) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }
    
    if (!hasPermission(userRole, permission)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
      });
    }
    
    next();
  };
}

// Role hierarchy (higher = more permissions)
const roleHierarchy: Record<Role, number> = {
  [Role.SUPER_ADMIN]: 100,
  [Role.ADMIN]: 80,
  [Role.EDITOR]: 60,
  [Role.USER]: 40,
  [Role.GUEST]: 20,
};

export function hasHigherOrEqualRole(userRole: Role, requiredRole: Role): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
