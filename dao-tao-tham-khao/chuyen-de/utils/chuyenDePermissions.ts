/**
 * ChuyenDe Permission Guards
 * 
 * Centralized permission checking logic for ChuyenDe module
 * Provides reusable permission guards for components and handlers
 * 
 * Module includes:
 * - Nhóm chuyên đề (nhom-chuyen-de): uses 'chung_chuyen_de'
 * - Chuyên đề (chuyen-de): uses 'chung_chuyen_de'
 * - Câu hỏi (cau-hoi): uses 'chung_danh_sach_cau_hoi'
 */

import { usePermissions, useHasAdminPermission } from '@lib/hooks/usePermissions';

/**
 * Hook that provides permission guards for Nhóm chuyên đề and Chuyên đề
 * Both sub-modules use the same permission key: 'chung_chuyen_de'
 * 
 * @returns Object containing permission check functions
 * 
 * @example
 * ```tsx
 * const guards = useChuyenDePermissionGuards();
 * 
 * if (guards.canView()) {
 *   // Show content
 * }
 * 
 * <button onClick={guards.canAdd() ? handleAdd : undefined}>
 *   Thêm chuyên đề
 * </button>
 * ```
 */
export const useChuyenDePermissionGuards = () => {
  const perms = usePermissions('chung_chuyen_de');
  const hasAdminPermission = useHasAdminPermission('chung_chuyen_de');

  return {
    /**
     * Check if user can view nhóm chuyên đề / chuyên đề
     */
    canView: () => perms.view.length > 0,

    /**
     * Check if user can add new nhóm chuyên đề / chuyên đề
     */
    canAdd: () => perms.add.length > 0,

    /**
     * Check if user can edit nhóm chuyên đề / chuyên đề
     */
    canEdit: () => perms.edit.length > 0,

    /**
     * Check if user can delete nhóm chuyên đề / chuyên đề
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

/**
 * Hook that provides permission guards for Câu hỏi
 * Uses permission key: 'chung_danh_sach_cau_hoi'
 * 
 * @returns Object containing permission check functions
 * 
 * @example
 * ```tsx
 * const guards = useCauHoiPermissionGuards();
 * 
 * if (guards.canView()) {
 *   // Show content
 * }
 * 
 * <button onClick={guards.canAdd() ? handleAdd : undefined}>
 *   Thêm câu hỏi
 * </button>
 * ```
 */
export const useCauHoiPermissionGuards = () => {
  const perms = usePermissions('chung_danh_sach_cau_hoi');
  const hasAdminPermission = useHasAdminPermission('chung_danh_sach_cau_hoi');

  return {
    /**
     * Check if user can view câu hỏi
     */
    canView: () => perms.view.length > 0,

    /**
     * Check if user can add new câu hỏi
     */
    canAdd: () => perms.add.length > 0,

    /**
     * Check if user can edit câu hỏi
     */
    canEdit: () => perms.edit.length > 0,

    /**
     * Check if user can delete câu hỏi
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
