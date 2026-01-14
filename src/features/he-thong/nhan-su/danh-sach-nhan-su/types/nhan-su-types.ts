import { z } from "zod"
import { nhanSuSchema } from "../schema"

export { nhanSuSchema }
export type NhanSu = z.infer<typeof nhanSuSchema>

export type CreateNhanSuInput = NhanSu

export type UpdateNhanSuInput = Partial<Omit<NhanSu, "ma_nhan_vien">>

export interface BatchNhanSuOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

