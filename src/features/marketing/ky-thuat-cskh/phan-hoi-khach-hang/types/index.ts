import type { PhanHoiKhachHang } from "../schema"

export type CreatePhanHoiKhachHangInput = Omit<
  PhanHoiKhachHang,
  "id" | "tg_tao" | "tg_cap_nhat" | "nhan_vien" | "nguoi_tao"
> & {
  nguoi_tao_id?: number | null // Cho phép set nguoi_tao_id khi tạo mới
}

export type UpdatePhanHoiKhachHangInput = Partial<
  Omit<PhanHoiKhachHang, "id" | "tg_tao" | "nhan_vien" | "nguoi_tao">
>

