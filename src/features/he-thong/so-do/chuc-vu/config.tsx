/**
 * Module Configuration for Chức Vụ
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const chucVuConfig: ModuleConfig = {
  // Basic info
  moduleName: "chuc-vu",
  moduleTitle: "Chức Vụ",
  moduleDescription: "Quản lý thông tin chức vụ",

  // Routing
  routePath: "/he-thong/chuc-vu",
  parentPath: "/he-thong",

  // Breadcrumb
  breadcrumb: {
    label: "Chức Vụ",
    parentLabel: "Hệ Thống",
  },

  // Database
  tableName: "var_chuc_vu",
  primaryKey: "id",

  // List view
  filterColumns: [
    {
      columnId: "ma_phong_ban",
      title: "Phòng Ban",
      options: [], // Will be populated dynamically from data
    },
    {
      columnId: "cap_bac",
      title: "Cấp Bậc",
      options: [], // Will be populated dynamically from data
    },
    {
      columnId: "ngach_luong",
      title: "Ngạch Lương",
      options: [], // Will be populated dynamically from data
    },
    {
      columnId: "muc_dong_bao_hiem",
      title: "Mức Đóng Bảo Hiểm",
      options: [], // Will be populated dynamically from data
    },
    {
      columnId: "so_ngay_nghi_thu_7",
      title: "Số Ngày Nghỉ T7",
      options: [], // Will be populated dynamically from data
    },
  ],
  searchFields: ["ma_chuc_vu", "ten_chuc_vu", "cap_bac", "ten_cap_bac", "ma_phong_ban"],
  defaultSorting: [{ id: "tg_tao", desc: true }],
}

