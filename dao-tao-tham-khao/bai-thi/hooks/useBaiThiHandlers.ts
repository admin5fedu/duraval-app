/**
 * useBaiThiHandlers Hook
 * 
 * Hook for event handlers in BaiThi module
 * Uses useCRUDMutations utility hook for consistent error handling and retry logic
 */

import { useCallback } from 'react';
import { queryKeys } from '@lib/constants/queryKeys';
import { baiThiService } from '../services/baiThiService';
import { type BaiThiLam, type DanhGia } from '@src/types';
import { type BaiThiHandlers } from '@src/types';
import { useCRUDMutations } from '@lib/hooks/useCRUDMutations';

export function useBaiThiHandlers(): BaiThiHandlers {
  // Use CRUD mutations utility hook
  const { addMutation, updateMutation, deleteMutation } = useCRUDMutations<BaiThiLam, BaiThiLam>({
    createFn: (item) => baiThiService.createBaiThiLam(item),
    updateFn: (item) => baiThiService.updateBaiThiLam(item),
    deleteFn: (ids) => baiThiService.deleteBaiThiLam(ids),
    mainQueryKey: queryKeys.baiThiLam,
    getByIdQueryKey: (id) => queryKeys.baiThiLamById(id),
    getInvalidateKeys: (data) => [
      queryKeys.baiThiLamByKyThi(data.ky_thi_id),
      queryKeys.baiThiLamByEmployee(data.nhan_vien_id),
      queryKeys.baiThiLamByTrangThai(data.trang_thai),
    ],
    createSuccessMessage: 'Thêm bài thi thành công!',
    updateSuccessMessage: 'Cập nhật bài thi thành công!',
    deleteSuccessMessage: (count) => `Xóa ${count} bài thi thành công!`,
    createErrorMessage: 'Lỗi thêm bài thi',
    updateErrorMessage: 'Lỗi cập nhật bài thi',
    deleteErrorMessage: 'Lỗi xóa bài thi',
  });

  const handleSave = useCallback(async (item: Partial<BaiThiLam>): Promise<BaiThiLam | null> => {
    try {
      if (item.id) {
        return await updateMutation.mutateAsync(item as Partial<BaiThiLam> & { id: number });
      } else {
        return await addMutation.mutateAsync(item);
      }
    } catch (error) {
      throw error;
    }
  }, [addMutation, updateMutation]);

  const handleDelete = useCallback(async (items: BaiThiLam[]): Promise<boolean> => {
    try {
      const ids = items.map(item => item.id);
      await deleteMutation.mutateAsync(ids);
      return true;
    } catch (error) {
      throw error;
    }
  }, [deleteMutation]);

  const handleSaveDanhGia = useCallback(async (
    baiThiId: number,
    danhGia: DanhGia | null
  ): Promise<BaiThiLam | null> => {
    try {
      return await updateMutation.mutateAsync({ 
        id: baiThiId, 
        danh_gia: danhGia 
      } as Partial<BaiThiLam> & { id: number });
    } catch (error) {
      throw error;
    }
  }, [updateMutation]);

  return {
    handleSave,
    handleDelete,
    handleSaveDanhGia,
  };
}

