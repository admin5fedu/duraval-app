/**
 * baiThiHelpers
 * 
 * Utility functions for BaiThi module
 */

import { BaiThiLam, Employee, ChucVu, CapChucDanh } from '@src/types';

export const getBaiThiTabLabel = (tab: 'all' | 'my') => {
  switch (tab) {
    case 'my':
      return 'Của tôi';
    case 'all':
    default:
      return 'Tất cả';
  }
};

export const calculatePercentage = (diemSo: number, tongSoCau: number): number => {
  if (tongSoCau === 0) return 0;
  return (diemSo / tongSoCau) * 100;
};

export const formatDuration = (startTime: string | null, endTime: string | null): string => {
  if (!startTime || !endTime) return 'Không rõ';
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const diffSeconds = Math.round((end - start) / 1000);
  const minutes = Math.floor(diffSeconds / 60);
  const seconds = diffSeconds % 60;
  return `${minutes} phút ${seconds} giây`;
};

export const getBaiThiStatusColor = (status: string): string => {
  switch (status) {
    case 'Đạt':
      return 'success';
    case 'Không đạt':
      return 'danger';
    case 'Đang thi':
      return 'warning';
    case 'Chưa thi':
    default:
      return 'secondary';
  }
};

/**
 * Get cap_bac number from employee's chuc_vu
 */
export const getEmployeeCapBac = (
  employee: Employee | null,
  chucVuList: ChucVu[],
  capChucDanhList: CapChucDanh[]
): number | null => {
  if (!employee || !employee.chuc_vu) return null;
  
  // Find chuc_vu by ten_chuc_vu (chuc_vu is string in Employee)
  const chucVu = chucVuList.find(cv => cv.ten_chuc_vu === employee.chuc_vu);
  if (!chucVu || !chucVu.ma_cap_bac) return null;
  
  // Find cap_bac number from capChucDanh
  const capBac = capChucDanhList.find(cb => cb.ma_cap_bac === chucVu.ma_cap_bac);
  return capBac?.cap_bac ?? null;
};

/**
 * Check if user can view/edit/delete a bai thi based on cap_bac and organizational units
 */
export const canAccessBaiThi = (
  baiThi: BaiThiLam,
  currentUser: Employee | null,
  employeeMap: Map<number, Employee>,
  chucVuList: ChucVu[],
  capChucDanhList: CapChucDanh[],
  hasAdminPermission: boolean
): boolean => {
  if (!currentUser) return false;
  
  // Admin or cap_bac = 1 can access all
  if (hasAdminPermission) return true;
  
  const userCapBac = getEmployeeCapBac(currentUser, chucVuList, capChucDanhList);
  if (userCapBac === 1) return true;
  
  // Get employee who created this bai thi
  const baiThiEmployee = employeeMap.get(baiThi.nhan_vien_id);
  if (!baiThiEmployee) return false;
  
  // cap_bac = 2: can access within same phong_ban
  if (userCapBac === 2) {
    return currentUser.phong_ban === baiThiEmployee.phong_ban;
  }
  
  // cap_bac = 3: can access within same bo_phan
  if (userCapBac === 3) {
    return currentUser.bo_phan === baiThiEmployee.bo_phan;
  }
  
  // cap_bac = 4, 5, 6: can access within same nhom
  if (userCapBac === 4 || userCapBac === 5 || userCapBac === 6) {
    return currentUser.nhom === baiThiEmployee.nhom;
  }
  
  return false;
};

/**
 * Filter bai thi list based on user's permissions
 */
export const filterBaiThiByPermission = (
  baiThiList: BaiThiLam[],
  currentUser: Employee | null,
  enhancedEmployees: Employee[],
  chucVuList: ChucVu[],
  capChucDanhList: CapChucDanh[],
  hasAdminPermission: boolean
): BaiThiLam[] => {
  if (!currentUser) return [];
  
  // Admin or cap_bac = 1 can see all
  if (hasAdminPermission) return baiThiList;
  
  const userCapBac = getEmployeeCapBac(currentUser, chucVuList, capChucDanhList);
  if (userCapBac === 1) return baiThiList;
  
  // Create employee map for quick lookup
  const employeeMap = new Map(enhancedEmployees.map(e => [e.id, e]));
  
  // cap_bac = 2: filter by phong_ban
  if (userCapBac === 2) {
    return baiThiList.filter(bt => {
      const btEmployee = employeeMap.get(bt.nhan_vien_id);
      return btEmployee && btEmployee.phong_ban === currentUser.phong_ban;
    });
  }
  
  // cap_bac = 3: filter by bo_phan
  if (userCapBac === 3) {
    return baiThiList.filter(bt => {
      const btEmployee = employeeMap.get(bt.nhan_vien_id);
      return btEmployee && btEmployee.bo_phan === currentUser.bo_phan;
    });
  }
  
  // cap_bac = 4, 5, 6: filter by nhom
  if (userCapBac === 4 || userCapBac === 5 || userCapBac === 6) {
    return baiThiList.filter(bt => {
      const btEmployee = employeeMap.get(bt.nhan_vien_id);
      return btEmployee && btEmployee.nhom === currentUser.nhom;
    });
  }
  
  // Default: no access
  return [];
};

