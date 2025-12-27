/**
 * Module Configuration for Phân Quyền
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const phanQuyenConfig: ModuleConfig = {
  // Basic info
  moduleName: "phan-quyen",
  moduleTitle: "Phân Quyền",
  moduleDescription: "Quản lý phân quyền cho các chức vụ",
  
  // Routing
  routePath: "/he-thong/phan-quyen",
  parentPath: "/he-thong",
  
  // Breadcrumb
  breadcrumb: {
    label: "Phân Quyền",
    parentLabel: "Hệ Thống",
  },
  
  // Database
  tableName: "var_chia_quyen",
  primaryKey: "id",
}

