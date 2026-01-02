/**
 * Module Configuration for Quận huyện TSN
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const quanHuyenTSNConfig: ModuleConfig = {
  // Basic info
  moduleName: "quan-huyen-tsn",
  moduleTitle: "Quận huyện TSN",
  moduleDescription: "Quản lý quận huyện trước sát nhập",
  
  // Routing
  routePath: "/he-thong/quan-huyen-tsn",
  parentPath: "/he-thong",
  
  // Breadcrumb
  breadcrumb: {
    label: "Quận huyện TSN",
    parentLabel: "Hệ Thống",
  },
  
  // Database
  tableName: "var_tsn_quan_huyen",
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
  ],
  searchFields: ["ma_quan_huyen", "ten_quan_huyen", "ma_tinh_thanh", "ten_tinh_thanh"],
  defaultSorting: [{ id: "tg_tao", desc: true }],
}

