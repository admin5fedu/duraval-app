/**
 * Module Configuration for Phường Xã TSN
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const phuongXaTSNConfig: ModuleConfig = {
  // Basic info
  moduleName: "phuong-xa-tsn",
  moduleTitle: "Phường Xã TSN",
  moduleDescription: "Quản lý phường xã trước sát nhập",
  
  // Routing
  routePath: "/he-thong/phuong-xa-tsn",
  parentPath: "/he-thong",
  
  // Breadcrumb
  breadcrumb: {
    label: "Phường Xã TSN",
    parentLabel: "Hệ Thống",
  },
  
  // Database
  tableName: "var_tsn_phuong_xa",
  primaryKey: "id",
  
  // List view
  filterColumns: [
    {
      columnId: "ma_tinh_thanh",
      title: "Mã Tỉnh Thành",
      options: [], // Will be populated dynamically from data
    },
    {
      columnId: "ten_tinh_thanh",
      title: "Tên Tỉnh Thành",
      options: [], // Will be populated dynamically from data
    },
    {
      columnId: "ma_quan_huyen",
      title: "Mã Quận Huyện",
      options: [], // Will be populated dynamically from data
    },
    {
      columnId: "ten_quan_huyen",
      title: "Tên Quận Huyện",
      options: [], // Will be populated dynamically from data
    },
  ],
  searchFields: ["ma_phuong_xa", "ten_phuong_xa", "ma_quan_huyen", "ten_quan_huyen", "ma_tinh_thanh", "ten_tinh_thanh"],
  defaultSorting: [{ id: "tg_tao", desc: true }],
}

