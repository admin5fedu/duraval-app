/**
 * Module Configuration for Nhóm chuyên đề
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const nhomChuyenDeConfig: ModuleConfig = {
  // Basic info
  moduleName: "nhom-chuyen-de",
  moduleTitle: "Nhóm chuyên đề",
  moduleDescription: "Quản lý nhóm chuyên đề đào tạo",
  
  // Routing
  routePath: "/cong-viec/nhom-chuyen-de",
  parentPath: "/cong-viec",
  
  // Breadcrumb
  breadcrumb: {
    label: "Nhóm chuyên đề",
    parentLabel: "Các chuyên đề",
  },
  
  // Database
  tableName: "dao_tao_nhom_chuyen_de",
  primaryKey: "id",
  
  // List view
  filterColumns: [],
  searchFields: ["ten_nhom"],
  defaultSorting: [{ id: "tg_tao", desc: true }],
}

