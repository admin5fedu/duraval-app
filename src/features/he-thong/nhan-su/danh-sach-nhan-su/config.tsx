/**
 * Module Configuration for Danh Sách Nhân Sự
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const nhanSuConfig: ModuleConfig = {
  // Basic info
  moduleName: "danh-sach-nhan-su",
  moduleTitle: "Danh Sách Nhân Sự",
  moduleDescription: "Quản lý hồ sơ và tài khoản nhân viên",
  
  // Routing
  routePath: "/he-thong/danh-sach-nhan-su",
  parentPath: "/he-thong",
  // routePattern removed - using explicit routes instead of splat pattern
  
  // Breadcrumb
  breadcrumb: {
    label: "Danh Sách Nhân Sự",
    parentLabel: "Hệ Thống",
  },
  
  // Database
  tableName: "var_nhan_su",
  primaryKey: "ma_nhan_vien",
  
  // List view
  filterColumns: [
    {
      columnId: "tinh_trang",
      title: "Tình Trạng",
      options: [
        { label: "Thử việc", value: "Thử việc" },
        { label: "Chính thức", value: "Chính thức" },
        { label: "Nghỉ việc", value: "Nghỉ việc" },
        { label: "Tạm nghỉ", value: "Tạm nghỉ" },
      ],
    },
    {
      columnId: "phong_ban",
      title: "Phòng Ban",
      options: [], // Will be populated dynamically
    },
  ],
  searchFields: ["ho_ten", "email_cong_ty", "email_ca_nhan", "so_dien_thoai", "ma_nhan_vien"],
  defaultSorting: [{ id: "ma_nhan_vien", desc: true }],
}

