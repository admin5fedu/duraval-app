import { z } from "zod"

/**
 * Schema matching 'var_cong_ty' table in Supabase
 */
export const thongTinCongTySchema = z.object({
  id: z.number().optional(), // Auto-generated, optional for create
  ma_cong_ty: z.string().min(1, "Mã công ty là bắt buộc"),
  ten_cong_ty: z.string().min(1, "Tên công ty là bắt buộc"),
  ten_day_du: z.string().min(1, "Tên đầy đủ là bắt buộc"),
  link_logo: z.string().min(1, "Link logo là bắt buộc"),
  dia_chi: z.string().min(1, "Địa chỉ là bắt buộc"),
  so_dien_thoai: z.string().min(1, "Số điện thoại là bắt buộc"),
  email: z.string().email("Email không hợp lệ").min(1, "Email là bắt buộc"),
  website: z.string().min(1, "Website là bắt buộc"),
  ap_dung: z.boolean().optional().nullable().default(false),
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
  nguoi_tao_id: z.number().optional().nullable(),
})

export type ThongTinCongTy = z.infer<typeof thongTinCongTySchema>

/**
 * Schema for creating new thông tin công ty
 */
export type CreateThongTinCongTyInput = Omit<ThongTinCongTy, "id" | "tg_tao" | "tg_cap_nhat" | "nguoi_tao_id">

/**
 * Schema for updating thông tin công ty
 */
export type UpdateThongTinCongTyInput = Partial<Omit<ThongTinCongTy, "id" | "tg_tao" | "nguoi_tao_id">>

/**
 * Batch operation result
 */
export interface BatchThongTinCongTyOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

