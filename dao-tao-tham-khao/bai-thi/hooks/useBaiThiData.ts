/**
 * useBaiThiData Hook
 * 
 * Hook for data fetching and management for BaiThi module
 * Uses TanStack Query directly for data fetching
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@lib/contexts/AuthContext';
import { queryKeys } from '@lib/constants/queryKeys';
import { QUERY_CONFIG } from '@lib/constants/queryConfig';
import { baiThiService } from '../services/baiThiService';
import { type BaiThiFilters, type BaiThiLamEnhanced } from '@components/shared/hooks/useBaiThiTableFilter';
import { useKyThi } from '@lib/hooks/queries/useTraining';
import { useCauHoi } from '@lib/hooks/queries/useTraining';
import { getMaNhanVien } from '@lib/utils/formDataHelpers';
import type { KyThi, CauHoi } from '@src/types';
import { type UseBaiThiDataOptions, type BaiThiData } from '@src/types';
import { filterBaiThiByPermission } from '../utils/baiThiHelpers';
import { useBaiThiPermissionGuards } from '../utils/baiThiPermissions';

export function useBaiThiData({
  activeTab,
  filters,
}: UseBaiThiDataOptions): BaiThiData {
  // Get current user from Auth context (shared data)
  const { enhancedEmployees, currentUser, chucVu, capChucDanh } = useAuth();
  const guards = useBaiThiPermissionGuards();
  
  // Fetch data using TanStack Query directly
  const { data: baiThiLamList = [], isLoading: isLoadingBaiThi } = useQuery({
    queryKey: queryKeys.baiThiLam,
    queryFn: baiThiService.fetchBaiThiLam,
    ...QUERY_CONFIG.TRAINING,
  });

  const { data: kyThiList = [], isLoading: isLoadingKyThi } = useKyThi();
  const { data: questionList = [], isLoading: isLoadingCauHoi } = useCauHoi();

  const isLoading = isLoadingBaiThi || isLoadingKyThi || isLoadingCauHoi;

  // Create maps for quick lookups
  const employeeMap = useMemo(() => {
    return new Map(enhancedEmployees.map(e => [e.id, e.ho_ten]));
  }, [enhancedEmployees]);

  const kyThiMap = useMemo(() => {
    return new Map(kyThiList.map((k: KyThi) => [k.id, k.ten_ky_thi]));
  }, [kyThiList]);

  // Filter by active tab
  const myBaiThiList = useMemo(() => {
    const maNhanVien = getMaNhanVien(currentUser);
    if (!maNhanVien) return [];
    return baiThiLamList.filter(item => item.nhan_vien_id === maNhanVien);
  }, [baiThiLamList, currentUser]);

  // Apply permission filter for "all" tab
  const allBaiThiListFiltered = useMemo(() => {
    if (activeTab === 'my') return [];
    return filterBaiThiByPermission(
      baiThiLamList,
      currentUser,
      enhancedEmployees,
      chucVu,
      capChucDanh,
      guards.canAccessAll()
    );
  }, [baiThiLamList, currentUser, enhancedEmployees, chucVu, capChucDanh, guards, activeTab]);

  const listToDisplay = useMemo(() => {
    return activeTab === 'my' ? myBaiThiList : allBaiThiListFiltered;
  }, [activeTab, myBaiThiList, allBaiThiListFiltered]);

  // Enhance items with names
  const enhancedItems = useMemo(() => {
    return listToDisplay.map(item => ({
      ...item,
      nhanVienName: employeeMap.get(item.nhan_vien_id) || 'Không rõ',
      kyThiName: kyThiMap.get(item.ky_thi_id) || 'Không rõ',
    }));
  }, [listToDisplay, employeeMap, kyThiMap]);

  // Apply filters
  const filteredItems = useMemo(() => {
    let filtered = [...enhancedItems];
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.nhanVienName.toLowerCase().includes(searchTerm) ||
        item.kyThiName.toLowerCase().includes(searchTerm) ||
        item.trang_thai.toLowerCase().includes(searchTerm) ||
        String(item.diem_so).includes(searchTerm)
      );
    }

    if (filters.ky_thi_id && filters.ky_thi_id !== 'All') {
      filtered = filtered.filter(item => String(item.ky_thi_id) === filters.ky_thi_id);
    }
    
    if (filters.trang_thai && filters.trang_thai !== 'All') {
      filtered = filtered.filter(item => item.trang_thai === filters.trang_thai);
    }
    
    return filtered;
  }, [enhancedItems, filters]);

  return {
    baiThiLamList,
    enhancedItems,
    filteredItems,
    employeeMap,
    kyThiMap,
    myBaiThiList,
    isLoading,
    kyThiList,
    questionList,
  };
}

