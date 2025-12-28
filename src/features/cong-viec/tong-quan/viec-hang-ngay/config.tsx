/**
 * Module Configuration for Việc Hàng Ngày
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const viecHangNgayConfig: ModuleConfig = {
  // Basic info
  moduleName: "viec-hang-ngay",
  moduleTitle: "Việc Hàng Ngày",
  moduleDescription: "Theo dõi và quản lý các công việc hàng ngày, nhiệm vụ và tiến độ",
  
  // Routing
  routePath: "/cong-viec/viec-hang-ngay",
  parentPath: "/cong-viec",
  
  // Breadcrumb
  breadcrumb: {
    label: "Việc Hàng Ngày",
    parentLabel: "Công Việc",
  },
  
  // Database
  tableName: "cong_viec_viec_hang_ngay",
  primaryKey: "id",
  
  // List view
  filterColumns: [
    {
      columnId: "ma_nhan_vien",
      title: "Nhân viên",
      options: [], // Will be populated dynamically from employees
    },
    {
      columnId: "ngay_bao_cao",
      title: "Ngày báo cáo",
      options: [], // Will be populated dynamically from data
    },
    {
      columnId: "phong_ban_id",
      title: "Phòng Ban",
      options: [], // Will be populated dynamically from phongBans
    },
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

