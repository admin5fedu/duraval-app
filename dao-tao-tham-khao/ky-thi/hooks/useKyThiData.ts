/**
 * useKyThiData Hook
 * 
 * Hook for data fetching and management for KyThi module
 * Uses TanStack Query directly for data fetching
 */

import { useMemo } from 'react';
import { useAuth } from '@lib/contexts/AuthContext';
import { useKyThi } from '@lib/hooks/queries/useTraining';
import { useBaiThiLam } from '@lib/hooks/queries/useTraining';
import { getMaNhanVien } from '@lib/utils/formDataHelpers';
import { type KyThi, type BaiThiLam } from '@src/types';

export interface UseKyThiDataOptions {
  activeTab: 'all' | 'my';
}

export interface KyThiData {
  kyThiList: KyThi[];
  baiThiLamList: BaiThiLam[];
  employeeMap: Map<number, string>;
  enhancedItems: (KyThi & { trang_thai_tham_gia: string })[];
  getMyStatus: (kyThi: KyThi) => string;
  filteredItems: (KyThi & { trang_thai_tham_gia: string })[];
  isLoading: boolean;
}

export function useKyThiData(options: UseKyThiDataOptions): KyThiData {
  const { activeTab } = options;
  const { enhancedEmployees, currentUser } = useAuth();

  // Fetch data using TanStack Query directly
  const { data: kyThiList = [], isLoading: isLoadingKyThi } = useKyThi();
  const { data: baiThiLamList = [], isLoading: isLoadingBaiThi } = useBaiThiLam();

  const isLoading = isLoadingKyThi || isLoadingBaiThi;

  const employeeMap = useMemo(() => {
    return new Map(enhancedEmployees.map(e => [e.id, e.ho_ten]));
  }, [enhancedEmployees]);

  const getMyStatus = useMemo(() => {
    return (kyThi: KyThi): string => {
      const maNhanVien = getMaNhanVien(currentUser);
      if (!maNhanVien) return '';

      // Find current user's employee data to get ma_chuc_vu
      const currentEmployee = enhancedEmployees.find(e => e.ma_nhan_vien === maNhanVien || e.id === maNhanVien);
      if (!currentEmployee) return '';

      // Check if user's ma_chuc_vu is in kyThi's chuc_vu_ids (chuc_vu_ids lưu ma_chuc_vu từ var_chuc_vu)
      const maChucVu = currentEmployee.chuc_vu?.ma_chuc_vu || (currentEmployee as any).ma_chuc_vu;
      const isEligible = maChucVu 
        ? kyThi.chuc_vu_ids.includes(maChucVu)
        : false;

      const myAttempts = baiThiLamList.filter(
        attempt => attempt.ky_thi_id === kyThi.id && attempt.nhan_vien_id === maNhanVien
      );
      const unfinishedAttempt = myAttempts.find(a => a.trang_thai === 'Chưa thi' || a.trang_thai === 'Đang thi');
      const finishedAttempts = myAttempts.filter(a => a.trang_thai === 'Đạt' || a.trang_thai === 'Không đạt');

      if (unfinishedAttempt) {
        return unfinishedAttempt.trang_thai;
      }

      if (finishedAttempts.length > 0) {
        if (finishedAttempts.some(a => a.trang_thai === 'Đạt')) {
          return 'Đã thi đạt';
        }
        return 'Chưa đạt';
      }

      if (!isEligible) {
        return "Không liên quan";
      }

      return "Chưa thi";
    };
  }, [baiThiLamList, currentUser, enhancedEmployees]);

  const enhancedItems = useMemo(() => {
    return kyThiList.map(item => ({
      ...item,
      trang_thai_tham_gia: getMyStatus(item),
    }));
  }, [kyThiList, getMyStatus]);

  // Filter items by active tab
  const filteredItems = useMemo(() => {
    let items = enhancedItems;
    if (activeTab === 'my') {
      items = items.filter(item => getMyStatus(item) !== 'Không liên quan');
    }
    return items;
  }, [enhancedItems, getMyStatus, activeTab]);

  return {
    kyThiList,
    baiThiLamList,
    employeeMap,
    enhancedItems,
    getMyStatus,
    filteredItems,
    isLoading,
  };
}

