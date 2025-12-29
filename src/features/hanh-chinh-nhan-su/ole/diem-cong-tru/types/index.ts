import type { DiemCongTru } from "../schema"

export type CreateDiemCongTruInput = Omit<
  DiemCongTru,
  "id" | "tg_tao" | "tg_cap_nhat" | "nhan_vien" | "phong_ban" | "nhom_luong" | "nguoi_tao"
> & {
  nguoi_tao_id?: number | null // Cho phép set nguoi_tao_id khi tạo mới
}

export type UpdateDiemCongTruInput = Partial<
  Omit<DiemCongTru, "id" | "tg_tao" | "nhan_vien" | "phong_ban" | "nhom_luong" | "nguoi_tao">
>

