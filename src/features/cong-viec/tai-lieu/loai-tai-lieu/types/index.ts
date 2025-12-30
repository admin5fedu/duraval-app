import type { LoaiTaiLieu } from "../schema"

export type CreateLoaiTaiLieuInput = Omit<
  LoaiTaiLieu,
  "id" | "tg_tao" | "tg_cap_nhat" | "nguoi_tao_ten"
>

export type UpdateLoaiTaiLieuInput = Partial<
  Omit<LoaiTaiLieu, "id" | "tg_tao" | "nguoi_tao_id" | "nguoi_tao_ten">
>

export interface BatchLoaiTaiLieuOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

