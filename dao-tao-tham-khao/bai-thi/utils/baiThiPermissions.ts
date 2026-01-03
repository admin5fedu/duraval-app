/**
 * BaiThi Permission Guards
 * 
 * Centralized permission checking logic for BaiThi module
 * Provides reusable permission guards for components and handlers
 */

import { usePermissions, useHasAdminPermission } from '@lib/hooks/usePermissions';

/**
 * Hook that provides permission guards for BaiThi module
 * 
 * @returns Object containing permission check functions
 * 
 * @example
 * ```tsx
 * const guards = useBaiThiPermissionGuards();
 * 
 * if (guards.canView()) {
 *   // Show content
 * }
 * 
 * <button onClick={guards.canAdd() ? handleAdd : undefined}>
 *   Thêm bài thi
 * </button>
 * ```
 */
export const useBaiThiPermissionGuards = () => {
  const perms = usePermissions('chung_bai_thi');
  const hasAdminPermission = useHasAdminPermission('chung_bai_thi');

  return {
    /**
     * Check if user can view bài thi
     */
    canView: () => perms.view.length > 0,

    /**
     * Check if user can add new bài thi
     */
    canAdd: () => perms.add.length > 0,

    /**
     * Check if user can edit bài thi
     */
    canEdit: () => perms.edit.length > 0,

    /**
     * Check if user can delete bài thi
     */
    canDelete: () => perms.delete.length > 0,

    /**
     * Check if user has admin permission (can access all data regardless of organizational units)
     * This is used for filtering data based on cap_bac and organizational hierarchy
     */
    canAccessAll: () => hasAdminPermission,

    /**
     * Get raw permissions object for advanced use cases
     */
    permissions: perms,
  };
};
