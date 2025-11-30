import type { UserInfo } from 'remult';
import type { UserRole } from '../entities/User';

/**
 * Permission helper functions for role-based access control
 */

/**
 * Check if user has a specific role
 */
export function hasRole(user: UserInfo | undefined, role: UserRole): boolean {
  if (!user || !user.roles || user.roles.length === 0) {
    return false;
  }
  return user.roles.includes(role);
}

/**
 * Check if user is an admin
 */
export function isAdmin(user: UserInfo | undefined): boolean {
  return hasRole(user, 'admin');
}

/**
 * Check if user is a school admin
 */
export function isSchoolAdmin(user: UserInfo | undefined): boolean {
  return hasRole(user, 'school_admin');
}

/**
 * Check if user is a teacher
 */
export function isTeacher(user: UserInfo | undefined): boolean {
  return hasRole(user, 'teacher');
}

/**
 * Check if user is a parent
 */
export function isParent(user: UserInfo | undefined): boolean {
  return hasRole(user, 'parent');
}

/**
 * Check if user is a student
 */
export function isStudent(user: UserInfo | undefined): boolean {
  return hasRole(user, 'student');
}

/**
 * Check if user has admin or school_admin role
 */
export function isAdminOrSchoolAdmin(user: UserInfo | undefined): boolean {
  return isAdmin(user) || isSchoolAdmin(user);
}

/**
 * Check if user can manage content (admin, school_admin, or teacher)
 */
export function canManageContent(user: UserInfo | undefined): boolean {
  return isAdmin(user) || isSchoolAdmin(user) || isTeacher(user);
}

/**
 * Check if user can only view content (parent or student)
 */
export function isReadOnly(user: UserInfo | undefined): boolean {
  return isParent(user) || isStudent(user);
}

/**
 * Check if user owns a resource
 */
export function isOwner(user: UserInfo | undefined, ownerId: string): boolean {
  return user?.id === ownerId;
}

/**
 * Check if user can manage a resource (owns it or is admin/school_admin)
 */
export function canManageResource(user: UserInfo | undefined, ownerId: string): boolean {
  return isAdminOrSchoolAdmin(user) || isOwner(user, ownerId);
}

/**
 * Permission levels for different operations
 */
export const Permissions = {
  /**
   * Only admins can perform this action
   */
  adminOnly: (user: UserInfo | undefined) => isAdmin(user),

  /**
   * Admins and school admins can perform this action
   */
  adminOrSchoolAdmin: (user: UserInfo | undefined) => isAdminOrSchoolAdmin(user),

  /**
   * Content managers (admin, school_admin, teacher) can perform this action
   */
  contentManagers: (user: UserInfo | undefined) => canManageContent(user),

  /**
   * Resource owner or admin/school_admin can perform this action
   */
  ownerOrAdmin: (user: UserInfo | undefined, ownerId: string) =>
    canManageResource(user, ownerId),

  /**
   * Any authenticated user can perform this action
   */
  authenticated: (user: UserInfo | undefined) => !!user,

  /**
   * Anyone (including unauthenticated) can perform this action
   */
  public: () => true,
};
