/**
 * Module Configuration for Câu hỏi
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const cauHoiConfig: ModuleConfig = {
  // Basic info
  moduleName: "cau-hoi",
  moduleTitle: "Câu hỏi",
  moduleDescription: "Quản lý câu hỏi đào tạo",
  
  // Routing
  routePath: "/cong-viec/cau-hoi",
  parentPath: "/cong-viec",
  
  // Breadcrumb
  breadcrumb: {
    label: "Câu hỏi",
    parentLabel: "Các chuyên đề",
  },
  
  // Database
  tableName: "dao_tao_cau_hoi",
  primaryKey: "id",
  
  // List view
  filterColumns: [],
  searchFields: ["cau_hoi", "ten_chuyen_de"],
  defaultSorting: [{ id: "tg_tao", desc: true }],
}

