/**
 * Module Configuration for Trạng Thái Khách Buôn
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const trangThaiKhachBuonConfig: ModuleConfig = {
  // Basic info
  moduleName: "trang-thai-khach-buon",
  moduleTitle: "Trạng Thái Khách Buôn",
  moduleDescription: "Quản lý trạng thái khách buôn",
  
  // Routing
  routePath: "/ban-buon/trang-thai-khach-buon",
  parentPath: "/ban-buon",
  
  // Breadcrumb
  breadcrumb: {
    label: "Trạng Thái Khách Buôn",
    parentLabel: "Bán Buôn",
  },
  
  // Database
  tableName: "bb_trang_thai",
  primaryKey: "id",
  
  // List view
  filterColumns: [],
  searchFields: ["ma_trang_thai", "ten_trang_thai", "mo_ta"],
  defaultSorting: [{ id: "tt", desc: false }],
}

