import { ModuleConfig } from "@/shared/types/module-config"

export const xetDuyetKhachBuonConfig: ModuleConfig = {
  moduleName: "xet-duyet-khach-buon",
  moduleTitle: "Xét Duyệt Khách Buôn",
  moduleDescription: "Quản lý xét duyệt khách buôn",
  routePath: "/ban-buon/xet-duyet-khach-buon",
  parentPath: "/ban-buon",
  breadcrumb: {
    label: "Xét Duyệt Khách Buôn",
    parentLabel: "Bán Buôn",
  },
  tableName: "bb_xet_duyet_khach_buon",
  primaryKey: "id",
  filterColumns: [
    {
      columnId: "trang_thai",
      title: "Trạng Thái",
      options: [
        { label: "Chờ kiểm tra", value: "Chờ kiểm tra" },
        { label: "Chờ duyệt", value: "Chờ duyệt" },
        { label: "Đã duyệt", value: "Đã duyệt" },
        { label: "Từ chối", value: "Từ chối" },
        { label: "Đã hủy", value: "Đã hủy" },
        { label: "Yêu cầu bổ sung", value: "Yêu cầu bổ sung" },
      ],
    },
  ],
  searchFields: ["ten_khach_buon", "ten_muc_dang_ky", "ghi_chu"],
  defaultSorting: [{ id: "id", desc: false }],
}

