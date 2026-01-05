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
    {
      columnId: "loai_hinh",
      title: "Loại Hình",
      options: [
        { label: "Nợ gối đầu", value: "Nợ gối đầu" },
        { label: "TT cuối tháng", value: "TT cuối tháng" },
        { label: "Nợ gối đơn", value: "Nợ gối đơn" },
      ],
    },
  ],
  searchFields: ["ten_khach_buon", "loai_hinh", "ghi_chu"],
  defaultSorting: [{ id: "id", desc: false }],
}

