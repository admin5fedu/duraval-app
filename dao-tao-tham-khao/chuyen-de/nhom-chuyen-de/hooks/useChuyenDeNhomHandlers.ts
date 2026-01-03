/**
 * useChuyenDeNhomHandlers Hook
 * 
 * Hook for event handlers in ChuyenDeNhom sub-module
 * Uses TanStack Query mutations directly with retry logic and error handling
 */

import { useCallback } from 'react';
import { ChuyenDeNhom } from '@src/types';
import { queryKeys } from '@lib/constants/queryKeys';
import { chuyenDeNhomService } from '../services/chuyenDeNhomService';
import { useAuth } from '@lib/contexts/AuthContext';
import { getMaNhanVien, validateUser } from '@lib/utils/formDataHelpers';
import { useCRUDMutations } from '@lib/hooks/useCRUDMutations';

export interface ChuyenDeNhomHandlers {
  handleSave: (item: Partial<ChuyenDeNhom>) => Promise<ChuyenDeNhom | null>;
  handleDelete: (items: ChuyenDeNhom[]) => Promise<boolean>;
}

export function useChuyenDeNhomHandlers(): ChuyenDeNhomHandlers {
  const { currentUser } = useAuth();
  
  // Use CRUD mutations utility hook
  const { addMutation, updateMutation, deleteMutation } = useCRUDMutations<ChuyenDeNhom, ChuyenDeNhom>({
    createFn: (item) => chuyenDeNhomService.createChuyenDeNhom(item),
    updateFn: (item) => chuyenDeNhomService.updateChuyenDeNhom(item),
    deleteFn: (ids) => chuyenDeNhomService.deleteChuyenDeNhom(ids),
    mainQueryKey: queryKeys.chuyenDeNhom,
    getByIdQueryKey: (id) => queryKeys.chuyenDeNhomById(id),
    getDeleteInvalidateKeys: () => [
      queryKeys.chuyenDe,
      queryKeys.cauHoi,
    ],
    createSuccessMessage: 'Thêm nhóm chuyên đề thành công!',
    updateSuccessMessage: 'Cập nhật nhóm chuyên đề thành công!',
    deleteSuccessMessage: (count) => `Xóa ${count} nhóm chuyên đề thành công!`,
    createErrorMessage: 'Lỗi thêm nhóm chuyên đề',
    updateErrorMessage: 'Lỗi cập nhật nhóm chuyên đề',
    deleteErrorMessage: 'Lỗi xóa nhóm chuyên đề',
  });

  const handleSave = useCallback(async (item: Partial<ChuyenDeNhom>): Promise<ChuyenDeNhom | null> => {
    try {
      if (item.id) {
        return await updateMutation.mutateAsync(item as Partial<ChuyenDeNhom> & { id: number });
      } else {
        // Sử dụng ma_nhan_vien thay vì id
        const maNhanVien = getMaNhanVien(currentUser);
        if (!maNhanVien) {
          validateUser(currentUser, 'thêm nhóm chuyên đề');
          return null;
        }
        return await addMutation.mutateAsync({ ...item, nguoi_tao_id: maNhanVien });
      }
    } catch (error) {
      throw error;
    }
  }, [addMutation, updateMutation, currentUser]);

  const handleDelete = useCallback(async (items: ChuyenDeNhom[]): Promise<boolean> => {
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

