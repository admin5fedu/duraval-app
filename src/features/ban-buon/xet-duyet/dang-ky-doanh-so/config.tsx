import { ModuleConfig } from "@/shared/types/module-config"

export const dangKyDoanhSoConfig: ModuleConfig = {
  moduleName: "dang-ky-doanh-so",
  moduleTitle: "Đăng Ký Doanh Số",
  moduleDescription: "Quản lý đăng ký doanh số và mục tiêu bán hàng",
  routePath: "/ban-buon/dang-ky-doanh-so",
  parentPath: "/ban-buon",
  breadcrumb: {
    label: "Đăng Ký Doanh Số",
    parentLabel: "Bán Buôn",
  },
  tableName: "bb_dang_ky_doanh_so",
  primaryKey: "id",
  filterColumns: [],
  searchFields: ["ten_khach_buon", "ten_muc_dang_ky", "ghi_chu"],
  defaultSorting: [{ id: "id", desc: false }],
}

