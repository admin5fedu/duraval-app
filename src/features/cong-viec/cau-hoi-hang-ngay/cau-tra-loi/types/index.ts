import type { CauTraLoi } from "../schema"

export type CreateCauTraLoiInput = Omit<
  CauTraLoi,
  "id" | "tg_tao" | "tg_cap_nhat" | "lich_dang_cau_hoi" | "nguoi_tao_ten"
>

export type UpdateCauTraLoiInput = Partial<
  Omit<
    CauTraLoi,
    "id" | "tg_tao" | "nguoi_tao_id" | "lich_dang_cau_hoi" | "nguoi_tao_ten"
  >
>

export interface BatchCauTraLoiOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

