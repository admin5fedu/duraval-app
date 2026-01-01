/**
 * Module Configuration for Đăng Ký Doanh Số
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const dangKyDoanhSoConfig: ModuleConfig = {
  // Basic info
  moduleName: "dang-ky-doanh-so",
  moduleTitle: "Đăng Ký Doanh Số",
  moduleDescription: "Quản lý đăng ký doanh số",
  
  // Routing
  routePath: "/he-thong/dang-ky-doanh-so",
  parentPath: "/he-thong",
  
  // Breadcrumb
  breadcrumb: {
    label: "Đăng Ký Doanh Số",
    parentLabel: "Hệ Thống",
  },
  
  // Database
  tableName: "var_dk_doanh_so",
  primaryKey: "id",
  
  // List view
  filterColumns: [],
  searchFields: ["ten_nhan_vien", "ten_nhom_ap_doanh_thu", "mo_ta", "bac_dt"],
  defaultSorting: [{ id: "tg_tao", desc: true }],
}

