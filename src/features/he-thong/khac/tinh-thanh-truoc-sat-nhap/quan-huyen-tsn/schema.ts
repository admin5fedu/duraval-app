import { z } from "zod"

/**
 * Schema matching 'var_tsn_quan_huyen' table in Supabase
 */
export const quanHuyenTSNSchema = z.object({
  id: z.number().optional(), // Auto-generated, optional for create
  tinh_thanh_id: z.number().min(1, "Tỉnh thành là bắt buộc"),
  ma_tinh_thanh: z.string().min(1, "Mã tỉnh thành là bắt buộc"),
  ten_tinh_thanh: z.string().min(1, "Tên tỉnh thành là bắt buộc"),
  ma_quan_huyen: z.string().min(1, "Mã quận huyện là bắt buộc"),
  ten_quan_huyen: z.string().min(1, "Tên quận huyện là bắt buộc"),
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
})

export type QuanHuyenTSN = z.infer<typeof quanHuyenTSNSchema>

/**
 * Schema for creating new quận huyện TSN
 */
export type CreateQuanHuyenTSNInput = Omit<QuanHuyenTSN, "id" | "tg_tao" | "tg_cap_nhat">

/**
 * Schema for updating quận huyện TSN
 */
export type UpdateQuanHuyenTSNInput = Partial<Omit<QuanHuyenTSN, "id" | "tg_tao">>

