import type { DanhMucCauHoi } from "../schema"

export type CreateDanhMucCauHoiInput = Omit<
  DanhMucCauHoi,
  "id" | "tg_tao" | "tg_cap_nhat" | "nguoi_tao_ten"
>

export type UpdateDanhMucCauHoiInput = Partial<
  Omit<DanhMucCauHoi, "id" | "tg_tao" | "nguoi_tao_id" | "nguoi_tao_ten">
>

export interface BatchDanhMucCauHoiOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

