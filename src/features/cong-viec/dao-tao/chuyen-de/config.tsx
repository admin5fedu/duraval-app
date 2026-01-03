/**
 * Module Configuration for Chuyên đề
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const chuyenDeConfig: ModuleConfig = {
  // Basic info
  moduleName: "chuyen-de",
  moduleTitle: "Chuyên đề",
  moduleDescription: "Quản lý chuyên đề đào tạo",
  
  // Routing
  routePath: "/cong-viec/chuyen-de",
  parentPath: "/cong-viec",
  
  // Breadcrumb
  breadcrumb: {
    label: "Chuyên đề",
    parentLabel: "Các chuyên đề",
  },
  
  // Database
  tableName: "dao_tao_chuyen_de",
  primaryKey: "id",
  
  // List view
  filterColumns: [],
  searchFields: ["ten_chuyen_de", "ten_nhom_chuyen_de"],
  defaultSorting: [{ id: "tg_tao", desc: true }],
}

