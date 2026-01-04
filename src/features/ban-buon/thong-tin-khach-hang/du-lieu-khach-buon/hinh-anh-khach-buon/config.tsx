import { ModuleConfig } from "@/shared/types/module-config"

export const hinhAnhKhachBuonConfig: ModuleConfig = {
  moduleName: "hinh-anh-khach-buon",
  moduleTitle: "Hình Ảnh Khách Buôn",
  moduleDescription: "Quản lý hình ảnh của khách buôn",
  routePath: "/ban-buon/hinh-anh-khach-buon",
  parentPath: "/ban-buon",
  breadcrumb: {
    label: "Hình Ảnh Khách Buôn",
    parentLabel: "Bán Buôn",
  },
  tableName: "bb_hinh_anh",
  primaryKey: "id",
  filterColumns: [],
  searchFields: ["ten_khach_buon", "hang_muc", "mo_ta", "ghi_chu"],
  defaultSorting: [{ id: "id", desc: false }],
}

