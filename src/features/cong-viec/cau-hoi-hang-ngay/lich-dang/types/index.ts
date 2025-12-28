import type { LichDang } from "../schema"

export type CreateLichDangInput = Omit<
  LichDang,
  "id" | "tg_tao" | "tg_cap_nhat" | "nhom_cau_hoi_ten" | "nguoi_tao_ten"
>

export type UpdateLichDangInput = Partial<
  Omit<
    LichDang,
    "id" | "tg_tao" | "nguoi_tao_id" | "nhom_cau_hoi_ten" | "nguoi_tao_ten"
  >
>

export interface BatchLichDangOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

