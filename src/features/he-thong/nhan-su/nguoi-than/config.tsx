/**
 * Module Configuration for Người thân
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const nguoiThanConfig: ModuleConfig = {
  // Basic info
  moduleName: "nguoi-than",
  moduleTitle: "Người thân",
  moduleDescription: "Quản lý thông tin người thân của nhân viên",
  
  // Routing
  routePath: "/he-thong/nguoi-than",
  parentPath: "/he-thong",
  
  // Breadcrumb
  breadcrumb: {
    label: "Người thân",
    parentLabel: "Nhân Sự",
  },
  
  // Database
  tableName: "var_nguoi_than",
  primaryKey: "id",
  
  // List view
  filterColumns: [
    {
      columnId: "moi_quan_he",
      title: "Mối Quan Hệ",
      options: [
        { label: "Cha", value: "Cha" },
        { label: "Mẹ", value: "Mẹ" },
        { label: "Vợ/Chồng", value: "Vợ/Chồng" },
        { label: "Con", value: "Con" },
        { label: "Anh/Chị/Em", value: "Anh/Chị/Em" },
        { label: "Khác", value: "Khác" },
      ],
    },
  ],
  searchFields: ["ho_va_ten", "so_dien_thoai", "ghi_chu", "ten_nhan_vien"],
  defaultSorting: [{ id: "tg_tao", desc: true }],
}

