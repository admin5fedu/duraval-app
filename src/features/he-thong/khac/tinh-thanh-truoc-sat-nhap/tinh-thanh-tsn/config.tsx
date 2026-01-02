/**
 * Module Configuration for Tỉnh thành TSN
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const tinhThanhTSNConfig: ModuleConfig = {
  // Basic info
  moduleName: "tinh-thanh-tsn",
  moduleTitle: "Tỉnh thành TSN",
  moduleDescription: "Quản lý tỉnh thành trước sát nhập",
  
  // Routing
  routePath: "/he-thong/tinh-thanh-tsn",
  parentPath: "/he-thong",
  
  // Breadcrumb
  breadcrumb: {
    label: "Tỉnh thành TSN",
    parentLabel: "Hệ Thống",
  },
  
  // Database
  tableName: "var_tsn_tinh_thanh",
  primaryKey: "id",
  
  // List view
  filterColumns: [
    {
      columnId: "mien",
      title: "Miền",
      options: [
        { label: "Miền Bắc", value: "Miền Bắc" },
        { label: "Miền Trung", value: "Miền Trung" },
        { label: "Miền Nam", value: "Miền Nam" },
      ],
    },
    {
      columnId: "vung",
      title: "Vùng",
      options: [
        { label: "Đồng bằng sông Hồng", value: "Đồng bằng sông Hồng" },
        { label: "Trung du và miền núi phía Bắc", value: "Trung du và miền núi phía Bắc" },
        { label: "Bắc Trung Bộ", value: "Bắc Trung Bộ" },
        { label: "Duyên hải Nam Trung Bộ", value: "Duyên hải Nam Trung Bộ" },
        { label: "Tây Nguyên", value: "Tây Nguyên" },
        { label: "Đông Nam Bộ", value: "Đông Nam Bộ" },
        { label: "Đồng bằng sông Cửu Long", value: "Đồng bằng sông Cửu Long" },
      ],
    },
  ],
  searchFields: ["ma_tinh_thanh", "ten_tinh_thanh", "mien", "vung"],
  defaultSorting: [{ id: "tg_tao", desc: true }],
}

