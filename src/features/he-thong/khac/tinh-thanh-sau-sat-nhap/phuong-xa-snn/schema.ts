import { z } from "zod"

/**
 * Schema matching 'var_ssn_phuong_xa' table in Supabase
 */
export const phuongXaSNNSchema = z.object({
  id: z.number().optional(), // Auto-generated, optional for create
  tinh_thanh_id: z.union([z.number(), z.object({
    id: z.number(),
    ma_tinh_thanh: z.string(),
    ten_tinh_thanh: z.string(),
  })]),
  ma_tinh_thanh: z.string().min(1, "Mã tỉnh thành là bắt buộc"),
  ten_tinh_thanh: z.string().optional().nullable(),
  ma_phuong_xa: z.string().min(1, "Mã phường xã là bắt buộc"),
  ten_phuong_xa: z.string().min(1, "Tên phường xã là bắt buộc"),
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
})

export type PhuongXaSNN = z.infer<typeof phuongXaSNNSchema>

/**
 * Schema for creating new phường xã SNN
 */
export type CreatePhuongXaSNNInput = Omit<PhuongXaSNN, "id" | "tg_tao" | "tg_cap_nhat" | "ten_tinh_thanh"> & {
  tinh_thanh_id: number
  ten_tinh_thanh?: string | null
}

/**
 * Schema for updating phường xã SNN
 */
export type UpdatePhuongXaSNNInput = Partial<Omit<PhuongXaSNN, "id" | "tg_tao">> & {
  tinh_thanh_id?: number
}

