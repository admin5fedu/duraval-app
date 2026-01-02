import { z } from "zod"

/**
 * Schema matching 'var_tsn_phuong_xa' table in Supabase
 */
export const phuongXaTSNSchema = z.object({
  id: z.number().optional(), // Auto-generated, optional for create
  quan_huyen_id: z.number().min(1, "Quận huyện là bắt buộc"),
  ma_quan_huyen: z.string().min(1, "Mã quận huyện là bắt buộc"),
  ten_quan_huyen: z.string().min(1, "Tên quận huyện là bắt buộc"),
  ma_phuong_xa: z.string().min(1, "Mã phường xã là bắt buộc"),
  ten_phuong_xa: z.string().min(1, "Tên phường xã là bắt buộc"),
  tinh_thanh_id: z.number().optional().nullable(),
  ma_tinh_thanh: z.string().optional().nullable(),
  ten_tinh_thanh: z.string().optional().nullable(),
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
})

export type PhuongXaTSN = z.infer<typeof phuongXaTSNSchema>

/**
 * Schema for creating new phường xã TSN
 */
export type CreatePhuongXaTSNInput = Omit<PhuongXaTSN, "id" | "tg_tao" | "tg_cap_nhat">

/**
 * Schema for updating phường xã TSN
 */
export type UpdatePhuongXaTSNInput = Partial<Omit<PhuongXaTSN, "id" | "tg_tao">>

