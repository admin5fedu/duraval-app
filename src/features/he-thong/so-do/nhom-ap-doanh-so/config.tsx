/**
 * Module Configuration for Nhóm Áp Doanh Số
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const nhomApDoanhSoConfig: ModuleConfig = {
  // Basic info
  moduleName: "nhom-ap-doanh-so",
  moduleTitle: "Nhóm Áp Doanh Số",
  moduleDescription: "Quản lý nhóm áp dụng doanh số",
  
  // Routing
  routePath: "/he-thong/nhom-ap-doanh-so",
  parentPath: "/he-thong",
  
  // Breadcrumb
  breadcrumb: {
    label: "Nhóm Áp Doanh Số",
    parentLabel: "Hệ Thống",
  },
  
  // Database
  tableName: "var_nhom_ap_doanh_so",
  primaryKey: "id",
  
  // List view
  filterColumns: [],
  searchFields: ["ma_nhom_ap", "ten_nhom_ap", "mo_ta"],
  defaultSorting: [{ id: "tg_tao", desc: true }],
}

