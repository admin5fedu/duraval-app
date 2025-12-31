import type { TaiLieuBieuMau } from "../schema"

export type CreateTaiLieuBieuMauInput = Omit<
  TaiLieuBieuMau,
  "id" | "tg_tao" | "tg_cap_nhat" | "nguoi_tao_ten"
>

export type UpdateTaiLieuBieuMauInput = Partial<
  Omit<TaiLieuBieuMau, "id" | "tg_tao" | "nguoi_tao_id" | "nguoi_tao_ten">
>

export interface BatchTaiLieuBieuMauOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

