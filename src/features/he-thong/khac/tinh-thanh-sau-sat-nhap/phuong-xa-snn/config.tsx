/**
 * Module Configuration for Phường xã SNN
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const phuongXaSNNConfig: ModuleConfig = {
  // Basic info
  moduleName: "phuong-xa-snn",
  moduleTitle: "Phường xã SNN",
  moduleDescription: "Quản lý phường xã sau sát nhập",
  
  // Routing
  routePath: "/he-thong/phuong-xa-snn",
  parentPath: "/he-thong",
  
  // Breadcrumb
  breadcrumb: {
    label: "Phường xã SNN",
    parentLabel: "Hệ Thống",
  },
  
  // Database
  tableName: "var_ssn_phuong_xa",
  primaryKey: "id",
  
  // List view
  filterColumns: [],
  searchFields: ["ma_tinh_thanh", "ten_tinh_thanh", "ma_phuong_xa", "ten_phuong_xa"],
  defaultSorting: [{ id: "tg_tao", desc: true }],
}

