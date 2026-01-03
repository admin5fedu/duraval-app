/**
 * KyThi Permission Guards
 * 
 * Centralized permission checking logic for KyThi module
 * Provides reusable permission guards for components and handlers
 */

import { usePermissions, useHasAdminPermission } from '@lib/hooks/usePermissions';

/**
 * Hook that provides permission guards for KyThi module
 * 
 * @returns Object containing permission check functions
 * 
 * @example
 * ```tsx
 * const guards = useKyThiPermissionGuards();
 * 
 * if (guards.canView()) {
 *   // Show content
 * }
 * 
 * <button onClick={guards.canAdd() ? handleAdd : undefined}>
 *   Thêm kỳ thi
 * </button>
 * ```
 */
export const useKyThiPermissionGuards = () => {
  const perms = usePermissions('chung_ky_thi');
  const hasAdminPermission = useHasAdminPermission('chung_ky_thi');

  return {
    /**
     * Check if user can view kỳ thi
     */
    canView: () => perms.view.length > 0,

    /**
     * Check if user can add new kỳ thi
     */
    canAdd: () => perms.add.length > 0,

    /**
     * Check if user can edit kỳ thi
     */
    canEdit: () => perms.edit.length > 0,

    /**
     * Check if user can delete kỳ thi
     */
    canDelete: () => perms.delete.length > 0,

    /**
     * Check if user has admin permission (can access all data regardless of organizational units)
     */
    canAccessAll: () => hasAdminPermission,

    /**
     * Get raw permissions object for advanced use cases
     */
    permissions: perms,
  };
};
