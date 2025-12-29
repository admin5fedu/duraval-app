import type { NhomLuong } from "../schema"

export type CreateNhomLuongInput = Omit<
  NhomLuong,
  "id" | "tg_tao" | "tg_cap_nhat" | "nguoi_tao_ten" | "nguoi_tao"
> & {
  nguoi_tao_id?: number | null // Cho phép set nguoi_tao_id khi tạo mới
}

export type UpdateNhomLuongInput = Partial<
  Omit<NhomLuong, "id" | "tg_tao" | "nguoi_tao_id" | "nguoi_tao_ten" | "nguoi_tao">
>

