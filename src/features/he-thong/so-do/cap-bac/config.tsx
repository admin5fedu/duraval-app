/**
 * Module Configuration for Cấp Bậc
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const capBacConfig: ModuleConfig = {
  // Basic info
  moduleName: "cap-bac",
  moduleTitle: "Cấp Bậc",
  moduleDescription: "Quản lý thông tin cấp bậc",

  // Routing
  routePath: "/he-thong/cap-bac",
  parentPath: "/he-thong",

  // Breadcrumb
  breadcrumb: {
    label: "Cấp Bậc",
    parentLabel: "Hệ Thống",
  },

  // Database
  tableName: "var_cap_bac",
  primaryKey: "id",

  // List view
  filterColumns: [
    {
      columnId: "cap_bac",
      title: "Bậc",
      options: [], // Will be populated dynamically from data
    },
  ],
  searchFields: ["ten_cap_bac"],
  defaultSorting: [{ id: "cap_bac", desc: false }],
}

