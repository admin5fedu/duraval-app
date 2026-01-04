import { ModuleConfig } from "@/shared/types/module-config"

export const mucDangKyConfig: ModuleConfig = {
  moduleName: "muc-dang-ky",
  moduleTitle: "Mức Đăng Ký",
  moduleDescription: "Quản lý mức đăng ký khách buôn",
  routePath: "/ban-buon/muc-dang-ky",
  parentPath: "/ban-buon",
  breadcrumb: {
    label: "Mức Đăng Ký",
    parentLabel: "Bán Buôn",
  },
  tableName: "bb_muc_dang_ky",
  primaryKey: "id",
  filterColumns: [],
  searchFields: ["ma_hang", "ten_hang", "ghi_chu"],
  defaultSorting: [{ id: "id", desc: false }],
}

