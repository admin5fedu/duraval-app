import { z } from "zod"

/**
 * Schema matching 'var_phong_ban' table in Supabase
 */
export const phongBanSchema = z.object({
  id: z.number().optional(), // Auto-generated, optional for create
  tt: z.number().optional().nullable(), // Số thứ tự
  ma_phong_ban: z.string().min(1, "Mã phòng ban là bắt buộc"),
  ten_phong_ban: z.string().min(1, "Tên phòng ban là bắt buộc"),
  cap_do: z.string().min(1, "Cấp độ là bắt buộc"),
  truc_thuoc_phong_ban: z.string().optional().nullable(),
  truc_thuoc_id: z.number().optional().nullable(),
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
  nguoi_tao: z.number().optional().nullable(),
})

export type PhongBan = z.infer<typeof phongBanSchema>

/**
 * Schema for creating new phòng ban
 */
export type CreatePhongBanInput = Omit<PhongBan, "id" | "tg_tao" | "tg_cap_nhat" | "nguoi_tao">

/**
 * Schema for updating phòng ban
 */
export type UpdatePhongBanInput = Partial<Omit<PhongBan, "id" | "tg_tao" | "nguoi_tao">>

/**
 * Batch operation result
 */
export interface BatchPhongBanOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

