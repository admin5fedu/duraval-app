import type { ViecHangNgay } from "../schema"

export type CreateViecHangNgayInput = Omit<
  ViecHangNgay,
  "id" | "tg_tao" | "tg_cap_nhat"
>

export type UpdateViecHangNgayInput = Partial<
  Omit<ViecHangNgay, "id" | "tg_tao">
>

export interface BatchViecHangNgayOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

