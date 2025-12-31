/**
 * Module Configuration for Hạng Mục
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const hangMucConfig: ModuleConfig = {
  // Basic info
  moduleName: "hang-muc",
  moduleTitle: "Hạng Mục",
  moduleDescription: "Quản lý hạng mục",
  
  // Routing
  routePath: "/kinh-doanh/hang-muc",
  parentPath: "/kinh-doanh",
  
  // Breadcrumb
  breadcrumb: {
    label: "Hạng Mục",
    parentLabel: "Kinh Doanh",
  },
  
  // Database
  tableName: "htbh_hang_muc",
  primaryKey: "id",
  
  // List view
  filterColumns: [
    // Có thể thêm filter theo các field khác nếu cần
  ],
  searchFields: ["ten_hang_muc", "ten_loai_phieu", "mo_ta"],
  defaultSorting: [{ id: "tg_tao", desc: true }],
}

