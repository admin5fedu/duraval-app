/**
 * Module Configuration for Thông Tin Công Ty
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const thongTinCongTyConfig: ModuleConfig = {
  // Basic info
  moduleName: "thong-tin-cong-ty",
  moduleTitle: "Thông Tin Công Ty",
  moduleDescription: "Quản lý thông tin công ty",
  
  // Routing
  routePath: "/he-thong/thong-tin-cong-ty",
  parentPath: "/he-thong",
  
  // Breadcrumb
  breadcrumb: {
    label: "Thông Tin Công Ty",
    parentLabel: "Hệ Thống",
  },
  
  // Database
  tableName: "var_cong_ty",
  primaryKey: "id",
  
  // List view
  filterColumns: [
    {
      columnId: "ap_dung",
      title: "Áp Dụng",
      options: [
        { label: "Có", value: "true" },
        { label: "Không", value: "false" },
      ],
    },
  ],
  searchFields: ["ma_cong_ty", "ten_cong_ty", "ten_day_du", "email", "so_dien_thoai", "website"],
  defaultSorting: [{ id: "tg_tao", desc: true }],
}

