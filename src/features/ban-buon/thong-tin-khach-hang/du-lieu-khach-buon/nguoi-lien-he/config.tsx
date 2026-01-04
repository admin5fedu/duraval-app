import { ModuleConfig } from "@/shared/types/module-config"

export const nguoiLienHeConfig: ModuleConfig = {
  moduleName: "nguoi-lien-he",
  moduleTitle: "Người Liên Hệ",
  moduleDescription: "Quản lý người liên hệ của khách buôn",
  routePath: "/ban-buon/nguoi-lien-he",
  parentPath: "/ban-buon",
  breadcrumb: {
    label: "Người Liên Hệ",
    parentLabel: "Bán Buôn",
  },
  tableName: "bb_lien_he",
  primaryKey: "id",
  filterColumns: [],
  searchFields: ["ten_lien_he", "ten_khach_buon", "so_dien_thoai_1", "so_dien_thoai_2", "email", "vai_tro"],
  defaultSorting: [{ id: "id", desc: false }],
}

