import type { DanhMucTaiLieu } from "../schema"

export type CreateDanhMucTaiLieuInput = Omit<
  DanhMucTaiLieu,
  "id" | "tg_tao" | "tg_cap_nhat" | "nguoi_tao_ten"
>

export type UpdateDanhMucTaiLieuInput = Partial<
  Omit<DanhMucTaiLieu, "id" | "tg_tao" | "nguoi_tao_id" | "nguoi_tao_ten">
> & {
  // Ensure required fields are present
  hang_muc?: string
  loai_id?: number
  cap?: number
}

export interface BatchDanhMucTaiLieuOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

