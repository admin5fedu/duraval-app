/**
 * Module Configuration for Giai Đoạn Khách Buôn
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const giaiDoanKhachBuonConfig: ModuleConfig = {
  // Basic info
  moduleName: "giai-doan-khach-buon",
  moduleTitle: "Giai Đoạn Khách Buôn",
  moduleDescription: "Quản lý giai đoạn khách buôn",
  
  // Routing
  routePath: "/ban-buon/giai-doan-khach-buon",
  parentPath: "/ban-buon",
  
  // Breadcrumb
  breadcrumb: {
    label: "Giai Đoạn Khách Buôn",
    parentLabel: "Bán Buôn",
  },
  
  // Database
  tableName: "bb_giai_doan",
  primaryKey: "id",
  
  // List view
  filterColumns: [],
  searchFields: ["ma_giai_doan", "ten_giai_doan", "mo_ta"],
  defaultSorting: [{ id: "tt", desc: false }],
}

