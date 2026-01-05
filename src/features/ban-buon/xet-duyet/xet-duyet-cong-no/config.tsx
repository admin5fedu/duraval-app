import { ModuleConfig } from "@/shared/types/module-config"

export const xetDuyetCongNoConfig: ModuleConfig = {
  moduleName: "xet-duyet-cong-no",
  moduleTitle: "Xét Duyệt Công Nợ",
  moduleDescription: "Quản lý xét duyệt công nợ",
  routePath: "/ban-buon/xet-duyet-cong-no",
  parentPath: "/ban-buon",
  breadcrumb: {
    label: "Xét Duyệt Công Nợ",
    parentLabel: "Bán Buôn",
  },
  tableName: "bb_xet_duyet_cong_no",
  primaryKey: "id",
  filterColumns: [],
  searchFields: ["ten_khach_buon", "loai_hinh", "ghi_chu"],
  defaultSorting: [{ id: "id", desc: false }],
}

