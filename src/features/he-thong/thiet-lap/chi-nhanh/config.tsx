/**
 * Module Configuration for Chi Nhánh
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const chiNhanhConfig: ModuleConfig = {
  // Basic info
  moduleName: "chi-nhanh",
  moduleTitle: "Chi Nhánh",
  moduleDescription: "Quản lý thông tin chi nhánh",
  
  // Routing
  routePath: "/he-thong/chi-nhanh",
  parentPath: "/he-thong",
  
  // Breadcrumb
  breadcrumb: {
    label: "Chi Nhánh",
    parentLabel: "Hệ Thống",
  },
  
  // Database
  tableName: "var_chi_nhanh",
  primaryKey: "id",
  
  // List view
  filterColumns: [],
  searchFields: ["ma_chi_nhanh", "ten_chi_nhanh", "dia_chi", "dinh_vi", "mo_ta"],
  defaultSorting: [{ id: "tg_tao", desc: true }],
}

