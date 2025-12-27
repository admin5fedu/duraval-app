/**
 * Module Configuration for Phòng Ban
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const phongBanConfig: ModuleConfig = {
  // Basic info
  moduleName: "phong-ban",
  moduleTitle: "Phòng Ban",
  moduleDescription: "Quản lý thông tin phòng ban",
  
  // Routing
  routePath: "/he-thong/phong-ban",
  parentPath: "/he-thong",
  
  // Breadcrumb
  breadcrumb: {
    label: "Phòng Ban",
    parentLabel: "Hệ Thống",
  },
  
  // Database
  tableName: "var_phong_ban",
  primaryKey: "id",
  
  // List view
  filterColumns: [
    {
      columnId: "cap_do",
      title: "Cấp Độ",
      options: [
        { label: "Phòng", value: "Phòng" },
        { label: "Bộ phận", value: "Bộ phận" },
        { label: "Nhóm", value: "Nhóm" },
      ],
    },
    {
      columnId: "truc_thuoc_id",
      title: "Trực Thuộc",
      options: [], // Will be populated dynamically from data
    },
  ],
  searchFields: ["ma_phong_ban", "ten_phong_ban", "cap_do", "truc_thuoc_phong_ban"],
  defaultSorting: [{ id: "tg_tao", desc: true }],
}

