import { ModuleConfig } from "@/shared/types/module-config"

export const chamSocKhachBuonConfig: ModuleConfig = {
  moduleName: "cham-soc-khach-buon",
  moduleTitle: "Chăm Sóc Khách Buôn",
  moduleDescription: "Quản lý lịch sử chăm sóc khách buôn",
  routePath: "/ban-buon/cham-soc-khach-buon",
  parentPath: "/ban-buon",
  breadcrumb: {
    label: "Chăm Sóc Khách Buôn",
    parentLabel: "Bán Buôn",
  },
  tableName: "bb_lich_su_cham_soc",
  primaryKey: "id",
  filterColumns: [],
  searchFields: ["hinh_thuc", "muc_tieu", "ket_qua", "hanh_dong_tiep_theo"],
  defaultSorting: [{ id: "id", desc: false }],
}

