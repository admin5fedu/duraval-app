/**
 * useChuyenDeHandlers Hook
 * 
 * Hook for event handlers in ChuyenDe sub-module
 * Uses TanStack Query mutations directly with retry logic and error handling
 */

import { useCallback } from 'react';
import { ChuyenDe } from '@src/types';
import { queryKeys } from '@lib/constants/queryKeys';
import { chuyenDeService } from '../services/chuyenDeService';
import { useAuth } from '@lib/contexts/AuthContext';
import { getMaNhanVien, validateUser } from '@lib/utils/formDataHelpers';
import { useCRUDMutations } from '@lib/hooks/useCRUDMutations';

export interface ChuyenDeHandlers {
  handleSave: (item: Partial<ChuyenDe>) => Promise<ChuyenDe | null>;
  handleDelete: (items: ChuyenDe[]) => Promise<boolean>;
}

export function useChuyenDeHandlers(): ChuyenDeHandlers {
  const { currentUser } = useAuth();
  
  // Use CRUD mutations utility hook
  const { addMutation, updateMutation, deleteMutation } = useCRUDMutations<ChuyenDe, ChuyenDe>({
    createFn: (item) => chuyenDeService.createChuyenDe(item),
    updateFn: (item) => chuyenDeService.updateChuyenDe(item),
    deleteFn: (ids) => chuyenDeService.deleteChuyenDe(ids),
    mainQueryKey: queryKeys.chuyenDe,
    getByIdQueryKey: (id) => queryKeys.chuyenDeById(id),
    getInvalidateKeys: (data) => [
      queryKeys.chuyenDeByNhom(data.nhom_id),
    ],
    getDeleteInvalidateKeys: () => [
      queryKeys.cauHoi,
    ],
    createSuccessMessage: 'Thêm chuyên đề thành công!',
    updateSuccessMessage: 'Cập nhật chuyên đề thành công!',
    deleteSuccessMessage: (count) => `Xóa ${count} chuyên đề thành công!`,
    createErrorMessage: 'Lỗi thêm chuyên đề',
    updateErrorMessage: 'Lỗi cập nhật chuyên đề',
    deleteErrorMessage: 'Lỗi xóa chuyên đề',
  });

  const handleSave = useCallback(async (item: Partial<ChuyenDe>): Promise<ChuyenDe | null> => {
    try {
      if (item.id) {
        return await updateMutation.mutateAsync(item as Partial<ChuyenDe> & { id: number });
      } else {
        // Sử dụng ma_nhan_vien thay vì id
        const maNhanVien = getMaNhanVien(currentUser);
        if (!maNhanVien) {
          validateUser(currentUser, 'thêm chuyên đề');
          return null;
        }
        return await addMutation.mutateAsync({ ...item, nguoi_tao_id: maNhanVien });
      }
    } catch (error) {
      throw error;
    }
  }, [addMutation, updateMutation, currentUser]);

  const handleDelete = useCallback(async (items: ChuyenDe[]): Promise<boolean> => {
    try {
      const ids = items.map(item => item.id);
      await deleteMutation.mutateAsync(ids);
      return true;
    } catch (error) {
      throw error;
    }
  }, [deleteMutation]);

  return {
    handleSave,
    handleDelete,
  };
}

