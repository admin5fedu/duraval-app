import { z } from "zod"

/**
 * Schema matching 'var_chi_nhanh' table in Supabase
 */
export const chiNhanhSchema = z.object({
  id: z.number().optional(), // Auto-generated, optional for create
  ma_chi_nhanh: z.string().min(1, "Mã chi nhánh là bắt buộc"),
  ten_chi_nhanh: z.string().min(1, "Tên chi nhánh là bắt buộc"),
  dia_chi: z.string().optional().nullable(),
  dinh_vi: z.string().optional().nullable(),
  hinh_anh: z.string().optional().nullable(),
  mo_ta: z.string().optional().nullable(),
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
  nguoi_tao_id: z.number().optional().nullable(),
})

export type ChiNhanh = z.infer<typeof chiNhanhSchema>

/**
 * Schema for creating new chi nhánh
 */
export type CreateChiNhanhInput = Omit<ChiNhanh, "id" | "tg_tao" | "tg_cap_nhat" | "nguoi_tao_id">

/**
 * Schema for updating chi nhánh
 */
export type UpdateChiNhanhInput = Partial<Omit<ChiNhanh, "id" | "tg_tao" | "nguoi_tao_id">>

/**
 * Batch operation result
 */
export interface BatchChiNhanhOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

