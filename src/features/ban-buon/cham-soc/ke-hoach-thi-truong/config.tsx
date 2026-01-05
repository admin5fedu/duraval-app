import { ModuleConfig } from "@/shared/types/module-config"

export const keHoachThiTruongConfig: ModuleConfig = {
  moduleName: "ke-hoach-thi-truong",
  moduleTitle: "Kế Hoạch Thị Trường",
  moduleDescription: "Quản lý kế hoạch thị trường cho khách buôn",
  routePath: "/ban-buon/ke-hoach-thi-truong",
  parentPath: "/ban-buon",
  breadcrumb: {
    label: "Kế Hoạch Thị Trường",
    parentLabel: "Bán Buôn",
  },
  tableName: "bb_ke_hoach_thi_truong",
  primaryKey: "id",
  filterColumns: [
    {
      columnId: "buoi",
      title: "Buổi",
      options: [
        { label: "Sáng", value: "Sáng" },
        { label: "Chiều", value: "Chiều" },
      ],
    },
    {
      columnId: "hanh_dong",
      title: "Hành Động",
      options: [
        { label: "Đi thị trường", value: "Đi thị trường" },
        { label: "Làm văn phòng", value: "Làm văn phòng" },
      ],
    },
    {
      columnId: "trang_thai",
      title: "Trạng Thái",
      options: [
        { label: "Chưa thực hiện", value: "Chưa thực hiện" },
        { label: "Đã thực hiện", value: "Đã thực hiện" },
        { label: "Hủy", value: "Hủy" },
      ],
    },
  ],
  searchFields: ["hanh_dong", "muc_tieu", "ghi_chu", "trang_thai", "ten_nhan_vien", "ten_khach_buon"],
  defaultSorting: [{ id: "id", desc: false }],
}

