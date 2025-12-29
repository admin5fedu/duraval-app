/**
 * Module Configuration for Nhóm Lương
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const nhomLuongConfig: ModuleConfig = {
  // Basic info
  moduleName: "nhom-luong",
  moduleTitle: "Nhóm Lương",
  moduleDescription: "Quản lý nhóm lương",
  
  // Routing
  routePath: "/hanh-chinh-nhan-su/nhom-luong",
  parentPath: "/hanh-chinh-nhan-su",
  
  // Breadcrumb
  breadcrumb: {
    label: "Nhóm Lương",
    parentLabel: "Hành Chính Nhân Sự",
  },
  
  // Database
  tableName: "ole_nhom_luong",
  primaryKey: "id",
  
  // List view
  filterColumns: [],
  searchFields: ["ten_nhom", "mo_ta"],
  defaultSorting: [{ id: "ten_nhom", desc: false }],
}

