/**
 * useCauHoiHandlers Hook
 * 
 * Hook for event handlers in CauHoi sub-module
 * Uses TanStack Query mutations directly with retry logic and error handling
 */

import { useCallback } from 'react';
import { CauHoi } from '@src/types';
import { queryKeys } from '@lib/constants/queryKeys';
import { cauHoiService } from '../services/cauHoiService';
import { useAuth } from '@lib/contexts/AuthContext';
import { getMaNhanVien, validateUser } from '@lib/utils/formDataHelpers';
import { useCRUDMutations } from '@lib/hooks/useCRUDMutations';

export interface CauHoiHandlers {
  handleSave: (item: Partial<CauHoi>) => Promise<CauHoi | null>;
  handleDelete: (items: CauHoi[]) => Promise<boolean>;
}

export function useCauHoiHandlers(): CauHoiHandlers {
  const { currentUser } = useAuth();
  
  // Use CRUD mutations utility hook
  const { addMutation, updateMutation, deleteMutation } = useCRUDMutations<CauHoi, CauHoi>({
    createFn: (item) => cauHoiService.createCauHoi(item),
    updateFn: (item) => cauHoiService.updateCauHoi(item),
    deleteFn: (ids) => cauHoiService.deleteCauHoi(ids),
    mainQueryKey: queryKeys.cauHoi,
    getByIdQueryKey: (id) => queryKeys.cauHoiById(id),
    getInvalidateKeys: (data) => [
      queryKeys.cauHoiByChuyenDe(data.chuyen_de_id),
    ],
    createSuccessMessage: 'Thêm câu hỏi thành công!',
    updateSuccessMessage: 'Cập nhật câu hỏi thành công!',
    deleteSuccessMessage: (count) => `Xóa ${count} câu hỏi thành công!`,
    createErrorMessage: 'Lỗi thêm câu hỏi',
    updateErrorMessage: 'Lỗi cập nhật câu hỏi',
    deleteErrorMessage: 'Lỗi xóa câu hỏi',
  });

  const handleSave = useCallback(async (item: Partial<CauHoi>): Promise<CauHoi | null> => {
    try {
      if (item.id) {
        return await updateMutation.mutateAsync(item as Partial<CauHoi> & { id: number });
      } else {
        // Sử dụng ma_nhan_vien thay vì id
        const maNhanVien = getMaNhanVien(currentUser);
        if (!maNhanVien) {
          validateUser(currentUser, 'thêm câu hỏi');
          return null;
        }
        return await addMutation.mutateAsync({ ...item, nguoi_tao_id: maNhanVien });
      }
    } catch (error) {
      throw error;
    }
  }, [addMutation, updateMutation, currentUser]);

  const handleDelete = useCallback(async (items: CauHoi[]): Promise<boolean> => {
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

