/**
 * Module Configuration for Kế Hoạch 168
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const keHoach168Config: ModuleConfig = {
  // Basic info
  moduleName: "ke-hoach-168",
  moduleTitle: "Kế Hoạch 168",
  moduleDescription: "Quản lý kế hoạch 168 giờ",
  
  // Routing
  routePath: "/cong-viec/ke-hoach-168",
  parentPath: "/cong-viec",
  
  // Breadcrumb
  breadcrumb: {
    label: "Kế Hoạch 168",
    parentLabel: "Công Việc",
  },
  
  // Database
  tableName: "cong_viec_viec_hang_ngay", // Using same table as viec-hang-ngay
  primaryKey: "id",
  
  // List view
  filterColumns: [
    {
      columnId: "ma_phong",
      title: "Mã phòng",
      options: [], // Will be populated dynamically from data
    },
    {
      columnId: "ma_nhom",
      title: "Mã nhóm",
      options: [], // Will be populated dynamically from data
    },
  ],
  searchFields: ["ma_nhan_vien", "chi_tiet_cong_viec", "ma_phong", "ma_nhom"],
  defaultSorting: [{ id: "ngay_bao_cao", desc: true }],
}

