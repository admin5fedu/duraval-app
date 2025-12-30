import type { TrucHat } from "../schema"

export type CreateTrucHatInput = Omit<
  TrucHat,
  "id" | "tg_tao" | "tg_cap_nhat" | "nhan_vien_bh" | "nguoi_tao"
> & {
  nguoi_tao_id?: number | null // Cho phép set nguoi_tao_id khi tạo mới
}

export type UpdateTrucHatInput = Partial<
  Omit<TrucHat, "id" | "tg_tao" | "nhan_vien_bh" | "nguoi_tao">
>

