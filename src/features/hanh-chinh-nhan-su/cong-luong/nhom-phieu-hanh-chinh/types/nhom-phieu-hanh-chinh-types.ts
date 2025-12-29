import type { NhomPhieuHanhChinh } from "../schema"

export type CreateNhomPhieuHanhChinhInput = Omit<
  NhomPhieuHanhChinh,
  "id" | "tg_tao" | "tg_cap_nhat" | "nguoi_tao_id"
>

export type UpdateNhomPhieuHanhChinhInput = Partial<
  Omit<NhomPhieuHanhChinh, "id" | "tg_tao" | "nguoi_tao_id">
>

export interface BatchNhomPhieuHanhChinhOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

