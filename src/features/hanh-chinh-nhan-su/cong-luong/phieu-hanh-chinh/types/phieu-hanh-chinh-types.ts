import type { PhieuHanhChinh } from "../schema"

export type CreatePhieuHanhChinhInput = Omit<
  PhieuHanhChinh,
  "id" | "tg_tao" | "tg_cap_nhat" | "nguoi_tao_ten"
>

export type UpdatePhieuHanhChinhInput = Partial<
  Omit<PhieuHanhChinh, "id" | "tg_tao" | "nguoi_tao_id" | "nguoi_tao_ten">
>

export interface BatchPhieuHanhChinhOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

