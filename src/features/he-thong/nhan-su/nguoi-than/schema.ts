import { z } from "zod"

/**
 * Schema matching 'var_nguoi_than' table in Supabase
 */
export const nguoiThanSchema = z.object({
  id: z.number().optional(), // Auto-generated, optional for create
  ma_nhan_vien: z.number({ required_error: "Mã nhân viên là bắt buộc" }),
  ho_va_ten: z.string().min(1, "Họ và tên là bắt buộc"),
  moi_quan_he: z.string().min(1, "Mối quan hệ là bắt buộc"),
  ngay_sinh: z.string().optional().nullable(),
  so_dien_thoai: z.string().optional().nullable(),
  ghi_chu: z.string().optional().nullable(),
  nguoi_tao: z.number().optional().nullable(),
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
})

export type NguoiThan = z.infer<typeof nguoiThanSchema>

/**
 * Schema for creating new người thân
 */
export type CreateNguoiThanInput = Omit<NguoiThan, "id" | "tg_tao" | "tg_cap_nhat" | "nguoi_tao">

/**
 * Schema for updating người thân
 */
export type UpdateNguoiThanInput = Partial<Omit<NguoiThan, "id" | "ma_nhan_vien" | "tg_tao" | "nguoi_tao">>

/**
 * Batch operation result
 */
export interface BatchNguoiThanOperationResult {
  inserted: number
  updated: number
  errors: Array<{ row: number; error: string }>
}

