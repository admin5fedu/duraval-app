import { ModuleConfig } from "@/shared/types/module-config"

export const danhSachKBConfig: ModuleConfig = {
  moduleName: "danh-sach-KB",
  moduleTitle: "Danh Sách KB",
  moduleDescription: "Quản lý danh sách khách buôn",
  routePath: "/ban-buon/danh-sach-kb",
  parentPath: "/ban-buon",
  breadcrumb: {
    label: "Danh Sách KB",
    parentLabel: "Bán Buôn",
  },
  tableName: "bb_khach_buon",
  primaryKey: "id",
  filterColumns: [],
  searchFields: ["ma_so", "ten_khach_buon", "so_dien_thoai_1", "so_dien_thoai_2"],
  defaultSorting: [{ id: "id", desc: false }],
}

