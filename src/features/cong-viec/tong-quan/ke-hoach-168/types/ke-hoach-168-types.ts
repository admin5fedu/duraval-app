import type { KeHoach168 } from "../schema"

export type CreateKeHoach168Input = Omit<
  KeHoach168,
  "id" | "tg_tao" | "tg_cap_nhat"
>

export type UpdateKeHoach168Input = Partial<
  Omit<KeHoach168, "id" | "tg_tao">
>

export interface BatchKeHoach168OperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

