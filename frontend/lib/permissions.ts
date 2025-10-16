// ============================================
// WellTrack MVP — RBAC Permissions System
// ============================================

import { UserRole, Membership } from '@/types';
import { getItem, queryItems, TABLES } from './db';

// ---------------
// Permission Definitions
// ---------------

export enum Permission {
  // Organization permissions
  ORG_VIEW = 'org:view',
  ORG_EDIT = 'org:edit',
  ORG_DELETE = 'org:delete',
  ORG_MANAGE_MEMBERS = 'org:manage_members',

  // Project permissions
  PROJECT_VIEW = 'project:view',
  PROJECT_CREATE = 'project:create',
  PROJECT_EDIT = 'project:edit',
  PROJECT_DELETE = 'project:delete',

  // Well permissions
  WELL_VIEW = 'well:view',
  WELL_CREATE = 'well:create',
  WELL_EDIT = 'well:edit',
  WELL_DELETE = 'well:delete',

  // Stage permissions
  STAGE_VIEW = 'stage:view',
  STAGE_CREATE = 'stage:create',
  STAGE_EDIT = 'stage:edit',
  STAGE_DELETE = 'stage:delete',

  // Event permissions
  EVENT_VIEW = 'event:view',
  EVENT_CREATE = 'event:create',
  EVENT_EDIT = 'event:edit',
  EVENT_DELETE = 'event:delete',

  // File permissions
  FILE_VIEW = 'file:view',
  FILE_UPLOAD = 'file:upload',
  FILE_DELETE = 'file:delete',
}

// ---------------
// Role-Permission Mapping
// ---------------

const rolePermissions: Record<UserRole, Permission[]> = {
  OWNER: [
    // Full permissions
    Permission.ORG_VIEW,
    Permission.ORG_EDIT,
    Permission.ORG_DELETE,
    Permission.ORG_MANAGE_MEMBERS,
    Permission.PROJECT_VIEW,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_EDIT,
    Permission.PROJECT_DELETE,
    Permission.WELL_VIEW,
    Permission.WELL_CREATE,
    Permission.WELL_EDIT,
    Permission.WELL_DELETE,
    Permission.STAGE_VIEW,
    Permission.STAGE_CREATE,
    Permission.STAGE_EDIT,
    Permission.STAGE_DELETE,
    Permission.EVENT_VIEW,
    Permission.EVENT_CREATE,
    Permission.EVENT_EDIT,
    Permission.EVENT_DELETE,
    Permission.FILE_VIEW,
    Permission.FILE_UPLOAD,
    Permission.FILE_DELETE,
  ],
  ADMIN: [
    // All except org delete
    Permission.ORG_VIEW,
    Permission.ORG_EDIT,
    Permission.ORG_MANAGE_MEMBERS,
    Permission.PROJECT_VIEW,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_EDIT,
    Permission.PROJECT_DELETE,
    Permission.WELL_VIEW,
    Permission.WELL_CREATE,
    Permission.WELL_EDIT,
    Permission.WELL_DELETE,
    Permission.STAGE_VIEW,
    Permission.STAGE_CREATE,
    Permission.STAGE_EDIT,
    Permission.STAGE_DELETE,
    Permission.EVENT_VIEW,
    Permission.EVENT_CREATE,
    Permission.EVENT_EDIT,
    Permission.EVENT_DELETE,
    Permission.FILE_VIEW,
    Permission.FILE_UPLOAD,
    Permission.FILE_DELETE,
  ],
  EDITOR: [
    // Can create and edit, but not delete projects/wells
    Permission.ORG_VIEW,
    Permission.PROJECT_VIEW,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_EDIT,
    Permission.WELL_VIEW,
    Permission.WELL_CREATE,
    Permission.WELL_EDIT,
    Permission.STAGE_VIEW,
    Permission.STAGE_CREATE,
    Permission.STAGE_EDIT,
    Permission.EVENT_VIEW,
    Permission.EVENT_CREATE,
    Permission.EVENT_EDIT,
    Permission.FILE_VIEW,
    Permission.FILE_UPLOAD,
  ],
  VIEWER: [
    // Read-only access
    Permission.ORG_VIEW,
    Permission.PROJECT_VIEW,
    Permission.WELL_VIEW,
    Permission.STAGE_VIEW,
    Permission.EVENT_VIEW,
    Permission.FILE_VIEW,
  ],
};

// ---------------
// Permission Check Functions
// ---------------

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

/**
 * Check if a user has a specific permission in an organization
 */
export async function checkUserPermission(
  userId: string,
  orgId: string,
  permission: Permission
): Promise<boolean> {
  try {
    const membership = await getUserMembership(userId, orgId);
    
    if (!membership || membership.status !== 'ACTIVE') {
      return false;
    }

    return hasPermission(membership.role, permission);
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
}

/**
 * Get user's membership in an organization
 */
export async function getUserMembership(
  userId: string,
  orgId: string
): Promise<Membership | null> {
  try {
    const result = await queryItems<Membership>(
      TABLES.MEMBERSHIPS,
      'OrgMembersIndex',
      '#orgId = :orgId AND #userId = :userId',
      {
        '#orgId': 'orgId',
        '#userId': 'userId',
      },
      {
        ':orgId': orgId,
        ':userId': userId,
      },
      1
    );

    return result.items[0] || null;
  } catch (error) {
    console.error('Error getting user membership:', error);
    return null;
  }
}

/**
 * Get user's role in an organization
 */
export async function getUserRole(
  userId: string,
  orgId: string
): Promise<UserRole | null> {
  const membership = await getUserMembership(userId, orgId);
  return membership?.role || null;
}

/**
 * Check if user is organization owner
 */
export async function isOrgOwner(
  userId: string,
  orgId: string
): Promise<boolean> {
  const role = await getUserRole(userId, orgId);
  return role === 'OWNER';
}

/**
 * Check if user is admin or owner
 */
export async function isOrgAdminOrOwner(
  userId: string,
  orgId: string
): Promise<boolean> {
  const role = await getUserRole(userId, orgId);
  return role === 'OWNER' || role === 'ADMIN';
}

/**
 * Require permission or throw error
 */
export async function requirePermission(
  userId: string,
  orgId: string,
  permission: Permission
): Promise<void> {
  const hasAccess = await checkUserPermission(userId, orgId, permission);
  
  if (!hasAccess) {
    throw new Error(`Permission denied: ${permission}`);
  }
}

/**
 * Get all user's organization memberships
 */
export async function getUserOrganizations(userId: string): Promise<Membership[]> {
  try {
    const result = await queryItems<Membership>(
      TABLES.MEMBERSHIPS,
      'UserOrgsIndex',
      '#userId = :userId',
      {
        '#userId': 'userId',
      },
      {
        ':userId': userId,
      }
    );

    return result.items.filter((m) => m.status === 'ACTIVE');
  } catch (error) {
    console.error('Error getting user organizations:', error);
    return [];
  }
}

// ---------------
// Utility Functions
// ---------------

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return rolePermissions[role] || [];
}

/**
 * Check if role can perform action
 */
export function canPerformAction(role: UserRole, action: string): boolean {
  const permissions = getRolePermissions(role);
  return permissions.some((p) => p.includes(action));
}
